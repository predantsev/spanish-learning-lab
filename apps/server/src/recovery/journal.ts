// Crash journal of a restore switch (paths.journal). Written durably before any rename and updated after each
// step, so a restart can decide deterministically: a switch that never reached `committed` (new profile
// reopened AND verified) is rolled back to the old profile; a committed one is only cleaned up.
import Database from 'better-sqlite3';
import { existsSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import type { PrivatePaths } from '../db/paths.ts';
import { RecoveryError } from './types.ts';
import { fsyncDir, readJsonIfExists, removeIfExists, removeSidecars, removeTreeIfExists, writeJsonDurable } from './fsutil.ts';

export type JournalStep = 'prepared' | 'live-moved' | 'switched' | 'committed';

export interface RestoreJournal {
  readonly v: 1;
  readonly operationId: string;
  readonly step: JournalStep;
  readonly livePath: string;
  readonly shadowPath: string;
  readonly rollbackPath: string;
  readonly stagingDir: string;
  readonly archiveHash: string;
  readonly profileId: string;
  readonly newEpoch: number;
  readonly oldProfileId: string | null;
  readonly oldEpoch: number;
  readonly preRestoreBackup: string;
  /** Files/directories this restore placed for the new profile (assets, packs); removed on rollback. */
  readonly added: readonly string[];
  readonly createdAt: string;
}

export function readJournal(paths: PrivatePaths): RestoreJournal | undefined {
  let j: RestoreJournal | undefined;
  try {
    j = readJsonIfExists<RestoreJournal>(paths.journal);
  } catch {
    throw new RecoveryError('RESTORE_JOURNAL_CORRUPT', 503, 'restore journal is unreadable; manual recovery is required');
  }
  if (j && (j.v !== 1 || typeof j.livePath !== 'string' || typeof j.rollbackPath !== 'string')) {
    throw new RecoveryError('RESTORE_JOURNAL_CORRUPT', 503, 'restore journal is invalid; manual recovery is required');
  }
  return j;
}

export function writeJournal(paths: PrivatePaths, journal: RestoreJournal): void {
  writeJsonDurable(paths.journal, journal);
}

export function removeJournal(paths: PrivatePaths): void {
  removeIfExists(paths.journal);
  fsyncDir(dirname(paths.journal));
}

/**
 * Puts the old profile back at the live path. Idempotent across crashes during rollback:
 * - rollback slot present → the live path holds the new profile (or nothing): discard it and its sidecars,
 *   then move the old file back;
 * - rollback slot absent → the old file never moved (or a previous rollback already finished).
 * Sidecars at the live path are always removed first: a stray WAL would be replayed onto the old file.
 */
export function rollbackFiles(j: RestoreJournal): void {
  if (existsSync(j.rollbackPath)) {
    removeIfExists(j.livePath);
    removeSidecars(j.livePath);
    renameSync(j.rollbackPath, j.livePath);
    fsyncDir(dirname(j.livePath));
    fsyncDir(dirname(j.rollbackPath));
  }
  removeIfExists(j.shadowPath);
  removeSidecars(j.shadowPath);
  for (const p of [...j.added].reverse()) removeTreeIfExists(p);
  removeTreeIfExists(j.stagingDir);
}

/** Opens the live file directly (before any store) and checks integrity + the expected identity. */
export function verifyLiveIdentity(livePath: string, profileId: string | null, epoch: number): void {
  const db = new Database(livePath, { fileMustExist: true });
  try {
    if (db.pragma('quick_check', { simple: true }) !== 'ok') throw new Error('quick_check failed');
    const rows = db.prepare('SELECT id, epoch FROM profiles').all() as Array<{ id: string; epoch: number }>;
    if (profileId === null) {
      if (rows.length !== 0) throw new Error('unexpected profile row');
    } else if (rows.length !== 1 || rows[0]!.id !== profileId || rows[0]!.epoch !== epoch) {
      throw new Error('profile identity mismatch');
    }
  } finally {
    db.close();
  }
}

export interface JournalRecovery {
  readonly action: 'none' | 'completed' | 'rolled-back';
  readonly operationId?: string;
}

/**
 * Startup hook (call before the profile store opens). Completes or rolls back an interrupted restore switch
 * deterministically. Throws RESTORE_RECOVERY_FAILED (journal kept) if the old profile cannot be verified,
 * so the service never starts on an unverified profile.
 */
export function recoverJournalIfNeeded(paths: PrivatePaths): JournalRecovery {
  const j = readJournal(paths);
  if (!j) return { action: 'none' };
  if (j.step === 'committed') {
    removeIfExists(j.shadowPath);
    removeSidecars(j.shadowPath);
    removeTreeIfExists(j.stagingDir);
    removeJournal(paths);
    return { action: 'completed', operationId: j.operationId };
  }
  try {
    rollbackFiles(j);
    verifyLiveIdentity(j.livePath, j.oldProfileId, j.oldEpoch);
  } catch (err) {
    throw new RecoveryError(
      'RESTORE_RECOVERY_FAILED',
      503,
      `an interrupted restore could not be rolled back automatically (${(err as Error).message}); the pre-restore backup is ${j.preRestoreBackup}`,
    );
  }
  removeJournal(paths);
  return { action: 'rolled-back', operationId: j.operationId };
}
