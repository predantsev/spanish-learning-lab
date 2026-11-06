// Minimal local mirror of the deterministic checking rules in content/README.md rule 4 and
// DOMAIN-SPEC § Checking. It exists only so the validator can prove that answer keys are
// self-consistent (every accepted variant is accepted, no error variant collides with one).
//
// TODO(#111, WP-03): switch `checkTask` to the @sll/domain checker once packages/domain exports it
// (brief 01, being written in parallel), so the self-consistency check exercises the production
// grading code instead of this mirror. Keep the result shape: per-target outcome + matched id.
//
// Normalization: Unicode NFC → trim → collapse runs of whitespace to one space → only the task
// policy: `case: insensitive` lowercases (locale-independent String#toLowerCase);
// `terminalPunctuation: optional` lets the RESPONSE omit one trailing . ! ? of a key together with
// the matching opening ¿/¡ (the last one before it). A response that replaces the mark is not
// tolerated. Accents, ñ, ü, ¿, ¡ and word order are never normalized away.
import type { Outcome, Policy, Task, TemplatePart } from './types.ts';
import { targetKey } from './types.ts';

export interface TargetResult {
  key: string;
  outcome: Outcome;
  /** Accepted-variant / error-variant / exemplar / option id, when one matched. */
  matched?: string;
  rule: string;
}

export interface CheckResult {
  results: TargetResult[];
}

const DEFAULT_POLICY: Policy = { case: 'sensitive', terminalPunctuation: 'required' };

