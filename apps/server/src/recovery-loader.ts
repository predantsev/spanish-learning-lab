// Optional wiring of the recovery module (owned by the recovery worker, recovery/**). Expected
// exports of apps/server/src/recovery/index.ts (integrator to confirm):
//   createRecovery(store: ProfileStore): Recovery
//   recoverJournalIfNeeded(paths: PrivatePaths): Promise<void> | void   (before the store opens)
// Until that module exists the server runs without backups/export/restore (routes answer 503).
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PrivatePaths } from './db/paths.ts';
import type { Recovery } from './recovery/types.ts';
import type { ProfileStore } from './store/types.ts';

export interface RecoveryModule {
  readonly createRecovery?: (store: ProfileStore) => Recovery;
  readonly recoverJournalIfNeeded?: (paths: PrivatePaths) => Promise<void> | void;
}

export async function loadRecoveryModule(): Promise<RecoveryModule | undefined> {
  const url = new URL('./recovery/index.ts', import.meta.url);
  if (!existsSync(fileURLToPath(url))) return undefined;
  const mod = (await import(url.href)) as Record<string, unknown>;
  return {
    ...(typeof mod.createRecovery === 'function' ? { createRecovery: mod.createRecovery as RecoveryModule['createRecovery'] } : {}),
    ...(typeof mod.recoverJournalIfNeeded === 'function' ? { recoverJournalIfNeeded: mod.recoverJournalIfNeeded as RecoveryModule['recoverJournalIfNeeded'] } : {}),
  };
}
