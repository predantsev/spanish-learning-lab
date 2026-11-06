// Owner-only recovery HTTP routes (API.md §Backup/auth control routes). Thin adapters over the
// frozen Recovery interface (implemented by the recovery worker in recovery/). Every write carries
// CSRF (hook) + idempotency + epoch + revision. Without a wired Recovery they answer 503.
import { existsSync } from 'node:fs';
import type { Readable } from 'node:stream';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Artifact, ExportRequest, Receipt, RestoreConfirm, RestorePreview, RestorePreviewRequest } from '@sll/contracts';
import type { ServerState } from './state.ts';
import { RecoveryError, type ArtifactInfo, type Recovery } from './recovery/types.ts';
import { HttpError, conflict, forbidden, notFound, unavailable } from './http/errors.ts';
import { ok, UUID_RE, readHeader } from './http/reply.ts';
import { sendFileRange } from './http/range.ts';
import { checkWriteHeaders, readWriteHeaders, requireBody, type WriteEnvelope } from './http/write-request.ts';
import { bodyDigest, findReceipt, storeReceipt } from './commands/receipts.ts';

const API = '/api/v1';

function recoveryOf(state: ServerState): Recovery {
  if (!state.recovery) throw unavailable('RECOVERY_UNAVAILABLE', false);
  return state.recovery;
}

function owner(request: FastifyRequest): string {
  const p = request.principal;
  if (!p || p.kind !== 'owner') throw forbidden('OWNER_ONLY');
  return p.key;
}

function artifact(a: ArtifactInfo): Artifact {
  return { id: a.id, sha256: a.sha256, sizeBytes: a.sizeBytes, downloadRoute: `${API}/recovery/downloads/${a.id.toLowerCase()}`, expiresAt: a.expiresAt };
}

function mapRecoveryError(e: unknown): never {
  if (e instanceof RecoveryError) throw new HttpError(e.status, e.code, { retryable: e.retryable });
  throw e;
}

/** Receipt lookup (replay/conflict), epoch and profile-revision checks shared by the owner recovery writes. */
function precheck(state: ServerState, w: WriteEnvelope, kind: string, digest: string): { replay?: { entityId: string | null } } {
  const prior = findReceipt(state.store.db(), w.operationId);
  if (prior) {
    if (prior.kind !== kind || prior.bodyDigest !== digest) throw conflict('IDEMPOTENCY_CONFLICT');
    return { replay: { entityId: prior.createdEntityId } };
  }
  const profile = state.store.profile();
  if (w.profileEpoch !== profile.epoch) throw conflict('EPOCH_MISMATCH');
  if (w.expectedRevision !== profile.revision) throw conflict('STALE_REVISION', profile.revision);
  return {};
}

function record(state: ServerState, request: FastifyRequest, w: WriteEnvelope, kind: string, digest: string, principal: string, entityId: string, resourceType: Receipt['entities'][number]['resourceType']): Receipt {
  const profile = state.store.profile();
  const r: Receipt = {
    apiVersion: '1',
    requestId: request.id,
    operationId: w.operationId,
    profileEpoch: profile.epoch,
    kind,
    eventSeq: state.store.lastEventSeq(),
    entities: [{ id: entityId, revision: 1, resourceType }],
    outcome: 'created',
  };
  storeReceipt(state.store.db(), { operationId: w.operationId, kind, bodyDigest: digest, principal, profileEpoch: profile.epoch, receipt: r, createdEntityId: entityId, at: state.now() });
  return r;
}

