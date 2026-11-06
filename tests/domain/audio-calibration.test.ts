// Audio QA (tools/audio): the 20-file calibration plan and its scoring against hidden labels.
import { describe, expect, it } from 'vitest';
import { assignCaseIds, CALIBRATION_CASES } from '../../tools/audio/lib/calibration-plan.ts';
import { type CalibrationLabels, type CaseVerdicts, combineVerdicts, scoreCalibration } from '../../tools/audio/lib/calibration-score.ts';

describe('calibration plan', () => {
  it('has 8 controls, 8 seeded defects and 4 uncertain cases', () => {
    const count = (c: string) => CALIBRATION_CASES.filter((x) => x.class === c).length;
    expect([count('valid'), count('defect'), count('uncertain')]).toEqual([8, 8, 4]);
    expect(new Set(CALIBRATION_CASES.filter((x) => x.class === 'defect').map((x) => x.type))).toEqual(
      new Set(['wrong-word', 'missing-word', 'wrong-stress', 'wrong-amount', 'transcript-mismatch', 'truncation', 'clipping', 'unsuitable-accent-claim']),
    );
  });

  it('keeps controls honest: engine input equals the claimed transcript and nothing is manipulated', () => {
    for (const c of CALIBRATION_CASES.filter((x) => x.class === 'valid')) {
      expect(c.ttsText).toBe(c.claimedTranscript);
      expect(c.manipulation.kind).toBe('none');
      expect(c.voice).toBe('macos.monica');
      expect(c.expected).toBe('pass');
    }
    const linguistic = CALIBRATION_CASES.filter((x) => ['wrong-word', 'missing-word', 'wrong-stress', 'wrong-amount', 'transcript-mismatch'].includes(x.type));
    for (const c of linguistic) expect(c.ttsText).not.toBe(c.claimedTranscript);
    expect(CALIBRATION_CASES.find((x) => x.type === 'unsuitable-accent-claim')?.voice).toBe('macos.paulina');
    expect(CALIBRATION_CASES.every((x) => x.claimedVariety === 'es-ES')).toBe(true);
  });

  it('assigns public ids by a deterministic seeded shuffle that does not group classes', () => {
    const a = assignCaseIds(CALIBRATION_CASES);
    const b = assignCaseIds(CALIBRATION_CASES);
    expect(a.map((x) => x.spec.key)).toEqual(b.map((x) => x.spec.key));
    expect(a.map((x) => x.caseId)).toEqual(Array.from({ length: 20 }, (_, i) => `cal.${String(i + 1).padStart(2, '0')}`));
    expect(new Set(a.map((x) => x.spec.key)).size).toBe(20);
    const firstEight = a.slice(0, 8).map((x) => x.spec.class);
    expect(new Set(firstEight).size).toBeGreaterThan(1);
    expect(assignCaseIds(CALIBRATION_CASES, 1).map((x) => x.spec.key)).not.toEqual(a.map((x) => x.spec.key));
  });
});

describe('calibration scoring', () => {
  const labels: CalibrationLabels = {
    schemaVersion: 1,
    kind: 'sll-audio-calibration-labels',
    cases: [
      { caseId: 'cal.01', class: 'valid', type: 'control', expected: 'pass' },
      { caseId: 'cal.02', class: 'defect', type: 'wrong-amount', expected: 'block' },
      { caseId: 'cal.03', class: 'defect', type: 'clipping', expected: 'block' },
      { caseId: 'cal.04', class: 'uncertain', type: 'fast-speech', expected: 'flag' },
    ],
  };
  const v = (gemini: CaseVerdicts['gemini'], technical: CaseVerdicts['technical'] = 'pass'): CaseVerdicts => ({ gemini, technical });

  it('passes when defects are caught, controls pass and uncertain cases are flagged', () => {
    const verdicts = new Map([
      ['cal.01', v('pass-model-assessment')],
      ['cal.02', v('blocked')],
      ['cal.03', v('pass-model-assessment', 'fail')],
      ['cal.04', v('needs-review')],
    ]);
    const s = scoreCalibration(labels, verdicts);
    expect(s.summary).toMatchObject({ passed: true, missedBlockingDefects: 0, controlsRejected: 0, uncertainMissed: 0, defectsBlocked: 2 });
  });

  it('fails on a missed defect, a rejected control, an unflagged uncertain case or a missing verdict', () => {
    const base: Array<[string, CaseVerdicts]> = [
      ['cal.01', v('pass-model-assessment')],
      ['cal.02', v('blocked')],
      ['cal.03', v('blocked')],
      ['cal.04', v('needs-review')],
    ];
    const run = (patch: [string, CaseVerdicts | undefined]) => {
      const m = new Map(base);
      if (patch[1]) m.set(patch[0], patch[1]);
      else m.delete(patch[0]);
      return scoreCalibration(labels, m).summary;
    };
    expect(run(['cal.02', v('pass-model-assessment')])).toMatchObject({ passed: false, missedBlockingDefects: 1 });
    expect(run(['cal.01', v('blocked')])).toMatchObject({ passed: false, controlsRejected: 1 });
    expect(run(['cal.04', v('pass-model-assessment')])).toMatchObject({ passed: false, uncertainMissed: 1 });
    expect(run(['cal.03', undefined])).toMatchObject({ passed: false, notScored: 1 });
    expect(run(['cal.01', v('needs-review')])).toMatchObject({ passed: true, controlsFlagged: 1 });
  });

  it('never lets a technical result stand in for a missing language verdict', () => {
    expect(combineVerdicts({ gemini: null, technical: 'fail' })).toBe('not-scored');
    expect(combineVerdicts({ gemini: 'pass-model-assessment', technical: 'warn' })).toBe('needs-review');
    expect(combineVerdicts({ gemini: 'needs-review', technical: 'fail' })).toBe('blocked');
  });
});
