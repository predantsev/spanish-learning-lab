// Projection `target_states` (rebuildable from event_log): one row per (skillId, modality).
// The full schedule state lives in the JSON `state` column; the scalar columns mirror it for queries.
import type { Target } from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import { applyScheduleEvent, EMPTY_SCHEDULE, type ScheduleEvent, type TargetSchedule } from '../domain-adapter.ts';
import { parseTargetKey, targetKey, type TargetKey } from '../content/types.ts';

export const PROJECTION_VERSION = 1;

interface Row {
  skill_id: string;
  modality: string;
  revision: number;
  last_offered_sequence: number;
  state: string;
  last_event_seq: number;
}

export interface TargetProjection {
  readonly key: TargetKey;
  readonly target: Target;
  readonly revision: number;
  readonly lastOfferedSequence: number;
  readonly lastEventSeq: number;
  readonly schedule: TargetSchedule;
}

function toProjection(r: Row): TargetProjection {
  const target = { skillId: r.skill_id, modality: r.modality as Target['modality'] };
  const parsed = JSON.parse(r.state) as Partial<TargetSchedule>;
  return {
    key: targetKey(target),
    target,
    revision: r.revision,
    lastOfferedSequence: r.last_offered_sequence,
    lastEventSeq: r.last_event_seq,
    schedule: { ...EMPTY_SCHEDULE, ...parsed },
  };
}

export function loadTarget(db: Db, key: TargetKey): TargetProjection | undefined {
  const t = parseTargetKey(key);
  const r = db.prepare('SELECT skill_id, modality, revision, last_offered_sequence, state, last_event_seq FROM target_states WHERE skill_id = ? AND modality = ?').get(t.skillId, t.modality) as Row | undefined;
  return r ? toProjection(r) : undefined;
}

export function allTargets(db: Db): TargetProjection[] {
  const rows = db.prepare('SELECT skill_id, modality, revision, last_offered_sequence, state, last_event_seq FROM target_states ORDER BY skill_id, modality').all() as Row[];
  return rows.map(toProjection);
}

export function saveTarget(db: Db, key: TargetKey, schedule: TargetSchedule, eventSeq: number): void {
  const t = parseTargetKey(key);
  db.prepare(
    `INSERT INTO target_states (skill_id, modality, revision, stage, due_date, pending_need, frequency, paused, introduced_date, last_offered_sequence, state, projection_version, last_event_seq)
     VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
     ON CONFLICT(skill_id, modality) DO UPDATE SET revision = target_states.revision + 1, stage = excluded.stage, due_date = excluded.due_date,
       pending_need = excluded.pending_need, frequency = excluded.frequency, paused = excluded.paused, introduced_date = excluded.introduced_date,
       state = excluded.state, projection_version = excluded.projection_version, last_event_seq = excluded.last_event_seq`,
  ).run(
    t.skillId,
    t.modality,
    schedule.stage,
    schedule.dueDate,
    schedule.pendingNeed ? 1 : 0,
    schedule.frequency,
    schedule.paused ? 1 : 0,
    schedule.introducedDate,
    JSON.stringify(schedule),
    PROJECTION_VERSION,
    eventSeq,
  );
}

/** Applies one schedule event to a target projection; returns the new schedule and eligibility. */
export function applyToTarget(db: Db, key: TargetKey, event: ScheduleEvent, eventSeq: number): { schedule: TargetSchedule; eligible: boolean } {
  const current = loadTarget(db, key)?.schedule ?? EMPTY_SCHEDULE;
  const { state, eligible } = applyScheduleEvent(current, event);
  saveTarget(db, key, state, eventSeq);
  return { schedule: state, eligible };
}

export function setOffered(db: Db, key: TargetKey, sequence: number): void {
  const t = parseTargetKey(key);
  db.prepare('UPDATE target_states SET last_offered_sequence = ? WHERE skill_id = ? AND modality = ?').run(sequence, t.skillId, t.modality);
}
