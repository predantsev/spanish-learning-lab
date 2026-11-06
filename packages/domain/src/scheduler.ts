// Event-sourced per-target review scheduler (DOMAIN-SPEC §Scheduler — exact initial algorithm).
//
// One reducer serves both paths: `applyEvent` folds one event into the projection and `rebuild`
// folds a sorted event list from the initial state with the very same function, so incremental
// application and projection rebuild cannot diverge. Every target keeps a journal of the entries
// that affected it (with the local date fixed when the event was applied); an `adjudication` or
// `item-invalidated` event edits that journal and re-folds the target chronologically.
import { addDays, diffDays, isValidTimeZone, localDate, maxDate, minDate, parseInstant } from './calendar.ts';
import { DomainError, isListeningModality, isTargetKey, parseTargetKey } from './types.ts';
import type { CalendarDate, Correctness, Independence, Modality, TargetKey } from './types.ts';
import type { SupportKind } from './evidence.ts';

export const PROJECTION_VERSION = 1 as const;
export const DEFAULT_TIMEZONE = 'Europe/Madrid';
/** Delayed-review ladder in calendar days, indexed by stage 0–4. */
export const INTERVALS = [1, 3, 7, 14, 30] as const;
export const MAX_STAGE = 4;
export const REPEAT_MORE_CAP_DAYS = 7;
export const KNOWN_FIRST_CHECK_DAYS = 7;
/** Interval scheduled by a qualifying check at knownStep 0, 1, 2 (7 → 14 → 30 → 30). */
export const KNOWN_STEP_INTERVALS = [14, 30, 30] as const;
const MAX_DIAGNOSTICS = 50;

export type Stage = 0 | 1 | 2 | 3 | 4;
export type Frequency = 'usual' | 'repeat-more' | 'known';
export type KnownStep = null | 0 | 1 | 2 | 'disabled';
export type EligibleOutcomeKind = 'success' | 'error' | 'supported' | 'unknown';

/** An eligible (delayed, due, first-exposure-of-the-day) check and its outcome. */
export interface EligibleOutcome {
  readonly date: CalendarDate;
  readonly eventSeq: number;
  readonly attemptId: string;
  readonly contextFamily: string;
  readonly clipHash: string | null;
  readonly outcome: EligibleOutcomeKind;
}

interface EntryBase {
  readonly seq: number;
  /** Effective local date fixed at application time (zone in effect, clock-backward clamped). */
  readonly date: CalendarDate;
}

export interface IntroducedEntry extends EntryBase {
  readonly kind: 'introduced';
}

export interface AttemptEntry extends EntryBase {
  readonly kind: 'attempt';
  readonly attemptId: string;
  readonly taskRevisionId: string;
  /** Effective verdict (the latest validated adjudication, else the original). */
  readonly correctness: Correctness;
  readonly independence: Independence;
  readonly original: { readonly correctness: Correctness; readonly independence: Independence };
  readonly adjudicationIds: readonly string[];
  readonly contextFamily: string;
  readonly clipHash: string | null;
  readonly itemReady: boolean;
  /** Quarantined item: excluded from every projection. */
  readonly invalidated: boolean;
}

export interface SupportEntry extends EntryBase {
  readonly kind: 'support';
  readonly supportKind: SupportKind;
  readonly withinAssessedTask: boolean;
}

export interface PreferenceEntry extends EntryBase {
  readonly kind: 'preference';
  readonly frequency: Frequency | null;
  readonly paused: boolean | null;
}

export type JournalEntry = IntroducedEntry | AttemptEntry | SupportEntry | PreferenceEntry;

