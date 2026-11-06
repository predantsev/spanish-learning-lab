// Audio production pipeline: Clip scripts -> work/media/<sha256>.mp3 + work/media/index.json.
//
//   node tools/audio/synthesize.ts [--input <file|dir>]… [--voice <id>]… [--media-dir work/media]
//        [--force] [--metadata-out content/reviews/audio/<name>.json]
//
// Input defaults to content/source/audio (ClipFile, content/schemas/content.schema.json). Each clip is
// synthesized locally (macOS `say` or the project-local Piper venv; no network), the original is kept in
// <media-dir>/originals/, and the delivery MP3 is produced by two-pass loudnorm. Re-runs skip a
// clip × voice whose transcript hash and settings are unchanged and whose stored file still matches.
// Audio bytes and index.json live under work/ (gitignored); --metadata-out writes a byte-free copy.
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { many, one, parseArgs } from './lib/args.ts';
import { loadClips, type LoadedClip } from './lib/clips.ts';
import { captureEnvironment } from './lib/environment.ts';
import { DELIVERY, FFMPEG, toolVersion } from './lib/ffmpeg.ts';
import { canonicalJson, sha256File, sha256Hex, transcriptSha256 } from './lib/hash.ts';
import { type MediaEntry, type MediaIndex, readIndex, upsertEntry, writeIndex } from './lib/media-index.ts';
import { normalizeToMp3 } from './lib/produce.ts';
import { type EngineContext, engineInfo, synthesizeOriginal, voiceById, type VoicePreset } from './lib/voices.ts';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PIPELINE_VERSION = 1;

/** Repository-relative path when inside the repository, absolute otherwise. */
export function display(path: string): string {
  const rel = relative(ROOT, resolve(path));
  return rel.startsWith('..') ? resolve(path) : rel;
}

export interface SynthesizeOptions {
  readonly inputs: readonly string[];
  readonly voices: readonly string[];
  readonly mediaDir: string;
  readonly force?: boolean;
  readonly schemaPath?: string;
  readonly engine?: EngineContext;
  readonly now?: () => Date;
  readonly log?: (line: string) => void;
}

export interface SynthesizeSummary {
  readonly generated: string[];
  readonly skipped: string[];
  readonly indexPath: string;
  readonly index: MediaIndex;
}

export function settingsFor(voice: VoicePreset, engineVersion: string, voiceIdentifier: string | undefined, piper?: { version: string; modelSha256: string; configSha256: string }): Record<string, unknown> {
  return {
    pipelineVersion: PIPELINE_VERSION,
    voice: voice.id,
    engine: voice.engine,
    voiceName: voice.sayVoice ?? voice.piperModelFile ?? voice.id,
    voiceIdentifier: voiceIdentifier ?? null,
    engineVersion,
    piper: piper ?? null,
    rate: 1,
    rateDefinition: voice.engine === 'macos-say' ? 'no -r flag: the voice default speed' : 'model config length_scale (1)',
    loudnorm: {
      twoPass: true,
      linear: true,
      integratedLufs: DELIVERY.integratedLufs,
      truePeakTargetDbtp: DELIVERY.loudnormTruePeakDbtp,
      truePeakCeilingDbtp: DELIVERY.truePeakCeilingDbtp,
      lra: DELIVERY.loudnormLra,
    },
    output: {
      codec: DELIVERY.codec,
      encoder: DELIVERY.encoder,
      bitrateKbps: DELIVERY.bitrateKbps,
      sampleRate: DELIVERY.sampleRate,
      channels: DELIVERY.channels,
      metadata: 'stripped (no ID3), bitexact',
    },
  };
}

function isUnchanged(index: MediaIndex, clipId: string, voice: string, cacheKey: string, mediaDir: string): MediaEntry | null {
  const entry = index.entries.find((e) => e.clipId === clipId && e.voice === voice);
  if (!entry || entry.cacheKey !== cacheKey) return null;
  const path = join(mediaDir, entry.file);
  if (!existsSync(path)) return null;
  return sha256File(path) === entry.sha256 ? entry : null;
}

