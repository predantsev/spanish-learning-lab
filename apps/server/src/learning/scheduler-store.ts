// Persistence of the @sll/domain scheduler projection. Each TargetState (with its journal) is a JSON
// row in target_states; the profile-level fields live in profiles.scheduler_state. Every scheduler
// event is ALSO stored verbatim in its event_log row (payload.scheduler), so `rebuildSchedulerProjection`
// re-folds the identical projection with `rebuild()` (the same reducer as the incremental path).
import {
  applyEvent,
  DEFAULT_TIMEZONE,
  initialSchedulerState,
  PROJECTION_VERSION,
  rebuild,
  type SchedulerEvent,
  type SchedulerState,
  type TargetState,
} from '@sll/domain';
import type { Db } from '../db/connection.ts';

type Meta = Omit<SchedulerState, 'targets'>;

/** A scheduler event without the fields fixed by the event_log row (eventSeq, at). */
export type PendingSchedulerEvent = SchedulerEvent extends infer E ? (E extends SchedulerEvent ? Omit<E, 'eventSeq' | 'at'> : never) : never;

function loadMeta(db: Db): Meta {
  const r = db.prepare('SELECT scheduler_state FROM profiles LIMIT 1').get() as { scheduler_state: string } | undefined;
  const stored = r ? (JSON.parse(r.scheduler_state) as Partial<Meta>) : {};
  const base = initialSchedulerState(DEFAULT_TIMEZONE);
  return {
    projectionVersion: PROJECTION_VERSION,
    timezone: stored.timezone ?? base.timezone,
    lastEventSeq: stored.lastEventSeq ?? 0,
    lastInstant: stored.lastInstant ?? null,
    lastLocalDate: stored.lastLocalDate ?? null,
    invalidatedTaskRevisions: stored.invalidatedTaskRevisions ?? [],
    diagnostics: stored.diagnostics ?? [],
  };
}

function saveMeta(db: Db, s: SchedulerState): void {
  const meta: Meta = {
    projectionVersion: s.projectionVersion,
    timezone: s.timezone,
    lastEventSeq: s.lastEventSeq,
    lastInstant: s.lastInstant,
    lastLocalDate: s.lastLocalDate,
    invalidatedTaskRevisions: s.invalidatedTaskRevisions,
    diagnostics: s.diagnostics,
  };
  db.prepare('UPDATE profiles SET scheduler_state = ?').run(JSON.stringify(meta));
}

function rowToTarget(state: string): TargetState {
  return JSON.parse(state) as TargetState;
}

/** Task revisions whose evidence is already excluded (item-invalidated). */
export function invalidatedRevisions(db: Db): ReadonlySet<string> {
  return new Set(loadMeta(db).invalidatedTaskRevisions);
}

export function targetState(db: Db, key: string): TargetState | undefined {
  const i = key.lastIndexOf('/');
  const r = db.prepare('SELECT state FROM target_states WHERE skill_id = ? AND modality = ?').get(key.slice(0, i), key.slice(i + 1)) as { state: string } | undefined;
  if (!r) return undefined;
  const ts = rowToTarget(r.state);
  return ts.target ? ts : undefined;
}

export function allTargetStates(db: Db): TargetState[] {
  const rows = db.prepare('SELECT state FROM target_states ORDER BY skill_id, modality').all() as Array<{ state: string }>;
  return rows.map((r) => rowToTarget(r.state)).filter((ts) => typeof ts.target === 'string');
}

function writeTarget(db: Db, ts: TargetState): void {
  const i = ts.target.lastIndexOf('/');
  db.prepare(
    `INSERT INTO target_states (skill_id, modality, revision, stage, due_date, pending_need, frequency, paused, introduced_date, last_offered_sequence, state, projection_version, last_event_seq)
     VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
     ON CONFLICT(skill_id, modality) DO UPDATE SET revision = target_states.revision + 1, stage = excluded.stage, due_date = excluded.due_date,
       pending_need = excluded.pending_need, frequency = excluded.frequency, paused = excluded.paused, introduced_date = excluded.introduced_date,
       state = excluded.state, projection_version = excluded.projection_version, last_event_seq = excluded.last_event_seq`,
  ).run(ts.target.slice(0, i), ts.target.slice(i + 1), ts.stage, ts.dueDate, ts.pendingNeed ? 1 : 0, ts.frequency, ts.paused ? 1 : 0, ts.introducedDate, JSON.stringify(ts), PROJECTION_VERSION, ts.lastEventSeq);
}

/** Target keys an event can touch; `item-invalidated` may touch any target. */
function touchedKeys(event: SchedulerEvent): readonly string[] | 'all' {
  switch (event.kind) {
    case 'introduced':
    case 'support-delivered':
    case 'preference-set':
      return event.targets;
    case 'attempt-result':
    case 'adjudication':
      return event.results.map((r) => r.target);
    case 'item-invalidated':
      return 'all';
    case 'timezone-changed':
      return [];
  }
}

/** Loads the meta plus the targets the event can touch (applyEvent reads nothing else). */
function loadFor(db: Db, keys: readonly string[] | 'all'): SchedulerState {
  const targets: Record<string, TargetState> = {};
  if (keys === 'all') for (const ts of allTargetStates(db)) targets[ts.target] = ts;
  else
    for (const k of new Set(keys)) {
      const ts = targetState(db, k);
      if (ts) targets[k] = ts;
    }
  return { ...loadMeta(db), targets };
}

/** Folds one event (eventSeq = its event_log row) into the persisted projection; writes changed targets only. */
export function applySchedulerEvent(db: Db, event: SchedulerEvent): SchedulerState {
  const before = loadFor(db, touchedKeys(event));
  const after = applyEvent(before, event);
  for (const [key, ts] of Object.entries(after.targets)) if (before.targets[key] !== ts) writeTarget(db, ts);
  saveMeta(db, after);
  return after;
}

/** Rebuilds target_states + scheduler meta from event_log (payload.scheduler), identical to the incremental fold. */
export function rebuildSchedulerProjection(db: Db): SchedulerState {
  const rows = db.prepare("SELECT event_seq, occurred_at, payload FROM event_log WHERE json_extract(payload, '$.scheduler') IS NOT NULL ORDER BY event_seq").all() as Array<{
    event_seq: number;
    occurred_at: string;
    payload: string;
  }>;
  const events = rows.map((r) => ({ ...(JSON.parse(r.payload) as { scheduler: PendingSchedulerEvent }).scheduler, eventSeq: r.event_seq, at: r.occurred_at }) as SchedulerEvent);
  const state = rebuild(events, DEFAULT_TIMEZONE);
  db.prepare('DELETE FROM target_states').run();
  for (const ts of Object.values(state.targets)) writeTarget(db, ts);
  saveMeta(db, state);
  return state;
}
