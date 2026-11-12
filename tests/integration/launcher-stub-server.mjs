// Stub service for launcher tests and a reference implementation of the service side of the launcher IPC
// protocol (bin/lib/ipc.mjs). It is NOT the application server: it serves only GET /health-like 200 responses.
// Modes (SLL_STUB_MODE): basic | recovery (real recovery module over an offline store) | ignore-stop | crash.
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { chmodSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createServer as createIpcServer } from 'node:net';
import { removeQuiet } from '../../bin/lib/fsx.mjs';
import { ensurePrivateDirs, launcherPaths } from '../../bin/lib/paths.mjs';

const mode = process.env.SLL_STUB_MODE ?? 'basic';
if (mode === 'crash') {
  process.stderr.write('stub: simulated startup failure\n');
  process.exit(3);
}
const paths = ensurePrivateDirs(process.env.SLL_HOME);
const lp = launcherPaths(paths);
const instanceId = process.env.SLL_INSTANCE_ID ?? randomUUID();
const startedAt = new Date().toISOString();
const nonces = new Map();
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

let store = null;
let recovery = null;
let handlers = {};
if (mode === 'recovery') {
  const rec = await import('../../apps/server/src/recovery/index.ts');
  rec.recoverJournalIfNeeded(paths);
  store = new rec.OfflineProfileStore(paths, { instanceId });
  recovery = rec.createRecovery(store);
  await recovery.start();
  handlers = rec.createRecoveryIpcHandlers(recovery, { onRestored: () => nonces.clear() });
}

const http = createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end('{"status":"ok"}');
});
const listen = (port) =>
  new Promise((resolve, reject) => {
    http.once('error', reject);
    http.listen(port, '127.0.0.1', () => {
      http.off('error', reject);
      resolve();
    });
  });
const preferred = Number(process.env.SLL_PORT ?? 0);
try {
  await listen(preferred);
} catch (err) {
  if (err.code !== 'EADDRINUSE' || preferred === 0) throw err;
  await listen(0);
}
const port = http.address().port;

function profileInfo() {
  if (!store) return { profileId: 'stub-profile', profileEpoch: 1, schemaVersion: 1, lastRestoreOperationId: null };
  const p = store.profile();
  const marker = store.db().prepare('SELECT last_restore_operation_id AS op FROM profiles').get();
  return { profileId: p.id, profileEpoch: p.epoch, schemaVersion: p.schemaVersion, lastRestoreOperationId: marker?.op ?? null };
}

const secret = randomBytes(32).toString('hex');
removeQuiet(lp.ipcSock);
removeQuiet(lp.ipcKey);
writeFileSync(lp.ipcKey, secret, { mode: 0o600 });
chmodSync(lp.ipcKey, 0o600);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  ipc.close();
  http.close();
  if (recovery) await recovery.stop();
  if (store) store.close();
  removeQuiet(lp.ipcSock);
  removeQuiet(lp.ipcKey);
  setTimeout(() => process.exit(0), 20);
}

const ipc = createIpcServer((socket) => {
  let buf = '';
  socket.setEncoding('utf8');
  socket.on('error', () => undefined);
  socket.on('data', async (chunk) => {
    buf += chunk;
    if (buf.length > 64 * 1024) return socket.destroy();
    const nl = buf.indexOf('\n');
    if (nl === -1) return;
    let req;
    try {
      req = JSON.parse(buf.slice(0, nl));
    } catch {
      return socket.destroy();
    }
    buf = '';
    const reply = (obj) => socket.end(`${JSON.stringify({ v: 1, id: req.id, ...obj })}\n`);
    const given = Buffer.from(String(req.secret ?? ''));
    const want = Buffer.from(secret);
    if (given.length !== want.length || !timingSafeEqual(given, want)) {
      return reply({ ok: false, error: { code: 'IPC_UNAUTHORIZED', message: 'unauthorized', status: 401 } });
    }
    try {
      switch (req.verb) {
        case 'status':
          return reply({
            ok: true,
            result: { instanceId, pid: process.pid, port, ...profileInfo(), startedAt, maintenance: store ? store.maintenance() : { on: false }, nonceCount: nonces.size },
          });
        case 'register-nonce': {
          const n = req.args?.nonce;
          if (typeof n !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(n)) return reply({ ok: false, error: { code: 'IPC_BAD_ARGS', message: 'bad nonce', status: 400 } });
          nonces.set(sha256(n), Date.now() + 60_000);
          return reply({ ok: true, result: { expiresAt: new Date(Date.now() + 60_000).toISOString() } });
        }
        case 'stop':
          reply({ ok: true, result: { stopping: true } });
          if (mode !== 'ignore-stop') await shutdown();
          return undefined;
        default:
          if (Object.hasOwn(handlers, req.verb)) return reply({ ok: true, result: await handlers[req.verb](req.args) });
          return reply({ ok: false, error: { code: 'IPC_UNKNOWN_VERB', message: 'unknown verb', status: 400 } });
      }
    } catch (err) {
      return reply({ ok: false, error: { code: err.code ?? 'INTERNAL', message: err.message, status: err.status ?? 500, retryable: err.retryable === true } });
    }
  });
});
await new Promise((resolve) => ipc.listen(lp.ipcSock, resolve));
chmodSync(lp.ipcSock, 0o600);
process.on('SIGTERM', () => {
  if (mode === 'ignore-stop') {
    removeQuiet(lp.ipcSock);
    removeQuiet(lp.ipcKey);
    process.exit(0);
  }
  void shutdown();
});
