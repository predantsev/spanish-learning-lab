// Integration harness: real HTTP on 127.0.0.1:<port 0>, a temporary private root (never a real
// profile), the synthetic pack and an injectable clock. Responses can be validated against the
// OpenAPI response schemas (docs/contracts/openapi.json via @sll/contracts).
import { request as httpRequest } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { createContractValidator, openapi } from '@sll/contracts';
import type { ValidateFunction } from 'ajv';
import { buildServer, listenLoopback, type SllServer } from '../../../apps/server/src/app.ts';
import { openProfileStore, type SqliteProfileStore } from '../../../apps/server/src/store/profile-store.ts';
import { installPack } from '../../../apps/server/src/content/install.ts';
import type { Recovery } from '../../../apps/server/src/recovery/types.ts';
import type { RateLimits } from '../../../apps/server/src/http/rate-limit.ts';
import type { LogSink } from '../../../apps/server/src/http/logging.ts';
import { buildSyntheticPack, type BuildOptions, type BuiltPack } from '../../fixtures/pack-synthetic/build-pack.ts';

export const START = '2026-10-01T08:00:00.000Z';
export const UNLIMITED: RateLimits = { requestsPerMinute: 1_000_000, mutationBurst: 1_000_000, mutationWindowMs: 10_000 };

export class TestClock {
  t: number;
  constructor(iso = START) {
    this.t = Date.parse(iso);
  }
  now = (): Date => new Date(this.t);
  advance(ms: number): void {
    this.t += ms;
  }
  set(iso: string): void {
    this.t = Date.parse(iso);
  }
}

export interface Res {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  text: string;
  body: any;
  raw: Buffer;
}

export interface ReqOptions {
  body?: unknown;
  raw?: string | Buffer;
  contentType?: string;
  headers?: Record<string, string>;
  /** Owner cookie: true = harness owner session, string = explicit cookie value, false/undefined = none. */
  cookie?: boolean | string;
  /** CSRF header: true = harness owner CSRF, string = explicit. Defaults to true for cookie mutations. */
  csrf?: boolean | string;
  bearer?: string;
  /** Origin header: undefined = automatic (same origin for cookie mutations), null = omit, string = explicit. */
  origin?: string | null;
  host?: string;
}

export interface Harness {
  readonly root: string;
  readonly store: SqliteProfileStore;
  readonly app: SllServer;
  readonly port: number;
  readonly host: string;
  readonly origin: string;
  readonly clock: TestClock;
  readonly pack: BuiltPack | undefined;
  owner: { cookie: string; csrf: string };
  req(method: string, path: string, opts?: ReqOptions): Promise<Res>;
  login(): Promise<{ cookie: string; csrf: string }>;
  epoch(): number;
  close(): Promise<void>;
}

export interface HarnessOptions {
  readonly install?: boolean;
  readonly packOptions?: BuildOptions;
  readonly rateLimits?: RateLimits;
  readonly recovery?: Recovery;
  /** Builds a real recovery module for the harness store (started before listen, stopped on close). */
  readonly recoveryFactory?: (store: SqliteProfileStore) => Recovery;
  readonly clock?: TestClock;
  readonly logSink?: LogSink;
  readonly login?: boolean;
}

export function rawRequest(port: number, method: string, path: string, headers: Record<string, string>, body?: string | Buffer): Promise<Res> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const text = raw.toString('utf8');
        let parsed: unknown;
        if ((res.headers['content-type'] ?? '').includes('application/json')) {
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = undefined;
          }
        }
        resolve({ status: res.statusCode ?? 0, headers: res.headers, text, body: parsed, raw });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

