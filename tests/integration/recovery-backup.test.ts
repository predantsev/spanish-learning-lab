// A-05: verified snapshots, retention by reference, fault injection, scheduler (synthetic profile, temp root).
import { afterEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { existsSync, openSync, readFileSync, statSync, truncateSync, writeSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { createRecovery, RecoveryError, SimulatedCrash, type RecoveryService } from '../../apps/server/src/recovery/index.ts';
import type { FaultInjector } from '../../apps/server/src/recovery/options.ts';
import { isoWeek } from '../../apps/server/src/recovery/dates.ts';
import type { BackupRow } from '../../apps/server/src/recovery/backups.ts';
import { FakeClock, ManualTimers, TestStore, listDir, seedProfile, tempRoot } from './recovery-helpers.ts';

const stores: TestStore[] = [];
afterEach(() => {
  for (const s of stores.splice(0)) s.dispose();
});

function setup(start = '2026-10-01T09:00:00Z', faults?: FaultInjector, extra: Record<string, unknown> = {}): {
  store: TestStore;
  clock: FakeClock;
  timers: ManualTimers;
  recovery: RecoveryService;
} {
  const clock = new FakeClock(start);
  const store = new TestStore(join(tempRoot(), 'home'), clock);
  stores.push(store);
  seedProfile(store);
  const timers = new ManualTimers(clock);
  const recovery = createRecovery(store, { timers, ...(faults ? { faults } : {}), ...extra });
  return { store, clock, timers, recovery };
}

function rows(store: TestStore, where = '1=1'): BackupRow[] {
  return store.db().prepare(`SELECT * FROM backup_records WHERE ${where} ORDER BY created_at, id`).all() as BackupRow[];
}

const sha = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

async function expectRecoveryError(p: Promise<unknown>, code: string): Promise<RecoveryError> {
  const err = await p.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(err, `expected ${code}`).toBeInstanceOf(RecoveryError);
  expect((err as RecoveryError).code).toBe(code);
  return err as RecoveryError;
}

/** Overwrites a few bytes in the middle of a page so quick_check (or the open) fails. */
function corruptPage(path: string): void {
  const size = statSync(path).size;
  const fd = openSync(path, 'r+');
  try {
    for (let off = 4096; off + 512 < size; off += 4096) writeSync(fd, Buffer.alloc(512, 0xa5), 0, 512, off + 16);
  } finally {
    closeSync(fd);
  }
}

describe('recovery snapshots (A-05)', () => {
  it('takes a verified, WAL-consistent copy with db.backup — never a copy of the live file', async () => {
    const { store, recovery } = setup();
    for (let i = 0; i < 5; i++) await store.commit();
    // The committed events still sit only in the WAL: a raw copy of profile.sqlite would miss them.
    expect(statSync(`${store.paths.profileDb}-wal`).size).toBeGreaterThan(0);
    const info = await recovery.backupNow('manual', 'test');
    const file = join(store.paths.root, info.relPath);
    expect(info.eventSeq).toBe(5);
    expect(statSync(file).mode & 0o777).toBe(0o600);
    expect(sha(file)).toBe(info.sha256);
    const copy = new Database(file, { readonly: true });
    expect(copy.pragma('journal_mode', { simple: true })).toBe('delete');
    expect((copy.prepare('SELECT count(*) AS n FROM event_log').get() as { n: number }).n).toBe(5);
    copy.close();
    expect(existsSync(`${file}-wal`) || existsSync(`${file}-shm`)).toBe(false);
    const r = rows(store);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ kind: 'manual', state: 'verified', event_seq: 5, sha256: info.sha256, rel_path: info.relPath });
    expect(listDir(store.paths.backups).filter((f) => f.startsWith('.tmp-'))).toEqual([]);
  });

  it('keeps 7 changed-day, 4 ISO-week (by reference) and 5 pre-change snapshots across 10 days / 6 weeks', async () => {
    const days = ['2026-10-01', '2026-10-06', '2026-10-13', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26', '2026-11-02'];
    expect(new Set(days.map(isoWeek)).size).toBe(6);
    const { store, clock, timers, recovery } = setup(`${days[0]}T08:00:00Z`);
    for (const day of days) {
      clock.set(`${day}T08:00:00Z`);
      await recovery.start(); // service started on a change day after offline time
      for (const hour of ['09', '15']) {
        clock.set(`${day}T${hour}:00:00Z`);
        await store.commit();
        await store.commit();
        clock.advance(61_000);
        timers.runDue();
        await recovery.backups.whenIdle();
      }
      await recovery.stop(); // offline until the next change day: no wakeups, nothing to flush
      expect(timers.pending()).toBe(0);
    }
    clock.set('2026-11-02T18:00:00Z');
    for (let i = 0; i < 7; i++) {
      await store.commit();
      clock.advance(60_000);
      await recovery.backupNow('pre-change', 'content-activation');
    }

    const verified = rows(store, "state = 'verified'");
    const daily = verified.filter((r) => r.kind === 'daily');
    expect(daily.map((r) => r.local_date).sort()).toEqual(days.slice(-7));
    // Same-day refreshes replaced the morning snapshot: one daily per changed date, the afternoon one.
    for (const d of daily) expect(d.created_at.slice(11, 13)).toBe('15');
    const weekly = verified.filter((r) => r.kind === 'weekly');
    expect(weekly.map((r) => r.iso_week).sort()).toEqual(['2026-W42', '2026-W43', '2026-W44', '2026-W45']);
    const latestDailyOfWeek = (week: string): string =>
      rows(store, "kind = 'daily'")
        .filter((r) => r.iso_week === week)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]!.rel_path;
    for (const w of weekly) expect(w.rel_path).toBe(latestDailyOfWeek(w.iso_week));
    // W42's only daily (Oct 13) fell out of the 7-day window but its file lives on through the weekly reference.
    const w42 = weekly.find((w) => w.iso_week === '2026-W42')!;
    expect(daily.some((d) => d.rel_path === w42.rel_path)).toBe(false);
    expect(existsSync(join(store.paths.root, w42.rel_path))).toBe(true);
    const pre = verified.filter((r) => r.kind === 'pre-change');
    expect(pre).toHaveLength(5);
    expect(rows(store, "kind = 'pre-change' AND state = 'superseded'")).toHaveLength(2);

    // Files on disk are exactly the referenced ones: no duplicate bytes, superseded files pruned.
    const referenced = new Set(verified.map((r) => r.rel_path.replace('backups/', '')));
    expect(listDir(store.paths.backups)).toEqual([...referenced].sort());
    expect(referenced.size).toBe(7 + 1 + 5);
    for (const r of verified) expect(sha(join(store.paths.root, r.rel_path))).toBe(r.sha256);
    // Offline days produced no daily records at all.
    const everyDailyDate = new Set(rows(store, "kind IN ('daily', 'weekly')").map((r) => r.local_date));
    for (const d of everyDailyDate) expect(days).toContain(d);
  });

  it('rejects a snapshot whose bytes change after hashing (bad backup hash) and keeps the previous ones', async () => {
    let inject = false;
    const { store, recovery } = setup('2026-10-01T09:00:00Z', (point, ctx) => {
      if (inject && point === 'backup:before-rename' && ctx.path) {
        const fd = openSync(ctx.path, 'r+');
        writeSync(fd, Buffer.from([0x42]), 0, 1, 200);
        closeSync(fd);
      }
    });
    await store.commit();
    const good = await recovery.backupNow('manual');
    const before = listDir(store.paths.backups);
    await store.commit();
    inject = true;
    const err = await expectRecoveryError(recovery.backupNow('manual'), 'BACKUP_VERIFY_FAILED');
    expect(err.status).toBe(503);
    expect(err.retryable).toBe(true);
    expect(rows(store)).toHaveLength(1);
    expect(listDir(store.paths.backups)).toEqual(before);
    expect(sha(join(store.paths.root, good.relPath))).toBe(good.sha256);
    expect(recovery.status().lastFailureCode).toBe('BACKUP_VERIFY_FAILED');
  });

  it('rejects a corrupted copy at quick_check and registers nothing', async () => {
    let inject = false;
    const { store, recovery } = setup('2026-10-01T09:00:00Z', (point, ctx) => {
      if (inject && point === 'backup:before-verify' && ctx.path) corruptPage(ctx.path);
    });
    for (let i = 0; i < 40; i++) await store.commit();
    await recovery.backupNow('manual');
    inject = true;
    await store.commit();
    await expectRecoveryError(recovery.backupNow('daily'), 'BACKUP_VERIFY_FAILED');
    expect(rows(store)).toHaveLength(1);
    expect(listDir(store.paths.backups).filter((f) => f.startsWith('.tmp-'))).toEqual([]);
  });

  it('cleans an interrupted temp write on the next start and never registers it', async () => {
    let crash = false;
    const { store, clock, recovery } = setup('2026-10-01T09:00:00Z', (point, ctx) => {
      if (crash && point === 'backup:after-temp-write' && ctx.path) {
        truncateSync(ctx.path, 1000);
        throw new SimulatedCrash(point);
      }
    });
    await store.commit();
    const good = await recovery.backupNow('manual');
    await store.commit();
    crash = true;
    await expect(recovery.backupNow('daily')).rejects.toBeInstanceOf(SimulatedCrash);
    crash = false;
    const leftovers = listDir(store.paths.backups).filter((f) => f.startsWith('.tmp-'));
    expect(leftovers).toHaveLength(1);
    // Restart: a fresh module instance on the same profile.
    clock.advance(3600_000);
    const restarted = createRecovery(store, { timers: new ManualTimers(clock) });
    await restarted.start();
    expect(listDir(store.paths.backups).filter((f) => f.startsWith('.tmp-'))).toEqual([]);
    const verified = rows(store, "state = 'verified'");
    expect(verified.find((r) => r.id === good.id)).toBeDefined();
    // The startup snapshot covers the unsnapshotted change; the truncated temp file was never registered.
    expect(verified.every((r) => sha(join(store.paths.root, r.rel_path)) === r.sha256)).toBe(true);
    await restarted.stop();
  });

  it('fails cleanly on disk full (ENOSPC) and retries later', async () => {
    let full = true;
    const { store, recovery } = setup('2026-10-01T09:00:00Z', (point) => {
      if (full && point === 'backup:after-temp-write') throw Object.assign(new Error('no space left on device'), { code: 'ENOSPC' });
    });
    await store.commit();
    const err = await expectRecoveryError(recovery.backupNow('daily'), 'BACKUP_DISK_FULL');
    expect(err.retryable).toBe(true);
    expect(listDir(store.paths.backups)).toEqual([]);
    full = false;
    const ok = await recovery.backupNow('daily');
    // One daily row plus its ISO-week reference to the same file (no duplicate bytes).
    const verified = rows(store, "state = 'verified'");
    expect(verified.map((r) => r.kind).sort()).toEqual(['daily', 'weekly']);
    expect(new Set(verified.map((r) => r.rel_path))).toEqual(new Set([ok.relPath]));
    expect(listDir(store.paths.backups)).toHaveLength(1);
  });

  it('times out when writes cannot be paused, without blocking them, and succeeds later', async () => {
    const { store, recovery } = setup('2026-10-01T09:00:00Z', undefined, { backupTimeoutMs: 150 });
    await store.commit();
    const release = store.holdWrites();
    const started = Date.now();
    const err = await expectRecoveryError(recovery.backupNow('manual'), 'BACKUP_TIMEOUT');
    expect(err.retryable).toBe(true);
    expect(Date.now() - started).toBeLessThan(5000);
    release();
    await recovery.backupNow('manual');
    expect(rows(store, "state = 'verified'")).toHaveLength(1);
  });

  it('marks a registered snapshot that changed on disk as failed at start and never prunes the only valid backup', async () => {
    const { store, clock, recovery } = setup();
    await store.commit();
    const a = await recovery.backupNow('daily');
    clock.advance(86_400_000);
    await store.commit();
    const b = await recovery.backupNow('daily');
    const fd = openSync(join(store.paths.root, b.relPath), 'r+');
    writeSync(fd, Buffer.from('tampered'), 0, 8, 120);
    closeSync(fd);
    const restarted = createRecovery(store, { timers: new ManualTimers(clock), retention: { daily: 1 } });
    await restarted.start();
    const failed = rows(store, "state = 'failed'");
    // b and its ISO-week reference (same file) both fail verification.
    expect(failed.map((r) => r.id)).toContain(b.id);
    expect(new Set(failed.map((r) => r.rel_path))).toEqual(new Set([b.relPath]));
    // b is no longer valid: a fresh daily covers the latest change; the corrupted file is kept for diagnosis.
    expect(existsSync(join(store.paths.root, b.relPath))).toBe(true);
    const verified = rows(store, "state = 'verified' AND kind = 'daily'");
    expect(verified).toHaveLength(1);
    expect(verified[0]!.event_seq).toBe(2);
    expect(existsSync(join(store.paths.root, a.relPath))).toBe(false);
    await restarted.stop();
  });

  it('never deletes the only valid backup file even when retention supersedes its record', async () => {
    const { store, recovery } = setup('2026-10-01T09:00:00Z', undefined, { retention: { preChange: 0 } });
    await store.commit();
    const only = await recovery.backupNow('pre-change', 'migration');
    expect(rows(store, "state = 'superseded'").map((r) => r.id)).toEqual([only.id]);
    expect(existsSync(join(store.paths.root, only.relPath))).toBe(true);
  });
});

