// Content tooling contract tests (brief 02): validator failures, deterministic revision IDs,
// receipt signatures, pack manifest verification and the review workflow with a fake runner.
// Every test works in its own temp directory; SLL_REVIEW_KEYS_DIR/SLL_HOME point to temp dirs.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { canonicalJson, canonicalSha256, revisionId } from '../../tools/content/canonical.ts';
import { runValidation } from '../../tools/content/validate.ts';
import type { RunValidationResult } from '../../tools/content/validate.ts';
import { loadOrCreateKey } from '../../tools/review/keys.ts';
import { signReceipt, verifyReceipt } from '../../tools/review/receipts.ts';
import { makeFixture, writeFixture } from './content-fixture.ts';
import type { Fixture, Json } from './content-fixture.ts';

const tempRoots: string[] = [];
const savedEnv = { keys: process.env.SLL_REVIEW_KEYS_DIR, home: process.env.SLL_HOME };

beforeAll(() => {
  const keysRoot = mkdtempSync(join(tmpdir(), 'sll-keys-'));
  tempRoots.push(keysRoot);
  process.env.SLL_REVIEW_KEYS_DIR = join(keysRoot, 'keys');
  process.env.SLL_HOME = join(keysRoot, 'home');
});

afterAll(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  if (savedEnv.keys === undefined) delete process.env.SLL_REVIEW_KEYS_DIR;
  else process.env.SLL_REVIEW_KEYS_DIR = savedEnv.keys;
  if (savedEnv.home === undefined) delete process.env.SLL_HOME;
  else process.env.SLL_HOME = savedEnv.home;
});

function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempRoots.push(dir);
  return dir;
}

function validate(mutate?: (f: Fixture) => void, options: { allowIncomplete?: boolean } = {}): RunValidationResult {
  const fixture = makeFixture();
  mutate?.(fixture);
  const written = writeFixture(fixture, tempDir('sll-content-'));
  return runValidation({ sourceDir: written.sourceDir, ledgerPath: written.ledgerPath, ...options });
}

const codes = (r: { errors: Array<{ code: string }> }): string[] => r.errors.map((e) => e.code);
const taskOf = (f: Fixture, file: string, id: string): Json => f.files[file].tasks.find((t: Json) => t.id === id);

