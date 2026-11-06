import { describe, expect, it } from 'vitest';
import {
  DomainError,
  INTERVALS,
  addDays,
  applyEvent,
  createPrng,
  evidenceLabel,
  foldJournal,
  initialSchedulerState,
  rebuild,
  seededShuffle,
  stableLabel,
} from '@sll/domain';
import type { Correctness, Independence, SchedulerEvent, SchedulerState, SupportKind, TargetKey } from '@sll/domain';
import { ALL_TARGETS, CHOICE, CLIP_A, CLIP_B, EventLog, HECHO, SHOP, T01, T02, TZ, at, correct, deepFreeze } from './fixtures.ts';
import type { NewEvent } from './fixtures.ts';

function fold(events: readonly SchedulerEvent[], timezone = TZ): SchedulerState {
  return events.reduce<SchedulerState>((s, e) => applyEvent(s, e), initialSchedulerState(timezone));
}

/** Seeded random event streams with every event kind, including corrections and clock jumps. */
function randomEvents(seed: number, count: number): SchedulerEvent[] {
  const rnd = createPrng(seed);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)] as T;
  const zones = ['Europe/Madrid', 'America/New_York', 'Asia/Tokyo'];
  const supportKinds: SupportKind[] = ['rule', 'targeted-clue', 'translation', 'transcript', 'reveal', 'interface-help', 'replay', 'delivery-unknown', 'learner-reported-help'];
  const corr: Correctness[] = ['correct', 'correct', 'correct', 'incorrect', 'unresolved', 'invalid-item'];
  const ind: Independence[] = ['independent', 'independent', 'independent', 'supported', 'unknown'];
  const revisions = ['A2-01-L1-T01@1', 'A2-01-L1-T02@1', 'A2-01-L2-T01@1', 'A2-01-L3-T01@1', 'A2-01-L3-T02@1'];
  const families = ['fam.a', 'fam.b', 'fam.c'];
  let ms = Date.parse('2026-10-01T08:00:00Z');
  const attempts: string[] = [];
  const out: SchedulerEvent[] = [];
  const push = (e: NewEvent) => out.push({ ...e, eventSeq: out.length + 1 } as SchedulerEvent);
  push({ kind: 'introduced', at: new Date(ms).toISOString(), targets: ALL_TARGETS.filter(() => rnd() < 0.8) });
  for (let i = 0; i < count; i += 1) {
    const jump = rnd() < 0.05 ? -Math.floor(rnd() * 3) * 86_400_000 : Math.floor(rnd() * 4) * 86_400_000 + Math.floor(rnd() * 20) * 3_600_000;
    ms += jump;
    const instant = new Date(ms).toISOString();
    const r = rnd();
    if (r < 0.5) {
      const id = `att-${seed}-${i}`;
      attempts.push(id);
      const targets = ALL_TARGETS.filter(() => rnd() < 0.5);
      push({
        kind: 'attempt-result',
        at: instant,
        attemptId: id,
        taskRevisionId: pick(revisions),
        results: (targets.length > 0 ? targets : [pick(ALL_TARGETS)]).map((target) => ({
          target,
          correctness: pick(corr),
          independence: pick(ind),
          contextFamily: pick(families),
          clipHash: pick([CLIP_A, CLIP_B, null]),
          itemReady: rnd() < 0.95,
        })),
      });
    } else if (r < 0.62) {
      push({ kind: 'support-delivered', at: instant, supportKind: pick(supportKinds), targets: ALL_TARGETS.filter(() => rnd() < 0.4), withinAssessedTask: rnd() < 0.7 });
    } else if (r < 0.75) {
      const change = rnd() < 0.7 ? { frequency: pick(['usual', 'repeat-more', 'known'] as const) } : { paused: rnd() < 0.5 };
      push({ kind: 'preference-set', at: instant, targets: [pick(ALL_TARGETS)], ...change });
    } else if (r < 0.87 && attempts.length > 0) {
      push({
        kind: 'adjudication',
        at: instant,
        adjudicationId: `adj-${seed}-${i}`,
        attemptId: pick(attempts),
        results: [{ target: pick(ALL_TARGETS), correctness: pick(corr), independence: pick(ind) }],
      });
    } else if (r < 0.9) {
      push({ kind: 'item-invalidated', at: instant, taskRevisionId: pick(revisions) });
    } else if (r < 0.93) {
      push({ kind: 'timezone-changed', at: instant, timezone: pick(zones) });
    } else {
      push({ kind: 'introduced', at: instant, targets: [pick(ALL_TARGETS)] });
    }
  }
  return out;
}

