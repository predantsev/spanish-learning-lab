// TEMPORARY until @sll/domain merge — thin local stand-in for the pure domain package
// (work/briefs/01-domain.md: calendar, checker, evidence, scheduler, queue). The integrator swaps the
// bodies of these functions for @sll/domain calls; the server only depends on the signatures below.
// Implemented to the level the server-core tests need: calendar dates via Intl, choice/exact-variants/
// finite-slots/rubric checking per content/README rule 4, independence from the support snapshot,
// the DOMAIN-SPEC ladder [1,3,7,14,30] with repeat-more/known/pause, and the R/S/O queue lanes.
import type { Target } from '@sll/contracts';
import type { Policy, TargetKey, TaskBody } from './content/types.ts';
import { LISTENING_MODALITIES, targetKey } from './content/types.ts';

// ---------------------------------------------------------------- calendar (TEMPORARY until @sll/domain merge)

const dtfCache = new Map<string, Intl.DateTimeFormat>();

export function isValidTimeZone(zone: string): boolean {
  if (typeof zone !== 'string' || zone.length === 0 || zone.length > 80) return false;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: zone });
    return Intl.supportedValuesOf('timeZone').includes(zone) || zone === 'UTC';
  } catch {
    return false;
  }
}

/** Local calendar date (YYYY-MM-DD) of an instant in an IANA zone. */
export function localDate(instant: Date | string, zone: string): string {
  let fmt = dtfCache.get(zone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
    dtfCache.set(zone, fmt);
  }
  const d = typeof instant === 'string' ? new Date(instant) : instant;
  const parts = fmt.formatToParts(d);
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Calendar-day arithmetic (never 86 400 s multiples). */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Number of calendar days from a to b (b - a). */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number) as [number, number, number];
  const [by, bm, bd] = b.split('-').map(Number) as [number, number, number];
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

// ---------------------------------------------------------------- checker (TEMPORARY until @sll/domain merge)

export type Correctness = 'correct' | 'incorrect' | 'unresolved' | 'invalid-item';
export type Independence = 'independent' | 'supported' | 'unknown' | 'not-assessed';

export interface TargetCheck {
  readonly target: Target;
  readonly correctness: Correctness;
  readonly explanationKey: string;
  readonly matchedVariantId?: string;
}

export type CheckResponse = { readonly text: string } | { readonly optionId: string };

export class CheckInputError extends Error {}

const DEFAULT_POLICY: Policy = { case: 'sensitive', terminalPunctuation: 'required' };

/** NFC → trim → collapse ordinary whitespace → task policy case. Accents/ñ/ü/¿¡ are never removed. */
export function normalizeAnswer(text: string, policy: Policy = DEFAULT_POLICY): string {
  let s = text.normalize('NFC').trim().replace(/[ \t\r\n\f\v]+/g, ' ');
  if (policy.case === 'insensitive') s = s.toLowerCase();
  return s;
}

function stripTerminal(s: string): string {
  if (s.endsWith('?') && s.startsWith('¿')) return s.slice(1, -1).trim();
  if (s.endsWith('!') && s.startsWith('¡')) return s.slice(1, -1).trim();
  if (/[.!?]$/.test(s)) return s.slice(0, -1).trim();
  return s;
}

function sameAnswer(response: string, variant: string, policy: Policy): boolean {
  const r = normalizeAnswer(response, policy);
  const v = normalizeAnswer(variant, policy);
  if (r === v) return true;
  return policy.terminalPunctuation === 'optional' && stripTerminal(r) === stripTerminal(v);
}

function allTargets(task: TaskBody, correctness: Correctness, explanationKey: string, matchedVariantId?: string): TargetCheck[] {
  return task.targets.map((t) => (matchedVariantId === undefined ? { target: t, correctness, explanationKey } : { target: t, correctness, explanationKey, matchedVariantId }));
}

