// Test doubles and synthetic fixtures for the recovery tests. Everything here is synthetic and unreviewed;
// no real profile, credential or learner text is used. Paths live under mkdtemp (never the real private root).
import { createHmac, randomUUID } from 'node:crypto';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';
import yauzl, { type Entry, type ZipFile } from 'yauzl';
import yazl from 'yazl';
import { openDatabase, schemaVersion, type Db } from '../../apps/server/src/db/connection.ts';
import { ensurePrivateDirs, type PrivatePaths } from '../../apps/server/src/db/paths.ts';
import type { Clock, ProfileInfo, ProfileStore } from '../../apps/server/src/store/types.ts';
import type { TimerHandle, Timers } from '../../apps/server/src/recovery/options.ts';
import { canonicalJson } from '../../apps/server/src/recovery/provenance.ts';

export function tempRoot(prefix = 'sll-rec-'): string {
  // Short base path: macOS limits Unix socket paths to 104 bytes.
  return mkdtempSync(join(tmpdir(), prefix));
}

export class FakeClock implements Clock {
  private t: number;
  constructor(iso: string) {
    this.t = Date.parse(iso);
  }
  now(): Date {
    return new Date(this.t);
  }
  set(iso: string): void {
    this.t = Date.parse(iso);
  }
  advance(ms: number): void {
    this.t += ms;
  }
}

interface ManualTimer {
  readonly due: number;
  readonly fn: () => void;
  cancelled: boolean;
}

/** Deterministic timers driven by the FakeClock (no real waiting, no vi.useFakeTimers against real I/O). */
export class ManualTimers implements Timers {
  private queue: ManualTimer[] = [];
  private readonly clock: FakeClock;
  constructor(clock: FakeClock) {
    this.clock = clock;
  }
  setTimeout(fn: () => void, ms: number): TimerHandle {
    const t: ManualTimer = { due: this.clock.now().getTime() + ms, fn, cancelled: false };
    this.queue.push(t);
    return { cancel: () => (t.cancelled = true) };
  }
  pending(): number {
    return this.queue.filter((t) => !t.cancelled).length;
  }
  nextDue(): number | undefined {
    const live = this.queue.filter((t) => !t.cancelled).map((t) => t.due);
    return live.length ? Math.min(...live) : undefined;
  }
  /** Runs every timer that is due at the current fake time. */
  runDue(): number {
    const now = this.clock.now().getTime();
    const due = this.queue.filter((t) => !t.cancelled && t.due <= now);
    this.queue = this.queue.filter((t) => !due.includes(t) && !t.cancelled);
    for (const t of due) t.fn();
    return due.length;
  }
}

/**
 * Minimal ProfileStore double over a real better-sqlite3 profile opened with openDatabase (real migrations).
 * withWritesPaused waits for an in-flight write (see holdWrites) before running, like the real single writer.
 */
export class TestStore implements ProfileStore {
  readonly paths: PrivatePaths;
  readonly instanceId = randomUUID();
  readonly clock: FakeClock;
  private conn: Db | null;
  private pause: Promise<void> | null = null;
  private inflight: Promise<void> | null = null;
  private maint: { on: boolean; reason?: string } = { on: false };
  private readonly listeners = new Set<(seq: number, kind: string) => void>();
  closeCount = 0;
  reopenCount = 0;