export async function startHarness(options: HarnessOptions = {}): Promise<Harness> {
  const root = mkdtempSync(join(tmpdir(), 'sll-it-'));
  const clock = options.clock ?? new TestClock();
  const store = openProfileStore({ root: join(root, 'home'), clock });
  let pack: BuiltPack | undefined;
  if (options.install !== false) {
    pack = buildSyntheticPack(join(root, 'pack'), options.packOptions ?? {});
    await installPack(store, pack.dir, { allowPreview: options.packOptions?.preview === true });
  }
  const recovery = options.recovery ?? options.recoveryFactory?.(store);
  if (options.recoveryFactory && recovery) await recovery.start();
  const app = await buildServer({
    store,
    ...(recovery ? { recovery } : {}),
    now: clock.now,
    rateLimits: options.rateLimits ?? UNLIMITED,
    logger: options.logSink ? { sink: options.logSink } : false,
  });
  const port = await listenLoopback(app, 0);
  const host = `spanish-learning-lab.localhost:${port}`;
  const origin = `http://${host}`;
  const h: Harness = {
    root,
    store,
    app,
    port,
    host,
    origin,
    clock,
    pack,
    owner: { cookie: '', csrf: '' },
    epoch: () => store.profile().epoch,
    async req(method, path, opts = {}) {
      const headers: Record<string, string> = { host: opts.host ?? host, ...(opts.headers ?? {}) };
      const mutating = method !== 'GET' && method !== 'HEAD';
      const cookie = opts.cookie === true ? h.owner.cookie : typeof opts.cookie === 'string' ? opts.cookie : undefined;
      if (cookie !== undefined) headers.cookie = `sll_session=${cookie}`;
      if (opts.bearer !== undefined) headers.authorization = `Bearer ${opts.bearer}`;
      if (opts.origin === undefined) {
        if (mutating && cookie !== undefined) headers.origin = `http://${headers.host}`;
      } else if (opts.origin !== null) headers.origin = opts.origin;
      const csrf = opts.csrf === undefined ? (mutating && cookie !== undefined ? true : false) : opts.csrf;
      if (csrf === true) headers['x-csrf-token'] = h.owner.csrf;
      else if (typeof csrf === 'string') headers['x-csrf-token'] = csrf;
      let payload: string | Buffer | undefined;
      if (opts.raw !== undefined) {
        payload = opts.raw;
        headers['content-type'] = opts.contentType ?? 'application/json';
      } else if (opts.body !== undefined) {
        payload = JSON.stringify(opts.body);
        headers['content-type'] = opts.contentType ?? 'application/json';
      }
      if (payload !== undefined) headers['content-length'] = String(Buffer.byteLength(payload));
      return rawRequest(port, method, path, headers, payload);
    },
    async login() {
      const nonce = app.registerNonce();
      const res = await h.req('POST', '/api/v1/auth/exchange', { body: { nonce }, origin: origin });
      if (res.status !== 200) throw new Error(`exchange failed ${res.status} ${res.text}`);
      const setCookie = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
      const m = /sll_session=([^;]+)/.exec(setCookie.join(';'));
      if (!m) throw new Error('no session cookie');
      h.owner = { cookie: m[1]!, csrf: res.body.data.csrfToken };
      return h.owner;
    },
    async close() {
      await app.close();
      if (options.recoveryFactory && recovery) await recovery.stop();
      store.close();
      rmSync(root, { recursive: true, force: true });
    },
  };
  if (options.login !== false) await h.login();
  return h;
}

export function uuid(): string {
  return randomUUID();
}

export function secret(): string {
  return randomBytes(32).toString('base64url');
}

/** Builds a Command body + matching headers for POST /commands. */
export function command(h: Harness, kind: string, subjectId: string, expectedRevision: number, payload: unknown, extra: Record<string, unknown> = {}, operationId: string = randomUUID()): { body: Record<string, unknown>; headers: Record<string, string> } {
  const body = { operationId, profileEpoch: h.epoch(), kind, subjectId, expectedRevision, payload, ...extra };
  return { body, headers: writeHeaders(body as { operationId: string; profileEpoch: number; expectedRevision: number }) };
}

export function writeHeaders(b: { operationId: string; profileEpoch: number; expectedRevision: number }): Record<string, string> {
  return { 'idempotency-key': b.operationId, 'x-profile-epoch': String(b.profileEpoch), 'if-match': `"${b.expectedRevision}"` };
}

export async function send(h: Harness, c: { body: unknown; headers: Record<string, string> }, opts: ReqOptions = { cookie: true }): Promise<Res> {
  return h.req('POST', '/api/v1/commands', { ...opts, body: c.body, headers: { ...c.headers, ...(opts.headers ?? {}) } });
}

// ------------------------------------------------------------------ contract response validation

const validator = createContractValidator();
const compiled = new Map<string, ValidateFunction>();

/** Validates a JSON response body against the OpenAPI response schema of operationId/status. */
export function contractErrors(operationId: string, status: number, body: unknown): string | undefined {
  const paths = (openapi as { paths: Record<string, Record<string, { operationId?: string; responses?: Record<string, { content?: Record<string, { schema?: unknown }> }> }>> }).paths;
  let schema: unknown;
  for (const ops of Object.values(paths)) {
    for (const op of Object.values(ops)) {
      if (op?.operationId === operationId) schema = op.responses?.[String(status)]?.content?.['application/json']?.schema;
    }
  }
  if (schema === undefined) return `no JSON response schema for ${operationId} ${status}`;
  const key = `${operationId}:${status}`;
  let fn = compiled.get(key);
  if (!fn) {
    fn = validator.compileInline(schema as Record<string, unknown>);
    compiled.set(key, fn);
  }
  if (fn(body)) return undefined;
  return JSON.stringify(fn.errors?.slice(0, 3));
}
