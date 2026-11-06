// Browser view read models (viewsVersion 1): HomeView, LessonView, ExerciseView, ProgressView,
// PhraseLibraryView, MaterialsView, ListeningView. Reads only: no activity/scheduling mutation, no
// answer keys, no unrequested help/reference answers.
import type { ExerciseView, HomeView, LessonView, ListeningView, MaterialsView, PhraseLibraryView, ProgressView, Summary, Target } from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import type { ContentRepository, RevisionRow } from '../content/repository.ts';
import { lessonOrderKey } from '../content/pack-format.ts';
import { LISTENING_MODALITIES, parseTargetKey, targetKey, type ClipBody, type LessonBody, type MaterialBody, type TaskBody } from '../content/types.ts';
import { notFound } from '../http/errors.ts';
import { isListeningModality, type TargetState } from '@sll/domain';
import { allTargetStates } from '../learning/scheduler-store.ts';
import { dueTargets } from '../learning/queue.ts';
import { clipLevel, collectionOut, exerciseTask, labelFor } from '../reads/models.ts';

type LessonStatus = 'not-started' | 'visited' | 'completed';

function progressByLesson(db: Db): Map<string, { status: 'visited' | 'completed'; visited: string[] }> {
  const rows = db.prepare('SELECT lesson_id, status, visited_step_ids FROM lesson_progress').all() as Array<{ lesson_id: string; status: 'visited' | 'completed'; visited_step_ids: string }>;
  return new Map(rows.map((r) => [r.lesson_id, { status: r.status, visited: JSON.parse(r.visited_step_ids) as string[] }]));
}

function introduced(db: Db): TargetState[] {
  return allTargetStates(db).filter((ts) => ts.introducedDate !== null);
}

export function homeView(db: Db, repo: ContentRepository, today: string): HomeView {
  const pack = repo.activePack();
  const attempts = (db.prepare('SELECT count(*) AS n FROM attempts').get() as { n: number }).n;
  const progress = progressByLesson(db);
  const due = dueTargets(db, today);
  const targets = introduced(db);
  const labels = targets.map((ts) => ({ ts, ...labelFor(ts) }));
  const evidence = {
    introduced: targets.length,
    independent: labels.filter((x) => x.label === 'independent').length,
    supported: labels.filter((x) => x.label === 'supported').length,
    uncertain: labels.filter((x) => x.label === 'uncertain').length,
    listening: labels.filter((x) => isListeningModality(x.ts.modality) && (x.label === 'independent' || x.label === 'stable')).length,
    stable: labels.filter((x) => x.label === 'stable').length,
  };
  const view: { -readonly [K in keyof HomeView]: HomeView[K] } = {
    viewsVersion: 1,
    firstUse: attempts === 0 && progress.size === 0,
    review: { dueTargets: due.length, supportPending: due.filter((ts) => ts.pendingNeed).length, estimatedMinutes: Math.min(30, due.length) },
    evidence,
    pack: pack ? { state: pack.preview ? 'preview' : 'ready', version: pack.version.slice(0, 80), hash: pack.manifestSha256 } : { state: 'missing', version: '', hash: '' },
  };
  // Resume: the most recent open context holding saved, not yet submitted work.
  const resumable = db
    .prepare(
      `SELECT c.id, c.title, c.task_revision_id, c.last_activity_at FROM contexts c
       JOIN drafts d ON d.context_id = c.id AND d.recovered_from_operation_id IS NULL
       WHERE c.open = 1 AND length(d.text) > 0
         AND NOT EXISTS (SELECT 1 FROM attempts a WHERE a.context_id = c.id AND a.submitted_at >= d.saved_at)
       ORDER BY c.last_activity_at DESC LIMIT 1`,
    )
    .get() as { id: string; title: string; task_revision_id: string; last_activity_at: string } | undefined;
  if (resumable) {
    const task = repo.byRevision<TaskBody>(resumable.task_revision_id);
    if (task) view.resume = { contextId: resumable.id, titleUk: resumable.title.slice(0, 160), lessonId: task.body.lessonId, taskRevisionId: resumable.task_revision_id, lastActivityAt: resumable.last_activity_at };
  }
  const next = repo.lessons().find((l) => l.body.kind === 'lesson' && repo.isUsable(l.state) && progress.get(l.logicalId)?.status !== 'completed');
  if (next) view.nextLesson = { lessonId: next.logicalId, titleUk: next.body.titleUk.slice(0, 160), blockId: next.body.blockId };
  return view;
}

function materialsFor(repo: ContentRepository, topics: readonly string[]): Array<RevisionRow<MaterialBody>> {
  const set = new Set(topics);
  const course = repo.materials().filter((m) => set.has(m.body.topicId));
  const personal = (repo.db
    .prepare("SELECT revision_id FROM content_revisions WHERE kind = 'material' AND origin != 'course' ORDER BY created_at, rowid")
    .all() as Array<{ revision_id: string }>)
    .map((r) => repo.byRevision<MaterialBody>(r.revision_id))
    .filter((m): m is RevisionRow<MaterialBody> => m !== undefined && set.has(m.body.topicId));
  return [...course, ...personal];
}

