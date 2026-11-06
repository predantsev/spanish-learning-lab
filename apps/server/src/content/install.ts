// Privileged content pack installation (DOMAIN-SPEC §Versioned offline installation). Not reachable
// over HTTP. Copy to a staging directory, verify every file hash + manifest, schema-validate every
// entity, check references and ready gates, take a pre-change backup, then switch the active content in
// ONE SQLite transaction. A crash before the switch leaves the previous pack active; prior revisions
// and pack directories are retained (never garbage-collected by age).
import { randomUUID } from 'node:crypto';
import { createReadStream, closeSync, copyFileSync, constants as fsc, existsSync, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, renameSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import type { Db } from '../db/connection.ts';
import type { ProfileStore } from '../store/types.ts';
import type { BackupKind, BackupRecordInfo } from '../recovery/types.ts';
import { localDate, type SchedulerEvent } from '@sll/domain';
import { applySchedulerEvent, invalidatedRevisions } from '../learning/scheduler-store.ts';
import { appendEvent } from '../learning/events.ts';
import { bodyLogicalId, validateContentBody } from './content-schema.ts';
import {
  APP_VERSION,
  CONTENT_SCHEMA_VERSION,
  compareVersions,
  deriveRevisionId,
  deriveStableId,
  ENTITY_KINDS,
  entitySha256,
  isSafeRelativePath,
  lessonOrderKey,
  blockOrderKey,
  looksLikeMpegAudio,
  PACK_ENTITIES,
  PACK_MANIFEST,
  PACK_SCHEMA_VERSION,
  PACK_STATES,
  type EntityKind,
  type PackEntityLine,
  type PackManifest,
  type PackMediaEntry,
} from './pack-format.ts';
import type { CollectionBody, LessonBody, MaterialBody, PhraseBody, SkillBody, TaskBody, ClipBody } from './types.ts';
import { targetKey } from './types.ts';

export class PackInstallError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.code = code;
  }
}

export interface InstallFaults {
  /** Runs inside the activation transaction just before commit (simulates a crash at activation). */
  readonly beforeSwitch?: () => void;
}

export interface InstallOptions {
  readonly allowPreview?: boolean;
  readonly recovery?: { backupNow(kind: BackupKind, reason?: string): Promise<BackupRecordInfo> };
  readonly now?: () => Date;
  readonly faults?: InstallFaults;
  /** Hook for the server: notified with the activation event after commit. */
  readonly onCommitted?: (eventSeq: number, kind: string) => void;
}

export interface InstallResult {
  readonly packId: string;
  readonly version: string;
  readonly manifestSha256: string;
  readonly preview: boolean;
  readonly entities: number;
  readonly media: number;
  readonly eventSeq: number;
  readonly packDir: string;
  readonly outcome: 'activated' | 'unchanged';
}

const MAX_MANIFEST_BYTES = 8 * 1024 * 1024;
const MAX_ENTITIES_BYTES = 512 * 1024 * 1024;
const MAX_FILES = 20000;
const ALLOWED_STATES_READY = new Set(['ready', 'quarantined']);
/** Entity kinds whose content schema carries a reviewStatus (lexemes, situations and sources do not). */
const STATUS_KINDS: ReadonlySet<string> = new Set(['lesson', 'task', 'skill', 'clip', 'phrase', 'collection', 'material']);

function fail(code: string, message: string): never {
  throw new PackInstallError(code, message);
}

function fileSha256(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    createReadStream(path)
      .on('data', (c) => h.update(c))
      .on('error', reject)
      .on('end', () => resolve(h.digest('hex')));
  });
}