export async function synthesizeClips(options: SynthesizeOptions): Promise<SynthesizeSummary> {
  const now = options.now ?? (() => new Date());
  const log = options.log ?? ((line: string) => console.log(line));
  const ctx: EngineContext = options.engine ?? { root: ROOT };
  const mediaDir = resolve(options.mediaDir);
  mkdirSync(mediaDir, { recursive: true });
  const indexPath = join(mediaDir, 'index.json');
  const index = readIndex(indexPath, now());
  const clips: LoadedClip[] = loadClips(options.inputs, options.schemaPath ?? join(ROOT, 'content', 'schemas', 'content.schema.json'));
  const voices = options.voices.map(voiceById);
  const ffmpegVersion = await toolVersion(FFMPEG);
  const generated: string[] = [];
  const skipped: string[] = [];

  for (const voice of voices) {
    const info = await engineInfo(voice, ctx);
    const settings = settingsFor(voice, info.engineVersion, info.voiceIdentifier, info.piper);
    const settingsSha256 = sha256Hex(canonicalJson(settings));
    for (const { clip } of clips) {
      const tHash = transcriptSha256(clip.transcript);
      const cacheKey = sha256Hex(canonicalJson({ transcriptSha256: tHash, settings }));
      const label = `${clip.id} × ${voice.id}`;
      if (!options.force) {
        const existing = isUnchanged(index, clip.id, voice.id, cacheKey, mediaDir);
        if (existing) {
          skipped.push(label);
          log(`skip ${label} (unchanged, ${existing.file})`);
          continue;
        }
      }
      const tmp = mkdtempSync(join(mediaDir, '.tmp-'));
      try {
        const original = await synthesizeOriginal({ voice, text: clip.transcript, outBase: join(tmp, 'original') }, ctx);
        const produced = await normalizeToMp3(original.path, original.extension, mediaDir, tmp);
        const entry: MediaEntry = {
          clipId: clip.id,
          lessonId: clip.lessonId,
          kind: clip.kind,
          transcript: clip.transcript.normalize('NFC'),
          transcriptSha256: tHash,
          voice: voice.id,
          voiceLabel: voice.label,
          engine: voice.engine,
          voiceVersion: {
            os: info.os,
            engineVersion: info.engineVersion,
            ...(info.voiceIdentifier ? { voiceIdentifier: info.voiceIdentifier } : {}),
            voiceAssetVersion: info.voiceAssetVersion,
          },
          variety: voice.locale,
          synthetic: true,
          settings,
          settingsSha256,
          cacheKey,
          rate: 1,
          file: produced.file,
          sha256: produced.sha256,
          bytes: produced.bytes,
          durationMs: produced.durationMs,
          loudness: produced.loudness.integratedLufs,
          peak: produced.loudness.truePeakDbtp,
          measurement: produced.measurement,
          original: produced.original,
          commands: [original.command, ...produced.commands],
          tools: { ffmpeg: ffmpegVersion, engine: info.engineVersion },
          generatedAt: now().toISOString(),
          rightsRecordId: voice.rightsRecordId,
          reviewState: 'unreviewed',
          warnings: produced.warnings,
        };
        upsertEntry(index, entry);
        index.updatedAt = now().toISOString();
        writeIndex(indexPath, index);
        generated.push(label);
        log(
          `made ${label} -> ${produced.file} ${produced.durationMs ?? '?'} ms, ` +
            `${produced.loudness.integratedLufs ?? 'n/a'} LUFS, ${produced.loudness.truePeakDbtp ?? 'n/a'} dBTP` +
            (produced.warnings.length ? ` [${produced.warnings.join('; ')}]` : ''),
        );
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
  }
  return { generated, skipped, indexPath, index };
}

/** Byte-free metadata copy for Git: environment + every index entry (relative file names only). */
export async function writeMetadata(path: string, summary: SynthesizeSummary, ctx: EngineContext, now: Date): Promise<void> {
  const doc = {
    schemaVersion: 1,
    kind: 'sll-audio-generation-metadata',
    generatedAt: now.toISOString(),
    note:
      'Metadata only: no audio bytes. Files live in the private media store (work/media, gitignored). ' +
      'Synthetic speech, unreviewed; rights UNCONFIRMED (content/reviews/audio/rights.json). No language QA was performed.',
    index: { path: display(summary.indexPath), sha256: sha256File(summary.indexPath) },
    environment: await captureEnvironment(ctx),
    entries: summary.index.entries,
  };
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2), ['force']);
  const inputs = many(args, 'input');
  const voices = many(args, 'voice');
  const options: SynthesizeOptions = {
    inputs: inputs.length > 0 ? inputs : [join(ROOT, 'content', 'source', 'audio')],
    voices: voices.length > 0 ? voices : ['macos.monica'],
    mediaDir: one(args, 'media-dir') ?? join(ROOT, 'work', 'media'),
    force: args.switches.has('force'),
  };
  const summary = await synthesizeClips(options);
  console.log(`generated ${summary.generated.length}, skipped ${summary.skipped.length}; index ${display(summary.indexPath)}`);
  const metadataOut = one(args, 'metadata-out');
  if (metadataOut) {
    await writeMetadata(metadataOut, summary, { root: ROOT }, new Date());
    console.log(`metadata -> ${metadataOut}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error((error as Error).message);
    process.exit(1);
  });
}
