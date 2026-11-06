// Recommended review queue (DOMAIN-SPEC §Scheduler, queue paragraphs). Pure: proposing a session
// never changes persistent priority; the caller persists `nextQueueState` only when the learner
// actually starts the proposed session (`startSession`).
import { compareDates } from './calendar.ts';
import { hashSeed } from './random.ts';
import { isDistinctContext, isDue } from './scheduler.ts';
import { DomainError, compareCodeUnits } from './types.ts';
import type { CalendarDate, Modality, TargetKey, TaskRole } from './types.ts';
import type { TargetState } from './scheduler.ts';

export type Lane = 'R' | 'S' | 'O';
/** Weighted persistent round robin: R=repeat-more, S=pending need, O=other due. */
export const LANE_PATTERN: readonly Lane[] = ['R', 'S', 'O', 'R', 'O'];
export const DEFAULT_ITEM_ESTIMATE_SECONDS = 60;
export const MIN_SAMPLES_FOR_MEDIAN = 10;
export const ACTIVE_SECONDS_BOUNDS = [5, 180] as const;
export const MAX_SESSION_ITEMS = 30;
export const DEFAULT_SESSION_MINUTES = 10;
export const DEFAULT_SESSION_COUNT = 10;
const HELD_OUT_ROLES: readonly TaskRole[] = ['delayed', 'transfer'];

/** Persisted between sessions; changes only through `startSession`. */
export interface QueueState {
  readonly revision: number;
  /** Index into LANE_PATTERN of the next lane turn. */
  readonly cursor: number;
  readonly offerSequence: number;
  readonly lastOfferedSequence: Readonly<Record<string, number>>;
}

export function initialQueueState(): QueueState {
  return { revision: 0, cursor: 0, offerSequence: 0, lastOfferedSequence: {} };
}

/** A ready reviewed task revision that can be offered for a target. */
export interface QueueTask {
  readonly taskId: string;
  readonly revision: number;
  readonly targets: readonly TargetKey[];
  readonly role: TaskRole;
  readonly contextFamily: string;
  readonly clipHash?: string | null;
  /** Ready, valid, not quarantined. Unready tasks are ignored. */
  readonly ready: boolean;
  /** Sequence of the last attempt on this task; null/absent = never used (least recently used first). */
  readonly lastUsedSeq?: number | null;
}

export type SessionBudget = { readonly kind: 'minutes'; readonly minutes: number } | { readonly kind: 'count'; readonly count: number };

export interface QueueRequest {
  readonly today: CalendarDate;
  readonly targets: readonly TargetState[];
  readonly tasks: readonly QueueTask[];
  /** Selected scope; null/absent = all introduced ready targets. Never broadened. */
  readonly scope?: readonly TargetKey[] | null;
  /** Chosen modality filter; null/absent = every modality. */
  readonly modalities?: readonly Modality[] | null;
  /** Default 10 minutes. */
  readonly budget?: SessionBudget;
  /** Active seconds of real attempts in this mode (for the per-item estimate). */
  readonly activeSeconds?: readonly number[];
  readonly queueState: QueueState;
  /** Stored session seed; only optional prompt shuffle may use it. */
  readonly sessionSeed: string;
}

export interface SessionItem {
  readonly target: TargetKey;
  readonly lane: Lane;
  readonly dueDate: CalendarDate;
  readonly taskId: string;
  readonly revision: number;
  /** False = labeled extra practice that cannot advance the delayed stage. */
  readonly scored: boolean;
  readonly reasonKey: string;
}

export interface ContentShortage {
  readonly target: TargetKey;
  readonly reasonKey: 'queue.shortage.variety' | 'queue.shortage.heldOut';
}

export interface SessionProposal {
  readonly baseRevision: number;
  readonly items: readonly SessionItem[];
  readonly itemCap: number;
  readonly estimateSeconds: number;
  readonly seed: number;
  readonly shortages: readonly ContentShortage[];
  /** Due targets skipped because every candidate task is already in this session. */
  readonly deferred: readonly TargetKey[];
  readonly nextQueueState: QueueState;
}

