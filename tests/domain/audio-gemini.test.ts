// Audio QA (tools/audio/qa-gemini.ts): owner-approval gate, cost cap, blind/reference separation and
// verdicts — exercised with a FAKE transport only. No network call and no real API key are used.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { type Deps, runCommand } from '../../tools/audio/qa-gemini.ts';
import {
  audioTokens,
  BLIND_PROMPT,
  clipVerdict,
  estimateJob,
  type GeminiRequest,
  type GeminiResponse,
  parseQuality,
  priceFor,
  type Pricing,
} from '../../tools/audio/lib/gemini.ts';
import { sha256Hex } from '../../tools/audio/lib/hash.ts';

const TRANSCRIPT = 'Son tres euros con cincuenta, pero hoy no abrimos.';
const PRICING: Pricing = {
  model: 'gemini-3.8-flash',
  periods: [
    { from: null, to: '2026-12-31', inputUsdPerMTok: 0.75, outputUsdPerMTok: 3.75 },
    { from: '2027-01-01', to: null, inputUsdPerMTok: 1.5, outputUsdPerMTok: 7.5 },
  ],
};
const NOW = new Date('2026-11-06T10:00:00Z');
const dirs: string[] = [];

afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

/** Temp media dir with one fake MP3 (bytes are irrelevant to a fake transport) and its index. */
function fixture(entries = 1): { dir: string; index: string; pricing: string; out: string } {
  const dir = mkdtempSync(join(tmpdir(), 'sll-gemini-test-'));
  dirs.push(dir);
  const list = [];
  for (let i = 0; i < entries; i++) {
    const bytes = Buffer.from(`fake-mp3-${i}`);
    const sha = sha256Hex(bytes);
    writeFileSync(join(dir, `${sha}.mp3`), bytes);
    list.push({ clipId: `clip.test.${i}`, voice: 'macos.monica', file: `${sha}.mp3`, sha256: sha, transcript: TRANSCRIPT, transcriptSha256: 'x', variety: 'es-ES', durationMs: 4000, lessonId: 'A1-05-L2' });
  }
  writeFileSync(join(dir, 'index.json'), JSON.stringify({ schemaVersion: 1, kind: 'sll-audio-media-index', note: 'test', updatedAt: NOW.toISOString(), entries: list }));
  writeFileSync(join(dir, 'pricing.json'), JSON.stringify(PRICING));
  return { dir, index: join(dir, 'index.json'), pricing: join(dir, 'pricing.json'), out: join(dir, 'results.json') };
}

/** Env proxy that records every property read, so tests can prove the key was never touched. */
function recordingEnv(values: Record<string, string>) {
  const reads: string[] = [];
  const env = new Proxy(values, {
    get(target, prop) {
      if (typeof prop === 'string') reads.push(prop);
      return target[prop as string];
    },
  }) as Record<string, string | undefined>;
  return { env, reads };
}

const isBlind = (req: GeminiRequest) => req.contents[0]?.parts[0]?.text === BLIND_PROMPT;

const goodQuality = {
  transcriptMatch: 'exact', differences: [], amountsCorrect: true, negationCorrect: true, stressIssues: [],
  intelligibility: 5, naturalness: 4, varietyJudgment: 'consistent-with-spain', varietyEvidence: '/θ/ in cincuenta',
  audioDefects: [], uncertainty: 'low', notes: '',
};

function reply(json: unknown, promptTokenCount = 300, candidatesTokenCount = 100): GeminiResponse {
  return { candidates: [{ content: { parts: [{ text: JSON.stringify(json) }] } }], usageMetadata: { promptTokenCount, candidatesTokenCount }, modelVersion: 'fake-1' };
}

function fakeTransport(handler: (req: GeminiRequest) => GeminiResponse) {
  const calls: Array<{ model: string; req: GeminiRequest; key: string }> = [];
  return {
    calls,
    transport: {
      async generateContent(model: string, req: GeminiRequest, key: string) {
        calls.push({ model, req, key });
        return handler(req);
      },
    },
  };
}

function deps(env: Record<string, string | undefined>, transport: Deps['transport'], log: string[] = []): Deps {
  return { env, transport, now: () => NOW, log: (line) => log.push(line) };
}

