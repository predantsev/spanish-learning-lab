// Deterministic answer checking (DOMAIN-SPEC §Checking and adjudication; content/README rule 4).
// Pipeline: Unicode NFC -> collapse ordinary whitespace and trim -> the task's reviewed policy only.
// Never strip accents/ñ/ü/¿¡, never reorder words, no fuzzy matching, edit distance or substrings.
import { isTargetKey, targetKey } from './types.ts';
import type { Correctness, Outcome, Target, TargetKey } from './types.ts';

export type CheckMode = 'choice' | 'exact-variants' | 'finite-slots' | 'rubric-review';

export interface CheckPolicy {
  readonly case: 'sensitive' | 'insensitive';
  readonly terminalPunctuation: 'required' | 'optional';
}

/** Strictest policy, used when a task carries none. */
export const STRICT_POLICY: CheckPolicy = { case: 'sensitive', terminalPunctuation: 'required' };

export interface CheckVariant {
  readonly id: string;
  readonly text: string;
}

export interface CheckErrorVariant {
  readonly id: string;
  readonly text: string;
  readonly outcomes: Readonly<Record<string, Outcome>>;
}

export interface CheckOption {
  readonly id: string;
  readonly outcomes: Readonly<Record<string, Outcome>>;
}

export interface CheckSlot {
  readonly id: string;
  readonly target: string;
  readonly accepted: readonly string[];
  readonly errors?: readonly { readonly text: string }[];
  readonly closed: boolean;
}

export type TemplateItem = string | { readonly slot: string };

/**
 * The checking-relevant subset of a content `Task` (content.schema.json `$defs/Task`).
 * A full content task object is assignable to it.
 */
export interface CheckableTask {
  readonly id?: string;
  readonly mode: CheckMode;
  readonly targets: readonly Target[];
  readonly options?: readonly CheckOption[];
  readonly accepted?: readonly CheckVariant[];
  readonly errors?: readonly CheckErrorVariant[];
  readonly closed?: boolean;
  readonly policy?: CheckPolicy;
  readonly template?: readonly TemplateItem[];
  readonly slots?: readonly CheckSlot[];
  readonly rubric?: { readonly exemplars: readonly CheckVariant[] };
}

export type CheckResponse = { readonly optionId: string } | { readonly text: string };

export interface TargetCheck {
  readonly target: Target;
  readonly correctness: Correctness;
  readonly explanationKey: string;
  readonly matchedVariantId?: string;
}

export interface CheckResult {
  readonly mode: CheckMode;
  readonly wellFormed: boolean;
  /** NFC + whitespace-normalized response text (policy-independent), null for choice responses. */
  readonly normalizedText: string | null;
  readonly results: readonly TargetCheck[];
}

/** Stable explanation keys; slot keys are `check.slot:<slotId>:<outcome>`. */
export const CHECK_KEYS = {
  correct: 'check.correct',
  closedMismatch: 'check.closedMismatch',
  unlisted: 'check.unresolved.unlisted',
  template: 'check.unresolved.template',
  templateAmbiguous: 'check.unresolved.templateAmbiguous',
  rubric: 'check.unresolved.rubric',
  empty: 'check.unresolved.empty',
  invalidResponse: 'check.unresolved.invalidResponse',
  invalidItem: 'check.invalidItem',
} as const;

export const errorVariantKey = (id: string): string => `check.errorVariant:${id}`;
export const optionKey = (id: string): string => `check.option:${id}`;
export const slotKey = (slotId: string, detail: string): string => `check.slot:${slotId}:${detail}`;

// ---------------------------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------------------------

// Ordinary whitespace: ASCII space/tab/LF/CR/VT/FF and NO-BREAK SPACE (U+00A0). Nothing else is
// removed or rewritten, so zero-width characters, accents and inverted marks stay significant.
const ORDINARY_WHITESPACE = /[ \t\n\r\v\f ]+/g;
const TERMINAL_MARKS = new Set(['.', '!', '?']);
const OPENING_FOR: Readonly<Record<string, string>> = { '?': '¿', '!': '¡' };

function collapseWhitespace(text: string): string {
  return text.replace(ORDINARY_WHITESPACE, ' ');
}

