// Wire read models built from the profile database and installed content. Answer keys, accepted
// variants, error variants, option outcomes, rubrics and hint bodies are never part of these models.
import type {
  Attempt,
  Block,
  Collection,
  Content,
  ContextMeta,
  Draft,
  ExerciseTask,
  LearningSession,
  LessonProgress,
  PracticeSet,
  Preference,
  Review,
  ReviewReport,
  Summary,
  Support,
  Target,
  TaskView,
  Verdict,
} from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import { contractContentState, type ContentRepository, type RevisionRow } from '../content/repository.ts';
import { LISTENING_MODALITIES, parseTargetKey, targetKey, type ClipBody, type LessonBody, type MaterialBody, type PhraseBody, type TaskBody } from '../content/types.ts';
import { evidenceLabel, stableLabel, type AttemptEntry, type TargetState } from '@sll/domain';

export function taskView(repo: ContentRepository, t: RevisionRow<TaskBody>): TaskView {
  return {
    id: t.revisionId,
    logicalId: t.logicalId,
    revision: repo.revisionOrdinal('task', t.logicalId, t.revisionId),
    prompt: [...t.body.prompt],
    targets: [...t.body.targets],
    mode: t.body.mode,
    options: (t.body.options ?? []).map((o) => ({ id: o.id, label: o.label })),
    audioHashes: repo.taskAudioHashes(t.body).slice(0, 4),
  };
}

export function exerciseTask(repo: ContentRepository, t: RevisionRow<TaskBody>): ExerciseTask {
  return {
    taskRevisionId: t.revisionId,
    logicalId: t.logicalId,
    lessonId: t.body.lessonId,
    role: t.body.role,
    mode: t.body.mode,
    input: t.body.input,
    targets: [...t.body.targets],
    prompt: [...t.body.prompt],
    options: (t.body.options ?? []).map((o) => ({ id: o.id, label: o.label })),
    audioHashes: repo.taskAudioHashes(t.body).slice(0, 2),
    hints: (t.body.hints ?? []).map((h, index) => ({ index, kind: h.kind })),
    state: t.state,
  };
}

export interface ContextRowLike {
  id: string;
  revision: number;
  open: number;
  last_activity_at: string;
  title: string;
  task_revision_id: string;
  mode: 'learn' | 'practice' | 'review' | 'listening';
}

export function contextMeta(r: ContextRowLike): ContextMeta {
  return { id: r.id, revision: r.revision, open: r.open === 1, lastActivityAt: r.last_activity_at, title: r.title, taskRevisionId: r.task_revision_id, mode: r.mode };
}

export function draftOut(r: { id: string; revision: number; task_revision_id: string; text: string; cursor: number; saved_at: string }): Draft {
  return { id: r.id, revision: r.revision, taskRevisionId: r.task_revision_id, text: r.text, cursor: r.cursor, savedAt: r.saved_at };
}

interface SupportRowLike {
  id: string;
  revision: number;
  context_id: string | null;
  kind: string;
  targets: string;
  blocks: string;
  content_hash: string | null;
  delivery: string;
  expires_at: string | null;
  recorded_at: string;
}

const SUPPORT_KINDS = new Set(['rule', 'targeted-clue', 'translation', 'transcript', 'reveal', 'external-help']);

/** Reservations only (observed neutral/reported events are not Support resources). */
export function supportOut(r: SupportRowLike): Support | undefined {
  if (!SUPPORT_KINDS.has(r.kind) || r.content_hash === null || r.context_id === null) return undefined;
  const delivery = r.delivery === 'neutral' ? 'confirmed-undelivered' : (r.delivery as Support['delivery']);
  return {
    id: r.id,
    revision: r.revision,
    contextId: r.context_id,
    targets: JSON.parse(r.targets) as Target[],
    kind: r.kind as Support['kind'],
    blocks: JSON.parse(r.blocks) as Block[],
    contentHash: r.content_hash,
    delivery,
    expiresAt: r.expires_at ?? r.recorded_at,
  };
}

