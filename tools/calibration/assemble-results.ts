// Assembles content/reviews/calibration/results.json from committed calibration artifacts:
// protocol.json, runs/<runId>/{run-meta.json,evidence.json}, the score files and the source-verification files.
// Narrative fields (final verdict per direction, recommended settings, limitations) come from a small input file so
// that every number in results.json is copied from an artifact, never retyped.
// Usage: node tools/calibration/assemble-results.ts <narrative.json>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cal = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'reviews', 'calibration');
type Json = Record<string, unknown>;
const read = (rel: string): Json => JSON.parse(readFileSync(join(cal, rel), 'utf8')) as Json;

interface RunSpec { runId: string; direction: 'A' | 'B'; packet: string; prompt: string; purpose: string; contaminated?: string }

function runSummary(spec: RunSpec): Json {
  const meta = read(`runs/${spec.runId}/run-meta.json`);
  const evidence = read(`runs/${spec.runId}/evidence.json`) as { promptAsSent: string; files: Record<string, { rawSha256: string }> };
  const started = String(meta.startedAt);
  const finished = String(meta.finishedAt);
  const resolved = (meta.resolved ?? {}) as Json;
  const files = evidence.files;
  const rawOutput = spec.direction === 'A' ? 'last-message.json' : 'stdout.json';
  return {
    ...spec,
    tool: meta.tool,
    cliVersion: meta.cliVersion,
    resolvedFromToolOutput: spec.direction === 'A'
      ? { model: resolved.model, provider: resolved.provider, reasoningEffort: resolved['reasoning effort'], sandbox: resolved.sandbox, approval: resolved.approval, tokensUsed: resolved['tokens used'] }
      : { models: resolved.models, numTurns: resolved.numTurns, durationMs: resolved.durationMs, totalCostUsdListBasis: resolved.totalCostUsdListBasis },
    commandsExecutedByReviewer: meta.commandsExecutedByReviewer ?? 'n/a (no tools available)',
    command: meta.command,
    startedAt: started,
    finishedAt: finished,
    durationSeconds: (Date.parse(finished) - Date.parse(started)) / 1000,
    exitCode: meta.exitCode,
    coverage: meta.coverage,
    evidenceDirectory: `runs/${spec.runId}/`,
    sha256: {
      promptAsSent: files['prompt.txt']?.rawSha256,
      rawOutput: files[rawOutput]?.rawSha256,
      parsed: files['parsed.json']?.rawSha256,
    },
    promptAsSentFile: evidence.promptAsSent,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const narrativePath = process.argv[2];
  if (!narrativePath) {
    console.error('usage: assemble-results.ts <narrative.json>');
    process.exit(2);
  }
  const narrative = JSON.parse(readFileSync(narrativePath, 'utf8')) as Json & { runs: RunSpec[] };
  const protocol = read('protocol.json');
  const scores: Json = {};
  for (const f of ['scores-main.json', 'scores-h1.json', 'scores-h2.json']) {
    if (existsSync(join(cal, f))) {
      const s = read(f) as { results: Array<{ runId: string; original: Json; corrected: Json | null }> };
      for (const r of s.results) scores[r.runId] = { set: f.replace(/^scores-|\.json$/g, ''), original: r.original, corrected: r.corrected };
    }
  }
  const verification = ['source-verification.json', 'source-verification-h1.json', 'source-verification-h2.json']
    .filter((f) => existsSync(join(cal, f)))
    .map((f) => {
      const v = read(f) as { sources: Array<{ kind: string; location: string; retrievedAt: string; httpStatus: number | null }>; labels: Array<{ mechanicalCheck: string }>; statusProbes: Json[] };
      const hosts: Record<string, number> = {};
      for (const s of v.sources) {
        const host = s.kind === 'web' ? (new URL(s.location).hostname) : 'repository';
        hosts[host] = (hosts[host] ?? 0) + 1;
      }
      return {
        file: f,
        sourcesRetrieved: v.sources.length,
        byHost: hosts,
        retrievedBetween: [v.sources.map((s) => s.retrievedAt).sort()[0], v.sources.map((s) => s.retrievedAt).sort().at(-1)],
        labelsMechanicallyVerified: `${v.labels.filter((l) => l.mechanicalCheck === 'all-cited-passages-found').length}/${v.labels.length}`,
        notRetrievable: v.statusProbes,
      };
    });
  const out = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    issue: '#111',
    brief: 'work/briefs/05-calibration.md',
    scope: narrative.scope,
    thresholds: protocol.thresholds,
    definitions: protocol.definitions,
    truthSets: narrative.truthSets,
    sourceVerification: verification,
    runs: narrative.runs.map(runSummary),
    scores,
    labelCorrections: narrative.labelCorrections,
    repairCycles: narrative.repairCycles,
    finalPerDirection: narrative.finalPerDirection,
    recommendedSettings: narrative.recommendedSettings,
    limitations: narrative.limitations,
  };
  writeFileSync(join(cal, 'results.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log(`results.json: ${out.runs.length} runs, ${Object.keys(scores).length} scored runs, ${verification.length} verification files`);
}