export function registerRecoveryRoutes(app: FastifyInstance, state: ServerState): void {
  app.post(`${API}/recovery/export`, { config: { op: 'recovery.export', auth: 'owner' } }, async (request) => {
    const principal = owner(request);
    const body = requireBody<ExportRequest>(state, request, 'ExportRequest');
    checkWriteHeaders(request, body);
    const recovery = recoveryOf(state);
    const digest = bodyDigest(body);
    const pre = precheck(state, body, 'recovery.export', digest);
    if (pre.replay) {
      const a = pre.replay.entityId ? recovery.download(pre.replay.entityId) : undefined;
      if (!a) throw conflict('ARTIFACT_EXPIRED');
      return ok(request, state.store.profile().epoch, artifact(a));
    }
    let a: ArtifactInfo;
    try {
      a = await recovery.exportProfile({ selfContained: body.selfContained });
    } catch (e) {
      mapRecoveryError(e);
    }
    record(state, request, body, 'recovery.export', digest, principal, a.id, 'export');
    return ok(request, state.store.profile().epoch, artifact(a));
  });

  app.post(`${API}/recovery/uploads`, { config: { op: 'recovery.upload', auth: 'owner' } }, async (request) => {
    const principal = owner(request);
    const w = readWriteHeaders(request);
    if (!(request.headers['content-type'] ?? '').startsWith('application/zip')) throw new HttpError(400, 'UNSUPPORTED_CONTENT_TYPE');
    const recovery = recoveryOf(state);
    const digest = bodyDigest({ operationId: w.operationId, profileEpoch: w.profileEpoch, expectedRevision: w.expectedRevision, kind: 'recovery.upload' });
    const pre = precheck(state, w, 'recovery.upload', digest);
    if (pre.replay) {
      const a = pre.replay.entityId ? recovery.download(pre.replay.entityId) : undefined;
      if (!a) throw conflict('ARTIFACT_EXPIRED');
      return ok(request, state.store.profile().epoch, artifact(a));
    }
    let a: ArtifactInfo;
    try {
      a = await recovery.storeUpload(request.body as Readable);
    } catch (e) {
      mapRecoveryError(e);
    }
    record(state, request, w, 'recovery.upload', digest, principal, a.id, 'upload');
    return ok(request, state.store.profile().epoch, artifact(a));
  });

  app.post(`${API}/recovery/restore-preview`, { config: { op: 'recovery.restorePreview', auth: 'owner' } }, async (request) => {
    const principal = owner(request);
    const body = requireBody<RestorePreviewRequest>(state, request, 'RestorePreviewRequest');
    checkWriteHeaders(request, body);
    const recovery = recoveryOf(state);
    const digest = bodyDigest(body);
    const pre = precheck(state, body, 'recovery.restore-preview', digest);
    if (pre.replay) throw conflict('IDEMPOTENCY_REPLAY_UNAVAILABLE');
    let info;
    try {
      info = await recovery.previewRestore(body.uploadId);
    } catch (e) {
      mapRecoveryError(e);
    }
    record(state, request, body, 'recovery.restore-preview', digest, principal, info.id, 'restore-preview');
    const data: RestorePreview = { ...info, missingAssets: [...info.missingAssets] };
    return ok(request, state.store.profile().epoch, data);
  });

  app.post(`${API}/recovery/restore-confirm`, { config: { op: 'recovery.restoreConfirm', auth: 'owner' } }, async (request) => {
    owner(request);
    const body = requireBody<RestoreConfirm>(state, request, 'RestoreConfirm');
    checkWriteHeaders(request, body);
    const recovery = recoveryOf(state);
    const digest = bodyDigest(body);
    const prior = findReceipt(state.store.db(), body.operationId);
    if (prior) {
      // A successful restore is never repeated from an old confirmation (new epoch, new credentials).
      if (prior.kind !== 'recovery.restore' || prior.bodyDigest !== digest) throw conflict('IDEMPOTENCY_CONFLICT');
      return prior.receipt;
    }
    const profile = state.store.profile();
    if (body.profileEpoch !== profile.epoch) throw conflict('EPOCH_MISMATCH');
    if (body.expectedRevision !== profile.revision) throw conflict('STALE_REVISION', profile.revision);
    let outcome;
    try {
      outcome = await recovery.confirmRestore({ operationId: body.operationId, previewId: body.previewId, archiveHash: body.archiveHash, confirmation: body.confirmation, trustImportedProvenance: body.trustImportedProvenance });
    } catch (e) {
      mapRecoveryError(e);
    }
    // Old-epoch sessions, tokens, leases, nonces and previews are void after the switch.
    state.invalidateVolatileAuth();
    const db = state.store.db();
    db.prepare('DELETE FROM owner_sessions').run();
    db.prepare('DELETE FROM auth_tokens').run();
    const after = state.store.profile();
    const r: Receipt = {
      apiVersion: '1',
      requestId: request.id,
      operationId: body.operationId,
      profileEpoch: outcome.newEpoch,
      kind: 'recovery.restore',
      eventSeq: state.store.lastEventSeq(),
      entities: [{ id: after.id, revision: after.revision, resourceType: 'profile' }],
      outcome: 'updated',
    };
    try {
      storeReceipt(db, { operationId: body.operationId, kind: 'recovery.restore', bodyDigest: digest, principal: 'restore', profileEpoch: outcome.newEpoch, receipt: r, createdEntityId: null, at: state.now() });
    } catch {
      // the restored profile may already carry this operation's outcome marker
    }
    return r;
  });

  app.get<{ Params: { id: string } }>(`${API}/recovery/downloads/:id`, { config: { op: 'recovery.download', auth: 'owner' } }, async (request, reply) => {
    owner(request);
    if (!UUID_RE.test(request.params.id)) throw notFound();
    const a = recoveryOf(state).download(request.params.id);
    if (!a || !existsSync(a.path) || Date.parse(a.expiresAt) <= state.now().getTime()) throw notFound();
    reply.header('content-disposition', 'attachment; filename="spanish-learning-lab-export.zip"');
    return sendFileRange(reply, a.path, 'application/zip', readHeader(request, 'range'));
  });
}