export function checkResponse(task: TaskBody, response: CheckResponse): TargetCheck[] {
  if (task.reviewStatus === 'quarantined') return allTargets(task, 'invalid-item', 'check.invalidItem');
  const policy = task.policy ?? DEFAULT_POLICY;
  if (task.mode === 'choice') {
    if (!('optionId' in response)) throw new CheckInputError('choice task needs optionId');
    const option = task.options?.find((o) => o.id === response.optionId);
    if (!option) throw new CheckInputError('unknown option');
    return task.targets.map((t) => {
      const outcome = option.outcomes[targetKey(t)] ?? 'unresolved';
      const key = outcome === 'correct' ? 'check.correct' : outcome === 'incorrect' ? `check.option:${option.id}` : 'check.unresolved.option';
      return { target: t, correctness: outcome, explanationKey: key, matchedVariantId: option.id };
    });
  }
  if (!('text' in response)) throw new CheckInputError('text task needs text');
  const text = response.text;
  if (task.mode === 'exact-variants') {
    const ok = task.accepted?.find((v) => sameAnswer(text, v.text, policy));
    if (ok) return allTargets(task, 'correct', 'check.correct', ok.id);
    const err = task.errors?.find((e) => sameAnswer(text, e.text, policy));
    if (err) {
      return task.targets.map((t) => {
        const outcome = err.outcomes[targetKey(t)] ?? 'unresolved';
        return { target: t, correctness: outcome, explanationKey: `check.errorVariant:${err.id}`, matchedVariantId: err.id };
      });
    }
    if (task.closed === true && task.targets.length === 1) return allTargets(task, 'incorrect', 'check.closedMismatch');
    return allTargets(task, 'unresolved', 'check.unresolved.unlisted');
  }
  if (task.mode === 'rubric-review') {
    const ex = task.rubric?.exemplars.find((v) => sameAnswer(text, v.text, policy));
    if (ex) return allTargets(task, 'correct', 'check.correct', ex.id);
    return allTargets(task, 'unresolved', 'check.unresolved.rubric');
  }
  // finite-slots: literals must match in order; each slot is judged separately.
  const template = task.template ?? [];
  const slots = new Map((task.slots ?? []).map((s) => [s.id, s]));
  const esc = (s: string): string => normalizeAnswer(s, policy).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = template.map((part) => (typeof part === 'string' ? esc(part) : '(.+?)')).join('');
  const parsed = new RegExp(`^${pattern}$`, 'u').exec(normalizeAnswer(text, policy));
  if (!parsed) return allTargets(task, 'unresolved', 'check.unresolved.template');
  const byTarget = new Map<TargetKey, TargetCheck>();
  let gi = 1;
  for (const part of template) {
    if (typeof part === 'string') continue;
    const slot = slots.get(part.slot);
    const value = (parsed[gi++] ?? '').trim();
    if (!slot) continue;
    const t = task.targets.find((x) => targetKey(x) === slot.target);
    if (!t) continue;
    let check: TargetCheck;
    if (slot.accepted.some((a) => sameAnswer(value, a, policy))) check = { target: t, correctness: 'correct', explanationKey: `check.slot:${slot.id}:correct` };
    else if (slot.errors?.some((e) => sameAnswer(value, e.text, policy))) check = { target: t, correctness: 'incorrect', explanationKey: `check.slot:${slot.id}:error` };
    else if (slot.closed) check = { target: t, correctness: 'incorrect', explanationKey: `check.slot:${slot.id}:closedMismatch` };
    else check = { target: t, correctness: 'unresolved', explanationKey: `check.slot:${slot.id}:unlisted` };
    byTarget.set(slot.target, check);
  }
  return task.targets.map((t) => byTarget.get(targetKey(t)) ?? { target: t, correctness: 'unresolved', explanationKey: 'check.unresolved.template' });
}

// ---------------------------------------------------------------- evidence (TEMPORARY until @sll/domain merge)

export type SnapshotDelivery = 'delivered' | 'pending' | 'delivery-unknown' | 'confirmed-undelivered' | 'neutral';

