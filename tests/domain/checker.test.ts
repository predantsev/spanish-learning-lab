// Deterministic checker (DOMAIN-SPEC §Checking; content/README rule 4). Synthetic, unreviewed keys.
import { describe, expect, it } from 'vitest';
import { checkResponse, isWellFormedForCheck, normalizeForPolicy, normalizeText, toleratedForms } from '@sll/domain';
import type { CheckPolicy, CheckResult, CheckableTask, Target } from '@sll/domain';
import { HABER, HECHO, T02, T09, T10, T12 } from './fixtures.ts';

const W = (skillId: string): Target => ({ skillId, modality: 'written-form' });
const STRICT: CheckPolicy = { case: 'sensitive', terminalPunctuation: 'required' };
const OPTIONAL: CheckPolicy = { case: 'sensitive', terminalPunctuation: 'optional' };
const INSENSITIVE: CheckPolicy = { case: 'insensitive', terminalPunctuation: 'required' };

function exact(accepted: string[], policy: CheckPolicy = STRICT, closed = true): CheckableTask {
  return {
    mode: 'exact-variants',
    targets: [W('demo.skill')],
    accepted: accepted.map((text, i) => ({ id: `v${i + 1}`, text })),
    closed,
    policy,
  };
}

const summary = (r: CheckResult) => r.results.map((x) => [x.correctness, x.explanationKey, x.matchedVariantId ?? null]);
const verdict = (task: CheckableTask, text: string) => checkResponse(task, { text }).results[0]?.correctness;

describe('normalization', () => {
  it('applies NFC, collapses ordinary whitespace (incl. NBSP) and trims', () => {
    expect(normalizeText('  He\t hecho \n la  tarea  ')).toBe('He hecho la tarea');
    expect(normalizeText('he hecho')).toBe('he hecho');
    expect(normalizeText('qué')).toBe('qué'); // decomposed accent → NFC
    expect(normalizeText('a​b')).toBe('a​b'); // zero-width space is not ordinary whitespace
  });

  it('lowercases only under case: insensitive, without touching accents or inverted marks', () => {
    expect(normalizeForPolicy('¿QUÉ HAS HECHO?', INSENSITIVE)).toBe('¿qué has hecho?');
    expect(normalizeForPolicy('¿QUÉ HAS HECHO?', STRICT)).toBe('¿QUÉ HAS HECHO?');
  });

  it('tolerates only a missing terminal mark and its matching opening mark', () => {
    expect(toleratedForms('¿Has comido?', OPTIONAL)).toEqual(['¿Has comido?', '¿Has comido', 'Has comido']);
    expect(toleratedForms('Juan, ¡qué bien!', OPTIONAL)).toEqual(['Juan, ¡qué bien!', 'Juan, ¡qué bien', 'Juan, qué bien']);
    expect(toleratedForms('He comido.', OPTIONAL)).toEqual(['He comido.', 'He comido']);
    expect(toleratedForms('He comido.', STRICT)).toEqual(['He comido.']);
  });
});

