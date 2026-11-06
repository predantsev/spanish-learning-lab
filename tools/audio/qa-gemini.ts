// Actual-file language QA with Gemini — PREPARED, NOT EXECUTED (owner approval of the spend is pending).
//
//   node tools/audio/qa-gemini.ts estimate [--index work/media/index.json] [--limit N]
//   node tools/audio/qa-gemini.ts run --i-have-owner-approval <cap-usd> [--index …] [--limit N]
//        [--jobs blind,quality] [--out content/reviews/audio/gemini-<date>.json]
//   node tools/audio/qa-gemini.ts score --labels <labels.json> --gemini <results.json> [--technical <report.json>]
//
// `run` refuses without --i-have-owner-approval and never reads GEMINI_API_KEY in that case. With approval
// it estimates the upper-bound cost first (audio ≈ 32 tokens/s + prompt + max output tokens), refuses when
// the estimate exceeds the cap, and stops before any job that could cross the cap.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { many, one, parseArgs } from './lib/args.ts';
import { type CalibrationLabels, scoreCalibration, type CaseVerdicts } from './lib/calibration-score.ts';
import {
  actualCostUsd,
  BLIND_PROMPT,
  type BlindResult,
  blindComparison,
  buildBlindRequest,
  buildQualityRequest,
  clipVerdict,
  estimateJob,
  fetchTransport,
  type GeminiRequest,
  type GeminiTransport,
  type JobOutcome,
  MAX_OUTPUT_TOKENS,
  MODEL,
  parseBlind,
  parseQuality,
  priceFor,
  type Pricing,
  PROMPT_VERSION,
  qualityPrompt,
  type QualityResult,
  responseText,
} from './lib/gemini.ts';
import { canonicalJson, sha256File, sha256Hex } from './lib/hash.ts';
import { type MediaEntry, readIndex } from './lib/media-index.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface Deps {
  /** Only read after an explicit owner-approval flag (tests pass a recording proxy). */
  readonly env: Record<string, string | undefined>;
  readonly transport: GeminiTransport;
  readonly now: () => Date;
  readonly log: (line: string) => void;
}

type Job = 'blind' | 'quality';

interface PlannedClip {
  readonly entry: MediaEntry;
  readonly path: string;
  readonly jobs: Array<{ job: Job; prompt: string; maxOutputTokens: number; upperBoundUsd: number; inputTokens: number }>;
}

function loadPricing(path: string): Pricing {
  return JSON.parse(readFileSync(path, 'utf8')) as Pricing;
}

function plan(entries: readonly MediaEntry[], indexPath: string, jobs: readonly Job[], pricing: Pricing, now: Date): PlannedClip[] {
  const price = priceFor(pricing, now);
  const mediaDir = dirname(resolve(indexPath));
  return entries.map((entry) => {
    const duration = entry.durationMs ?? 60_000;
    const planned = jobs.map((job) => {
      const prompt = job === 'blind' ? BLIND_PROMPT : qualityPrompt({ transcript: entry.transcript, claimedVariety: entry.variety });
      const maxOutputTokens = job === 'blind' ? MAX_OUTPUT_TOKENS.blind : MAX_OUTPUT_TOKENS.quality;
      const est = estimateJob(duration, prompt, maxOutputTokens, price);
      return { job, prompt, maxOutputTokens, upperBoundUsd: est.upperBoundUsd, inputTokens: est.inputTokens };
    });
    return { entry, path: join(mediaDir, entry.file), jobs: planned };
  });
}

function totalUsd(clips: readonly PlannedClip[]): number {
  return clips.reduce((sum, c) => sum + c.jobs.reduce((s, j) => s + j.upperBoundUsd, 0), 0);
}

const usd = (x: number) => `$${x.toFixed(4)}`;

/** Hash of the request with the audio payload replaced by its sha256 (receipts stay small). */
function requestSha256(request: GeminiRequest, audioSha256: string): string {
  const redacted = {
    ...request,
    contents: request.contents.map((c) => ({
      ...c,
      parts: c.parts.map((p) => (p.inline_data ? { inline_data: { mime_type: p.inline_data.mime_type, sha256: audioSha256 } } : p)),
    })),
  };
  return sha256Hex(canonicalJson(redacted));
}

function printEstimate(clips: readonly PlannedClip[], log: Deps['log'], pricingNote: string): void {
  for (const c of clips) {
    log(`  ${c.entry.clipId} × ${c.entry.voice}: ${c.jobs.map((j) => `${j.job} ≤${usd(j.upperBoundUsd)} (${j.inputTokens} in, ≤${j.maxOutputTokens} out)`).join(', ')}`);
  }
  log(`upper-bound estimate for ${clips.length} file(s): ${usd(totalUsd(clips))} (${pricingNote})`);
}

