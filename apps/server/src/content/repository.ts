// Read access to installed content (content_revisions/active_content/assets/skills/packs).
// Revision bodies are immutable, so parsed bodies are cached by revision id across connections.
import type { Db } from '../db/connection.ts';
import { blockOrderKey, lessonOrderKey } from './pack-format.ts';
import type { ClipBody, ContentState, LessonBody, MaterialBody, PhraseBody, SkillBody, TaskBody } from './types.ts';

export interface RevisionRow<T = Record<string, unknown>> {
  readonly revisionId: string;
  readonly kind: string;
  readonly logicalId: string;
  readonly state: ContentState;
  readonly sha256: string;
  readonly origin: 'course' | 'personal' | 'agent';
  readonly parentRevisionId: string | null;
  readonly packId: string | null;
  readonly createdAt: string;
  readonly body: T;
}

interface RawRevision {
  revision_id: string;
  kind: string;
  logical_id: string;
  state: ContentState;
  sha256: string;
  origin: 'course' | 'personal' | 'agent';
  parent_revision_id: string | null;
  pack_id: string | null;
  created_at: string;
  body: string;
}

export interface ActivePack {
  readonly packId: string;
  readonly version: string;
  readonly manifestSha256: string;
  readonly preview: boolean;
  readonly activatedAt: string | null;
}

const bodyCache = new Map<string, unknown>();
const BODY_CACHE_MAX = 20000;

function toRow<T>(r: RawRevision): RevisionRow<T> {
  let body = bodyCache.get(r.revision_id) as T | undefined;
  if (body === undefined) {
    body = JSON.parse(r.body) as T;
    if (bodyCache.size >= BODY_CACHE_MAX) bodyCache.clear();
    bodyCache.set(r.revision_id, body);
  }
  return {
    revisionId: r.revision_id,
    kind: r.kind,
    logicalId: r.logical_id,
    state: r.state,
    sha256: r.sha256,
    origin: r.origin,
    parentRevisionId: r.parent_revision_id,
    packId: r.pack_id,
    createdAt: r.created_at,
    body,
  };
}

const COLS = 'cr.revision_id, cr.kind, cr.logical_id, cr.state, cr.sha256, cr.origin, cr.parent_revision_id, cr.pack_id, cr.created_at, cr.body';

export class ContentRepository {
  readonly db: Db;
  constructor(db: Db) {
    this.db = db;
  }

  activePack(): ActivePack | undefined {
    const r = this.db
      .prepare("SELECT pack_id, version, manifest_sha256, preview, activated_at FROM packs WHERE state = 'active' ORDER BY activated_at DESC LIMIT 1")
      .get() as { pack_id: string; version: string; manifest_sha256: string; preview: number; activated_at: string | null } | undefined;
    if (!r) return undefined;
    return { packId: r.pack_id, version: r.version, manifestSha256: r.manifest_sha256, preview: r.preview === 1, activatedAt: r.activated_at };
  }

  /** Content usable for practice: ready, or any non-terminal state when the active pack is an explicit preview. */
  isUsable(state: ContentState): boolean {
    if (state === 'ready') return true;
    if (state === 'quarantined' || state === 'retired') return false;
    return this.activePack()?.preview === true;
  }

  byRevision<T = Record<string, unknown>>(revisionId: string): RevisionRow<T> | undefined {
    const r = this.db.prepare(`SELECT ${COLS} FROM content_revisions cr WHERE cr.revision_id = ?`).get(revisionId) as RawRevision | undefined;
    return r ? toRow<T>(r) : undefined;
  }

  active<T = Record<string, unknown>>(kind: string, logicalId: string): RevisionRow<T> | undefined {
    const r = this.db
      .prepare(`SELECT ${COLS} FROM active_content ac JOIN content_revisions cr ON cr.revision_id = ac.revision_id WHERE ac.kind = ? AND ac.logical_id = ?`)
      .get(kind, logicalId) as RawRevision | undefined;
    return r ? toRow<T>(r) : undefined;
  }

  listActive<T = Record<string, unknown>>(kind: string): Array<RevisionRow<T>> {
    const rows = this.db
      .prepare(`SELECT ${COLS} FROM active_content ac JOIN content_revisions cr ON cr.revision_id = ac.revision_id WHERE ac.kind = ?`)
      .all(kind) as RawRevision[];
    return rows.map((r) => toRow<T>(r));
  }

