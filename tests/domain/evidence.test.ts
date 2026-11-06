import { describe, expect, it } from 'vitest';
import type { Target as ContractTarget, Verdict as ContractVerdict } from '@sll/contracts';
import { assessEvidence, checkResponse, independenceFor, supportEffect } from '@sll/domain';
import type { Target, Verdict } from '@sll/domain';
import { HABER, HECHO, SHOP, T09, T12 } from './fixtures.ts';

describe('evidence', () => {
  it('keeps correctness and independence separate', () => {
    const wrong = checkResponse(T12, { text: 'Ha hecho' }); // haber incorrect, hecho correct
    const verdicts = assessEvidence(wrong, [{ kind: 'reveal', targets: [HECHO] }]);
    expect(verdicts.map((v) => [v.correctness, v.independence])).toEqual([
      ['incorrect', 'independent'],
      ['correct', 'supported'],
    ]);
    expect(verdicts[0]).toMatchObject({ explanationKey: 'check.errorVariant:ha-hecho', matchedVariantId: 'ha-hecho' });
  });

  it('ignores help after submission, confirmed-undelivered and neutral kinds', () => {
    expect(independenceFor(HECHO, [{ kind: 'rule', targets: [HECHO], phase: 'after-submit' }])).toBe('independent');
    expect(independenceFor(HECHO, [{ kind: 'external-help', targets: [HECHO], delivery: 'confirmed-undelivered' }])).toBe('independent');
    expect(independenceFor(SHOP, [{ kind: 'replay', targets: [SHOP] }])).toBe('independent');
  });

  it('pending or unknown delivery blocks independent credit only for affected targets', () => {
    const snapshot = [{ kind: 'external-help' as const, targets: [HECHO], delivery: 'pending' as const }];
    expect(independenceFor(HECHO, snapshot)).toBe('unknown');
    expect(independenceFor(HABER, snapshot)).toBe('independent');
    expect(independenceFor(HECHO, [{ kind: 'external-help', targets: [HECHO], delivery: 'delivery-unknown' }])).toBe('unknown');
    expect(independenceFor(HECHO, [{ kind: 'external-help', targets: [HECHO], phase: 'unknown' }])).toBe('unknown');
    expect(supportEffect({ kind: 'learner-reported-help', targets: [HECHO] }, HECHO)).toBe('supported');
  });

  it('delivered support wins over uncertain support for the same target', () => {
    expect(
      independenceFor(HECHO, [
        { kind: 'external-help', targets: [HECHO], delivery: 'pending' },
        { kind: 'targeted-clue', targets: [HECHO] },
      ]),
    ).toBe('supported');
  });

  it('uses not-assessed only for invalid items', () => {
    const malformed = { ...T09, template: [{ slot: 'aux' }, { slot: 'part' }] } as typeof T09;
    const verdicts = assessEvidence(checkResponse(malformed, { text: 'hehecho' }), [{ kind: 'rule', targets: [HECHO] }]);
    expect(verdicts.map((v) => [v.correctness, v.independence])).toEqual([
      ['invalid-item', 'not-assessed'],
      ['invalid-item', 'not-assessed'],
    ]);
  });

  it('produces verdicts that are assignable to the wire contract', () => {
    const verdicts: Verdict[] = assessEvidence(checkResponse(T09, { text: 'he hecho los deberes.' }), []);
    const wire: ContractVerdict[] = verdicts; // compile-time compatibility with docs/contracts
    const target: ContractTarget = verdicts[0]?.target as Target;
    expect(wire).toHaveLength(2);
    expect(target).toEqual({ skillId: 'perfecto.haber', modality: 'written-form' });
    expect(Object.keys(wire[0] ?? {}).sort()).toEqual(['correctness', 'explanationKey', 'independence', 'target']);
  });
});
