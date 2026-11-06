// ProfileStore implementation: one SQLite connection (single writer), async write gate,
// maintenance mode, committed-change listeners and single-profile bootstrap.
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { openDatabase, schemaVersion, type Db } from '../db/connection.ts';
import { ensurePrivateDirs, type PrivatePaths } from '../db/paths.ts';
import type { Clock, ProfileInfo, ProfileStore } from './types.ts';

export const DEFAULT_TIMEZONE = 'Europe/Madrid';

export interface OpenProfileStoreOptions {
  /** Private root (SLL_HOME). */
  readonly root: string;
  readonly instanceId?: string;
  readonly clock?: Clock;
}

interface ProfileRow {
  id: string;
  epoch: number;
  revision: number;
  review_timezone: string;
}

export const systemClock: Clock = { now: () => new Date() };

export class SqliteProfileStore implements ProfileStore {
  readonly paths: PrivatePaths;
  readonly instanceId: string;
  readonly clock: Clock;
  private conn: Db | undefined;
  private pauseDepth = 0;
  private gateWaiters: Array<() => void> = [];
  private readonly listeners = new Set<(eventSeq: number, kind: string) => void>();
  private maint: { on: boolean; reason?: string } = { on: false };
  private schema = 0;

  constructor(options: OpenProfileStoreOptions) {
    this.paths = ensurePrivateDirs(options.root);
    this.instanceId = options.instanceId ?? randomUUID();
    this.clock = options.clock ?? systemClock;
    this.open();
  }

  private open(): void {
    this.conn = openDatabase(this.paths.profileDb);
    this.schema = schemaVersion(this.conn);
    this.bootstrapProfile(this.conn);
  }

  /** Creates the single profile row on first open: epoch 1, Europe/Madrid, system (light default) theme. */
  private bootstrapProfile(db: Db): void {
    const existing = db.prepare('SELECT count(*) AS n FROM profiles').get() as { n: number };
    if (existing.n > 0) return;
    const now = this.clock.now().toISOString();
    db.prepare(
      `INSERT INTO profiles (id, epoch, revision, review_timezone, audio_speed, theme, locale, queue_state, created_at, updated_at)
       VALUES (?, 1, 1, ?, 1, 'system', 'uk', '{}', ?, ?)`,
    ).run(randomUUID(), DEFAULT_TIMEZONE, now, now);
  }

  db(): Db {
    if (!this.conn) throw new StoreClosedError();
    return this.conn;
  }

  profile(): ProfileInfo {
    const r = this.db().prepare('SELECT id, epoch, revision, review_timezone FROM profiles LIMIT 1').get() as ProfileRow | undefined;
    if (!r) throw new Error('profile row missing');
    return { id: r.id, epoch: r.epoch, revision: r.revision, reviewTimezone: r.review_timezone, schemaVersion: this.schema };
  }

  lastEventSeq(): number {
    const r = this.db().prepare('SELECT max(event_seq) AS s FROM event_log').get() as { s: number | null };
    return r.s ?? 0;
  }

  async writeGate(): Promise<void> {
    while (this.pauseDepth > 0) {
      await new Promise<void>((resolve) => this.gateWaiters.push(resolve));
    }
  }

  isPaused(): boolean {
    return this.pauseDepth > 0;
  }

  async withWritesPaused<T>(fn: () => Promise<T>): Promise<T> {
    this.pauseDepth++;
    try {
      return await fn();
    } finally {
      this.pauseDepth--;
      if (this.pauseDepth === 0) {
        const waiters = this.gateWaiters;
        this.gateWaiters = [];
        for (const w of waiters) w();
      }
    }
  }

  onCommitted(listener: (eventSeq: number, kind: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Called by writers after a committed learning/content/draft/preference change. Listener errors never fail the write. */
  notifyCommitted(eventSeq: number, kind: string): void {
    for (const l of [...this.listeners]) {
      try {
        l(eventSeq, kind);
      } catch {
        // a listener failure (e.g. backup scheduling) must not turn a committed write into an error
      }
    }
  }

  setMaintenance(on: boolean, reason?: string): void {
    this.maint = on ? (reason === undefined ? { on: true } : { on: true, reason }) : { on: false };
  }

  maintenance(): { readonly on: boolean; readonly reason?: string } {
    return this.maint;
  }

  close(): void {
    if (!this.conn) return;
    try {
      this.conn.pragma('wal_checkpoint(TRUNCATE)');
    } finally {
      this.conn.close();
      this.conn = undefined;
    }
  }

  reopen(): void {
    if (this.conn) this.close();
    if (!existsSync(this.paths.profileDb)) throw new Error('profile database missing');
    this.open();
  }

  isOpen(): boolean {
    return this.conn !== undefined;
  }
}

export class StoreClosedError extends Error {
  constructor() {
    super('profile store is closed');
  }
}

export function openProfileStore(options: OpenProfileStoreOptions): SqliteProfileStore {
  return new SqliteProfileStore(options);
}