/** NFC, collapse runs of ordinary whitespace to one space, trim the edges. */
export function normalizeText(text: string): string {
  const collapsed = collapseWhitespace(text.normalize('NFC'));
  const start = collapsed.startsWith(' ') ? 1 : 0;
  const end = collapsed.endsWith(' ') && collapsed.length > start ? collapsed.length - 1 : collapsed.length;
  return collapsed.slice(start, end);
}

/** `case: insensitive` lowercases with the locale-independent Unicode default mapping. */
export function applyCasePolicy(text: string, policy: CheckPolicy): string {
  return policy.case === 'insensitive' ? text.toLowerCase().normalize('NFC') : text;
}

export function normalizeForPolicy(text: string, policy: CheckPolicy): string {
  return applyCasePolicy(normalizeText(text), policy);
}

/**
 * Forms of an already-normalized reviewed variant that a response may equal. With
 * `terminalPunctuation: optional`, a single trailing `.`/`!`/`?` may be missing, and for `?`/`!`
 * its matching opening `¿`/`¡` may be missing together with it. Absence is tolerated, never presence
 * or substitution: `Has comido?` does not match `¿Has comido?`.
 */
export function toleratedForms(normalizedVariant: string, policy: CheckPolicy): string[] {
  const forms = [normalizedVariant];
  if (policy.terminalPunctuation !== 'optional') return forms;
  const last = normalizedVariant.slice(-1);
  if (!TERMINAL_MARKS.has(last)) return forms;
  const withoutClosing = normalizeText(normalizedVariant.slice(0, -1));
  if (withoutClosing.length > 0) forms.push(withoutClosing);
  const opening = OPENING_FOR[last];
  if (opening !== undefined) {
    const idx = withoutClosing.lastIndexOf(opening);
    if (idx >= 0) {
      const withoutBoth = normalizeText(withoutClosing.slice(0, idx) + withoutClosing.slice(idx + 1));
      if (withoutBoth.length > 0) forms.push(withoutBoth);
    }
  }
  return [...new Set(forms)];
}

function variantMatches(response: string, variantText: string, policy: CheckPolicy): boolean {
  return toleratedForms(normalizeForPolicy(variantText, policy), policy).includes(response);
}

function firstMatch<V extends { readonly text: string }>(
  response: string,
  variants: readonly V[] | undefined,
  policy: CheckPolicy,
): V | undefined {
  return (variants ?? []).find((v) => variantMatches(response, v.text, policy));
}

// ---------------------------------------------------------------------------------------------
// Finite-slot templates
// ---------------------------------------------------------------------------------------------

type Token = { readonly kind: 'lit'; readonly text: string } | { readonly kind: 'slot'; readonly id: string };

/** Normalizes literals (NFC, whitespace collapse without trimming, case policy) and merges adjacent ones. */
function tokenize(template: readonly TemplateItem[], policy: CheckPolicy): Token[] {
  const tokens: Token[] = [];
  for (const item of template) {
    if (typeof item === 'string') {
      const prev = tokens.at(-1);
      const text = applyCasePolicy(collapseWhitespace(item.normalize('NFC')), policy);
      if (prev?.kind === 'lit') tokens[tokens.length - 1] = { kind: 'lit', text: collapseWhitespace(prev.text + text) };
      else tokens.push({ kind: 'lit', text });
    } else {
      tokens.push({ kind: 'slot', id: item.slot });
    }
  }
  return tokens.filter((t) => t.kind === 'slot' || t.text.length > 0);
}

function hasAdjacentSlots(tokens: readonly Token[]): boolean {
  return tokens.some((t, i) => i > 0 && t.kind === 'slot' && tokens[i - 1]?.kind === 'slot');
}

function occurrences(text: string, needle: string): number[] {
  const out: number[] = [];
  for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + 1)) out.push(i);
  return out;
}

