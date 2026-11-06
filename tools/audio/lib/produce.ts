// Original -> delivery MP3: keep the original, two-pass loudnorm, measure the actual MP3, store by hash.
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { sha256File } from './hash.ts';
import {
  DELIVERY,
  type Ebur128Summary,
  type LoudnormMeasurement,
  loudnormPass1,
  loudnormPass2,
  measureEbur128,
  pass1Args,
  pass2Args,
  probe,
  type ProbeResult,
} from './ffmpeg.ts';
import type { MediaMeasurement, MediaOriginal } from './media-index.ts';

export interface ProducedMp3 {
  readonly file: string;
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly durationMs: number | null;
  readonly loudness: Ebur128Summary;
  readonly probe: ProbeResult;
  readonly measurement: MediaMeasurement;
  readonly original: MediaOriginal;
  readonly commands: string[][];
  readonly warnings: string[];
}

/** Copies the original into <mediaDir>/originals/<sha256>.<ext> and describes it. */
export async function keepOriginal(originalPath: string, extension: string, mediaDir: string): Promise<MediaOriginal> {
  const sha = sha256File(originalPath);
  const dir = join(mediaDir, 'originals');
  mkdirSync(dir, { recursive: true });
  const file = `originals/${sha}.${extension}`;
  const dest = join(mediaDir, file);
  if (!existsSync(dest) || sha256File(dest) !== sha) copyFileSync(originalPath, dest);
  const info = await probe(dest);
  return {
    file,
    sha256: sha,
    bytes: statSync(dest).size,
    codec: info.codec,
    sampleRate: info.sampleRate,
    channels: info.channels,
    durationMs: info.durationMs,
  };
}

/** Moves a finished MP3 into the content-addressed store <mediaDir>/<sha256>.mp3. */
export function storeByHash(tmpMp3: string, mediaDir: string): { file: string; path: string; sha256: string; bytes: number } {
  const sha = sha256File(tmpMp3);
  const file = `${sha}.mp3`;
  const path = join(mediaDir, file);
  // Trust an existing file only if its bytes really hash to its name (a damaged copy is replaced).
  if (existsSync(path) && sha256File(path) === sha) rmSync(tmpMp3);
  else renameSync(tmpMp3, path);
  return { file, path, sha256: sha, bytes: statSync(path).size };
}

/**
 * Two-pass loudnorm to MP3 44.1 kHz/128 kbps mono. The final MP3 is re-measured with ebur128;
 * if its true peak exceeds the ceiling, pass 2 is repeated with a lower TP target (max 2 retries).
 */
export async function normalizeToMp3(
  originalPath: string,
  extension: string,
  mediaDir: string,
  tmpDir: string,
  /** Where <originals>/ lives; defaults to the media dir (calibration keeps it with the hidden labels). */
  originalsRoot: string = mediaDir,
): Promise<ProducedMp3> {
  const original = await keepOriginal(originalPath, extension, originalsRoot);
  const warnings: string[] = [];
  const commands: string[][] = [];
  const measured: LoudnormMeasurement = await loudnormPass1(originalPath);
  commands.push(['ffmpeg', ...pass1Args('<original>')]);

  let target: number = DELIVERY.loudnormTruePeakDbtp;
  const tmpMp3 = join(tmpDir, 'out.mp3');
  let pass2: LoudnormMeasurement | null = null;
  let loudness: Ebur128Summary | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    pass2 = await loudnormPass2(originalPath, tmpMp3, measured, target);
    commands.push(['ffmpeg', ...pass2Args('<original>', '<out.mp3>', measured, target)]);
    loudness = await measureEbur128(tmpMp3);
    const tp = loudness.truePeakDbtp;
    if (tp === null || tp <= DELIVERY.truePeakCeilingDbtp) break;
    const next = Math.round((target - (tp - DELIVERY.truePeakCeilingDbtp) - 0.3) * 10) / 10;
    warnings.push(`MP3 true peak ${tp} dBTP above ${DELIVERY.truePeakCeilingDbtp}; re-encoding with loudnorm TP=${next}`);
    target = next;
  }
  if (!pass2 || !loudness) throw new Error('normalization produced no output');
  const normalizationType = pass2.normalization_type ?? 'unknown';
  if (normalizationType !== 'linear') {
    warnings.push(`loudnorm used ${normalizationType} mode (not gain-only linear); dynamics were altered`);
  }
  if (loudness.truePeakDbtp !== null && loudness.truePeakDbtp > DELIVERY.truePeakCeilingDbtp) {
    warnings.push(`final true peak ${loudness.truePeakDbtp} dBTP still above ${DELIVERY.truePeakCeilingDbtp}`);
  }
  const info = await probe(tmpMp3);
  commands.push(['ffmpeg', '-hide_banner', '-nostats', '-i', '<out.mp3>', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const stored = storeByHash(tmpMp3, mediaDir);
  const seconds = (info.durationMs ?? 0) / 1000;
  return {
    ...stored,
    durationMs: info.durationMs,
    loudness,
    probe: info,
    original,
    commands,
    warnings,
    measurement: {
      integratedLufs: loudness.integratedLufs,
      lraLu: loudness.lraLu,
      truePeakDbtp: loudness.truePeakDbtp,
      codec: info.codec,
      sampleRate: info.sampleRate,
      channels: info.channels,
      bitRate: info.bitRate,
      normalizationType,
      loudnormTruePeakTarget: target,
      shortClip: seconds > 0 && seconds < 3,
    },
  };
}