export function attemptOut(db: Db, id: string): Attempt | undefined {
  const a = db.prepare('SELECT * FROM attempts WHERE id = ?').get(id) as
    | { id: string; revision: number; task_revision_id: string; original_answer: string; submitted_at: string; status: 'checked' | 'unresolved'; support_snapshot: string }
    | undefined;
  if (!a) return undefined;
  const results = db.prepare('SELECT * FROM target_results WHERE attempt_id = ? ORDER BY rowid').all(id) as Array<{
    skill_id: string;
    modality: string;
    correctness: Verdict['correctness'];
    independence: Verdict['independence'];
    explanation_key: string;
    matched_variant_id: string | null;
  }>;
  const verdicts: Verdict[] = results.map((r) => {
    const v = { target: { skillId: r.skill_id, modality: r.modality as Target['modality'] }, correctness: r.correctness, independence: r.independence, explanationKey: r.explanation_key };
    return r.matched_variant_id === null ? v : { ...v, matchedVariantId: r.matched_variant_id };
  });
  const snapshot = JSON.parse(a.support_snapshot) as Array<{ supportId: string }>;
  const adjudications = (db.prepare('SELECT id FROM adjudications WHERE attempt_id = ? ORDER BY created_at').all(id) as Array<{ id: string }>).map((x) => x.id);
  return {
    id: a.id,
    revision: a.revision,
    taskRevisionId: a.task_revision_id,
    originalAnswer: a.original_answer,
    submittedAt: a.submitted_at,
    status: a.status,
    verdicts,
    supportIds: snapshot.map((s) => s.supportId).slice(0, 100),
    adjudicationIds: adjudications.slice(0, 100),
  };
}

function flattenLessonBlocks(lesson: LessonBody): Block[] {
  return lesson.steps.flatMap((s) => s.blocks ?? []).slice(0, 40);
}

export function lessonContent(repo: ContentRepository, l: RevisionRow<LessonBody>): Content {
  const hashes = l.body.steps.flatMap((s) => (s.clipIds ?? []).map((c) => repo.clipAssetHash(c)).filter((h): h is string => h !== undefined));
  return {
    id: l.revisionId,
    logicalId: l.logicalId,
    revision: repo.revisionOrdinal('lesson', l.logicalId, l.revisionId),
    resourceType: 'lesson',
    state: contractContentState(l.state),
    title: l.body.titleUk.slice(0, 160),
    topicId: l.body.blockId,
    blocks: flattenLessonBlocks(l.body),
    audioHashes: [...new Set(hashes)].slice(0, 20),
  };
}

export function materialContent(repo: ContentRepository, m: RevisionRow<MaterialBody>): Content {
  const c: Content = {
    id: m.revisionId,
    logicalId: m.logicalId,
    revision: repo.revisionOrdinal('material', m.logicalId, m.revisionId),
    resourceType: 'material',
    state: contractContentState(m.state),
    title: m.body.titleUk.slice(0, 160),
    topicId: m.body.topicId,
    blocks: [...m.body.blocks],
    audioHashes: [],
  };
  return m.parentRevisionId ? { ...c, parentRevisionId: m.parentRevisionId } : c;
}

export interface PhraseRow {
  id: string;
  revision: number;
  source: 'course' | 'spanish' | 'uk-intent';
  course_revision_id: string | null;
  course_logical_id: string | null;
  spanish: string;
  meaning: string;
  state: 'draft' | 'needs-review' | 'reviewed' | 'ready' | 'retired' | 'quarantined';
  archived: number;
}

export function phraseContent(repo: ContentRepository, p: PhraseRow): Content {
  const course = p.course_logical_id ? repo.phrase(p.course_logical_id) : undefined;
  const body = course?.body as PhraseBody | undefined;
  const blocks: Block[] =
    p.spanish && p.meaning
      ? [{ type: 'example', spanish: p.spanish.slice(0, 1000), ukrainian: p.meaning.slice(0, 1000) }]
      : [{ type: 'paragraph', language: p.spanish ? 'es-ES' : 'uk', text: (p.spanish || p.meaning || '—').slice(0, 2000) }];
  const hashes = (body?.clipIds ?? []).map((c) => repo.clipAssetHash(c)).filter((h): h is string => h !== undefined);
  return {
    id: p.id,
    logicalId: p.course_logical_id ?? p.id,
    revision: p.revision,
    resourceType: 'phrase',
    state: contractContentState(p.state),
    title: (p.spanish || p.meaning || '—').slice(0, 160),
    topicId: body?.firstLesson ?? 'personal',
    blocks,
    audioHashes: hashes.slice(0, 20),
  };
}

export function collectionOut(db: Db, c: { id: string; revision: number; name: string; origin: 'course' | 'personal' }): Collection {
  const members = (db.prepare('SELECT phrase_id FROM collection_members WHERE collection_id = ? ORDER BY position').all(c.id) as Array<{ phrase_id: string }>).map((r) => r.phrase_id);
  return { id: c.id, revision: c.revision, name: c.name, origin: c.origin, phraseIds: members.slice(0, 500) };
}