export interface SupportSnapshotItem {
  readonly supportId: string;
  readonly kind: string;
  readonly delivery: SnapshotDelivery;
  readonly targets: readonly TargetKey[];
}

const AFFECTING = new Set(['rule', 'targeted-clue', 'translation', 'transcript', 'reveal', 'external-help', 'learner-reported-help']);

function affects(item: SupportSnapshotItem, key: TargetKey, modality: string): boolean {
  if (!AFFECTING.has(item.kind) || !item.targets.includes(key)) return false;
  if (item.kind === 'transcript') return LISTENING_MODALITIES.has(modality);
  return true;
}

export interface VerdictOut {
  readonly target: Target;
  readonly correctness: Correctness;
  readonly independence: Independence;
  readonly explanationKey: string;
  readonly matchedVariantId?: string;
}

/** Correctness and independence stay separate; neutral help never changes independence. */
export function deriveVerdicts(checks: readonly TargetCheck[], support: readonly SupportSnapshotItem[]): VerdictOut[] {
  return checks.map((c) => {
    const key = targetKey(c.target);
    let independence: Independence = 'independent';
    if (c.correctness === 'invalid-item') independence = 'not-assessed';
    else if (support.some((s) => s.delivery === 'delivered' && affects(s, key, c.target.modality))) independence = 'supported';
    else if (support.some((s) => (s.delivery === 'pending' || s.delivery === 'delivery-unknown') && affects(s, key, c.target.modality))) independence = 'unknown';
    const base = { target: c.target, correctness: c.correctness, independence, explanationKey: c.explanationKey };
    return c.matchedVariantId === undefined ? base : { ...base, matchedVariantId: c.matchedVariantId };
  });
}

// ---------------------------------------------------------------- scheduler (TEMPORARY until @sll/domain merge)

export const INTERVALS = [1, 3, 7, 14, 30] as const;
export type Frequency = 'usual' | 'repeat-more' | 'known';
export type KnownStep = null | 0 | 1 | 2 | 'disabled';

export interface EligibleOutcome {
  readonly date: string;
  readonly family: string | null;
  readonly clip: string | null;
}

export interface TargetSchedule {
  readonly stage: number;
  readonly dueDate: string | null;
  readonly pendingNeed: boolean;
  readonly frequency: Frequency;
  readonly paused: boolean;
  readonly knownStep: KnownStep;
  readonly introducedDate: string | null;
  readonly lastAssessedDate: string | null;
  readonly lastTargetedExposureDate: string | null;
  readonly lastSupportOrErrorDate: string | null;
  readonly lastEligibleDate: string | null;
  readonly lastEligibleFamily: string | null;
  readonly lastEligibleClip: string | null;
  readonly eligibleHistory: readonly EligibleOutcome[];
  readonly latest: { readonly date: string; readonly correctness: Correctness; readonly independence: Independence } | null;
}

export const EMPTY_SCHEDULE: TargetSchedule = {
  stage: 0,
  dueDate: null,
  pendingNeed: false,
  frequency: 'usual',
  paused: false,
  knownStep: null,
  introducedDate: null,
  lastAssessedDate: null,
  lastTargetedExposureDate: null,
  lastSupportOrErrorDate: null,
  lastEligibleDate: null,
  lastEligibleFamily: null,
  lastEligibleClip: null,
  eligibleHistory: [],
  latest: null,
};

export type ScheduleEvent =
  | { readonly type: 'introduced'; readonly date: string }
  | {
      readonly type: 'attempt-result';
      readonly date: string;
      readonly correctness: Correctness;
      readonly independence: Independence;
      readonly family: string | null;
      readonly clip: string | null;
    }
  | { readonly type: 'support-delivered'; readonly date: string }
  /** Targeted help after checking (review) or outside an assessed task: exposure only, postpones same-day eligibility. */
  | { readonly type: 'exposure'; readonly date: string }
  | { readonly type: 'preference-set'; readonly date: string; readonly frequency?: Frequency; readonly paused?: boolean };

