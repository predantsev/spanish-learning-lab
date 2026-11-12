// Builds the 20-file audio calibration set (8 controls, 8 seeded defects, 4 uncertain) — ready for the
// Gemini QA run once the owner approves the spend. Deterministic (macOS say + seeded ffmpeg noise).
//
//   node tools/audio/calibration.ts [--out work/media/calibration] [--labels-out <file outside the repo>]
//
// <out>/index.json uses the media-index format with voice/engine details withheld; the hidden labels
// (class, defect, TTS input, processing, measured technical status) go to --labels-out, default
// $TMPDIR/sll-audio-calibration/labels.json, i.e. outside the repository that reviewers could read.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { one, parseArgs } from './lib/args.ts';
import { assignCaseIds, CALIBRATION_CASES, CALIBRATION_SEED, type CaseSpec } from './lib/calibration-plan.ts';
import { runChecked } from './lib/exec.ts';
import { encodeRawArgs, FFMPEG, measureEbur128, probe, toolVersion } from './lib/ffmpeg.ts';
import { sha256File, transcriptSha256 } from './lib/hash.ts';
import { emptyIndex, type MediaEntry, writeIndex } from './lib/media-index.ts';
import { keepOriginal, normalizeToMp3, storeByHash } from './lib/produce.ts';
import { macosVersion, synthesizeOriginal, voiceById } from './lib/voices.ts';
import { runTechnicalQa } from './qa-technical.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

interface Built {
  readonly caseId: string;
  readonly spec: CaseSpec;
  readonly entry: MediaEntry;
  readonly commands: string[][];
}

async function prepareOriginal(spec: CaseSpec, tmp: string): Promise<{ path: string; extension: string; commands: string[][] }> {
  const voice = voiceById(spec.voice);
  const m = spec.manipulation;
  const synth = await synthesizeOriginal(
    { voice, text: spec.ttsText, outBase: join(tmp, 'original'), ...(m.kind === 'fast' ? { sayWordsPerMinute: m.wordsPerMinute } : {}) },
    { root: ROOT },
  );
  const commands = [synth.command];
  if (m.kind === 'truncate') {
    const info = await probe(synth.path);
    const seconds = ((info.durationMs ?? 0) / 1000) * m.fraction;
    const out = join(tmp, 'truncated.wav');
    const args = ['-hide_banner', '-nostats', '-y', '-i', synth.path, '-t', seconds.toFixed(3), '-c:a', 'pcm_s16le', out];
    await runChecked(FFMPEG, args);
    commands.push(['ffmpeg', ...args.map((a) => (a === synth.path ? '<original>' : a === out ? '<truncated.wav>' : a))]);
    return { path: out, extension: 'wav', commands };
  }
  if (m.kind === 'noise') {
    const out = join(tmp, 'noisy.wav');
    const args = [
      '-hide_banner', '-nostats', '-y', '-i', synth.path,
      '-f', 'lavfi', '-i', `anoisesrc=color=pink:amplitude=${m.amplitude}:seed=${m.seed}:sample_rate=22050`,
      '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first:normalize=0[mix]', '-map', '[mix]',
      '-c:a', 'pcm_s16le', out,
    ];
    await runChecked(FFMPEG, args);
    commands.push(['ffmpeg', ...args.map((a) => (a === synth.path ? '<original>' : a === out ? '<noisy.wav>' : a))]);
    return { path: out, extension: 'wav', commands };
  }
  return { path: synth.path, extension: synth.extension, commands };
}