export function practiceSetOut(r: { id: string; revision: number; targets: string; task_revision_ids: string; mode: 'written' | 'listening' | 'mixed' }): PracticeSet {
  return {
    id: r.id,
    revision: r.revision,
    targets: JSON.parse(r.targets) as Target[],
    taskRevisionIds: JSON.parse(r.task_revision_ids) as string[],
    mode: r.mode,
    route: `/practice/${r.id.toLowerCase()}`,
  };
}

export function reviewOut(r: { id: string; revision: number; attempt_id: string; state: Review['state']; report: string }): Review {
  return { id: r.id, revision: r.revision, attemptId: r.attempt_id, state: r.state, report: JSON.parse(r.report) as ReviewReport };
}

export function preferenceOut(
  r: { id: string; revision: number; targets: string; frequency: 'usual' | 'repeat-more' | 'known' | null; paused: number | null },
  load: (key: string) => TargetState | undefined,
  today: string,
): Preference {
  const targets = JSON.parse(r.targets) as Target[];
  const first = targets[0] ? load(targetKey(targets[0])) : undefined;
  const dues = targets.map((t) => load(targetKey(t))?.dueDate).filter((d): d is string => typeof d === 'string').sort();
  return {
    id: r.id,
    revision: r.revision,
    targets,
    frequency: r.frequency ?? first?.frequency ?? 'usual',
    paused: r.paused === null ? first?.paused ?? false : r.paused === 1,
    dueDate: dues[0] ?? today,
  };
}

export function summaryOut(r: { id: string; revision: number; body: string }): Summary {
  return { id: r.id, revision: r.revision, ...(JSON.parse(r.body) as Omit<Summary, 'id' | 'revision'>) };
}

export function sessionOut(r: { id: string; revision: number; mode: LearningSession['mode']; task_revision_ids: string; status: 'active' | 'finished'; summary_id: string | null }): LearningSession {
  const s: LearningSession = { id: r.id, revision: r.revision, mode: r.mode, taskRevisionIds: (JSON.parse(r.task_revision_ids) as string[]).slice(0, 100), status: r.status };
  return r.summary_id ? { ...s, summaryId: r.summary_id } : s;
}

export function lessonProgressOut(r: { id: string; revision: number; lesson_id: string; visited_step_ids: string; status: 'visited' | 'completed' }): LessonProgress {
  return { id: r.id, revision: r.revision, lessonId: r.lesson_id, visitedStepIds: JSON.parse(r.visited_step_ids) as string[], status: r.status };
}

export type EvidenceLabel = 'stable' | 'independent' | 'supported' | 'uncertain' | 'introduced';

function lastAttempt(ts: TargetState): AttemptEntry | undefined {
  return [...ts.journal].reverse().find((j): j is AttemptEntry => j.kind === 'attempt' && !j.invalidated && j.correctness !== 'invalid-item');
}

/** Evidence label (@sll/domain evidenceLabel) + a specific reason key — never a mastery percentage or pass/fail. */
export function labelFor(ts: TargetState): { label: EvidenceLabel; reasonKey: string; lastEvidenceDate: string } {
  const label = evidenceLabel(ts) ?? 'introduced';
  const last = lastAttempt(ts);
  let reasonKey: string;
  if (label === 'stable') reasonKey = stableLabel(ts).reasonKey;
  else if (label === 'supported') reasonKey = last && last.correctness === 'incorrect' && last.seq === ts.lastSupportOrErrorSeq ? 'progress.reason.recentError' : 'progress.reason.recentSupport';
  else if (label === 'uncertain') reasonKey = last?.correctness === 'unresolved' ? 'progress.reason.unresolved' : 'progress.reason.unknownSupport';
  else if (label === 'independent') reasonKey = 'progress.reason.independentCheck';
  else reasonKey = 'progress.reason.introduced';
  return { label, reasonKey, lastEvidenceDate: last?.date ?? '' };
}

export function clipLevel(clips: readonly ClipBody[]): 'phrase' | 'sentence' | 'text' {
  if (clips.some((c) => c.kind === 'text')) return 'text';
  if (clips.some((c) => c.kind === 'sentence' || c.kind === 'dialogue-line')) return 'sentence';
  return 'phrase';
}

export function targetsFromKeys(keys: readonly string[]): Target[] {
  return keys.map(parseTargetKey);
}
