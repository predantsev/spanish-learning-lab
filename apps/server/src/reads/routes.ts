// Reads: /health (public, minimal), /capabilities, /contexts, /contexts/{id}, /catalog,
// /resources/{type}/{id} (object-level scope checks), /operations/{id}, /profile, /media/{sha256}.
// Reads never mutate activity or scheduling.
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Capabilities, Context, ContextList, Health, OwnerProfile, Resource, Scope } from '@sll/contracts';
import type { ServerState } from '../state.ts';
import { ContentRepository } from '../content/repository.ts';
import type { MaterialBody, TaskBody } from '../content/types.ts';
import { HttpError, forbidden, notFound } from '../http/errors.ts';
import { hasScope, type Principal } from '../http/principal.ts';
import { HASH_RE, ok, readHeader, UUID_RE } from '../http/reply.ts';
import { sendFileRange } from '../http/range.ts';
import { ALL_SCOPES } from '../auth/tokens.ts';
import { activeDraft } from '../commands/env.ts';
import { allowedKinds, mayRun, type CommandKind } from '../commands/env.ts';
import { creatorOf, findReceipt } from '../commands/receipts.ts';
import { localDate } from '../domain-adapter.ts';
import { loadTarget } from '../learning/targets.ts';
import { catalogPage } from './catalog.ts';
import {
  attemptOut,
  collectionOut,
  contextMeta,
  draftOut,
  lessonContent,
  lessonProgressOut,
  materialContent,
  phraseContent,
  practiceSetOut,
  preferenceOut,
  reviewOut,
  sessionOut,
  summaryOut,
  supportOut,
  taskView,
  type ContextRowLike,
  type PhraseRow,
} from './models.ts';

const API = '/api/v1';
const ZERO_HASH = '0'.repeat(64);

function principalOf(request: FastifyRequest): Principal {
  if (!request.principal) throw forbidden('AUTH_REQUIRED');
  return request.principal;
}

function requireScope(p: Principal, scope: Scope): void {
  if (!hasScope(p, scope)) throw forbidden('SCOPE_FORBIDDEN');
}

/** Agents may read records they created themselves with the given scope; the owner reads everything. */
function ownsOrOwner(state: ServerState, p: Principal, scope: Scope, entityId: string): boolean {
  if (p.kind === 'owner') return true;
  return p.scopes.has(scope) && creatorOf(state.store.db(), entityId) === p.key;
}

const verifiedMedia = new Set<string>();

function fileSha256Sync(path: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const h = createHash('sha256');
    createReadStream(path)
      .on('data', (c) => h.update(c))
      .on('error', reject)
      .on('end', () => resolvePromise(h.digest('hex')));
  });
}