function minDate(a: string | null, b: string): string {
  return a === null || b < a ? b : a;
}
function maxDate(a: string | null, b: string): string {
  return a === null || b > a ? b : a;
}

function needReset(s: TargetSchedule, date: string): TargetSchedule {
  const tomorrow = addDays(date, 1);
  return {
    ...s,
    stage: 0,
    pendingNeed: true,
    knownStep: 'disabled',
    dueDate: tomorrow,
    lastSupportOrErrorDate: date,
    lastTargetedExposureDate: date,
  };
}

/** Returns the new state and whether the event was an eligible delayed advancement. */
export function applyScheduleEvent(state: TargetSchedule, event: ScheduleEvent): { state: TargetSchedule; eligible: boolean } {
  const s = state;
  switch (event.type) {
    case 'introduced': {
      if (s.introducedDate !== null) return { state: s, eligible: false };
      return { state: { ...s, introducedDate: event.date, stage: 0, dueDate: s.dueDate ?? addDays(event.date, 1) }, eligible: false };
    }
    case 'support-delivered':
      return { state: needReset(s.introducedDate === null ? { ...s, introducedDate: event.date } : s, event.date), eligible: false };
    case 'exposure':
      return { state: { ...s, lastTargetedExposureDate: event.date }, eligible: false };
    case 'preference-set': {
      let next: TargetSchedule = s;
      if (event.paused !== undefined) next = { ...next, paused: event.paused };
      if (event.frequency !== undefined) {
        if (event.frequency === 'repeat-more') {
          next = { ...next, frequency: 'repeat-more', dueDate: next.dueDate === null ? null : minDate(next.dueDate, addDays(event.date, 1)) };
        } else if (event.frequency === 'known') {
          next = next.pendingNeed
            ? { ...next, frequency: 'known', knownStep: 'disabled' }
            : { ...next, frequency: 'known', knownStep: 0, dueDate: next.dueDate === null ? null : maxDate(next.dueDate, addDays(event.date, 7)) };
        } else {
          next = { ...next, frequency: 'usual' };
        }
      }
      return { state: next, eligible: false };
    }
    case 'attempt-result': {
      const date = event.date;
      const base: TargetSchedule = {
        ...(s.introducedDate === null ? { ...s, introducedDate: date, dueDate: s.dueDate ?? addDays(date, 1) } : s),
        latest: { date, correctness: event.correctness, independence: event.independence },
      };
      if (event.correctness === 'invalid-item') return { state: base, eligible: false };
      if (event.correctness === 'incorrect' || (event.correctness === 'correct' && event.independence === 'supported')) {
        return { state: { ...needReset(base, date), lastAssessedDate: date }, eligible: false };
      }
      if (event.correctness === 'correct' && event.independence === 'independent') {
        const variedEnough =
          base.lastEligibleDate === null ||
          (event.family !== null && event.family !== base.lastEligibleFamily) ||
          (event.clip !== null && event.clip !== base.lastEligibleClip);
        const eligible =
          base.dueDate !== null &&
          base.dueDate <= date &&
          base.lastTargetedExposureDate !== date &&
          (base.lastAssessedDate === null || base.lastAssessedDate < date) &&
          base.lastEligibleDate !== date &&
          (base.lastEligibleDate === null || base.lastEligibleDate < date) &&
          variedEnough;
        if (!eligible) return { state: { ...base, lastAssessedDate: date }, eligible: false };
        const stage = Math.min(4, base.stage + 1);
        let interval: number = INTERVALS[stage]!;
        if (base.frequency === 'repeat-more') interval = Math.min(interval, 7);
        let knownStep = base.knownStep;
        if (base.frequency === 'known' && typeof knownStep === 'number') {
          const knownInterval = knownStep === 0 ? 14 : 30;
          interval = Math.max(interval, knownInterval);
          knownStep = knownStep === 0 ? 1 : 2;
        }
        const history = [...base.eligibleHistory, { date, family: event.family, clip: event.clip }].slice(-10);
        return {
          state: {
            ...base,
            stage,
            pendingNeed: false,
            knownStep,
            dueDate: addDays(date, interval),
            lastAssessedDate: date,
            lastEligibleDate: date,
            lastEligibleFamily: event.family,
            lastEligibleClip: event.clip,
            eligibleHistory: history,
          },
          eligible: true,
        };
      }
      // unresolved or unknown independence: exposure only, no stage/due change, no fabricated error.
      return { state: { ...base, lastAssessedDate: date }, eligible: false };
    }
  }
}

