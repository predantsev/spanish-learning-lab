// Contract of the recovery module (backups, export, upload, restore preview/confirm, journal).
// Implemented by the recovery worker in apps/server/src/recovery/; consumed by HTTP routes and the launcher.
import type { Readable } from 'node:stream';

export type BackupKind = 'daily' | 'weekly' | 'pre-change' | 'rollback' | 'manual';

export interface BackupRecordInfo {
  readonly id: string;
  readonly kind: BackupKind;
  readonly relPath: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly eventSeq: number;
  readonly localDate: string;
}

export interface ArtifactInfo {
  readonly id: string;
  readonly path: string;
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly expiresAt: string;
}

export interface RestorePreviewInfo {
  readonly id: string;
  readonly archiveHash: string;
  readonly liveEventSeq: number;
  readonly profileEpoch: number;
  readonly profileId: string;
  readonly attemptCount: number;
  readonly draftCount: number;
  readonly schemaVersion: number;
  readonly missingAssets: readonly string[];
  readonly unverifiedHistoricalReceiptCount: number;
  readonly requiresSourceTrust: boolean;
  readonly confirmation: string;
  readonly expiresAt: string;
}

export interface RestoreConfirmInput {
  readonly operationId: string;
  readonly previewId: string;
  readonly archiveHash: string;
  readonly confirmation: string;
  readonly trustImportedProvenance: boolean;
}

export interface RestoreOutcome {
  readonly operationId: string;
  readonly newEpoch: number;
  readonly archiveHash: string;
  readonly profileId: string;
}

export class RecoveryError extends Error {
  readonly code: string;
  readonly status: 400 | 409 | 413 | 422 | 503;
  readonly retryable: boolean;
  constructor(code: string, status: 400 | 409 | 413 | 422 | 503, message: string, retryable = false) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

export interface Recovery {
  /** Startup: verify existing snapshots and create today's snapshot if the day lacks one / is stale. */
  start(): Promise<void>;
  /** Called by the store after a committed learning/content/draft/preference change (debounced 60 s, ≤1 per 15 min). */
  noteCommitted(eventSeq: number): void;
  backupNow(kind: BackupKind, reason?: string): Promise<BackupRecordInfo>;
  exportProfile(options: { selfContained: boolean }): Promise<ArtifactInfo>;
  storeUpload(body: Readable): Promise<ArtifactInfo>;
  previewRestore(uploadId: string): Promise<RestorePreviewInfo>;
  /** Owner UI/CLI only. Switches profiles; the caller must invalidate sessions/tokens afterwards (epoch changed). */
  confirmRestore(input: RestoreConfirmInput): Promise<RestoreOutcome>;
  download(id: string): ArtifactInfo | undefined;
  /** Clean stop: flush a changed day's snapshot, stop timers. */
  stop(): Promise<void>;
}