function materialRefs(repo: ContentRepository, topics: readonly string[]): LessonView['materials'] {
  return materialsFor(repo, topics)
    .map((m) => ({ materialId: m.logicalId, revisionId: m.revisionId, titleUk: m.body.titleUk.slice(0, 160), state: m.state }))
    .slice(0, 20);
}

export function lessonView(db: Db, repo: ContentRepository, lessonId: string): LessonView {
  const lesson = repo.lesson(lessonId);
  if (!lesson) throw notFound('LESSON_NOT_FOUND');
  const l: LessonBody = lesson.body;
  const progress = progressByLesson(db).get(lessonId);
  const ordered = repo.lessons().map((x) => x.logicalId);
  const i = ordered.indexOf(lessonId);
  return {
    viewsVersion: 1,
    lessonId,
    revisionId: lesson.revisionId,
    kind: l.kind,
    blockId: l.blockId,
    titleUk: l.titleUk.slice(0, 160),
    termEs: (l.termEs ?? '').slice(0, 160),
    summaryUk: l.summaryUk,
    estimatedMinutes: l.estimatedMinutes,
    skippableFoundation: l.skippableFoundation ?? false,
    state: lesson.state,
    objectives: [...l.objectives],
    steps: l.steps.map((s) => ({
      id: s.id,
      kind: s.kind,
      titleUk: s.titleUk,
      required: s.required,
      blocks: [...(s.blocks ?? [])],
      tasks: (s.taskIds ?? []).map((id) => repo.task(id)).filter((t): t is RevisionRow<TaskBody> => t !== undefined).map((t) => exerciseTask(repo, t)),
      audio: (s.clipIds ?? [])
        .map((clipId) => ({ clipId, hash: repo.clipAssetHash(clipId) }))
        .filter((x): x is { clipId: string; hash: string } => x.hash !== undefined)
        .slice(0, 6),
    })),
    progress: { status: (progress?.status ?? 'not-started') as LessonStatus, visitedStepIds: progress?.visited ?? [] },
    materials: materialRefs(repo, [lessonId, l.blockId]),
    previousLessonId: i > 0 ? ordered[i - 1]! : '',
    nextLessonId: i >= 0 && i < ordered.length - 1 ? ordered[i + 1]! : '',
  };
}

export function exerciseView(repo: ContentRepository, taskRevisionId: string): ExerciseView {
  const task = repo.byRevision<TaskBody>(taskRevisionId);
  if (!task || task.kind !== 'task') throw notFound('TASK_NOT_FOUND');
  const lesson = repo.lesson(task.body.lessonId);
  return {
    viewsVersion: 1,
    task: exerciseTask(repo, task),
    lessonTitleUk: (lesson?.body.titleUk ?? task.body.lessonId).slice(0, 160),
    materials: materialRefs(repo, [task.body.lessonId, task.body.lessonId.slice(0, 5)]),
  };
}

export function progressView(db: Db, repo: ContentRepository): ProgressView {
  const progress = progressByLesson(db);
  const lessons = repo.lessons();
  const blocks = repo.blocks().map((blockId) => ({
    blockId,
    titleUk: repo.blockTitle(blockId).slice(0, 160),
    lessons: lessons
      .filter((l) => l.body.blockId === blockId)
      .slice(0, 20)
      .map((l) => ({ lessonId: l.logicalId, titleUk: l.body.titleUk.slice(0, 160), kind: l.body.kind, status: (progress.get(l.logicalId)?.status ?? 'not-started') as LessonStatus })),
  }));
  const titles = new Map(repo.skills().map((s) => [s.logicalId, s.body.titleUk]));
  const targets = introduced(db).map((ts) => {
    const { label, reasonKey, lastEvidenceDate } = labelFor(ts);
    const target = parseTargetKey(ts.target);
    return {
      target,
      titleUk: (titles.get(target.skillId) ?? target.skillId).slice(0, 160),
      label,
      reasonKey,
      lastEvidenceDate,
      dueDate: ts.dueDate ?? '',
      frequency: ts.frequency,
      paused: ts.paused,
    };
  });
  const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: string };
  const seq = (db.prepare('SELECT max(event_seq) AS s FROM event_log').get() as { s: number | null }).s ?? 0;
  const summary: Summary = {
    id: profile.id,
    revision: seq,
    visitedLessons: [...progress.values()].length,
    completedLessons: [...progress.values()].filter((x) => x.status === 'completed').length,
    independentTargets: targets.filter((t) => t.label === 'independent' || t.label === 'stable').length,
    supportedTargets: targets.filter((t) => t.label === 'supported').length,
    unresolvedTargets: targets.filter((t) => t.label === 'uncertain').length,
    recommendedTargetIds: introduced(db).filter((ts) => ts.pendingNeed).map((ts) => parseTargetKey(ts.target)).slice(0, 30),
  };
  return { viewsVersion: 1, blocks, targets: targets.slice(0, 3000), summary };
}