describe('exact-variants', () => {
  it('preserves accents, ñ, ü and ¿¡ (never normalized away)', () => {
    const task = exact(['¿Qué has hecho?', 'año', 'pingüino', '¡Hola!'], STRICT, false);
    expect(verdict(task, '¿Qué has hecho?')).toBe('correct');
    expect(verdict(task, '¿Que has hecho?')).toBe('unresolved');
    expect(verdict(task, 'ano')).toBe('unresolved');
    expect(verdict(task, 'pinguino')).toBe('unresolved');
    expect(verdict(task, 'Hola!')).toBe('unresolved');
    expect(verdict(task, '¿Qué has hecho?')).toBe('correct'); // decomposed accent, NFC-equal
  });

  it('keeps tú/tu and él/el distinct even under case-insensitive policy', () => {
    const tu = exact(['Tú has comido.'], { case: 'insensitive', terminalPunctuation: 'optional' });
    expect(verdict(tu, 'tú has comido')).toBe('correct');
    expect(verdict(tu, 'Tu has comido.')).toBe('incorrect'); // closed single target: unlisted → incorrect
    const el = exact(['Él ha llegado.'], { case: 'insensitive', terminalPunctuation: 'optional' });
    expect(verdict(el, 'él ha llegado.')).toBe('correct');
    expect(verdict(el, 'El ha llegado.')).toBe('incorrect');
  });

  it('applies the case policy only when the task allows it', () => {
    expect(verdict(exact(['He hecho la tarea.'], INSENSITIVE), 'HE HECHO LA TAREA.')).toBe('correct');
    expect(verdict(exact(['He hecho la tarea.'], STRICT), 'HE HECHO LA TAREA.')).toBe('incorrect');
  });

  it('applies the terminal punctuation policy asymmetrically (absence only)', () => {
    const optional = exact(['¿Has comido?'], OPTIONAL);
    expect(verdict(optional, '¿Has comido?')).toBe('correct');
    expect(verdict(optional, '¿Has comido')).toBe('correct');
    expect(verdict(optional, 'Has comido')).toBe('correct');
    expect(verdict(optional, 'Has comido?')).toBe('incorrect'); // missing ¿ alone is not tolerated
    expect(verdict(optional, '¿Has comido?.')).toBe('incorrect'); // extra mark is not tolerated
    const required = exact(['¿Has comido?'], STRICT);
    expect(verdict(required, '¿Has comido')).toBe('incorrect');
    const statement = exact(['hecho'], OPTIONAL);
    expect(verdict(statement, 'hecho.')).toBe('incorrect'); // presence is never added
  });

  it('distinguishes closed and open sets; never accepts substrings or reorderings', () => {
    const closed = exact(['he hecho'], STRICT, true);
    expect(summary(checkResponse(closed, { text: 'he hecho' }))).toEqual([['correct', 'check.correct', 'v1']]);
    expect(summary(checkResponse(closed, { text: 'hecho he' }))).toEqual([['incorrect', 'check.closedMismatch', null]]);
    expect(summary(checkResponse(closed, { text: 'he hecho hoy' }))).toEqual([['incorrect', 'check.closedMismatch', null]]);
    const open = exact(['he hecho'], STRICT, false);
    expect(summary(checkResponse(open, { text: 'he hecho hoy' }))).toEqual([['unresolved', 'check.unresolved.unlisted', null]]);
    expect(summary(checkResponse(open, { text: 'he' }))).toEqual([['unresolved', 'check.unresolved.unlisted', null]]);
  });

  it('treats `closed` on a multi-target task as open (unlisted → unresolved)', () => {
    const task: CheckableTask = { ...T12, closed: true };
    expect(summary(checkResponse(task, { text: 'Hemos hecho' }))).toEqual([
      ['unresolved', 'check.unresolved.unlisted', null],
      ['unresolved', 'check.unresolved.unlisted', null],
    ]);
  });

  it('attributes a reviewed error variant to its listed targets only', () => {
    expect(summary(checkResponse(T12, { text: 'he hacido' }))).toEqual([
      ['unresolved', 'check.unresolved.unlisted', 'he-hacido'], // haber not listed by the variant
      ['incorrect', 'check.errorVariant:he-hacido', 'he-hacido'],
    ]);
    expect(summary(checkResponse(T12, { text: 'Ha hecho' }))).toEqual([
      ['incorrect', 'check.errorVariant:ha-hecho', 'ha-hecho'],
      ['correct', 'check.correct', 'ha-hecho'],
    ]);
    expect(summary(checkResponse(T12, { text: 'He hecho' }))).toEqual([
      ['correct', 'check.correct', 'he-hecho'],
      ['correct', 'check.correct', 'he-hecho'],
    ]);
  });

  it('returns unresolved for empty or mistyped responses, never a failure', () => {
    const task = exact(['hecho']);
    expect(summary(checkResponse(task, { text: '   ' }))).toEqual([['unresolved', 'check.unresolved.empty', null]]);
    expect(summary(checkResponse(task, { optionId: 'a' }))).toEqual([['unresolved', 'check.unresolved.invalidResponse', null]]);
  });
});

describe('choice', () => {
  const task: CheckableTask = {
    mode: 'choice',
    targets: [W('demo.aux'), W('demo.part')],
    options: [
      { id: 'a', outcomes: { 'demo.aux/written-form': 'correct', 'demo.part/written-form': 'correct' } },
      { id: 'b', outcomes: { 'demo.part/written-form': 'incorrect' } },
    ],
  };
  it('uses option outcomes; a distractor marks only the target it tests', () => {
    expect(summary(checkResponse(task, { optionId: 'a' }))).toEqual([
      ['correct', 'check.correct', 'a'],
      ['correct', 'check.correct', 'a'],
    ]);
    expect(summary(checkResponse(task, { optionId: 'b' }))).toEqual([
      ['unresolved', 'check.unresolved.unlisted', 'b'],
      ['incorrect', 'check.option:b', 'b'],
    ]);
    expect(summary(checkResponse(task, { optionId: 'z' }))[0]).toEqual(['unresolved', 'check.unresolved.invalidResponse', null]);
  });
});