describe('backup scheduler', () => {
  it('debounces 60 s, refreshes at most every 15 min, never wakes up idle or stopped, and flushes on stop', async () => {
    const { store, clock, timers, recovery } = setup('2026-10-01T09:00:00Z');
    await recovery.start();
    // First start with no snapshot at all: a baseline daily is taken immediately.
    expect(rows(store, "kind = 'daily'")).toHaveLength(1);
    expect(timers.pending()).toBe(0);

    clock.advance(60_000);
    await store.commit();
    expect(timers.pending()).toBe(1);
    // Only one refresh per 15 minutes: the previous run was at 09:00.
    expect(timers.nextDue()).toBe(Date.parse('2026-10-01T09:15:00Z'));
    clock.set('2026-10-01T09:14:59Z');
    expect(timers.runDue()).toBe(0);
    clock.set('2026-10-01T09:15:00Z');
    timers.runDue();
    await recovery.backups.whenIdle();
    expect(rows(store, "kind = 'daily' AND state = 'verified'")[0]!.event_seq).toBe(1);

    // Debounce: commits at 10:00:00 and 10:00:30 → due at 10:01:30.
    clock.set('2026-10-01T10:00:00Z');
    await store.commit();
    clock.set('2026-10-01T10:00:30Z');
    await store.commit();
    expect(timers.nextDue()).toBe(Date.parse('2026-10-01T10:01:30Z'));

    // Continuous changes every 30 s cannot postpone the refresh beyond 15 min after the first pending change.
    for (let i = 0; i < 40; i++) {
      clock.advance(30_000);
      await store.commit();
      timers.runDue();
      await recovery.backups.whenIdle();
    }
    const refreshed = rows(store, "kind = 'daily' AND state = 'verified'")[0]!;
    expect(Date.parse(refreshed.created_at)).toBeLessThanOrEqual(Date.parse('2026-10-01T10:15:00Z'));

    // Drain the refresh still pending for the last commits, then stay idle across midnight: no timers, no files.
    clock.set(new Date(timers.nextDue()!).toISOString());
    timers.runDue();
    await recovery.backups.whenIdle();
    expect(timers.pending()).toBe(0);
    const before = rows(store).length;
    clock.advance(2 * 86_400_000);
    expect(timers.runDue()).toBe(0);
    expect(rows(store).length).toBe(before);

    // A pending change is flushed by a clean stop; afterwards nothing schedules.
    await store.commit();
    expect(timers.pending()).toBe(1);
    await recovery.stop();
    expect(recovery.status().pendingWakeup).toBe(false);
    const flushed = rows(store, "kind = 'daily' AND state = 'verified'").sort((a, b) => b.created_at.localeCompare(a.created_at))[0]!;
    expect(flushed.event_seq).toBe(store.lastEventSeq());
    expect(flushed.reason).toBe('stop-flush');
    await store.commit();
    expect(recovery.status().pendingWakeup).toBe(false);
  });

  it('does not create a daily snapshot on start when nothing changed since the last one', async () => {
    const { store, clock, recovery } = setup('2026-10-01T09:00:00Z');
    await store.commit();
    await recovery.start();
    await recovery.stop();
    const n = rows(store).length;
    clock.advance(5 * 86_400_000);
    const again = createRecovery(store, { timers: new ManualTimers(clock) });
    await again.start();
    expect(rows(store).length).toBe(n);
    await again.stop();
  });
});
