// Server process entry used by the launcher (bin/sll.mjs):
//   SLL_HOME=<private root> SLL_PORT=<preferred port or 0> SLL_INSTANCE_ID=<uuid> node apps/server/src/main.ts
// Binds 127.0.0.1 only, serves dist/web + /api/v1 on one origin, exposes launcher IPC on
// runtime/ipc.sock (0600, secret in runtime/ipc.key 0600). stdout carries one JSON line without
// secrets; logs go to logs/server.log (rotated 5 MiB × 3). SIGTERM/SIGINT/IPC stop = graceful stop.
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { buildServer, listenLoopback } from './app.ts';
import { ensurePrivateDirs, privatePaths, resolvePrivateRoot } from './db/paths.ts';
import { claimServiceLock } from './runtime/profile-lock.ts';
import { RotatingLogStream } from './http/logging.ts';
import { startIpcServer } from './ipc/server.ts';
import { recoverJournalIfNeeded } from './recovery/index.ts';
import { createServerRecovery } from './recovery-wiring.ts';
import { openProfileStore } from './store/profile-store.ts';
import { CANONICAL_HOSTNAME } from './http/security.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function preferredPort(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return 0;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 65535) throw new Error('SLL_PORT must be an integer 0..65535');
  return n;
}

/** The prior port is tried first; an occupied port is never killed, another one is allocated instead. */
function portFree(port: number): Promise<boolean> {
  if (port === 0) return Promise.resolve(true);
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once('error', () => resolve(false));
    probe.listen({ host: '127.0.0.1', port, exclusive: true }, () => probe.close(() => resolve(true)));
  });
}

async function main(): Promise<void> {
  const root = resolvePrivateRoot(process.env);
  const instanceId = process.env.SLL_INSTANCE_ID && UUID_RE.test(process.env.SLL_INSTANCE_ID) ? process.env.SLL_INSTANCE_ID : randomUUID();
  const wanted = preferredPort(process.env.SLL_PORT);
  // One writer per profile: the launcher's lock names this process (or its launcher parent); started
  // directly, the server takes runtime/profile.lock itself (role "service").
  const profileLock = claimServiceLock(ensurePrivateDirs(root), instanceId, fileURLToPath(import.meta.url));
  process.on('exit', () => profileLock.release());
  // An interrupted restore switch is completed or rolled back before the profile opens.
  recoverJournalIfNeeded(privatePaths(root));
  const store = openProfileStore({ root, instanceId });
  const logStream = new RotatingLogStream(store.paths.logs);
  const recovery = createServerRecovery(store, logStream);
  const staticDir = fileURLToPath(new URL('../../../dist/web', import.meta.url));
  const app = await buildServer({ store, ...(recovery ? { recovery } : {}), staticDir, logger: { sink: logStream } });
  const port = await listenLoopback(app, (await portFree(wanted)) ? wanted : 0);
  const url = `http://${CANONICAL_HOSTNAME}:${port}`;

  let stopping: Promise<void> | undefined;
  const stop = (): Promise<void> => {
    stopping ??= (async () => {
      try {
        await ipc.close();
      } catch {
        // already closed
      }
      await app.close();
      if (recovery) await recovery.stop().catch(() => undefined);
      store.close();
      logStream.close();
      process.exit(0);
    })();
    return stopping;
  };

  const ipc = await startIpcServer(store.paths, {
    registerNonce: (nonce) => app.registerNonce(nonce),
    status: () => ({ instanceId, pid: process.pid, port, url, profileEpoch: store.profile().epoch, maintenance: store.maintenance().on }),
    stop,
  });
  if (recovery) {
    store.onCommitted((seq) => recovery.noteCommitted(seq));
    await recovery.start();
  }
  process.on('SIGTERM', () => void stop());
  process.on('SIGINT', () => void stop());
  process.stdout.write(`${JSON.stringify({ event: 'listening', instanceId, pid: process.pid, port, url, recovery: recovery !== undefined })}\n`);
}

main().catch((err: unknown) => {
  const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : 'START_FAILED';
  process.stderr.write(`${JSON.stringify({ event: 'error', code, message: err instanceof Error ? err.message : 'start failed' })}\n`);
  process.exit(1);
});
