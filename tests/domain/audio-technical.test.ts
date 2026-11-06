// Audio QA (tools/audio): PCM analysis, technical rules and the ffmpeg/say output parsers (pure parts).
import { describe, expect, it } from 'vitest';
import { analyzePcm } from '../../tools/audio/lib/analysis.ts';
import { parseSayVoices } from '../../tools/audio/lib/environment.ts';
import { parseEbur128Summary, parseLoudnormJson, type ProbeResult } from '../../tools/audio/lib/ffmpeg.ts';
import { evaluateTechnical, levelOf, type TechnicalInput } from '../../tools/audio/lib/qa-rules.ts';

const SR = 44100;

function signal(parts: Array<{ ms: number; amp: number }>): Float32Array {
  const total = parts.reduce((s, p) => s + Math.round((SR * p.ms) / 1000), 0);
  const out = new Float32Array(total);
  let at = 0;
  for (const p of parts) {
    const n = Math.round((SR * p.ms) / 1000);
    for (let i = 0; i < n; i++) out[at + i] = p.amp * Math.sin((2 * Math.PI * 220 * i) / SR);
    at += n;
  }
  return out;
}

const goodProbe: ProbeResult = {
  ok: true, formatName: 'mp3', codec: 'mp3', sampleRate: 44100, channels: 1, bitRate: 128000, durationMs: 4000, decodedFrames: 150, errors: [],
};

function input(over: Partial<TechnicalInput> = {}): TechnicalInput {
  return {
    expectedSha256: 'a',
    actualSha256: 'a',
    lessonId: 'A1-05-L2',
    probe: goodProbe,
    loudness: { integratedLufs: -19.3, lraLu: 2, truePeakDbtp: -5 },
    pcm: analyzePcm(signal([{ ms: 200, amp: 0 }, { ms: 3600, amp: 0.3 }, { ms: 200, amp: 0 }]), SR),
    decodeErrors: [],
    ...over,
  };
}

describe('PCM analysis', () => {
  it('measures leading/trailing/internal silence and the sample peak', () => {
    const a = analyzePcm(signal([{ ms: 300, amp: 0 }, { ms: 1000, amp: 0.5 }, { ms: 2500, amp: 0 }, { ms: 1000, amp: 0.5 }, { ms: 100, amp: 0 }]), SR);
    expect(a.leadingSilenceMs).toBe(300);
    expect(a.trailingSilenceMs).toBe(100);
    expect(a.longestInternalSilenceMs).toBe(2500);
    expect(a.samplePeakDbfs).toBeCloseTo(-6.02, 1);
    expect(a.nearFullScaleSamples).toBe(0);
  });

  it('counts near-full-scale runs (clipping) and an abrupt end', () => {
    const clipped = signal([{ ms: 100, amp: 0 }, { ms: 500, amp: 3 }]).map((x) => Math.max(-1, Math.min(1, x)));
    const a = analyzePcm(clipped, SR);
    expect(a.longestNearFullScaleRun).toBeGreaterThan(3);
    expect(a.trailingSilenceMs).toBe(0);
    expect(a.tailRmsDbfs).not.toBeNull();
  });
});

describe('technical rules', () => {
  it('passes a well-formed, normalized clip', () => {
    expect(evaluateTechnical(input())).toMatchObject({ status: 'pass', issues: [] });
  });

  it('fails on integrity, format, loudness and peak problems', () => {
    const codes = (i: TechnicalInput) => evaluateTechnical(i).issues.filter((x) => x.severity === 'fail').map((x) => x.code);
    expect(codes(input({ actualSha256: 'b' }))).toContain('integrity.sha256');
    expect(codes(input({ probe: { ...goodProbe, sampleRate: 22050, channels: 2 } }))).toEqual(expect.arrayContaining(['format.sampleRate', 'format.channels']));
    expect(codes(input({ loudness: { integratedLufs: -23, lraLu: 1, truePeakDbtp: -5 } }))).toContain('loudness.window');
    expect(codes(input({ loudness: { integratedLufs: -19, lraLu: 1, truePeakDbtp: -0.5 } }))).toContain('peak.true-peak');
    expect(codes(input({ probe: { ...goodProbe, ok: false, errors: ['Invalid data'] } }))).toContain('playability');
  });

  it('warns on duration bounds and near-target loudness, and keeps info-only notes neutral', () => {
    const r = evaluateTechnical(input({ lessonId: 'A2-06-L2', loudness: { integratedLufs: -20.6, lraLu: 1, truePeakDbtp: -5 } }));
    expect(r.status).toBe('warn');
    expect(r.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['duration.bounds', 'loudness.window']));
    const short = evaluateTechnical(input({ probe: { ...goodProbe, durationMs: 2500 } }));
    expect(short.status).toBe('pass');
    expect(short.shortClip).toBe(true);
    expect(short.issues.find((i) => i.code === 'loudness.short-clip')?.severity).toBe('info');
    expect(levelOf('A1-03-L6')).toBe('A1');
    expect(levelOf(undefined)).toBeNull();
  });
});

describe('tool output parsers', () => {
  it('parses the ebur128 summary including silence', () => {
    const stderr = '[Parsed_ebur128_0 @ 0x1] Summary:\n\n  Integrated loudness:\n    I:         -19.4 LUFS\n    Threshold: -29.4 LUFS\n\n  Loudness range:\n    LRA:         0.3 LU\n    Threshold: -39.4 LUFS\n    LRA low:   -19.5 LUFS\n    LRA high:  -19.2 LUFS\n\n  True peak:\n    Peak:       -6.2 dBFS\n';
    expect(parseEbur128Summary(stderr)).toEqual({ integratedLufs: -19.4, lraLu: 0.3, truePeakDbtp: -6.2 });
    const silent = stderr.replace('-19.4 LUFS\n    Threshold: -29.4', '-70.0 LUFS\n    Threshold: -70.0').replace('-6.2 dBFS', '-inf dBFS');
    expect(parseEbur128Summary(silent)).toMatchObject({ integratedLufs: null, truePeakDbtp: null });
  });

  it('parses the loudnorm JSON block', () => {
    const stderr = 'noise\n{\n\t"input_i" : "-17.89",\n\t"input_tp" : "-4.68",\n\t"input_lra" : "0.30",\n\t"input_thresh" : "-27.89",\n\t"output_i" : "-19.24",\n\t"normalization_type" : "linear",\n\t"target_offset" : "0.24"\n}\n';
    expect(parseLoudnormJson(stderr)).toMatchObject({ input_i: '-17.89', normalization_type: 'linear', target_offset: '0.24' });
    expect(() => parseLoudnormJson('no json')).toThrow();
  });

  it('parses say voice listings with spaces and parentheses in names', () => {
    const out = 'Eddy (Spanish (Spain)) es_ES    # ¡Hola! Me llamo Eddy.\nMónica              es_ES    # ¡Hola! Me llamo Mónica.\nPaulina             es_MX    # ¡Hola!\n';
    expect(parseSayVoices(out)).toEqual([
      { name: 'Eddy (Spanish (Spain))', locale: 'es_ES', sample: '¡Hola! Me llamo Eddy.' },
      { name: 'Mónica', locale: 'es_ES', sample: '¡Hola! Me llamo Mónica.' },
      { name: 'Paulina', locale: 'es_MX', sample: '¡Hola!' },
    ]);
  });
});
