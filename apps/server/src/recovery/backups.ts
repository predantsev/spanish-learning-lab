// Verified SQLite snapshots (DOMAIN-SPEC §Backups): online db.backup() with writes paused to pin eventSeq,
// read-only verification of the copy, fsync + atomic rename, registration, retention by reference, and a
// startup reconciliation that trusts files on disk rather than rows (rows travel inside the profile DB).
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { chmodSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { schemaVersion as readSchemaVersion } from '../db/connection.ts';
import type { ProfileStore } from '../store/types.ts';
import { RecoveryError, type BackupKind, type BackupRecordInfo } from './types.ts';
import { isoWeek, localDate } from './dates.ts';
import { ensurePrivateDir, fsyncDir, fsyncFile, isRegularFile, removeIfExists, removeSidecars, sha256File } from './fsutil.ts';
import { SimulatedCrash, type ResolvedOptions } from './options.ts';

export interface BackupRow {
  readonly id: string;
  readonly kind: BackupKind;
  readonly reason: string | null;
  readonly local_date: string;
  readonly iso_week: string;
  readonly rel_path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly event_seq: number;
  readonly profile_epoch: number;
  readonly schema_version: number;
  readonly state: 'verified' | 'superseded' | 'failed';
  readonly created_at: string;
  readonly verified_at: string | null;
}

/** File name of a snapshot produced by db.backup(): kind, local date, epoch, eventSeq and hash prefix. */
const SNAPSHOT_RE = /^(daily|pre-change|manual)-(\d{4}-\d{2}-\d{2})-e(\d+)-s(\d+)-([0-9a-f]{16})(?:-\d+)?\.sqlite$/;
/** The previous live file moved aside by a restore switch. */
const ROLLBACK_RE = /^rollback-(\d{4}-\d{2}-\d{2})-([0-9a-f-]{36})\.sqlite$/;
export const TEMP_PREFIX = '.tmp-';

export function rollbackFileName(date: string, operationId: string): string {
  return `rollback-${date}-${operationId}.sqlite`;
}

export interface ExpectedIdentity {
  /** null: the live profile has no profiles row yet (fresh installation). */
  readonly profileId: string | null;
  readonly epoch: number;
  readonly eventSeq: number;
  readonly schemaVersion: number;
}

export interface SnapshotIdentity {
  readonly profileId: string | null;
  readonly epoch: number;
  readonly eventSeq: number;
  readonly schemaVersion: number;
}

/** Opens a snapshot read-only and checks integrity + identity. Throws a RecoveryError on any failure. */
export function verifySnapshotFile(path: string, expected?: ExpectedIdentity): SnapshotIdentity {
  let db: Database.Database | undefined;
  try {
    db = new Database(path, { readonly: true, fileMustExist: true });
    const quick = db.pragma('quick_check', { simple: true });
    if (quick !== 'ok') throw new Error('quick_check failed');
    const fk = db.pragma('foreign_key_check') as unknown[];
    if (fk.length > 0) throw new Error('foreign_key_check failed');
    const mode = db.pragma('journal_mode', { simple: true });
    if (mode !== 'delete') throw new Error(`unexpected journal mode ${String(mode)}`);
    const sv = readSchemaVersion(db);
    const profiles = db.prepare('SELECT id, epoch FROM profiles').all() as Array<{ id: string; epoch: number }>;
    if (profiles.length > 1) throw new Error('more than one profile row');
    const seqRow = db.prepare('SELECT coalesce(max(event_seq), 0) AS s FROM event_log').get() as { s: number };
    const identity: SnapshotIdentity = {
      profileId: profiles[0]?.id ?? null,
      epoch: profiles[0]?.epoch ?? 0,
      eventSeq: seqRow.s,
      schemaVersion: sv,
    };
    if (expected) {
      if (identity.schemaVersion !== expected.schemaVersion) throw new Error('schema version mismatch');
      if (identity.profileId !== expected.profileId) throw new Error('profile id mismatch');
      if (expected.profileId !== null && identity.epoch !== expected.epoch) throw new Error('profile epoch mismatch');
      if (identity.eventSeq !== expected.eventSeq) throw new Error('eventSeq mismatch');
    }
    return identity;
  } catch (err) {
    if (err instanceof RecoveryError) throw err;
    throw new RecoveryError('BACKUP_VERIFY_FAILED', 503, `snapshot verification failed: ${(err as Error).message}`, true);
  } finally {
    db?.close();
  }
}

/** Rewrites a fresh copy to rollback-journal mode so read-only opens never create -wal/-shm sidecars. */
export function convertToDeleteJournal(path: string): void {
  const db = new Database(path, { fileMustExist: true });
  try {
    db.pragma('journal_mode = DELETE');
  } finally {
    db.close();
  }
  removeSidecars(path);
  chmodSync(path, 0o600);
}

const newestFirst = (a: BackupRow, b: BackupRow): number =>
  b.created_at.localeCompare(a.created_at) || b.event_seq - a.event_seq || b.id.localeCompare(a.id);

function groupBy<T>(items: readonly T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const list = m.get(k);
    if (list) list.push(it);
    else m.set(k, [it]);
  }
  return m;
}

