// Server process entry used by the launcher (bin/sll.mjs):
//   SLL_HOME=<private root> SLL_PORT=<preferred port or 0> SLL_INSTANCE_ID=<uuid> node apps/server/src/main.ts
// Startup: profile lock → recoverJournalIfNeeded → open store → recovery → HTTP (127.0.0.1 only, dist/web +
// /api/v1 on one origin) → launcher IPC v1 (runtime/ipc.sock + ipc.key, both 0600) → recovery.start().
// stdout carries one secret-free JSON line; logs go to logs/server.log (5 MiB × 3). SIGTERM/SIGINT/IPC stop =
// graceful stop: IPC closed, HTTP closed, recovery.stop() (flush), WAL checkpoint, lock released.
// The process title is never changed (the launcher verifies the command line before signalling).
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { buildServer, listenLoopback } from './app.ts';
import { ensurePrivateDirs, privatePaths, resolvePrivateRoot } from './db/paths.ts';
import { RotatingLogStream } from './http/logging.ts';
import { SECRET_PATTERN } from './auth/crypto.ts';
import { NONCE_TTL_MS } from './auth/nonces.ts';
import { startIpcServer, type IpcServer } from './ipc/server.ts';
import { createRecoveryIpcHandlers, recoverJournalIfNeeded } from './recovery/index.ts';
import { RecoveryError } from './recovery/types.ts';
import { createServerRecovery } from './recovery-wiring.ts';
import { claimServiceLock } from './runtime/profile-lock.ts';
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
  const startedAt = new Date().toISOString();
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
  const app = await buildServer({ store, recovery, staticDir, logger: { sink: logStream } });
  const port = await listenLoopback(app, (await portFree(wanted)) ? wanted : 0);
  const url = `http://${CANONICAL_HOSTNAME}:${port}`;

  let ipc: IpcServer | undefined;
  let stopping: Promise<void> | undefined;
  const stop = (): Promise<void> => {
    stopping ??= (async () => {
      try {
        await ipc?.close();
      } catch {
        // already closed
      }
      await app.close();
      await recovery.stop().catch(() => undefined);
      store.close();
      logStream.close();
      profileLock.release();
      process.exit(0);
    })();
    return stopping;
  };

  const voidCredentials = (): void => {
    // After a restore switch every nonce, lease and preview of the old epoch is void, and so are its
    // sessions/tokens (the recovery module already removed them from the new profile; this is idempotent).
    app.sll.invalidateVolatileAuth();
    const db = store.db();
    db.prepare('DELETE FROM owner_sessions').run();
    db.prepare('DELETE FROM auth_tokens').run();
  };

  ipc = await startIpcServer(store.paths, {
    status: () => {
      const p = store.profile();
      const marker = store.db().prepare('SELECT last_restore_operation_id AS op FROM profiles LIMIT 1').get() as { op: string | null } | undefined;
      const m = store.maintenance();
      return {
        instanceId,
        pid: process.pid,
        port,
        profileId: p.id,
        profileEpoch: p.epoch,
        schemaVersion: p.schemaVersion,
        startedAt,
        maintenance: m.reason === undefined ? { on: m.on } : { on: m.on, reason: m.reason },
        lastRestoreOperationId: marker?.op ?? null,
      };
    },
    'register-nonce': (args) => {
      const nonce = args.nonce;
      if (nonce !== undefined && (typeof nonce !== 'string' || !SECRET_PATTERN.test(nonce))) throw new RecoveryError('IPC_BAD_ARGS', 400, 'nonce must be 32 random bytes base64url');
      const registered = app.registerNonce(nonce as string | undefined);
      return { expiresAt: new Date(Date.now() + NONCE_TTL_MS).toISOString(), ...(nonce === undefined ? { nonce: registered } : {}) };
    },
    stop: () => {
      // Respond first, then stop (the reply is flushed before the IPC server closes).
      setTimeout(() => void stop(), 20);
      return { stopping: true };
    },
    ...createRecoveryIpcHandlers(recovery, { onRestored: voidCredentials }),
  });
  await recovery.start();
  process.on('SIGTERM', () => void stop());
  process.on('SIGINT', () => void stop());
  process.stdout.write(`${JSON.stringify({ event: 'listening', instanceId, pid: process.pid, port, url })}\n`);
}

main().catch((err: unknown) => {
  const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : 'START_FAILED';
  process.stderr.write(`${JSON.stringify({ event: 'error', code, message: err instanceof Error ? err.message : 'start failed' })}\n`);
  process.exit(1);
});