export interface TargetState {
  readonly target: TargetKey;
  readonly modality: Modality;
  readonly introducedDate: CalendarDate | null;
  readonly stage: Stage;
  readonly dueDate: CalendarDate | null;
  /** Last assessed exposure or delivered targeted help (postpones same-day eligibility). */
  readonly lastExposureDate: CalendarDate | null;
  /** Date of the last eligible advancement (one advance per target per local date). */
  readonly lastEligibleDate: CalendarDate | null;
  readonly pendingNeed: boolean;
  readonly frequency: Frequency;
  readonly paused: boolean;
  readonly knownStep: KnownStep;
  readonly lastSupportOrErrorDate: CalendarDate | null;
  readonly lastSupportOrErrorSeq: number | null;
  readonly history: readonly EligibleOutcome[];
  readonly journal: readonly JournalEntry[];
  readonly lastEventSeq: number;
}

/**
 * `clock-backward`: the event instant is earlier than one already processed (eventSeq order kept).
 * `local-date-clamped`: the instant moved forward but its local date is earlier than one already
 * used (e.g. after an explicit change to a zone behind the old one); the date is held, not reversed.
 */
export type DiagnosticCode = 'clock-backward' | 'local-date-clamped' | 'unknown-attempt' | 'unknown-target';

export interface SchedulerDiagnostic {
  readonly eventSeq: number;
  readonly code: DiagnosticCode;
  readonly detail: string;
}

export interface SchedulerState {
  readonly projectionVersion: typeof PROJECTION_VERSION;
  readonly timezone: string;
  readonly lastEventSeq: number;
  /** Latest event instant seen (UTC ISO), to detect a clock moving backward. */
  readonly lastInstant: string | null;
  /** Latest effective local date seen; event dates never move behind it. */
  readonly lastLocalDate: CalendarDate | null;
  readonly invalidatedTaskRevisions: readonly string[];
  readonly targets: Readonly<Record<string, TargetState>>;
  readonly diagnostics: readonly SchedulerDiagnostic[];
}

// ----------------------------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------------------------

interface EventBase {
  /** Monotonically increasing event_log sequence; processing order. */
  readonly eventSeq: number;
  /** UTC instant from the injected clock. */
  readonly at: string;
}

export interface IntroducedEvent extends EventBase {
  readonly kind: 'introduced';
  readonly targets: readonly TargetKey[];
}

export interface AttemptTargetResult {
  readonly target: TargetKey;
  readonly correctness: Correctness;
  readonly independence: Independence;
  /** Prompt/context family of the pinned task revision. */
  readonly contextFamily: string;
  /** Audio asset hash for listening tasks. */
  readonly clipHash?: string | null;
  /** The pinned task revision was ready and valid when submitted. */
  readonly itemReady: boolean;
}

export interface AttemptResultEvent extends EventBase {
  readonly kind: 'attempt-result';
  readonly attemptId: string;
  readonly taskRevisionId: string;
  readonly results: readonly AttemptTargetResult[];
}

export interface SupportDeliveredEvent extends EventBase {
  readonly kind: 'support-delivered';
  readonly supportKind: SupportKind;
  /** Explicitly mapped targets the delivered help actually explains. */
  readonly targets: readonly TargetKey[];
  /** True when delivered during an active assessed task; false for lesson/material exposure. */
  readonly withinAssessedTask: boolean;
}

export interface PreferenceSetEvent extends EventBase {
  readonly kind: 'preference-set';
  readonly targets: readonly TargetKey[];
  readonly frequency?: Frequency;
  readonly paused?: boolean;
}

export interface AdjudicationEvent extends EventBase {
  readonly kind: 'adjudication';
  readonly adjudicationId: string;
  readonly attemptId: string;
  readonly supersedes?: string | null;
  /** Validated per-target verdicts, including independence from the explicit original support. */
  readonly results: readonly { readonly target: TargetKey; readonly correctness: Correctness; readonly independence: Independence }[];
}

export interface ItemInvalidatedEvent extends EventBase {
  readonly kind: 'item-invalidated';
  readonly taskRevisionId: string;
}

export interface TimezoneChangedEvent extends EventBase {
  readonly kind: 'timezone-changed';
  readonly timezone: string;
}

export type SchedulerEvent =
  | IntroducedEvent
  | AttemptResultEvent
  | SupportDeliveredEvent
  | PreferenceSetEvent
  | AdjudicationEvent
  | ItemInvalidatedEvent
  | TimezoneChangedEvent;