export function phraseLibraryView(db: Db): PhraseLibraryView {
  const phrases = db.prepare('SELECT * FROM phrase_records ORDER BY created_at, rowid').all() as Array<{
    id: string;
    revision: number;
    source: 'course' | 'spanish' | 'uk-intent';
    course_logical_id: string | null;
    spanish: string;
    meaning: string;
    state: 'draft' | 'needs-review' | 'reviewed' | 'ready' | 'retired' | 'quarantined';
    archived: number;
  }>;
  const memberships = db.prepare('SELECT collection_id, phrase_id FROM collection_members ORDER BY position').all() as Array<{ collection_id: string; phrase_id: string }>;
  const byPhrase = new Map<string, string[]>();
  for (const m of memberships) byPhrase.set(m.phrase_id, [...(byPhrase.get(m.phrase_id) ?? []), m.collection_id]);
  const collections = (db.prepare('SELECT id, revision, name, origin FROM collections WHERE archived = 0 ORDER BY created_at, rowid').all() as Array<{ id: string; revision: number; name: string; origin: 'course' | 'personal' }>).map((c) =>
    collectionOut(db, c),
  );
  return {
    viewsVersion: 1,
    phrases: phrases.slice(0, 3000).map((p) => ({
      id: p.id,
      revision: p.revision,
      logicalId: (p.course_logical_id ?? '').slice(0, 150),
      spanish: p.spanish.slice(0, 2000),
      ukrainian: p.meaning.slice(0, 2000),
      state: p.state,
      origin: p.source,
      collectionIds: (byPhrase.get(p.id) ?? []).slice(0, 200),
      practiceReady: p.state === 'ready' && p.archived === 0 && p.source === 'course',
      archived: p.archived === 1,
    })),
    collections: collections.slice(0, 300),
  };
}

export function materialsView(repo: ContentRepository, topicId: string): MaterialsView {
  const lesson = repo.lesson(topicId);
  const isBlock = repo.lessons().some((l) => l.body.blockId === topicId);
  if (!lesson && !isBlock) throw notFound('TOPIC_NOT_FOUND');
  const title = lesson ? lesson.body.titleUk : repo.blockTitle(topicId);
  return {
    viewsVersion: 1,
    topicId,
    titleUk: title.slice(0, 160),
    materials: materialsFor(repo, [topicId])
      .slice(0, 60)
      .map((m) => ({
        materialId: m.logicalId.slice(0, 150),
        revisionId: m.revisionId,
        revision: repo.revisionOrdinal('material', m.logicalId, m.revisionId),
        titleUk: m.body.titleUk.slice(0, 160),
        state: m.state,
        origin: m.origin === 'course' ? 'course' : 'personal',
        blocks: [...m.body.blocks],
        linkedTargets: m.body.linkedTargets.map(parseTargetKey).slice(0, 30) as Target[],
      })),
  };
}

export function listeningView(db: Db, repo: ContentRepository, today: string): ListeningView {
  const due = new Set<string>(dueTargets(db, today).map((ts) => ts.target));
  const tasks = repo.tasks().filter((t) => repo.isUsable(t.state));
  const clips = repo.listActive<ClipBody>('clip');
  const items = repo
    .lessons()
    .map((l) => {
      const listening = tasks.filter((t) => t.body.lessonId === l.logicalId && ((t.body.clipIds?.length ?? 0) > 0 || t.body.targets.some((x) => LISTENING_MODALITIES.has(x.modality))));
      const lessonClips = clips.filter((c) => c.body.lessonId === l.logicalId).map((c) => c.body);
      const keys = new Set(listening.flatMap((t) => t.body.targets.filter((x) => LISTENING_MODALITIES.has(x.modality)).map(targetKey)));
      return {
        lessonId: l.logicalId,
        titleUk: l.body.titleUk.slice(0, 160),
        blockId: l.body.blockId,
        level: clipLevel(lessonClips),
        taskRevisionIds: listening.sort((a, b) => a.logicalId.localeCompare(b.logicalId)).map((t) => t.revisionId).slice(0, 40),
        clipCount: lessonClips.length,
        dueTargets: [...keys].filter((k) => due.has(k)).length,
      };
    })
    .filter((x) => x.taskRevisionIds.length > 0 || x.clipCount > 0)
    .sort((a, b) => lessonOrderKey(a.lessonId) - lessonOrderKey(b.lessonId))
    .slice(0, 200);
  return { viewsVersion: 1, items };
}