describe('scheduler', () => {
  it('rebuild(events) equals incremental application for shuffled-insertion inputs (property)', () => {
    const seen = { successes: 0, corrected: 0, invalidated: 0, clockBackward: 0, zoneChanges: 0, knownActive: 0 };
    for (let seed = 1; seed <= 60; seed += 1) {
      const events = randomEvents(seed, 150);
      let incremental = initialSchedulerState(TZ);
      for (const [i, e] of events.entries()) {
        if (i % 25 === 0) deepFreeze(incremental); // purity: applying never mutates its input
        incremental = applyEvent(incremental, e);
        if (Object.values(incremental.targets).some((t) => t.knownStep === 1 || t.knownStep === 2)) seen.knownActive += 1;
      }
      const shuffled = seededShuffle(events, seed * 7919);
      expect(shuffled).not.toEqual(events);
      expect(rebuild(shuffled, TZ), `seed ${seed}`).toStrictEqual(incremental);
      // Each target's projection is exactly the fold of its own journal.
      for (const ts of Object.values(incremental.targets)) {
        expect(foldJournal(ts.target, ts.journal), `seed ${seed} ${ts.target}`).toStrictEqual(ts);
        seen.successes += ts.history.filter((h) => h.outcome === 'success').length;
        seen.corrected += ts.journal.filter((j) => j.kind === 'attempt' && j.adjudicationIds.length > 0).length;
        seen.invalidated += ts.journal.filter((j) => j.kind === 'attempt' && j.invalidated).length;
      }
      seen.clockBackward += incremental.diagnostics.filter((d) => d.code === 'clock-backward').length;
      seen.zoneChanges += events.filter((e) => e.kind === 'timezone-changed').length;
    }
    // The generator really exercises advances, corrections, quarantine, zone edits and clock jumps.
    for (const [name, count] of Object.entries(seen)) expect(count, name).toBeGreaterThan(10);
  });

  it('keeps invariants on random streams: stage range, one advance per date, dates from the ladder', () => {
    for (let seed = 100; seed < 130; seed += 1) {
      const state = rebuild(randomEvents(seed, 120), TZ);
      for (const ts of Object.values(state.targets)) {
        expect(ts.stage).toBeGreaterThanOrEqual(0);
        expect(ts.stage).toBeLessThanOrEqual(4);
        const successDates = ts.history.filter((h) => h.outcome === 'success').map((h) => h.date);
        expect(new Set(successDates).size, `${seed} ${ts.target}`).toBe(successDates.length);
        if (ts.introducedDate === null) expect(ts.dueDate).toBeNull();
      }
    }
  });

  it('rejects out-of-order or duplicate eventSeq and invalid targets/zones', () => {
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO]);
    const s = fold(log.events);
    expect(() => applyEvent(s, { ...(log.events[0] as SchedulerEvent) })).toThrow(DomainError);
    expect(() => rebuild([...log.events, ...log.events])).toThrow(/duplicate eventSeq/);
    expect(() => applyEvent(s, { kind: 'introduced', eventSeq: 5, at: at('2026-10-02'), targets: ['nope' as TargetKey] })).toThrow(/target/);
    expect(() => applyEvent(s, { kind: 'timezone-changed', eventSeq: 5, at: at('2026-10-02'), timezone: 'Mars/Base' })).toThrow(/timezone/);
    expect(() => applyEvent(s, { kind: 'preference-set', eventSeq: 5, at: at('2026-10-02'), targets: [HECHO] })).toThrow(/frequency or paused/);
    expect(() => initialSchedulerState('Nowhere/City')).toThrow(/timezone/);
  });

  it('never schedules unintroduced targets and keeps the ladder constants', () => {
    expect(INTERVALS).toEqual([1, 3, 7, 14, 30]);
    const log = new EventLog();
    log.submit(at('2026-10-02'), T01, { text: 'hacido' });
    log.preference(at('2026-10-02', '09:00:00'), [HECHO], { frequency: 'known' });
    let s = fold(log.events);
    expect(s.targets[HECHO]).toMatchObject({ introducedDate: null, dueDate: null, pendingNeed: false, knownStep: null, lastExposureDate: '2026-10-02' });
    expect(evidenceLabel(s.targets[HECHO]!)).toBeNull();
    log.introduce(at('2026-10-03'), [HECHO]);
    s = fold(log.events);
    expect(s.targets[HECHO]).toMatchObject({ introducedDate: '2026-10-03', dueDate: '2026-10-04', stage: 0 });
    expect(evidenceLabel(s.targets[HECHO]!)).toBe('introduced');
  });

  it('records adjudication supersession, recomputes, and labels evidence', () => {
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO]);
    const first = log.submit(at('2026-10-02'), T01, { text: 'hecha' }).event; // closed → incorrect
    let s = fold(log.events);
    expect(s.targets[HECHO]).toMatchObject({ stage: 0, pendingNeed: true, dueDate: '2026-10-03' });
    expect(evidenceLabel(s.targets[HECHO]!)).toBe('supported');
    const adjudicate = (id: string, correctness: Correctness, independence: Independence, day: string) =>
      log.add({ kind: 'adjudication', at: at(day), adjudicationId: id, attemptId: first.attemptId, results: [{ target: HECHO, correctness, independence }] });
    adjudicate('adj-1', 'correct', 'independent', '2026-10-04');
    s = fold(log.events);
    expect(s.targets[HECHO]).toMatchObject({ stage: 1, pendingNeed: false, dueDate: '2026-10-05' });
    expect(evidenceLabel(s.targets[HECHO]!)).toBe('independent');
    adjudicate('adj-2', 'unresolved', 'independent', '2026-10-06'); // supersedes adj-1
    s = fold(log.events);
    expect(s.targets[HECHO]).toMatchObject({ stage: 0, pendingNeed: false, dueDate: '2026-10-02', history: [] });
    expect(evidenceLabel(s.targets[HECHO]!)).toBe('uncertain');
    const entry = s.targets[HECHO]!.journal.find((j) => j.kind === 'attempt');
    expect(entry).toMatchObject({ adjudicationIds: ['adj-1', 'adj-2'], original: { correctness: 'incorrect', independence: 'independent' } });
    // Unknown attempt ids are diagnosed, not invented.
    log.add({ kind: 'adjudication', at: at('2026-10-07'), adjudicationId: 'adj-3', attemptId: 'missing', results: [{ target: HECHO, correctness: 'correct', independence: 'independent' }] });
    s = fold(log.events);
    expect(s.diagnostics.at(-1)).toMatchObject({ code: 'unknown-attempt' });
  });

  it('stable label needs three successes over >= 7 days, two families, two clips for listening', () => {
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO, CHOICE]);
    for (const [day, task] of [
      ['2026-10-02', T01],
      ['2026-10-05', T02],
      ['2026-10-12', T01],
    ] as const) {
      log.submit(at(day), task, correct(task));
    }
    const s = fold(log.events);
    expect(stableLabel(s.targets[HECHO]!)).toEqual({ stable: true, reasonKey: 'evidence.stable' });
    expect(evidenceLabel(s.targets[HECHO]!)).toBe('stable');
    const single = { ...s.targets[HECHO]!, history: s.targets[HECHO]!.history.map((h) => ({ ...h, contextFamily: 'same' })) };
    expect(stableLabel(single)).toEqual({ stable: false, reasonKey: 'evidence.notStable.families' });
    const listening = { ...s.targets[HECHO]!, target: SHOP, modality: 'listening-meaning' as const, history: s.targets[HECHO]!.history.map((h) => ({ ...h, clipHash: CLIP_A })) };
    expect(stableLabel(listening)).toEqual({ stable: false, reasonKey: 'evidence.notStable.audio' });
    expect(stableLabel(s.targets[CHOICE]!)).toEqual({ stable: false, reasonKey: 'evidence.notStable.fewerChecks' });
    expect(addDays('2026-10-05', 7)).toBe('2026-10-12');
  });
});