/** Support kinds that change the schedule when delivered (neutral and uncertain kinds do not). */
const SCHEDULING_SUPPORT: readonly SupportKind[] = [
  'rule',
  'targeted-clue',
  'translation',
  'transcript',
  'reveal',
  'external-help',
  'learner-reported-help',
];

// ----------------------------------------------------------------------------------------------
// Initial states
// ----------------------------------------------------------------------------------------------

export function initialSchedulerState(timezone: string = DEFAULT_TIMEZONE): SchedulerState {
  if (!isValidTimeZone(timezone)) throw new DomainError('invalid-timezone', `invalid IANA timezone ${JSON.stringify(timezone)}`);
  return {
    projectionVersion: PROJECTION_VERSION,
    timezone,
    lastEventSeq: 0,
    lastInstant: null,
    lastLocalDate: null,
    invalidatedTaskRevisions: [],
    targets: {},
    diagnostics: [],
  };
}

export function initialTargetState(target: TargetKey): TargetState {
  return {
    target,
    modality: parseTargetKey(target).modality,
    introducedDate: null,
    stage: 0,
    dueDate: null,
    lastExposureDate: null,
    lastEligibleDate: null,
    pendingNeed: false,
    frequency: 'usual',
    paused: false,
    knownStep: null,
    lastSupportOrErrorDate: null,
    lastSupportOrErrorSeq: null,
    history: [],
    journal: [],
    lastEventSeq: 0,
  };
}

// ----------------------------------------------------------------------------------------------
// Per-target reducer (shared by incremental application and every re-fold)
// ----------------------------------------------------------------------------------------------

function before(a: CalendarDate, b: CalendarDate): boolean {
  return diffDays(a, b) > 0;
}

function tomorrow(today: CalendarDate): CalendarDate {
  return addDays(today, 1);
}

function exposed(ts: TargetState, today: CalendarDate): TargetState {
  return { ...ts, lastExposureDate: ts.lastExposureDate === null ? today : maxDate(ts.lastExposureDate, today) };
}

/**
 * Step 1: relevant clear error, delivered targeted help/reveal or a supported correct result.
 * Past successes stay in history; only the current ladder position resets.
 */
function needsSupport(ts: TargetState, today: CalendarDate, seq: number): TargetState {
  return {
    ...exposed(ts, today),
    stage: 0,
    pendingNeed: true,
    knownStep: 'disabled',
    dueDate: tomorrow(today),
    lastSupportOrErrorDate: today,
    lastSupportOrErrorSeq: seq,
  };
}

/** Due, ready, first assessed exposure of the local day, no eligible advance yet today. */
function eligibleTiming(ts: TargetState, e: AttemptEntry): boolean {
  return (
    ts.introducedDate !== null &&
    ts.dueDate !== null &&
    e.itemReady &&
    !before(e.date, ts.dueDate) &&
    (ts.lastExposureDate === null || before(ts.lastExposureDate, e.date)) &&
    ts.lastEligibleDate !== e.date
  );
}

/**
 * Advancement needs a context distinct from the immediately preceding eligible check: a different
 * prompt/context family for written targets, a different audio asset for listening targets.
 */
export function isDistinctContext(
  modality: Modality,
  previous: Pick<EligibleOutcome, 'contextFamily' | 'clipHash'> | undefined,
  next: { readonly contextFamily: string; readonly clipHash?: string | null },
): boolean {
  if (previous === undefined) return true;
  if (isListeningModality(modality)) return next.clipHash != null && next.clipHash !== previous.clipHash;
  return next.contextFamily !== previous.contextFamily;
}

function record(ts: TargetState, e: AttemptEntry, outcome: EligibleOutcomeKind): TargetState {
  const entry: EligibleOutcome = {
    date: e.date,
    eventSeq: e.seq,
    attemptId: e.attemptId,
    contextFamily: e.contextFamily,
    clipHash: e.clipHash,
    outcome,
  };
  return { ...ts, history: [...ts.history, entry] };
}

