// Shared interface between the HTTP/command layer (owner: server-core worker) and the
// recovery/backup layer (owner: recovery worker). Changing it requires the integrator.
import type { Db } from '../db/connection.ts';
import type { PrivatePaths } from '../db/paths.ts';

export interface Clock {
  now(): Date;
}

export interface ProfileInfo {
  readonly id: string;
  readonly epoch: number;
  readonly revision: number;
  readonly reviewTimezone: string;
  readonly schemaVersion: number;
}

export interface ProfileStore {
  readonly paths: PrivatePaths;
  readonly instanceId: string;
  readonly clock: Clock;
  /** Current connection; replaced after a restore switch, so never cache it across awaits. */
  db(): Db;
  profile(): ProfileInfo;
  lastEventSeq(): number;
  /** Every mutation awaits this before opening its transaction (single writer). */
  writeGate(): Promise<void>;
  /** Runs fn while new mutations wait at writeGate(); always releases, even on failure. */
  withWritesPaused<T>(fn: () => Promise<T>): Promise<T>;
  /** Listener for committed learning/content/draft/preference changes (not auth/health/backup housekeeping). */
  onCommitted(listener: (eventSeq: number, kind: string) => void): () => void;
  /** Maintenance mode: mutations fail 503 retryable, reads of private data fail 503. */
  setMaintenance(on: boolean, reason?: string): void;
  maintenance(): { readonly on: boolean; readonly reason?: string };
  /** Checkpoint + close the live connection (maintenance only). */
  close(): void;
  /** Re-open paths.profileDb (after a restore switch or rollback) and re-read profile info. */
  reopen(): void;
}
