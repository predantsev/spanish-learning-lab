// Scores reviewer runs against hidden labels using the definitions pre-registered in protocol.json.
// Adjudication decisions (does the reviewer's element match the seeded defect? is a rejection of a valid control
// supported?) are explicit inputs with written reasons, never inferred by this script.
// Label corrections live in a separate file so labels.json stays byte-identical to its pre-registered hash; every
// run is scored on the original labels and, when corrections exist, on the corrected labels as well.
// Seeded-defect detection counts only the defects seeded at authoring time; a defect found later (a correction that
// turns a case into `flawed`) is reported as "unintended" and still counts towards release-blocking misses.
// Usage: node tools/calibration/score.ts <labels.json> <corrections.json|-> <adjudication.json> <out.json> <runId>=<run-dir> [...]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Klass = 'flawed' | 'valid' | 'ambiguous';
type Verdict = 'valid' | 'flawed' | 'uncertain';
export interface Label {
  caseId: string;
  class: Klass;
  primaryCategory: string;
  defectType: string | null;
  releaseBlocking: boolean;
  seeded?: boolean;
}
export interface Correction { caseId: string; field: 'class' | 'releaseBlocking' | 'defectType'; from: unknown; to: unknown; evidence: string }
interface Review { caseId: string; verdict: Verdict; blocking: 'yes' | 'no'; element: string; defect: string; sources: string[] }
interface Adj { elementMatch?: boolean; rejectionSupported?: boolean; ambiguityIdentified?: boolean; note?: string }

export interface DirectionScore {
  runId: string;
  confusion: Record<Klass, Record<Verdict, number>>;
  detection: { strict: number; lenient: number; of: number; missed: string[] };
  unintendedDefects: { flaggedFlawed: number; of: number; cases: string[]; missed: string[] };
  releaseBlockingMisses: { count: number; cases: string[]; lenientCount: number };
  validControls: { rejected: string[]; rejectedWithoutSourceSupport: string[]; flaggedUncertain: string[]; of: number };
  ambiguous: { recognizedAsUncertain: number; identifiedAnyVerdict: number; of: number; notRecognized: string[] };
  precisionRecall: { flaggedFlawed: number; truePositive: number; precision: number; recall: number; f1: number; strictSeededRecall: number };
  byCategory: Record<string, { cases: number; seededDetected: number; seededOf: number; validRejected: number; ambiguousRecognized: number }>;
  thresholds: Record<string, { value: number; required: string; pass: boolean }>;
  pass: boolean;
}

function round(x: number): number {
  return Math.round(x * 1000) / 1000;
}

export function withSeedFlags(labels: Label[]): Label[] {
  return labels.map((l) => ({ ...l, seeded: l.seeded ?? l.class === 'flawed' }));
}

export function applyCorrections(labels: Label[], corrections: Correction[]): Label[] {
  return labels.map((l) => {
    let out: Label = { ...l };
    for (const c of corrections.filter((x) => x.caseId === l.caseId)) out = { ...out, [c.field]: c.to } as Label;
    if (out.class === 'flawed' && l.class !== 'flawed') out.seeded = false;
    return out;
  });
}

