// Technical QA of generated audio files (NOT language QA).
//
//   node tools/audio/qa-technical.ts [--index work/media/index.json]
//        [--out content/reviews/audio/technical-<YYYY-MM-DD>.json] [--report-only]
//
// Per file: sha256 integrity against the index, playability (ffprobe full decode + ffmpeg PCM decode),
// format (mp3/44.1 kHz/mono/128 kbps), A1/A2 duration production bounds (warn), integrated loudness
// window and true-peak ceiling (ebur128 on the actual MP3), silence structure and clipping.
// Writes metadata only (no audio bytes, no transcripts). Exit 1 when any file fails, unless --report-only.
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzePcm, ANALYSIS, type PcmAnalysis } from './lib/analysis.ts';
import { one, parseArgs } from './lib/args.ts';
import { decodePcm, DELIVERY, FFMPEG, FFPROBE, measureEbur128, probe, type Ebur128Summary, type ProbeResult, toolVersion } from './lib/ffmpeg.ts';
import { sha256File } from './lib/hash.ts';
import { readIndex } from './lib/media-index.ts';
import { evaluateTechnical, type Issue, THRESHOLDS, type TechnicalStatus } from './lib/qa-rules.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface TechnicalFileReport {
  readonly clipId: string;
  readonly voice: string;
  readonly lessonId: string;
  readonly file: string;
  readonly sha256: string;
  readonly bytes: number | null;
  readonly status: TechnicalStatus;
  readonly shortClip: boolean;
  readonly measurements: Record<string, number | string | null>;
  readonly issues: Issue[];
}

export interface TechnicalReport {
  readonly schemaVersion: 1;
  readonly kind: 'sll-audio-technical-qa';
  readonly scope: string;
  readonly generatedAt: string;
  readonly index: { readonly path: string; readonly sha256: string; readonly entries: number };
  readonly tools: Record<string, string>;
  readonly thresholds: typeof THRESHOLDS;
  readonly analysis: typeof ANALYSIS;
  readonly summary: { readonly pass: number; readonly warn: number; readonly fail: number };
  readonly files: TechnicalFileReport[];
}

