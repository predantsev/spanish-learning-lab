// Launcher IPC over a Unix socket in the private runtime dir (0600), authenticated with a random
// secret written to runtime/ipc.key (0600). One JSON line in, one JSON line out:
//   {"secret":"<hex>","verb":"register-nonce","nonce":"<43 base64url>"?} → {"ok":true,"nonce":"…"}
//   {"secret":"<hex>","verb":"status"} → {"ok":true,"instanceId","pid","port","url","profileEpoch","maintenance"}
//   {"secret":"<hex>","verb":"stop"} → {"ok":true} then a graceful stop
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { connect, createServer, type Server } from 'node:net';
import { join } from 'node:path';
import type { PrivatePaths } from '../db/paths.ts';

export const IPC_SOCKET = 'ipc.sock';
export const IPC_KEY = 'ipc.key';
const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_SOCKET_PATH = 103;

export interface IpcHandlers {
  registerNonce(nonce?: string): string;
  status(): Record<string, unknown>;
  stop(): Promise<void>;
}

export interface IpcServer {
  readonly socketPath: string;
  readonly keyPath: string;
  close(): Promise<void>;
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
  writeFileSync(keyPath, `${secret}\n`, { mode: 0o600 });
  chmodSync(keyPath, 0o600);
  const secretBuf = Buffer.from(secret, 'utf8');

  const server: Server = createServer((sock) => {
    let buf = '';
    let done = false;
    const reply = (obj: Record<string, unknown>): void => {
      if (done) return;
      done = true;
      sock.end(`${JSON.stringify(obj)}\n`);
    };
    sock.setEncoding('utf8');
    sock.setTimeout(5000, () => sock.destroy());
    sock.on('error', () => sock.destroy());
    sock.on('data', (chunk: string) => {
      buf += chunk;
      if (Buffer.byteLength(buf) > MAX_REQUEST_BYTES) {
        reply({ ok: false, error: 'BAD_REQUEST' });
        return;
      }
      const nl = buf.indexOf('\n');
      if (nl < 0) return;
      let req: Record<string, unknown>;
      try {
        req = JSON.parse(buf.slice(0, nl)) as Record<string, unknown>;
      } catch {
        reply({ ok: false, error: 'BAD_REQUEST' });
        return;
      }
      const presented = Buffer.from(typeof req.secret === 'string' ? req.secret : '', 'utf8');
      if (presented.length !== secretBuf.length || !timingSafeEqual(presented, secretBuf)) {
        reply({ ok: false, error: 'UNAUTHORIZED' });
        return;
      }
      try {
        switch (req.verb) {
          case 'register-nonce':
            reply({ ok: true, nonce: handlers.registerNonce(typeof req.nonce === 'string' ? req.nonce : undefined) });
            return;
          case 'status':
            reply({ ok: true, ...handlers.status() });
            return;
          case 'stop':
            reply({ ok: true });
            setImmediate(() => void handlers.stop());
            return;
          default:
            reply({ ok: false, error: 'UNKNOWN_VERB' });
        }
      } catch {
        reply({ ok: false, error: 'BAD_REQUEST' });
      }
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
        server.close(() => {
          rmSync(socketPath, { force: true });
          rmSync(keyPath, { force: true });
          resolve();
        });
      }),
  };
}

/** Client used by tests and tools: sends one request and returns the parsed response. */
export function ipcRequest(socketPath: string, request: Record<string, unknown>): Promise<Record<string, unknown>> {
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
        resolve(JSON.parse(buf.trim()) as Record<string, unknown>);
      } catch (e) {
        reject(e);
      }
    });
    s.once('connect', () => s.write(`${JSON.stringify(request)}\n`));
  });
}