export async function runCommand(argv: readonly string[], deps: Deps): Promise<number> {
  const args = parseArgs(argv);
  const command = args.positionals[0];
  const now = deps.now();
  if (command === 'score') return scoreCommand(args.values, deps);
  if (command !== 'estimate' && command !== 'run') {
    deps.log('usage: qa-gemini.ts estimate|run|score [options] (see file header)');
    return 64;
  }
  const indexPath = one(args, 'index') ?? join(ROOT, 'work', 'media', 'index.json');
  const pricingPath = one(args, 'pricing') ?? join(ROOT, 'tools', 'audio', 'gemini-pricing.json');
  const pricing = loadPricing(pricingPath);
  const jobs = (many(args, 'jobs').length > 0 ? many(args, 'jobs') : ['blind', 'quality']) as Job[];
  for (const j of jobs) if (j !== 'blind' && j !== 'quality') throw new Error(`unknown job ${j}`);
  const index = readIndex(indexPath, now);
  const limit = one(args, 'limit');
  const entries = limit === undefined ? index.entries : index.entries.slice(0, Math.max(0, Number(limit)));
  const clips = plan(entries, indexPath, jobs, pricing, now);
  const price = priceFor(pricing, now);
  const pricingNote = `${pricing.model} input $${price.inputUsdPerMTok}/MTok, output $${price.outputUsdPerMTok}/MTok, audio ${32} tokens/s; verify prices before spend`;
  printEstimate(clips, deps.log, pricingNote);
  if (command === 'estimate') return 0;

  const approval = one(args, 'i-have-owner-approval');
  if (approval === undefined) {
    deps.log('REFUSED: Gemini audio QA spend is not authorized. After the owner approves a cap, re-run with --i-have-owner-approval <cap-usd>. GEMINI_API_KEY was not read.');
    return 2;
  }
  const cap = Number(approval);
  if (!Number.isFinite(cap) || cap <= 0) {
    deps.log(`REFUSED: invalid cap ${JSON.stringify(approval)}; give a positive USD amount.`);
    return 2;
  }
  const estimate = totalUsd(clips);
  if (estimate > cap) {
    deps.log(`REFUSED: upper-bound estimate ${usd(estimate)} exceeds the approved cap ${usd(cap)}; use --limit or obtain a larger approval.`);
    return 3;
  }
  const apiKey = deps.env.GEMINI_API_KEY;
  if (!apiKey) {
    deps.log('REFUSED: GEMINI_API_KEY is not set in the environment.');
    return 4;
  }

  let spent = 0;
  let stoppedAtCap = false;
  const results: Array<Record<string, unknown>> = [];
  for (const clip of clips) {
    const outcomes: { blind: JobOutcome<BlindResult>; quality: JobOutcome<QualityResult> } = {
      blind: { status: 'not-run' },
      quality: { status: 'not-run' },
    };
    const receipts: Record<string, unknown> = {};
    let audioSha: string | null = null;
    let base64: string | null = null;
    if (!existsSync(clip.path)) {
      outcomes.blind = { status: 'error', error: 'file missing' };
      outcomes.quality = { status: 'error', error: 'file missing' };
    } else {
      audioSha = sha256File(clip.path);
      if (audioSha !== clip.entry.sha256) {
        outcomes.blind = { status: 'error', error: 'file hash differs from index' };
        outcomes.quality = { status: 'error', error: 'file hash differs from index' };
      } else {
        base64 = readFileSync(clip.path).toString('base64');
      }
    }
    for (const planned of clip.jobs) {
      if (base64 === null || audioSha === null) break;
      if (stoppedAtCap || spent + planned.upperBoundUsd > cap) {
        stoppedAtCap = true;
        receipts[planned.job] = { status: 'not-run', reason: 'cap' };
        continue;
      }
      const request =
        planned.job === 'blind'
          ? buildBlindRequest(base64)
          : buildQualityRequest(base64, { transcript: clip.entry.transcript, claimedVariety: clip.entry.variety });
      const receipt: Record<string, unknown> = { requestSha256: requestSha256(request, audioSha), startedAt: deps.now().toISOString() };
      try {
        const response = await deps.transport.generateContent(MODEL, request, apiKey);
        const cost = actualCostUsd(response.usageMetadata, price, planned.upperBoundUsd);
        spent += cost;
        const text = responseText(response);
        Object.assign(receipt, { modelVersion: response.modelVersion ?? null, usage: response.usageMetadata ?? null, costUsd: cost, responseText: text });
        try {
          if (planned.job === 'blind') outcomes.blind = { status: 'ok', result: parseBlind(text) };
          else outcomes.quality = { status: 'ok', result: parseQuality(text) };
        } catch (error) {
          const outcome = { status: 'error' as const, error: `unparseable response: ${(error as Error).message}` };
          if (planned.job === 'blind') outcomes.blind = outcome;
          else outcomes.quality = outcome;
        }
      } catch (error) {
        spent += planned.upperBoundUsd;
        Object.assign(receipt, { costUsd: planned.upperBoundUsd, costNote: 'charged at the upper bound because the call failed' });
        const outcome = { status: 'error' as const, error: (error as Error).message };
        if (planned.job === 'blind') outcomes.blind = outcome;
        else outcomes.quality = outcome;
      }
      receipts[planned.job] = receipt;
    }
    const comparison = blindComparison(clip.entry.transcript, outcomes.blind);
    const verdict = clipVerdict(comparison, outcomes.blind, outcomes.quality);
    results.push({
      clipId: clip.entry.clipId,
      voice: clip.entry.voice,
      fileSha256: clip.entry.sha256,
      transcriptSha256: clip.entry.transcriptSha256,
      blind: { ...outcomes.blind, receipt: receipts.blind ?? null },
      comparison,
      quality: { ...outcomes.quality, receipt: receipts.quality ?? null },
      verdict: verdict.verdict,
      reasons: verdict.reasons,
    });
    deps.log(`${verdict.verdict.padEnd(21)} ${clip.entry.clipId} × ${clip.entry.voice}${verdict.reasons.length ? ` — ${verdict.reasons.slice(0, 3).join(' | ')}` : ''}`);
  }

  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const out = one(args, 'out') ?? join(ROOT, 'content', 'reviews', 'audio', `gemini-${date}.json`);
  const doc = {
    schemaVersion: 1,
    kind: 'sll-audio-gemini-qa',
    generatedAt: deps.now().toISOString(),
    disclaimer:
      'Model assessment of actual audio files, not human-native certification. A blind transcription detects mismatches; it does not prove pronunciation or naturalness. Audio QA adds to, and never replaces, the text cross-provider review.',
    model: MODEL,
    promptVersion: PROMPT_VERSION,
    prompts: { blind: BLIND_PROMPT, qualityTemplate: qualityPrompt({ transcript: '<reviewed transcript>', claimedVariety: '<variety>' }) },
    pricing: { file: pricingPath.startsWith(`${ROOT}/`) ? pricingPath.slice(ROOT.length + 1) : pricingPath, period: price },
    capUsd: cap,
    estimateUsd: estimate,
    spentUsd: spent,
    stoppedAtCap,
    index: { path: indexPath.startsWith(`${ROOT}/`) ? indexPath.slice(ROOT.length + 1) : indexPath, sha256: sha256File(indexPath) },
    clips: results,
  };
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(resolve(out), `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  deps.log(`spent ${usd(spent)} of cap ${usd(cap)}${stoppedAtCap ? ' — STOPPED at the cap; remaining jobs not run' : ''}; results ${out}`);
  return stoppedAtCap ? 5 : 0;
}

function scoreCommand(values: Map<string, string[]>, deps: Deps): number {
  const get = (k: string) => values.get(k)?.at(-1);
  const labelsPath = get('labels');
  const geminiPath = get('gemini');
  if (!labelsPath || !geminiPath) {
    deps.log('usage: qa-gemini.ts score --labels <labels.json> --gemini <results.json> [--technical <technical.json>] [--out <score.json>]');
    return 64;
  }
  const labels = JSON.parse(readFileSync(labelsPath, 'utf8')) as CalibrationLabels;
  const gemini = JSON.parse(readFileSync(geminiPath, 'utf8')) as { clips: Array<{ clipId: string; verdict: CaseVerdicts['gemini'] }> };
  const technicalPath = get('technical');
  const technical = technicalPath
    ? (JSON.parse(readFileSync(technicalPath, 'utf8')) as { files: Array<{ clipId: string; status: 'pass' | 'warn' | 'fail' }> })
    : null;
  const verdicts = new Map<string, CaseVerdicts>();
  for (const c of gemini.clips) verdicts.set(c.clipId, { gemini: c.verdict, technical: null });
  for (const f of technical?.files ?? []) {
    const v = verdicts.get(f.clipId) ?? { gemini: null, technical: null };
    verdicts.set(f.clipId, { ...v, technical: f.status });
  }
  const score = scoreCalibration(labels, verdicts);
  for (const row of score.rows) deps.log(`${row.outcome.padEnd(22)} ${row.caseId} ${row.class}${row.defectType ? `/${row.defectType}` : ''} -> ${row.finalVerdict}`);
  deps.log(JSON.stringify(score.summary));
  const out = get('out');
  if (out) writeFileSync(resolve(out), `${JSON.stringify(score, null, 2)}\n`, 'utf8');
  return score.summary.passed ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCommand(process.argv.slice(2), {
    env: process.env,
    transport: fetchTransport(),
    now: () => new Date(),
    log: (line) => console.log(line),
  })
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      console.error((error as Error).message);
      process.exit(1);
    });
}