/** Local calendar date YYYY-MM-DD (report file names follow the owner's day, not UTC). */
export function localDate(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function display(path: string): string {
  const abs = resolve(path);
  return abs.startsWith(`${ROOT}/`) ? abs.slice(ROOT.length + 1) : abs;
}

export async function checkFile(path: string): Promise<{
  actualSha256: string;
  bytes: number | null;
  probe: ProbeResult;
  loudness: Ebur128Summary | null;
  pcm: PcmAnalysis | null;
  decodeErrors: string[];
}> {
  if (!existsSync(path)) {
    const missing: ProbeResult = {
      ok: false, formatName: null, codec: null, sampleRate: null, channels: null, bitRate: null,
      durationMs: null, decodedFrames: null, errors: ['file missing'],
    };
    return { actualSha256: 'missing', bytes: null, probe: missing, loudness: null, pcm: null, decodeErrors: ['file missing'] };
  }
  const actualSha256 = sha256File(path);
  const info = await probe(path);
  let loudness: Ebur128Summary | null = null;
  try {
    loudness = await measureEbur128(path);
  } catch {
    loudness = null;
  }
  const decoded = await decodePcm(path, DELIVERY.sampleRate);
  const pcm = decoded.samples.length > 0 ? analyzePcm(decoded.samples, DELIVERY.sampleRate) : null;
  return { actualSha256, bytes: statSync(path).size, probe: info, loudness, pcm, decodeErrors: decoded.errors };
}

export async function runTechnicalQa(indexPath: string, scope: string, now: Date = new Date()): Promise<TechnicalReport> {
  const index = readIndex(indexPath, now);
  const mediaDir = dirname(resolve(indexPath));
  const files: TechnicalFileReport[] = [];
  for (const entry of index.entries) {
    const path = join(mediaDir, entry.file);
    const checked = await checkFile(path);
    const verdict = evaluateTechnical({
      expectedSha256: entry.sha256,
      actualSha256: checked.actualSha256,
      lessonId: entry.lessonId,
      probe: checked.probe,
      loudness: checked.loudness,
      pcm: checked.pcm,
      decodeErrors: checked.decodeErrors,
    });
    const p = checked.pcm;
    files.push({
      clipId: entry.clipId,
      voice: entry.voice,
      lessonId: entry.lessonId,
      file: entry.file,
      sha256: entry.sha256,
      bytes: checked.bytes,
      status: verdict.status,
      shortClip: verdict.shortClip,
      measurements: {
        playable: checked.probe.ok ? 'yes' : 'no',
        format: checked.probe.formatName,
        codec: checked.probe.codec,
        sampleRate: checked.probe.sampleRate,
        channels: checked.probe.channels,
        bitRate: checked.probe.bitRate,
        durationMs: checked.probe.durationMs,
        decodedFrames: checked.probe.decodedFrames,
        integratedLufs: checked.loudness?.integratedLufs ?? null,
        lraLu: checked.loudness?.lraLu ?? null,
        truePeakDbtp: checked.loudness?.truePeakDbtp ?? null,
        samplePeakDbfs: p?.samplePeakDbfs ?? null,
        nearFullScaleSamples: p?.nearFullScaleSamples ?? null,
        longestNearFullScaleRun: p?.longestNearFullScaleRun ?? null,
        leadingSilenceMs: p?.leadingSilenceMs ?? null,
        trailingSilenceMs: p?.trailingSilenceMs ?? null,
        longestInternalSilenceMs: p?.longestInternalSilenceMs ?? null,
        silenceRatio: p?.silenceRatio ?? null,
        headRmsDbfs: p?.headRmsDbfs ?? null,
        tailRmsDbfs: p?.tailRmsDbfs ?? null,
      },
      issues: verdict.issues,
    });
  }
  const count = (s: TechnicalStatus) => files.filter((f) => f.status === s).length;
  return {
    schemaVersion: 1,
    kind: 'sll-audio-technical-qa',
    scope,
    generatedAt: now.toISOString(),
    index: { path: display(indexPath), sha256: sha256File(indexPath), entries: index.entries.length },
    tools: { ffmpeg: await toolVersion(FFMPEG), ffprobe: await toolVersion(FFPROBE), node: process.version },
    thresholds: THRESHOLDS,
    analysis: ANALYSIS,
    summary: { pass: count('pass'), warn: count('warn'), fail: count('fail') },
    files,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2), ['report-only']);
  const now = new Date();
  const indexPath = one(args, 'index') ?? join(ROOT, 'work', 'media', 'index.json');
  const out = one(args, 'out') ?? join(ROOT, 'content', 'reviews', 'audio', `technical-${localDate(now)}.json`);
  const scope =
    one(args, 'scope') ??
    'Technical QA only (format, integrity, playability, loudness, peak, silence, clipping). NOT language QA: no judgment of words, stress, accent or naturalness.';
  const report = await runTechnicalQa(indexPath, scope, now);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(resolve(out), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  for (const f of report.files) {
    const issues = f.issues.map((i) => `${i.severity}:${i.code}`).join(', ');
    console.log(`${f.status.padEnd(4)} ${f.clipId} × ${f.voice} ${f.measurements.durationMs ?? '?'} ms ${f.measurements.integratedLufs ?? 'n/a'} LUFS ${f.measurements.truePeakDbtp ?? 'n/a'} dBTP${issues ? ` [${issues}]` : ''}`);
  }
  console.log(`pass ${report.summary.pass}, warn ${report.summary.warn}, fail ${report.summary.fail}; report ${display(out)}`);
  if (report.summary.fail > 0 && !args.switches.has('report-only')) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error((error as Error).message);
    process.exit(1);
  });
}