export interface BackupStatus {
  readonly lastSuccessAt?: string;
  readonly lastFailureAt?: string;
  readonly lastFailureCode?: string;
}

export class BackupManager {
  private readonly store: ProfileStore;
  private readonly o: ResolvedOptions;
  private chain: Promise<unknown> = Promise.resolve();
  private protectedRelPaths = new Set<string>();
  private statusValue: BackupStatus = {};
  // Scheduler state (DOMAIN-SPEC: debounce 60 s, at most one refresh per 15 min, no wakeups when stopped).
  private stopped = true;
  private timer: { cancel(): void } | null = null;
  private lastCommitAt = 0;
  private dirtySince: number | null = null;
  private lastRunAt = Number.NEGATIVE_INFINITY;
  private unsubscribe: (() => void) | null = null;
  private inFlight: Promise<unknown> | null = null;

  constructor(store: ProfileStore, options: ResolvedOptions) {
    this.store = store;
    this.o = options;
  }

  status(): BackupStatus {
    return this.statusValue;
  }

  /** Files that retention must never delete (e.g. the rollback slot of an active restore). */
  protect(relPath: string): void {
    this.protectedRelPaths.add(relPath);
  }

  unprotect(relPath: string): void {
    this.protectedRelPaths.delete(relPath);
  }

