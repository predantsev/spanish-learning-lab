// Replacement restore (DOMAIN-SPEC §replacement restore, API.md §Backup/auth control routes).
// Preview: validate + import into a shadow DB, then issue a single-use 256-bit confirmation bound to the archive
// hash, the live eventSeq and the live epoch (5 min). Preview records are files (runtime/restore-previews) so an
// offline CLI preview can be confirmed by a later CLI invocation; only the confirmation's hash is stored.
// Confirm: maintenance on → writes drained → live state re-checked → verified pre-restore backup → shadow gets
// the new epoch, the outcome marker, the import attestation, no credentials → crash journal → close live →
// rename old → rollback slot, shadow → live → reopen + verify → committed. Any failure before `committed`
// puts the old profile back and verifies it before leaving maintenance.
import Database from 'better-sqlite3';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { copyFileSync, constants as fsConstants, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ProfileStore } from '../store/types.ts';
import { RecoveryError, type RestoreConfirmInput, type RestoreOutcome, type RestorePreviewInfo } from './types.ts';
import type { ArtifactRegistry } from './artifacts.ts';
import { convertToDeleteJournal, rollbackFileName, type BackupManager } from './backups.ts';
import { localDate } from './dates.ts';
import {
  ensurePrivateDir,
  existingSidecars,
  fsyncDir,
  fsyncFile,
  isRegularFile,
  readJsonIfExists,
  removeIfExists,
  removeSidecars,
  removeTreeIfExists,
  sha256File,
  writeJsonDurable,
} from './fsutil.ts';
import { importArchive, type Placement } from './import.ts';
import { readJournal, removeJournal, rollbackFiles, writeJournal, type JournalStep, type RestoreJournal } from './journal.ts';
import { SimulatedCrash, type ResolvedOptions } from './options.ts';

export interface PreviewRecord {
  readonly v: 1;
  readonly id: string;
  readonly archiveHash: string;
  readonly uploadId: string;
  readonly shadowPath: string;
  readonly stagingDir: string;
  readonly confirmationHash: string;
  readonly liveEventSeq: number;
  readonly liveEpoch: number;
  readonly liveProfileId: string | null;
  readonly importedProfileId: string;
  readonly importedEpoch: number;
  readonly importedEventSeq: number;
  readonly schemaVersion: number;
  readonly selfContained: boolean;
  readonly receiptCount: number;
  readonly unverifiedHistoricalReceiptCount: number;
  readonly requiresSourceTrust: boolean;
  readonly attemptCount: number;
  readonly draftCount: number;
  readonly missingAssets: readonly string[];
  readonly placements: readonly Placement[];
  readonly archiveCreatedAt: string;
  readonly createdAt: string;
  readonly expiresAt: string;
}

export interface RestoreDeps {
  readonly store: ProfileStore;
  readonly backups: BackupManager;
  readonly artifacts: ArtifactRegistry;
  readonly options: ResolvedOptions;
}

const PREVIEW_ID_RE = /^[0-9a-f-]{36}$/;

function hashToken(token: string): Buffer {
  return createHash('sha256').update(token, 'utf8').digest();
}

export function previewDir(store: ProfileStore): string {
  return join(store.paths.runtime, 'restore-previews');
}

/** Reads a preview record (the launcher uses this to show the archive hash before confirming). */
export function readPreviewRecord(runtimeDir: string, previewId: string): PreviewRecord | undefined {
  if (!PREVIEW_ID_RE.test(previewId)) return undefined;
  return readJsonIfExists<PreviewRecord>(join(runtimeDir, 'restore-previews', `${previewId}.json`));
}

export class RestoreManager {
  private readonly d: RestoreDeps;

  constructor(deps: RestoreDeps) {
    this.d = deps;
  }

  private get store(): ProfileStore {
    return this.d.store;
  }

  private now(): Date {
    return this.store.clock.now();
  }

  private recordPath(id: string): string {
    return join(previewDir(this.store), `${id}.json`);
  }

  private discardPreviewFiles(rec: Pick<PreviewRecord, 'shadowPath' | 'stagingDir'>): void {
    removeIfExists(rec.shadowPath);
    removeSidecars(rec.shadowPath);
    removeTreeIfExists(rec.stagingDir);
  }

