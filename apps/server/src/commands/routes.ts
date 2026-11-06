// POST /api/v1/commands — authenticate (hook) → shape (422) → headers (400) → receipt lookup by
// operationId (same kind+canonical body → original receipt; different → 409 IDEMPOTENCY_CONFLICT) →
// epoch (409 EPOCH_MISMATCH) → scope/authority (403) → [one SQLite transaction: revision (409
// STALE_REVISION) → context snapshot lease → domain checks → events/projections → receipt] → commit →
// respond. Storage failures roll back and return 503 retryable.
import type { FastifyInstance } from 'fastify';
import type { Command, Receipt } from '@sll/contracts';
import type { ServerState } from '../state.ts';
import { ContentRepository } from '../content/repository.ts';
import { localDate } from '../domain-adapter.ts';
import { HttpError, conflict, forbidden, unavailable } from '../http/errors.ts';
import { checkWriteHeaders, requireBody } from '../http/write-request.ts';
import { bodyDigest, findReceipt, storeReceipt } from './receipts.ts';
import { AUTHORITY, eventFn, isFailure, mayRun, type CommandEnv, type CommandHandler, type CommandKind } from './env.ts';
import { HANDLERS } from './kinds/index.ts';

const API = '/api/v1';

export function registerCommandRoutes(app: FastifyInstance, state: ServerState): void {
  app.post(`${API}/commands`, { config: { op: 'commands', auth: 'any' } }, async (request) => {
    const principal = request.principal;
    if (!principal) throw forbidden('AUTH_REQUIRED');
    const cmd = requireBody<Command>(state, request, 'Command');
    request.opKind = cmd.kind;
    checkWriteHeaders(request, cmd);
    if (AUTHORITY[cmd.kind] === 'privileged') throw forbidden('PRIVILEGED_COMMAND');
    const handler: CommandHandler | undefined = HANDLERS[cmd.kind as CommandKind];
    if (!handler) throw forbidden('PRIVILEGED_COMMAND');
    const digest = bodyDigest(cmd);

    await state.store.writeGate();
    if (state.store.maintenance().on) throw unavailable('MAINTENANCE');
    const db = state.store.db();
    const now = state.now();
    const profile = state.store.profile();
    const tz = profile.reviewTimezone;
    const today = localDate(now, tz);
    const committedKinds: string[] = [];
    let lastSeq = 0;
    let failure: HttpError | undefined;

    const receipt = db.transaction((): Receipt | undefined => {
      const prior = findReceipt(db, cmd.operationId);
      if (prior) {
        if (prior.kind !== cmd.kind || prior.bodyDigest !== digest) throw conflict('IDEMPOTENCY_CONFLICT');
        if (!mayRun(principal, cmd.kind)) throw forbidden('SCOPE_FORBIDDEN');
        return prior.receipt;
      }
      if (cmd.profileEpoch !== profile.epoch) throw conflict('EPOCH_MISMATCH');
      if (!mayRun(principal, cmd.kind)) throw forbidden(principal.kind === 'agent' ? 'SCOPE_FORBIDDEN' : 'AGENT_ONLY');
      const emit = eventFn(db, { at: now, localDate: today, epoch: profile.epoch, operationId: cmd.operationId });
      const env: CommandEnv = {
        state,
        db,
        repo: new ContentRepository(db),
        principal,
        cmd,
        now,
        tz,
        today,
        epoch: profile.epoch,
        requestId: request.id,
        event: (kind, entityType, entityId, payload) => {
          lastSeq = emit(kind, entityType, entityId, payload);
          return lastSeq;
        },
        markCommitted: (kind) => {
          committedKinds.push(kind);
        },
      };
      const result = handler(env);
      if (isFailure(result)) {
        failure = result.failure;
        return undefined;
      }
      const r: Receipt = {
        apiVersion: '1',
        requestId: request.id,
        operationId: cmd.operationId,
        profileEpoch: profile.epoch,
        kind: cmd.kind,
        eventSeq: lastSeq || state.store.lastEventSeq(),
        entities: result.entities,
        outcome: result.outcome,
        ...(result.route !== undefined ? { route: result.route } : {}),
        ...(result.contentHash !== undefined ? { contentHash: result.contentHash } : {}),
      };
      storeReceipt(db, {
        operationId: cmd.operationId,
        kind: cmd.kind,
        bodyDigest: digest,
        principal: principal.key,
        profileEpoch: profile.epoch,
        receipt: r,
        createdEntityId: result.createdEntityId ?? null,
        at: now,
      });
      return r;
    })();

    for (const k of committedKinds) state.committed(lastSeq || state.store.lastEventSeq(), k);
    if (failure) throw failure;
    return receipt;
  });
}
