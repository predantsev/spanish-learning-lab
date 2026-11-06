// Recommended review selection: due lanes from the target projection (domain queue), then one
// least-recently-used eligible held-out task per selected target.
import type { Db } from '../db/connection.ts';
import type { ContentRepository, RevisionRow } from '../content/repository.ts';
import type { TaskBody, TargetKey } from '../content/types.ts';
import { LISTENING_MODALITIES, targetKey } from '../content/types.ts';
import { buildQueue, isDue, queueCount, type QueueCandidate } from '../domain-adapter.ts';
import { allTargets, type TargetProjection } from './targets.ts';

export interface QueueState {
  readonly cursor: number;
  readonly offerSeq: number;
}

export function readQueueState(db: Db): QueueState {
  const r = db.prepare('SELECT queue_state FROM profiles LIMIT 1').get() as { queue_state: string } | undefined;
  const q = r ? (JSON.parse(r.queue_state) as Partial<QueueState>) : {};
  return { cursor: typeof q.cursor === 'number' ? q.cursor : 0, offerSeq: typeof q.offerSeq === 'number' ? q.offerSeq : 0 };
}

export function writeQueueState(db: Db, q: QueueState): void {
  db.prepare('UPDATE profiles SET queue_state = ?').run(JSON.stringify(q));
}

export function candidateOf(p: TargetProjection): QueueCandidate {
  return {
    key: p.key,
    dueDate: p.schedule.dueDate,
    pendingNeed: p.schedule.pendingNeed,
    frequency: p.schedule.frequency,
    paused: p.schedule.paused,
    introduced: p.schedule.introducedDate !== null,
    lastOfferedSequence: p.lastOfferedSequence,
  };
}

export function dueTargets(db: Db, today: string): TargetProjection[] {
  return allTargets(db).filter((p) => isDue(candidateOf(p), today));
}

/** Least-recently-used eligible held-out task for a target; prefers a family other than the last eligible check. */
export function chooseTask(db: Db, repo: ContentRepository, key: TargetKey, lastFamily: string | null, exclude: ReadonlySet<string>): RevisionRow<TaskBody> | undefined {
  const tasks = repo
    .tasks()
    .filter((t) => repo.isUsable(t.state) && t.body.role !== 'supported' && !exclude.has(t.revisionId) && t.body.targets.some((x) => targetKey(x) === key));
  if (tasks.length === 0) return undefined;
  const lastUsed = (revisionId: string): string => {
    const r = db.prepare('SELECT max(submitted_at) AS t FROM attempts WHERE task_revision_id = ?').get(revisionId) as { t: string | null };
    return r.t ?? '';
  };
  const roleRank = (t: TaskBody): number => (t.role === 'delayed' || t.role === 'transfer' ? 0 : 1);
  return tasks
    .map((t) => ({ t, used: lastUsed(t.revisionId) }))
    .sort(
      (a, b) =>
        Number(a.t.body.family === lastFamily) - Number(b.t.body.family === lastFamily) ||
        roleRank(a.t.body) - roleRank(b.t.body) ||
        a.used.localeCompare(b.used) ||
        a.t.logicalId.localeCompare(b.t.logicalId) ||
        a.t.revisionId.localeCompare(b.t.revisionId),
    )[0]?.t;
}

export interface RecommendedSelection {
  readonly keys: TargetKey[];
  readonly taskRevisionIds: string[];
  readonly missingVariety: TargetKey[];
  readonly cursor: number;
}

/** Pure selection for a recommended session (no persistence; the caller persists cursor/offers on start). */
export function selectRecommended(
  db: Db,
  repo: ContentRepository,
  input: { today: string; minutes: number; maxItems: number; scope: ReadonlySet<TargetKey>; listeningOnly: boolean; cursor: number },
): RecommendedSelection {
  const projections = allTargets(db).filter(
    (p) => (input.scope.size === 0 || input.scope.has(p.key)) && (!input.listeningOnly || LISTENING_MODALITIES.has(p.target.modality)),
  );
  const count = queueCount(input.minutes, input.maxItems);
  const { selected, cursor } = buildQueue(projections.map(candidateOf), input.today, count, input.cursor);
  const byKey = new Map(projections.map((p) => [p.key, p]));
  const taskIds: string[] = [];
  const keys: TargetKey[] = [];
  const missing: TargetKey[] = [];
  const used = new Set<string>();
  for (const key of selected) {
    const task = chooseTask(db, repo, key, byKey.get(key)?.schedule.lastEligibleFamily ?? null, used);
    if (!task) {
      missing.push(key);
      continue;
    }
    used.add(task.revisionId);
    taskIds.push(task.revisionId);
    keys.push(key);
  }
  return { keys, taskRevisionIds: taskIds, missingVariety: missing, cursor };
}
