// /auth/exchange, /auth/session, /auth/logout, /auth/tokens (owner only).
import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Exchange, OwnerWrite, Receipt, Session, TokenCreate, TokenCreated, TokenList } from '@sll/contracts';
import type { ServerState } from '../state.ts';
import { HttpError, conflict, forbidden, notFound, unauthorized } from '../http/errors.ts';
import { ok, readHeader, UUID_RE } from '../http/reply.ts';
import { checkWriteHeaders, requireBody } from '../http/write-request.ts';
import type { OwnerPrincipal } from '../http/principal.ts';
import { bodyDigest, findReceipt, storeReceipt } from '../commands/receipts.ts';
import { clearedCookieHeader, createSession, csrfFor, findSession, readSessionCookie, revokeSession, sessionCookieHeader, type OwnerSession } from './sessions.ts';
import { createToken, listTokens, revokeToken, tokenExists } from './tokens.ts';

const API = '/api/v1';

function sessionData(state: ServerState, session: OwnerSession, cookie: string): Session {
  const p = state.store.profile();
  return { csrfToken: csrfFor(cookie), profileEpoch: p.epoch, profileId: p.id, profileRevision: p.revision, revision: session.revision, expiresAt: session.expiresAt };
}

function owner(request: FastifyRequest): OwnerPrincipal {
  const p = request.principal;
  if (!p || p.kind !== 'owner') throw forbidden('OWNER_ONLY');
  return p;
}

