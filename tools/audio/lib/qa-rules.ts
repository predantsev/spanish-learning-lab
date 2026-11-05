// Technical QA rules (pure). These check format, integrity, loudness, silence and clipping.
// They are NOT language QA: nothing here judges words, stress, accent or naturalness.
import type { PcmAnalysis } from './analysis.ts';
import type { Ebur128Summary, ProbeResult } from './ffmpeg.ts';
import { DELIVERY } from './ffmpeg.ts';

export type Severity = 'fail' | 'warn';
export type TechnicalStatus = 'pass' | 'warn' | 'fail';

export interface Issue {
  readonly code: string;
  readonly severity: Severity;
  readonly message: string;
}

export const THRESHOLDS = {
  format: { codec: DELIVERY.codec, sampleRate: DELIVERY.sampleRate, channels: DELIVERY.channels, bitrateKbps: DELIVERY.bitrateKbps },
  /** |I - target| within ok -> pass, within warn -> warn, beyond -> fail. */
  loudness: { targetLufs: DELIVERY.integratedLufs, okLu: 1, warnLu: 2 },
  truePeakCeilingDbtp: DELIVERY.truePeakCeilingDbtp,
  /** Production bounds (CONTENT-PLAN): A1 short clips 2-15 s, A2 utterance/text 10-60 s. Out of bounds warns. */
  durationSec: { A1: { min: 2, max: 15 }, A2: { min: 10, max: 60 } },
  /** EBU gating makes integrated loudness noisy below ~3 s; such readings are flagged as approximate. */
  shortClipSec: 3,
  silence: { maxLeadingMs: 1000, maxTrailingMs: 1500, maxInternalMs: 2000, maxRatio: 0.6 },
  /**
   * A cut file ends on speech: (almost) no trailing silence and edge RMS above endDbfs (truncation hint).
   * A start at speech level with no lead-in is reported separately as `edge.no-lead-in`.
   */
  abruptEdge: { endDbfs: -40, maxTrailingSilenceMs: 30, startDbfs: -28, maxLeadingSilenceMs: 10 },
  clipping: { failRun: 3, failSamples: 10 },
} as const;

export interface TechnicalInput {
  readonly expectedSha256: string;
  readonly actualSha256: string;
  readonly lessonId?: string;
  readonly probe: ProbeResult;
  readonly loudness: Ebur128Summary | null;
  readonly pcm: PcmAnalysis | null;
  readonly decodeErrors: readonly string[];
}

export interface TechnicalVerdict {
  readonly status: TechnicalStatus;
  readonly shortClip: boolean;
  readonly issues: Issue[];
}

export function levelOf(lessonId: string | undefined): 'A1' | 'A2' | null {
  if (!lessonId) return null;
  if (lessonId.startsWith('A1-')) return 'A1';
  if (lessonId.startsWith('A2-')) return 'A2';
  return null;
}

