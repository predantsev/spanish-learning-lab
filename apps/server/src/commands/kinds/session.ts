// session.start, session.finish, lesson.progress
import { randomBytes, randomUUID } from 'node:crypto';
import type { Payload_lesson_progress, Payload_session_start, Summary, Target } from '@sll/contracts';
import { conflict, notFound, unprocessable } from '../../http/errors.ts';
import { targetKey, type LessonBody, type SkillBody, type TaskBody, type TargetKey } from '../../content/types.ts';
import type { RevisionRow } from '../../content/repository.ts';
import { applyToTarget, loadTarget, setOffered } from '../../learning/targets.ts';
import { readQueueState, selectRecommended, writeQueueState } from '../../learning/queue.ts';
import { ref, requireRevision, type CommandEnv, type CommandResult } from '../env.ts';

interface SessionRow {
  id: string;
  revision: number;
  mode: 'learn' | 'practice' | 'review' | 'listening';
  source: 'lesson' | 'practice-set' | 'recommended';
  source_id: string | null;
  status: 'active' | 'finished';
  queue_snapshot: string;
  task_revision_ids: string;
  started_at: string;
}

export function loadSession(env: CommandEnv, id: string): SessionRow {
  const r = env.db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
  if (!r) throw notFound('SESSION_NOT_FOUND');
  return r;
}

function existingRevision(env: CommandEnv, table: string, id: string): number {
  const r = env.db.prepare(`SELECT revision FROM ${table} WHERE id = ?`).get(id) as { revision: number } | undefined;
  return r?.revision ?? 0;
}

/** Lesson tasks from the lesson's steps, resolved to their active revisions (usable ones only). */
export function lessonTasks(env: CommandEnv, lesson: LessonBody): Array<RevisionRow<TaskBody>> {
  const out: Array<RevisionRow<TaskBody>> = [];
  for (const step of lesson.steps) {
    for (const id of step.taskIds ?? []) {
      const t = env.repo.task(id);
      if (t && env.repo.isUsable(t.state)) out.push(t);
    }
  }
  return out;
}

