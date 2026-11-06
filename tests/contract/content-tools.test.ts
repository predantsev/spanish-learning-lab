// Content tooling contract tests (brief 02): validator failures, deterministic revision IDs,
// receipt signatures, pack manifest verification and the review workflow with a fake runner.
// Every test works in its own temp directory; SLL_REVIEW_KEYS_DIR/SLL_HOME point to temp dirs.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { canonicalJson, canonicalSha256, revisionId } from '../../tools/content/canonical.ts';
import { buildPack, verifyPack } from '../../tools/content/pack.ts';
import { runValidation } from '../../tools/content/validate.ts';
import type { RunValidationResult } from '../../tools/content/validate.ts';
import { applyReview } from '../../tools/review/apply.ts';
import { loadOrCreateKey, resolveKeysDir } from '../../tools/review/keys.ts';
import { buildPacket, writePacket } from '../../tools/review/packet.ts';
import { promote } from '../../tools/review/promote.ts';
import { signReceipt, verifyReceipt } from '../../tools/review/receipts.ts';
import { LANGUAGE_DIRECTIVE, runCodexReview } from '../../tools/review/run-codex.ts';
import type { Runner, RunnerInput } from '../../tools/review/run-codex.ts';
import { createReceiptIndex, packetHashOf, readPacket } from '../../tools/review/store.ts';
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

describe('content pack', () => {
  const createdAt = '2026-11-06T00:00:00.000Z';

  function allReady(f: Fixture): void {
    const visit = (value: Json): void => {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') {
        if ('reviewStatus' in value) value.reviewStatus = 'ready';
        Object.values(value).forEach(visit);
      }
    };
    visit(f.files);
    for (const item of f.files['lexicon/A1-01.json'].items) item.reviewStatus = 'ready';
    for (const s of f.files['situations.json'].situations) s.reviewStatus = 'ready';
  }

  it('builds a preview pack whose manifest, hashes and revision IDs verify', () => {
    const w = writeFixture(makeFixture(), tempDir('sll-pack-'));
    const out = join(w.root, 'pack');
    const r = buildPack({ out, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, allowUnreviewed: true, createdAt, version: '0.1.0-test' });
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.manifest?.preview).toBe(true);
    expect(r.manifest?.counts.entities).toMatchObject({ lesson: 3, task: 15, skill: 3, clip: 2, phrase: 12, collection: 8 });
    expect(verifyPack(out)).toMatchObject({ ok: true, errors: [], packHash: r.packHash });
    const lines = readFileSync(join(out, 'entities.ndjson'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const task = lines.find((l) => l.logicalId === 'A1-01-L1-T01');
    expect(task.revisionId).toBe(revisionId('task', 'A1-01-L1-T01', task.body));
    expect(task.body.reviewStatus).toBeUndefined();
    expect(task.state).toBe('draft');
    // Same source + createdAt → byte-identical manifest in a second directory.
    const again = buildPack({ out: join(w.root, 'pack2'), sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, allowUnreviewed: true, createdAt, version: '0.1.0-test' });
    expect(again.packHash).toBe(r.packHash);
  });

  it('detects tampering with any packed file', () => {
    const w = writeFixture(makeFixture(), tempDir('sll-pack-'));
    const out = join(w.root, 'pack');
    expect(buildPack({ out, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, allowUnreviewed: true, createdAt }).ok).toBe(true);
    const path = join(out, 'entities.ndjson');
    chmodSync(path, 0o644);
    writeFileSync(path, readFileSync(path, 'utf8').replace('hecho', 'hacido'));
    const v = verifyPack(out);
    expect(v.ok).toBe(false);
    expect(v.errors.join('\n')).toMatch(/entities\.ndjson: sha256 mismatch/);
    writeFileSync(join(out, 'extra.txt'), 'x');
    expect(verifyPack(out).errors).toContain('unlisted file extra.txt');
  });

  it('refuses a release pack with unready required entities and never overwrites a pack', () => {
    const w = writeFixture(makeFixture(), tempDir('sll-pack-'));
    const strict = buildPack({ out: join(w.root, 'strict'), sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, createdAt });
    expect(strict.ok).toBe(false);
    expect(strict.errors).toContain('required lesson A1-01-L1 is draft, not ready');
    expect(existsSync(join(w.root, 'strict'))).toBe(false);
    const out = join(w.root, 'pack');
    expect(buildPack({ out, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, allowUnreviewed: true, createdAt }).ok).toBe(true);
    const second = buildPack({ out, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, allowUnreviewed: true, createdAt });
    expect(second.ok).toBe(false);
    expect(second.errors[0]).toMatch(/not empty; packs are immutable/);
  });

  it('builds a release pack when everything is ready, receipted and every clip has reviewed media', () => {
    const fixture = makeFixture();
    allReady(fixture);
    const w = writeFixture(fixture, tempDir('sll-pack-'));
    const yes = { hasReviewReceipt: () => true, hasValidationReceipt: () => true };
    const mediaDir = join(w.root, 'media');
    mkdirSync(mediaDir);
    const entries = ['clip.shop-more-a', 'clip.shop-more-b'].map((clipId, i) => {
      const bytes = Buffer.concat([Buffer.from('ID3'), Buffer.from(`synthetic-${i}`)]);
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      writeFileSync(join(mediaDir, `${sha256}.mp3`), bytes);
      return { clipId, sha256, durationMs: 1500 + i, rightsRecordId: 'rights.synthetic', receiptIds: ['00000000-0000-4000-8000-0000000000c1'] };
    });
    writeFileSync(join(mediaDir, 'index.json'), JSON.stringify({ entries }));
    const withoutMedia = buildPack({ out: join(w.root, 'nomedia'), sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, receipts: yes, createdAt });
    expect(withoutMedia.ok).toBe(false);
    expect(withoutMedia.errors.join('\n')).toMatch(/2 packed clip\(s\) without reviewed media/);
    const out = join(w.root, 'release');
    const r = buildPack({ out, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, receipts: yes, mediaDir, createdAt });
    expect(r.errors).toEqual([]);
    expect(r.manifest?.preview).toBeUndefined();
    expect(r.manifest?.media.map((m) => m.clipId)).toEqual(['clip.shop-more-a', 'clip.shop-more-b']);
    expect(r.manifest?.media[0]).toMatchObject({ mime: 'audio/mpeg', rights: { rightsRecordId: 'rights.synthetic' } });
    expect(verifyPack(out).ok).toBe(true);
  });
});

