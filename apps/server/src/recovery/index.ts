// Recovery module entry: createRecovery(store, options) implements the frozen Recovery interface (types.ts).
// Startup order for the server (integrator): recoverJournalIfNeeded(paths) → open ProfileStore → createRecovery
// → recovery.start(). recovery.start() subscribes to store.onCommitted itself, so the store does not need to call
// noteCommitted (calling it as well is harmless: scheduling is debounced).
import type { Readable } from 'node:stream';
import type { ProfileStore } from '../store/types.ts';
import type { ArtifactInfo, BackupKind, BackupRecordInfo, Recovery, RestoreConfirmInput, RestoreOutcome, RestorePreviewInfo } from './types.ts';
import { ArtifactRegistry } from './artifacts.ts';
import { BackupManager, type BackupStatus } from './backups.ts';
import { createExport } from './export.ts';
import { resolveOptions, type RecoveryOptions, type ResolvedOptions } from './options.ts';
import { RestoreManager } from './restore.ts';
import { storeUpload } from './upload.ts';

export { recoverJournalIfNeeded, type JournalRecovery } from './journal.ts';
export { SimulatedCrash, type FaultPoint, type FaultInjector, type RecoveryOptions, type Timers } from './options.ts';
export { RecoveryError } from './types.ts';
export { OfflineProfileStore } from './offline-store.ts';
export { createRecoveryIpcHandlers } from './ipc-handlers.ts';

export class RecoveryService implements Recovery {
  readonly store: ProfileStore;
  readonly options: ResolvedOptions;
  readonly backups: BackupManager;
  readonly artifacts: ArtifactRegistry;
  readonly restores: RestoreManager;

  constructor(store: ProfileStore, options: RecoveryOptions = {}) {
    this.store = store;
    this.options = resolveOptions(store.paths, options);
    this.backups = new BackupManager(store, this.options);
    this.artifacts = new ArtifactRegistry(store.clock, this.options.timers, this.options.artifactTtlMs);
    this.restores = new RestoreManager({ store, backups: this.backups, artifacts: this.artifacts, options: this.options });
  }

  /** Housekeeping without the scheduler: orphan artifacts/previews, snapshot verification, retention. */
  async prepare(): Promise<void> {
    this.artifacts.sweepOrphans(this.store.paths.exports);
    this.artifacts.sweepOrphans(this.store.paths.uploads);
    this.restores.sweep();
    await this.backups.exclusive(async () => {
      await this.backups.reconcile();
      await this.backups.prune();
    });
  }

  async start(): Promise<void> {
    await this.prepare();
    await this.backups.startScheduler();
  }

  noteCommitted(eventSeq: number): void {
    this.backups.noteCommitted(eventSeq);
  }

  backupNow(kind: BackupKind, reason?: string): Promise<BackupRecordInfo> {
    return this.backups.snapshot(kind, reason);
  }

  exportProfile(options: { selfContained: boolean }): Promise<ArtifactInfo> {
    return createExport({ store: this.store, backups: this.backups, artifacts: this.artifacts, options: this.options }, options.selfContained === true);
  }

  storeUpload(body: Readable): Promise<ArtifactInfo> {
    return storeUpload(this.store, this.artifacts, this.options, body);
  }

  previewRestore(uploadId: string): Promise<RestorePreviewInfo> {
    return this.restores.preview(uploadId);
  }

  confirmRestore(input: RestoreConfirmInput): Promise<RestoreOutcome> {
    return this.restores.confirm(input);
  }

  download(id: string): ArtifactInfo | undefined {
    return this.artifacts.get(id, 'export');
  }

  /** Neutral recovery status for health/settings: no paths, no private data. */
  status(): BackupStatus & { readonly pendingWakeup: boolean } {
    return { ...this.backups.status(), pendingWakeup: this.backups.hasPendingWakeup() };
  }

  async stop(): Promise<void> {
    await this.backups.stopScheduler(true);
    this.artifacts.removeAll();
  }
}

export function createRecovery(store: ProfileStore, options: RecoveryOptions = {}): RecoveryService {
  return new RecoveryService(store, options);
}