function readHead(path: string, n: number): Buffer {
  const fd = openSync(path, 'r');
  try {
    const b = Buffer.alloc(n);
    const read = readSync(fd, b, 0, n, 0);
    return b.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

/** Lists regular files under dir (relative paths); symlinks and special files are rejected. */
function listFiles(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const rel = prefix ? `${prefix}/${name}` : name;
    const st = lstatSync(join(dir, name));
    if (st.isSymbolicLink()) fail('PACK_SYMLINK', `symbolic link in pack: ${rel}`);
    if (st.isDirectory()) out.push(...listFiles(join(dir, name), rel));
    else if (st.isFile()) out.push(rel);
    else fail('PACK_SPECIAL_FILE', `unsupported file type in pack: ${rel}`);
    if (out.length > MAX_FILES) fail('PACK_TOO_MANY_FILES', 'too many files');
  }
  return out;
}

export function validateManifest(raw: unknown): PackManifest {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('MANIFEST_INVALID', 'manifest is not an object');
  const m = raw as Record<string, unknown>;
  if (m.schemaVersion !== PACK_SCHEMA_VERSION) fail('MANIFEST_SCHEMA', `unsupported pack schemaVersion ${String(m.schemaVersion)}`);
  if (typeof m.packId !== 'string' || !/^[a-z0-9][a-z0-9.-]{0,63}$/.test(m.packId)) fail('MANIFEST_INVALID', 'packId');
  if (typeof m.version !== 'string' || !/^[0-9A-Za-z][0-9A-Za-z.+-]{0,39}$/.test(m.version)) fail('MANIFEST_INVALID', 'version');
  if (typeof m.minAppVersion !== 'string' || compareVersions(m.minAppVersion, APP_VERSION) > 0) fail('MANIFEST_APP_VERSION', 'pack needs a newer application');
  if (typeof m.minSchemaVersion !== 'number' || m.minSchemaVersion > CONTENT_SCHEMA_VERSION) fail('MANIFEST_SCHEMA', 'pack needs a newer content schema');
  if (m.language !== 'es-ES' || m.instructionLanguage !== 'uk') fail('MANIFEST_INVALID', 'language/instructionLanguage');
  if (!Array.isArray(m.files) || m.files.length === 0 || m.files.length > MAX_FILES) fail('MANIFEST_INVALID', 'files');
  const seen = new Set<string>();
  for (const f of m.files as unknown[]) {
    const e = f as Record<string, unknown>;
    if (!e || typeof e.path !== 'string' || !isSafeRelativePath(e.path)) fail('MANIFEST_PATH', `unsafe path ${String(e?.path)}`);
    const lower = e.path.toLowerCase();
    if (seen.has(lower)) fail('MANIFEST_PATH', `duplicate path ${e.path}`);
    seen.add(lower);
    if (e.path === PACK_MANIFEST) fail('MANIFEST_PATH', 'manifest cannot list itself');
    if (typeof e.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(e.sha256)) fail('MANIFEST_INVALID', `sha256 of ${e.path}`);
    if (typeof e.bytes !== 'number' || !Number.isInteger(e.bytes) || e.bytes < 0) fail('MANIFEST_INVALID', `bytes of ${e.path}`);
  }
  if (!seen.has(PACK_ENTITIES)) fail('MANIFEST_INVALID', 'entities.ndjson not listed');
  if (m.preview !== undefined && typeof m.preview !== 'boolean') fail('MANIFEST_INVALID', 'preview');
  if (m.media !== undefined) {
    if (!Array.isArray(m.media)) fail('MANIFEST_INVALID', 'media');
    for (const x of m.media as unknown[]) {
      const e = x as Record<string, unknown>;
      if (!e || typeof e.clipId !== 'string' || typeof e.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(e.sha256)) fail('MANIFEST_INVALID', 'media entry');
      if (e.mime !== 'audio/mpeg') fail('MEDIA_MIME', `unsupported media type for ${e.clipId}`);
      if (typeof e.bytes !== 'number' || e.bytes <= 0) fail('MANIFEST_INVALID', 'media bytes');
    }
  }
  if (m.blocks !== undefined) {
    if (!Array.isArray(m.blocks)) fail('MANIFEST_INVALID', 'blocks');
    for (const x of m.blocks as unknown[]) {
      const b = x as Record<string, unknown>;
      if (!b || typeof b.id !== 'string' || !/^A[12]-0[1-8]$/.test(b.id) || typeof b.titleUk !== 'string' || b.titleUk.length === 0 || b.titleUk.length > 160)
        fail('MANIFEST_INVALID', 'block title');
    }
  }
  return m as unknown as PackManifest;
}

function parseEntities(path: string): PackEntityLine[] {
  const st = lstatSync(path);
  if (st.size > MAX_ENTITIES_BYTES) fail('PACK_TOO_LARGE', 'entities.ndjson too large');
  const text = readFileSync(path, 'utf8');
  const out: PackEntityLine[] = [];
  const keys = new Set<string>();
  let lineNo = 0;
  for (const line of text.split('\n')) {
    lineNo++;
    if (line.trim() === '') continue;
    let e: Record<string, unknown>;
    try {
      e = JSON.parse(line) as Record<string, unknown>;
    } catch {
      fail('ENTITY_JSON', `line ${lineNo} is not JSON`);
    }
    const kind = e.kind as EntityKind;
    if (!(ENTITY_KINDS as readonly string[]).includes(kind)) fail('ENTITY_KIND', `line ${lineNo}: unknown kind`);
    if (typeof e.logicalId !== 'string' || e.logicalId.length === 0 || e.logicalId.length > 150) fail('ENTITY_INVALID', `line ${lineNo}: logicalId`);
    if (!(PACK_STATES as readonly string[]).includes(e.state as string)) fail('ENTITY_INVALID', `line ${lineNo}: state`);
    if (!e.body || typeof e.body !== 'object' || Array.isArray(e.body)) fail('ENTITY_INVALID', `line ${lineNo}: body`);
    const body = e.body as Record<string, unknown>;
    // tools/content/pack.ts strips reviewStatus from packed bodies (hash/revisionId bind to the
    // content, the review state travels in `state`); re-attach it only for schema validation.
    const v = validateContentBody(kind, STATUS_KINDS.has(kind) && !('reviewStatus' in body) ? { ...body, reviewStatus: e.state } : body);
    if (!v.ok) fail('ENTITY_SCHEMA', `${kind} ${e.logicalId}: ${v.message}`);
    if (bodyLogicalId(kind, body) !== e.logicalId) fail('ENTITY_INVALID', `${kind} ${e.logicalId}: body id differs from logicalId`);
    if ('reviewStatus' in body && body.reviewStatus !== e.state) fail('ENTITY_INVALID', `${kind} ${e.logicalId}: state differs from reviewStatus`);
    if (e.sha256 !== entitySha256(body)) fail('ENTITY_HASH', `${kind} ${e.logicalId}: sha256 mismatch`);
    if (e.revisionId !== deriveRevisionId(kind, e.logicalId, body)) fail('ENTITY_REVISION', `${kind} ${e.logicalId}: revisionId mismatch`);
    const key = `${kind}|${e.logicalId}`;
    if (keys.has(key)) fail('ENTITY_DUPLICATE', key);
    keys.add(key);
    out.push(e as unknown as PackEntityLine);
  }
  return out;
}

interface Index {
  readonly byKind: Map<EntityKind, Map<string, PackEntityLine>>;
}

function indexEntities(entities: readonly PackEntityLine[]): Index {
  const byKind = new Map<EntityKind, Map<string, PackEntityLine>>();
  for (const k of ENTITY_KINDS) byKind.set(k, new Map());
  for (const e of entities) byKind.get(e.kind)!.set(e.logicalId, e);
  return { byKind };
}

function checkReferences(ix: Index, manifest: PackManifest, mediaByClip: Map<string, PackMediaEntry>): void {
  const has = (k: EntityKind, id: string): boolean => ix.byKind.get(k)!.has(id);
  const lessonIds = new Set(ix.byKind.get('lesson')!.keys());
  const blockIds = new Set([...ix.byKind.get('lesson')!.values()].map((l) => (l.body as unknown as LessonBody).blockId));
  const preview = manifest.preview === true;
  for (const e of ix.byKind.get('skill')!.values()) {
    const s = e.body as unknown as SkillBody;
    if (!lessonIds.has(s.firstLesson)) fail('REFERENCE', `skill ${s.skillId} firstLesson ${s.firstLesson}`);
    for (const p of s.prerequisites) if (!has('skill', p)) fail('REFERENCE', `skill ${s.skillId} prerequisite ${p}`);
  }
  for (const e of ix.byKind.get('task')!.values()) {
    const t = e.body as unknown as TaskBody;
    if (!lessonIds.has(t.lessonId)) fail('REFERENCE', `task ${t.id} lesson ${t.lessonId}`);
    const keys = new Set(t.targets.map(targetKey));
    for (const tg of t.targets) if (!has('skill', tg.skillId)) fail('REFERENCE', `task ${t.id} skill ${tg.skillId}`);
    for (const c of t.clipIds ?? []) if (!has('clip', c)) fail('REFERENCE', `task ${t.id} clip ${c}`);
    const outcomeKeys = [...(t.options ?? []).flatMap((o) => Object.keys(o.outcomes)), ...(t.errors ?? []).flatMap((x) => Object.keys(x.outcomes)), ...(t.slots ?? []).map((s) => s.target), ...(t.hints ?? []).flatMap((h) => h.targets)];
    for (const k of outcomeKeys) if (!keys.has(k)) fail('REFERENCE', `task ${t.id} outcome/hint target ${k} is not a task target`);
    if (t.mode === 'choice' && (!t.options || t.options.length < 2)) fail('REFERENCE', `task ${t.id} choice without options`);
    if (t.mode === 'exact-variants' && (!t.accepted || t.accepted.length === 0)) fail('REFERENCE', `task ${t.id} without accepted variants`);
    if (t.mode === 'finite-slots') {
      const tpl = t.template ?? [];
      for (let i = 1; i < tpl.length; i++) if (typeof tpl[i] !== 'string' && typeof tpl[i - 1] !== 'string') fail('REFERENCE', `task ${t.id} adjacent slots`);
    }
  }
  for (const e of ix.byKind.get('lesson')!.values()) {
    const l = e.body as unknown as LessonBody;
    for (const s of [...l.introduces, ...l.revisits]) if (!has('skill', s)) fail('REFERENCE', `lesson ${l.id} skill ${s}`);
    for (const st of l.steps) {
      for (const t of st.taskIds ?? []) if (!has('task', t)) fail('REFERENCE', `lesson ${l.id} task ${t}`);
      for (const c of st.clipIds ?? []) if (!has('clip', c)) fail('REFERENCE', `lesson ${l.id} clip ${c}`);
    }
  }
  for (const e of ix.byKind.get('clip')!.values()) {
    const c = e.body as unknown as ClipBody;
    if (!lessonIds.has(c.lessonId)) fail('REFERENCE', `clip ${c.id} lesson ${c.lessonId}`);
    if (!mediaByClip.has(c.id) && !preview && e.state !== 'quarantined') fail('MISSING_MEDIA', `clip ${c.id} has no installed media`);
  }
  for (const e of ix.byKind.get('phrase')!.values()) {
    const p = e.body as unknown as PhraseBody;
    for (const s of p.skills) if (!has('skill', s)) fail('REFERENCE', `phrase ${p.id} skill ${s}`);
    for (const t of p.variationTaskIds ?? []) if (!has('task', t)) fail('REFERENCE', `phrase ${p.id} task ${t}`);
    for (const c of p.clipIds ?? []) if (!has('clip', c)) fail('REFERENCE', `phrase ${p.id} clip ${c}`);
  }
  for (const e of ix.byKind.get('collection')!.values()) {
    const c = e.body as unknown as CollectionBody;
    for (const p of c.phraseIds) if (!has('phrase', p)) fail('REFERENCE', `collection ${c.id} phrase ${p}`);
  }
  for (const e of ix.byKind.get('material')!.values()) {
    const m = e.body as unknown as MaterialBody;
    if (!lessonIds.has(m.topicId) && !blockIds.has(m.topicId)) fail('REFERENCE', `material ${m.id} topic ${m.topicId}`);
    for (const k of m.linkedTargets) if (!has('skill', k.slice(0, k.lastIndexOf('/')))) fail('REFERENCE', `material ${m.id} target ${k}`);
  }
  for (const media of mediaByClip.values()) if (!has('clip', media.clipId)) fail('REFERENCE', `media for unknown clip ${media.clipId}`);
  if (!preview) {
    for (const e of [...ix.byKind.values()].flatMap((m) => [...m.values()])) {
      if (!ALLOWED_STATES_READY.has(e.state)) fail('NOT_READY', `${e.kind} ${e.logicalId} is ${e.state}; use --allow-preview for a preview pack`);
    }
  }
}

/** Removes leftovers of interrupted installs (never a retained pack directory). */
function cleanupStaging(packsDir: string): void {
  if (!existsSync(packsDir)) return;
  for (const name of readdirSync(packsDir)) if (name.startsWith('.staging-')) rmSync(join(packsDir, name), { recursive: true, force: true });
}

export async function installPack(store: ProfileStore, sourceDir: string, options: InstallOptions = {}): Promise<InstallResult> {
  const now = options.now ?? (() => store.clock.now());
  const paths = store.paths;
  const srcManifest = join(sourceDir, PACK_MANIFEST);
  if (!existsSync(srcManifest)) fail('MANIFEST_MISSING', 'pack.json not found');
  const mst = lstatSync(srcManifest);
  if (!mst.isFile() || mst.isSymbolicLink()) fail('MANIFEST_INVALID', 'pack.json is not a regular file');
  if (mst.size > MAX_MANIFEST_BYTES) fail('MANIFEST_INVALID', 'pack.json too large');
  const manifestBytes = readFileSync(srcManifest);
  const manifestSha256 = createHash('sha256').update(manifestBytes).digest('hex');
  let manifestRaw: unknown;
  try {
    manifestRaw = JSON.parse(manifestBytes.toString('utf8'));
  } catch {
    fail('MANIFEST_INVALID', 'pack.json is not JSON');
  }
  const manifest = validateManifest(manifestRaw);
  const preview = manifest.preview === true;
  if (preview && options.allowPreview !== true) fail('PREVIEW_NOT_ALLOWED', 'preview pack requires --allow-preview');

  // Already the active pack with this exact manifest: nothing to do.
  const active = store
    .db()
    .prepare("SELECT manifest_sha256 FROM packs WHERE pack_id = ? AND version = ? AND state = 'active'")
    .get(manifest.packId, manifest.version) as { manifest_sha256: string } | undefined;
  if (active && active.manifest_sha256 === manifestSha256) {
    return { packId: manifest.packId, version: manifest.version, manifestSha256, preview, entities: 0, media: 0, eventSeq: store.lastEventSeq(), packDir: '', outcome: 'unchanged' };
  }
  const known = store.db().prepare('SELECT manifest_sha256 FROM packs WHERE pack_id = ? AND version = ?').get(manifest.packId, manifest.version) as { manifest_sha256: string } | undefined;
  if (known && known.manifest_sha256 !== manifestSha256) fail('VERSION_CONFLICT', 'a different pack with this id/version was installed before');

  // Exact file set: every file except pack.json must be listed, every listed file must exist.
  const listed = new Map(manifest.files.map((f) => [f.path, f]));
  const present = listFiles(sourceDir).filter((p) => p !== PACK_MANIFEST);
  for (const p of present) if (!listed.has(p)) fail('UNLISTED_FILE', `file not in manifest: ${p}`);
  for (const p of listed.keys()) if (!present.includes(p)) fail('MISSING_FILE', `listed file missing: ${p}`);

  mkdirSync(paths.packs, { recursive: true, mode: 0o700 });
  cleanupStaging(paths.packs);
  // Installed packs live at packs/<packId>/<version> (the recovery module's resolvePackDir default);
  // (packId, version) identifies one manifest (VERSION_CONFLICT above).
  const finalDir = join(paths.packs, manifest.packId, manifest.version);
  const staging = join(paths.packs, `.staging-${randomUUID()}`);
  let packDir = finalDir;
  if (existsSync(finalDir) && !known) {
    // Left by an install that crashed before its activation committed: verify it is the same manifest, else replace it.
    const leftover = join(finalDir, PACK_MANIFEST);
    const sameManifest = existsSync(leftover) && createHash('sha256').update(readFileSync(leftover)).digest('hex') === manifestSha256;
    if (!sameManifest) rmSync(finalDir, { recursive: true, force: true });
  }
  const finalExists = existsSync(finalDir);
  const workDir = finalExists ? finalDir : staging;
  try {
    if (!finalExists) {
      mkdirSync(staging, { mode: 0o700 });
      copyFileSync(srcManifest, join(staging, PACK_MANIFEST), fsc.COPYFILE_EXCL);
      for (const f of manifest.files) {
        const dest = join(staging, f.path);
        mkdirSync(join(dest, '..'), { recursive: true, mode: 0o700 });
        copyFileSync(join(sourceDir, f.path), dest, fsc.COPYFILE_EXCL);
      }
    }
    // Verify the staged copy (never the source) against the manifest.
    for (const f of manifest.files) {
      const p = join(workDir, f.path);
      if (!existsSync(p) || lstatSync(p).isSymbolicLink()) fail('MISSING_FILE', f.path);
      if (lstatSync(p).size !== f.bytes) fail('SIZE_MISMATCH', f.path);
      if ((await fileSha256(p)) !== f.sha256) fail('HASH_MISMATCH', f.path);
    }
    const mediaByClip = new Map<string, PackMediaEntry>();
    for (const m of manifest.media ?? []) {
      const path = `media/${m.sha256}.mp3`;
      const f = listed.get(path);
      if (!f || f.sha256 !== m.sha256 || f.bytes !== m.bytes) fail('MEDIA_MISMATCH', `media ${m.clipId} not listed with matching hash/size`);
      if (!looksLikeMpegAudio(readHead(join(workDir, path), 4))) fail('MEDIA_MIME', `media ${m.clipId} is not MPEG audio`);
      if (mediaByClip.has(m.clipId)) fail('MEDIA_MISMATCH', `duplicate media for ${m.clipId}`);
      mediaByClip.set(m.clipId, m);
    }
    const entities = parseEntities(join(workDir, PACK_ENTITIES));
    const ix = indexEntities(entities);
    checkReferences(ix, manifest, mediaByClip);

    // Pre-change snapshot before the switch; a failed backup blocks activation.
    if (options.recovery) {
      try {
        await options.recovery.backupNow('pre-change', 'content-activation');
      } catch {
        fail('BACKUP_FAILED', 'pre-change backup failed; previous pack stays active');
      }
    }
    if (!finalExists) {
      mkdirSync(join(paths.packs, manifest.packId), { recursive: true, mode: 0o700 });
      renameSync(staging, finalDir);
    }
    packDir = finalDir;

    await store.writeGate();
    if (store.maintenance().on) fail('MAINTENANCE', 'profile is in maintenance mode');
    const db = store.db();
    const at = now();
    const eventSeq = db.transaction(() => activate(db, store, { manifest, manifestSha256, entities, ix, mediaByClip, packDir, at, assetsRoot: paths.assets }, options.faults))();
    options.onCommitted?.(eventSeq, 'content.activated');
    const notify = (store as unknown as { notifyCommitted?: (s: number, k: string) => void }).notifyCommitted;
    if (typeof notify === 'function') notify.call(store, eventSeq, 'content.activated');
    return { packId: manifest.packId, version: manifest.version, manifestSha256, preview, entities: entities.length, media: mediaByClip.size, eventSeq, packDir, outcome: 'activated' };
  } finally {
    if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
  }
}

interface ActivationInput {
  readonly manifest: PackManifest;
  readonly manifestSha256: string;
  readonly entities: readonly PackEntityLine[];
  readonly ix: Index;
  readonly mediaByClip: Map<string, PackMediaEntry>;
  readonly packDir: string;
  readonly at: Date;
  readonly assetsRoot: string;
}

function activate(db: Db, store: ProfileStore, a: ActivationInput, faults?: InstallFaults): number {
  const t = a.at.toISOString();
  const { manifest } = a;
  const profile = store.profile();
  db.prepare("UPDATE packs SET state = 'retained' WHERE state = 'active'").run();
  db.prepare(
    `INSERT INTO packs (pack_id, version, manifest_sha256, manifest, state, preview, installed_at, activated_at) VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
     ON CONFLICT(pack_id, version) DO UPDATE SET state = 'active', activated_at = excluded.activated_at`,
  ).run(manifest.packId, manifest.version, a.manifestSha256, JSON.stringify(manifest), manifest.preview === true ? 1 : 0, t, t);

  const insertRev = db.prepare(
    `INSERT INTO content_revisions (revision_id, kind, logical_id, state, sha256, body, origin, parent_revision_id, pack_id, provenance, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'course', NULL, ?, ?, ?) ON CONFLICT(revision_id) DO NOTHING`,
  );
  const existingBySha = db.prepare('SELECT revision_id FROM content_revisions WHERE kind = ? AND logical_id = ? AND sha256 = ?');
  const updateState = db.prepare('UPDATE content_revisions SET state = ? WHERE revision_id = ? AND state != ?');
  for (const e of a.entities) {
    const prev = existingBySha.get(e.kind, e.logicalId, e.sha256) as { revision_id: string } | undefined;
    if (prev && prev.revision_id !== e.revisionId) fail('REVISION_CONFLICT', `${e.kind} ${e.logicalId} has a different revision id for identical content`);
    insertRev.run(e.revisionId, e.kind, e.logicalId, e.state, e.sha256, JSON.stringify(e.body), manifest.packId, JSON.stringify({ packVersion: manifest.version, manifestSha256: a.manifestSha256 }), t);
    // A review-state change (e.g. ready → quarantined) keeps the content hash and revision id:
    // the revision row is the same, only its state moves.
    updateState.run(e.state, e.revisionId, e.state);
  }

  // Switch the active course pointer: course logical ids not in the new pack become inactive (revisions kept).
  db.prepare("DELETE FROM active_content WHERE revision_id IN (SELECT revision_id FROM content_revisions WHERE origin = 'course')").run();
  const insertActive = db.prepare('INSERT INTO active_content (kind, logical_id, revision_id, activated_at) VALUES (?, ?, ?, ?) ON CONFLICT(kind, logical_id) DO UPDATE SET revision_id = excluded.revision_id, activated_at = excluded.activated_at');
  for (const e of a.entities) insertActive.run(e.kind, e.logicalId, e.revisionId, t);

  const insertAsset = db.prepare(
    `INSERT INTO assets (sha256, mime, bytes, rel_path, duration_ms, clip_logical_id, rights, created_at) VALUES (?, 'audio/mpeg', ?, ?, ?, ?, ?, ?)
     ON CONFLICT(sha256) DO UPDATE SET clip_logical_id = excluded.clip_logical_id`,
  );
  for (const m of a.mediaByClip.values()) {
    const rel = relative(a.assetsRoot, join(a.packDir, 'media', `${m.sha256}.mp3`));
    insertAsset.run(m.sha256, m.bytes, rel, m.durationMs ?? null, m.clipId, JSON.stringify({ rights: m.rights ?? {}, receiptIds: m.receiptIds ?? [] }), t);
  }

  const upsertSkill = db.prepare(
    `INSERT INTO skills (skill_id, revision_id, title_uk, modalities, first_lesson) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(skill_id) DO UPDATE SET revision_id = excluded.revision_id, title_uk = excluded.title_uk, modalities = excluded.modalities, first_lesson = excluded.first_lesson`,
  );
  for (const e of a.ix.byKind.get('skill')!.values()) {
    const s = e.body as unknown as SkillBody;
    upsertSkill.run(s.skillId, e.revisionId, s.titleUk, JSON.stringify(s.modalities), s.firstLesson);
  }

  const upsertNode = db.prepare(
    `INSERT INTO curriculum_nodes (id, kind, block_id, position, title_uk, pack_id) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, block_id = excluded.block_id, position = excluded.position, title_uk = excluded.title_uk, pack_id = excluded.pack_id`,
  );
  const blockTitles = new Map((manifest.blocks ?? []).map((b) => [b.id, b.titleUk]));
  const lessons = [...a.ix.byKind.get('lesson')!.values()].map((e) => e.body as unknown as LessonBody);
  for (const blockId of new Set(lessons.map((l) => l.blockId))) {
    upsertNode.run(blockId, 'block', blockId, blockOrderKey(blockId), blockTitles.get(blockId) ?? blockId, manifest.packId);
  }
  for (const l of lessons) upsertNode.run(l.id, l.kind, l.blockId, lessonOrderKey(l.id), l.titleUk, manifest.packId);

  // Shared course phrase identities and the prepared collections (stable profile-side ids).
  const upsertPhrase = db.prepare(
    `INSERT INTO phrase_records (id, revision, source, course_revision_id, course_logical_id, spanish, meaning, state, archived, priority, created_by, created_at, updated_at)
     VALUES (?, 1, 'course', ?, ?, ?, ?, ?, 0, 0, 'course', ?, ?)
     ON CONFLICT(id) DO UPDATE SET course_revision_id = excluded.course_revision_id, spanish = excluded.spanish, meaning = excluded.meaning, state = excluded.state,
       revision = CASE WHEN phrase_records.course_revision_id = excluded.course_revision_id THEN phrase_records.revision ELSE phrase_records.revision + 1 END,
       updated_at = CASE WHEN phrase_records.course_revision_id = excluded.course_revision_id THEN phrase_records.updated_at ELSE excluded.updated_at END`,
  );
  for (const e of a.ix.byKind.get('phrase')!.values()) {
    const p = e.body as unknown as PhraseBody;
    upsertPhrase.run(deriveStableId('phrase-record', p.id), e.revisionId, p.id, p.spanish, p.ukrainian, e.state, t, t);
  }
  const upsertCollection = db.prepare(
    `INSERT INTO collections (id, revision, name, origin, course_logical_id, archived, created_by, created_at) VALUES (?, 1, ?, 'course', ?, 0, 'course', ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
  );
  for (const e of a.ix.byKind.get('collection')!.values()) {
    const c = e.body as unknown as CollectionBody;
    const cid = deriveStableId('collection', c.id);
    upsertCollection.run(cid, c.titleUk, c.id, t);
    db.prepare('DELETE FROM collection_members WHERE collection_id = ?').run(cid);
    const ins = db.prepare('INSERT INTO collection_members (collection_id, phrase_id, position) VALUES (?, ?, ?)');
    c.phraseIds.forEach((pid, i) => ins.run(cid, deriveStableId('phrase-record', pid), i));
  }

  const day = localDate(a.at.toISOString(), profile.reviewTimezone);
  // Quarantine: evidence of a disputed item (this revision and earlier revisions of the same logical
  // task that have attempts) is excluded from the projections; history stays readable.
  const already = invalidatedRevisions(db);
  for (const e of a.ix.byKind.get('task')!.values()) {
    if (e.state !== 'quarantined') continue;
    const older = (db.prepare("SELECT DISTINCT a.task_revision_id AS id FROM attempts a JOIN content_revisions cr ON cr.revision_id = a.task_revision_id WHERE cr.kind = 'task' AND cr.logical_id = ?").all(e.logicalId) as Array<{ id: string }>).map((r) => r.id);
    for (const rev of new Set([e.revisionId, ...older])) {
      if (already.has(rev)) continue;
      const pending = { kind: 'item-invalidated' as const, taskRevisionId: rev };
      const s = appendEvent(db, { kind: 'content.item-invalidated', entityType: 'task', entityId: rev, at: a.at, localDate: day, epoch: profile.epoch, payload: { logicalId: e.logicalId, scheduler: pending } });
      applySchedulerEvent(db, { ...pending, eventSeq: s, at: a.at.toISOString() } as SchedulerEvent);
    }
  }
  const seq = appendEvent(db, {
    kind: 'content.activated',
    entityType: 'pack',
    entityId: `${manifest.packId}@${manifest.version}`,
    at: a.at,
    localDate: day,
    epoch: profile.epoch,
    payload: { packId: manifest.packId, version: manifest.version, manifestSha256: a.manifestSha256, preview: manifest.preview === true },
  });
  faults?.beforeSwitch?.();
  return seq;
}