/** 60 s until at least 10 real attempts, then the median of times bounded to 5–180 s. */
export function estimateSecondsPerItem(activeSeconds: readonly number[] = []): number {
  const [lo, hi] = ACTIVE_SECONDS_BOUNDS;
  const samples = activeSeconds.filter((s) => Number.isFinite(s)).map((s) => Math.min(hi, Math.max(lo, s)));
  if (samples.length < MIN_SAMPLES_FOR_MEDIAN) return DEFAULT_ITEM_ESTIMATE_SECONDS;
  samples.sort((a, b) => a - b);
  const mid = samples.length >>> 1;
  return samples.length % 2 === 1 ? (samples[mid] as number) : ((samples[mid - 1] as number) + (samples[mid] as number)) / 2;
}

/** Count cap = min(30, ceil(minutes × 60 / estimate)), at least 1; or the manual count capped at 30. */
export function sessionItemCap(budget: SessionBudget, estimateSeconds: number): number {
  if (budget.kind === 'count') {
    if (!Number.isFinite(budget.count)) throw new DomainError('invalid-budget', 'item count must be finite');
    return Math.max(1, Math.min(MAX_SESSION_ITEMS, Math.floor(budget.count)));
  }
  if (!Number.isFinite(budget.minutes) || budget.minutes <= 0) throw new DomainError('invalid-budget', 'minutes must be positive');
  if (!Number.isFinite(estimateSeconds) || estimateSeconds <= 0) throw new DomainError('invalid-budget', 'estimate must be positive');
  return Math.max(1, Math.min(MAX_SESSION_ITEMS, Math.ceil((budget.minutes * 60) / estimateSeconds)));
}

export function laneOf(ts: TargetState): Lane {
  if (ts.frequency === 'repeat-more') return 'R';
  if (ts.pendingNeed) return 'S';
  return 'O';
}

function compareLru(a: QueueTask, b: QueueTask): number {
  const ua = a.lastUsedSeq ?? Number.NEGATIVE_INFINITY;
  const ub = b.lastUsedSeq ?? Number.NEGATIVE_INFINITY;
  if (ua !== ub) return ua < ub ? -1 : 1;
  return compareCodeUnits(a.taskId, b.taskId) || a.revision - b.revision;
}

interface Choice {
  readonly task: QueueTask;
  readonly scored: boolean;
  readonly reasonKey: string;
  readonly shortage?: ContentShortage['reasonKey'];
}

/**
 * Least-recently used ready held-out task whose context differs from the immediately preceding
 * eligible check. Without such variety the target is still offered, labeled as extra practice.
 */
function chooseTask(ts: TargetState, candidates: readonly QueueTask[], used: ReadonlySet<string>): Choice | null {
  const fresh = candidates.filter((t) => !used.has(t.taskId)).sort(compareLru);
  if (fresh.length === 0) return null;
  const heldOut = fresh.filter((t) => HELD_OUT_ROLES.includes(t.role));
  const previous = ts.history.at(-1);
  const varied = heldOut.find((t) => isDistinctContext(ts.modality, previous, t));
  if (varied !== undefined) return { task: varied, scored: true, reasonKey: 'queue.review.due' };
  if (heldOut.length > 0) {
    return { task: heldOut[0] as QueueTask, scored: false, reasonKey: 'queue.extra.varietyMissing', shortage: 'queue.shortage.variety' };
  }
  return { task: fresh[0] as QueueTask, scored: false, reasonKey: 'queue.extra.noHeldOut', shortage: 'queue.shortage.heldOut' };
}

/**
 * Proposes the recommended review set. Side-effect free: the same request always yields the same
 * proposal, and the persisted queue state is untouched until `startSession`.
 */