describe('qa-gemini owner-approval gate', () => {
  it('refuses without --i-have-owner-approval and never reads GEMINI_API_KEY or calls the transport', async () => {
    const f = fixture();
    const { env, reads } = recordingEnv({ GEMINI_API_KEY: 'should-not-be-read' });
    const fake = fakeTransport(() => reply({}));
    const log: string[] = [];
    const code = await runCommand(['run', '--index', f.index, '--pricing', f.pricing], deps(env, fake.transport, log));
    expect(code).toBe(2);
    expect(reads).not.toContain('GEMINI_API_KEY');
    expect(fake.calls).toHaveLength(0);
    expect(log.some((l) => l.startsWith('REFUSED') && l.includes('GEMINI_API_KEY was not read'))).toBe(true);
  });

  it('refuses an invalid cap and a cap below the upper-bound estimate, still without reading the key', async () => {
    const f = fixture();
    const { env, reads } = recordingEnv({ GEMINI_API_KEY: 'k' });
    const fake = fakeTransport(() => reply({}));
    expect(await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', 'abc'], deps(env, fake.transport))).toBe(2);
    expect(await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '0.001'], deps(env, fake.transport))).toBe(3);
    expect(reads).not.toContain('GEMINI_API_KEY');
    expect(fake.calls).toHaveLength(0);
  });

  it('estimate never reads the key', async () => {
    const f = fixture(3);
    const { env, reads } = recordingEnv({ GEMINI_API_KEY: 'k' });
    const log: string[] = [];
    expect(await runCommand(['estimate', '--index', f.index, '--pricing', f.pricing], deps(env, fakeTransport(() => reply({})).transport, log))).toBe(0);
    expect(reads).toHaveLength(0);
    expect(log.at(-1)).toMatch(/upper-bound estimate for 3 file\(s\)/);
  });

  it('reports a missing key after approval', async () => {
    const f = fixture();
    const { env, reads } = recordingEnv({});
    expect(await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '1'], deps(env, fakeTransport(() => reply({})).transport))).toBe(4);
    expect(reads).toContain('GEMINI_API_KEY');
  });
});

