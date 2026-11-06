// Privileged local content CLI (not HTTP):
//   node apps/server/src/cli/pack.ts install <packDir> [--allow-preview]
// Uses SLL_HOME (or the default private root). Holds runtime/profile.lock (role "offline") for the
// whole install — the same lock the launcher and the server use — so it refuses while the service (or
// any other writer) owns the profile. Stop the service, install, start again.
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { ensurePrivateDirs, resolvePrivateRoot } from '../db/paths.ts';
import { ipcAlive } from '../ipc/server.ts';
import { installPack, PackInstallError } from '../content/install.ts';
import { loadRecoveryModule } from '../recovery-loader.ts';
import { claimOfflineLock, ProfileLockedError } from '../runtime/profile-lock.ts';
import { openProfileStore } from '../store/profile-store.ts';

function usage(): never {
  process.stderr.write('usage: node apps/server/src/cli/pack.ts install <packDir> [--allow-preview]\n');
  process.exit(2);
}

function refuse(message: string, holder?: { pid: number; role: string }): number {
  process.stderr.write(`${JSON.stringify({ ok: false, code: 'SERVICE_RUNNING', message, ...(holder ? { holderPid: holder.pid, holderRole: holder.role } : {}) })}\n`);
  return 3;
}

async function main(argv: string[]): Promise<number> {
  const [verb, dir, ...rest] = argv;
  if (verb !== 'install' || !dir) usage();
  for (const r of rest) if (r !== '--allow-preview') usage();
  const paths = ensurePrivateDirs(resolvePrivateRoot(process.env));
  let lock;
  try {
    lock = claimOfflineLock(paths, randomUUID());
  } catch (e) {
    if (e instanceof ProfileLockedError) return refuse('stop the running service before installing a pack', e.holder);
    throw e;
  }
  try {
    // Defence in depth: a live IPC socket means a service is answering for this profile.
    if (await ipcAlive(paths)) return refuse('stop the running service before installing a pack');
    const store = openProfileStore({ root: paths.root });
    try {
      const mod = await loadRecoveryModule();
      const recovery = mod?.createRecovery ? mod.createRecovery(store) : undefined;
      const result = await installPack(store, resolve(dir), { allowPreview: rest.includes('--allow-preview'), ...(recovery ? { recovery } : {}) });
      process.stdout.write(`${JSON.stringify({ ok: true, ...result, preBackup: recovery !== undefined && result.outcome === 'activated' })}\n`);
      return 0;
    } catch (e) {
      if (e instanceof PackInstallError) {
        process.stderr.write(`${JSON.stringify({ ok: false, code: e.code, message: e.message })}\n`);
        return 1;
      }
      throw e;
    } finally {
      store.close();
    }
  } finally {
    lock.release();
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err: unknown) => {
    process.stderr.write(`${JSON.stringify({ ok: false, code: 'INSTALL_FAILED', message: err instanceof Error ? err.message : 'failed' })}\n`);
    process.exit(1);
  },
);