  constructor(root: string, clock: FakeClock) {
    this.paths = ensurePrivateDirs(root);
    this.clock = clock;
    this.conn = openDatabase(this.paths.profileDb);
  }
  db(): Db {
    if (!this.conn) throw new Error('store closed');
    return this.conn;
  }
  profile(): ProfileInfo {
    const r = this.db().prepare('SELECT id, epoch, revision, review_timezone FROM profiles').get() as
      | { id: string; epoch: number; revision: number; review_timezone: string }
      | undefined;
    if (!r) throw new Error('no profile');
    return { id: r.id, epoch: r.epoch, revision: r.revision, reviewTimezone: r.review_timezone, schemaVersion: schemaVersion(this.db()) };
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
    this.pause = new Promise<void>((r) => (release = r));
    try {
      while (this.inflight) await this.inflight;
      return await fn();
    } finally {
      this.pause = null;
      release();
    }
  }
  onCommitted(listener: (seq: number, kind: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  setMaintenance(on: boolean, reason?: string): void {
    this.maint = on ? { on, ...(reason !== undefined ? { reason } : {}) } : { on: false };
  }
  maintenance(): { readonly on: boolean; readonly reason?: string } {
    return this.maint;
  }
  close(): void {
    this.closeCount++;
    if (!this.conn) return;
    this.conn.pragma('wal_checkpoint(TRUNCATE)');
    this.conn.close();
    this.conn = null;
  }
  reopen(): void {
    this.reopenCount++;
    if (this.conn) this.close();
    this.conn = openDatabase(this.paths.profileDb);
  }
  dispose(): void {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
  }
  /** Simulates a long mutation holding the single writer; returns its release. */
  holdWrites(): () => void {
    let release!: () => void;
    this.inflight = new Promise<void>((r) => (release = r));
    return () => {
      this.inflight = null;
      release();
    };
  }
  /** A committed learning change: one event_log row, then onCommitted listeners. */
  async commit(kind = 'draft.save'): Promise<number> {
    await this.writeGate();
    const now = this.clock.now();
    const p = this.profile();
    const info = this.db()
      .prepare(
        'INSERT INTO event_log (occurred_at, local_date, profile_epoch, kind, entity_type, entity_id, schema_version, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(now.toISOString(), now.toISOString().slice(0, 10), p.epoch, kind, 'draft', randomUUID(), p.schemaVersion, '{"synthetic":true}');
    const seq = Number(info.lastInsertRowid);
    for (const l of this.listeners) l(seq, kind);
    return seq;
  }
}

export function seedProfile(store: TestStore, opts: { id?: string; epoch?: number } = {}): string {
  const id = opts.id ?? randomUUID();
  const now = store.clock.now().toISOString();
  store
    .db()
    .prepare("INSERT INTO profiles (id, epoch, review_timezone, created_at, updated_at) VALUES (?, ?, 'Europe/Madrid', ?, ?)")
    .run(id, opts.epoch ?? 1, now, now);
  return id;
}

export const REVIEW_KEY_ID = '0b5f7c3e-5a4e-4d0e-9a51-1c2d3e4f5a6b';
export const REVIEW_KEY = Buffer.from('synthetic-review-hmac-key-for-tests-only-0123456789', 'utf8');

export function signReceipt(fields: Record<string, unknown>, key: Buffer = REVIEW_KEY): Record<string, unknown> {
  const signature = createHmac('sha256', key).update(canonicalJson(fields), 'utf8').digest('hex');
  return { ...fields, signature };
}

export const SECRET_MARKERS = {
  tokenHash: 'a'.repeat(63) + 'f',
  cookieHash: 'b'.repeat(63) + 'e',
  csrf: 'csrf-secret-synthetic-0f1e2d',
};

const hex = (c: string): string => c.repeat(64);

/** Seeds every portable table with synthetic rows, plus credentials that must never be exported. */
export function seedSynthetic(store: TestStore): { taskRev: string; attemptId: string; draftId: string; phraseId: string } {
  const db = store.db();
  const now = store.clock.now().toISOString();
  const day = now.slice(0, 10);
  const receipt = signReceipt({
    id: randomUUID(),
    keyId: REVIEW_KEY_ID,
    jobId: randomUUID(),
    provider: 'synthetic-provider',
    model: 'synthetic-model',
    effort: 'high',
    artifactHash: hex('1'),
    reportHash: hex('2'),
    completedAt: now,
    verifierVersion: '0.0.0-test',
  });
  const taskRev = randomUUID();
  const skillRev = randomUUID();
  const sessionId = randomUUID();
  const contextId = randomUUID();
  const draftId = randomUUID();
  const attemptId = randomUUID();
  const reviewId = randomUUID();
  const phraseId = randomUUID();
  const collectionId = randomUUID();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO content_revisions (revision_id, kind, logical_id, state, sha256, body, origin, provenance, created_at)
       VALUES (?, 'task', 'synthetic.task.participle-hecho', 'ready', ?, ?, 'course', ?, ?)`,
    ).run(taskRev, hex('3'), JSON.stringify({ synthetic: true, unreviewed: true }), JSON.stringify({ receipts: [receipt] }), now);
    db.prepare(
      `INSERT INTO content_revisions (revision_id, kind, logical_id, state, sha256, body, origin, parent_revision_id, created_at)
       VALUES (?, 'skill', 'participle.hecho', 'ready', ?, ?, 'course', NULL, ?)`,
    ).run(skillRev, hex('4'), JSON.stringify({ synthetic: true }), now);
    db.prepare("INSERT INTO active_content (kind, logical_id, revision_id, activated_at) VALUES ('task', 'synthetic.task.participle-hecho', ?, ?)").run(taskRev, now);
    db.prepare(`INSERT INTO skills (skill_id, revision_id, title_uk, modalities, first_lesson) VALUES ('participle.hecho', ?, 'Синтетичний навик', '["written-form"]', 'A2-03-L1')`).run(skillRev);
    db.prepare(`INSERT INTO curriculum_nodes (id, kind, block_id, position, title_uk) VALUES ('A2-03', 'block', NULL, 1, 'Синтетичний блок')`).run();
    db.prepare(
      `INSERT INTO target_states (skill_id, modality, stage, due_date, projection_version, last_event_seq) VALUES ('participle.hecho', 'written-form', 1, ?, 1, 0)`,
    ).run(day);
    db.prepare(`INSERT INTO sessions (id, mode, source, status, seed, started_at) VALUES (?, 'practice', 'recommended', 'active', 'seed-1', ?)`).run(sessionId, now);
    db.prepare(`INSERT INTO lesson_progress (id, lesson_id, status, updated_at) VALUES (?, 'A2-03-L1', 'visited', ?)`).run(randomUUID(), now);
    db.prepare(`INSERT INTO summaries (id, session_id, body, created_at) VALUES (?, ?, '{"synthetic":true}', ?)`).run(randomUUID(), sessionId, now);
    db.prepare(
      `INSERT INTO contexts (id, session_id, task_revision_id, title, mode, last_activity_at, created_at) VALUES (?, ?, ?, 'Синтетичний контекст', 'practice', ?, ?)`,
    ).run(contextId, sessionId, taskRev, now, now);
    db.prepare(`INSERT INTO drafts (id, context_id, task_revision_id, text, saved_at) VALUES (?, ?, ?, 'synthetic private draft', ?)`).run(draftId, contextId, taskRev, now);
    db.prepare(
      `INSERT INTO attempts (id, context_id, draft_id, draft_revision, task_revision_id, response_kind, original_answer, normalized_answer, status, submitted_at, local_date)
       VALUES (?, ?, ?, 1, ?, 'text', 'hecho', 'hecho', 'checked', ?, ?)`,
    ).run(attemptId, contextId, draftId, taskRev, now, day);
    db.prepare(
      `INSERT INTO target_results (attempt_id, skill_id, modality, correctness, independence, explanation_key, eligible) VALUES (?, 'participle.hecho', 'written-form', 'correct', 'independent', 'synthetic.ok', 1)`,
    ).run(attemptId);
    db.prepare(
      `INSERT INTO support_events (id, context_id, attempt_id, task_revision_id, kind, source, delivery, recorded_at, local_date) VALUES (?, ?, ?, ?, 'rule', 'ui', 'delivered', ?, ?)`,
    ).run(randomUUID(), contextId, attemptId, taskRev, now, day);
    db.prepare(`INSERT INTO review_reports (id, attempt_id, content_revision_id, state, report, created_at) VALUES (?, ?, ?, 'validated', ?, ?)`).run(
      reviewId,
      attemptId,
      taskRev,
      JSON.stringify({ synthetic: true, receipt }),
      now,
    );
    db.prepare(`INSERT INTO adjudications (id, attempt_id, review_report_id, verdicts, provenance, created_at) VALUES (?, ?, ?, '[]', ?, ?)`).run(
      randomUUID(),
      attemptId,
      reviewId,
      JSON.stringify({ receipt }),
      now,
    );
    db.prepare(`INSERT INTO learner_preferences (id, targets, frequency, source, created_at) VALUES (?, '[]', 'repeat-more', 'ui', ?)`).run(randomUUID(), now);
    db.prepare(
      `INSERT INTO phrase_records (id, source, spanish, meaning, state, created_by, created_at, updated_at) VALUES (?, 'spanish', 'Lo he hecho', 'Я це зробив', 'draft', 'ui', ?, ?)`,
    ).run(phraseId, now, now);
    db.prepare(`INSERT INTO collections (id, name, origin, created_by, created_at) VALUES (?, 'Синтетична колекція', 'personal', 'ui', ?)`).run(collectionId, now);
    db.prepare(`INSERT INTO collection_members (collection_id, phrase_id, position) VALUES (?, ?, 1)`).run(collectionId, phraseId);
    db.prepare(`INSERT INTO practice_sets (id, targets, task_revision_ids, mode, created_by, created_at) VALUES (?, '[]', ?, 'written', 'ui', ?)`).run(
      randomUUID(),
      JSON.stringify([taskRev]),
      now,
    );
    db.prepare(
      `INSERT INTO mutation_receipts (operation_id, kind, body_digest, principal, profile_epoch, receipt, created_at) VALUES (?, 'draft.save', ?, 'owner', 1, '{"synthetic":true}', ?)`,
    ).run(randomUUID(), hex('5'), now);
    db.prepare(`INSERT INTO auth_tokens (id, label, scopes, token_hash, created_at, expires_at) VALUES (?, 'synthetic agent', '["context:read"]', ?, ?, ?)`).run(
      randomUUID(),
      SECRET_MARKERS.tokenHash,
      now,
      now,
    );
    db.prepare(
      `INSERT INTO owner_sessions (id, cookie_hash, csrf_token, profile_epoch, created_at, last_seen_at, expires_at, absolute_expires_at) VALUES (?, ?, ?, 1, ?, ?, ?, ?)`,
    ).run(randomUUID(), SECRET_MARKERS.cookieHash, SECRET_MARKERS.csrf, now, now, now, now);
  })();
  return { taskRev, attemptId, draftId, phraseId };
}

export function listDir(dir: string): string[] {
  try {
    return readdirSync(dir).sort();
  } catch {
    return [];
  }
}

// ---- ZIP helpers ----

export async function readZip(path: string): Promise<Map<string, Buffer>> {
  const zip = await new Promise<ZipFile>((resolve, reject) =>
    yauzl.open(path, { lazyEntries: true, autoClose: false, decodeStrings: true, validateEntrySizes: true, strictFileNames: true }, (e, z) => (e ? reject(e) : resolve(z))),
  );
  const entries: Entry[] = await new Promise((resolve, reject) => {
    const list: Entry[] = [];
    zip.on('entry', (e: Entry) => {
      list.push(e);
      zip.readEntry();
    });
    zip.on('end', () => resolve(list));
    zip.on('error', reject);
    zip.readEntry();
  });
  const out = new Map<string, Buffer>();
  for (const e of entries) {
    const stream = await new Promise<NodeJS.ReadableStream>((resolve, reject) => zip.openReadStream(e, (err, s) => (err ? reject(err) : resolve(s))));
    const parts: Buffer[] = [];
    for await (const c of stream) parts.push(c as Buffer);
    out.set(e.fileName, Buffer.concat(parts));
  }
  zip.close();
  return out;
}

export async function writeZip(entries: Map<string, Buffer>): Promise<Buffer> {
  const zip = new yazl.ZipFile();
  for (const [name, data] of entries) zip.addBuffer(data, name, { mode: 0o100600 });
  zip.end();
  const parts: Buffer[] = [];
  for await (const c of zip.outputStream) parts.push(c as Buffer);
  return Buffer.concat(parts);
}

export interface RawEntry {
  readonly name: string;
  readonly data: Buffer;
  readonly mode?: number;
  readonly deflate?: boolean;
  /** Override the declared uncompressed size (to lie about it). */
  readonly declaredSize?: number;
}

/** Hand-built ZIP for hostile archives that well-behaved writers refuse to create (traversal, symlinks, lies). */
export function rawZip(entries: readonly RawEntry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const body = e.deflate ? deflateRawSync(e.data) : e.data;
    const crc = crc32(e.data);
    const size = e.declaredSize ?? e.data.length;
    const method = e.deflate ? 8 : 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, body);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(size, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(((e.mode ?? 0o100600) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, cd, eocd]);
}
