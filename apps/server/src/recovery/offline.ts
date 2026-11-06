// Offline recovery runner for the launcher: used only while the service is stopped and the launcher holds the
// exclusive profile lock. Interrupted restores are recovered first; the scheduler never runs (one-shot process).
import { ensurePrivateDirs } from '../db/paths.ts';
import { createRecovery, type RecoveryService } from './index.ts';
import { recoverJournalIfNeeded, type JournalRecovery } from './journal.ts';
import { OfflineProfileStore } from './offline-store.ts';
import type { RecoveryOptions } from './options.ts';

export { readPreviewRecord } from './restore.ts';

export interface OfflineContext {
  readonly recovery: RecoveryService;
  readonly store: OfflineProfileStore;
  readonly journal: JournalRecovery;
}

export async function withOfflineRecovery<T>(root: string, fn: (ctx: OfflineContext) => Promise<T>, options: RecoveryOptions = {}): Promise<T> {
  const paths = ensurePrivateDirs(root);
  const journal = recoverJournalIfNeeded(paths);
  const store = new OfflineProfileStore(paths);
  const recovery = createRecovery(store, options);
  try {
    await recovery.prepare();
    return await fn({ recovery, store, journal });
  } finally {
    recovery.artifacts.removeAll();
    store.close();
  }
}

/** Reads the restore outcome marker of the profile on disk (lost-response recovery, API.md). */
export function readRestoreMarker(root: string): { readonly operationId: string | null; readonly archiveHash: string | null; readonly epoch: number } | undefined {
  const paths = ensurePrivateDirs(root);
  const store = new OfflineProfileStore(paths);
  try {
    const r = store.db().prepare('SELECT last_restore_operation_id AS op, last_restore_archive_hash AS h, epoch FROM profiles').get() as
      | { op: string | null; h: string | null; epoch: number }
      | undefined;
    return r ? { operationId: r.op, archiveHash: r.h, epoch: r.epoch } : undefined;
  } finally {
    store.close();
  }
}