/** Step 2 + step 4: eligible delayed independent success, frequency controls applied. */
function advance(ts: TargetState, e: AttemptEntry): TargetState {
  const stage = Math.min(ts.stage + 1, MAX_STAGE) as Stage;
  let interval: number = INTERVALS[stage];
  let knownStep = ts.knownStep;
  if (ts.frequency === 'repeat-more') {
    interval = Math.min(interval, REPEAT_MORE_CAP_DAYS);
  } else if (ts.frequency === 'known' && (knownStep === 0 || knownStep === 1 || knownStep === 2)) {
    interval = Math.max(interval, KNOWN_STEP_INTERVALS[knownStep]);
    knownStep = Math.min(knownStep + 1, 2) as 1 | 2;
  }
  return record(
    {
      ...exposed(ts, e.date),
      stage,
      pendingNeed: false,
      dueDate: addDays(e.date, interval),
      lastEligibleDate: e.date,
      knownStep,
    },
    e,
    'success',
  );
}

function applyAttempt(ts: TargetState, e: AttemptEntry): TargetState {
  if (e.invalidated || e.correctness === 'invalid-item' || e.independence === 'not-assessed') return ts;
  if (ts.introducedDate === null) return exposed(ts, e.date); // unintroduced targets never enter review
  const timing = eligibleTiming(ts, e);
  if (e.independence === 'supported') return needsSupport(timing ? record(ts, e, 'supported') : ts, e.date, e.seq);
  if (e.correctness === 'incorrect') return needsSupport(timing ? record(ts, e, 'error') : ts, e.date, e.seq);
  if (e.correctness === 'unresolved') return exposed(ts, e.date); // neither a pass nor a failure
  // correct
  if (e.independence === 'unknown') return exposed(timing ? record(ts, e, 'unknown') : ts, e.date);
  if (timing && isDistinctContext(ts.modality, ts.history.at(-1), e)) return advance(ts, e);
  // Ordinary extra practice (or a repeated context): exposure and journal only, dueDate untouched.
  return exposed(ts, e.date);
}

function applySupport(ts: TargetState, e: SupportEntry): TargetState {
  if (ts.introducedDate !== null && e.withinAssessedTask) return needsSupport(ts, e.date, e.seq);
  // Help outside an active assessed task: exposure only; no invented failed attempt.
  return exposed(ts, e.date);
}

function applyPreference(ts: TargetState, e: PreferenceEntry): TargetState {
  let next = ts;
  const introduced = ts.introducedDate !== null && ts.dueDate !== null;
  if (e.frequency === 'usual') {
    next = { ...next, frequency: 'usual', knownStep: null };
  } else if (e.frequency === 'repeat-more') {
    next = {
      ...next,
      frequency: 'repeat-more',
      knownStep: null,
      dueDate: next.dueDate === null ? null : minDate(next.dueDate, tomorrow(e.date)),
    };
  } else if (e.frequency === 'known') {
    if (!introduced) next = { ...next, frequency: 'known', knownStep: null };
    else if (next.pendingNeed) next = { ...next, frequency: 'known', knownStep: 'disabled' };
    else {
      next = {
        ...next,
        frequency: 'known',
        knownStep: 0,
        dueDate: maxDate(next.dueDate as CalendarDate, addDays(e.date, KNOWN_FIRST_CHECK_DAYS)),
      };
    }
  }
  if (e.paused !== null) next = { ...next, paused: e.paused };
  return next;
}

/** Pure per-target step. Depends only on (state, entry); never on the journal or wall clock. */
export function stepTarget(ts: TargetState, entry: JournalEntry): TargetState {
  const base: TargetState = { ...ts, lastEventSeq: entry.seq };
  switch (entry.kind) {
    case 'introduced':
      if (ts.introducedDate !== null) return base;
      return { ...base, introducedDate: entry.date, stage: 0, pendingNeed: false, dueDate: tomorrow(entry.date) };
    case 'attempt':
      return applyAttempt(base, entry);
    case 'support':
      return applySupport(base, entry);
    case 'preference':
      return applyPreference(base, entry);
  }
}