export function proposeSession(request: QueueRequest): SessionProposal {
  const { today, queueState } = request;
  const estimateSeconds = estimateSecondsPerItem(request.activeSeconds ?? []);
  const itemCap = sessionItemCap(request.budget ?? { kind: 'minutes', minutes: DEFAULT_SESSION_MINUTES }, estimateSeconds);
  const scope = request.scope == null ? null : new Set<string>(request.scope);
  const modalities = request.modalities == null ? null : new Set<Modality>(request.modalities);
  const readyTasks = request.tasks.filter((t) => t.ready);
  const candidatesFor = (key: TargetKey): QueueTask[] => readyTasks.filter((t) => t.targets.includes(key));

  const lanes: Record<Lane, TargetState[]> = { R: [], S: [], O: [] };
  for (const ts of request.targets) {
    if (!isDue(ts, today) || ts.paused) continue; // pause overrides every automatic lane
    if (scope !== null && !scope.has(ts.target)) continue;
    if (modalities !== null && !modalities.has(ts.modality)) continue;
    if (candidatesFor(ts.target).length === 0) continue; // unready
    lanes[laneOf(ts)].push(ts);
  }
  const offered = queueState.lastOfferedSequence;
  const byPriority = (a: TargetState, b: TargetState): number => {
    const oa = offered[a.target] ?? Number.NEGATIVE_INFINITY;
    const ob = offered[b.target] ?? Number.NEGATIVE_INFINITY;
    if (oa !== ob) return oa < ob ? -1 : 1;
    return compareDates(a.dueDate as CalendarDate, b.dueDate as CalendarDate) || compareCodeUnits(a.target, b.target);
  };
  for (const lane of Object.values(lanes)) lane.sort(byPriority);

  const items: SessionItem[] = [];
  const shortages: ContentShortage[] = [];
  const deferred: TargetKey[] = [];
  const usedTasks = new Set<string>();
  const next: Record<Lane, number> = { R: 0, S: 0, O: 0 };
  const start = ((queueState.cursor % LANE_PATTERN.length) + LANE_PATTERN.length) % LANE_PATTERN.length;
  let cursor = start;
  let nextCursor = start;
  let emptyTurns = 0;
  while (items.length < itemCap && emptyTurns < LANE_PATTERN.length) {
    const lane = LANE_PATTERN[cursor] as Lane;
    const turn = cursor;
    cursor = (cursor + 1) % LANE_PATTERN.length;
    let produced = false;
    const queue = lanes[lane];
    while (next[lane] < queue.length) {
      const ts = queue[next[lane]] as TargetState;
      next[lane] += 1;
      const choice = chooseTask(ts, candidatesFor(ts.target), usedTasks);
      if (choice === null) {
        deferred.push(ts.target);
        continue;
      }
      usedTasks.add(choice.task.taskId);
      items.push({
        target: ts.target,
        lane,
        dueDate: ts.dueDate as CalendarDate,
        taskId: choice.task.taskId,
        revision: choice.task.revision,
        scored: choice.scored,
        reasonKey: choice.reasonKey,
      });
      if (choice.shortage !== undefined) shortages.push({ target: ts.target, reasonKey: choice.shortage });
      produced = true;
      break;
    }
    if (produced) {
      emptyTurns = 0;
      nextCursor = (turn + 1) % LANE_PATTERN.length;
    } else {
      emptyTurns += 1; // empty lane: skipped
    }
  }

  let offerSequence = queueState.offerSequence;
  const lastOfferedSequence: Record<string, number> = { ...queueState.lastOfferedSequence };
  for (const item of items) {
    offerSequence += 1;
    lastOfferedSequence[item.target] = offerSequence;
  }
  return {
    baseRevision: queueState.revision,
    items,
    itemCap,
    estimateSeconds,
    seed: hashSeed(request.sessionSeed),
    shortages,
    deferred,
    nextQueueState: {
      revision: queueState.revision + 1,
      cursor: items.length > 0 ? nextCursor : queueState.cursor,
      offerSequence,
      lastOfferedSequence,
    },
  };
}

/** Commits a proposal when the learner starts it. A proposal built from an older state is rejected. */
export function startSession(current: QueueState, proposal: SessionProposal): QueueState {
  if (proposal.baseRevision !== current.revision) {
    throw new DomainError('stale-proposal', `proposal built on queue revision ${proposal.baseRevision}, current is ${current.revision}`);
  }
  return proposal.nextQueueState;
}

/**
 * Removes items whose task revision was quarantined after the snapshot, with a visible reason.
 * Never substitutes another item (and therefore never reaches outside the selected scope).
 */
export function pruneQuarantined(
  items: readonly SessionItem[],
  isQuarantined: (taskId: string, revision: number) => boolean,
): { kept: SessionItem[]; removed: { item: SessionItem; reasonKey: 'queue.removed.quarantined' }[] } {
  const kept: SessionItem[] = [];
  const removed: { item: SessionItem; reasonKey: 'queue.removed.quarantined' }[] = [];
  for (const item of items) {
    if (isQuarantined(item.taskId, item.revision)) removed.push({ item, reasonKey: 'queue.removed.quarantined' });
    else kept.push(item);
  }
  return { kept, removed };
}
