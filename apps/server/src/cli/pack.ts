// Privileged local content CLI (not HTTP):
//   node apps/server/src/cli/pack.ts install <packDir> [--allow-preview]
// Uses SLL_HOME (or the default private root). Refuses while the service is running, so the
// profile keeps a single writer; stop the service, install, start again.
import { resolve } from 'node:path';
import { privatePaths, resolvePrivateRoot } from '../db/paths.ts';
import { ipcAlive } from '../ipc/server.ts';
import { installPack, PackInstallError } from '../content/install.ts';
import { loadRecoveryModule } from '../recovery-loader.ts';
import { openProfileStore } from '../store/profile-store.ts';

function usage(): never {
  process.stderr.write('usage: node apps/server/src/cli/pack.ts install <packDir> [--allow-preview]\n');
  process.exit(2);
}

async function main(argv: string[]): Promise<number> {
  const [verb, dir, ...rest] = argv;
  if (verb !== 'install' || !dir) usage();
  for (const r of rest) if (r !== '--allow-preview') usage();
  const root = resolvePrivateRoot(process.env);
  if (await ipcAlive(privatePaths(root))) {
    process.stderr.write(`${JSON.stringify({ ok: false, code: 'SERVICE_RUNNING', message: 'stop the running service before installing a pack' })}\n`);
    return 3;
  }
  const store = openProfileStore({ root });
  try {
    const mod = await loadRecoveryModule();
    const recovery = mod?.createRecovery ? mod.createRecovery(store) : undefined;
    const result = await installPack(store, resolve(dir), { allowPreview: rest.includes('--allow-preview'), ...(recovery ? { recovery } : {}) });
    process.stdout.write(`${JSON.stringify({ ok: true, ...result, preBackup: recovery !== undefined })}\n`);
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
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err: unknown) => {
    process.stderr.write(`${JSON.stringify({ ok: false, code: 'INSTALL_FAILED', message: err instanceof Error ? err.message : 'failed' })}\n`);
    process.exit(1);
  },
);
