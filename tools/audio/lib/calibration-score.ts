// Scores audio-QA verdicts against hidden calibration labels (CONTENT-PLAN thresholds: zero missed
// blocking defects, zero unsupported control rejections, every uncertain case flagged). Pure.
import type { CaseClass, Expected } from './calibration-plan.ts';

export interface LabelCase {
  readonly caseId: string;
  readonly class: CaseClass;
  readonly type: string;
  readonly expected: Expected;
}

export interface CalibrationLabels {
  readonly schemaVersion: 1;
  readonly kind: 'sll-audio-calibration-labels';
  readonly cases: readonly LabelCase[];
}

export interface CaseVerdicts {
  readonly gemini: 'pass-model-assessment' | 'needs-review' | 'blocked' | null;
  readonly technical: 'pass' | 'warn' | 'fail' | null;
}

export type FinalVerdict = 'pass' | 'needs-review' | 'blocked' | 'not-scored';

/** Worst of the language-QA and technical verdicts; a missing language verdict is never a pass. */
export function combineVerdicts(v: CaseVerdicts | undefined): FinalVerdict {
  if (!v || v.gemini === null) return 'not-scored';
  const rank = (x: 'pass' | 'needs-review' | 'blocked') => (x === 'blocked' ? 2 : x === 'needs-review' ? 1 : 0);
  const fromGemini = v.gemini === 'pass-model-assessment' ? 'pass' : v.gemini;
  const fromTechnical = v.technical === 'fail' ? 'blocked' : v.technical === 'warn' ? 'needs-review' : 'pass';
  return rank(fromGemini) >= rank(fromTechnical) ? fromGemini : fromTechnical;
}

export type RowOutcome =
  | 'caught-blocked'
  | 'caught-flagged'
  | 'MISSED-DEFECT'
  | 'control-ok'
  | 'control-flagged'
  | 'CONTROL-REJECTED'
  | 'uncertain-flagged'
  | 'UNCERTAIN-MISSED'
  | 'not-scored';

export function outcomeFor(cls: CaseClass, verdict: FinalVerdict): RowOutcome {
  if (verdict === 'not-scored') return 'not-scored';
  if (cls === 'defect') return verdict === 'pass' ? 'MISSED-DEFECT' : verdict === 'blocked' ? 'caught-blocked' : 'caught-flagged';
  if (cls === 'valid') return verdict === 'pass' ? 'control-ok' : verdict === 'blocked' ? 'CONTROL-REJECTED' : 'control-flagged';
  return verdict === 'pass' ? 'UNCERTAIN-MISSED' : 'uncertain-flagged';
}

export function scoreCalibration(labels: CalibrationLabels, verdicts: ReadonlyMap<string, CaseVerdicts>) {
  const rows = labels.cases.map((c) => {
    const finalVerdict = combineVerdicts(verdicts.get(c.caseId));
    return { caseId: c.caseId, class: c.class, defectType: c.class === 'defect' ? c.type : null, expected: c.expected, finalVerdict, outcome: outcomeFor(c.class, finalVerdict) };
  });
  const n = (o: RowOutcome) => rows.filter((r) => r.outcome === o).length;
  const summary = {
    total: rows.length,
    notScored: n('not-scored'),
    missedBlockingDefects: n('MISSED-DEFECT'),
    defectsBlocked: n('caught-blocked'),
    defectsFlaggedOnly: n('caught-flagged'),
    controlsPassed: n('control-ok'),
    controlsFlagged: n('control-flagged'),
    controlsRejected: n('CONTROL-REJECTED'),
    uncertainFlagged: n('uncertain-flagged'),
    uncertainMissed: n('UNCERTAIN-MISSED'),
    thresholds: 'notScored = 0, missedBlockingDefects = 0, controlsRejected = 0, uncertainMissed = 0',
    passed: false,
  };
  summary.passed = summary.notScored === 0 && summary.missedBlockingDefects === 0 && summary.controlsRejected === 0 && summary.uncertainMissed === 0;
  return { rows, summary };
}