describe('content validator', () => {
  it('accepts the synthetic baseline corpus without errors or warnings', () => {
    const r = validate();
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it('reports a missing ledger lesson/check file and an unmapped objective', () => {
    const r = validate((f) => {
      delete f.files['lessons/A1-01-C1.json'];
      delete f.files['tasks/A1-01-C1.json'];
      f.ledger.rows.push({ id: 'A1-01-O3', kind: 'objective', blockId: 'A1-01' });
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'ledger.lesson-missing', message: expect.stringContaining('A1-01-C1') }));
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'ledger.objective-unmapped', message: expect.stringContaining('A1-01-O3') }));
  });

  it('downgrades completeness gaps to warnings only with allowIncomplete', () => {
    const r = validate((f) => delete f.files['lessons/A1-01-C1.json'], { allowIncomplete: true });
    expect(codes(r)).not.toContain('ledger.lesson-missing');
    expect(r.warnings.map((w) => w.code)).toContain('ledger.lesson-missing');
  });

  it('detects a prerequisite cycle', () => {
    const r = validate((f) => {
      const skills = f.files['skills/A1-01.json'].skills;
      skills.find((s: Json) => s.skillId === 'participle.hecho').prerequisites = ['perfecto.choice'];
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'prereq.cycle', message: expect.stringContaining('participle.hecho') }));
    expect(codes(r)).toContain('prereq.order');
  });

  it('rejects a task that targets a skill taught in a later lesson', () => {
    const r = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T07');
      t.targets.push({ skillId: 'perfecto.choice', modality: 'context-choice' });
      t.closed = false;
      t.errors[0].outcomes = { 'participle.hecho/written-form': 'incorrect' };
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'task.untaught-target', entity: { kind: 'task', id: 'A1-01-L1-T07' } }));
  });

  it('rejects a finite-slots template with adjacent slots', () => {
    const r = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T05');
      t.template = ['Esta semana he ', { slot: 'part' }, { slot: 'extra' }, ' muchas cosas.'];
      t.slots.push({ id: 'extra', target: 'participle.hecho/written-form', accepted: ['ya'], closed: false });
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'task.template-adjacent-slots', entity: { kind: 'task', id: 'A1-01-L1-T05' } }));
  });

  it('enforces collection size (schema) and existing phrase references', () => {
    const small = validate((f) => f.files['collections.json'].collections[0].phraseIds.pop());
    expect(small.errors).toContainEqual(expect.objectContaining({ code: 'schema', file: 'collections.json' }));
    const unknown = validate((f) => {
      f.files['collections.json'].collections[1].phraseIds[0] = 'phrase.missing';
    });
    expect(unknown.errors).toContainEqual(expect.objectContaining({ code: 'ref.phrase', entity: { kind: 'collection', id: 'collection.c2' } }));
  });

  it('requires exactly eight collections', () => {
    const r = validate((f) => f.files['collections.json'].collections.pop());
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'schema', file: 'collections.json' }));
  });

  it('catches answer-key collisions after normalization and closed misuse', () => {
    const r = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T01');
      t.accepted = [{ id: 'v1', text: '¿Hecho?' }];
      t.errors = [{ id: 'e1', text: 'Hecho', outcomes: { 'participle.hecho/written-form': 'incorrect' }, feedbackUk: 'Синтетично.' }];
      const slots = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T05');
      slots.closed = true;
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'key.error-collides-accepted', entity: { kind: 'task', id: 'A1-01-L1-T01' } }));
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'task.closed-misuse', entity: { kind: 'task', id: 'A1-01-L1-T05' } }));
  });

  it('keeps accents and case distinct unless the policy says otherwise', () => {
    const accent = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T02');
      t.accepted = [{ id: 'v1', text: 'tú' }];
      t.errors = [{ id: 'e1', text: 'tu', outcomes: { 'participle.hecho/written-form': 'incorrect' }, feedbackUk: 'Синтетично.' }];
    });
    expect(codes(accent)).not.toContain('key.error-collides-accepted');
    const caseInsensitive = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T02');
      t.policy = { case: 'insensitive', terminalPunctuation: 'required' };
      t.errors = [{ id: 'e1', text: 'HECHO', outcomes: { 'participle.hecho/written-form': 'incorrect' }, feedbackUk: 'Синтетично.' }];
    });
    expect(codes(caseInsensitive)).toContain('key.error-collides-accepted');
  });

  it('rejects outcome keys that are not the task targets and slot round-trip failures', () => {
    const r = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L2.json', 'A1-01-L2-T01');
      t.options[1].outcomes = { 'shop.more/listening-meaning': 'incorrect' };
      const s = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T06');
      // Contains the closing literal, so the rendered answer cannot be parsed back unambiguously.
      s.slots[0].accepted = ['hecho', 'hecho muchas cosas. Y he'];
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'key.outcome-target', entity: { kind: 'task', id: 'A1-01-L2-T01' } }));
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'key.slot-roundtrip', entity: { kind: 'task', id: 'A1-01-L1-T06' } }));
  });

  it('requires two distinct clips per listening target and a meaning task per clip', () => {
    const r = validate((f) => {
      f.files['audio/A1-01.json'].clips[1].transcript = '¿Algo más?';
      f.files['audio/A1-01.json'].clips.push({ ...f.files['audio/A1-01.json'].clips[0], id: 'clip.orphan', transcript: 'Nada más.' });
    });
    expect(codes(r)).toContain('clip.no-meaning-task');
    const one = validate((f) => {
      f.files['audio/A1-01.json'].clips[1].transcript = '¿algo más?';
    });
    expect(one.errors).toContainEqual(expect.objectContaining({ code: 'listening.clips', entity: { kind: 'skill', id: 'shop.more' } }));
  });

  it('requires CV allocations on lessons and skills', () => {
    const r = validate((f) => {
      delete f.files['lessons/A1-01-L1.json'].cv;
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'cv.lesson-missing', message: expect.stringContaining('CV-01') }));
  });

  it('rejects placeholders in reviewed items and readiness without receipts; Spanish "todo" is not a placeholder', () => {
    const r = validate((f) => {
      const t = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T03');
      t.reviewStatus = 'reviewed';
      t.feedback.correctUk = 'TBD';
      const t2 = taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T04');
      t2.prompt.push({ type: 'paragraph', language: 'es-ES', text: 'Lo he hecho todo. TODO A 1 EURO' });
    });
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'text.placeholder', entity: { kind: 'task', id: 'A1-01-L1-T03' } }));
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'review.no-index', entity: { kind: 'task', id: 'A1-01-L1-T03' } }));
    expect(r.errors.concat(r.warnings).filter((i) => i.entity?.id === 'A1-01-L1-T04')).toEqual([]);
  });

  it('warns (not errors) on bank deviations and language tagging', () => {
    const r = validate((f) => {
      const file = f.files['tasks/A1-01-L1.json'];
      file.tasks = file.tasks.filter((t: Json) => !['A1-01-L1-T09', 'A1-01-L1-T10', 'A1-01-L1-T08'].includes(t.id));
      taskOf(f, 'tasks/A1-01-L1.json', 'A1-01-L1-T01').prompt.push({ type: 'paragraph', language: 'uk', text: 'He hecho la cena.' });
    });
    expect(r.errors).toEqual([]);
    expect(r.warnings.map((w) => w.code)).toEqual(expect.arrayContaining(['bank.size', 'bank.roles', 'lang.block-uk-latin']));
  });
});

