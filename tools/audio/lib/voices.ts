// Local Spain-Spanish TTS candidates and their synthesis engines (macOS `say`, Piper).
// No network, no paid service. Piper runs only from the project-local venv under work/tools/.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runChecked } from './exec.ts';
import { sha256File } from './hash.ts';

export type Engine = 'macos-say' | 'piper';

export interface VoicePreset {
  readonly id: string;
  readonly engine: Engine;
  readonly label: string;
  /** BCP 47 locale the voice is published for (not a verified accent judgment). */
  readonly locale: string;
  readonly sayVoice?: string;
  /** Identifier reported by NSSpeechSynthesizer.availableVoices on this Mac. */
  readonly voiceIdentifier?: string;
  readonly piperModelFile?: string;
  /** Eloquence novelty-class voice (kept only as a contrast). */
  readonly noveltyClass?: boolean;
  /** Candidate in the benchmark sweep (false: calibration-only helper voice). */
  readonly candidate: boolean;
  readonly rightsRecordId: string;
}

export const VOICES: readonly VoicePreset[] = [
  {
    id: 'macos.monica',
    engine: 'macos-say',
    label: 'Mónica (macOS system voice, es_ES, compact)',
    locale: 'es-ES',
    sayVoice: 'Mónica',
    voiceIdentifier: 'com.apple.voice.compact.es-ES.Monica',
    candidate: true,
    rightsRecordId: 'rights.macos-system-voices.tahoe-26',
  },
  {
    id: 'macos.eddy',
    engine: 'macos-say',
    label: 'Eddy (macOS Eloquence voice, es_ES; novelty-class contrast)',
    locale: 'es-ES',
    sayVoice: 'Eddy (Spanish (Spain))',
    voiceIdentifier: 'com.apple.eloquence.es-ES.Eddy',
    noveltyClass: true,
    candidate: true,
    rightsRecordId: 'rights.macos-system-voices.tahoe-26',
  },
  {
    id: 'piper.davefx-medium',
    engine: 'piper',
    label: 'Piper es_ES-davefx-medium (piper-tts 1.8.0, local ONNX)',
    locale: 'es-ES',
    piperModelFile: 'es_ES-davefx-medium.onnx',
    candidate: true,
    rightsRecordId: 'rights.piper-davefx-medium',
  },
  {
    id: 'macos.paulina',
    engine: 'macos-say',
    label: 'Paulina (macOS system voice, es_MX) — calibration accent-claim defect only',
    locale: 'es-MX',
    sayVoice: 'Paulina',
    voiceIdentifier: 'com.apple.voice.compact.es-MX.Paulina',
    candidate: false,
    rightsRecordId: 'rights.macos-system-voices.tahoe-26',
  },
];

export function voiceById(id: string): VoicePreset {
  const v = VOICES.find((x) => x.id === id);
  if (!v) throw new Error(`unknown voice ${id}; known: ${VOICES.map((x) => x.id).join(', ')}`);
  return v;
}

export interface EngineContext {
  /** Repository root (tools resolve work/tools/piper relative to it). */
  readonly root: string;
  /** Overrides for tests or a different Piper location. */
  readonly piperDir?: string;
}

export interface EngineInfo {
  readonly engine: Engine;
  /** "macOS 26.6.2 (25G83)" or "piper-tts 1.8.0". */
  readonly engineVersion: string;
  readonly os: string;
  readonly voiceIdentifier?: string;
  readonly voiceAssetVersion: string;
  readonly piper?: { readonly version: string; readonly modelSha256: string; readonly configSha256: string };
}

let osCache: string | null = null;

export async function macosVersion(): Promise<string> {
  if (osCache) return osCache;
  const name = (await runChecked('sw_vers', ['-productName'])).stdout.toString('utf8').trim();
  const version = (await runChecked('sw_vers', ['-productVersion'])).stdout.toString('utf8').trim();
  const build = (await runChecked('sw_vers', ['-buildVersion'])).stdout.toString('utf8').trim();
  osCache = `${name} ${version} (${build})`;
  return osCache;
}

export function piperDir(ctx: EngineContext): string {
  return ctx.piperDir ?? join(ctx.root, 'work', 'tools', 'piper');
}

/** Site-packages `piper` package dir inside the venv (cwd for the espeak relative-path workaround). */
export function piperPackageDir(ctx: EngineContext): string {
  const lib = join(piperDir(ctx), 'venv', 'lib');
  if (!existsSync(lib)) throw new Error(`Piper venv not found under ${piperDir(ctx)}; run node tools/audio/piper-setup.ts`);
  const py = readdirSync(lib).find((d) => /^python3\.\d+$/.test(d));
  if (!py) throw new Error(`no python3.x directory in ${lib}`);
  return join(lib, py, 'site-packages', 'piper');
}

