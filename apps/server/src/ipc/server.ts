// Launcher ⇄ service IPC, protocol v1 (client: bin/lib/ipc.mjs; reference: tests/integration/launcher-stub-server.mjs).
// - Unix socket runtime/ipc.sock (0600) inside the 0700 runtime dir; secret runtime/ipc.key (0600) = 64 hex
//   chars, written before listening and rotated on every start; never logged, never in runtime.json.
// - One JSON line (≤64 KiB) in, one out, per connection:
//     {"v":1,"id":"<uuid>","secret":"<ipc.key>","verb":"<verb>","args":{...}}
//     {"v":1,"id":"<same>","ok":true,"result":{...}} | {"v":1,"id":"<same>","ok":false,"error":{code,message,status,retryable}}
// - Wrong/missing secret → IPC_UNAUTHORIZED; unknown verb → IPC_UNKNOWN_VERB; bad JSON → IPC_PROTOCOL.
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { connect, createServer, type Server } from 'node:net';
import { join } from 'node:path';
import type { PrivatePaths } from '../db/paths.ts';

export const IPC_VERSION = 1;
export const IPC_SOCKET = 'ipc.sock';
export const IPC_KEY = 'ipc.key';
const MAX_LINE_BYTES = 64 * 1024;
const MAX_SOCKET_PATH = 103;

export type IpcVerbHandler = (args: Record<string, unknown>) => unknown;
export type IpcHandlers = Readonly<Record<string, IpcVerbHandler>>;

export interface IpcServer {
  readonly socketPath: string;
  readonly keyPath: string;
  close(): Promise<void>;
}

/** Errors with code/status/retryable (RecoveryError, HttpError-like) are reported as-is; anything else is INTERNAL. */
function toIpcError(err: unknown): { code: string; message: string; status: number; retryable: boolean } {
  const e = err as { code?: unknown; status?: unknown; retryable?: unknown; message?: unknown };
  if (err && typeof e.code === 'string' && /^[A-Z][A-Z0-9_]{1,79}$/.test(e.code)) {
    return { code: e.code, message: typeof e.message === 'string' ? e.message.slice(0, 300) : e.code, status: typeof e.status === 'number' ? e.status : 500, retryable: e.retryable === true };
  }
  return { code: 'INTERNAL', message: 'internal error', status: 500, retryable: false };
}

function probe(socketPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const s = connect(socketPath);
    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.once('error', () => resolve(false));
  });
}

/** True when another live process answers on this profile's IPC socket. */
export async function ipcAlive(paths: PrivatePaths): Promise<boolean> {
  const p = join(paths.runtime, IPC_SOCKET);
  return existsSync(p) && (await probe(p));
}

export async function startIpcServer(paths: PrivatePaths, handlers: IpcHandlers): Promise<IpcServer> {
  const socketPath = join(paths.runtime, IPC_SOCKET);
  const keyPath = join(paths.runtime, IPC_KEY);
  if (Buffer.byteLength(socketPath) > MAX_SOCKET_PATH) throw new Error('IPC socket path too long for this platform');
  if (existsSync(socketPath)) {
    if (await probe(socketPath)) throw new Error('another service instance owns this profile');
    rmSync(socketPath, { force: true });
  }
  const secret = randomBytes(32).toString('hex');
  rmSync(keyPath, { force: true });
  writeFileSync(keyPath, secret, { mode: 0o600 });
  chmodSync(keyPath, 0o600);
  const secretBuf = Buffer.from(secret, 'utf8');

  const server: Server = createServer((sock) => {
    let buf = '';
    let done = false;
    const reply = (id: unknown, body: Record<string, unknown>): void => {
      if (done) return;
      done = true;
      sock.end(`${JSON.stringify({ v: IPC_VERSION, id: typeof id === 'string' ? id : null, ...body })}\n`);
    };
    sock.setEncoding('utf8');
    sock.setTimeout(10 * 60_000, () => sock.destroy());
    sock.on('error', () => sock.destroy());
    sock.on('data', (chunk: string) => {
      if (done) return;
      buf += chunk;
      if (Buffer.byteLength(buf) > MAX_LINE_BYTES) {
        reply(null, { ok: false, error: { code: 'IPC_PROTOCOL', message: 'request too large', status: 400, retryable: false } });
        return;
      }
      const nl = buf.indexOf('\n');
      if (nl < 0) return;
      let req: Record<string, unknown>;
      try {
        req = JSON.parse(buf.slice(0, nl)) as Record<string, unknown>;
      } catch {
        reply(null, { ok: false, error: { code: 'IPC_PROTOCOL', message: 'invalid JSON', status: 400, retryable: false } });
        return;
      }
      const presented = Buffer.from(typeof req.secret === 'string' ? req.secret : '', 'utf8');
      if (presented.length !== secretBuf.length || !timingSafeEqual(presented, secretBuf)) {
        reply(req.id, { ok: false, error: { code: 'IPC_UNAUTHORIZED', message: 'unauthorized', status: 401, retryable: false } });
        return;
      }
      const verb = typeof req.verb === 'string' ? req.verb : '';
      const handler = Object.hasOwn(handlers, verb) ? handlers[verb] : undefined;
      if (!handler) {
        reply(req.id, { ok: false, error: { code: 'IPC_UNKNOWN_VERB', message: 'unknown verb', status: 400, retryable: false } });
        return;
      }
      const args = req.args === undefined ? {} : req.args;
      if (typeof args !== 'object' || args === null || Array.isArray(args)) {
        reply(req.id, { ok: false, error: { code: 'IPC_BAD_ARGS', message: 'arguments must be an object', status: 400, retryable: false } });
        return;
      }
      Promise.resolve()
        .then(() => handler(args as Record<string, unknown>))
        .then(
          (result) => reply(req.id, { ok: true, result: result ?? {} }),
          (err: unknown) => reply(req.id, { ok: false, error: toIpcError(err) }),
        );
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(socketPath, () => resolve());
  });
  chmodSync(socketPath, 0o600);
  return {
    socketPath,
    keyPath,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
        rmSync(socketPath, { force: true });
        rmSync(keyPath, { force: true });
      }),
  };
}

/** v1 client (tests/tools): one request, parsed response. */
export function ipcRequest(socketPath: string, secret: string, verb: string, args: Record<string, unknown> = {}): Promise<{ ok: boolean; result?: any; error?: any; id?: string }> {
  return new Promise((resolve, reject) => {
    const s = connect(socketPath);
    let buf = '';
    s.setEncoding('utf8');
    s.once('error', reject);
    s.on('data', (c: string) => {
      buf += c;
    });
    s.on('end', () => {
      try {
        resolve(JSON.parse(buf.trim()) as { ok: boolean; result?: any; error?: any });
      } catch (e) {
        reject(e);
      }
    });
    s.once('connect', () => s.write(`${JSON.stringify({ v: IPC_VERSION, id: randomUUID(), secret, verb, args })}\n`));
  });
}