/** Projection of one target from its journal alone (used for corrections and verification). */
export function foldJournal(target: TargetKey, journal: readonly JournalEntry[]): TargetState {
  const folded = journal.reduce(stepTarget, initialTargetState(target));
  return { ...folded, journal: [...journal] };
}

function append(ts: TargetState, entry: JournalEntry): TargetState {
  return { ...stepTarget(ts, entry), journal: [...ts.journal, entry] };
}

// ----------------------------------------------------------------------------------------------
// Profile-level reducer
// ----------------------------------------------------------------------------------------------

function requireTargetKey(value: unknown): TargetKey {
  if (!isTargetKey(value)) throw new DomainError('invalid-target', `invalid target key ${JSON.stringify(value)}`);
  return value;
}

function uniqueTargets(list: readonly unknown[]): TargetKey[] {
  return [...new Set(list.map(requireTargetKey))];
}

function validateEvent(event: SchedulerEvent): void {
  if (!Number.isSafeInteger(event.eventSeq) || event.eventSeq <= 0) {
    throw new DomainError('invalid-event', `eventSeq must be a positive integer, got ${String(event.eventSeq)}`);
  }
  if (event.kind === 'attempt-result') {
    const seen = new Set<string>();
    for (const r of event.results) {
      const key = requireTargetKey(r.target);
      if (seen.has(key)) throw new DomainError('invalid-event', `duplicate target ${key} in attempt ${event.attemptId}`);
      seen.add(key);
    }
  }
  if (event.kind === 'preference-set' && event.frequency === undefined && event.paused === undefined) {
    throw new DomainError('invalid-event', 'preference-set needs frequency or paused');
  }
  if (event.kind === 'timezone-changed' && !isValidTimeZone(event.timezone)) {
    throw new DomainError('invalid-timezone', `invalid IANA timezone ${JSON.stringify(event.timezone)}`);
  }
}

function withDiagnostic(list: readonly SchedulerDiagnostic[], diagnostic: SchedulerDiagnostic): SchedulerDiagnostic[] {
  return [...list, diagnostic].slice(-MAX_DIAGNOSTICS);
}

/**
 * Applies one event. Events must arrive in strictly increasing `eventSeq` order. `tz`, when given,
 * must equal the zone carried by the state (a zone change is itself a `timezone-changed` event), so
 * the incremental path cannot silently diverge from `rebuild`.
 */