  /** Runs fn exclusively with respect to other snapshot/retention work. Order is always: this lock, then the write pause. */
  exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(fn, fn);
    this.chain = run.catch(() => undefined);
    return run;
  }

  private now(): Date {
    return this.store.clock.now();
  }

  private rows(where = "state = 'verified'"): BackupRow[] {
    return this.store.db().prepare(`SELECT * FROM backup_records WHERE ${where}`).all() as BackupRow[];
  }

  /** Live profile identity, tolerating a fresh installation without a profiles row. */
  liveIdentity(): { profileId: string | null; epoch: number; timezone: string } {
    const row = this.store.db().prepare('SELECT id, epoch, review_timezone FROM profiles').get() as
      | { id: string; epoch: number; review_timezone: string }
      | undefined;
    return row ? { profileId: row.id, epoch: row.epoch, timezone: row.review_timezone } : { profileId: null, epoch: 0, timezone: 'Europe/Madrid' };
  }

  /**
   * Online copy of the live DB into `dest` while new writes wait at the write gate, so the copy matches
   * exactly one eventSeq. The pause is bounded: after backupTimeoutMs the copy is aborted (retry later).
   */
  async copyLive(dest: string, writesAlreadyPaused: boolean): Promise<ExpectedIdentity> {
    const timeoutMs = this.o.backupTimeoutMs;
    const timeoutError = (): RecoveryError =>
      new RecoveryError('BACKUP_TIMEOUT', 503, `could not pause writes and copy within ${timeoutMs} ms`, true);
    let cancelled = false;
    const started = Date.now();
    const work = async (): Promise<ExpectedIdentity> => {
      if (cancelled) throw timeoutError();
      const live = this.liveIdentity();
      const expected: ExpectedIdentity = {
        profileId: live.profileId,
        epoch: live.epoch,
        eventSeq: this.store.lastEventSeq(),
        schemaVersion: readSchemaVersion(this.store.db()),
      };
      await this.store.db().backup(dest, {
        progress: () => {
          if (cancelled || Date.now() - started > timeoutMs) throw timeoutError();
          return 256;
        },
      });
      return expected;
    };
    if (writesAlreadyPaused) return work();
    const paused = this.store.withWritesPaused(work);
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        cancelled = true;
        reject(timeoutError());
      }, timeoutMs);
    });
    try {
      return await Promise.race([paused, timeout]);
    } finally {
      clearTimeout(timer);
      paused.catch(() => undefined);
    }
  }

  /** backupNow() and internal pre-change snapshots. weekly/rollback are derived, never produced directly. */
  snapshot(kind: BackupKind, reason: string | undefined, opts: { writesPaused?: boolean; lockHeld?: boolean } = {}): Promise<BackupRecordInfo> {
    if (kind === 'weekly' || kind === 'rollback') {
      return Promise.reject(new RecoveryError('BACKUP_KIND_UNSUPPORTED', 400, `${kind} snapshots are derived, not created directly`));
    }
    if (!opts.writesPaused && this.store.maintenance().on) {
      return Promise.reject(new RecoveryError('MAINTENANCE', 503, 'profile is in maintenance mode', true));
    }
    const run = (): Promise<BackupRecordInfo> => this.snapshotUnlocked(kind, reason, opts.writesPaused === true);
    return opts.lockHeld ? run() : this.exclusive(run);
  }

  private async snapshotUnlocked(kind: BackupKind, reason: string | undefined, writesPaused: boolean): Promise<BackupRecordInfo> {
    const paths = this.store.paths;
    ensurePrivateDir(paths.backups);
    if (kind === 'daily') {
      const live = this.liveIdentity();
      const current: ExpectedIdentity = {
        profileId: live.profileId,
        epoch: live.epoch,
        eventSeq: this.store.lastEventSeq(),
        schemaVersion: readSchemaVersion(this.store.db()),
      };
      const reused = await this.reuseIdentical(current);
      if (reused) {
        const info = this.register(kind, reason ?? 'scheduled', localDate(this.now(), live.timezone), reused.rel_path, reused.sha256, reused.bytes, current);
        await this.prune();
        return info;
      }
    }
    const tmp = join(paths.backups, `${TEMP_PREFIX}${randomUUID()}.sqlite`);
    let crashed = false;
    try {
      const expected = await this.copyLive(tmp, writesPaused);
      await this.o.faults('backup:after-temp-write', { path: tmp, kind });
      convertToDeleteJournal(tmp);
      await this.o.faults('backup:before-verify', { path: tmp, kind });
      verifySnapshotFile(tmp, expected);
      const first = await sha256File(tmp);
      fsyncFile(tmp);
      await this.o.faults('backup:before-rename', { path: tmp, kind });
      const second = await sha256File(tmp);
      if (second.sha256 !== first.sha256 || second.bytes !== first.bytes) {
        throw new RecoveryError('BACKUP_VERIFY_FAILED', 503, 'snapshot hash changed after verification', true);
      }
      const date = localDate(this.now(), this.liveIdentity().timezone);
      const base = `${kind}-${date}-e${expected.epoch}-s${expected.eventSeq}-${first.sha256.slice(0, 16)}`;
      let name = `${base}.sqlite`;
      for (let i = 1; existsSync(join(paths.backups, name)); i++) {
        const existing = await sha256File(join(paths.backups, name));
        if (existing.sha256 === first.sha256) break; // identical bytes already in place: reference them
        name = `${base}-${i}.sqlite`;
      }
      const final = join(paths.backups, name);
      if (existsSync(final)) removeIfExists(tmp);
      else renameSync(tmp, final);
      fsyncDir(paths.backups);
      const info = this.register(kind, reason ?? (kind === 'daily' ? 'scheduled' : kind), date, `backups/${name}`, first.sha256, first.bytes, expected);
      this.statusValue = { ...this.statusValue, lastSuccessAt: this.now().toISOString() };
      await this.prune();
      return info;
    } catch (err) {
      if (err instanceof SimulatedCrash) {
        crashed = true;
        throw err;
      }
      const code = err instanceof RecoveryError ? err.code : (err as NodeJS.ErrnoException).code === 'ENOSPC' ? 'BACKUP_DISK_FULL' : 'BACKUP_FAILED';
      this.statusValue = { ...this.statusValue, lastFailureAt: this.now().toISOString(), lastFailureCode: code };
      this.o.logger.warn('backup failed', { kind, code });
      if (err instanceof RecoveryError) throw err;
      throw new RecoveryError(code, 503, 'backup failed; previous snapshots are retained', true);
    } finally {
      if (!crashed) {
        removeIfExists(tmp);
        removeSidecars(tmp);
      }
    }
  }

  /** A daily snapshot at an unchanged eventSeq references an existing verified file instead of copying bytes. */
  private async reuseIdentical(expected: ExpectedIdentity): Promise<BackupRow | undefined> {
    const candidates = this.rows("state = 'verified' AND kind != 'rollback'")
      .filter((r) => r.profile_epoch === expected.epoch && r.event_seq === expected.eventSeq && r.schema_version === expected.schemaVersion)
      .sort(newestFirst);
    for (const c of candidates) {
      const abs = join(this.store.paths.root, c.rel_path);
      if (!isRegularFile(abs)) continue;
      const d = await sha256File(abs);
      if (d.sha256 === c.sha256) return c;
    }
    return undefined;
  }

  /** Registers a verified file; also used by restore for the rollback slot. */
  register(kind: BackupKind, reason: string, date: string, relPath: string, sha256: string, bytes: number, id: ExpectedIdentity): BackupRecordInfo {
    const now = this.now();
    const rowId = randomUUID();
    this.store
      .db()
      .prepare(
        `INSERT INTO backup_records (id, kind, reason, local_date, iso_week, rel_path, sha256, bytes, event_seq, profile_epoch, schema_version, state, created_at, verified_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?)`,
      )
      .run(rowId, kind, reason, date, isoWeek(date), relPath, sha256, bytes, id.eventSeq, id.epoch, id.schemaVersion, now.toISOString(), now.toISOString());
    return { id: rowId, kind, relPath, sha256, bytes, eventSeq: id.eventSeq, localDate: date };
  }

  /**
   * Retention: 7 latest changed-day snapshots, 4 ISO-week snapshots (references to daily files),
   * 5 newest pre-change, latest rollback; manual snapshots are never pruned automatically.
   * Only verified rows are superseded; a file is deleted only when no verified row references it, it is not
   * protected, and at least one other verified snapshot file remains on disk.
   */
  async prune(): Promise<void> {
    const db = this.store.db();
    const policy = this.o.retention;
    const rows = this.rows();
    const supersede = new Set<string>();
    const drop = new Set<string>();
    const inserts: BackupRow[] = [];
    const nowIso = this.now().toISOString();

    const latestPerDate: BackupRow[] = [];
    for (const list of groupBy(rows.filter((r) => r.kind === 'daily'), (r) => r.local_date).values()) {
      list.sort(newestFirst);
      latestPerDate.push(list[0]!);
      for (const r of list.slice(1)) drop.add(r.id);
    }
    latestPerDate.sort((a, b) => b.local_date.localeCompare(a.local_date) || newestFirst(a, b));
    for (const r of latestPerDate.slice(policy.daily)) supersede.add(r.id);

    const weeklies = rows.filter((r) => r.kind === 'weekly');
    const byWeek = groupBy([...latestPerDate, ...weeklies], (r) => r.iso_week);
    const weeks = [...byWeek.keys()].sort().reverse();
    const keptWeeks = new Set(weeks.slice(0, policy.weekly));
    for (const week of weeks) {
      const list = byWeek.get(week)!.slice().sort(newestFirst);
      const best = list[0]!;
      const existing = weeklies.filter((w) => w.iso_week === week);
      if (keptWeeks.has(week)) {
        const keep = existing.find((w) => w.rel_path === best.rel_path);
        if (!keep) inserts.push({ ...best, id: randomUUID(), kind: 'weekly', reason: 'weekly', created_at: nowIso });
        for (const w of existing) if (w !== keep) drop.add(w.id);
      } else {
        for (const w of existing) supersede.add(w.id);
      }
    }

    const keepNewest = (kind: BackupKind, n: number): void => {
      const list = rows.filter((r) => r.kind === kind).sort(newestFirst);
      for (const r of list.slice(n)) supersede.add(r.id);
    };
    keepNewest('pre-change', policy.preChange);
    keepNewest('rollback', policy.rollback);

    if (supersede.size === 0 && drop.size === 0 && inserts.length === 0) return;
    const insert = db.prepare(
      `INSERT INTO backup_records (id, kind, reason, local_date, iso_week, rel_path, sha256, bytes, event_seq, profile_epoch, schema_version, state, created_at, verified_at)
       VALUES (@id, @kind, @reason, @local_date, @iso_week, @rel_path, @sha256, @bytes, @event_seq, @profile_epoch, @schema_version, 'verified', @created_at, @verified_at)`,
    );
    db.transaction(() => {
      for (const r of inserts) insert.run(r);
      for (const id of supersede) db.prepare("UPDATE backup_records SET state = 'superseded' WHERE id = ? AND state = 'verified'").run(id);
      for (const id of drop) db.prepare("DELETE FROM backup_records WHERE id = ? AND state = 'verified'").run(id);
    })();

    const affected = new Set(rows.filter((r) => supersede.has(r.id) || drop.has(r.id)).map((r) => r.rel_path));
    await this.deleteUnreferenced(affected);
  }

  private async deleteUnreferenced(candidates: Set<string>): Promise<void> {
    if (candidates.size === 0) return;
    const root = this.store.paths.root;
    const verified = this.rows();
    const referenced = new Set(verified.map((r) => r.rel_path));
    const alive = new Set(verified.map((r) => r.rel_path).filter((p) => isRegularFile(join(root, p))));
    let deleted = false;
    for (const rel of candidates) {
      if (referenced.has(rel) || this.protectedRelPaths.has(rel)) continue;
      if (!rel.startsWith('backups/') || rel.includes('..')) continue;
      const othersAlive = [...alive].some((p) => p !== rel);
      if (!othersAlive) continue; // never delete the only valid backup
      removeIfExists(join(root, rel));
      alive.delete(rel);
      deleted = true;
    }
    if (deleted) fsyncDir(this.store.paths.backups);
  }

  /**
   * Startup reconciliation: remove interrupted temp files, re-hash every verified row (missing or changed
   * files become 'failed'), and register verified snapshot files that no row describes (after a restore the
   * new profile's rows know nothing about this machine's files). Unknown or invalid files are left untouched.
   */
  async reconcile(): Promise<void> {
    const paths = this.store.paths;
    ensurePrivateDir(paths.backups);
    for (const f of readdirSync(paths.backups)) {
      if (f.startsWith(TEMP_PREFIX)) removeIfExists(join(paths.backups, f));
    }
    const db = this.store.db();
    const verdict = new Map<string, boolean>();
    for (const r of this.rows()) {
      let ok = verdict.get(r.rel_path + r.sha256);
      if (ok === undefined) {
        const abs = join(paths.root, r.rel_path);
        ok = isRegularFile(abs) && (await sha256File(abs)).sha256 === r.sha256;
        verdict.set(r.rel_path + r.sha256, ok);
      }
      if (!ok) {
        db.prepare("UPDATE backup_records SET state = 'failed' WHERE id = ?").run(r.id);
        this.o.logger.warn('registered snapshot failed verification', { id: r.id, kind: r.kind });
      }
    }
    const known = new Set((db.prepare('SELECT rel_path FROM backup_records').all() as Array<{ rel_path: string }>).map((r) => r.rel_path));
    const verifiedKnown = new Set(this.rows().map((r) => r.rel_path));
    for (const f of readdirSync(paths.backups).sort()) {
      const rel = `backups/${f}`;
      const abs = join(paths.backups, f);
      if (verifiedKnown.has(rel) || !isRegularFile(abs)) continue;
      const snap = SNAPSHOT_RE.exec(f);
      const roll = ROLLBACK_RE.exec(f);
      if (!snap && !roll) continue;
      if (known.has(rel)) continue; // a failed/superseded row already describes it
      if (this.protectedRelPaths.has(rel)) continue;
      try {
        if (roll) convertToDeleteJournal(abs);
        const digest = await sha256File(abs);
        if (snap && !digest.sha256.startsWith(snap[5]!)) continue;
        const identity = verifySnapshotFile(abs);
        const kind = (snap ? snap[1] : 'rollback') as BackupKind;
        const date = (snap ? snap[2] : roll![1])!;
        const now = this.now().toISOString();
        db.prepare(
          `INSERT INTO backup_records (id, kind, reason, local_date, iso_week, rel_path, sha256, bytes, event_seq, profile_epoch, schema_version, state, created_at, verified_at)
           VALUES (?, ?, 'reconciled', ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?)`,
        ).run(randomUUID(), kind, date, isoWeek(date), rel, digest.sha256, digest.bytes, identity.eventSeq, identity.epoch, identity.schemaVersion, now, now);
      } catch (err) {
        this.o.logger.warn('unregistered snapshot file is not valid; left untouched', { file: f, code: (err as RecoveryError).code });
      }
    }
  }

  /** True when committed changes exist that no daily snapshot of the current profile epoch covers. */
  needsDaily(): boolean {
    const live = this.liveIdentity();
    if (live.profileId === null) return false;
    const seq = this.store.lastEventSeq();
    const latest = this.rows("state = 'verified' AND kind = 'daily'")
      .filter((r) => r.profile_epoch === live.epoch)
      .sort(newestFirst)[0];
    return !latest || latest.event_seq < seq;
  }

  // ---- scheduler ----

  async startScheduler(): Promise<void> {
    this.stopped = false;
    if (!this.unsubscribe) this.unsubscribe = this.store.onCommitted((seq) => this.noteCommitted(seq));
    if (this.needsDaily()) await this.runScheduled();
  }

  noteCommitted(_eventSeq: number): void {
    if (this.stopped) return;
    const now = this.now().getTime();
    this.lastCommitAt = now;
    this.dirtySince ??= now;
    this.schedule();
  }

  /** Pending scheduler wakeup, for diagnostics/tests. */
  hasPendingWakeup(): boolean {
    return this.timer !== null;
  }

  /** Resolves when no scheduled snapshot is running. */
  async whenIdle(): Promise<void> {
    while (this.inFlight) await this.inFlight.catch(() => undefined);
  }

  private schedule(): void {
    if (this.stopped || this.dirtySince === null) return;
    this.timer?.cancel();
    const now = this.now().getTime();
    const debounced = Math.min(this.lastCommitAt + this.o.debounceMs, this.dirtySince + this.o.minIntervalMs);
    const due = Math.max(this.lastRunAt + this.o.minIntervalMs, debounced);
    this.timer = this.o.timers.setTimeout(() => {
      this.timer = null;
      void this.runScheduled();
    }, Math.max(0, due - now));
  }

  private async runScheduled(): Promise<void> {
    if (this.stopped) return;
    const work = (async () => {
      if (!this.needsDaily()) {
        this.dirtySince = null;
        return;
      }
      const startedAt = this.now().getTime();
      try {
        const info = await this.snapshot('daily', 'scheduled');
        this.lastRunAt = startedAt;
        this.dirtySince = this.store.lastEventSeq() > info.eventSeq ? this.lastCommitAt : null;
      } catch (err) {
        this.lastRunAt = startedAt;
        if (err instanceof SimulatedCrash) throw err;
      }
      this.schedule();
    })();
    this.inFlight = work;
    try {
      await work;
    } finally {
      if (this.inFlight === work) this.inFlight = null;
    }
  }

  /** Clean stop: no further wakeups; flush a changed day's snapshot. */
  async stopScheduler(flush: boolean): Promise<void> {
    this.stopped = true;
    this.timer?.cancel();
    this.timer = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.inFlight) await this.inFlight.catch(() => undefined);
    if (flush && this.needsDaily()) {
      await this.snapshot('daily', 'stop-flush').catch((err: unknown) => {
        this.o.logger.warn('flush snapshot failed', { code: (err as RecoveryError).code });
      });
    }
    this.dirtySince = null;
  }
}
