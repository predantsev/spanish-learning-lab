// Recommended review through the @sll/domain queue: proposeSession is pure (viewing home never
// consumes priority); the persisted QueueState changes only through startSession when the learner
// actually starts the session.
import {
  estimateSecondsPerItem,
  initialQueueState,
  isDue,
  LISTENING_MODALITIES,
  proposeSession,
  sessionItemCap,
  startSession,
  type QueueState,
  type QueueTask,
  type SessionProposal,
  type TargetKey,
  type TargetState,
} from '@sll/domain';
import type { Db } from '../db/connection.ts';
import type { ContentRepository } from '../content/repository.ts';
import { targetKey } from '../content/types.ts';
import { allTargetStates } from './scheduler-store.ts';

export function readQueueState(db: Db): QueueState {
  const r = db.prepare('SELECT queue_state FROM profiles LIMIT 1').get() as { queue_state: string } | undefined;
  const q = r ? (JSON.parse(r.queue_state) as Partial<QueueState>) : {};
  const base = initialQueueState();
  return {
    revision: typeof q.revision === 'number' ? q.revision : base.revision,
    cursor: typeof q.cursor === 'number' ? q.cursor : base.cursor,
    offerSequence: typeof q.offerSequence === 'number' ? q.offerSequence : base.offerSequence,
    lastOfferedSequence: q.lastOfferedSequence && typeof q.lastOfferedSequence === 'object' ? q.lastOfferedSequence : base.lastOfferedSequence,
  };
}

function writeQueueState(db: Db, q: QueueState): void {
  db.prepare('UPDATE profiles SET queue_state = ?').run(JSON.stringify(q));
}

/** Ready (usable, not quarantined) installed tasks as queue candidates; LRU by the last attempt on the logical task. */
export function queueTasks(db: Db, repo: ContentRepository): QueueTask[] {
  const lastUse = new Map(
    (db
      .prepare('SELECT cr.logical_id AS id, max(a.rowid) AS seq FROM attempts a JOIN content_revisions cr ON cr.revision_id = a.task_revision_id GROUP BY cr.logical_id')
      .all() as Array<{ id: string; seq: number }>).map((r) => [r.id, r.seq]),
  );
  return repo.tasks().map((t) => ({
    taskId: t.logicalId,
    revision: repo.revisionOrdinal('task', t.logicalId, t.revisionId),
    targets: t.body.targets.map((x) => targetKey(x) as TargetKey),
    role: t.body.role,
    contextFamily: t.body.family,
    clipHash: repo.taskAudioHashes(t.body)[0] ?? null,
    ready: repo.isUsable(t.state),
    lastUsedSeq: lastUse.get(t.logicalId) ?? null,
  }));
}

export function dueTargets(db: Db, today: string): TargetState[] {
  return allTargetStates(db).filter((ts) => isDue(ts, today) && !ts.paused);
}

export interface RecommendedSelection {
  readonly proposal: SessionProposal;
  readonly taskRevisionIds: string[];
}

/** Proposes and STARTS a recommended session (persists the advanced queue state). */
export function startRecommended(
  db: Db,
  repo: ContentRepository,
  input: { today: string; minutes: number; maxItems: number; scope: readonly string[]; listeningOnly: boolean; seed: string },
): RecommendedSelection {
  const queueState = readQueueState(db);
  const estimate = estimateSecondsPerItem([]);
  const count = Math.min(input.maxItems, sessionItemCap({ kind: 'minutes', minutes: input.minutes }, estimate));
  const proposal = proposeSession({
    today: input.today,
    targets: allTargetStates(db),
    tasks: queueTasks(db, repo),
    scope: input.scope.length > 0 ? (input.scope as TargetKey[]) : null,
    modalities: input.listeningOnly ? LISTENING_MODALITIES : null,
    budget: { kind: 'count', count },
    queueState,
    sessionSeed: input.seed,
  });
  const taskRevisionIds: string[] = [];
  for (const item of proposal.items) {
    const t = repo.task(item.taskId);
    if (t) taskRevisionIds.push(t.revisionId);
  }
  if (taskRevisionIds.length > 0) writeQueueState(db, startSession(queueState, proposal));
  return { proposal, taskRevisionIds };
}
