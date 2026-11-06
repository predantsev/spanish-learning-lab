// docs/ACCEPTANCE.md A-09 … A-16 as exact domain scenarios on synthetic fixtures
// (tz Europe/Madrid, injected clock starting 2026-10-01T08:00:00Z).
import { describe, expect, it } from 'vitest';
import {
  addDays,
  applyEvent,
  assessEvidence,
  checkResponse,
  initialQueueState,
  initialSchedulerState,
  initialTargetState as initialTarget,
  localDate,
  manualClock,
  parseInstant,
  proposeSession,
  rebuild,
  stableLabel,
  startSession,
} from '@sll/domain';
import type { SchedulerEvent, SchedulerState, SessionProposal, TargetKey, TargetState } from '@sll/domain';
import {
  CHOICE,
  CLIP_A,
  CLIP_B,
  CLOCK_START,
  EventLog,
  HABER,
  HECHO,
  SHOP,
  T01,
  T02,
  T03,
  T04,
  T05,
  T06,
  T07,
  T08,
  T09,
  T09_RULE_HINT,
  T10,
  T11,
  TZ,
  at,
  correct,
  deepFreeze,
  queueTasks,
} from './fixtures.ts';

/** Incremental application, event by event, in eventSeq order. */
function fold(events: readonly SchedulerEvent[], timezone = TZ): SchedulerState {
  return events.reduce<SchedulerState>((s, e) => applyEvent(s, e, s.timezone), initialSchedulerState(timezone));
}

function target(state: SchedulerState, key: TargetKey): TargetState {
  const ts = state.targets[key];
  if (ts === undefined) throw new Error(`no state for ${key}`);
  return ts;
}

/** Applies events one by one and returns the state after the last one. */
function applyAll(state: SchedulerState, events: readonly SchedulerEvent[]): SchedulerState {
  return events.reduce<SchedulerState>((s, e) => applyEvent(s, e, s.timezone), state);
}

function propose(state: SchedulerState, today: string, extra: Partial<Parameters<typeof proposeSession>[0]> = {}): SessionProposal {
  return proposeSession({
    today,
    targets: Object.values(state.targets),
    tasks: queueTasks(),
    queueState: initialQueueState(),
    sessionSeed: 'session-fixture-0001',
    ...extra,
  });
}