  /** Removes expired or consumed preview records with their shadow/staging files, and orphan shadows. */
  sweep(): void {
    const dir = previewDir(this.store);
    ensurePrivateDir(dir);
    const now = this.now().getTime();
    const live = new Set<string>();
    const journal = readJournal(this.store.paths);
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (name.endsWith('.json')) {
        const rec = readJsonIfExists<PreviewRecord>(p);
        if (rec && Date.parse(rec.expiresAt) > now) {
          live.add(rec.shadowPath);
          live.add(rec.stagingDir);
          continue;
        }
        if (rec) this.discardPreviewFiles(rec);
      }
      removeIfExists(p);
    }
    for (const name of readdirSync(this.store.paths.runtime)) {
      const p = join(this.store.paths.runtime, name);
      const orphan = /^shadow-[0-9a-f-]{36}\.sqlite(?:-wal|-shm|-journal)?$/.test(name) || /^restore-staging-[0-9a-f-]{36}$/.test(name) || /^export-[0-9a-f-]{36}\.sqlite/.test(name);
      if (!orphan) continue;
      const base = p.replace(/-(wal|shm|journal)$/, '');
      if (live.has(base) || (journal && (journal.shadowPath === base || journal.stagingDir === base))) continue;
      removeTreeIfExists(p);
    }
  }

  async preview(uploadId: string): Promise<RestorePreviewInfo> {
    const { store, artifacts, backups, options: o } = this.d;
    if (store.maintenance().on) throw new RecoveryError('MAINTENANCE', 503, 'profile is in maintenance mode', true);
    const upload = artifacts.get(uploadId, 'upload');
    if (!upload) throw new RecoveryError('UNKNOWN_UPLOAD', 422, 'upload is unknown or expired');
    const digest = await sha256File(upload.path);
    if (digest.sha256 !== upload.sha256) throw new RecoveryError('UPLOAD_CHANGED', 422, 'uploaded archive changed after upload');
    this.sweep();
    const live = backups.liveIdentity();
    const liveEventSeq = store.lastEventSeq();
    const id = randomUUID();
    const result = await importArchive({ store, options: o }, upload.path, id);
    try {
      const confirmation = randomBytes(32).toString('base64url');
      const createdAt = this.now();
      const expiresAt = new Date(createdAt.getTime() + o.confirmationTtlMs).toISOString();
      const rec: PreviewRecord = {
        v: 1,
        id,
        archiveHash: upload.sha256,
        uploadId,
        shadowPath: result.shadowPath,
        stagingDir: result.stagingDir,
        confirmationHash: hashToken(confirmation).toString('hex'),
        liveEventSeq,
        liveEpoch: live.epoch,
        liveProfileId: live.profileId,
        importedProfileId: result.manifest.profile.id,
        importedEpoch: result.manifest.profile.epoch,
        importedEventSeq: result.manifest.eventSeq,
        schemaVersion: result.manifest.schemaVersion,
        selfContained: result.manifest.selfContained,
        receiptCount: result.receipts.total,
        unverifiedHistoricalReceiptCount: result.receipts.unverified,
        requiresSourceTrust: result.receipts.unverified > 0,
        attemptCount: result.attemptCount,
        draftCount: result.draftCount,
        missingAssets: result.missingAssets,
        placements: result.placements,
        archiveCreatedAt: result.manifest.createdAt,
        createdAt: createdAt.toISOString(),
        expiresAt,
      };
      ensurePrivateDir(previewDir(store));
      writeJsonDurable(this.recordPath(id), rec);
      return {
        id,
        archiveHash: rec.archiveHash,
        liveEventSeq,
        profileEpoch: live.epoch,
        profileId: rec.importedProfileId,
        attemptCount: rec.attemptCount,
        draftCount: rec.draftCount,
        schemaVersion: rec.schemaVersion,
        missingAssets: rec.missingAssets,
        unverifiedHistoricalReceiptCount: rec.unverifiedHistoricalReceiptCount,
        requiresSourceTrust: rec.requiresSourceTrust,
        confirmation,
        expiresAt,
      };
    } catch (err) {
      this.discardPreviewFiles(result);
      throw err;
    }
  }

  /** Atomically consumes a preview record: a second confirm with the same preview finds nothing (single use). */
  private consume(id: string): PreviewRecord {
    const p = this.recordPath(id);
    const rec = readJsonIfExists<PreviewRecord>(p);
    if (!rec) throw new RecoveryError('RESTORE_PREVIEW_UNKNOWN', 409, 'restore preview is unknown, expired or already used');
    const consumed = `${p}.consumed`;
    try {
      renameSync(p, consumed);
    } catch {
      throw new RecoveryError('RESTORE_PREVIEW_UNKNOWN', 409, 'restore preview is unknown, expired or already used');
    }
    removeIfExists(consumed);
    return rec;
  }

  async confirm(input: RestoreConfirmInput): Promise<RestoreOutcome> {
    const { store, backups } = this.d;
    if (!PREVIEW_ID_RE.test(input.previewId)) throw new RecoveryError('RESTORE_PREVIEW_UNKNOWN', 409, 'restore preview is unknown, expired or already used');
    if (typeof input.operationId !== 'string' || input.operationId.length === 0 || input.operationId.length > 128) {
      throw new RecoveryError('INVALID_OPERATION_ID', 400, 'operationId is required');
    }
    const peek = readJsonIfExists<PreviewRecord>(this.recordPath(input.previewId));
    if (!peek) throw new RecoveryError('RESTORE_PREVIEW_UNKNOWN', 409, 'restore preview is unknown, expired or already used');
    if (Date.parse(peek.expiresAt) <= this.now().getTime()) {
      this.consume(input.previewId);
      this.discardPreviewFiles(peek);
      throw new RecoveryError('RESTORE_PREVIEW_EXPIRED', 409, 'restore confirmation expired; preview the archive again');
    }
    const given = hashToken(typeof input.confirmation === 'string' ? input.confirmation : '');
    const stored = Buffer.from(peek.confirmationHash, 'hex');
    if (stored.length !== given.length || !timingSafeEqual(stored, given) || input.archiveHash !== peek.archiveHash) {
      throw new RecoveryError('RESTORE_CONFIRMATION_MISMATCH', 409, 'confirmation does not match this preview');
    }
    if (peek.requiresSourceTrust && input.trustImportedProvenance !== true) {
      throw new RecoveryError('SOURCE_TRUST_REQUIRED', 422, 'archive carries review receipts from an unknown key; explicit source trust is required');
    }
    const rec = this.consume(input.previewId);
    return backups.exclusive(() => this.switchProfile(rec, input));
  }

  private liveChanged(rec: PreviewRecord): boolean {
    const live = this.d.backups.liveIdentity();
    return this.store.lastEventSeq() !== rec.liveEventSeq || live.epoch !== rec.liveEpoch || live.profileId !== rec.liveProfileId;
  }

  private async switchProfile(rec: PreviewRecord, input: RestoreConfirmInput): Promise<RestoreOutcome> {
    const { store, backups, artifacts, options: o } = this.d;
    if (store.maintenance().on) {
      this.discardPreviewFiles(rec);
      throw new RecoveryError('MAINTENANCE', 503, 'profile is in maintenance mode', true);
    }
    if (this.liveChanged(rec)) {
      this.discardPreviewFiles(rec);
      throw new RecoveryError('LIVE_STATE_CHANGED', 409, 'the profile changed after the preview; preview the archive again');
    }
    store.setMaintenance(true, 'restore');
    let healthy = true;
    let crashed = false;
    let outcome: RestoreOutcome;
    try {
      outcome = await store.withWritesPaused(async () => {
        let journal: RestoreJournal | null = null;
        let liveClosed = false;
        let preRestoreRel: string | undefined;
        const slotId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(input.operationId) ? input.operationId : randomUUID();
        const rollbackRel = `backups/${rollbackFileName(localDate(this.now(), backups.liveIdentity().timezone), slotId)}`;
        const step = (s: JournalStep): void => {
          journal = { ...journal!, step: s };
          writeJournal(store.paths, journal);
        };
        try {
          if (this.liveChanged(rec)) throw new RecoveryError('LIVE_STATE_CHANGED', 409, 'the profile changed after the preview; preview the archive again');
          let pre;
          try {
            pre = await backups.snapshot('pre-change', 'restore', { writesPaused: true, lockHeld: true });
          } catch (err) {
            if (err instanceof SimulatedCrash) throw err;
            throw new RecoveryError('PRE_RESTORE_BACKUP_FAILED', 503, 'the pre-restore backup could not be created and verified; nothing was replaced', true);
          }
          preRestoreRel = pre.relPath;
          backups.protect(pre.relPath);
          backups.protect(rollbackRel);
          const live = backups.liveIdentity();
          const newEpoch = Math.max(live.epoch, rec.importedEpoch) + 1;
          if (!Number.isSafeInteger(newEpoch)) throw new RecoveryError('EPOCH_OVERFLOW', 422, 'profile epoch would overflow; restore aborted');
          this.finalizeShadow(rec, input, newEpoch);
          journal = {
            v: 1,
            operationId: input.operationId,
            step: 'prepared',
            livePath: store.paths.profileDb,
            shadowPath: rec.shadowPath,
            rollbackPath: join(store.paths.root, rollbackRel),
            stagingDir: rec.stagingDir,
            archiveHash: rec.archiveHash,
            profileId: rec.importedProfileId,
            newEpoch,
            oldProfileId: live.profileId,
            oldEpoch: live.epoch,
            preRestoreBackup: pre.relPath,
            added: [],
            createdAt: this.now().toISOString(),
          };
          writeJournal(store.paths, journal);
          const added = this.place(rec.placements);
          journal = { ...(journal as RestoreJournal), added };
          writeJournal(store.paths, journal);
          await o.faults('restore:after-journal', { path: store.paths.journal });

          store.close();
          liveClosed = true;
          if (existingSidecars(store.paths.profileDb).length > 0) {
            throw new RecoveryError('RESTORE_FAILED', 503, 'live profile did not close cleanly; restore aborted', true);
          }
          await o.faults('restore:before-switch', { path: store.paths.profileDb });
          renameSync(store.paths.profileDb, journal.rollbackPath);
          fsyncDir(dirname(store.paths.profileDb));
          fsyncDir(dirname(journal.rollbackPath));
          step('live-moved');
          await o.faults('restore:after-live-moved', { path: journal.rollbackPath });
          renameSync(rec.shadowPath, store.paths.profileDb);
          fsyncDir(dirname(store.paths.profileDb));
          step('switched');
          await o.faults('restore:after-switch', { path: store.paths.profileDb });

          store.reopen();
          liveClosed = false;
          const p = store.profile();
          const marker = store.db().prepare('SELECT last_restore_operation_id AS op, last_restore_archive_hash AS h FROM profiles').get() as { op: string | null; h: string | null };
          if (
            p.id !== rec.importedProfileId ||
            p.epoch !== newEpoch ||
            store.lastEventSeq() !== rec.importedEventSeq ||
            marker.op !== input.operationId ||
            marker.h !== rec.archiveHash ||
            store.db().pragma('quick_check', { simple: true }) !== 'ok'
          ) {
            throw new RecoveryError('RESTORE_VERIFY_FAILED', 503, 'restored profile failed verification after the switch', true);
          }
          await o.faults('restore:verify-reopen', { path: store.paths.profileDb });
          step('committed');
          return { operationId: input.operationId, newEpoch, archiveHash: rec.archiveHash, profileId: rec.importedProfileId };
        } catch (err) {
          if (err instanceof SimulatedCrash) throw err;
          const j = journal as RestoreJournal | null;
          if (j) {
            try {
              if (!liveClosed) {
                // The store holds either the old file (failure before close) or the new one (after reopen).
                if (j.step === 'switched') {
                  store.close();
                  liveClosed = true;
                }
              }
              if (liveClosed) {
                rollbackFiles(j);
                store.reopen();
                liveClosed = false;
              } else {
                removeIfExists(j.shadowPath);
                for (const a of [...j.added].reverse()) removeTreeIfExists(a);
              }
              const back = backups.liveIdentity();
              if (back.profileId !== j.oldProfileId || back.epoch !== j.oldEpoch || store.db().pragma('quick_check', { simple: true }) !== 'ok') {
                throw new Error('old profile identity mismatch after rollback');
              }
              removeJournal(store.paths);
            } catch (rbErr) {
              healthy = false;
              o.logger.error('restore rollback failed; staying in maintenance', { code: (rbErr as Error).message });
            }
          }
          this.discardPreviewFiles(rec);
          if (!healthy) {
            throw new RecoveryError('RESTORE_ROLLBACK_FAILED', 503, `restore failed and the previous profile could not be verified; the pre-restore backup is ${preRestoreRel ?? 'unavailable'}`);
          }
          if (err instanceof RecoveryError) throw err;
          if ((err as NodeJS.ErrnoException).code === 'ENOSPC') throw new RecoveryError('RESTORE_DISK_FULL', 503, 'not enough disk space; the previous profile is active', true);
          throw new RecoveryError('RESTORE_FAILED', 503, 'restore failed; the previous profile is active', true);
        } finally {
          if (preRestoreRel) backups.unprotect(preRestoreRel);
          backups.unprotect(rollbackRel);
        }
      });
    } catch (err) {
      // A simulated crash models process death: nothing below runs, maintenance is not lifted.
      if (err instanceof SimulatedCrash) crashed = true;
      throw err;
    } finally {
      if (!crashed && healthy) store.setMaintenance(false);
    }
    await this.afterCommit(rec, outcome);
    artifacts.remove(rec.uploadId);
    return outcome;
  }

  /** Writes epoch, outcome marker and import attestation into the shadow profile and removes credentials. */
  private finalizeShadow(rec: PreviewRecord, input: RestoreConfirmInput, newEpoch: number): void {
    const now = this.now().toISOString();
    const sourceTrust = rec.receiptCount === 0 ? 'none-required' : rec.unverifiedHistoricalReceiptCount === 0 ? 'verified-key' : 'imported-unverified';
    const db = new Database(rec.shadowPath, { fileMustExist: true });
    try {
      db.pragma('foreign_keys = ON');
      db.pragma('synchronous = FULL');
      db.transaction(() => {
        db.prepare('UPDATE profiles SET epoch = ?, last_restore_operation_id = ?, last_restore_archive_hash = ?, updated_at = ?').run(
          newEpoch,
          input.operationId,
          rec.archiveHash,
          now,
        );
        db.prepare('DELETE FROM owner_sessions').run();
        db.prepare('DELETE FROM auth_tokens').run();
        db.prepare(
          'INSERT INTO import_attestations (id, archive_hash, operation_id, source_trust, unverified_receipt_count, details, imported_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ).run(
          randomUUID(),
          rec.archiveHash,
          input.operationId,
          sourceTrust,
          rec.unverifiedHistoricalReceiptCount,
          JSON.stringify({
            evidence: 'imported-historical',
            previewId: rec.id,
            sourceProfileEpoch: rec.importedEpoch,
            sourceEventSeq: rec.importedEventSeq,
            archiveCreatedAt: rec.archiveCreatedAt,
            schemaVersion: rec.schemaVersion,
            selfContained: rec.selfContained,
            receiptCount: rec.receiptCount,
            trustImportedProvenance: input.trustImportedProvenance === true,
          }),
          now,
        );
      })();
      if (db.pragma('quick_check', { simple: true }) !== 'ok') throw new RecoveryError('RESTORE_FAILED', 503, 'shadow profile failed verification', true);
      db.pragma('wal_checkpoint(TRUNCATE)');
    } finally {
      db.close();
    }
    if (existingSidecars(rec.shadowPath).length > 0) removeSidecars(rec.shadowPath);
    fsyncFile(rec.shadowPath);
    fsyncDir(dirname(rec.shadowPath));
  }

  /** Moves staged assets/packs into place where nothing exists yet; returns what was added (for rollback). */
  private place(placements: readonly Placement[]): string[] {
    const added: string[] = [];
    try {
      for (const p of placements) {
        if (existsSync(p.to) || !existsSync(p.from)) continue;
        mkdirSync(dirname(p.to), { recursive: true, mode: 0o700 });
        if (isRegularFile(p.from)) {
          copyFileSync(p.from, p.to, fsConstants.COPYFILE_EXCL);
          fsyncFile(p.to);
        } else {
          renameSync(p.from, p.to);
        }
        fsyncDir(dirname(p.to));
        added.push(p.to);
      }
    } catch (err) {
      for (const a of added.reverse()) removeTreeIfExists(a);
      throw err;
    }
    return added;
  }

  /** Post-commit housekeeping; failures here never undo a committed restore. */
  private async afterCommit(rec: PreviewRecord, outcome: RestoreOutcome): Promise<void> {
    const { store, backups, options: o } = this.d;
    try {
      const j = readJournal(store.paths);
      if (j && existsSync(j.rollbackPath)) convertToDeleteJournal(j.rollbackPath);
      removeTreeIfExists(rec.stagingDir);
      removeJournal(store.paths);
      await backups.reconcile();
      await backups.prune();
      // Runs inside the exclusive lock taken by confirm(); the snapshot pauses writes itself.
      if (backups.needsDaily()) await backups.snapshot('daily', 'post-restore', { lockHeld: true });
    } catch (err) {
      o.logger.warn('post-restore housekeeping incomplete', { operationId: outcome.operationId, code: (err as RecoveryError).code });
    }
  }
}
