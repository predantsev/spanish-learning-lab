// Fastify 5 application: one origin serving /api/v1 and the built web assets.
// Security boundary per API.md: loopback bind only, exact Host allowlist (bound port), no proxy trust,
// no CORS, Origin/CSRF for cookie mutations, scoped bearer tokens, strict schemas (no coercion),
// 64 KiB bodies, rate limits, restrictive headers, redacted logs.
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify, { LogController, type FastifyInstance, type FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import type { Recovery } from './recovery/types.ts';
import type { ProfileStore } from './store/types.ts';
import { StoreClosedError } from './store/profile-store.ts';
import { ServerState } from './state.ts';
import { HttpError, badRequest, envelope, forbidden, isStorageFailure, notFound, unauthorized, unavailable } from './http/errors.ts';
import { SECURITY_HEADERS, allowedHosts, allowedOrigins, hasForwardingHeaders } from './http/security.ts';
import { fastifyLoggerOptions, type ServiceLogOptions } from './http/logging.ts';
import type { RateLimits } from './http/rate-limit.ts';
import type { AuthMode, Principal } from './http/principal.ts';
import { readHeader } from './http/reply.ts';
import { checkCsrf, findSession, readSessionCookie, touchSession } from './auth/sessions.ts';
import { findToken } from './auth/tokens.ts';
import { sha256 } from './auth/crypto.ts';
import { registerAuthRoutes } from './auth/routes.ts';
import { registerCommandRoutes } from './commands/routes.ts';
import { registerReadRoutes } from './reads/routes.ts';
import { registerViewRoutes } from './views/routes.ts';
import { registerRecoveryRoutes } from './recovery-routes.ts';

export const API_PREFIX = '/api/v1';
export const BODY_LIMIT = 64 * 1024;

export interface BuildServerOptions {
  readonly store: ProfileStore;
  readonly recovery?: Recovery;
  /** Built web assets (dist/web); served on the same origin with an SPA fallback for non-API routes. */
  readonly staticDir?: string;
  /** Service log sink (rotating file in production); false/undefined disables logging. */
  readonly logger?: ServiceLogOptions | false;
  readonly now?: () => Date;
  readonly rateLimits?: RateLimits;
}

export interface SllServer extends FastifyInstance {
  readonly sll: ServerState;
  /** Launcher IPC: registers a one-use 60 s nonce (or creates one) and returns it. */
  registerNonce(nonce?: string): string;
}

declare module 'fastify' {
  interface FastifyRequest {
    opKind?: string;
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function clientKey(request: FastifyRequest): string {
  const authz = readHeader(request, 'authorization');
  if (authz) return `b:${sha256(authz)}`;
  const cookie = readSessionCookie(readHeader(request, 'cookie'));
  if (cookie) return `c:${sha256(cookie)}`;
  return `ip:${request.socket.remoteAddress ?? 'unknown'}`;
}

async function authenticate(state: ServerState, request: FastifyRequest, mode: AuthMode): Promise<Principal | null> {
  const cookie = readSessionCookie(readHeader(request, 'cookie'));
  const authz = request.headers.authorization;
  if (cookie !== undefined && authz !== undefined) throw forbidden('MIXED_CREDENTIALS');
  if (mode === 'public' || mode === 'exchange') return null;
  const now = state.now();
  if (authz !== undefined) {
    if (mode === 'owner') throw forbidden('OWNER_ONLY');
    const m = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(typeof authz === 'string' ? authz : '');
    if (!m) throw unauthorized('AUTH_INVALID');
    const found = findToken(state.store.db(), m[1]!, now);
    if (found.state === 'expired') throw unauthorized('TOKEN_EXPIRED');
    if (found.state === 'revoked') throw unauthorized('TOKEN_REVOKED');
    if (found.state !== 'valid') throw unauthorized('AUTH_INVALID');
    return { kind: 'agent', key: `token:${found.token.id}`, token: found.token, scopes: new Set(found.token.scopes) };
  }
  if (cookie !== undefined) {
    const found = findSession(state.store.db(), cookie, now, state.store.profile().epoch);
    if (found.state === 'expired') throw unauthorized('SESSION_EXPIRED');
    if (found.state !== 'valid') throw unauthorized('AUTH_INVALID');
    if (MUTATING.has(request.method)) {
      const origin = readHeader(request, 'origin');
      if (origin === undefined || origin !== `http://${(readHeader(request, 'host') ?? '').toLowerCase()}`) throw forbidden('ORIGIN_REQUIRED');
      if (!checkCsrf(cookie, readHeader(request, 'x-csrf-token'))) throw forbidden('CSRF_INVALID');
    }
    let session = found.session;
    if (!(state.store as unknown as { isPaused?: () => boolean }).isPaused?.()) session = touchSession(state.store.db(), session, now);
    return { kind: 'owner', key: `session:${session.id}`, session, cookie };
  }
  throw unauthorized('AUTH_REQUIRED');
}

function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof StoreClosedError || isStorageFailure(err)) return unavailable('STORAGE_UNAVAILABLE');
  const e = err as { code?: string; statusCode?: number; validation?: unknown };
  if (e?.code === 'FST_ERR_CTP_BODY_TOO_LARGE' || e?.statusCode === 413) return new HttpError(413, 'BODY_TOO_LARGE');
  if (e?.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE' || e?.statusCode === 415) return badRequest('UNSUPPORTED_CONTENT_TYPE');
  if (e?.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || e?.code === 'FST_ERR_CTP_EMPTY_JSON_BODY' || err instanceof SyntaxError) return badRequest('MALFORMED_JSON');
  if (e?.validation) return new HttpError(422, 'INVALID_SHAPE');
  if (typeof e?.statusCode === 'number' && e.statusCode >= 400 && e.statusCode < 500) {
    if (e.statusCode === 404) return notFound();
    return badRequest('BAD_REQUEST');
  }
  return unavailable('INTERNAL_ERROR', false);
}

export async function buildServer(options: BuildServerOptions): Promise<SllServer> {
  const now = options.now ?? (() => options.store.clock.now());
  const state = new ServerState(options.store, options.recovery, now, options.rateLimits);
  const app = Fastify({
    ...(options.logger ? { logger: fastifyLoggerOptions(options.logger) } : { logger: false }),
    trustProxy: false,
    bodyLimit: BODY_LIMIT,
    genReqId: () => randomUUID(),
    // Fastify's own request lines (URLs, headers) are off; onResponse logs allowlisted fields only.
    logController: new LogController({ disableRequestLogging: true }),
    return503OnClosing: true,
    onProtoPoisoning: 'error',
    onConstructorPoisoning: 'error',
    routerOptions: { ignoreTrailingSlash: false, ignoreDuplicateSlashes: false, maxParamLength: 200, caseSensitive: true },
  }) as unknown as FastifyInstance;

  app.decorateRequest('principal', null);
  app.decorate('sll', state);
  app.decorate('registerNonce', (nonce?: string) => state.nonces.register(nonce));

  app.removeContentTypeParser('text/plain');
  app.addContentTypeParser('application/zip', (request, payload, done) => {
    if (request.routeOptions.url !== `${API_PREFIX}/recovery/uploads`) {
      done(badRequest('UNSUPPORTED_CONTENT_TYPE'), undefined);
      return;
    }
    done(null, payload);
  });

  app.addHook('onListen', async function onListen() {
    const address = app.server.address();
    if (!address || typeof address === 'string' || address.address !== '127.0.0.1') {
      throw new Error('the service binds 127.0.0.1 only');
    }
    state.port = address.port;
  });

  app.addHook('onRequest', async (request, reply) => {
    reply.headers(SECURITY_HEADERS);
    if (request.url.startsWith('/api/')) reply.header('cache-control', 'no-store');
    const host = (readHeader(request, 'host') ?? '').toLowerCase();
    if (state.port === 0 || !allowedHosts(state.port).has(host)) throw forbidden('HOST_FORBIDDEN');
    if (hasForwardingHeaders(request.headers)) throw forbidden('FORWARDED_FORBIDDEN');
    const origin = readHeader(request, 'origin');
    if (request.headers.origin !== undefined && (origin === undefined || !allowedOrigins(state.port).has(origin))) throw forbidden('ORIGIN_FORBIDDEN');
    if (readHeader(request, 'sec-fetch-site') === 'cross-site') throw forbidden('ORIGIN_FORBIDDEN');
    const retryAfter = state.limiter.hit(clientKey(request), MUTATING.has(request.method), now().getTime());
    if (retryAfter > 0) throw new HttpError(429, 'RATE_LIMITED', { retryable: true, headers: { 'retry-after': String(retryAfter) } });
    const mode: AuthMode = request.routeOptions?.config?.auth ?? 'public';
    if (mode !== 'public' && state.store.maintenance().on) throw unavailable('MAINTENANCE');
    request.principal = await authenticate(state, request, mode);
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info({ status: reply.statusCode, op: request.routeOptions?.config?.op ?? 'static', kind: request.opKind, ms: Math.round(reply.elapsedTime) }, 'request');
  });

  app.setErrorHandler((err, request, reply) => {
    const e = toHttpError(err);
    if (e.status >= 500) request.log.warn({ status: e.status, code: e.code }, 'request failed');
    for (const [k, v] of Object.entries(e.headers ?? {})) reply.header(k, v);
    void reply.code(e.status).type('application/json; charset=utf-8').send(envelope(request.id, e));
  });

  const staticRoot = options.staticDir ? resolve(options.staticDir) : undefined;
  const hasStatic = staticRoot !== undefined && existsSync(staticRoot);
  if (hasStatic) {
    await app.register(fastifyStatic, { root: staticRoot, prefix: '/', wildcard: false, index: ['index.html'], cacheControl: false, decorateReply: true, list: false, dotfiles: 'deny' });
  }
  app.setNotFoundHandler((request, reply) => {
    if (hasStatic && (request.method === 'GET' || request.method === 'HEAD') && !request.url.startsWith('/api/')) {
      return reply.type('text/html; charset=utf-8').sendFile('index.html');
    }
    throw notFound();
  });

  registerAuthRoutes(app, state);
  registerCommandRoutes(app, state);
  registerReadRoutes(app, state);
  registerViewRoutes(app, state);
  registerRecoveryRoutes(app, state);

  return app as SllServer;
}

/** Binds 127.0.0.1 only; returns the bound port. */
export async function listenLoopback(app: FastifyInstance, port = 0): Promise<number> {
  await app.listen({ host: '127.0.0.1', port });
  const address = app.server.address();
  if (!address || typeof address === 'string') throw new Error('no TCP address');
  return address.port;
}
