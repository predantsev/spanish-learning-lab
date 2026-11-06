// Deterministic comparison of a blind ASR transcript with the reviewed transcript (CONTENT-PLAN:
// "deterministic word/amount/negation comparison"). It detects mismatches; it does not prove
// pronunciation or naturalness. Pure.
import { digitTokenValues, extractAmounts, integerToSpanish } from './numbers-es.ts';

export const NEGATORS = ['no', 'nunca', 'jamás', 'nada', 'nadie', 'ni', 'tampoco', 'ninguno', 'ninguna', 'ningún'] as const;

/** Lowercase NFC tokens: letter runs (accents kept) and digit groups like 3,50 / 9:30 / 1.500. */
export function tokenize(text: string): string[] {
  return (text.normalize('NFC').toLowerCase().match(/[\p{L}\p{M}]+|\d+(?:[.,:]\d+)*/gu) ?? []).map((t) => t.normalize('NFC'));
}

/** Digit tokens become Spanish words so "3" aligns with "tres"; amounts are compared separately. */
export function wordsForAlignment(tokens: readonly string[]): string[] {
  const out: string[] = [];
  for (const token of tokens) {
    if (/^\d/.test(token)) {
      for (const value of digitTokenValues(token)) {
        if (Number.isInteger(value) && value <= 999_999) out.push(...integerToSpanish(value));
        else out.push(token);
      }
    } else {
      out.push(token);
    }
  }
  return out;
}

/** Equal once acute accents (stress marks) are removed; ñ/ü differences are NOT accent-only. */
export function accentOnlyDifference(a: string, b: string): boolean {
  if (a === b) return false;
  const strip = (s: string) => s.normalize('NFD').replace(/́/g, '').normalize('NFC');
  return strip(a) === strip(b);
}

export type AlignOp =
  | { readonly op: 'equal'; readonly ref: string; readonly hyp: string }
  | { readonly op: 'substitute'; readonly ref: string; readonly hyp: string; readonly accentOnly: boolean }
  | { readonly op: 'delete'; readonly ref: string }
  | { readonly op: 'insert'; readonly hyp: string };

/** Word-level Levenshtein alignment with a deterministic backtrace (substitute > delete > insert). */
export function align(ref: readonly string[], hyp: readonly string[]): AlignOp[] {
  const n = ref.length;
  const m = hyp.length;
  const d: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i]![0] = i;
  for (let j = 0; j <= m; j++) d[0]![j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
      d[i]![j] = Math.min(d[i - 1]![j - 1]! + cost, d[i - 1]![j]! + 1, d[i]![j - 1]! + 1);
    }
  }
  const ops: AlignOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const r = ref[i - 1]!;
      const h = hyp[j - 1]!;
      const cost = r === h ? 0 : 1;
      if (d[i]![j] === d[i - 1]![j - 1]! + cost) {
        ops.push(cost === 0 ? { op: 'equal', ref: r, hyp: h } : { op: 'substitute', ref: r, hyp: h, accentOnly: accentOnlyDifference(r, h) });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && d[i]![j] === d[i - 1]![j]! + 1) {
      ops.push({ op: 'delete', ref: ref[i - 1]! });
      i--;
      continue;
    }
    ops.push({ op: 'insert', hyp: hyp[j - 1]! });
    j--;
  }
  return ops.reverse();
}

export interface Finding {
  readonly code: 'word-mismatch' | 'amount-mismatch' | 'negation-mismatch' | 'stress-or-accent' | 'empty-transcript';
  readonly severity: 'blocking' | 'review';
  readonly detail: string;
}

export interface Comparison {
  readonly verdict: 'match' | 'accent-only' | 'mismatch';
  readonly wordErrorRate: number;
  readonly substitutions: number;
  readonly accentOnlySubstitutions: number;
  readonly deletions: number;
  readonly insertions: number;
  readonly differences: AlignOp[];
  readonly amounts: { readonly reference: number[]; readonly heard: number[]; readonly match: boolean };
  readonly negation: { readonly reference: Record<string, number>; readonly heard: Record<string, number>; readonly match: boolean };
  readonly findings: Finding[];
}

function negationCounts(tokens: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tokens) if ((NEGATORS as readonly string[]).includes(t)) counts[t] = (counts[t] ?? 0) + 1;
  return counts;
}

function sameCounts(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

export function compareTranscripts(reference: string, heard: string): Comparison {
  const refTokens = tokenize(reference);
  const heardTokens = tokenize(heard);
  const ops = align(wordsForAlignment(refTokens), wordsForAlignment(heardTokens));
  const differences = ops.filter((o) => o.op !== 'equal');
  const substitutions = differences.filter((o) => o.op === 'substitute').length;
  const accentOnly = differences.filter((o) => o.op === 'substitute' && o.accentOnly).length;
  const deletions = differences.filter((o) => o.op === 'delete').length;
  const insertions = differences.filter((o) => o.op === 'insert').length;
  const refAmounts = extractAmounts(refTokens);
  const heardAmounts = extractAmounts(heardTokens);
  const amountsMatch = refAmounts.length === heardAmounts.length && refAmounts.every((v, k) => v === heardAmounts[k]);
  const refNeg = negationCounts(refTokens);
  const heardNeg = negationCounts(heardTokens);
  const negMatch = sameCounts(refNeg, heardNeg);

  const findings: Finding[] = [];
  if (heardTokens.length === 0) findings.push({ code: 'empty-transcript', severity: 'blocking', detail: 'blind transcription returned no words' });
  const substantive = substitutions - accentOnly + deletions + insertions;
  if (substantive > 0) {
    const sample = differences
      .filter((o) => !(o.op === 'substitute' && o.accentOnly))
      .slice(0, 6)
      .map((o) => (o.op === 'substitute' ? `${o.ref}→${o.hyp}` : o.op === 'delete' ? `-${o.ref}` : `+${o.hyp}`))
      .join(', ');
    findings.push({ code: 'word-mismatch', severity: 'blocking', detail: `${substantive} word difference(s): ${sample}` });
  }
  if (!amountsMatch) findings.push({ code: 'amount-mismatch', severity: 'blocking', detail: `reference ${JSON.stringify(refAmounts)}, heard ${JSON.stringify(heardAmounts)}` });
  if (!negMatch) findings.push({ code: 'negation-mismatch', severity: 'blocking', detail: `reference ${JSON.stringify(refNeg)}, heard ${JSON.stringify(heardNeg)}` });
  if (accentOnly > 0) {
    const sample = differences.filter((o) => o.op === 'substitute' && o.accentOnly).map((o) => (o.op === 'substitute' ? `${o.ref}→${o.hyp}` : '')).join(', ');
    findings.push({ code: 'stress-or-accent', severity: 'review', detail: `accent-only difference(s), possible stress problem: ${sample}` });
  }
  const blocking = findings.some((f) => f.severity === 'blocking');
  return {
    verdict: blocking ? 'mismatch' : accentOnly > 0 ? 'accent-only' : 'match',
    wordErrorRate: refTokens.length === 0 ? 1 : Math.round(((substitutions + deletions + insertions) / Math.max(1, wordsForAlignment(refTokens).length)) * 1000) / 1000,
    substitutions,
    accentOnlySubstitutions: accentOnly,
    deletions,
    insertions,
    differences,
    amounts: { reference: refAmounts, heard: heardAmounts, match: amountsMatch },
    negation: { reference: refNeg, heard: heardNeg, match: negMatch },
    findings,
  };
}