describe('finite-slots', () => {
  it('judges each slot separately and attributes errors to its own target', () => {
    expect(summary(checkResponse(T09, { text: 'he hacido los deberes' }))).toEqual([
      ['correct', 'check.slot:aux:correct', null],
      ['incorrect', 'check.slot:part:error:0', null],
    ]);
    expect(summary(checkResponse(T09, { text: 'Ha hecho los deberes.' }))).toEqual([
      ['incorrect', 'check.slot:aux:error:0', null],
      ['correct', 'check.slot:part:correct', null],
    ]);
  });

  it('uses each slot’s own `closed` flag for unlisted values', () => {
    const task: CheckableTask = {
      ...T09,
      slots: [
        { id: 'aux', target: HABER, accepted: ['he'], closed: false },
        { id: 'part', target: HECHO, accepted: ['hecho'], closed: true },
      ],
    };
    expect(summary(checkResponse(task, { text: 'hube hechado los deberes.' }))).toEqual([
      ['unresolved', 'check.slot:aux:unlisted', null],
      ['incorrect', 'check.slot:part:closedMismatch', null],
    ]);
  });

  it('marks every target unresolved when the literals do not match (template mismatch)', () => {
    expect(summary(checkResponse(T09, { text: 'he hecho las tareas' }))).toEqual([
      ['unresolved', 'check.unresolved.template', null],
      ['unresolved', 'check.unresolved.template', null],
    ]);
    expect(summary(checkResponse(T02, { text: 'Hoy he hecho la comida.' }))).toEqual([['unresolved', 'check.unresolved.template', null]]);
  });

  it('tolerates a missing final mark without letting a wrong mark leak into a slot', () => {
    expect(checkResponse(T02, { text: 'Hoy he hecho la cena' }).results[0]?.correctness).toBe('correct');
    expect(checkResponse(T02, { text: 'Hoy he hecho la cena!' }).results[0]?.correctness).toBe('unresolved');
    const question: CheckableTask = {
      mode: 'finite-slots',
      targets: [W('demo.part')],
      template: ['¿Has ', { slot: 'p' }, ' la cena?'],
      slots: [{ id: 'p', target: 'demo.part/written-form', accepted: ['hecho'], closed: true }],
      policy: OPTIONAL,
    };
    expect(checkResponse(question, { text: '¿Has hecho la cena' }).results[0]?.correctness).toBe('correct');
    expect(checkResponse(question, { text: 'Has hecho la cena' }).results[0]?.correctness).toBe('correct');
    expect(checkResponse(question, { text: 'Has hecho la cena?' }).results[0]?.correctness).toBe('unresolved');
  });

  it('reports an ambiguous split as unresolved instead of guessing', () => {
    const task: CheckableTask = {
      mode: 'finite-slots',
      targets: [W('demo.a'), W('demo.b')],
      template: [{ slot: 'a' }, ' y ', { slot: 'b' }],
      slots: [
        { id: 'a', target: 'demo.a/written-form', accepted: ['pan'], closed: true },
        { id: 'b', target: 'demo.b/written-form', accepted: ['sal'], closed: true },
      ],
      policy: STRICT,
    };
    expect(summary(checkResponse(task, { text: 'pan y sal' }))).toEqual([
      ['correct', 'check.slot:a:correct', null],
      ['correct', 'check.slot:b:correct', null],
    ]);
    expect(summary(checkResponse(task, { text: 'pan y sal y agua' }))).toEqual([
      ['unresolved', 'check.unresolved.templateAmbiguous', null],
      ['unresolved', 'check.unresolved.templateAmbiguous', null],
    ]);
  });
});

describe('rubric-review', () => {
  it('free text that is not an exemplar stays unresolved; an exact exemplar may be correct', () => {
    expect(summary(checkResponse(T10, { text: 'Hoy he comido paella.' }))).toEqual([['unresolved', 'check.unresolved.rubric', null]]);
    expect(summary(checkResponse(T10, { text: 'Hoy he trabajado mucho' }))).toEqual([['correct', 'check.correct', 'ex1']]);
  });
});

describe('isWellFormedForCheck', () => {
  it('accepts the fixture tasks', () => {
    for (const task of [T02, T09, T10, T12]) expect(isWellFormedForCheck(task), task.id).toEqual({ ok: true, issues: [] });
  });

  it('rejects adjacent slots, unknown/unreferenced slots and foreign outcome keys', () => {
    const adjacent: CheckableTask = { ...T09, template: [{ slot: 'aux' }, { slot: 'part' }, ' los deberes.'] };
    expect(isWellFormedForCheck(adjacent).issues).toContain('template.adjacentSlots');
    expect(checkResponse(adjacent, { text: 'hehecho los deberes.' }).results.map((r) => r.correctness)).toEqual([
      'invalid-item',
      'invalid-item',
    ]);
    const unknownSlot: CheckableTask = { ...T09, template: [{ slot: 'aux' }, ' ', { slot: 'zzz' }] };
    expect(isWellFormedForCheck(unknownSlot).issues).toEqual(expect.arrayContaining(['template.unknownSlot:zzz', 'slots.unreferenced:part']));
    const foreign: CheckableTask = { ...T12, errors: [{ id: 'x', text: 'ha hacido', outcomes: { 'other.skill/written-form': 'incorrect' } }] };
    expect(isWellFormedForCheck(foreign).issues).toContain('errors.x.outcomeTarget:other.skill/written-form');
  });

  it('rejects colliding accepted/error variants and choice tasks without a fully correct option', () => {
    const collision = exact(['hecho.'], OPTIONAL);
    const withError: CheckableTask = { ...collision, errors: [{ id: 'e', text: 'hecho', outcomes: { 'demo.skill/written-form': 'incorrect' } }] };
    expect(isWellFormedForCheck(withError).issues).toContain('variants.collision:e');
    const noCorrect: CheckableTask = {
      mode: 'choice',
      targets: [W('demo.x')],
      options: [
        { id: 'a', outcomes: { 'demo.x/written-form': 'incorrect' } },
        { id: 'b', outcomes: { 'demo.x/written-form': 'unresolved' } },
      ],
    };
    expect(isWellFormedForCheck(noCorrect).issues).toContain('options.noCorrect');
  });
});
