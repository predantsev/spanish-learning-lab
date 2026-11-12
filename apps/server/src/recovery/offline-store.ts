// Minimal ProfileStore for offline launcher commands (backup/export/restore while the service is stopped and the
// launcher holds the profile lock). Single connection, no HTTP commands, so the write gate only serializes the
// recovery module's own pauses. Profile bootstrap mirrors brief 07's defaults (epoch 1, Europe/Madrid).
// TODO(integrator): replace with the server-core ProfileStore once merged if it supports a headless mode.
import { randomUUID } from 'node:crypto';
import { openDatabase, schemaVersion, type Db } from '../db/connection.ts';
import type { PrivatePaths } from '../db/paths.ts';
import type { Clock, ProfileInfo, ProfileStore } from '../store/types.ts';

export const systemClock: Clock = { now: () => new Date() };

export class OfflineProfileStore implements ProfileStore {
  readonly paths: PrivatePaths;
  readonly instanceId: string;
  readonly clock: Clock;
  private conn: Db | null;
  private pause: Promise<void> | null = null;
  private maint: { on: boolean; reason?: string } = { on: false };

  constructor(paths: PrivatePaths, options: { clock?: Clock; instanceId?: string } = {}) {
    this.paths = paths;
    this.clock = options.clock ?? systemClock;
    this.instanceId = options.instanceId ?? randomUUID();
    this.conn = openDatabase(paths.profileDb);
    this.bootstrap();
  }

  private bootstrap(): void {
    const db = this.db();
    const row = db.prepare('SELECT id FROM profiles').get();
    if (row) return;
    const now = this.clock.now().toISOString();
    db.prepare("INSERT INTO profiles (id, epoch, review_timezone, created_at, updated_at) VALUES (?, 1, 'Europe/Madrid', ?, ?)").run(randomUUID(), now, now);
  }

  db(): Db {
    if (!this.conn) throw new Error('profile store is closed');
    return this.conn;
  }

  profile(): ProfileInfo {
    const db = this.db();
    const r = db.prepare('SELECT id, epoch, revision, review_timezone FROM profiles').get() as
      | { id: string; epoch: number; revision: number; review_timezone: string }
      | undefined;
    if (!r) throw new Error('profile is not initialized');
    return { id: r.id, epoch: r.epoch, revision: r.revision, reviewTimezone: r.review_timezone, schemaVersion: schemaVersion(db) };
  }

  lastEventSeq(): number {
    return (this.db().prepare('SELECT coalesce(max(event_seq), 0) AS s FROM event_log').get() as { s: number }).s;
  }

  async writeGate(): Promise<void> {
    while (this.pause) await this.pause;
  }

  async withWritesPaused<T>(fn: () => Promise<T>): Promise<T> {
    while (this.pause) await this.pause;
    let release!: () => void;
    this.pause = new Promise<void>((r) => {
      release = r;
    });
    try {
      return await fn();
    } finally {
      this.pause = null;
      release();
    }
  }

  onCommitted(): () => void {
    return () => undefined;
  }

  setMaintenance(on: boolean, reason?: string): void {
    this.maint = on ? { on, ...(reason !== undefined ? { reason } : {}) } : { on: false };
  }

  maintenance(): { readonly on: boolean; readonly reason?: string } {
    return this.maint;
  }

  close(): void {
    if (!this.conn) return;
    this.conn.pragma('wal_checkpoint(TRUNCATE)');
    this.conn.close();
    this.conn = null;
  }

  reopen(): void {
    this.close();
    this.conn = openDatabase(this.paths.profileDb);
  }
}