  /** Revisions of one logical entity, oldest first (course and personal/agent drafts). */
  revisionsOf<T = Record<string, unknown>>(kind: string, logicalId: string): Array<RevisionRow<T>> {
    const rows = this.db
      .prepare(`SELECT ${COLS} FROM content_revisions cr WHERE cr.kind = ? AND cr.logical_id = ? ORDER BY cr.created_at, cr.rowid`)
      .all(kind, logicalId) as RawRevision[];
    return rows.map((r) => toRow<T>(r));
  }

  /** 1-based ordinal of a revision among the revisions of its logical entity (Content/TaskView `revision`). */
  revisionOrdinal(kind: string, logicalId: string, revisionId: string): number {
    const rows = this.db
      .prepare('SELECT revision_id FROM content_revisions WHERE kind = ? AND logical_id = ? ORDER BY created_at, rowid')
      .all(kind, logicalId) as Array<{ revision_id: string }>;
    const i = rows.findIndex((r) => r.revision_id === revisionId);
    return i < 0 ? 1 : i + 1;
  }

  lessons(): Array<RevisionRow<LessonBody>> {
    return this.listActive<LessonBody>('lesson').sort((a, b) => lessonOrderKey(a.logicalId) - lessonOrderKey(b.logicalId));
  }

  lesson(lessonId: string): RevisionRow<LessonBody> | undefined {
    return this.active<LessonBody>('lesson', lessonId);
  }

  task(taskLogicalId: string): RevisionRow<TaskBody> | undefined {
    return this.active<TaskBody>('task', taskLogicalId);
  }

  tasks(): Array<RevisionRow<TaskBody>> {
    return this.listActive<TaskBody>('task');
  }

  skills(): Array<RevisionRow<SkillBody>> {
    return this.listActive<SkillBody>('skill');
  }

  skill(skillId: string): RevisionRow<SkillBody> | undefined {
    return this.active<SkillBody>('skill', skillId);
  }

  clip(clipId: string): RevisionRow<ClipBody> | undefined {
    return this.active<ClipBody>('clip', clipId);
  }

  materials(): Array<RevisionRow<MaterialBody>> {
    return this.listActive<MaterialBody>('material');
  }

  phrase(phraseId: string): RevisionRow<PhraseBody> | undefined {
    return this.active<PhraseBody>('phrase', phraseId);
  }

  /** Installed asset hash for a clip, if its media file was installed. */
  clipAssetHash(clipId: string): string | undefined {
    const r = this.db.prepare('SELECT sha256 FROM assets WHERE clip_logical_id = ? ORDER BY created_at DESC LIMIT 1').get(clipId) as { sha256: string } | undefined;
    return r?.sha256;
  }

  asset(sha256: string): { sha256: string; mime: string; bytes: number; relPath: string } | undefined {
    const r = this.db.prepare('SELECT sha256, mime, bytes, rel_path FROM assets WHERE sha256 = ?').get(sha256) as
      | { sha256: string; mime: string; bytes: number; rel_path: string }
      | undefined;
    return r ? { sha256: r.sha256, mime: r.mime, bytes: r.bytes, relPath: r.rel_path } : undefined;
  }

  blockTitle(blockId: string): string {
    const r = this.db.prepare("SELECT title_uk FROM curriculum_nodes WHERE id = ? AND kind = 'block'").get(blockId) as { title_uk: string } | undefined;
    return r?.title_uk && r.title_uk.length > 0 ? r.title_uk : blockId;
  }

  blocks(): string[] {
    const ids = new Set(this.lessons().map((l) => l.body.blockId));
    return [...ids].sort((a, b) => blockOrderKey(a) - blockOrderKey(b));
  }

  /** Audio hashes for a task's clips (installed assets only, in clip order). */
  taskAudioHashes(task: TaskBody): string[] {
    const out: string[] = [];
    for (const clipId of task.clipIds ?? []) {
      const h = this.clipAssetHash(clipId);
      if (h) out.push(h);
    }
    return out;
  }

  /** Catalog revision: event sequence of the latest content activation (0 before any install). */
  catalogRevision(): number {
    const r = this.db.prepare("SELECT max(event_seq) AS s FROM event_log WHERE kind = 'content.activated'").get() as { s: number | null };
    return r.s ?? 0;
  }
}
