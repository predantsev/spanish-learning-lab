// Pure PCM analysis for technical QA: sample peak, near-full-scale (clipping) runs and
// silence structure. Input is mono float32 PCM as decoded by ffmpeg (f32le).

export const ANALYSIS = {
  /** 10 ms frames for RMS-based silence detection. */
  frameMs: 10,
  /** A frame whose RMS is below this level counts as silence. */
  silenceDbfs: -50,
  /** |x| at or above this is "near full scale" (-0.18 dBFS); a normalized file never gets here. */
  nearFullScale: 0.98,
  /** Window measured at the file edges to spot an abrupt (cut) start/end. */
  edgeMs: 20,
} as const;

export interface PcmAnalysis {
  readonly sampleCount: number;
  readonly durationMs: number;
  readonly samplePeakDbfs: number | null;
  readonly rmsDbfs: number | null;
  readonly nearFullScaleSamples: number;
  readonly longestNearFullScaleRun: number;
  readonly leadingSilenceMs: number;
  readonly trailingSilenceMs: number;
  readonly longestInternalSilenceMs: number;
  readonly silenceRatio: number;
  readonly headRmsDbfs: number | null;
  readonly tailRmsDbfs: number | null;
}

export function toDb(linear: number): number | null {
  if (!(linear > 0)) return null;
  return Math.round(20 * Math.log10(linear) * 100) / 100;
}

function rms(samples: Float32Array, from: number, to: number): number {
  let sum = 0;
  const end = Math.min(to, samples.length);
  const start = Math.max(0, from);
  if (end <= start) return 0;
  for (let i = start; i < end; i++) {
    const v = samples[i] ?? 0;
    sum += v * v;
  }
  return Math.sqrt(sum / (end - start));
}

export function analyzePcm(samples: Float32Array, sampleRate: number): PcmAnalysis {
  const n = samples.length;
  let peak = 0;
  let nearFull = 0;
  let run = 0;
  let longestRun = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(samples[i] ?? 0);
    if (a > peak) peak = a;
    if (a >= ANALYSIS.nearFullScale) {
      nearFull++;
      run++;
      if (run > longestRun) longestRun = run;
    } else {
      run = 0;
    }
  }

  const frame = Math.max(1, Math.round((sampleRate * ANALYSIS.frameMs) / 1000));
  const frames = Math.ceil(n / frame);
  const threshold = 10 ** (ANALYSIS.silenceDbfs / 20);
  const silent: boolean[] = [];
  for (let f = 0; f < frames; f++) silent.push(rms(samples, f * frame, (f + 1) * frame) < threshold);

  let leading = 0;
  while (leading < frames && silent[leading]) leading++;
  let trailing = 0;
  while (trailing < frames - leading && silent[frames - 1 - trailing]) trailing++;
  let longestInternal = 0;
  let current = 0;
  for (let f = leading; f < frames - trailing; f++) {
    if (silent[f]) {
      current++;
      if (current > longestInternal) longestInternal = current;
    } else {
      current = 0;
    }
  }
  const silentFrames = silent.filter(Boolean).length;
  const edge = Math.max(1, Math.round((sampleRate * ANALYSIS.edgeMs) / 1000));

  return {
    sampleCount: n,
    durationMs: Math.round((n / sampleRate) * 1000),
    samplePeakDbfs: toDb(peak),
    rmsDbfs: toDb(rms(samples, 0, n)),
    nearFullScaleSamples: nearFull,
    longestNearFullScaleRun: longestRun,
    leadingSilenceMs: leading * ANALYSIS.frameMs,
    trailingSilenceMs: trailing * ANALYSIS.frameMs,
    longestInternalSilenceMs: longestInternal * ANALYSIS.frameMs,
    silenceRatio: frames === 0 ? 1 : Math.round((silentFrames / frames) * 1000) / 1000,
    headRmsDbfs: toDb(rms(samples, 0, edge)),
    tailRmsDbfs: toDb(rms(samples, n - edge, n)),
  };
}