export function registerAuthRoutes(app: FastifyInstance, state: ServerState): void {
  app.post(`${API}/auth/exchange`, { config: { op: 'auth.exchange', auth: 'exchange' } }, async (request, reply) => {
    const host = (readHeader(request, 'host') ?? '').toLowerCase();
    if (readHeader(request, 'origin') !== `http://${host}`) throw forbidden('ORIGIN_REQUIRED');
    const body = requireBody<Exchange>(state, request, 'Exchange');
    const now = state.now();
    const epoch = state.store.profile().epoch;
    const existingCookie = readSessionCookie(readHeader(request, 'cookie'));
    if (existingCookie !== undefined) {
      const found = findSession(state.store.db(), existingCookie, now, epoch);
      if (found.state === 'valid') {
        // Another tab: the nonce is consumed, the session and CSRF token are reused (never rotated).
        if (!state.nonces.consume(body.nonce)) throw unauthorized('NONCE_INVALID');
        return ok(request, epoch, sessionData(state, found.session, existingCookie));
      }
    }
    // An invalid nonce never touches an existing session (no Set-Cookie on failure).
    if (!state.nonces.consume(body.nonce)) throw unauthorized('NONCE_INVALID');
    await state.store.writeGate();
    const { cookie, session } = createSession(state.store.db(), now, epoch);
    reply.header('set-cookie', sessionCookieHeader(cookie, (Date.parse(session.absoluteExpiresAt) - now.getTime()) / 1000));
    return ok(request, epoch, sessionData(state, session, cookie));
  });

  app.get(`${API}/auth/session`, { config: { op: 'auth.session', auth: 'owner' } }, async (request) => {
    const p = owner(request);
    return ok(request, state.store.profile().epoch, sessionData(state, p.session, p.cookie));
  });

  app.post(`${API}/auth/logout`, { config: { op: 'auth.logout', auth: 'owner' } }, async (request, reply) => {
    const p = owner(request);
    const body = requireBody<OwnerWrite>(state, request, 'OwnerWrite');
    checkWriteHeaders(request, body);
    await state.store.writeGate();
    const db = state.store.db();
    const now = state.now();
    const digest = bodyDigest(body);
    const receipt = db.transaction((): Receipt => {
      const prior = findReceipt(db, body.operationId);
      if (prior) {
        if (prior.kind !== 'auth.logout' || prior.bodyDigest !== digest) throw conflict('IDEMPOTENCY_CONFLICT');
        return prior.receipt;
      }
      const profile = state.store.profile();
      if (body.profileEpoch !== profile.epoch) throw conflict('EPOCH_MISMATCH');
      if (body.expectedRevision !== p.session.revision) throw conflict('STALE_REVISION', p.session.revision);
      revokeSession(db, p.session.id, now);
      const r: Receipt = { apiVersion: '1', requestId: request.id, operationId: body.operationId, profileEpoch: profile.epoch, kind: 'auth.logout', eventSeq: state.store.lastEventSeq(), entities: [], outcome: 'updated' };
      storeReceipt(db, { operationId: body.operationId, kind: 'auth.logout', bodyDigest: digest, principal: p.key, profileEpoch: profile.epoch, receipt: r, createdEntityId: null, at: now });
      return r;
    })();
    reply.header('set-cookie', clearedCookieHeader());
    return receipt;
  });

  app.get(`${API}/auth/tokens`, { config: { op: 'auth.tokens.list', auth: 'owner' } }, async (request) => {
    owner(request);
    const profile = state.store.profile();
    const data: TokenList = { items: listTokens(state.store.db()), profileRevision: profile.revision };
    return ok(request, profile.epoch, data);
  });

  app.post(`${API}/auth/tokens`, { config: { op: 'auth.tokens.create', auth: 'owner' } }, async (request) => {
    const p = owner(request);
    const body = requireBody<TokenCreate>(state, request, 'TokenCreate');
    checkWriteHeaders(request, body);
    await state.store.writeGate();
    const db = state.store.db();
    const now = state.now();
    const digest = bodyDigest(body);
    const created = db.transaction((): TokenCreated => {
      const prior = findReceipt(db, body.operationId);
      if (prior) {
        // Secret-delivery exception: never a second token or a recovered secret.
        if (prior.kind === 'token.create' && prior.bodyDigest === digest) {
          throw new HttpError(409, 'TOKEN_ALREADY_CREATED', prior.createdEntityId ? { createdEntityId: prior.createdEntityId } : {});
        }
        throw conflict('IDEMPOTENCY_CONFLICT');
      }
      const profile = state.store.profile();
      if (body.profileEpoch !== profile.epoch) throw conflict('EPOCH_MISMATCH');
      if (body.expectedRevision !== profile.revision) throw conflict('STALE_REVISION', profile.revision);
      const id = randomUUID();
      const { token, expiresAt } = createToken(db, { id, label: body.label, scopes: body.scopes, ttlDays: body.ttlDays, now });
      db.prepare('UPDATE profiles SET revision = revision + 1, updated_at = ? WHERE id = ?').run(now.toISOString(), profile.id);
      const r: Receipt = {
        apiVersion: '1', requestId: request.id, operationId: body.operationId, profileEpoch: profile.epoch, kind: 'token.create',
        eventSeq: state.store.lastEventSeq(), entities: [{ id, revision: 1, resourceType: 'token' }], outcome: 'created',
      };
      storeReceipt(db, { operationId: body.operationId, kind: 'token.create', bodyDigest: digest, principal: p.key, profileEpoch: profile.epoch, receipt: r, createdEntityId: id, at: now });
      return { id, token, expiresAt, scopes: [...new Set(body.scopes)].sort() };
    })();
    return ok(request, state.store.profile().epoch, created);
  });

  app.delete<{ Params: { id: string } }>(`${API}/auth/tokens/:id`, { config: { op: 'auth.tokens.revoke', auth: 'owner' } }, async (request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) => {
    const p = owner(request);
    const tokenId = request.params.id;
    if (!UUID_RE.test(tokenId)) throw new HttpError(422, 'INVALID_SHAPE');
    const body = requireBody<OwnerWrite>(state, request, 'OwnerWrite');
    checkWriteHeaders(request, body);
    await state.store.writeGate();
    const db = state.store.db();
    const now = state.now();
    const digest = bodyDigest({ ...body, tokenId });
    return db.transaction((): Receipt => {
      const prior = findReceipt(db, body.operationId);
      if (prior) {
        if (prior.kind !== 'token.revoke' || prior.bodyDigest !== digest) throw conflict('IDEMPOTENCY_CONFLICT');
        return prior.receipt;
      }
      const profile = state.store.profile();
      if (body.profileEpoch !== profile.epoch) throw conflict('EPOCH_MISMATCH');
      if (body.expectedRevision !== profile.revision) throw conflict('STALE_REVISION', profile.revision);
      const t = tokenExists(db, tokenId);
      if (!t) throw notFound();
      const changed = revokeToken(db, tokenId, now);
      if (changed) db.prepare('UPDATE profiles SET revision = revision + 1, updated_at = ? WHERE id = ?').run(now.toISOString(), profile.id);
      const r: Receipt = {
        apiVersion: '1', requestId: request.id, operationId: body.operationId, profileEpoch: profile.epoch, kind: 'token.revoke',
        eventSeq: state.store.lastEventSeq(), entities: [{ id: tokenId, revision: 2, resourceType: 'token' }], outcome: changed ? 'updated' : 'unchanged',
      };
      storeReceipt(db, { operationId: body.operationId, kind: 'token.revoke', bodyDigest: digest, principal: p.key, profileEpoch: profile.epoch, receipt: r, createdEntityId: null, at: now });
      return r;
    })();
  });
}