async function buildCase(caseId: string, spec: CaseSpec, mediaDir: string, labelsDir: string, now: Date): Promise<Built> {
  const tmp = mkdtempSync(join(mediaDir, '.tmp-'));
  try {
    const prepared = await prepareOriginal(spec, tmp);
    const commands = [...prepared.commands];
    const m = spec.manipulation;
    let file: string;
    let sha256: string;
    let bytes: number;
    let durationMs: number | null;
    let loudness: { integratedLufs: number | null; lraLu: number | null; truePeakDbtp: number | null };
    let normalizationType = 'linear';
    let warnings: string[] = [];
    // Originals are kept beside the hidden labels (outside the repository), not in the public media dir.
    const original = await keepOriginal(prepared.path, prepared.extension, labelsDir);
    if (m.kind === 'clip' || m.kind === 'telephone-low') {
      const filter = m.kind === 'clip' ? `volume=${m.gainDb}dB,aformat=sample_fmts=s16` : `highpass=f=300,lowpass=f=3400,volume=${m.gainDb}dB`;
      const tmpMp3 = join(tmp, 'out.mp3');
      const args = encodeRawArgs(prepared.path, tmpMp3, filter);
      await runChecked(FFMPEG, args);
      commands.push(['ffmpeg', ...encodeRawArgs('<input>', '<out.mp3>', filter)]);
      loudness = await measureEbur128(tmpMp3);
      const info = await probe(tmpMp3);
      const stored = storeByHash(tmpMp3, mediaDir);
      ({ file, sha256, bytes } = stored);
      durationMs = info.durationMs;
      normalizationType = 'none (deliberately not normalized)';
    } else {
      const produced = await normalizeToMp3(prepared.path, prepared.extension, mediaDir, tmp, labelsDir);
      ({ file, sha256, bytes, durationMs } = produced);
      loudness = produced.loudness;
      normalizationType = produced.measurement.normalizationType;
      warnings = produced.warnings;
      commands.push(...produced.commands);
    }
    const info = await probe(join(mediaDir, file));
    const entry: MediaEntry = {
      clipId: caseId,
      lessonId: spec.claimedLessonId,
      kind: 'sentence',
      transcript: spec.claimedTranscript,
      transcriptSha256: transcriptSha256(spec.claimedTranscript),
      voice: 'undisclosed',
      voiceLabel: 'undisclosed (calibration)',
      engine: 'undisclosed',
      voiceVersion: { os: await macosVersion(), engineVersion: 'undisclosed', voiceAssetVersion: 'undisclosed' },
      variety: spec.claimedVariety,
      synthetic: true,
      settings: { calibration: true, seed: CALIBRATION_SEED },
      settingsSha256: 'calibration',
      cacheKey: 'calibration',
      rate: 1,
      file,
      sha256,
      bytes,
      durationMs,
      loudness: loudness.integratedLufs,
      peak: loudness.truePeakDbtp,
      measurement: {
        integratedLufs: loudness.integratedLufs,
        lraLu: loudness.lraLu,
        truePeakDbtp: loudness.truePeakDbtp,
        codec: info.codec,
        sampleRate: info.sampleRate,
        channels: info.channels,
        bitRate: info.bitRate,
        normalizationType: 'undisclosed',
        loudnormTruePeakTarget: -1.5,
        shortClip: (durationMs ?? 0) < 3000,
      },
      original: { file: 'withheld', sha256: 'withheld', bytes: 0, codec: null, sampleRate: null, channels: null, durationMs: null },
      commands: [],
      tools: {},
      generatedAt: now.toISOString(),
      rightsRecordId: 'rights.macos-system-voices.tahoe-26',
      reviewState: 'unreviewed',
      warnings: [],
      calibration: true,
    };
    return { caseId, spec, entry, commands: [...commands, ['# original', original.file, original.sha256], ['# normalization', normalizationType, ...warnings]] };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const mediaDir = resolve(one(args, 'out') ?? join(ROOT, 'work', 'media', 'calibration'));
  const labelsPath = resolve(one(args, 'labels-out') ?? join(tmpdir(), 'sll-audio-calibration', 'labels.json'));
  if (labelsPath.startsWith(`${ROOT}/`)) throw new Error('--labels-out must be outside the repository (reviewers can read the repository)');
  const labelsDir = dirname(labelsPath);
  mkdirSync(mediaDir, { recursive: true });
  mkdirSync(labelsDir, { recursive: true });

  const index = emptyIndex(now);
  const built: Built[] = [];
  for (const { caseId, spec } of assignCaseIds(CALIBRATION_CASES)) {
    const b = await buildCase(caseId, spec, mediaDir, labelsDir, now);
    built.push(b);
    index.entries.push(b.entry);
    console.log(`${caseId} ${b.entry.durationMs ?? '?'} ms ${b.entry.loudness ?? 'n/a'} LUFS ${b.entry.peak ?? 'n/a'} dBTP`);
  }
  const indexPath = join(mediaDir, 'index.json');
  writeIndex(indexPath, index);

  const technicalPath = join(labelsDir, 'technical.json');
  const technical = await runTechnicalQa(indexPath, 'Calibration set technical QA (kept with the hidden labels).', now);
  writeFileSync(technicalPath, `${JSON.stringify(technical, null, 2)}\n`, 'utf8');

  const labels = {
    schemaVersion: 1,
    kind: 'sll-audio-calibration-labels',
    generatedAt: now.toISOString(),
    seed: CALIBRATION_SEED,
    tools: { os: await macosVersion(), ffmpeg: await toolVersion(FFMPEG) },
    index: { path: indexPath, sha256: sha256File(indexPath) },
    note:
      'HIDDEN LABELS: keep outside the repository until every reviewer run is finished. Labels are constructed facts ' +
      '(engine input and processing). No phonetic judgment was confirmed by listening (phoneticJudgmentConfirmed=false).',
    counts: {
      valid: built.filter((b) => b.spec.class === 'valid').length,
      defect: built.filter((b) => b.spec.class === 'defect').length,
      uncertain: built.filter((b) => b.spec.class === 'uncertain').length,
    },
    cases: built.map((b) => {
      const t = technical.files.find((f) => f.clipId === b.caseId);
      return {
        caseId: b.caseId,
        key: b.spec.key,
        class: b.spec.class,
        type: b.spec.type,
        expected: b.spec.expected,
        voice: b.spec.voice,
        ttsText: b.spec.ttsText,
        claimedTranscript: b.spec.claimedTranscript,
        claimedVariety: b.spec.claimedVariety,
        manipulation: b.spec.manipulation,
        file: b.entry.file,
        sha256: b.entry.sha256,
        labelEvidence: b.spec.labelEvidence,
        phoneticJudgmentConfirmed: false,
        measured: { technicalStatus: t?.status ?? null, technicalIssues: t?.issues.map((i) => `${i.severity}:${i.code}`) ?? [] },
        commands: b.commands,
      };
    }),
  };
  writeFileSync(labelsPath, `${JSON.stringify(labels, null, 2)}\n`, 'utf8');
  console.log(`calibration set: ${built.length} files in ${mediaDir}; labels (hidden) ${labelsPath}; technical ${technicalPath}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error((error as Error).message);
    process.exit(1);
  });
}
