// support.observe, support.request, support.prepare, support.confirm, support.cancel
// Two-phase actual help recording (D-019): preparation is not evidence; only confirmed delivery is.
import { randomUUID } from 'node:crypto';
import type { Block, Payload_support_cancel, Payload_support_confirm, Payload_support_observe, Payload_support_prepare, Payload_support_request, Target } from '@sll/contracts';
import { canonicalJson, sha256Hex } from '../../content/pack-format.ts';
import { conflict, notFound, unprocessable } from '../../http/errors.ts';
import { parseTargetKey, targetKey, type TaskBody } from '../../content/types.ts';
import type { SupportKind, TargetKey } from '@sll/domain';
import { checkBlocks, loadContext, ref, requireActiveContext, requireRevision, type CommandEnv, type CommandResult } from '../env.ts';

export const SUPPORT_TTL_MS = 5 * 60_000;
const SUPPORT_MAX_CHARS = 20_000;

export function contentHashOf(blocks: readonly Block[]): string {
  return sha256Hex(canonicalJson(blocks));
}

interface SupportRow {
  id: string;
  revision: number;
  context_id: string | null;
  context_revision: number | null;
  task_revision_id: string | null;
  kind: string;
  source: string;
  delivery: 'prepared' | 'delivered' | 'confirmed-undelivered' | 'delivery-unknown' | 'neutral';
  delivery_route: 'app' | 'external' | null;
  phase: string | null;
  targets: string;
  blocks: string;
  content_hash: string | null;
  delivery_id: string | null;
  expires_at: string | null;
  recorded_at: string;
}

function loadSupport(env: CommandEnv, id: string): SupportRow {
  const r = env.db.prepare('SELECT * FROM support_events WHERE id = ?').get(id) as SupportRow | undefined;
  if (!r || r.content_hash === null) throw notFound('SUPPORT_NOT_FOUND');
  return r;
}

function existingSupportRevision(env: CommandEnv, id: string): number {
  const r = env.db.prepare('SELECT revision FROM support_events WHERE id = ?').get(id) as { revision: number } | undefined;
  return r?.revision ?? 0;
}

function taskOf(env: CommandEnv, taskRevisionId: string): TaskBody {
  const t = env.repo.byRevision<TaskBody>(taskRevisionId);
  if (!t || t.kind !== 'task') throw unprocessable('UNKNOWN_TASK');
  return t.body;
}

function sameTargets(a: readonly Target[], b: readonly Target[]): boolean {
  const x = new Set(a.map(targetKey));
  const y = new Set(b.map(targetKey));
  return x.size === y.size && [...x].every((k) => y.has(k));
}