export function registerReadRoutes(app: FastifyInstance, state: ServerState): void {
  app.get(`${API}/health`, { config: { op: 'health', auth: 'public' } }, async () => {
    let writable = false;
    try {
      state.store.db();
      writable = !state.store.maintenance().on;
    } catch {
      writable = false;
    }
    const health: Health = { status: state.store.maintenance().on ? 'maintenance' : writable ? 'ok' : 'degraded', instanceId: state.store.instanceId, apiVersion: '1', storageWritable: writable };
    return health;
  });

  app.get(`${API}/capabilities`, { config: { op: 'capabilities', auth: 'any' } }, async (request) => {
    const p = principalOf(request);
    const profile = state.store.profile();
    const pack = new ContentRepository(state.store.db()).activePack();
    const caps: Capabilities = {
      apiVersion: '1',
      schemaVersion: 1,
      instanceId: state.store.instanceId,
      profileEpoch: profile.epoch,
      packHash: pack?.manifestSha256 ?? ZERO_HASH,
      scopes: p.kind === 'owner' ? [...ALL_SCOPES] : [...p.scopes].sort(),
      commandKinds: allowedKinds(p),
      revision: profile.revision,
    };
    return caps;
  });

  app.get(`${API}/contexts`, { config: { op: 'contexts.list', auth: 'any' } }, async (request) => {
    requireScope(principalOf(request), 'context:read');
    const rows = state.store.db().prepare('SELECT id, revision, open, last_activity_at, title, task_revision_id, mode FROM contexts ORDER BY last_activity_at DESC, rowid DESC LIMIT 20').all() as ContextRowLike[];
    const data: ContextList = { items: rows.map(contextMeta) };
    return ok(request, state.store.profile().epoch, data);
  });

  app.get<{ Params: { id: string } }>(`${API}/contexts/:id`, { config: { op: 'contexts.get', auth: 'any' } }, async (request) => {
    const p = principalOf(request);
    requireScope(p, 'context:read');
    if (!UUID_RE.test(request.params.id)) throw notFound();
    const db = state.store.db();
    const repo = new ContentRepository(db);
    const row = db.prepare('SELECT * FROM contexts WHERE id = ?').get(request.params.id) as (ContextRowLike & { id: string }) | undefined;
    if (!row) throw notFound('CONTEXT_NOT_FOUND');
    const task = repo.byRevision<TaskBody>(row.task_revision_id);
    const draft = activeDraft(db, row.id);
    if (!task || !draft) throw notFound('CONTEXT_NOT_FOUND');
    const supports = db.prepare("SELECT delivery, delivery_route, expires_at FROM support_events WHERE context_id = ? AND content_hash IS NOT NULL").all(row.id) as Array<{ delivery: string; expires_at: string | null }>;
    const now = state.now();
    const supportState: Context['supportState'] = supports.some((s) => s.delivery === 'delivered')
      ? 'delivered'
      : supports.some((s) => s.delivery === 'delivery-unknown')
        ? 'unknown'
        : supports.some((s) => s.delivery === 'prepared' && s.expires_at !== null && Date.parse(s.expires_at) > now.getTime())
          ? 'prepared'
          : 'none';
    const resultIds = (db.prepare('SELECT id FROM attempts WHERE context_id = ? ORDER BY submitted_at, rowid').all(row.id) as Array<{ id: string }>).map((a) => a.id).slice(-100);
    const profile = state.store.profile();
    // Renewing the snapshot lease is not activity: nothing is written.
    const lease = state.leases.issue({ instanceId: state.store.instanceId, principalKey: p.key, epoch: profile.epoch, contextId: row.id, contextRevision: row.revision }, now);
    const data: Context = { metadata: contextMeta(row), task: taskView(repo, task), draft: draftOut(draft), supportState, resultIds, snapshotAt: now.toISOString(), snapshotToken: lease.token };
    return ok(request, profile.epoch, data);
  });

  app.get<{ Querystring: Record<string, string | string[]> }>(`${API}/catalog`, { config: { op: 'catalog', auth: 'any' } }, async (request) => {
    requireScope(principalOf(request), 'course:read');
    const q = request.query ?? {};
    const allowed = new Set(['query', 'block', 'situation', 'mode', 'cursor', 'limit']);
    for (const [k, v] of Object.entries(q)) if (!allowed.has(k) || typeof v !== 'string') throw new HttpError(422, 'INVALID_QUERY');
    const s = q as Record<string, string>;
    if (s.query !== undefined && s.query.length > 100) throw new HttpError(422, 'INVALID_QUERY');
    if (s.block !== undefined && !/^A[12]-[0-9]{2}$/.test(s.block)) throw new HttpError(422, 'INVALID_QUERY');
    if (s.situation !== undefined && (s.situation.length < 1 || s.situation.length > 100)) throw new HttpError(422, 'INVALID_QUERY');
    if (s.mode !== undefined && !['written', 'listening', 'mixed'].includes(s.mode)) throw new HttpError(422, 'INVALID_QUERY');
    if (s.cursor !== undefined && (s.cursor.length < 1 || s.cursor.length > 512)) throw new HttpError(422, 'INVALID_QUERY');
    let limit = 20;
    if (s.limit !== undefined) {
      if (!/^[0-9]{1,3}$/.test(s.limit) || Number(s.limit) < 1 || Number(s.limit) > 100) throw new HttpError(422, 'INVALID_QUERY');
      limit = Number(s.limit);
    }
    const page = catalogPage(
      new ContentRepository(state.store.db()),
      {
        limit,
        ...(s.query !== undefined ? { query: s.query } : {}),
        ...(s.block !== undefined ? { block: s.block } : {}),
        ...(s.situation !== undefined ? { situation: s.situation } : {}),
        ...(s.mode !== undefined ? { mode: s.mode as 'written' | 'listening' | 'mixed' } : {}),
        ...(s.cursor !== undefined ? { cursor: s.cursor } : {}),
      },
      state.cursorKey,
      state.now(),
    );
    return ok(request, state.store.profile().epoch, page);
  });

  app.get<{ Params: { resourceType: string; id: string } }>(`${API}/resources/:resourceType/:id`, { config: { op: 'resources.get', auth: 'any' } }, async (request) => {
    const p = principalOf(request);
    const { resourceType, id } = request.params;
    if (!UUID_RE.test(id)) throw notFound();
    const db = state.store.db();
    const repo = new ContentRepository(db);
    const profile = state.store.profile();
    let data: Resource | undefined;
    switch (resourceType) {
      case 'lesson': {
        requireScope(p, 'course:read');
        const l = repo.byRevision(id);
        if (l && l.kind === 'lesson') data = lessonContent(repo, l as never);
        break;
      }
      case 'task': {
        requireScope(p, 'course:read');
        const t = repo.byRevision<TaskBody>(id);
        if (t && t.kind === 'task') data = taskView(repo, t);
        break;
      }
      case 'material': {
        const m = repo.byRevision<MaterialBody>(id);
        if (m && m.kind === 'material') {
          if (m.origin === 'course') requireScope(p, 'course:read');
          else if (!ownsOrOwner(state, p, 'draft:write', id)) throw notFound();
          data = materialContent(repo, m);
        }
        break;
      }
      case 'phrase': {
        const r = db.prepare('SELECT * FROM phrase_records WHERE id = ?').get(id) as PhraseRow | undefined;
        if (r) {
          if (r.source === 'course' && r.course_logical_id !== null) requireScope(p, 'course:read');
          else if (!ownsOrOwner(state, p, 'draft:write', id)) throw notFound();
          data = phraseContent(repo, r);
        }
        break;
      }
      case 'collection': {
        const c = db.prepare('SELECT id, revision, name, origin FROM collections WHERE id = ?').get(id) as { id: string; revision: number; name: string; origin: 'course' | 'personal' } | undefined;
        if (c) {
          if (c.origin === 'course') requireScope(p, 'course:read');
          else if (!ownsOrOwner(state, p, 'draft:write', id)) throw notFound();
          data = collectionOut(db, c);
        }
        break;
      }
      case 'practice-set': {
        const r = db.prepare('SELECT * FROM practice_sets WHERE id = ?').get(id) as Parameters<typeof practiceSetOut>[0] | undefined;
        if (r) {
          if (!ownsOrOwner(state, p, 'practice:write', id)) throw notFound();
          data = practiceSetOut(r);
        }
        break;
      }
      case 'attempt': {
        requireScope(p, 'context:read');
        data = attemptOut(db, id);
        break;
      }
      case 'support': {
        const r = db.prepare('SELECT * FROM support_events WHERE id = ?').get(id) as Parameters<typeof supportOut>[0] | undefined;
        if (r) {
          if (!hasScope(p, 'context:read') && !ownsOrOwner(state, p, 'help:write', id)) throw notFound();
          data = supportOut(r);
        }
        break;
      }
      case 'review': {
        const r = db.prepare('SELECT * FROM review_reports WHERE id = ?').get(id) as Parameters<typeof reviewOut>[0] | undefined;
        if (r) {
          if (!ownsOrOwner(state, p, 'draft:write', id)) throw notFound();
          data = reviewOut(r);
        }
        break;
      }
      case 'preference': {
        const r = db.prepare('SELECT * FROM learner_preferences WHERE id = ?').get(id) as Parameters<typeof preferenceOut>[0] | undefined;
        if (r) {
          if (!ownsOrOwner(state, p, 'preference:write', id)) throw notFound();
          data = preferenceOut(r, (key) => loadTarget(db, key), localDate(state.now(), profile.reviewTimezone));
        }
        break;
      }
      case 'summary':
      case 'session':
      case 'lesson-progress':
      case 'timezone-preview': {
        if (p.kind !== 'owner') throw forbidden('OWNER_ONLY');
        if (resourceType === 'summary') {
          const r = db.prepare('SELECT id, revision, body FROM summaries WHERE id = ?').get(id) as Parameters<typeof summaryOut>[0] | undefined;
          if (r) data = summaryOut(r);
        } else if (resourceType === 'session') {
          const r = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Parameters<typeof sessionOut>[0] | undefined;
          if (r) data = sessionOut(r);
        } else if (resourceType === 'lesson-progress') {
          const r = db.prepare('SELECT * FROM lesson_progress WHERE id = ?').get(id) as Parameters<typeof lessonProgressOut>[0] | undefined;
          if (r) data = lessonProgressOut(r);
        } else {
          const pv = state.previews.get(id.toLowerCase()) ?? state.previews.get(id);
          if (pv && Date.parse(pv.expiresAt) > state.now().getTime()) {
            data = { id: pv.id, revision: pv.revision, profileEpoch: pv.profileEpoch, profileRevision: pv.profileRevision, fromZone: pv.fromZone, toZone: pv.toZone, retainedDueDates: true, expiresAt: pv.expiresAt };
          }
        }
        break;
      }
      default:
        throw new HttpError(422, 'INVALID_RESOURCE_TYPE');
    }
    if (!data) throw notFound();
    return ok(request, profile.epoch, data);
  });

  app.get<{ Params: { operationId: string } }>(`${API}/operations/:operationId`, { config: { op: 'operations.get', auth: 'any' } }, async (request) => {
    const p = principalOf(request);
    if (!UUID_RE.test(request.params.operationId)) throw notFound();
    const r = findReceipt(state.store.db(), request.params.operationId);
    if (!r) throw notFound();
    if (p.kind === 'agent' && (!r.principal.startsWith('token:') || !mayRun(p, r.kind as CommandKind))) throw notFound();
    return r.receipt;
  });

  app.get(`${API}/profile`, { config: { op: 'profile.get', auth: 'owner' } }, async (request) => {
    const row = state.store.db().prepare('SELECT id, revision, epoch, review_timezone, audio_speed, theme, last_restore_operation_id FROM profiles LIMIT 1').get() as {
      id: string;
      revision: number;
      epoch: number;
      review_timezone: string;
      audio_speed: number;
      theme: OwnerProfile['theme'];
      last_restore_operation_id: string | null;
    };
    const data: OwnerProfile = {
      id: row.id,
      revision: row.revision,
      profileEpoch: row.epoch,
      reviewTimezone: row.review_timezone,
      audioSpeed: row.audio_speed === 0.85 ? 0.85 : 1,
      theme: row.theme,
      ...(row.last_restore_operation_id ? { lastRestoreOperationId: row.last_restore_operation_id } : {}),
    };
    return ok(request, row.epoch, data);
  });

  app.get<{ Params: { sha256: string } }>(`${API}/media/:sha256`, { config: { op: 'media.get', auth: 'owner' } }, async (request, reply) => {
    const hash = request.params.sha256;
    if (!HASH_RE.test(hash)) throw notFound();
    const asset = new ContentRepository(state.store.db()).asset(hash);
    if (!asset || asset.mime !== 'audio/mpeg') throw notFound();
    const root = resolve(state.store.paths.assets);
    const path = resolve(root, asset.relPath);
    if (!path.startsWith(root + sep) || !existsSync(path)) throw notFound();
    if (statSync(path).size !== asset.bytes) throw notFound('MEDIA_CORRUPT');
    if (!verifiedMedia.has(path)) {
      if ((await fileSha256Sync(path)) !== hash) throw notFound('MEDIA_CORRUPT');
      verifiedMedia.add(path);
    }
    return sendFileRange(reply, path, 'audio/mpeg', readHeader(request, 'range'));
  });
}