describe('canonical JSON and revision IDs', () => {
  it('serializes with sorted keys and no whitespace', () => {
    expect(canonicalJson({ b: 1, a: [true, null, 'é'], c: { z: 0, y: 'x' } })).toBe('{"a":[true,null,"é"],"b":1,"c":{"y":"x","z":0}}');
  });

  it('derives a deterministic RFC 9562 version-8 UUID from kind|logicalId|canonical body', () => {
    const body = { id: 'A1-01-L1-T01', text: 'hecho', n: 1 };
    const id = revisionId('task', 'A1-01-L1-T01', body);
    expect(revisionId('task', 'A1-01-L1-T01', { n: 1, text: 'hecho', id: 'A1-01-L1-T01' })).toBe(id);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    const digest = createHash('sha256').update('task|A1-01-L1-T01|{"id":"A1-01-L1-T01","n":1,"text":"hecho"}').digest();
    const bytes = Buffer.from(digest.subarray(0, 16));
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x80;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    expect(id.replaceAll('-', '')).toBe(bytes.toString('hex'));
    expect(revisionId('task', 'A1-01-L1-T01', { ...body, text: 'hecha' })).not.toBe(id);
    expect(revisionId('lesson', 'A1-01-L1-T01', body)).not.toBe(id);
  });
});

describe('execution receipts', () => {
  const fields = {
    jobId: '00000000-0000-4000-8000-0000000000aa',
    provider: 'openai',
    model: 'gpt-6.1-sol',
    effort: 'xhigh',
    artifactHash: 'a'.repeat(64),
    reportHash: 'b'.repeat(64),
    completedAt: '2026-11-06T10:00:00.000Z',
  };

  it('signs a contract-valid receipt that verifies with the local key', () => {
    const key = loadOrCreateKey(join(tempDir('sll-k-'), 'keys'));
    const receipt = signReceipt(fields, key);
    expect(receipt.keyId).toBe(key.keyId);
    expect(receipt.signature).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyReceipt(receipt, key)).toEqual({ ok: true });
  });

  it('rejects forged or altered receipts and receipts from another key', () => {
    const key = loadOrCreateKey(join(tempDir('sll-k-'), 'keys'));
    const other = loadOrCreateKey(join(tempDir('sll-k-'), 'keys'));
    const receipt = signReceipt(fields, key);
    expect(verifyReceipt({ ...receipt, model: 'gpt-6.1-terra' }, key).ok).toBe(false);
    expect(verifyReceipt({ ...receipt, signature: 'f'.repeat(64) }, key).ok).toBe(false);
    expect(verifyReceipt(receipt, other).ok).toBe(false);
    const forged = signReceipt(fields, other);
    expect(verifyReceipt({ ...forged, keyId: key.keyId }, key).ok).toBe(false);
    expect(verifyReceipt({ ...receipt, extra: 1 }, key).ok).toBe(false);
  });

  it('creates the key store with private permissions and reuses it', () => {
    const dir = join(tempDir('sll-k-'), 'nested', 'keys');
    const a = loadOrCreateKey(dir);
    const b = loadOrCreateKey(dir);
    expect(b.keyId).toBe(a.keyId);
    expect(canonicalSha256(b.key.toString('hex'))).toBe(canonicalSha256(a.key.toString('hex')));
  });
});