export function evaluateTechnical(input: TechnicalInput): TechnicalVerdict {
  const issues: Issue[] = [];
  const add = (code: string, severity: Severity, message: string) => issues.push({ code, severity, message });
  const p = input.probe;

  if (input.expectedSha256 !== input.actualSha256) add('integrity.sha256', 'fail', 'file hash differs from the index');
  if (!p.ok) add('playability', 'fail', `full decode failed: ${p.errors.slice(0, 3).join('; ') || 'no audio stream'}`);
  if (input.decodeErrors.length > 0) add('decode.errors', 'fail', `PCM decode reported: ${input.decodeErrors.slice(0, 3).join('; ')}`);

  const f = THRESHOLDS.format;
  if (p.codec !== f.codec) add('format.codec', 'fail', `codec ${p.codec ?? 'none'}, expected ${f.codec}`);
  if (p.sampleRate !== f.sampleRate) add('format.sampleRate', 'fail', `sample rate ${p.sampleRate ?? 'none'}, expected ${f.sampleRate}`);
  if (p.channels !== f.channels) add('format.channels', 'fail', `channels ${p.channels ?? 'none'}, expected ${f.channels}`);
  if (p.bitRate === null || Math.abs(p.bitRate / 1000 - f.bitrateKbps) > 1) {
    add('format.bitrate', 'fail', `bitrate ${p.bitRate === null ? 'none' : Math.round(p.bitRate / 1000)} kbps, expected ${f.bitrateKbps}`);
  }

  const seconds = (p.durationMs ?? input.pcm?.durationMs ?? 0) / 1000;
  const shortClip = seconds > 0 && seconds < THRESHOLDS.shortClipSec;
  const level = levelOf(input.lessonId);
  if (level) {
    const b = THRESHOLDS.durationSec[level];
    if (seconds < b.min || seconds > b.max) {
      add('duration.bounds', 'warn', `${seconds.toFixed(2)} s outside ${level} production bounds ${b.min}-${b.max} s`);
    }
  } else {
    add('duration.level-unknown', 'warn', 'no A1/A2 lesson id; duration bounds not checked');
  }

  const l = input.loudness;
  if (!l || l.integratedLufs === null) {
    add('loudness.unmeasurable', 'fail', 'integrated loudness not measurable (silent or undecodable)');
  } else {
    const delta = Math.abs(l.integratedLufs - THRESHOLDS.loudness.targetLufs);
    if (delta > THRESHOLDS.loudness.warnLu) add('loudness.window', 'fail', `${l.integratedLufs} LUFS is ${delta.toFixed(1)} LU from target`);
    else if (delta > THRESHOLDS.loudness.okLu) add('loudness.window', 'warn', `${l.integratedLufs} LUFS is ${delta.toFixed(1)} LU from target`);
    if (shortClip) add('loudness.short-clip', 'warn', `clip under ${THRESHOLDS.shortClipSec} s: integrated loudness is approximate`);
  }
  if (l && l.truePeakDbtp !== null && l.truePeakDbtp > THRESHOLDS.truePeakCeilingDbtp) {
    add('peak.true-peak', 'fail', `true peak ${l.truePeakDbtp} dBTP above ${THRESHOLDS.truePeakCeilingDbtp} dBTP`);
  }

  const pcm = input.pcm;
  if (pcm) {
    const c = THRESHOLDS.clipping;
    if (pcm.longestNearFullScaleRun >= c.failRun || pcm.nearFullScaleSamples >= c.failSamples) {
      add('clipping', 'fail', `${pcm.nearFullScaleSamples} near-full-scale samples, longest run ${pcm.longestNearFullScaleRun}`);
    } else if (pcm.nearFullScaleSamples > 0) {
      add('clipping.near-full-scale', 'warn', `${pcm.nearFullScaleSamples} isolated near-full-scale samples`);
    }
    const s = THRESHOLDS.silence;
    if (pcm.silenceRatio >= 0.999) add('silence.all', 'fail', 'file is silent');
    else if (pcm.silenceRatio > s.maxRatio) add('silence.ratio', 'warn', `silence ratio ${pcm.silenceRatio}`);
    if (pcm.leadingSilenceMs > s.maxLeadingMs) add('silence.leading', 'warn', `leading silence ${pcm.leadingSilenceMs} ms`);
    if (pcm.trailingSilenceMs > s.maxTrailingMs) add('silence.trailing', 'warn', `trailing silence ${pcm.trailingSilenceMs} ms`);
    if (pcm.longestInternalSilenceMs > s.maxInternalMs) add('silence.internal', 'warn', `internal silence ${pcm.longestInternalSilenceMs} ms`);
    const e = THRESHOLDS.abruptEdge;
    if (pcm.trailingSilenceMs <= e.maxTrailingSilenceMs && pcm.tailRmsDbfs !== null && pcm.tailRmsDbfs > e.endDbfs) {
      add('edge.abrupt-end', 'warn', `no trailing silence and ${pcm.tailRmsDbfs} dBFS RMS in the last 20 ms: possible truncation`);
    }
    if (pcm.leadingSilenceMs <= e.maxLeadingSilenceMs && pcm.headRmsDbfs !== null && pcm.headRmsDbfs > e.startDbfs) {
      add(
        'edge.no-lead-in',
        'warn',
        `speech starts within ${e.maxLeadingSilenceMs} ms (${pcm.headRmsDbfs} dBFS RMS in the first 20 ms): ` +
          'a player start latency may clip the onset, or the start was cut',
      );
    }
  }

  const status: TechnicalStatus = issues.some((i) => i.severity === 'fail') ? 'fail' : issues.length > 0 ? 'warn' : 'pass';
  return { status, shortClip, issues };
}
