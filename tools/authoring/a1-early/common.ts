// Shared Ukrainian wording and compact task shapes for the A1-01 … A1-03 units. The helpers only
// assemble fields; every prompt, answer, variant and feedback string is written in the unit files.
import { LOOSE, es, reveal, rule, uk } from './lib.ts';
import type { OutcomeSpec, TaskSpec } from './lib.ts';
import type { Block, Hint, Policy, TaskRole } from '../../content/types.ts';

/** Feedback for an answer that matches no reviewed variant (never a fake failure). */
export function U(reference: string): string {
  return `Цієї відповіді немає серед перевірених варіантів, тому вона не оцінюється ні як правильна, ні як помилкова. Зразок: ${reference}`;
}

export interface TypedTask {
  n: number;
  role: TaskRole;
  family: string;
  targets: string[];
  prompt: Block[];
  /** Reference answer; also the first accepted variant (a final period is added unless it ends in . ? !). */
  answer: string;
  /** Further accepted variants, written exactly. */
  also?: Array<string | [string, string]>;
  errors?: Array<[string, OutcomeSpec, string]>;
  /** Rule hints: [targets, text]. */
  rules: Array<[string[], string]>;
  extraHints?: Hint[];
  /** Short reason shown with the reference after a wrong answer. */
  why: string;
  policy?: Policy;
  closed?: boolean;
  clips?: string[];
  input?: 'short' | 'multiline';
}

const withStop = (s: string): string => (/[.?!]$/.test(s) ? s : `${s}.`);

/** exact-variants task with templated feedback around a hand-written answer and variants. */
export function typed(t: TypedTask): TaskSpec {
  return {
    n: t.n, role: t.role, family: t.family, mode: 'exact-variants', targets: t.targets, policy: t.policy ?? LOOSE,
    prompt: t.prompt,
    accepted: [withStop(t.answer), ...(t.also ?? [])],
    ...(t.errors && t.errors.length > 0 ? { errors: t.errors } : {}),
    ...(t.closed !== undefined ? { closed: t.closed } : {}),
    ...(t.clips ? { clips: t.clips } : {}),
    ...(t.input ? { input: t.input } : {}),
    hints: [...t.rules.map(([targets, text]) => rule(targets, text)), ...(t.extraHints ?? []), reveal(es(t.answer))],
    ref: t.answer,
    ok: `Правильно: ${t.answer}`,
    bad: `Ще ні. ${t.why}: ${t.answer}`,
    unres: U(t.answer),
  };
}

export interface PickTask {
  n: number;
  role: TaskRole;
  family: string;
  targets: string[];
  prompt: Block[];
  options: Array<[string, OutcomeSpec, string?]>;
  rules: Array<[string[], string]>;
  extraHints?: Hint[];
  ok: string;
  bad: string;
  clips?: string[];
  unres?: string;
}

/** choice task; the option labels and feedback are hand-written. */
export function pick(t: PickTask): TaskSpec {
  return {
    n: t.n, role: t.role, family: t.family, mode: 'choice', targets: t.targets,
    prompt: t.prompt,
    options: t.options,
    ...(t.clips ? { clips: t.clips } : {}),
    hints: [...t.rules.map(([targets, text]) => rule(targets, text)), ...(t.extraHints ?? [])],
    ok: t.ok,
    bad: t.bad,
    ...(t.unres ? { unres: t.unres } : {}),
  };
}

export { uk, es };
