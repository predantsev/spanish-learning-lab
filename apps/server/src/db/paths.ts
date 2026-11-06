// Private profile root. Never inside the repository; tests and dev runs inject SLL_HOME.
import { chmodSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export interface PrivatePaths {
  readonly root: string;
  readonly profileDb: string;
  readonly assets: string;
  readonly backups: string;
  readonly exports: string;
  readonly uploads: string;
  readonly runtime: string;
  readonly keys: string;
  readonly logs: string;
  readonly packs: string;
  readonly journal: string;
}

export const DEFAULT_ROOT_NAME = 'Spanish Learning Lab';

export function resolvePrivateRoot(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.SLL_HOME;
  if (override && override.trim() !== '') return resolve(override);
  return join(homedir(), 'Library', 'Application Support', DEFAULT_ROOT_NAME);
}

export function privatePaths(root: string): PrivatePaths {
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

/** Creates the private directories with 0700 and returns the paths. Existing modes are tightened. */
export function ensurePrivateDirs(root: string): PrivatePaths {
  const paths = privatePaths(root);
  for (const dir of [paths.root, paths.assets, paths.backups, paths.exports, paths.uploads, paths.runtime, paths.keys, paths.logs, paths.packs]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
    if ((statSync(dir).mode & 0o777) !== 0o700) chmodSync(dir, 0o700);
  }
  return paths;
}

/** Data files are 0600. */
export function tightenFile(file: string): void {
  if (existsSync(file) && (statSync(file).mode & 0o777) !== 0o600) chmodSync(file, 0o600);
}