export function sessionStart(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_session_start;
  const id = env.cmd.subjectId;
  requireRevision(existingRevision(env, 'sessions', id), env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  const scope = new Set<TargetKey>(p.targets.map(targetKey));
  let taskIds: string[];
  let sourceId: string | null = null;
  const snapshot: Record<string, unknown> = { source: p.source, minutes: p.minutes, maxItems: p.maxItems, targets: [...scope] };
  if (p.source === 'recommended') {
    if (p.sourceId !== undefined) throw unprocessable('SOURCE_ID_FORBIDDEN');
    const q = readQueueState(env.db);
    const sel = selectRecommended(env.db, env.repo, { today: env.today, minutes: p.minutes, maxItems: p.maxItems, scope, listeningOnly: p.mode === 'listening', cursor: q.cursor });
    if (sel.taskRevisionIds.length === 0) throw unprocessable('QUEUE_EMPTY');
    // Persist the fair-order cursor and offer sequence only now that the learner starts the session.
    let offerSeq = q.offerSeq;
    for (const key of sel.keys) setOffered(env.db, key, ++offerSeq);
    writeQueueState(env.db, { cursor: sel.cursor, offerSeq });
    taskIds = sel.taskRevisionIds;
    Object.assign(snapshot, { selectedTargets: sel.keys, missingVariety: sel.missingVariety, cursorBefore: q.cursor, cursorAfter: sel.cursor });
  } else {
    if (p.sourceId === undefined) throw unprocessable('SOURCE_ID_REQUIRED');
    sourceId = p.sourceId;
    if (p.source === 'lesson') {
      const lesson = env.repo.byRevision<LessonBody>(p.sourceId);
      if (!lesson || lesson.kind !== 'lesson') throw unprocessable('UNKNOWN_SOURCE');
      if (lesson.state === 'quarantined' || lesson.state === 'retired') throw unprocessable('SOURCE_NOT_READY');
      const tasks = lessonTasks(env, lesson.body).filter((t) => scope.size === 0 || t.body.targets.some((x) => scope.has(targetKey(x))));
      taskIds = tasks.map((t) => t.revisionId);
      snapshot.lessonId = lesson.logicalId;
    } else {
      const set = env.db.prepare('SELECT task_revision_ids FROM practice_sets WHERE id = ?').get(p.sourceId) as { task_revision_ids: string } | undefined;
      if (!set) throw unprocessable('UNKNOWN_SOURCE');
      taskIds = (JSON.parse(set.task_revision_ids) as string[])
        .filter((tid) => {
          const t = env.repo.byRevision<TaskBody>(tid);
          return t !== undefined && env.repo.isUsable(t.state) && (scope.size === 0 || t.body.targets.some((x) => scope.has(targetKey(x))));
        })
        .slice(0, p.maxItems);
      if (taskIds.length === 0) throw unprocessable('NO_READY_ITEMS');
    }
  }
  env.db
    .prepare(
      `INSERT INTO sessions (id, revision, mode, source, source_id, status, queue_snapshot, task_revision_ids, seed, started_at)
       VALUES (?, 1, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    )
    .run(id, p.mode, p.source, sourceId, JSON.stringify(snapshot), JSON.stringify(taskIds), randomBytes(8).toString('hex'), env.now.toISOString());
  env.event('session.started', 'session', id, { source: p.source, mode: p.mode, tasks: taskIds.length });
  env.markCommitted('session.start');
  return {
    entities: [ref(id, 1, 'session')],
    outcome: 'created',
    createdEntityId: id,
    ...(taskIds[0] ? { route: `/exercise/${taskIds[0].toLowerCase()}` } : {}),
  };
}

export function sessionFinish(env: CommandEnv): CommandResult {
  const s = loadSession(env, env.cmd.subjectId);
  requireRevision(s.revision, env.cmd.expectedRevision);
  if (s.status === 'finished') throw unprocessable('SESSION_FINISHED');
  const rows = env.db
    .prepare(
      `SELECT tr.skill_id, tr.modality, tr.correctness, tr.independence FROM target_results tr
       JOIN attempts a ON a.id = tr.attempt_id JOIN contexts c ON c.id = a.context_id WHERE c.session_id = ?`,
    )
    .all(s.id) as Array<{ skill_id: string; modality: string; correctness: string; independence: string }>;
  const independent = new Set<string>();
  const supported = new Set<string>();
  const unresolved = new Set<string>();
  const touched = new Map<string, Target>();
  for (const r of rows) {
    const key = `${r.skill_id}/${r.modality}`;
    touched.set(key, { skillId: r.skill_id, modality: r.modality as Target['modality'] });
    if (r.correctness === 'correct' && r.independence === 'independent') independent.add(key);
    else if (r.independence === 'supported') supported.add(key);
    if (r.correctness === 'unresolved' || r.independence === 'unknown') unresolved.add(key);
  }
  const snapshot = JSON.parse(s.queue_snapshot) as { lessonId?: string };
  let visited = 0;
  let completed = 0;
  if (snapshot.lessonId) {
    const lp = env.db.prepare('SELECT status FROM lesson_progress WHERE lesson_id = ?').get(snapshot.lessonId) as { status: string } | undefined;
    if (lp) {
      visited = 1;
      completed = lp.status === 'completed' ? 1 : 0;
    }
  }
  const recommended = [...touched.entries()]
    .filter(([key]) => loadTarget(env.db, key)?.schedule.pendingNeed === true)
    .map(([, t]) => t)
    .slice(0, 30);
  const summaryId = randomUUID();
  const body: Omit<Summary, 'id' | 'revision'> = {
    visitedLessons: visited,
    completedLessons: completed,
    independentTargets: independent.size,
    supportedTargets: supported.size,
    unresolvedTargets: unresolved.size,
    recommendedTargetIds: recommended,
  };
  env.db.prepare('INSERT INTO summaries (id, revision, session_id, body, created_at) VALUES (?, 1, ?, ?, ?)').run(summaryId, s.id, JSON.stringify(body), env.now.toISOString());
  env.db.prepare("UPDATE sessions SET status = 'finished', revision = revision + 1, finished_at = ?, summary_id = ? WHERE id = ?").run(env.now.toISOString(), summaryId, s.id);
  env.event('session.finished', 'session', s.id, { summaryId });
  env.markCommitted('session.finish');
  return { entities: [ref(s.id, s.revision + 1, 'session')], outcome: 'updated' };
}

interface ProgressRow {
  id: string;
  revision: number;
  lesson_id: string;
  visited_step_ids: string;
  status: 'visited' | 'completed';
}

/** All required teaching steps visited and every usable task of required steps attempted (unresolved allowed). */
function lessonComplete(env: CommandEnv, lesson: LessonBody, visited: ReadonlySet<string>): boolean {
  for (const step of lesson.steps) {
    if (!step.required) continue;
    if (!visited.has(step.id)) return false;
    for (const tid of step.taskIds ?? []) {
      const t = env.repo.task(tid);
      if (!t || !env.repo.isUsable(t.state)) continue;
      const n = env.db
        .prepare('SELECT count(*) AS n FROM attempts a JOIN content_revisions cr ON cr.revision_id = a.task_revision_id WHERE cr.kind = ? AND cr.logical_id = ?')
        .get('task', tid) as { n: number };
      if (n.n === 0) return false;
    }
  }
  return true;
}

/** Introduces every assessed target taught by the lesson (stage 0, due tomorrow) the first time it is visited. */
function introduceLessonTargets(env: CommandEnv, lesson: LessonBody, eventSeq: number): void {
  for (const skillId of lesson.introduces) {
    const skill = env.repo.skill(skillId) as RevisionRow<SkillBody> | undefined;
    if (!skill || !skill.body.assessed) continue;
    for (const modality of skill.body.modalities) {
      const key = `${skillId}/${modality}`;
      const existing = loadTarget(env.db, key);
      if (existing && existing.schedule.introducedDate !== null) continue;
      applyToTarget(env.db, key, { type: 'introduced', date: env.today }, eventSeq);
    }
  }
}

export function lessonProgress(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_lesson_progress;
  const session = loadSession(env, p.sessionId);
  if (session.source !== 'lesson' || !session.source_id) throw unprocessable('NOT_A_LESSON_SESSION');
  const lesson = env.repo.byRevision<LessonBody>(session.source_id);
  if (!lesson) throw unprocessable('UNKNOWN_SOURCE');
  if (!lesson.body.steps.some((s) => s.id === p.stepId)) throw unprocessable('UNKNOWN_STEP');
  const row = env.db.prepare('SELECT * FROM lesson_progress WHERE lesson_id = ?').get(lesson.logicalId) as ProgressRow | undefined;
  if (row) {
    // ASSUMPTION: LessonView.progress carries no id/revision, so expectedRevision 0 merges into the lesson's row
    // (visits are a commutative set union); a non-zero expectedRevision must match the row exactly.
    if (env.cmd.expectedRevision !== 0) {
      if (env.cmd.subjectId.toLowerCase() !== row.id.toLowerCase()) throw conflict('STALE_REVISION', row.revision);
      requireRevision(row.revision, env.cmd.expectedRevision);
    }
  } else {
    requireRevision(existingRevision(env, 'lesson_progress', env.cmd.subjectId), env.cmd.expectedRevision);
  }
  const visited = new Set<string>(row ? (JSON.parse(row.visited_step_ids) as string[]) : []);
  const firstVisit = visited.size === 0;
  visited.add(p.stepId);
  let status: 'visited' | 'completed' = row?.status === 'completed' ? 'completed' : 'visited';
  if (p.action === 'finish' && lessonComplete(env, lesson.body, visited)) status = 'completed';
  const orderedVisited = lesson.body.steps.map((s) => s.id).filter((s) => visited.has(s));
  const id = row?.id ?? env.cmd.subjectId;
  const changed = !row || row.status !== status || JSON.stringify(orderedVisited) !== row.visited_step_ids;
  const revision = row ? (changed ? row.revision + 1 : row.revision) : 1;
  if (!row) {
    env.db
      .prepare("INSERT INTO lesson_progress (id, revision, lesson_id, visited_step_ids, status, updated_at) VALUES (?, 1, ?, ?, ?, ?)")
      .run(id, lesson.logicalId, JSON.stringify(orderedVisited), status, env.now.toISOString());
  } else if (changed) {
    env.db.prepare('UPDATE lesson_progress SET revision = ?, visited_step_ids = ?, status = ?, updated_at = ? WHERE id = ?').run(revision, JSON.stringify(orderedVisited), status, env.now.toISOString(), id);
  }
  if (changed) {
    const seq = env.event('lesson.progressed', 'lesson-progress', id, { lessonId: lesson.logicalId, stepId: p.stepId, action: p.action, status });
    if (firstVisit) introduceLessonTargets(env, lesson.body, seq);
    env.markCommitted('lesson.progress');
  }
  return { entities: [ref(id, revision, 'lesson-progress')], outcome: !row ? 'created' : changed ? 'updated' : 'unchanged', ...(!row ? { createdEntityId: id } : {}) };
}