export function applyEvent(state: SchedulerState, event: SchedulerEvent, tz?: string): SchedulerState {
  validateEvent(event);
  if (event.eventSeq <= state.lastEventSeq) {
    throw new DomainError('event-order', `eventSeq ${event.eventSeq} is not after ${state.lastEventSeq}`);
  }
  if (tz !== undefined && tz !== state.timezone && event.kind !== 'timezone-changed') {
    throw new DomainError('timezone-mismatch', `profile timezone is ${state.timezone}; record a timezone-changed event first`);
  }
  const observed = localDate(event.at, state.timezone);
  const date = state.lastLocalDate !== null && before(observed, state.lastLocalDate) ? state.lastLocalDate : observed;
  const instantMs = parseInstant(event.at);
  const lastMs = state.lastInstant === null ? null : parseInstant(state.lastInstant);
  const clockBackward = lastMs !== null && instantMs < lastMs;
  let diagnostics: readonly SchedulerDiagnostic[] = state.diagnostics;
  if (clockBackward) {
    diagnostics = withDiagnostic(diagnostics, { eventSeq: event.eventSeq, code: 'clock-backward', detail: `${event.at}<${state.lastInstant}` });
  } else if (date !== observed) {
    diagnostics = withDiagnostic(diagnostics, { eventSeq: event.eventSeq, code: 'local-date-clamped', detail: `${observed}<${date}` });
  }
  let targets: Record<string, TargetState> = { ...state.targets };
  let timezone = state.timezone;
  let invalidated = state.invalidatedTaskRevisions;
  const seq = event.eventSeq;
  const update = (key: TargetKey, fn: (ts: TargetState) => TargetState): void => {
    targets = { ...targets, [key]: fn(targets[key] ?? initialTargetState(key)) };
  };

  switch (event.kind) {
    case 'timezone-changed':
      // Historical dates and existing dueDate labels are retained; later events use the new zone.
      timezone = event.timezone;
      break;
    case 'introduced':
      for (const key of uniqueTargets(event.targets)) update(key, (ts) => append(ts, { seq, date, kind: 'introduced' }));
      break;
    case 'attempt-result': {
      const isInvalid = invalidated.includes(event.taskRevisionId);
      for (const r of event.results) {
        const entry: AttemptEntry = {
          seq,
          date,
          kind: 'attempt',
          attemptId: event.attemptId,
          taskRevisionId: event.taskRevisionId,
          correctness: r.correctness,
          independence: r.independence,
          original: { correctness: r.correctness, independence: r.independence },
          adjudicationIds: [],
          contextFamily: r.contextFamily,
          clipHash: r.clipHash ?? null,
          itemReady: r.itemReady,
          invalidated: isInvalid,
        };
        update(r.target, (ts) => append(ts, entry));
      }
      break;
    }
    case 'support-delivered': {
      if (!SCHEDULING_SUPPORT.includes(event.supportKind)) break; // neutral or unknown delivery
      for (const key of uniqueTargets(event.targets)) {
        if (event.supportKind === 'transcript' && !isListeningModality(parseTargetKey(key).modality)) continue;
        update(key, (ts) => append(ts, { seq, date, kind: 'support', supportKind: event.supportKind, withinAssessedTask: event.withinAssessedTask }));
      }
      break;
    }
    case 'preference-set':
      for (const key of uniqueTargets(event.targets)) {
        update(key, (ts) =>
          append(ts, { seq, date, kind: 'preference', frequency: event.frequency ?? null, paused: event.paused ?? null }),
        );
      }
      break;
    case 'adjudication':
      for (const r of event.results) {
        const key = requireTargetKey(r.target);
        const ts = targets[key];
        if (ts === undefined) {
          diagnostics = withDiagnostic(diagnostics, { eventSeq: seq, code: 'unknown-target', detail: `${event.attemptId} ${key}` });
          continue;
        }
        if (!ts.journal.some((j) => j.kind === 'attempt' && j.attemptId === event.attemptId)) {
          diagnostics = withDiagnostic(diagnostics, { eventSeq: seq, code: 'unknown-attempt', detail: `${event.attemptId} ${key}` });
          continue;
        }
        // Append-only correction: the original verdict stays recorded; the target is recomputed
        // chronologically, so the review date is never a new recall event.
        const journal = ts.journal.map((j) =>
          j.kind === 'attempt' && j.attemptId === event.attemptId
            ? { ...j, correctness: r.correctness, independence: r.independence, adjudicationIds: [...j.adjudicationIds, event.adjudicationId] }
            : j,
        );
        targets = { ...targets, [key]: foldJournal(key, journal) };
      }
      break;
    case 'item-invalidated': {
      if (!invalidated.includes(event.taskRevisionId)) invalidated = [...invalidated, event.taskRevisionId].sort();
      for (const [key, ts] of Object.entries(targets)) {
        if (!ts.journal.some((j) => j.kind === 'attempt' && j.taskRevisionId === event.taskRevisionId && !j.invalidated)) continue;
        const journal = ts.journal.map((j) =>
          j.kind === 'attempt' && j.taskRevisionId === event.taskRevisionId ? { ...j, invalidated: true } : j,
        );
        targets = { ...targets, [key]: foldJournal(key as TargetKey, journal) };
      }
      break;
    }
  }

  return {
    ...state,
    timezone,
    targets,
    invalidatedTaskRevisions: invalidated,
    diagnostics,
    lastEventSeq: seq,
    lastInstant: clockBackward ? state.lastInstant : event.at,
    lastLocalDate: date,
  };
}