function insertReservation(
  env: CommandEnv,
  r: { id: string; contextId: string; contextRevision: number; taskRevisionId: string; kind: string; source: string; route: 'app' | 'external'; targets: readonly Target[]; blocks: readonly Block[]; detailKey: string | null },
): string {
  const hash = contentHashOf(r.blocks);
  env.db
    .prepare(
      `INSERT INTO support_events (id, revision, context_id, context_revision, attempt_id, task_revision_id, kind, source, delivery, delivery_route, phase, targets, blocks,
         content_hash, detail_key, client_id, recorded_at, local_date, expires_at) VALUES (?, 1, ?, ?, NULL, ?, ?, ?, 'prepared', ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(r.id, r.contextId, r.contextRevision, r.taskRevisionId, r.kind, r.source, r.route, JSON.stringify(r.targets), JSON.stringify(r.blocks), hash, r.detailKey, env.principal.key, env.now.toISOString(), env.today, new Date(env.now.getTime() + SUPPORT_TTL_MS).toISOString());
  env.event('support.prepared', 'support', r.id, { kind: r.kind, route: r.route, targets: r.targets.map(targetKey), contentHash: hash });
  return hash;
}

export function supportRequest(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_support_request;
  const id = env.cmd.subjectId;
  requireRevision(existingSupportRevision(env, id), env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  const contextId = (env.cmd as { contextId?: string }).contextId ?? '';
  const ctx = requireActiveContext(env, contextId);
  if (p.taskRevisionId.toLowerCase() !== ctx.task_revision_id.toLowerCase()) throw unprocessable('TASK_MISMATCH');
  const task = taskOf(env, ctx.task_revision_id);
  const hint = task.hints?.[p.hintIndex];
  if (!hint || hint.kind !== p.kind) throw unprocessable('HINT_NOT_FOUND');
  // ASSUMPTION: Support.targets has minItems 1, so an untargeted vocabulary hint cannot be read back (see report Questions).
  if (hint.targets.length === 0) throw unprocessable('HINT_NOT_TARGETED');
  const hash = insertReservation(env, {
    id, contextId: ctx.id, contextRevision: ctx.revision, taskRevisionId: ctx.task_revision_id, kind: hint.kind, source: 'ui', route: 'app',
    targets: hint.targets.map(parseTargetKey), blocks: hint.blocks, detailKey: `hint:${p.hintIndex}`,
  });
  env.markCommitted('support.request');
  return { entities: [ref(id, 1, 'support')], outcome: 'prepared', contentHash: hash, createdEntityId: id };
}

export function supportPrepare(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_support_prepare;
  const id = env.cmd.subjectId;
  requireRevision(existingSupportRevision(env, id), env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  const contextId = (env.cmd as { contextId?: string }).contextId ?? '';
  const ctx = requireActiveContext(env, contextId);
  if (p.taskRevisionId.toLowerCase() !== ctx.task_revision_id.toLowerCase()) throw unprocessable('TASK_MISMATCH');
  const task = taskOf(env, ctx.task_revision_id);
  const taskKeys = new Set(task.targets.map(targetKey));
  for (const t of p.targets) if (!taskKeys.has(targetKey(t))) throw unprocessable('TARGET_NOT_IN_TASK');
  if (checkBlocks(p.blocks) > SUPPORT_MAX_CHARS) throw unprocessable('SUPPORT_TOO_LONG');
  const hash = insertReservation(env, {
    id, contextId: ctx.id, contextRevision: ctx.revision, taskRevisionId: ctx.task_revision_id, kind: p.kind,
    source: env.principal.kind === 'agent' ? 'agent' : 'ui', route: p.deliveryRoute, targets: p.targets, blocks: p.blocks, detailKey: null,
  });
  env.markCommitted('support.prepare');
  return { entities: [ref(id, 1, 'support')], outcome: 'prepared', contentHash: hash, createdEntityId: id };
}

/** Confirm/cancel bind the immutable reservation and its ORIGINAL context id + revision (no live lease). */
function requireBinding(env: CommandEnv, s: SupportRow): void {
  const c = env.cmd as { contextId?: string; contextRevision?: number };
  if (s.context_id === null || c.contextId?.toLowerCase() !== s.context_id.toLowerCase() || c.contextRevision !== s.context_revision) throw unprocessable('BINDING_MISMATCH');
}

export function supportConfirm(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_support_confirm;
  const s = loadSupport(env, env.cmd.subjectId);
  requireRevision(s.revision, env.cmd.expectedRevision);
  requireBinding(env, s);
  if (p.contentHash !== s.content_hash) throw unprocessable('BINDING_MISMATCH');
  const reserved = JSON.parse(s.targets) as Target[];
  if (!sameTargets(reserved, p.targets)) throw unprocessable('BINDING_MISMATCH');
  if (s.delivery === 'delivered') return { entities: [ref(s.id, s.revision, 'support')], outcome: 'unchanged', contentHash: s.content_hash };
  const reported = Date.parse(p.reportedDeliveredAt);
  if (!Number.isFinite(reported)) throw unprocessable('INVALID_TIME');
  // A display may not START after the reservation expired (app route); acknowledging actual past delivery stays possible.
  if (s.delivery_route === 'app' && s.expires_at !== null && reported > Date.parse(s.expires_at)) throw conflict('RESERVATION_EXPIRED');
  env.db
    .prepare("UPDATE support_events SET delivery = 'delivered', phase = ?, delivery_id = ?, reported_delivered_at = ?, revision = revision + 1 WHERE id = ?")
    .run(p.phase, p.deliveryId, new Date(reported).toISOString(), s.id);
  const lateForAttempts = env.db
    .prepare("SELECT id FROM attempts WHERE context_id = ? AND submitted_at >= ? AND support_snapshot LIKE ?")
    .all(s.context_id, s.recorded_at, `%${s.id}%`) as Array<{ id: string }>;
  // Actual targeted help before checking resets the target (step 1); help after checking, or with an
  // unknown phase, is review exposure only. A late confirmation never awards independent credit to an
  // attempt that captured the reservation as pending/unknown (its pinned verdict stays as recorded).
  env.schedule(
    'support.delivered',
    'support',
    s.id,
    { kind: 'support-delivered', supportKind: s.kind as SupportKind, targets: reserved.map(targetKey) as TargetKey[], withinAssessedTask: p.phase === 'before-submit' },
    { phase: p.phase, reportedDeliveredAt: new Date(reported).toISOString(), ...(lateForAttempts.length ? { lateForAttempts: lateForAttempts.map((a) => a.id) } : {}) },
  );
  env.markCommitted('support.confirm');
  return { entities: [ref(s.id, s.revision + 1, 'support')], outcome: 'delivered', contentHash: s.content_hash };
}

export function supportCancel(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_support_cancel;
  const s = loadSupport(env, env.cmd.subjectId);
  requireRevision(s.revision, env.cmd.expectedRevision);
  requireBinding(env, s);
  if (s.delivery === 'delivered') throw conflict('ALREADY_DELIVERED');
  if (s.delivery === p.delivery) return { entities: [ref(s.id, s.revision, 'support')], outcome: 'unchanged' };
  env.db.prepare('UPDATE support_events SET delivery = ?, revision = revision + 1 WHERE id = ?').run(p.delivery, s.id);
  env.event('support.cancelled', 'support', s.id, { delivery: p.delivery });
  env.markCommitted('support.cancel');
  return { entities: [ref(s.id, s.revision + 1, 'support')], outcome: 'cancelled' };
}

export function supportObserve(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_support_observe;
  const current = loadContext(env.db, env.cmd.subjectId);
  requireRevision(current.revision, env.cmd.expectedRevision);
  const ctx = requireActiveContext(env, env.cmd.subjectId);
  const task = taskOf(env, ctx.task_revision_id);
  const taskKeys = new Set(task.targets.map(targetKey));
  for (const t of p.targets) if (!taskKeys.has(targetKey(t))) throw unprocessable('TARGET_NOT_IN_TASK');
  const reported = p.kind === 'learner-reported-help';
  if (reported && p.targets.length === 0) throw unprocessable('TARGETS_REQUIRED');
  const id = randomUUID();
  env.db
    .prepare(
      `INSERT INTO support_events (id, revision, context_id, context_revision, task_revision_id, kind, source, delivery, delivery_route, phase, targets, blocks, content_hash, detail_key, client_id, recorded_at, local_date)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, '[]', NULL, ?, ?, ?, ?)`,
    )
    .run(id, ctx.id, ctx.revision, ctx.task_revision_id, p.kind, reported ? 'learner-report' : 'ui', reported ? 'delivered' : 'neutral', JSON.stringify(p.targets), p.detailKey, env.principal.key, env.now.toISOString(), env.today);
  if (reported) {
    // Learner-reported help during the active task: actual support for the mapped targets.
    env.schedule(
      'support.observed',
      'context',
      ctx.id,
      { kind: 'support-delivered', supportKind: 'learner-reported-help', targets: p.targets.map(targetKey) as TargetKey[], withinAssessedTask: true },
      { observedKind: p.kind, detailKey: p.detailKey },
    );
  } else {
    env.event('support.observed', 'context', ctx.id, { observedKind: p.kind, targets: p.targets.map(targetKey), detailKey: p.detailKey });
  }
  env.markCommitted('support.observe');
  return { entities: [ref(ctx.id, ctx.revision, 'context')], outcome: 'updated' };
}
