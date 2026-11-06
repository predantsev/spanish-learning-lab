// Private profile root for the launcher. Mirrors apps/server/src/db/paths.ts exactly (plain JS, so the launcher
// runs without TypeScript); tests/integration/launcher-paths.test.ts keeps the two in sync.
import { chmodSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const DEFAULT_ROOT_NAME = 'Spanish Learning Lab';

export function resolvePrivateRoot(env = process.env) {
  const override = env.SLL_HOME;
  if (override && override.trim() !== '') return resolve(override);
  return join(homedir(), 'Library', 'Application Support', DEFAULT_ROOT_NAME);
}

export function privatePaths(root) {
  return {
    root,
    profileDb: join(root, 'profile.sqlite'),
    assets: join(root, 'assets'),
    backups: join(root, 'backups'),
    exports: join(root, 'exports'),
    uploads: join(root, 'exports', 'uploads'),
    runtime: join(root, 'runtime'),
    keys: join(root, 'keys'),
    logs: join(root, 'logs'),
    packs: join(root, 'assets', 'packs'),
    journal: join(root, 'runtime', 'restore-journal.json'),
  };
}

/** Creates the private directories with 0700; existing modes are tightened. */
export function ensurePrivateDirs(root) {
  const paths = privatePaths(root);
  for (const dir of [paths.root, paths.assets, paths.backups, paths.exports, paths.uploads, paths.runtime, paths.keys, paths.logs, paths.packs]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
    if ((statSync(dir).mode & 0o777) !== 0o700) chmodSync(dir, 0o700);
  }
  return paths;
}

/** Launcher-owned files inside runtime/ (0600). runtime.json never contains a token. */
export function launcherPaths(paths) {
  return {
    lock: join(paths.runtime, 'profile.lock'),
    runtimeJson: join(paths.runtime, 'runtime.json'),
    lastPort: join(paths.runtime, 'last-port'),
    ipcSock: join(paths.runtime, 'ipc.sock'),
    ipcKey: join(paths.runtime, 'ipc.key'),
    previews: join(paths.runtime, 'restore-previews'),
    launcherLog: join(paths.logs, 'launcher.log'),
    serviceLog: join(paths.logs, 'service-output.log'),
  };
}
