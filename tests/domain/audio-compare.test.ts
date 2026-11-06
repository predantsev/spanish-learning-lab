// Audio QA (tools/audio): Spanish number handling and the deterministic blind-transcript comparison.
import { describe, expect, it } from 'vitest';
import { accentOnlyDifference, compareTranscripts, tokenize } from '../../tools/audio/lib/compare.ts';
import { digitTokenValues, extractAmounts, integerToSpanish } from '../../tools/audio/lib/numbers-es.ts';
import { canonicalJson, transcriptSha256 } from '../../tools/audio/lib/hash.ts';

describe('Spanish amounts', () => {
  it('extracts cardinal amounts from words and digits', () => {
    expect(extractAmounts(tokenize('Son tres euros con cincuenta.'))).toEqual([3, 50]);
    expect(extractAmounts(tokenize('Son 3,50 euros'))).toEqual([3, 50]);
    expect(extractAmounts(tokenize('dos mil quinientos'))).toEqual([2500]);
    expect(extractAmounts(tokenize('mil quinientos'))).toEqual([1500]);
    expect(extractAmounts(tokenize('1.500 personas'))).toEqual([1500]);
    expect(extractAmounts(tokenize('treinta y cinco, ciento veinte, cien mil'))).toEqual([35, 120, 100000]);
    expect(extractAmounts(tokenize('doscientas personas y veintitrés niños'))).toEqual([200, 23]);
    expect(extractAmounts(tokenize('treinta y una sillas'))).toEqual([31]);
  });

  it('does not merge separate numbers or count articles and clock words', () => {
    expect(extractAmounts(tokenize('dos tres'))).toEqual([2, 3]);
    expect(extractAmounts(tokenize('a las nueve y media'))).toEqual([9]);
    expect(extractAmounts(tokenize('un café con leche y una tostada'))).toEqual([]);
    expect(extractAmounts(tokenize('9:30'))).toEqual([9, 30]);
    expect(digitTokenValues('12.5')).toEqual([12, 5]);
  });

  it('spells integers in Spanish', () => {
    expect(integerToSpanish(0)).toEqual(['cero']);
    expect(integerToSpanish(21)).toEqual(['veintiuno']);
    expect(integerToSpanish(35)).toEqual(['treinta', 'y', 'cinco']);
    expect(integerToSpanish(100)).toEqual(['cien']);
    expect(integerToSpanish(101)).toEqual(['ciento', 'uno']);
    expect(integerToSpanish(2500)).toEqual(['dos', 'mil', 'quinientos']);
    expect(integerToSpanish(1000)).toEqual(['mil']);
    expect(() => integerToSpanish(1_000_000)).toThrow();
  });
});

describe('blind transcript comparison', () => {
  const ref = 'Son tres euros con cincuenta. La farmacia no abre a las nueve.';

  it('matches regardless of case, punctuation and digit spelling', () => {
    expect(compareTranscripts(ref, 'son tres euros con cincuenta la farmacia no abre a las nueve').verdict).toBe('match');
    const digits = compareTranscripts(ref, 'Son 3 euros con 50. La farmacia no abre a las 9.');
    expect(digits.verdict).toBe('match');
    expect(digits.amounts).toEqual({ reference: [3, 50, 9], heard: [3, 50, 9], match: true });
  });

  it('blocks a wrong amount', () => {
    const c = compareTranscripts(ref, 'Son tres euros con veinte. La farmacia no abre a las nueve.');
    expect(c.verdict).toBe('mismatch');
    expect(c.findings.map((f) => f.code)).toEqual(expect.arrayContaining(['amount-mismatch', 'word-mismatch']));
    expect(c.amounts.match).toBe(false);
  });

  it('blocks a missing negation even when every other word matches', () => {
    const c = compareTranscripts(ref, 'Son tres euros con cincuenta. La farmacia abre a las nueve.');
    expect(c.verdict).toBe('mismatch');
    expect(c.deletions).toBe(1);
    expect(c.findings.find((f) => f.code === 'negation-mismatch')?.severity).toBe('blocking');
  });

  it('treats a stress-mark-only difference as review, not as a match', () => {
    const c = compareTranscripts('Ayer Marta habló con el médico.', 'Ayer Marta hablo con el médico.');
    expect(c.verdict).toBe('accent-only');
    expect(c.findings).toEqual([expect.objectContaining({ code: 'stress-or-accent', severity: 'review' })]);
    expect(accentOnlyDifference('habló', 'hablo')).toBe(true);
    expect(accentOnlyDifference('año', 'ano')).toBe(false);
    expect(compareTranscripts('Tengo un año.', 'Tengo un ano.').verdict).toBe('mismatch');
  });

  it('counts insertions and flags an empty transcript', () => {
    const c = compareTranscripts('Buenos días.', 'Hola, buenos días.');
    expect(c.insertions).toBe(1);
    expect(c.verdict).toBe('mismatch');
    expect(compareTranscripts('Buenos días.', '').findings.map((f) => f.code)).toContain('empty-transcript');
  });
});

describe('hash helpers', () => {
  it('hashes composed and decomposed transcripts identically', () => {
    expect(transcriptSha256('café'.normalize('NFD'))).toBe(transcriptSha256('café'.normalize('NFC')));
  });

  it('produces canonical JSON with sorted keys', () => {
    expect(canonicalJson({ b: 1, a: { d: [2, { z: 1, y: 2 }], c: undefined } })).toBe('{"a":{"d":[2,{"y":2,"z":1}]},"b":1}');
  });
});
