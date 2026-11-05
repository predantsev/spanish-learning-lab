import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContractValidator, schemas } from '@sll/contracts';

const examples = JSON.parse(readFileSync(new URL('../../docs/contracts/examples.json', import.meta.url), 'utf8')) as {
  valid: Array<{ schema: string; value: unknown }>;
  invalid: Array<{ schema: string; value: unknown }>;
};

describe('wire contracts', () => {
  const v = createContractValidator();

  it('accepts every synthetic valid example', () => {
    for (const ex of examples.valid) {
      const r = v.validate(ex.schema, ex.value);
      expect(r, `${ex.schema} ${JSON.stringify(ex.value).slice(0, 120)}`).toEqual({ ok: true });
    }
  });

  it('rejects every synthetic invalid example', () => {
    for (const ex of examples.invalid) {
      expect(v.validate(ex.schema, ex.value).ok, JSON.stringify(ex.value).slice(0, 160)).toBe(false);
    }
  });

  it('never coerces types, applies defaults or strips unknown properties', () => {
    const start = {
      operationId: '00000000-0000-4000-8000-000000000020',
      profileEpoch: 1,
      subjectId: '00000000-0000-4000-8000-000000000002',
      expectedRevision: 0,
      kind: 'session.start',
      payload: { source: 'recommended', targets: [], mode: 'review', minutes: 10, maxItems: 10 },
    };
    expect(v.validate('Command', start).ok).toBe(true);
    const coerced = structuredClone(start) as Record<string, any>;
    coerced.payload.minutes = '10';
    expect(v.validate('Command', coerced).ok).toBe(false);
    expect(coerced.payload.minutes).toBe('10');
    const extra = { ...structuredClone(start), extra: 1 } as Record<string, unknown>;
    expect(v.validate('Command', extra).ok).toBe(false);
    expect(extra.extra).toBe(1);
  });

  it('compiles every schema definition', () => {
    for (const name of Object.keys(schemas.$defs)) expect(() => v.compile(name)).not.toThrow();
  });
});