function piperVersion(ctx: EngineContext): string {
  const site = resolve(piperPackageDir(ctx), '..');
  const dist = readdirSync(site).find((d) => /^piper_tts-.*\.dist-info$/.test(d));
  if (!dist) return 'unknown';
  const meta = readFileSync(join(site, dist, 'METADATA'), 'utf8');
  return /^Version:\s*(\S+)/m.exec(meta)?.[1] ?? 'unknown';
}

const piperHashCache = new Map<string, { modelSha256: string; configSha256: string }>();

export async function engineInfo(voice: VoicePreset, ctx: EngineContext): Promise<EngineInfo> {
  const os = await macosVersion();
  if (voice.engine === 'macos-say') {
    return {
      engine: voice.engine,
      engineVersion: os,
      os,
      voiceIdentifier: voice.voiceIdentifier,
      voiceAssetVersion:
        'unconfirmed (no per-voice version found; looked in /System/Library/AssetsV2/com_apple_MobileAsset_VoiceServices_CombinedVocalizerVoices/*/Info.plist and NSSpeechSynthesizer VoiceVersion, which is empty)',
    };
  }
  const model = join(piperDir(ctx), 'model', voice.piperModelFile ?? '');
  let hashes = piperHashCache.get(model);
  if (!hashes) {
    hashes = { modelSha256: sha256File(model), configSha256: sha256File(`${model}.json`) };
    piperHashCache.set(model, hashes);
  }
  const version = piperVersion(ctx);
  return {
    engine: voice.engine,
    engineVersion: `piper-tts ${version}`,
    os,
    voiceAssetVersion: `model sha256 ${hashes.modelSha256}`,
    piper: { version, ...hashes },
  };
}

export interface SynthesisRequest {
  readonly voice: VoicePreset;
  /** Text actually sent to the engine (normally the clip transcript). */
  readonly text: string;
  /** Output path without extension; the engine picks .aiff (say) or .wav (Piper). */
  readonly outBase: string;
  /** say words-per-minute; undefined = the voice's default speed ("rate 1"). Calibration only. */
  readonly sayWordsPerMinute?: number;
}

export interface SynthesisResult {
  readonly path: string;
  readonly extension: 'aiff' | 'wav';
  /** The command with temp paths replaced by placeholders, for the evidence record. */
  readonly command: string[];
}

/** Synthesizes the original (un-normalized) file. Text goes through a UTF-8 file, never argv. */
export async function synthesizeOriginal(req: SynthesisRequest, ctx: EngineContext): Promise<SynthesisResult> {
  const textFile = `${req.outBase}.txt`;
  writeFileSync(textFile, `${req.text.normalize('NFC')}\n`, 'utf8');
  if (req.voice.engine === 'macos-say') {
    if (!req.voice.sayVoice) throw new Error(`voice ${req.voice.id} has no say name`);
    const out = `${req.outBase}.aiff`;
    const rateArgs = req.sayWordsPerMinute ? ['-r', String(req.sayWordsPerMinute)] : [];
    const args = ['-v', req.voice.sayVoice, ...rateArgs, '-f', textFile, '-o', out];
    await runChecked('say', args);
    return { path: out, extension: 'aiff', command: ['say', '-v', req.voice.sayVoice, ...rateArgs, '-f', '<text.txt>', '-o', '<original.aiff>'] };
  }
  const pkg = piperPackageDir(ctx);
  const python = join(piperDir(ctx), 'venv', 'bin', 'python');
  const model = join(piperDir(ctx), 'model', req.voice.piperModelFile ?? '');
  const out = `${req.outBase}.wav`;
  const driver = join(ctx.root, 'tools', 'audio', 'piper_synth.py');
  // cwd = the piper package dir: espeak-ng's 160-byte data-path buffer truncates the absolute
  // path of this deep worktree, so the driver passes the relative "espeak-ng-data" instead.
  await runChecked(python, ['-I', driver, '--model', model, '--input', textFile, '--output', out], { cwd: pkg });
  return {
    path: out,
    extension: 'wav',
    command: ['<venv>/bin/python', '-I', 'tools/audio/piper_synth.py', '--model', `work/tools/piper/model/${req.voice.piperModelFile}`, '--input', '<text.txt>', '--output', '<original.wav>', '(cwd=<venv>/lib/python3.13/site-packages/piper)'],
  };
}
