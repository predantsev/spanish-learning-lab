// practice.create, phrase.capture, material.draft, collection.create, collection.patch, review.submit
import type { Payload_collection_create, Payload_collection_patch, Payload_material_draft, Payload_phrase_capture, Payload_practice_create, Payload_review_submit } from '@sll/contracts';
import { entitySha256, sha256Hex } from '../../content/pack-format.ts';
import { conflict, notFound, unprocessable } from '../../http/errors.ts';
import { LISTENING_MODALITIES, targetKey, type MaterialBody, type PhraseBody, type TaskBody } from '../../content/types.ts';
import type { RevisionRow } from '../../content/repository.ts';
import { checkBlocks, MATERIAL_MAX_CHARS, ref, requireRevision, type CommandEnv, type CommandResult } from '../env.ts';

function createdBy(env: CommandEnv): 'ui' | 'agent' {
  return env.principal.kind === 'agent' ? 'agent' : 'ui';
}

function revisionIn(env: CommandEnv, table: string, id: string): number {
  const r = env.db.prepare(`SELECT revision FROM ${table} WHERE id = ?`).get(id) as { revision: number } | undefined;
  return r?.revision ?? 0;
}

function requireNew(env: CommandEnv, table: string): void {
  requireRevision(revisionIn(env, table, env.cmd.subjectId), env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
}

function isListeningTask(t: TaskBody): boolean {
  return (t.clipIds?.length ?? 0) > 0 || t.targets.some((x) => LISTENING_MODALITIES.has(x.modality));
}

/** Only installed reviewed items within the requested scope; never a generated key. */
export function practiceCreate(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_practice_create;
  requireNew(env, 'practice_sets');
  const keys = new Set(p.targets.map(targetKey));
  for (const t of p.targets) if (!env.repo.skill(t.skillId)?.body.modalities.includes(t.modality)) throw unprocessable('UNKNOWN_TARGET');
  const phraseTaskIds = new Set<string>();
  for (const pid of p.phraseIds) {
    const ph = env.db.prepare('SELECT state, archived, course_logical_id FROM phrase_records WHERE id = ?').get(pid) as { state: string; archived: number; course_logical_id: string | null } | undefined;
    if (!ph) throw unprocessable('UNKNOWN_PHRASE');
    if (ph.state !== 'ready' || ph.archived === 1 || !ph.course_logical_id) throw unprocessable('PHRASE_NOT_READY');
    const body = env.repo.phrase(ph.course_logical_id)?.body as PhraseBody | undefined;
    for (const tid of body?.variationTaskIds ?? []) phraseTaskIds.add(tid);
  }
  const modeOk = (t: TaskBody): boolean => p.mode === 'mixed' || (p.mode === 'listening' ? isListeningTask(t) : !isListeningTask(t));
  const lastUsed = (revisionId: string): string =>
    ((env.db.prepare('SELECT max(submitted_at) AS t FROM attempts WHERE task_revision_id = ?').get(revisionId) as { t: string | null }).t ?? '');
  const candidates = env.repo
    .tasks()
    .filter((t: RevisionRow<TaskBody>) => env.repo.isUsable(t.state) && modeOk(t.body) && (t.body.targets.some((x) => keys.has(targetKey(x))) || phraseTaskIds.has(t.logicalId)))
    .map((t) => ({ t, used: lastUsed(t.revisionId) }))
    .sort((a, b) => a.used.localeCompare(b.used) || a.t.logicalId.localeCompare(b.t.logicalId) || a.t.revisionId.localeCompare(b.t.revisionId))
    .slice(0, Math.min(30, p.maxItems))
    .map((x) => x.t);
  if (candidates.length === 0) throw unprocessable('NO_READY_ITEMS');
  const id = env.cmd.subjectId;
  const taskIds = candidates.map((t) => t.revisionId);
  env.db
    .prepare('INSERT INTO practice_sets (id, revision, targets, task_revision_ids, phrase_ids, mode, created_by, created_at) VALUES (?, 1, ?, ?, ?, ?, ?, ?)')
    .run(id, JSON.stringify(p.targets), JSON.stringify(taskIds), JSON.stringify(p.phraseIds), p.mode, createdBy(env), env.now.toISOString());
  env.event('practice.created', 'practice-set', id, { targets: [...keys], tasks: taskIds.length, mode: p.mode });
  env.markCommitted('practice.create');
  return { entities: [ref(id, 1, 'practice-set')], outcome: 'created', route: `/practice/${id.toLowerCase()}`, createdEntityId: id };
}

/** course → reuse the exact ready shared phrase; spanish / uk-intent → private draft. */
export function phraseCapture(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_phrase_capture;
  if (p.source === 'course') {
    const rev = env.repo.byRevision<PhraseBody>(p.sourceRevisionId);
    if (!rev || rev.kind !== 'phrase') throw unprocessable('UNKNOWN_SOURCE');
    if (rev.state !== 'ready' && !env.repo.isUsable(rev.state)) throw unprocessable('SOURCE_NOT_READY');
    const existing = env.db.prepare("SELECT id, revision FROM phrase_records WHERE source = 'course' AND course_logical_id = ?").get(rev.logicalId) as { id: string; revision: number } | undefined;
    if (existing) return { entities: [ref(existing.id, existing.revision, 'phrase')], outcome: 'unchanged' };
    requireNew(env, 'phrase_records');
    const id = env.cmd.subjectId;
    env.db
      .prepare(
        `INSERT INTO phrase_records (id, revision, source, course_revision_id, course_logical_id, spanish, meaning, state, archived, priority, created_by, created_at, updated_at)
         VALUES (?, 1, 'course', ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      )
      .run(id, rev.revisionId, rev.logicalId, rev.body.spanish, rev.body.ukrainian, rev.state, createdBy(env), env.now.toISOString(), env.now.toISOString());
    env.event('phrase.captured', 'phrase', id, { source: 'course' });
    env.markCommitted('phrase.capture');
    return { entities: [ref(id, 1, 'phrase')], outcome: 'created', createdEntityId: id };
  }
  requireNew(env, 'phrase_records');
  const id = env.cmd.subjectId;
  const spanish = p.source === 'spanish' ? p.text : '';
  const meaning = p.source === 'spanish' ? p.meaning : p.text;
  env.db
    .prepare(
      `INSERT INTO phrase_records (id, revision, source, course_revision_id, course_logical_id, spanish, meaning, state, archived, priority, created_by, created_at, updated_at)
       VALUES (?, 1, ?, NULL, NULL, ?, ?, 'draft', 0, 0, ?, ?, ?)`,
    )
    .run(id, p.source, spanish, meaning, createdBy(env), env.now.toISOString(), env.now.toISOString());
  env.event('phrase.captured', 'phrase', id, { source: p.source });
  env.markCommitted('phrase.capture');
  return { entities: [ref(id, 1, 'phrase')], outcome: 'created', createdEntityId: id };
}

/** Typed blocks only (schema), ≤20 000 chars, table widths, known topic; a draft revision never replaces the active one. */
export function materialDraft(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_material_draft;
  const id = env.cmd.subjectId;
  const exists = env.db.prepare('SELECT 1 FROM content_revisions WHERE revision_id = ?').get(id);
  requireRevision(exists ? 1 : 0, env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  if (!/^A[12]-0[1-8](-(L[0-9]{1,2}|C1))?$/.test(p.topicId)) throw unprocessable('UNKNOWN_TOPIC');
  const lessons = env.repo.lessons();
  if (!lessons.some((l) => l.logicalId === p.topicId || l.body.blockId === p.topicId)) throw unprocessable('UNKNOWN_TOPIC');
  if (checkBlocks(p.blocks) > MATERIAL_MAX_CHARS) throw unprocessable('MATERIAL_TOO_LONG');
  for (const b of p.blocks) {
    if (b.type === 'practice-link') for (const t of b.targets) if (!env.repo.skill(t.skillId)?.body.modalities.includes(t.modality)) throw unprocessable('UNKNOWN_TARGET');
  }
  let logicalId = `material.personal.${id.toLowerCase()}`;
  let parent: string | null = null;
  if (p.parentRevisionId !== undefined) {
    const parentRev = env.repo.byRevision<MaterialBody>(p.parentRevisionId);
    if (!parentRev || parentRev.kind !== 'material') throw unprocessable('UNKNOWN_PARENT');
    logicalId = parentRev.logicalId;
    parent = parentRev.revisionId;
  }
  const linked = [...new Set(p.blocks.flatMap((b) => (b.type === 'practice-link' ? b.targets.map(targetKey) : [])))];
  const body: MaterialBody = { id: logicalId, topicId: p.topicId, titleUk: p.title, blocks: p.blocks, linkedTargets: linked, reviewStatus: 'draft' };
  const sha = entitySha256(body);
  const same = env.db.prepare("SELECT revision_id FROM content_revisions WHERE kind = 'material' AND logical_id = ? AND sha256 = ?").get(logicalId, sha) as { revision_id: string } | undefined;
  if (same) return { entities: [ref(same.revision_id, 1, 'material')], outcome: 'unchanged' };
  const origin = env.principal.kind === 'agent' ? 'agent' : 'personal';
  env.db
    .prepare(
      `INSERT INTO content_revisions (revision_id, kind, logical_id, state, sha256, body, origin, parent_revision_id, pack_id, provenance, created_at)
       VALUES (?, 'material', ?, 'draft', ?, ?, ?, ?, NULL, ?, ?)`,
    )
    .run(id, logicalId, sha, JSON.stringify(body), origin, parent, JSON.stringify({ createdBy: env.principal.kind === 'agent' ? 'agent' : 'owner' }), env.now.toISOString());
  env.event('material.drafted', 'material', id, { logicalId, topicId: p.topicId, parentRevisionId: parent });
  env.markCommitted('material.draft');
  return { entities: [ref(id, 1, 'material')], outcome: 'created', createdEntityId: id };
}

function requirePhrases(env: CommandEnv, ids: readonly string[]): void {
  for (const pid of ids) {
    if (!env.db.prepare('SELECT 1 FROM phrase_records WHERE id = ?').get(pid)) throw unprocessable('UNKNOWN_PHRASE');
  }
}

export function collectionCreate(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_collection_create;
  requireNew(env, 'collections');
  const ids = [...new Set(p.phraseIds.map((x) => x.toLowerCase()))];
  requirePhrases(env, ids);
  const id = env.cmd.subjectId;
  env.db.prepare("INSERT INTO collections (id, revision, name, origin, course_logical_id, archived, created_by, created_at) VALUES (?, 1, ?, 'personal', NULL, 0, ?, ?)").run(id, p.name, createdBy(env), env.now.toISOString());
  const ins = env.db.prepare('INSERT INTO collection_members (collection_id, phrase_id, position) VALUES (?, ?, ?)');
  ids.forEach((pid, i) => ins.run(id, pid, i));
  env.event('collection.created', 'collection', id, { phrases: ids.length });
  env.markCommitted('collection.create');
  return { entities: [ref(id, 1, 'collection')], outcome: 'created', createdEntityId: id };
}

/** Add/remove references and rename; removing a member never deletes the phrase or its history. */
export function collectionPatch(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_collection_patch;
  const c = env.db.prepare('SELECT id, revision, origin FROM collections WHERE id = ?').get(env.cmd.subjectId) as { id: string; revision: number; origin: string } | undefined;
  if (!c) throw notFound('COLLECTION_NOT_FOUND');
  requireRevision(c.revision, env.cmd.expectedRevision);
  if (c.origin === 'course') throw unprocessable('COURSE_COLLECTION_READONLY');
  const add = [...new Set(p.add.map((x) => x.toLowerCase()))];
  const remove = new Set(p.remove.map((x) => x.toLowerCase()));
  requirePhrases(env, add);
  const members = (env.db.prepare('SELECT phrase_id FROM collection_members WHERE collection_id = ? ORDER BY position').all(c.id) as Array<{ phrase_id: string }>).map((r) => r.phrase_id);
  const next = [...members.filter((m) => !remove.has(m)), ...add.filter((a) => !members.includes(a) && !remove.has(a))];
  const renamed = p.name !== undefined;
  const changed = renamed || next.length !== members.length || next.some((m, i) => members[i] !== m);
  if (!changed) return { entities: [ref(c.id, c.revision, 'collection')], outcome: 'unchanged' };
  env.db.prepare('DELETE FROM collection_members WHERE collection_id = ?').run(c.id);
  const ins = env.db.prepare('INSERT INTO collection_members (collection_id, phrase_id, position) VALUES (?, ?, ?)');
  next.forEach((pid, i) => ins.run(c.id, pid, i));
  if (renamed) env.db.prepare('UPDATE collections SET name = ? WHERE id = ?').run(p.name, c.id);
  env.db.prepare('UPDATE collections SET revision = revision + 1 WHERE id = ?').run(c.id);
  env.event('collection.patched', 'collection', c.id, { added: add.length, removed: remove.size, renamed });
  env.markCommitted('collection.patch');
  return { entities: [ref(c.id, c.revision + 1, 'collection')], outcome: 'updated' };
}

/** Draft review linked to the attempt and its pinned revisions; no verdict/projection change before validation. */
export function reviewSubmit(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_review_submit;
  requireNew(env, 'review_reports');
  const a = env.db.prepare('SELECT id, task_revision_id, original_answer FROM attempts WHERE id = ?').get(p.attemptId) as { id: string; task_revision_id: string; original_answer: string } | undefined;
  if (!a) throw unprocessable('UNKNOWN_ATTEMPT');
  if (a.task_revision_id.toLowerCase() !== p.taskRevisionId.toLowerCase()) throw unprocessable('PINNED_REVISION_MISMATCH');
  if (sha256Hex(a.original_answer) !== p.answerHash) throw unprocessable('ANSWER_HASH_MISMATCH');
  const targets = new Set((env.db.prepare('SELECT skill_id, modality FROM target_results WHERE attempt_id = ?').all(a.id) as Array<{ skill_id: string; modality: string }>).map((r) => `${r.skill_id}/${r.modality}`));
  for (const v of p.report.verdicts) if (!targets.has(targetKey(v.target))) throw unprocessable('TARGET_NOT_IN_ATTEMPT');
  const id = env.cmd.subjectId;
  env.db
    .prepare("INSERT INTO review_reports (id, revision, attempt_id, content_revision_id, state, report, answer_hash, created_at) VALUES (?, 1, ?, ?, 'draft', ?, ?, ?)")
    .run(id, a.id, a.task_revision_id, JSON.stringify(p.report), p.answerHash, env.now.toISOString());
  env.event('review.submitted', 'review', id, { attemptId: a.id, provider: p.report.provider });
  env.markCommitted('review.submit');
  return { entities: [ref(id, 1, 'review')], outcome: 'created', createdEntityId: id };
}