function lowerBound(sorted: readonly number[], value: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((sorted[mid] as number) < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

interface ParseOutcome {
  /** Number of distinct parses, capped at 2 (2 means ambiguous). */
  readonly count: 0 | 1 | 2;
  readonly values?: ReadonlyMap<string, string>;
}

/**
 * Parses `text` against alternating literal/slot tokens. Every slot captures a non-empty span and
 * literals must appear exactly. Parses are counted (capped at 2) with suffix sums over literal
 * occurrences, so an ambiguous split is detected instead of picking one by convention.
 */
function parseTokens(text: string, tokens: readonly Token[]): ParseOutcome {
  if (tokens.length === 0 || hasAdjacentSlots(tokens)) return { count: 0 };
  const lits = tokens.filter((t): t is { kind: 'lit'; text: string } => t.kind === 'lit');
  const n = text.length;
  if (lits.length === 0) {
    const only = tokens[0];
    if (tokens.length !== 1 || only?.kind !== 'slot' || n === 0) return { count: 0 };
    return { count: 1, values: new Map([[only.id, text]]) };
  }
  const startsWithLit = tokens[0]?.kind === 'lit';
  const endsWithLit = tokens.at(-1)?.kind === 'lit';
  const k = lits.length;
  const occ = lits.map((l) => occurrences(text, l.text));
  const ways: number[][] = occ.map((o) => new Array<number>(o.length).fill(0));
  const suffix: number[][] = occ.map((o) => new Array<number>(o.length + 1).fill(0));
  for (let j = k - 1; j >= 0; j -= 1) {
    const len = (lits[j] as { text: string }).text.length;
    const oj = occ[j] as number[];
    const wj = ways[j] as number[];
    for (let i = 0; i < oj.length; i += 1) {
      const p = oj[i] as number;
      if (j === k - 1) {
        wj[i] = endsWithLit ? (p + len === n ? 1 : 0) : p + len <= n - 1 ? 1 : 0;
      } else {
        const next = occ[j + 1] as number[];
        wj[i] = (suffix[j + 1] as number[])[lowerBound(next, p + len + 1)] as number;
      }
    }
    const sj = suffix[j] as number[];
    for (let i = oj.length - 1; i >= 0; i -= 1) sj[i] = Math.min(2, (wj[i] as number) + (sj[i + 1] as number));
  }
  const startOk = (p: number): boolean => (startsWithLit ? p === 0 : p >= 1);
  let total = 0;
  const o0 = occ[0] as number[];
  for (let i = 0; i < o0.length; i += 1) if (startOk(o0[i] as number)) total = Math.min(2, total + (ways[0]![i] as number));
  if (total !== 1) return { count: total as 0 | 2 };

  // Exactly one parse: reconstruct the literal positions.
  const positions: number[] = [];
  let minPos = 0;
  for (let j = 0; j < k; j += 1) {
    const oj = occ[j] as number[];
    const wj = ways[j] as number[];
    let chosen = -1;
    for (let i = lowerBound(oj, minPos); i < oj.length; i += 1) {
      const p = oj[i] as number;
      if ((wj[i] as number) > 0 && (j > 0 || startOk(p))) {
        chosen = p;
        break;
      }
    }
    if (chosen < 0) return { count: 0 };
    positions.push(chosen);
    minPos = chosen + (lits[j] as { text: string }).text.length + 1;
  }
  const values = new Map<string, string>();
  let litIndex = 0;
  let cursor = 0;
  for (const token of tokens) {
    if (token.kind === 'lit') {
      cursor = (positions[litIndex] as number) + token.text.length;
      litIndex += 1;
    } else {
      const end = litIndex < k ? (positions[litIndex] as number) : n;
      values.set(token.id, text.slice(cursor, end));
      cursor = end;
    }
  }
  return { count: 1, values };
}

/**
 * Template variants tried in order under the punctuation policy: the reviewed template, then (only
 * for a response that ends without any terminal mark) the response with the template's final mark
 * restored, then additionally without the template's matching opening mark.
 */
function parseWithPolicy(response: string, template: readonly TemplateItem[], policy: CheckPolicy): ParseOutcome {
  const tokens = tokenize(template, policy);
  const strict = parseTokens(response, tokens);
  if (strict.count > 0 || policy.terminalPunctuation !== 'optional') return strict;
  const lastToken = tokens.at(-1);
  if (lastToken?.kind !== 'lit') return strict;
  const mark = lastToken.text.slice(-1);
  if (!TERMINAL_MARKS.has(mark) || TERMINAL_MARKS.has(response.slice(-1))) return strict;
  const restored = parseTokens(`${response}${mark}`, tokens);
  if (restored.count > 0) return restored;
  const opening = OPENING_FOR[mark];
  if (opening === undefined) return restored;
  // Remove the last opening mark that precedes the final mark (the matching one).
  for (let t = tokens.length - 1; t >= 0; t -= 1) {
    const token = tokens[t];
    if (token?.kind !== 'lit') continue;
    const searchIn = t === tokens.length - 1 ? token.text.slice(0, -1) : token.text;
    const idx = searchIn.lastIndexOf(opening);
    if (idx < 0) continue;
    const without = collapseWhitespace(token.text.slice(0, idx) + token.text.slice(idx + 1));
    const reduced = [...tokens.slice(0, t), { kind: 'lit' as const, text: without }, ...tokens.slice(t + 1)].filter(
      (x) => x.kind === 'slot' || x.text.length > 0,
    );
    return parseTokens(`${response}${mark}`, reduced);
  }
  return restored;
}

// ---------------------------------------------------------------------------------------------
// Static validation
// ---------------------------------------------------------------------------------------------

export interface WellFormedness {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

function outcomeIssues(prefix: string, outcomes: Readonly<Record<string, Outcome>> | undefined, keys: ReadonlySet<string>): string[] {
  const issues: string[] = [];
  const entries = Object.entries(outcomes ?? {});
  if (entries.length === 0) issues.push(`${prefix}.emptyOutcomes`);
  for (const [key, value] of entries) {
    if (!keys.has(key)) issues.push(`${prefix}.outcomeTarget:${key}`);
    if (value !== 'correct' && value !== 'incorrect' && value !== 'unresolved') issues.push(`${prefix}.outcomeValue:${key}`);
  }
  return issues;
}

/**
 * Static check that a task can be graded deterministically. A malformed task yields `invalid-item`
 * for every target instead of a guessed verdict.
 */
export function isWellFormedForCheck(task: CheckableTask): WellFormedness {
  const issues: string[] = [];
  const keys = new Set<string>();
  if (!Array.isArray(task.targets) || task.targets.length === 0) issues.push('targets.empty');
  for (const [i, t] of (task.targets ?? []).entries()) {
    let key: string;
    try {
      key = targetKey(t);
    } catch {
      issues.push(`targets.invalid:${i}`);
      continue;
    }
    if (keys.has(key)) issues.push(`targets.duplicate:${key}`);
    keys.add(key);
  }
  const policy = task.policy ?? STRICT_POLICY;
  if (
    (policy.case !== 'sensitive' && policy.case !== 'insensitive') ||
    (policy.terminalPunctuation !== 'required' && policy.terminalPunctuation !== 'optional')
  ) {
    issues.push('policy.invalid');
    return { ok: false, issues };
  }

  switch (task.mode) {
    case 'choice': {
      const options = task.options ?? [];
      if (options.length < 2) issues.push('options.missing');
      const ids = new Set<string>();
      for (const o of options) {
        if (ids.has(o.id)) issues.push(`options.duplicateId:${o.id}`);
        ids.add(o.id);
        issues.push(...outcomeIssues(`options.${o.id}`, o.outcomes, keys));
      }
      const fullyCorrect = options.some((o) => [...keys].every((k) => o.outcomes?.[k] === 'correct'));
      if (options.length > 0 && !fullyCorrect) issues.push('options.noCorrect');
      break;
    }
    case 'exact-variants': {
      const accepted = task.accepted ?? [];
      const errors = task.errors ?? [];
      if (accepted.length === 0) issues.push('accepted.missing');
      const ids = new Set<string>();
      for (const v of [...accepted, ...errors]) {
        if (ids.has(v.id)) issues.push(`variants.duplicateId:${v.id}`);
        ids.add(v.id);
        if (normalizeText(v.text).length === 0) issues.push(`variants.emptyText:${v.id}`);
      }
      for (const e of errors) issues.push(...outcomeIssues(`errors.${e.id}`, e.outcomes, keys));
      const acceptedForms = new Set(accepted.flatMap((v) => toleratedForms(normalizeForPolicy(v.text, policy), policy)));
      for (const e of errors) {
        if (toleratedForms(normalizeForPolicy(e.text, policy), policy).some((f) => acceptedForms.has(f))) {
          issues.push(`variants.collision:${e.id}`);
        }
      }
      break;
    }
    case 'finite-slots': {
      const template = task.template ?? [];
      const slots = task.slots ?? [];
      if (template.length === 0) issues.push('template.missing');
      if (slots.length === 0) issues.push('slots.missing');
      const slotIds = new Set<string>();
      for (const s of slots) {
        if (slotIds.has(s.id)) issues.push(`slots.duplicateId:${s.id}`);
        slotIds.add(s.id);
        if (!isTargetKey(s.target) || !keys.has(s.target)) issues.push(`slots.targetNotInTask:${s.id}`);
        const acceptedValues = (s.accepted ?? []).map((a) => normalizeForPolicy(a, policy));
        if (acceptedValues.length === 0 || acceptedValues.some((a) => a.length === 0)) issues.push(`slots.acceptedMissing:${s.id}`);
        const acceptedSet = new Set(acceptedValues);
        if ((s.errors ?? []).some((e) => acceptedSet.has(normalizeForPolicy(e.text, policy)))) issues.push(`slots.collision:${s.id}`);
        if (typeof s.closed !== 'boolean') issues.push(`slots.closedMissing:${s.id}`);
      }
      const referenced = new Map<string, number>();
      for (const item of template) {
        if (typeof item === 'string') {
          if (item.length === 0) issues.push('template.emptyLiteral');
          continue;
        }
        referenced.set(item.slot, (referenced.get(item.slot) ?? 0) + 1);
        if (!slotIds.has(item.slot)) issues.push(`template.unknownSlot:${item.slot}`);
      }
      for (const [id, count] of referenced) if (count > 1) issues.push(`template.slotRepeated:${id}`);
      for (const id of slotIds) if (!referenced.has(id)) issues.push(`slots.unreferenced:${id}`);
      const tokens = tokenize(template, policy);
      if (hasAdjacentSlots(tokens)) issues.push('template.adjacentSlots');
      const first = tokens[0];
      const last = tokens.at(-1);
      if ((first?.kind === 'lit' && first.text.startsWith(' ')) || (last?.kind === 'lit' && last.text.endsWith(' '))) {
        issues.push('template.edgeWhitespace');
      }
      const covered = new Set(slots.map((s) => s.target));
      for (const k of keys) if (!covered.has(k)) issues.push(`targets.uncoveredBySlot:${k}`);
      break;
    }
    case 'rubric-review': {
      const exemplars = task.rubric?.exemplars ?? [];
      if (exemplars.length === 0) issues.push('rubric.exemplarsMissing');
      for (const v of exemplars) if (normalizeText(v.text).length === 0) issues.push(`variants.emptyText:${v.id}`);
      break;
    }
    default:
      issues.push('mode.unknown');
  }
  return { ok: issues.length === 0, issues };
}

// ---------------------------------------------------------------------------------------------
// Checking
// ---------------------------------------------------------------------------------------------

function result(target: Target, correctness: Correctness, explanationKey: string, matchedVariantId?: string): TargetCheck {
  return matchedVariantId === undefined
    ? { target, correctness, explanationKey }
    : { target, correctness, explanationKey, matchedVariantId };
}

function allTargets(task: CheckableTask, correctness: Correctness, explanationKey: string, matchedVariantId?: string): TargetCheck[] {
  return task.targets.map((t) => result({ skillId: t.skillId, modality: t.modality }, correctness, explanationKey, matchedVariantId));
}

function fromOutcomes(
  task: CheckableTask,
  outcomes: Readonly<Record<string, Outcome>>,
  incorrectKey: string,
  matchedId: string,
): TargetCheck[] {
  return task.targets.map((t) => {
    const target = { skillId: t.skillId, modality: t.modality };
    const outcome = outcomes[targetKey(t)];
    if (outcome === undefined) return result(target, 'unresolved', CHECK_KEYS.unlisted, matchedId);
    if (outcome === 'correct') return result(target, 'correct', CHECK_KEYS.correct, matchedId);
    return result(target, outcome, incorrectKey, matchedId);
  });
}

function responseText(response: CheckResponse): string | null {
  const text = (response as { text?: unknown }).text;
  return typeof text === 'string' ? text : null;
}

function responseOption(response: CheckResponse): string | null {
  const id = (response as { optionId?: unknown }).optionId;
  return typeof id === 'string' ? id : null;
}

const SEVERITY: Readonly<Record<Correctness, number>> = { 'invalid-item': 3, incorrect: 2, unresolved: 1, correct: 0 };

function checkSlots(task: CheckableTask, response: string, policy: CheckPolicy): TargetCheck[] {
  const parsed = parseWithPolicy(response, task.template ?? [], policy);
  if (parsed.count === 0) return allTargets(task, 'unresolved', CHECK_KEYS.template);
  if (parsed.count === 2 || parsed.values === undefined) return allTargets(task, 'unresolved', CHECK_KEYS.templateAmbiguous);
  const perTarget = new Map<string, { correctness: Correctness; key: string }>();
  for (const item of task.template ?? []) {
    if (typeof item === 'string') continue;
    const slot = (task.slots ?? []).find((s) => s.id === item.slot);
    if (slot === undefined) continue;
    const value = normalizeText(parsed.values.get(slot.id) ?? '');
    let verdict: { correctness: Correctness; key: string };
    if (value.length === 0) {
      verdict = { correctness: 'unresolved', key: slotKey(slot.id, 'blank') };
    } else if (slot.accepted.some((a) => normalizeForPolicy(a, policy) === value)) {
      verdict = { correctness: 'correct', key: slotKey(slot.id, 'correct') };
    } else {
      const errorIndex = (slot.errors ?? []).findIndex((e) => normalizeForPolicy(e.text, policy) === value);
      if (errorIndex >= 0) verdict = { correctness: 'incorrect', key: slotKey(slot.id, `error:${errorIndex}`) };
      else if (slot.closed === true) verdict = { correctness: 'incorrect', key: slotKey(slot.id, 'closedMismatch') };
      else verdict = { correctness: 'unresolved', key: slotKey(slot.id, 'unlisted') };
    }
    const previous = perTarget.get(slot.target);
    if (previous === undefined || SEVERITY[verdict.correctness] > SEVERITY[previous.correctness]) perTarget.set(slot.target, verdict);
  }
  return task.targets.map((t) => {
    const target = { skillId: t.skillId, modality: t.modality };
    const verdict = perTarget.get(targetKey(t));
    return verdict === undefined ? result(target, 'unresolved', CHECK_KEYS.unlisted) : result(target, verdict.correctness, verdict.key);
  });
}

/**
 * Checks one response against one reviewed task. Pure and deterministic: the same task and response
 * always produce the same per-target results. Correctness only; independence is added by evidence.ts.
 */
export function checkResponse(task: CheckableTask, response: CheckResponse): CheckResult {
  const text = responseText(response);
  const normalizedText = text === null ? null : normalizeText(text);
  const done = (results: TargetCheck[], wellFormed = true): CheckResult => ({ mode: task.mode, wellFormed, normalizedText, results });

  if (!isWellFormedForCheck(task).ok) return done(allTargets(task, 'invalid-item', CHECK_KEYS.invalidItem), false);
  const policy = task.policy ?? STRICT_POLICY;

  if (task.mode === 'choice') {
    const optionId = responseOption(response);
    const option = optionId === null ? undefined : (task.options ?? []).find((o) => o.id === optionId);
    if (option === undefined) return done(allTargets(task, 'unresolved', CHECK_KEYS.invalidResponse));
    return done(fromOutcomes(task, option.outcomes, optionKey(option.id), option.id));
  }

  if (text === null) return done(allTargets(task, 'unresolved', CHECK_KEYS.invalidResponse));
  const answer = applyCasePolicy(normalizedText ?? '', policy);
  if (answer.length === 0) return done(allTargets(task, 'unresolved', CHECK_KEYS.empty));

  switch (task.mode) {
    case 'exact-variants': {
      const accepted = firstMatch(answer, task.accepted, policy);
      if (accepted !== undefined) return done(allTargets(task, 'correct', CHECK_KEYS.correct, accepted.id));
      const error = firstMatch(answer, task.errors, policy);
      if (error !== undefined) return done(fromOutcomes(task, error.outcomes, errorVariantKey(error.id), error.id));
      if (task.closed === true && task.targets.length === 1) return done(allTargets(task, 'incorrect', CHECK_KEYS.closedMismatch));
      return done(allTargets(task, 'unresolved', CHECK_KEYS.unlisted));
    }
    case 'finite-slots':
      return done(checkSlots(task, answer, policy));
    case 'rubric-review': {
      const exemplar = firstMatch(answer, task.rubric?.exemplars, policy);
      if (exemplar !== undefined) return done(allTargets(task, 'correct', CHECK_KEYS.correct, exemplar.id));
      return done(allTargets(task, 'unresolved', CHECK_KEYS.rubric));
    }
    default:
      return done(allTargets(task, 'invalid-item', CHECK_KEYS.invalidItem), false);
  }
}

/** Target keys a task assesses, in task order. */
export function taskTargetKeys(task: Pick<CheckableTask, 'targets'>): TargetKey[] {
  return task.targets.map((t) => targetKey(t));
}