describe('qa-gemini jobs with a fake transport', () => {
  it('keeps the blind job free of the script and gives the quality job the reference', async () => {
    const f = fixture();
    const { env } = recordingEnv({ GEMINI_API_KEY: 'fake-key' });
    const fake = fakeTransport((req) => (isBlind(req) ? reply({ transcript: TRANSCRIPT, unintelligibleWords: 0, audioProblems: [] }) : reply(goodQuality)));
    const code = await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '1', '--out', f.out], deps(env, fake.transport));
    expect(code).toBe(0);
    expect(fake.calls).toHaveLength(2);
    const [blind, quality] = fake.calls;
    expect(blind?.model).toBe('gemini-3.8-flash');
    expect(blind?.key).toBe('fake-key');
    const blindText = JSON.stringify(blind?.req);
    expect(blindText).not.toContain('tres euros');
    expect(blindText).not.toContain('clip.test.0');
    expect(blind?.req.contents[0]?.parts[1]?.inline_data?.mime_type).toBe('audio/mp3');
    expect(JSON.stringify(quality?.req)).toContain(TRANSCRIPT);
    const results = JSON.parse(readFileSync(f.out, 'utf8'));
    expect(results.clips[0].verdict).toBe('pass-model-assessment');
    expect(results.clips[0].blind.receipt.requestSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(results.disclaimer).toMatch(/not human-native certification/);
    expect(results.spentUsd).toBeGreaterThan(0);
    expect(results.spentUsd).toBeLessThanOrEqual(results.capUsd);
  });

  it('blocks when the blind transcript drops the negation even if the quality job says exact', async () => {
    const f = fixture();
    const { env } = recordingEnv({ GEMINI_API_KEY: 'fake-key' });
    const fake = fakeTransport((req) =>
      isBlind(req) ? reply({ transcript: 'Son tres euros con cincuenta, pero hoy abrimos.', unintelligibleWords: 0, audioProblems: [] }) : reply(goodQuality),
    );
    await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '1', '--out', f.out], deps(env, fake.transport));
    const clip = JSON.parse(readFileSync(f.out, 'utf8')).clips[0];
    expect(clip.verdict).toBe('blocked');
    expect(clip.reasons.join(' ')).toMatch(/negation-mismatch/);
  });

  it('never passes on a malformed or failing response', async () => {
    const f = fixture();
    const { env } = recordingEnv({ GEMINI_API_KEY: 'fake-key' });
    const fake = fakeTransport((req) => {
      if (isBlind(req)) return { candidates: [{ content: { parts: [{ text: 'not json' }] } }] };
      throw new Error('HTTP 500');
    });
    const code = await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '1', '--out', f.out], deps(env, fake.transport));
    expect(code).toBe(0);
    const clip = JSON.parse(readFileSync(f.out, 'utf8')).clips[0];
    expect(clip.verdict).toBe('needs-review');
    expect(clip.blind.status).toBe('error');
    expect(clip.quality.status).toBe('error');
    expect(clip.quality.receipt.costNote).toMatch(/upper bound/);
  });

  it('stops before any job that could cross the cap', async () => {
    const f = fixture(3);
    const { env } = recordingEnv({ GEMINI_API_KEY: 'fake-key' });
    // Each call reports a huge usage, so the spend exceeds the per-job estimate and hits the cap.
    const fake = fakeTransport((req) =>
      isBlind(req) ? reply({ transcript: TRANSCRIPT, unintelligibleWords: 0, audioProblems: [] }, 500_000, 0) : reply(goodQuality, 500_000, 0),
    );
    const code = await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '0.1', '--out', f.out], deps(env, fake.transport));
    expect(code).toBe(5);
    const results = JSON.parse(readFileSync(f.out, 'utf8'));
    expect(results.stoppedAtCap).toBe(true);
    expect(fake.calls.length).toBeLessThan(6);
    const notRun = results.clips.flatMap((c: { blind: { receipt: { status?: string } | null }; quality: { receipt: { status?: string } | null } }) => [c.blind.receipt, c.quality.receipt]).filter((r: { status?: string } | null) => r?.status === 'not-run');
    expect(notRun.length).toBeGreaterThan(0);
  });

  it('refuses a file whose bytes no longer match the index', async () => {
    const f = fixture();
    const index = JSON.parse(readFileSync(f.index, 'utf8'));
    writeFileSync(join(f.dir, index.entries[0].file), 'tampered');
    const { env } = recordingEnv({ GEMINI_API_KEY: 'fake-key' });
    const fake = fakeTransport(() => reply(goodQuality));
    await runCommand(['run', '--index', f.index, '--pricing', f.pricing, '--i-have-owner-approval', '1', '--out', f.out], deps(env, fake.transport));
    expect(fake.calls).toHaveLength(0);
    expect(JSON.parse(readFileSync(f.out, 'utf8')).clips[0].verdict).toBe('needs-review');
  });
});

describe('cost and verdict helpers', () => {
  it('estimates audio at 32 tokens per second and uses the dated price period', () => {
    expect(audioTokens(1000)).toBe(32);
    expect(audioTokens(10_500)).toBe(336);
    expect(priceFor(PRICING, new Date('2026-12-31T12:00:00Z')).inputUsdPerMTok).toBe(0.75);
    expect(priceFor(PRICING, new Date('2027-01-01T12:00:00Z')).inputUsdPerMTok).toBe(1.5);
    const est = estimateJob(10_000, 'x'.repeat(300), 1000, { from: null, to: null, inputUsdPerMTok: 1, outputUsdPerMTok: 10 });
    expect(est.inputTokens).toBe(320 + 100);
    expect(est.upperBoundUsd).toBeCloseTo((420 * 1 + 1000 * 10) / 1_000_000, 12);
  });

  it('requires every signal to be clean for a pass', () => {
    const ok = { status: 'ok' as const, result: parseQuality(JSON.stringify(goodQuality)) };
    const blind = { status: 'ok' as const, result: { transcript: TRANSCRIPT, unintelligibleWords: 0, audioProblems: [] } };
    expect(clipVerdict(null, blind, ok).verdict).toBe('pass-model-assessment');
    const notSpain = { status: 'ok' as const, result: { ...ok.result, varietyJudgment: 'not-spain' as const } };
    expect(clipVerdict(null, blind, notSpain).verdict).toBe('blocked');
    const unsure = { status: 'ok' as const, result: { ...ok.result, uncertainty: 'medium' as const } };
    expect(clipVerdict(null, blind, unsure).verdict).toBe('needs-review');
    expect(clipVerdict(null, blind, { status: 'not-run' }).verdict).toBe('needs-review');
    expect(() => parseQuality(JSON.stringify({ ...goodQuality, intelligibility: 9 }))).toThrow();
  });
});