describe('review workflow (fake codex runner, no model calls)', () => {
  const createdAt = '2026-11-06T09:00:00.000Z';

  function fakeRunner(reviewsDir: string, batchId: string, seen: RunnerInput[], blockingTask = 'A1-01-L1-T03'): Runner {
    return async (input) => {
      seen.push(input);
      const packet = readPacket(reviewsDir, batchId);
      const output = {
        items: packet.items.map((i) => ({
          kind: i.kind,
          logicalId: i.logicalId,
          contentHash: i.contentHash,
          severity: i.logicalId === blockingTask ? 'blocking' : 'none',
          findings:
            i.logicalId === blockingTask
              ? [{ severity: 'blocking', category: 'answer-leakage', location: 'prompt[1].text', description: 'Synthetic finding: the prompt shows the answer.', suggestion: 'Remove the model sentence.' }]
              : [],
        })),
        verdicts: packet.targets.map((t) => ({ skillId: t.slice(0, t.lastIndexOf('/')), modality: t.slice(t.lastIndexOf('/') + 1), correctness: 'correct', explanationKey: 'content-review.ok' })),
        sources: [{ url: 'https://example.invalid/synthetic-reference', passage: 'not retrieved', finding: 'Synthetic test source.' }],
        uncertainties: [],
        findings: ['Synthetic review summary.'],
      };
      writeFileSync(input.lastMessagePath, JSON.stringify(output));
      return {
        exitCode: 0,
        stdout: [
          JSON.stringify({ type: 'thread.started', thread_id: '00000000-0000-7000-8000-000000000001' }),
          JSON.stringify({ type: 'turn.started' }),
          JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 10, output_tokens: 5 } }),
        ].join('\n'),
        stderr: '[codex-wrapper] skipped: prompt is read from stdin\n',
        timedOut: false,
      };
    };
  }

  function setup(): { w: ReturnType<typeof writeFixture>; keysDir: string; batchId: string } {
    const w = writeFixture(makeFixture(), tempDir('sll-review-'));
    const keysDir = join(w.root, 'keys');
    const packet = buildPacket({ sourceDir: w.sourceDir, scope: { type: 'lesson', lessonId: 'A1-01-L1' }, authorProvider: 'anthropic', authorModel: 'claude-opus-5-5', createdAt });
    writePacket(w.reviewsDir, packet);
    return { w, keysDir, batchId: packet.batchId };
  }

  it('builds a hash-bound packet with items, targets, context and instructions', () => {
    const { w, batchId } = setup();
    const packet = readPacket(w.reviewsDir, batchId);
    expect(packet.packetHash).toBe(packetHashOf(packet));
    expect(packet.items.map((i) => `${i.kind}:${i.logicalId}`)).toEqual(expect.arrayContaining(['lesson:A1-01-L1', 'task:A1-01-L1-T01', 'task:A1-01-L1-T10', 'skill:participle.hecho', 'lexeme:lex.hacer', 'material:material.hecho-table', 'situation:greetings']));
    expect(packet.targets).toEqual(['participle.hecho/written-form']);
    expect(packet.instructions.duties).toHaveLength(8);
    expect(packet.context.sources).toEqual([expect.objectContaining({ id: 'S1' })]);
    expect(() => writePacket(w.reviewsDir, packet)).toThrow(/immutable/);
  });

  it('runs the reviewer through an injected runner, signs a receipt and stores every artifact with hashes', async () => {
    const { w, keysDir, batchId } = setup();
    const seen: RunnerInput[] = [];
    const dry = await runCodexReview({ reviewsDir: w.reviewsDir, batchId, repoRoot: w.root, keysDir, runner: fakeRunner(w.reviewsDir, batchId, seen), dryRun: true });
    expect(dry.status).toBe('dry-run');
    expect(seen).toHaveLength(0);
    const r = await runCodexReview({ reviewsDir: w.reviewsDir, batchId, repoRoot: w.root, keysDir, runner: fakeRunner(w.reviewsDir, batchId, seen), versionProbe: () => 'codex-cli fake' });
    expect(r.problems).toEqual([]);
    expect(r.status).toBe('completed');
    const input = seen[0] as RunnerInput;
    expect(input.argv).toEqual(expect.arrayContaining(['exec', '--sandbox', 'read-only', '-m', 'gpt-6.1-sol', '-c', 'model_reasoning_effort=xhigh', '--json', '--ephemeral', '--output-schema', '--skip-git-repo-check']));
    expect(input.argv.at(-1)).toBe('-');
    expect(input.stdin.startsWith(LANGUAGE_DIRECTIVE)).toBe(true);
    const dir = r.runDir as string;
    expect(readFileSync(join(dir, 'prompt.txt'), 'utf8')).toBe(input.stdin);
    const run = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8'));
    expect(run).toMatchObject({ status: 'completed', model: 'gpt-6.1-sol', effort: 'xhigh', codexVersion: 'codex-cli fake', threadId: '00000000-0000-7000-8000-000000000001', wrapper: { notes: ['[codex-wrapper] skipped: prompt is read from stdin'] } });
    for (const [name, sha] of Object.entries(run.files as Record<string, string>)) expect(createHash('sha256').update(readFileSync(join(dir, name))).digest('hex')).toBe(sha);
    const receipt = JSON.parse(readFileSync(join(dir, 'receipt.json'), 'utf8'));
    expect(verifyReceipt(receipt, loadOrCreateKey(keysDir))).toEqual({ ok: true });
    const report = JSON.parse(readFileSync(join(dir, 'report.json'), 'utf8'));
    expect(receipt.reportHash).toBe(canonicalSha256(report));
    expect(report.reviewReport).toMatchObject({ provider: 'openai', authorProvider: 'anthropic', artifactHash: readPacket(w.reviewsDir, batchId).packetHash });
  });

  it('applies findings, promotes only verified reviewed items and keeps validation green', async () => {
    const { w, keysDir, batchId } = setup();
    await runCodexReview({ reviewsDir: w.reviewsDir, batchId, repoRoot: w.root, keysDir, runner: fakeRunner(w.reviewsDir, batchId, []), versionProbe: () => 'fake' });
    const dryApply = applyReview({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, batchId, keysDir, dryRun: true });
    expect(dryApply.transitions.length).toBeGreaterThan(0);
    expect(readFileSync(join(w.sourceDir, 'tasks/A1-01-L1.json'), 'utf8')).not.toContain('"reviewed"');
    const applied = applyReview({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, batchId, keysDir });
    expect(applied.transitions).toContainEqual({ kind: 'task', id: 'A1-01-L1-T03', from: 'draft', to: 'needs-review', severity: 'blocking' });
    expect(applied.transitions).toContainEqual({ kind: 'task', id: 'A1-01-L1-T01', from: 'draft', to: 'reviewed', severity: 'none' });
    expect(applied.transitions).toContainEqual({ kind: 'lexeme', id: 'lex.hacer', from: 'draft', to: 'reviewed', severity: 'none' });
    expect(JSON.parse(readFileSync(applied.findingsPath as string, 'utf8')).items[0]).toMatchObject({ logicalId: 'A1-01-L1-T03', severity: 'blocking' });

    const receipts = createReceiptIndex({ reviewsDir: w.reviewsDir, verifySignatures: true, key: loadOrCreateKey(keysDir) });
    const afterApply = runValidation({ sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, receipts });
    expect(afterApply.errors).toEqual([]);

    const promoted = promote({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, batchId, keysDir });
    expect(promoted.promoted.map((p) => p.id)).toContain('A1-01-L1-T01');
    expect(promoted.refused).toEqual([expect.objectContaining({ id: 'A1-01-L1-T03', reasons: expect.arrayContaining(['status is needs-review, expected reviewed']) })]);
    const tasks = JSON.parse(readFileSync(join(w.sourceDir, 'tasks/A1-01-L1.json'), 'utf8')).tasks;
    expect(tasks.find((t: Json) => t.id === 'A1-01-L1-T01').reviewStatus).toBe('ready');
    expect(tasks.find((t: Json) => t.id === 'A1-01-L1-T03').reviewStatus).toBe('needs-review');
    const finalIndex = createReceiptIndex({ reviewsDir: w.reviewsDir, verifySignatures: true, key: loadOrCreateKey(keysDir) });
    expect(runValidation({ sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, receipts: finalIndex }).errors).toEqual([]);
    // Without its receipts a hand-set ready status is caught.
    const bare = runValidation({ sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, receipts: { hasReviewReceipt: () => false, hasValidationReceipt: () => false } });
    expect(bare.errors.map((e) => e.code)).toContain('review.validation-missing');
  });

  it('rejects tampered reports, same-provider reviews, edited content and failed runs', async () => {
    const { w, keysDir, batchId } = setup();
    const ok = await runCodexReview({ reviewsDir: w.reviewsDir, batchId, repoRoot: w.root, keysDir, runner: fakeRunner(w.reviewsDir, batchId, [], 'none'), versionProbe: () => 'fake' });
    const reportPath = join(ok.runDir as string, 'report.json');
    const original = readFileSync(reportPath, 'utf8');
    writeFileSync(reportPath, original.replace('"severity": "none"', '"severity": "minor"'));
    expect(() => applyReview({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, batchId, keysDir })).toThrow(/report\.json does not match receipt\.reportHash/);
    writeFileSync(reportPath, original);
    const receiptPath = join(ok.runDir as string, 'receipt.json');
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    writeFileSync(receiptPath, JSON.stringify({ ...receipt, model: 'gpt-forged' }));
    expect(() => applyReview({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, batchId, keysDir })).toThrow(/signature mismatch/);
    writeFileSync(receiptPath, JSON.stringify(receipt));

    applyReview({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, batchId, keysDir });
    const path = join(w.sourceDir, 'tasks/A1-01-L1.json');
    writeFileSync(path, readFileSync(path, 'utf8').replace('Синтетичне завдання 1:', 'Синтетичне завдання 1 (змінено):'));
    const refused = promote({ reviewsDir: w.reviewsDir, sourceDir: w.sourceDir, ledgerPath: w.ledgerPath, items: [{ kind: 'task', id: 'A1-01-L1-T01' }], keysDir });
    expect(refused.refused[0]?.reasons.join(' ')).toMatch(/no verified opposite-provider review receipt/);

    const same = buildPacket({ sourceDir: w.sourceDir, scope: { type: 'skills', skillIds: ['participle.hecho'] }, authorProvider: 'openai', createdAt });
    writePacket(w.reviewsDir, same);
    await expect(runCodexReview({ reviewsDir: w.reviewsDir, batchId: same.batchId, repoRoot: w.root, keysDir, runner: fakeRunner(w.reviewsDir, same.batchId, []) })).rejects.toThrow(/opposite-provider/);

    const other = buildPacket({ sourceDir: w.sourceDir, scope: { type: 'items', items: [{ kind: 'collection', id: 'collection.c1' }, { kind: 'skill', id: 'shop.more' }] }, authorProvider: 'anthropic', createdAt });
    writePacket(w.reviewsDir, other);
    const failing: Runner = async () => ({ exitCode: 1, stdout: JSON.stringify({ type: 'turn.failed', error: { message: 'synthetic failure' } }), stderr: '', timedOut: false });
    const failed = await runCodexReview({ reviewsDir: w.reviewsDir, batchId: other.batchId, repoRoot: w.root, keysDir, runner: failing, versionProbe: () => 'fake' });
    expect(failed.status).toBe('failed');
    expect(existsSync(join(failed.runDir as string, 'receipt.json'))).toBe(false);
    expect(existsSync(join(failed.runDir as string, 'run.json'))).toBe(true);
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

  it('creates the key store with private permissions, reuses it and refuses loose permissions', () => {
    const dir = join(tempDir('sll-k-'), 'nested', 'keys');
    const a = loadOrCreateKey(dir);
    const b = loadOrCreateKey(dir);
    expect(b.keyId).toBe(a.keyId);
    expect(canonicalSha256(b.key.toString('hex'))).toBe(canonicalSha256(a.key.toString('hex')));
    expect(statSync(dir).mode & 0o777).toBe(0o700);
    expect(statSync(join(dir, 'review-hmac.key')).mode & 0o777).toBe(0o600);
    chmodSync(join(dir, 'review-hmac.key'), 0o644);
    expect(() => loadOrCreateKey(dir)).toThrow(/accessible by group\/others/);
  });

  it('resolves the key directory from SLL_REVIEW_KEYS_DIR, then SLL_HOME', () => {
    expect(resolveKeysDir({ SLL_REVIEW_KEYS_DIR: '/tmp/a', SLL_HOME: '/tmp/b' })).toBe('/tmp/a');
    expect(resolveKeysDir({ SLL_HOME: '/tmp/b' })).toBe('/tmp/b/keys');
    expect(resolveKeysDir({})).toMatch(/Library\/Application Support\/Spanish Learning Lab\/keys$/);
  });
});