export function rebuildSchedule(events: readonly ScheduleEvent[]): TargetSchedule {
  let s = EMPTY_SCHEDULE;
  for (const e of events) s = applyScheduleEvent(s, e).state;
  return s;
}

/** Stable: latest three eligible outcomes on distinct dates spanning ≥7 days, ≥2 families (≥2 clips for listening), no later support/error. */
export function stableLabel(state: TargetSchedule, listening: boolean): boolean {
  const h = state.eligibleHistory.slice(-3);
  if (h.length < 3) return false;
  const dates = new Set(h.map((x) => x.date));
  if (dates.size < 3) return false;
  if (diffDays(h[0]!.date, h[2]!.date) < 7) return false;
  if (new Set(h.map((x) => x.family)).size < 2) return false;
  if (listening && new Set(h.map((x) => x.clip)).size < 2) return false;
  if (state.lastSupportOrErrorDate !== null && state.lastSupportOrErrorDate >= h[0]!.date) return false;
  return !state.pendingNeed;
}

// ---------------------------------------------------------------- queue (TEMPORARY until @sll/domain merge)

export interface QueueCandidate {
  readonly key: TargetKey;
  readonly dueDate: string | null;
  readonly pendingNeed: boolean;
  readonly frequency: Frequency;
  readonly paused: boolean;
  readonly introduced: boolean;
  readonly lastOfferedSequence: number;
}

export const LANE_PATTERN = ['R', 'S', 'O', 'R', 'O'] as const;

export function isDue(c: QueueCandidate, today: string): boolean {
  return c.introduced && !c.paused && c.dueDate !== null && c.dueDate <= today;
}

/** Count cap = min(30, maxItems, ceil(minutes × 60 / estimateSeconds)), at least 1. */
export function queueCount(minutes: number, maxItems: number, estimateSeconds = 60): number {
  return Math.max(1, Math.min(30, maxItems, Math.ceil((minutes * 60) / estimateSeconds)));
}

/** Persistent weighted round robin [R,S,O,R,O]; returns selected keys and the advanced cursor. Pure. */
export function buildQueue(candidates: readonly QueueCandidate[], today: string, count: number, cursor: number): { selected: TargetKey[]; cursor: number } {
  const sort = (a: QueueCandidate, b: QueueCandidate): number =>
    a.lastOfferedSequence - b.lastOfferedSequence || (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || a.key.localeCompare(b.key);
  const due = candidates.filter((c) => isDue(c, today));
  const lanes: Record<'R' | 'S' | 'O', QueueCandidate[]> = {
    R: due.filter((c) => c.frequency === 'repeat-more').sort(sort),
    S: due.filter((c) => c.frequency !== 'repeat-more' && c.pendingNeed).sort(sort),
    O: due.filter((c) => c.frequency !== 'repeat-more' && !c.pendingNeed).sort(sort),
  };
  const selected: TargetKey[] = [];
  let cur = cursor;
  let emptyStreak = 0;
  while (selected.length < count && emptyStreak < LANE_PATTERN.length) {
    const lane = LANE_PATTERN[((cur % LANE_PATTERN.length) + LANE_PATTERN.length) % LANE_PATTERN.length]!;
    cur++;
    const next = lanes[lane].shift();
    if (!next) {
      emptyStreak++;
      continue;
    }
    emptyStreak = 0;
    selected.push(next.key);
  }
  return { selected, cursor: cur % LANE_PATTERN.length };
}