/** Rebuilds the projection from the event log: sorted by eventSeq, folded with `applyEvent`. */
export function rebuild(events: readonly SchedulerEvent[], timezone: string = DEFAULT_TIMEZONE): SchedulerState {
  const sorted = [...events].sort((a, b) => a.eventSeq - b.eventSeq);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i]?.eventSeq === sorted[i - 1]?.eventSeq) {
      throw new DomainError('event-order', `duplicate eventSeq ${String(sorted[i]?.eventSeq)}`);
    }
  }
  return sorted.reduce<SchedulerState>((s, e) => applyEvent(s, e), initialSchedulerState(timezone));
}

// ----------------------------------------------------------------------------------------------
// Read-side helpers
// ----------------------------------------------------------------------------------------------

export function getTarget(state: SchedulerState, key: TargetKey): TargetState | undefined {
  return state.targets[key];
}

/** Due for automatic review on `today` (pause is a queue filter, applied by the caller/queue). */
export function isDue(ts: TargetState, today: CalendarDate): boolean {
  return ts.introducedDate !== null && ts.dueDate !== null && !before(today, ts.dueDate);
}

export interface StableLabel {
  readonly stable: boolean;
  readonly reasonKey: string;
}

/**
 * "Stable in later checks": the latest three eligible outcomes are independent successes on
 * distinct dates spanning >= 7 calendar days, from >= 2 prompt/context families (and >= 2 audio
 * hashes for listening), with no relevant support/error recorded at or after the first of them.
 * A UI evidence label, not certification or proof of permanent retention.
 */
export function stableLabel(ts: TargetState): StableLabel {
  const last = ts.history.slice(-3);
  if (last.length < 3) return { stable: false, reasonKey: 'evidence.notStable.fewerChecks' };
  if (!last.every((o) => o.outcome === 'success')) return { stable: false, reasonKey: 'evidence.notStable.recentOutcome' };
  const [first, , third] = last as [EligibleOutcome, EligibleOutcome, EligibleOutcome];
  if (new Set(last.map((o) => o.date)).size < 3) return { stable: false, reasonKey: 'evidence.notStable.sameDate' };
  if (diffDays(first.date, third.date) < 7) return { stable: false, reasonKey: 'evidence.notStable.span' };
  if (new Set(last.map((o) => o.contextFamily)).size < 2) return { stable: false, reasonKey: 'evidence.notStable.families' };
  if (isListeningModality(ts.modality) && new Set(last.map((o) => o.clipHash).filter((h) => h !== null)).size < 2) {
    return { stable: false, reasonKey: 'evidence.notStable.audio' };
  }
  if (ts.lastSupportOrErrorSeq !== null && ts.lastSupportOrErrorSeq >= first.eventSeq) {
    return { stable: false, reasonKey: 'evidence.notStable.laterSupport' };
  }
  return { stable: true, reasonKey: 'evidence.stable' };
}

export type EvidenceLabel = 'stable' | 'independent' | 'supported' | 'uncertain' | 'introduced';

/** Progress label (contract ProgressView) for an introduced target; null when not introduced. */
export function evidenceLabel(ts: TargetState): EvidenceLabel | null {
  if (ts.introducedDate === null) return null;
  if (stableLabel(ts).stable) return 'stable';
  if (ts.pendingNeed) return 'supported';
  const lastAttempt = [...ts.journal]
    .reverse()
    .find((j): j is AttemptEntry => j.kind === 'attempt' && !j.invalidated && j.correctness !== 'invalid-item');
  if (lastAttempt !== undefined && (lastAttempt.correctness === 'unresolved' || lastAttempt.independence === 'unknown')) return 'uncertain';
  if (ts.history.some((o) => o.outcome === 'success')) return 'independent';
  return 'introduced';
}