describe('acceptance A-09 … A-16 (domain)', () => {
  it('A-09 ladder 1/3/7/14/30 from the actual check date, cap 30, no absence failures', () => {
    const clock = manualClock(CLOCK_START);
    const log = new EventLog();
    log.introduce(clock.now(), [HECHO]);
    let state = applyAll(initialSchedulerState(TZ), log.events);
    expect(target(state, HECHO)).toMatchObject({ stage: 0, dueDate: '2026-10-02', introducedDate: '2026-10-01', pendingNeed: false });

    // Correct independent held-out checks; alternating families so each check is a new context.
    const checks: Array<[string, typeof T01, string, number]> = [
      ['2026-10-02', T01, '2026-10-05', 1],
      ['2026-10-05', T02, '2026-10-12', 2],
      ['2026-10-12', T01, '2026-10-26', 3],
      ['2026-10-26', T02, '2026-11-25', 4],
      ['2026-11-25', T01, '2026-12-25', 4],
      ['2027-01-10', T02, '2027-02-09', 4], // late: scheduled from the actual Jan 10 check, cap 30
    ];
    for (const [date, task, expectedDue, expectedStage] of checks) {
      if (date === '2027-01-10') {
        // Between Dec 25 and Jan 10 nothing happens: no events, no failures, one overdue item.
        expect(target(state, HECHO).dueDate).toBe('2026-12-25');
        const home = propose(state, '2027-01-10');
        expect(home.items.filter((i) => i.target === HECHO)).toHaveLength(1);
      }
      clock.set(at(date));
      const before = log.events.length;
      log.submit(clock.now(), task, correct(task));
      state = applyAll(state, log.events.slice(before));
      expect(target(state, HECHO), date).toMatchObject({ dueDate: expectedDue, stage: expectedStage, pendingNeed: false });
    }
    const hecho = target(state, HECHO);
    expect(hecho.history.map((h) => [h.date, h.outcome])).toEqual([
      ['2026-10-02', 'success'],
      ['2026-10-05', 'success'],
      ['2026-10-12', 'success'],
      ['2026-10-26', 'success'],
      ['2026-11-25', 'success'],
      ['2027-01-10', 'success'],
    ]);
    expect(hecho.history.some((h) => h.outcome !== 'success')).toBe(false);
    expect(hecho.journal.filter((j) => j.kind === 'attempt')).toHaveLength(6); // no stacked/missed events
    expect(rebuild(log.events, TZ)).toStrictEqual(state);
  });

  it('A-10 targeted hecho hint resets only hecho; immediate repetition does not clear need; history kept', () => {
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO, HABER, CHOICE]);
    log.submit(at('2026-10-02'), T01, correct(T01));
    log.submit(at('2026-10-02', '08:05:00'), T03, correct(T03));
    log.submit(at('2026-10-02', '08:10:00'), T05, correct(T05));
    const day2 = fold(log.events);
    for (const key of [HECHO, HABER, CHOICE]) expect(target(day2, key)).toMatchObject({ stage: 1, dueDate: '2026-10-05' });

    // Oct 3: rule hint for the participle only, delivered during the supported task, then submit.
    const hintEvents = [log.support(at('2026-10-03'), 'rule', [HECHO])];
    const { verdicts } = log.submit(at('2026-10-03', '08:01:00'), T09, correct(T09), [T09_RULE_HINT]);
    expect(verdicts).toEqual([
      { target: { skillId: 'perfecto.haber', modality: 'written-form' }, correctness: 'correct', independence: 'independent', explanationKey: 'check.slot:aux:correct' },
      { target: { skillId: 'participle.hecho', modality: 'written-form' }, correctness: 'correct', independence: 'supported', explanationKey: 'check.slot:part:correct' },
    ]);
    // Correct immediate repetition, independent.
    log.submit(at('2026-10-03', '08:03:00'), T01, correct(T01));
    const day3 = fold(log.events);
    expect(hintEvents).toHaveLength(1);
    expect(target(day3, HECHO)).toMatchObject({ stage: 0, dueDate: '2026-10-04', pendingNeed: true, knownStep: 'disabled' });
    expect(target(day3, HECHO).history.map((h) => [h.date, h.outcome])).toEqual([['2026-10-02', 'success']]);
    // Unrelated targets: haber was practiced but not due (extra practice), tense choice untouched.
    expect(target(day3, HABER)).toMatchObject({ stage: 1, dueDate: '2026-10-05', pendingNeed: false });
    expect(target(day3, CHOICE)).toStrictEqual(target(day2, CHOICE));

    // A clear error the next day: stage stays 0, history keeps the earlier success.
    log.submit(at('2026-10-04'), T02, { text: 'Hoy he hacido la cena.' });
    const day4 = fold(log.events);
    expect(target(day4, HECHO)).toMatchObject({ stage: 0, dueDate: '2026-10-05', pendingNeed: true });
    expect(target(day4, HECHO).history.map((h) => [h.date, h.outcome])).toEqual([
      ['2026-10-02', 'success'],
      ['2026-10-04', 'error'],
    ]);
  });

  it('A-11 support is mapped per target: rule/clue/interface/replay/speed/transcript/unknown relevance', () => {
    const hechoHaber = checkResponse(T09, correct(T09));
    const listening = checkResponse(T07, correct(T07));
    const ind = (r: ReturnType<typeof assessEvidence>) => r.map((v) => [`${v.target.skillId}/${v.target.modality}`, v.correctness, v.independence]);

    // Rule targeted at the form: only the participle is supported.
    expect(ind(assessEvidence(hechoHaber, [{ kind: 'rule', targets: [HECHO] }]))).toEqual([
      [HABER, 'correct', 'independent'],
      [HECHO, 'correct', 'supported'],
    ]);
    // Vocabulary-only clue: no grammar target mapped → no effect.
    expect(ind(assessEvidence(hechoHaber, [{ kind: 'translation', targets: [] }]))).toEqual([
      [HABER, 'correct', 'independent'],
      [HECHO, 'correct', 'independent'],
    ]);
    // Interface `?` help is neutral even if a client maps it to targets.
    expect(ind(assessEvidence(hechoHaber, [{ kind: 'interface-help', targets: [HECHO, HABER] }]))).toEqual([
      [HABER, 'correct', 'independent'],
      [HECHO, 'correct', 'independent'],
    ]);
    // Replay and speed change are neutral for listening.
    expect(ind(assessEvidence(listening, [{ kind: 'replay', targets: [SHOP] }, { kind: 'speed-change', targets: [SHOP] }]))).toEqual([
      [SHOP, 'correct', 'independent'],
    ]);
    // Transcript affects the listening target, not a written target it happens to be mapped to.
    expect(ind(assessEvidence(listening, [{ kind: 'transcript', targets: [SHOP] }]))).toEqual([[SHOP, 'correct', 'supported']]);
    expect(ind(assessEvidence(hechoHaber, [{ kind: 'transcript', targets: [HECHO, HABER] }]))).toEqual([
      [HABER, 'correct', 'independent'],
      [HECHO, 'correct', 'independent'],
    ]);
    // Unknown relevance: uncertain, never wrong (correctness untouched).
    expect(ind(assessEvidence(hechoHaber, [{ kind: 'external-help', targets: [], relevance: 'unclear' }]))).toEqual([
      [HABER, 'correct', 'unknown'],
      [HECHO, 'correct', 'unknown'],
    ]);
    expect(ind(assessEvidence(hechoHaber, [{ kind: 'delivery-unknown', targets: [HABER] }]))).toEqual([
      [HABER, 'correct', 'unknown'],
      [HECHO, 'correct', 'independent'],
    ]);

    // Scheduler effects of the same support kinds.
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO, HABER, SHOP]);
    log.submit(at('2026-10-02'), T01, correct(T01));
    log.submit(at('2026-10-02', '08:05:00'), T03, correct(T03));
    log.submit(at('2026-10-02', '08:10:00'), T07, correct(T07));
    const base = fold(log.events);
    log.support(at('2026-10-03'), 'rule', [HECHO]);
    log.support(at('2026-10-03', '08:01:00'), 'translation', []); // vocabulary gloss
    log.support(at('2026-10-03', '08:02:00'), 'interface-help', [HABER]);
    log.support(at('2026-10-03', '08:03:00'), 'replay', [SHOP]);
    log.support(at('2026-10-03', '08:04:00'), 'speed-change', [SHOP]);
    const afterNeutral = fold(log.events);
    expect(target(afterNeutral, HECHO)).toMatchObject({ stage: 0, dueDate: '2026-10-04', pendingNeed: true });
    expect(target(afterNeutral, HABER)).toStrictEqual(target(base, HABER)); // not even an exposure
    expect(target(afterNeutral, SHOP)).toStrictEqual(target(base, SHOP));
    log.support(at('2026-10-03', '08:05:00'), 'transcript', [SHOP, HABER]);
    const afterTranscript = fold(log.events);
    expect(target(afterTranscript, SHOP)).toMatchObject({ stage: 0, dueDate: '2026-10-04', pendingNeed: true });
    expect(target(afterTranscript, HABER)).toStrictEqual(target(base, HABER));
    // Oct 5, haber due: a correct answer whose help relevance is unclear → unknown: no credit, no error.
    log.submit(at('2026-10-05'), T04, correct(T04), [{ kind: 'external-help', targets: [HABER], relevance: 'unclear' }]);
    const day5 = fold(log.events);
    expect(target(day5, HABER)).toMatchObject({ stage: 1, dueDate: '2026-10-05', pendingNeed: false, lastExposureDate: '2026-10-05' });
    expect(target(day5, HABER).history.at(-1)).toMatchObject({ date: '2026-10-05', outcome: 'unknown' });
  });

  it('A-12 repeat-more cap 7, known 7→14→30, error overrides acceleration, pause precedence', () => {
    // --- Repeat more (haber) ---
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HABER]);
    log.submit(at('2026-10-02'), T03, correct(T03));
    log.preference(at('2026-10-03'), [HABER], { frequency: 'repeat-more' });
    let s = fold(log.events);
    expect(target(s, HABER)).toMatchObject({ dueDate: '2026-10-04', frequency: 'repeat-more', stage: 1 }); // ≤ tomorrow
    const haberChecks: Array<[string, typeof T03, number, string]> = [
      ['2026-10-04', T04, 2, '2026-10-11'],
      ['2026-10-11', T03, 3, '2026-10-18'], // ladder 14 capped at 7
      ['2026-10-18', T04, 4, '2026-10-25'], // ladder 30 capped at 7
      ['2026-10-25', T03, 4, '2026-11-01'], // stage preserved at 4, still capped
    ];
    for (const [date, task, stage, due] of haberChecks) {
      log.submit(at(date), task, correct(task));
      s = fold(log.events);
      expect(target(s, HABER), date).toMatchObject({ stage, dueDate: due });
    }
    log.preference(at('2026-10-26'), [HABER], { frequency: 'usual' });
    s = fold(log.events);
    expect(target(s, HABER)).toMatchObject({ frequency: 'usual', dueDate: '2026-11-01', stage: 4 }); // dueDate retained
    log.submit(at('2026-11-01'), T04, correct(T04));
    s = fold(log.events);
    expect(target(s, HABER)).toMatchObject({ stage: 4, dueDate: '2026-12-01' }); // usual ladder resumes (30)

    // --- Known (tense choice) ---
    const k = new EventLog();
    k.introduce(at('2026-10-01'), [CHOICE]);
    k.submit(at('2026-10-02'), T05, correct(T05));
    k.preference(at('2026-10-03'), [CHOICE], { frequency: 'known' });
    let ks = fold(k.events);
    expect(target(ks, CHOICE)).toMatchObject({ stage: 1, knownStep: 0, dueDate: '2026-10-10', frequency: 'known' });
    expect(target(ks, CHOICE).history).toHaveLength(1); // Known records no pass
    const knownChecks: Array<[string, typeof T05, number, string, unknown]> = [
      ['2026-10-10', T06, 2, '2026-10-24', 1], // +14
      ['2026-10-24', T05, 3, '2026-11-23', 2], // +30
      ['2026-11-23', T06, 4, '2026-12-23', 2], // +30
    ];
    for (const [date, task, stage, due, knownStep] of knownChecks) {
      k.submit(at(date), task, correct(task));
      ks = fold(k.events);
      expect(target(ks, CHOICE), date).toMatchObject({ stage, dueDate: due, knownStep });
    }
    expect(stableLabel(target(ks, CHOICE)).stable).toBe(true);
    // A clear error (extra practice before due) → tomorrow, acceleration disabled, label kept as preference.
    k.submit(at('2026-12-01'), T05, { optionId: 'b' });
    ks = fold(k.events);
    expect(target(ks, CHOICE)).toMatchObject({ stage: 0, dueDate: '2026-12-02', knownStep: 'disabled', frequency: 'known', pendingNeed: true });
    // The error was extra practice (not an eligible check), so it revokes the label as later support/error.
    expect(stableLabel(target(ks, CHOICE))).toEqual({ stable: false, reasonKey: 'evidence.notStable.laterSupport' });
    // Normal ladder afterwards (no Known acceleration) until stable again.
    const ladder: Array<[string, typeof T05, string]> = [
      ['2026-12-02', T05, '2026-12-05'],
      ['2026-12-05', T06, '2026-12-12'],
      ['2026-12-12', T05, '2026-12-26'],
    ];
    for (const [date, task, due] of ladder) {
      k.submit(at(date), task, correct(task));
      ks = fold(k.events);
      expect(target(ks, CHOICE), date).toMatchObject({ dueDate: due, knownStep: 'disabled' });
    }
    expect(stableLabel(target(ks, CHOICE)).stable).toBe(true); // regained …
    expect(target(ks, CHOICE).knownStep).toBe('disabled'); // … but acceleration stays disabled
    k.preference(at('2026-12-13'), [CHOICE], { frequency: 'known' }); // explicit reselect without need
    ks = fold(k.events);
    expect(target(ks, CHOICE)).toMatchObject({ knownStep: 0, dueDate: '2026-12-26' }); // longer due kept
    k.submit(at('2026-12-26'), T06, correct(T06));
    ks = fold(k.events);
    expect(target(ks, CHOICE)).toMatchObject({ stage: 4, knownStep: 1, dueDate: '2027-01-25' }); // max(ladder 30, 14)

    // --- Pause (participle) ---
    const p = new EventLog();
    p.introduce(at('2026-10-01'), [HECHO]);
    p.submit(at('2026-10-02'), T01, correct(T01));
    p.submit(at('2026-10-05'), T02, correct(T02));
    p.preference(at('2026-10-08'), [HECHO], { paused: true });
    p.preference(at('2026-10-09'), [HECHO], { frequency: 'repeat-more' });
    let ps = fold(p.events);
    expect(target(ps, HECHO)).toMatchObject({ paused: true, frequency: 'repeat-more', dueDate: '2026-10-10', stage: 2 });
    expect(propose(ps, '2026-10-12').items.map((i) => i.target)).not.toContain(HECHO); // pause beats repeat-more
    p.submit(at('2026-10-14'), T01, correct(T01)); // manual qualifying attempt while paused
    ps = fold(p.events);
    expect(target(ps, HECHO)).toMatchObject({ paused: true, stage: 3, dueDate: '2026-10-21' }); // advanced, still paused
    p.preference(at('2026-10-15'), [HECHO], { frequency: 'usual' });
    p.preference(at('2026-10-30'), [HECHO], { paused: false }); // resume after the due date passed
    ps = fold(p.events);
    expect(target(ps, HECHO)).toMatchObject({ paused: false, dueDate: '2026-10-21', stage: 3 });
    expect(propose(ps, '2026-10-30').items.map((i) => i.target)).toEqual([HECHO]); // overdue → eligible today
  });

  it('A-13 stable only at threshold; repeated context and second same-day attempt cannot advance', () => {
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [SHOP]);
    log.submit(at('2026-10-02'), T07, correct(T07)); // clip A
    log.preference(at('2026-10-02', '09:00:00'), [SHOP], { frequency: 'repeat-more' });
    log.submit(at('2026-10-03'), T08, correct(T08)); // clip B
    log.preference(at('2026-10-03', '09:00:00'), [SHOP], { frequency: 'usual' });
    log.preference(at('2026-10-03', '09:01:00'), [SHOP], { frequency: 'repeat-more' });
    log.submit(at('2026-10-04'), T07, correct(T07)); // clip A
    let s = fold(log.events);
    expect(target(s, SHOP).history.map((h) => h.date)).toEqual(['2026-10-02', '2026-10-03', '2026-10-04']);
    expect(stableLabel(target(s, SHOP))).toEqual({ stable: false, reasonKey: 'evidence.notStable.span' }); // < 7 days

    log.submit(at('2026-10-11'), T08, correct(T08)); // clip B, span Oct 3 → Oct 11 = 8 days
    s = fold(log.events);
    expect(target(s, SHOP)).toMatchObject({ stage: 4, dueDate: '2026-10-18' });
    expect(stableLabel(target(s, SHOP))).toEqual({ stable: true, reasonKey: 'evidence.stable' });
    const last3 = target(s, SHOP).history.slice(-3);
    expect(new Set(last3.map((h) => h.clipHash))).toEqual(new Set([CLIP_A, CLIP_B]));

    // Replaying the same prompt/recording on the due date: no advance.
    log.submit(at('2026-10-18'), T08, correct(T08));
    s = fold(log.events);
    expect(target(s, SHOP)).toMatchObject({ stage: 4, dueDate: '2026-10-18', lastExposureDate: '2026-10-18' });
    // A second submission the same day, even with the other clip: no advance.
    log.submit(at('2026-10-18', '10:00:00'), T07, correct(T07));
    s = fold(log.events);
    expect(target(s, SHOP)).toMatchObject({ dueDate: '2026-10-18', lastEligibleDate: '2026-10-11' });
    // Next day the distinct clip qualifies once.
    log.submit(at('2026-10-19'), T07, correct(T07));
    const second = log.submit(at('2026-10-19', '12:00:00'), T08, correct(T08)).event;
    s = fold(log.events);
    expect(target(s, SHOP)).toMatchObject({ dueDate: '2026-10-26', lastEligibleDate: '2026-10-19' });
    expect(target(s, SHOP).history).toHaveLength(5);

    // Review adjudication of an already-checked attempt never adds a recall event or a second advance.
    const before = target(s, SHOP);
    log.add({
      kind: 'adjudication',
      at: at('2026-10-21'),
      adjudicationId: 'adj-a13',
      attemptId: second.attemptId,
      results: [{ target: SHOP, correctness: 'correct', independence: 'independent' }],
    });
    s = fold(log.events);
    const after = target(s, SHOP);
    expect(after.history).toStrictEqual(before.history);
    expect(after).toMatchObject({ dueDate: before.dueDate, stage: before.stage, lastExposureDate: '2026-10-19' });
  });

  it('A-14 support vs correctness, unresolved, quarantine and late adjudication rebuild chronologically', () => {
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO, HABER, CHOICE, SHOP]);
    log.support(at('2026-10-02'), T09_RULE_HINT.kind, T09_RULE_HINT.targets);
    const a1 = log.submit(at('2026-10-02', '08:01:00'), T09, correct(T09), [T09_RULE_HINT]);
    expect(a1.verdicts.map((v) => [v.correctness, v.independence])).toEqual([
      ['correct', 'independent'],
      ['correct', 'supported'],
    ]);
    const a3 = log.submit(at('2026-10-03'), T11, { optionId: 'b' }); // quarantined later
    const a2 = log.submit(at('2026-10-05'), T10, { text: 'Hoy he comido paella.' }); // free text
    expect(a2.verdicts).toEqual([
      { target: { skillId: 'perfecto.haber', modality: 'written-form' }, correctness: 'unresolved', independence: 'independent', explanationKey: 'check.unresolved.rubric' },
    ]);
    let s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 0, pendingNeed: true, dueDate: '2026-10-03' }); // supported correct
    expect(target(s, HABER)).toMatchObject({ stage: 1, dueDate: '2026-10-05', pendingNeed: false }); // unresolved: neither
    expect(target(s, SHOP)).toMatchObject({ stage: 0, pendingNeed: true, dueDate: '2026-10-04' });
    expect(a3.event.taskRevisionId).toBe(T11.revisionId);

    // Quarantine the invalid item: its evidence disappears; the overdue check is eligible now.
    log.add({ kind: 'item-invalidated', at: at('2026-10-06'), taskRevisionId: T11.revisionId });
    const beforeAdjudication = fold(log.events);
    s = beforeAdjudication;
    expect(target(s, SHOP)).toMatchObject({ stage: 0, pendingNeed: false, dueDate: '2026-10-02', history: [] });
    expect(propose(s, '2026-10-06').items.find((i) => i.target === SHOP)).toMatchObject({ lane: 'O' });

    // Validated late per-target adjudication with the explicit original support (independent).
    log.add({
      kind: 'adjudication',
      at: at('2026-10-08'),
      adjudicationId: 'adj-a14',
      attemptId: a2.event.attemptId,
      results: [{ target: HABER, correctness: 'correct', independence: 'independent' }],
    });
    s = fold(log.events);
    const haber = target(s, HABER);
    expect(haber).toMatchObject({ stage: 2, dueDate: '2026-10-12' }); // from the Oct 5 attempt, not Oct 8
    expect(haber.history.map((h) => [h.date, h.outcome])).toEqual([
      ['2026-10-02', 'success'],
      ['2026-10-05', 'success'],
    ]);
    const corrected = haber.journal.find((j) => j.kind === 'attempt' && j.attemptId === a2.event.attemptId);
    expect(corrected).toMatchObject({ correctness: 'correct', original: { correctness: 'unresolved' }, adjudicationIds: ['adj-a14'] });
    // Unrelated state unchanged.
    for (const key of [HECHO, CHOICE, SHOP]) expect(target(s, key)).toStrictEqual(target(beforeAdjudication, key));

    // Later attempts on the quarantined revision stay excluded.
    log.submit(at('2026-10-09'), T11, { optionId: 'b' });
    const later = fold(log.events);
    expect(target(later, SHOP)).toMatchObject({ stage: 0, pendingNeed: false, dueDate: '2026-10-02', history: [] });

    // Deterministic chronological rebuild, independent of insertion order.
    const shuffled = [...log.events].reverse();
    expect(rebuild(shuffled, TZ)).toStrictEqual(later);
    expect(rebuild(log.events, TZ)).toStrictEqual(rebuild(log.events, TZ));
  });

  it('A-15 lanes R,S,O,R,O with empty skips, fair persisted order, exclusions, labeled missing variety', () => {
    const today = '2026-10-12';
    const k = (name: string) => `queue.${name}/written-form` as TargetKey;
    const base = (key: TargetKey, over: Partial<TargetState>): TargetState => ({
      ...initialTarget(key),
      introducedDate: '2026-09-01',
      stage: 1,
      ...over,
    });
    const targets: TargetState[] = [
      base(k('r1'), { frequency: 'repeat-more', dueDate: '2026-10-10' }),
      base(k('r2'), { frequency: 'repeat-more', dueDate: '2026-10-12' }),
      base(k('s1'), { pendingNeed: true, dueDate: '2026-10-09' }),
      base(k('s2'), { pendingNeed: true, dueDate: '2026-10-11' }),
      base(k('s3'), { pendingNeed: true, dueDate: '2026-10-12' }),
      base(k('o1'), { dueDate: '2026-10-01' }),
      base(k('o2'), { dueDate: '2026-10-05' }),
      base(k('o3'), { dueDate: '2026-10-08' }),
      base(k('o4'), { dueDate: '2026-10-10' }),
      base(k('o5'), { dueDate: '2026-10-11' }),
      base(k('o6'), {
        dueDate: '2026-10-12',
        history: [{ date: '2026-10-05', eventSeq: 1, attemptId: 'x', contextFamily: 'fam.o6.a', clipHash: null, outcome: 'success' }],
      }),
      base(k('paused'), { frequency: 'repeat-more', paused: true, dueDate: '2026-10-01' }),
      base(k('unready'), { dueDate: '2026-10-01' }),
      base(k('outside'), { dueDate: '2026-10-01' }),
      base(k('later'), { dueDate: '2026-10-13' }),
      { ...initialTarget(k('fresh')) }, // not introduced: no new lesson inserted into review
      base('queue.l1/listening-meaning' as TargetKey, { dueDate: '2026-10-01' }),
    ];
    const tasks = targets.map((ts, i) => ({
      taskId: `A2-02-L1-T${String(i + 1).padStart(2, '0')}`,
      revision: 1,
      targets: [ts.target],
      role: 'delayed' as const,
      contextFamily: ts.target.includes('o6') ? 'fam.o6.a' : `fam.${i}.b`,
      clipHash: ts.modality === 'listening-meaning' ? CLIP_A : null,
      ready: !ts.target.includes('unready'),
      lastUsedSeq: null,
    }));
    const scope = targets.map((ts) => ts.target).filter((key) => !key.includes('outside'));
    const request = deepFreeze({
      today,
      targets,
      tasks,
      scope,
      modalities: ['written-form' as const],
      budget: { kind: 'minutes' as const, minutes: 10 },
      queueState: initialQueueState(),
      sessionSeed: 'a15-session-1',
    });

    // Viewing home repeatedly is side-effect free.
    const first = proposeSession(request);
    expect(proposeSession(request)).toStrictEqual(first);
    expect(proposeSession(request)).toStrictEqual(first);
    expect(request.queueState).toStrictEqual(initialQueueState());
    expect(first.itemCap).toBe(10);
    const names = (p: SessionProposal) => p.items.map((i) => i.target.slice('queue.'.length, -'/written-form'.length));
    expect(names(first)).toEqual(['r1', 's1', 'o1', 'r2', 'o2', 's2', 'o3', 'o4', 's3', 'o5']);
    expect(first.items.map((i) => i.lane).join('')).toBe('RSOROSOOSO'); // R empty after r2: skipped
    expect(new Set(first.items.map((i) => i.target)).size).toBe(first.items.length); // one per target
    for (const excluded of ['paused', 'unready', 'outside', 'later', 'fresh']) expect(names(first)).not.toContain(excluded);
    expect(first.items.some((i) => i.target.startsWith('queue.l1'))).toBe(false);
    expect(first.nextQueueState).toMatchObject({ revision: 1, cursor: 3, offerSequence: 10 });

    // Start the session: only now is the fair order persisted. The next proposal continues the pattern
    // and gives never-offered o6 its turn first (labeled: no varied held-out task for it).
    const persisted = startSession(request.queueState, first);
    expect(() => startSession(persisted, first)).toThrow(/stale|revision/);
    const second = proposeSession({ ...request, queueState: persisted, sessionSeed: 'a15-session-2' });
    expect(names(second)).toEqual(['r1', 'o6', 'r2', 's1', 'o1', 'o2', 's2', 'o3', 'o4', 's3']);
    const o6 = second.items.find((i) => i.target === k('o6'));
    expect(o6).toMatchObject({ scored: false, reasonKey: 'queue.extra.varietyMissing' });
    expect(second.shortages).toEqual([{ target: k('o6'), reasonKey: 'queue.shortage.variety' }]);
    expect(second.items.filter((i) => i.target !== k('o6')).every((i) => i.scored)).toBe(true);

    // And at the scheduler level the repeated context gives no advance.
    const log = new EventLog();
    log.introduce(at('2026-10-01'), [HECHO]);
    log.submit(at('2026-10-02'), T01, correct(T01));
    log.submit(at('2026-10-05'), T01, correct(T01)); // same family as the preceding eligible check
    const s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 1, dueDate: '2026-10-05', lastExposureDate: '2026-10-05' });
  });

  it('A-16 DST 25 h day, missed dates, OS travel, explicit zone edit and clock backward', () => {
    // Europe/Madrid 2026-10-25 lasts 25 hours; local dates, not 86,400 s multiples, define intervals.
    expect(localDate('2026-10-24T22:30:00Z', TZ)).toBe('2026-10-25');
    expect(localDate('2026-10-25T22:30:00Z', TZ)).toBe('2026-10-25'); // 24 h later, same local date
    expect(localDate('2026-10-25T23:30:00Z', TZ)).toBe('2026-10-26');
    const naive = new Date(parseInstant('2026-10-24T22:30:00Z') + 86_400_000).toISOString();
    expect(localDate(naive, TZ)).toBe('2026-10-25'); // the naive "+1 day" would not reach the due date
    const log = new EventLog();
    log.introduce('2026-10-24T22:30:00Z', [HECHO]);
    let s = fold(log.events);
    expect(target(s, HECHO).dueDate).toBe('2026-10-26');
    log.submit('2026-10-25T22:30:00Z', T01, correct(T01)); // 24 h after introduction, still Oct 25
    s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 0, dueDate: '2026-10-26', lastEligibleDate: null });
    log.submit('2026-10-25T23:30:00Z', T02, correct(T02)); // Oct 26 00:30 local
    s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 1, dueDate: '2026-10-29', lastEligibleDate: '2026-10-26' });

    // Missed dates: nothing happens for weeks; one overdue item, then scheduling from the actual date.
    expect(propose(s, '2026-11-20').items.filter((i) => i.target === HECHO)).toHaveLength(1);
    log.submit(at('2026-11-20'), T01, correct(T01));
    s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 2, dueDate: '2026-11-27' });
    expect(target(s, HECHO).history.every((h) => h.outcome === 'success')).toBe(true);

    // OS timezone travel changes nothing (the domain only uses the profile zone).
    const originalTz = process.env.TZ;
    try {
      for (const osZone of ['America/New_York', 'Asia/Tokyo', 'UTC']) {
        process.env.TZ = osZone;
        expect(rebuild(log.events, TZ)).toStrictEqual(s);
      }
    } finally {
      if (originalTz === undefined) delete process.env.TZ;
      else process.env.TZ = originalTz;
    }
    expect(() => applyEvent(s, { kind: 'introduced', eventSeq: 999, at: at('2026-11-21'), targets: [CHOICE] }, 'Asia/Tokyo')).toThrow(
      /timezone/,
    );

    // Explicit zone edit: existing due labels/history kept, future dates use the new zone.
    log.add({ kind: 'timezone-changed', at: at('2026-11-20', '10:00:00'), timezone: 'America/New_York' });
    const edited = fold(log.events);
    expect(edited.timezone).toBe('America/New_York');
    expect({ ...target(edited, HECHO), lastEventSeq: 0 }).toStrictEqual({ ...target(s, HECHO), lastEventSeq: 0 });
    log.submit('2026-11-28T03:00:00Z', T02, correct(T02)); // Madrid Nov 28, New York Nov 27
    s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 3, dueDate: '2026-12-11', lastEligibleDate: '2026-11-27' });
    expect(target(s, HECHO).history.map((h) => h.date)).toEqual(['2026-10-26', '2026-11-20', '2026-11-27']);

    // Clock moves backward: eventSeq order is kept, the date is clamped, no duplicated advance.
    log.submit('2026-11-26T12:00:00Z', T01, correct(T01));
    s = fold(log.events);
    expect(target(s, HECHO)).toMatchObject({ stage: 3, dueDate: '2026-12-11', lastEligibleDate: '2026-11-27' });
    expect(s.diagnostics.at(-1)).toMatchObject({ code: 'clock-backward', detail: '2026-11-26T12:00:00Z<2026-11-28T03:00:00Z' });
    expect(s.lastEventSeq).toBe(log.events.at(-1)?.eventSeq);
    expect(() => applyEvent(s, { ...(log.events.at(-1) as SchedulerEvent) })).toThrow(/eventSeq/);
    expect(rebuild([...log.events].reverse(), TZ)).toStrictEqual(s);
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');

    // A zone edit to a zone behind the old one holds the local date instead of reversing it,
    // and is not reported as a clock problem.
    const z = new EventLog();
    z.introduce('2026-11-20T23:30:00Z', [HECHO]); // Madrid Nov 21 00:30
    z.add({ kind: 'timezone-changed', at: '2026-11-20T23:40:00Z', timezone: 'America/New_York' });
    z.submit('2026-11-21T01:00:00Z', T01, correct(T01)); // New York Nov 20 20:00
    const zs = fold(z.events);
    expect(zs.diagnostics.map((d) => d.code)).toEqual(['local-date-clamped']);
    expect(target(zs, HECHO)).toMatchObject({ introducedDate: '2026-11-21', dueDate: '2026-11-22', lastExposureDate: '2026-11-21' });
  });
});