export function normalizeBase(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

export function normalizeResponse(text: string, policy: Policy = DEFAULT_POLICY): string {
  const base = normalizeBase(text);
  return policy.case === 'insensitive' ? base.toLowerCase() : base;
}

/** Remove one trailing terminal mark and, for ? / !, the last matching opening mark before it. */
export function stripTerminal(text: string): string | undefined {
  const last = text.at(-1);
  if (last !== '.' && last !== '?' && last !== '!') return undefined;
  let body = text.slice(0, -1);
  const opening = last === '?' ? '¿' : last === '!' ? '¡' : undefined;
  if (opening) {
    const at = body.lastIndexOf(opening);
    if (at >= 0) body = body.slice(0, at) + body.slice(at + 1);
  }
  return normalizeBase(body);
}

/** Forms of a key that a response may equal under the policy. */
export function keyForms(text: string, policy: Policy = DEFAULT_POLICY): string[] {
  const norm = normalizeResponse(text, policy);
  const forms = [norm];
  if (policy.terminalPunctuation === 'optional') {
    const stripped = stripTerminal(norm);
    if (stripped !== undefined && stripped !== norm) forms.push(stripped);
  }
  return forms;
}

export function matchesKey(response: string, key: string, policy: Policy = DEFAULT_POLICY): boolean {
  return keyForms(key, policy).includes(normalizeResponse(response, policy));
}

function allTargets(task: Task, outcome: Outcome, rule: string, matched?: string): TargetResult[] {
  return task.targets.map((t) => ({ key: targetKey(t), outcome, rule, ...(matched ? { matched } : {}) }));
}

function combine(a: Outcome | undefined, b: Outcome): Outcome {
  if (a === undefined) return b;
  if (a === 'incorrect' || b === 'incorrect') return 'incorrect';
  if (a === 'correct' && b === 'correct') return 'correct';
  return 'unresolved';
}

/** Parses a response against a finite-slots template; undefined when the literals do not match. */
export function parseTemplate(template: TemplatePart[], response: string, policy: Policy): Map<string, string> | undefined {
  const candidates: TemplatePart[][] = [template];
  const lastPart = template.at(-1);
  if (policy.terminalPunctuation === 'optional' && typeof lastPart === 'string') {
    const joined = template.map((p) => (typeof p === 'string' ? p : '\u0000')).join('');
    const strippedJoined = stripTerminalRaw(joined);
    if (strippedJoined !== undefined) {
      const parts: TemplatePart[] = [];
      const literals = strippedJoined.split('\u0000');
      let li = 0;
      for (const p of template) {
        if (typeof p === 'string') continue;
        const lit = literals[li++] ?? '';
        if (lit) parts.push(lit);
        parts.push(p);
      }
      const tail = literals[li] ?? '';
      if (tail) parts.push(tail);
      candidates.push(parts);
    }
  }
  const text = normalizeResponse(response, policy);
  for (const candidate of candidates) {
    const parsed = parseOne(candidate, text, policy);
    if (parsed) return parsed;
  }
  return undefined;
}

/** Like stripTerminal but keeps surrounding whitespace (used on templates joined with slot markers). */
function stripTerminalRaw(text: string): string | undefined {
  const trimmed = text.trimEnd();
  const last = trimmed.at(-1);
  if (last !== '.' && last !== '?' && last !== '!') return undefined;
  let body = trimmed.slice(0, -1);
  const opening = last === '?' ? '¿' : last === '!' ? '¡' : undefined;
  if (opening) {
    const at = body.lastIndexOf(opening);
    if (at >= 0) body = body.slice(0, at) + body.slice(at + 1);
  }
  return body;
}

function normalizeLiteral(literal: string, policy: Policy): string {
  const collapsed = literal.normalize('NFC').replace(/\s+/gu, ' ');
  return policy.case === 'insensitive' ? collapsed.toLowerCase() : collapsed;
}

function parseOne(template: TemplatePart[], text: string, policy: Policy): Map<string, string> | undefined {
  const values = new Map<string, string>();
  let pos = 0;
  let pendingSlot: string | undefined;
  const parts = template.map((p) => (typeof p === 'string' ? normalizeLiteral(p, policy) : p));
  // Leading/trailing whitespace of the whole template is irrelevant after response trimming.
  if (typeof parts[0] === 'string') parts[0] = parts[0].trimStart();
  const lastIndex = parts.length - 1;
  if (typeof parts[lastIndex] === 'string') parts[lastIndex] = (parts[lastIndex] as string).trimEnd();
  for (const part of parts) {
    if (typeof part !== 'string') {
      if (pendingSlot !== undefined) return undefined; // adjacent slots are not parseable
      pendingSlot = part.slot;
      continue;
    }
    if (part === '') continue;
    if (pendingSlot === undefined) {
      if (!text.startsWith(part, pos)) return undefined;
      pos += part.length;
    } else {
      const at = text.indexOf(part, pos);
      if (at < 0) return undefined;
      values.set(pendingSlot, text.slice(pos, at).trim());
      pendingSlot = undefined;
      pos = at + part.length;
    }
  }
  if (pendingSlot !== undefined) {
    values.set(pendingSlot, text.slice(pos).trim());
    pos = text.length;
  }
  if (pos !== text.length) return undefined;
  for (const value of values.values()) if (value === '') return undefined;
  return values;
}

/** Deterministic local check of one response (option id for `choice`, text otherwise). */
export function checkTaskLocally(task: Task, response: string): CheckResult {
  const policy = task.policy ?? DEFAULT_POLICY;
  switch (task.mode) {
    case 'choice': {
      const option = task.options?.find((o) => o.id === response);
      if (!option) return { results: allTargets(task, 'unresolved', 'check.unknown-option') };
      return {
        results: task.targets.map((t) => {
          const key = targetKey(t);
          const outcome = option.outcomes[key];
          return outcome
            ? { key, outcome, matched: option.id, rule: `check.option:${option.id}` }
            : { key, outcome: 'unresolved' as const, rule: 'check.option.unmapped' };
        }),
      };
    }
    case 'exact-variants': {
      const accepted = task.accepted?.find((v) => matchesKey(response, v.text, policy));
      if (accepted) return { results: allTargets(task, 'correct', 'check.correct', accepted.id) };
      const error = task.errors?.find((v) => matchesKey(response, v.text, policy));
      if (error) {
        return {
          results: task.targets.map((t) => {
            const key = targetKey(t);
            const outcome = error.outcomes[key];
            return outcome
              ? { key, outcome, matched: error.id, rule: `check.errorVariant:${error.id}` }
              : { key, outcome: 'unresolved' as const, rule: 'check.errorVariant.unmapped' };
          }),
        };
      }
      if (task.closed === true && task.targets.length === 1) {
        return { results: allTargets(task, 'incorrect', 'check.closedMismatch') };
      }
      return { results: allTargets(task, 'unresolved', 'check.unresolved.unlisted') };
    }
    case 'finite-slots': {
      const values = parseTemplate(task.template ?? [], response, policy);
      if (!values) return { results: allTargets(task, 'unresolved', 'check.unresolved.template') };
      const perTarget = new Map<string, Outcome>();
      const rules = new Map<string, string>();
      for (const slot of task.slots ?? []) {
        const value = values.get(slot.id);
        let outcome: Outcome = 'unresolved';
        let rule = `check.slot:${slot.id}:unlisted`;
        if (value !== undefined) {
          if (slot.accepted.some((a) => normalizeResponse(a, policy) === value)) {
            outcome = 'correct';
            rule = `check.slot:${slot.id}:accepted`;
          } else if ((slot.errors ?? []).some((e) => normalizeResponse(e.text, policy) === value)) {
            outcome = 'incorrect';
            rule = `check.slot:${slot.id}:error`;
          } else if (slot.closed) {
            outcome = 'incorrect';
            rule = `check.slot:${slot.id}:closed`;
          }
        }
        perTarget.set(slot.target, combine(perTarget.get(slot.target), outcome));
        rules.set(slot.target, rule);
      }
      return {
        results: task.targets.map((t) => {
          const key = targetKey(t);
          const outcome = perTarget.get(key) ?? 'unresolved';
          return { key, outcome, rule: rules.get(key) ?? 'check.slot.unmapped' };
        }),
      };
    }
    case 'rubric-review': {
      const exemplar = task.rubric?.exemplars.find((v) => matchesKey(response, v.text, policy));
      if (exemplar) return { results: allTargets(task, 'correct', 'check.exemplar', exemplar.id) };
      return { results: allTargets(task, 'unresolved', 'check.unresolved.free-text') };
    }
  }
}

/** The checker used by the validator's key self-consistency check (see TODO at the top). */
export const checkTask: (task: Task, response: string) => CheckResult = checkTaskLocally;

/** Renders a finite-slots template with the given slot values. */
export function renderTemplate(template: TemplatePart[], values: Map<string, string>): string {
  return template.map((p) => (typeof p === 'string' ? p : (values.get(p.slot) ?? ''))).join('');
}

/** True when two slot references follow each other without a literal between them. */
export function hasAdjacentSlots(template: TemplatePart[]): boolean {
  for (let i = 1; i < template.length; i++) {
    const prev = template[i - 1];
    const cur = template[i];
    if (prev !== undefined && cur !== undefined && typeof prev !== 'string' && typeof cur !== 'string') return true;
  }
  return false;
}

/** True when two slots are separated only by whitespace (parse is ambiguous if values contain spaces). */
export function hasWhitespaceOnlySeparator(template: TemplatePart[]): boolean {
  for (let i = 1; i + 1 < template.length; i++) {
    const prev = template[i - 1];
    const cur = template[i];
    const next = template[i + 1];
    if (typeof prev !== 'string' && typeof next !== 'string' && typeof cur === 'string' && cur.trim() === '') return true;
  }
  return false;
}
