// ffmpeg/ffprobe operations for the audio pipeline: two-pass EBU R128 normalization to MP3,
// measurement (ebur128 + ffprobe) and full decode to PCM. Argument arrays only.
import { run, runChecked } from './exec.ts';

export const FFMPEG = process.env.SLL_FFMPEG ?? 'ffmpeg';
export const FFPROBE = process.env.SLL_FFPROBE ?? 'ffprobe';

/** Delivery format and loudness targets (docs/CONTENT-PLAN.md §Audio production). */
export const DELIVERY = {
  codec: 'mp3',
  encoder: 'libmp3lame',
  sampleRate: 44100,
  channels: 1,
  bitrateKbps: 128,
  /** Integrated loudness target for the mono file. */
  integratedLufs: -19,
  /** Hard ceiling measured on the final MP3. */
  truePeakCeilingDbtp: -1,
  /** loudnorm TP target leaves headroom for MP3 inter-sample overshoot. */
  loudnormTruePeakDbtp: -1.5,
  /** Wide LRA target so linear (gain-only) mode is not refused for short speech clips. */
  loudnormLra: 20,
} as const;

export interface LoudnormMeasurement {
  readonly input_i: string;
  readonly input_tp: string;
  readonly input_lra: string;
  readonly input_thresh: string;
  readonly target_offset: string;
  readonly normalization_type?: string;
  readonly output_i?: string;
  readonly output_tp?: string;
}

/** Extracts the last `{…}` JSON block printed by loudnorm on stderr. */
export function parseLoudnormJson(stderr: string): LoudnormMeasurement {
  const start = stderr.lastIndexOf('{');
  const end = stderr.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('loudnorm JSON not found in ffmpeg output');
  const parsed = JSON.parse(stderr.slice(start, end + 1)) as Record<string, unknown>;
  for (const key of ['input_i', 'input_tp', 'input_lra', 'input_thresh', 'target_offset']) {
    if (typeof parsed[key] !== 'string') throw new Error(`loudnorm JSON lacks ${key}`);
  }
  return parsed as unknown as LoudnormMeasurement;
}

export function loudnormFilter(truePeakDbtp: number, measured?: LoudnormMeasurement): string {
  const base = `loudnorm=I=${DELIVERY.integratedLufs}:TP=${truePeakDbtp}:LRA=${DELIVERY.loudnormLra}`;
  if (!measured) return `${base}:print_format=json`;
  return (
    `${base}:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}` +
    `:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}` +
    `:offset=${measured.target_offset}:linear=true:print_format=json`
  );
}

export function pass1Args(input: string, truePeakDbtp: number = DELIVERY.loudnormTruePeakDbtp): string[] {
  return ['-hide_banner', '-nostats', '-i', input, '-af', loudnormFilter(truePeakDbtp), '-f', 'null', '-'];
}

export function pass2Args(input: string, output: string, measured: LoudnormMeasurement, truePeakDbtp: number): string[] {
  return [
    '-hide_banner', '-nostats', '-y', '-i', input,
    '-af', `${loudnormFilter(truePeakDbtp, measured)},aresample=${DELIVERY.sampleRate}`,
    '-ac', String(DELIVERY.channels), '-ar', String(DELIVERY.sampleRate),
    '-c:a', DELIVERY.encoder, '-b:a', `${DELIVERY.bitrateKbps}k`,
    '-map_metadata', '-1', '-write_id3v1', '0', '-id3v2_version', '0',
    '-fflags', '+bitexact', '-flags:a', '+bitexact',
    output,
  ];
}

/** Plain re-encode without normalization (used only to build calibration defects). */
export function encodeRawArgs(input: string, output: string, audioFilter?: string): string[] {
  return [
    '-hide_banner', '-nostats', '-y', '-i', input,
    ...(audioFilter ? ['-af', audioFilter] : []),
    '-ac', String(DELIVERY.channels), '-ar', String(DELIVERY.sampleRate),
    '-c:a', DELIVERY.encoder, '-b:a', `${DELIVERY.bitrateKbps}k`,
    '-map_metadata', '-1', '-write_id3v1', '0', '-id3v2_version', '0',
    '-fflags', '+bitexact', '-flags:a', '+bitexact',
    output,
  ];
}

export async function loudnormPass1(input: string, truePeakDbtp: number = DELIVERY.loudnormTruePeakDbtp): Promise<LoudnormMeasurement> {
  const result = await runChecked(FFMPEG, pass1Args(input, truePeakDbtp));
  return parseLoudnormJson(result.stderr);
}

export async function loudnormPass2(
  input: string,
  output: string,
  measured: LoudnormMeasurement,
  truePeakDbtp: number,
): Promise<LoudnormMeasurement> {
  const result = await runChecked(FFMPEG, pass2Args(input, output, measured, truePeakDbtp));
  return parseLoudnormJson(result.stderr);
}

export interface Ebur128Summary {
  /** Integrated loudness (LUFS); null when the gate leaves no blocks (silence). */
  readonly integratedLufs: number | null;
  readonly lraLu: number | null;
  /** Maximum true peak (dBTP); null for digital silence (-inf). */
  readonly truePeakDbtp: number | null;
}