export function scoreRun(runId: string, labelsIn: Label[], reviews: Review[], adj: Record<string, Adj>): DirectionScore {
  const labels = withSeedFlags(labelsIn);
  const byId = new Map(reviews.map((r) => [r.caseId, r]));
  const verdicts: Verdict[] = ['valid', 'flawed', 'uncertain'];
  const confusion = { flawed: {}, valid: {}, ambiguous: {} } as Record<Klass, Record<Verdict, number>>;
  for (const k of Object.keys(confusion) as Klass[]) for (const v of verdicts) confusion[k][v] = 0;
  const missed: string[] = [];
  const unintended: string[] = [];
  const unintendedMissed: string[] = [];
  const rbm: string[] = [];
  const rejected: string[] = [];
  const unsupported: string[] = [];
  const validUncertain: string[] = [];
  const ambNot: string[] = [];
  let strict = 0;
  let lenient = 0;
  let rbmLenient = 0;
  let ambRec = 0;
  let ambAny = 0;
  let unintendedFlagged = 0;
  const byCategory: DirectionScore['byCategory'] = {};
  for (const l of labels) {
    const r = byId.get(l.caseId);
    if (!r) throw new Error(`${runId}: no review for ${l.caseId}`);
    const a = adj[l.caseId] ?? {};
    confusion[l.class][r.verdict] += 1;
    const cat = (byCategory[l.primaryCategory] ??= { cases: 0, seededDetected: 0, seededOf: 0, validRejected: 0, ambiguousRecognized: 0 });
    cat.cases += 1;
    if (l.class === 'flawed') {
      if (l.seeded) {
        cat.seededOf += 1;
        if (r.verdict === 'flawed' && a.elementMatch === true) { strict += 1; cat.seededDetected += 1; } else missed.push(l.caseId);
        if (r.verdict !== 'valid' && a.elementMatch === true) lenient += 1;
      } else {
        unintended.push(l.caseId);
        if (r.verdict === 'flawed' && a.elementMatch === true) unintendedFlagged += 1; else unintendedMissed.push(l.caseId);
      }
      // Pre-registered definition: a blocking defect is missed unless the case is flagged flawed AND blocking.
      if (l.releaseBlocking && !(r.verdict === 'flawed' && r.blocking === 'yes')) rbm.push(l.caseId);
      if (l.releaseBlocking && r.verdict === 'valid') rbmLenient += 1;
    } else if (l.class === 'ambiguous') {
      if (r.verdict === 'uncertain') { ambRec += 1; cat.ambiguousRecognized += 1; } else ambNot.push(l.caseId);
      if (r.verdict === 'uncertain' || a.ambiguityIdentified === true) ambAny += 1;
      if (l.releaseBlocking && (r.verdict === 'valid' || (r.verdict === 'flawed' && r.blocking === 'no'))) { rbm.push(l.caseId); rbmLenient += 1; }
    } else {
      if (r.verdict === 'flawed') {
        rejected.push(l.caseId);
        cat.validRejected += 1;
        if (a.rejectionSupported !== true) unsupported.push(l.caseId);
      }
      if (r.verdict === 'uncertain') validUncertain.push(l.caseId);
    }
  }
  const nSeeded = labels.filter((l) => l.class === 'flawed' && l.seeded).length;
  const nFlawed = labels.filter((l) => l.class === 'flawed').length;
  const nAmb = labels.filter((l) => l.class === 'ambiguous').length;
  const flagged = reviews.filter((r) => r.verdict === 'flawed').length;
  const tp = confusion.flawed.flawed;
  const precision = flagged ? tp / flagged : 0;
  const recall = nFlawed ? tp / nFlawed : 0;
  const thresholds = {
    releaseBlockingMisses: { value: rbm.length, required: '== 0', pass: rbm.length === 0 },
    validControlsRejectedWithoutSourceSupport: { value: unsupported.length, required: '== 0', pass: unsupported.length === 0 },
    seededDefectDetection: { value: strict, required: `>= ${Math.ceil(0.95 * nSeeded)} of ${nSeeded}`, pass: strict >= Math.ceil(0.95 * nSeeded) },
    ambiguousRecognizedAsUncertain: { value: ambRec, required: `>= ${Math.ceil(0.9 * nAmb)} of ${nAmb}`, pass: ambRec >= Math.ceil(0.9 * nAmb) },
  };
  return {
    runId,
    confusion,
    detection: { strict, lenient, of: nSeeded, missed },
    unintendedDefects: { flaggedFlawed: unintendedFlagged, of: unintended.length, cases: unintended, missed: unintendedMissed },
    releaseBlockingMisses: { count: rbm.length, cases: rbm, lenientCount: rbmLenient },
    validControls: { rejected, rejectedWithoutSourceSupport: unsupported, flaggedUncertain: validUncertain, of: labels.filter((l) => l.class === 'valid').length },
    ambiguous: { recognizedAsUncertain: ambRec, identifiedAnyVerdict: ambAny, of: nAmb, notRecognized: ambNot },
    precisionRecall: {
      flaggedFlawed: flagged, truePositive: tp, precision: round(precision), recall: round(recall),
      f1: round(precision + recall ? (2 * precision * recall) / (precision + recall) : 0), strictSeededRecall: round(nSeeded ? strict / nSeeded : 0),
    },
    byCategory,
    thresholds,
    pass: Object.values(thresholds).every((t) => t.pass),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [labelsPath, correctionsPath, adjPath, outPath, ...runs] = process.argv.slice(2);
  if (!labelsPath || !correctionsPath || !adjPath || !outPath || runs.length === 0) {
    console.error('usage: score.ts <labels.json> <corrections.json|-> <adjudication.json> <out.json> <runId>=<run-dir> [...]');
    process.exit(2);
  }
  const labels = (JSON.parse(readFileSync(labelsPath, 'utf8')) as { labels: Label[] }).labels;
  const corrections = correctionsPath === '-' ? [] : (JSON.parse(readFileSync(correctionsPath, 'utf8')) as { corrections: Correction[] }).corrections;
  const adjDoc = JSON.parse(readFileSync(adjPath, 'utf8')) as Record<string, Record<string, Adj>>;
  const results = runs.map((spec) => {
    const eq = spec.indexOf('=');
    const runId = spec.slice(0, eq);
    const dir = spec.slice(eq + 1);
    const reviews = (JSON.parse(readFileSync(join(dir, 'parsed.json'), 'utf8')) as { cases: Review[] }).cases;
    const adj = adjDoc[runId] ?? {};
    return {
      runId,
      original: scoreRun(runId, labels, reviews, adj),
      corrected: corrections.length ? scoreRun(runId, applyCorrections(withSeedFlags(labels), corrections), reviews, adj) : null,
    };
  });
  writeFileSync(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), corrections, results }, null, 2)}\n`);
  for (const r of results) {
    for (const [kind, s] of [['original', r.original], ['corrected', r.corrected]] as const) {
      if (!s) continue;
      console.log(`${r.runId} [${kind}]: ${s.pass ? 'PASS' : 'FAIL'} | seeded detection ${s.detection.strict}/${s.detection.of} (lenient ${s.detection.lenient}) | `
        + `unintended flagged ${s.unintendedDefects.flaggedFlawed}/${s.unintendedDefects.of} | blocking misses ${s.releaseBlockingMisses.count} ${JSON.stringify(s.releaseBlockingMisses.cases)} | `
        + `valid rejected ${s.validControls.rejected.length}/${s.validControls.of} (unsupported ${s.validControls.rejectedWithoutSourceSupport.length}) | `
        + `ambiguous ${s.ambiguous.recognizedAsUncertain}/${s.ambiguous.of} ${JSON.stringify(s.ambiguous.notRecognized)} | P ${s.precisionRecall.precision} R ${s.precisionRecall.recall}`);
    }
  }
}