function parseLevel(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  if (/-?inf/i.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Parses the `Summary:` block of the ebur128 filter (peak=true). */
export function parseEbur128Summary(stderr: string): Ebur128Summary {
  const at = stderr.lastIndexOf('Summary:');
  if (at < 0) throw new Error('ebur128 summary not found in ffmpeg output');
  const block = stderr.slice(at);
  const i = /I:\s+(-?inf|-?[\d.]+)\s+LUFS/.exec(block)?.[1];
  const lra = /LRA:\s+(-?inf|-?[\d.]+)\s+LU\b/.exec(block)?.[1];
  const peak = /True peak:\s*\n\s*Peak:\s+(-?inf|-?[\d.]+)\s+dBFS/.exec(block)?.[1];
  if (i === undefined) throw new Error('ebur128 summary lacks integrated loudness');
  const integrated = parseLevel(i);
  return {
    // ffmpeg reports the -70 LUFS absolute gate value when nothing passes the gate.
    integratedLufs: integrated !== null && integrated <= -70 ? null : integrated,
    lraLu: parseLevel(lra),
    truePeakDbtp: parseLevel(peak),
  };
}

export function ebur128Args(input: string): string[] {
  return ['-hide_banner', '-nostats', '-i', input, '-af', 'ebur128=peak=true', '-f', 'null', '-'];
}

export async function measureEbur128(input: string): Promise<Ebur128Summary> {
  const result = await runChecked(FFMPEG, ebur128Args(input));
  return parseEbur128Summary(result.stderr);
}

export interface ProbeResult {
  readonly ok: boolean;
  readonly formatName: string | null;
  readonly codec: string | null;
  readonly sampleRate: number | null;
  readonly channels: number | null;
  readonly bitRate: number | null;
  readonly durationMs: number | null;
  /** Frames actually decoded by ffprobe -count_frames (full-file decode). */
  readonly decodedFrames: number | null;
  readonly errors: string[];
}

export function probeArgs(input: string): string[] {
  return [
    '-v', 'error', '-count_frames', '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name,sample_rate,channels,bit_rate,nb_read_frames:format=format_name,duration,bit_rate',
    '-of', 'json', input,
  ];
}

function num(value: unknown): number | null {
  if (value === undefined || value === null || value === 'N/A') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** ffprobe with a full decode of the first audio stream; errors on stderr make it not playable. */
export async function probe(input: string): Promise<ProbeResult> {
  const result = await run(FFPROBE, probeArgs(input));
  const errors = result.stderr.split('\n').map((l) => l.trim()).filter(Boolean);
  let parsed: { streams?: Array<Record<string, unknown>>; format?: Record<string, unknown> } = {};
  try {
    parsed = JSON.parse(result.stdout.toString('utf8') || '{}') as typeof parsed;
  } catch {
    errors.push('ffprobe output is not JSON');
  }
  const stream = parsed.streams?.[0];
  const format = parsed.format;
  const duration = num(format?.duration);
  const decodedFrames = num(stream?.nb_read_frames);
  return {
    ok: result.code === 0 && errors.length === 0 && stream !== undefined && (decodedFrames ?? 0) > 0,
    formatName: typeof format?.format_name === 'string' ? format.format_name : null,
    codec: typeof stream?.codec_name === 'string' ? stream.codec_name : null,
    sampleRate: num(stream?.sample_rate),
    channels: num(stream?.channels),
    bitRate: num(stream?.bit_rate) ?? num(format?.bit_rate),
    durationMs: duration === null ? null : Math.round(duration * 1000),
    decodedFrames,
    errors: result.code === 0 ? errors : [...errors, `ffprobe exit ${result.code}`],
  };
}

export function decodeArgs(input: string, sampleRate: number): string[] {
  return ['-v', 'error', '-i', input, '-f', 'f32le', '-ac', '1', '-ar', String(sampleRate), 'pipe:1'];
}

/** Decodes the whole file to mono float32 PCM; decode errors are returned, not thrown. */
export async function decodePcm(input: string, sampleRate: number = DELIVERY.sampleRate): Promise<{ samples: Float32Array; errors: string[] }> {
  const result = await run(FFMPEG, decodeArgs(input, sampleRate));
  const errors = result.stderr.split('\n').map((l) => l.trim()).filter(Boolean);
  if (result.code !== 0) errors.push(`ffmpeg decode exit ${result.code}`);
  const buf = result.stdout;
  const usable = buf.byteLength - (buf.byteLength % 4);
  const copy = new Uint8Array(usable);
  copy.set(buf.subarray(0, usable));
  return { samples: new Float32Array(copy.buffer), errors };
}

/** First line of `<tool> -version` (recorded in every index entry and report). */
export async function toolVersion(cmd: string): Promise<string> {
  const result = await run(cmd, ['-version']);
  return result.stdout.toString('utf8').split('\n')[0]?.trim() ?? 'unknown';
}
