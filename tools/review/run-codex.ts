// Executes the calibrated opposite-provider text review of a packet (A-32,
// content/reviews/calibration/report.md § Recommended reviewer settings for bulk review).
//
// Direction A (Claude-authored → OpenAI), `run-codex`, prompt v3:
//   CODEX_NO_LANG_DIRECTIVE=1 codex exec --cd <run>/packet --skip-git-repo-check --sandbox read-only
//     --ignore-user-config --disable memories -m gpt-6.1-sol -c model_reasoning_effort=xhigh --ephemeral
//     --output-schema <run>/output-schema.json -o <run>/last-message.json - < <run>/prompt.txt
// Direction B (OpenAI-authored → Claude), `run-claude`, prompt v2 (cwd <run>/packet):
//   claude -p --model opus --effort medium --tools "" --safe-mode --setting-sources project,local
//     --no-session-persistence --output-format json --json-schema "$(cat <run>/output-schema.json)" < <run>/prompt.txt
//
// <run> is a fresh temp directory OUTSIDE the repository; <run>/packet holds only packet.json (the
// packet's reviewerPacket). prompt.txt = prompt template + blank line + packet JSON (calibration
// build-run.ts). Template and schema SHA-256 are verified before use. Afterwards every input/output
// is copied to content/reviews/<batchId>/runs/<jobId>/; route metadata (prompt version, hashes, exact
// argv, env, CLI version, resolved model) is stored in report.json, which the signed receipt binds
// through reportHash. Only an executed run yields a receipt; reports cannot be imported.
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { accessSync, constants, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { createRequire } from 'node:module';
import { createContractValidator } from '@sll/contracts';
import type { ReviewReport } from '@sll/contracts';
import { canonicalSha256, sha256Hex } from '../content/canonical.ts';
import { REPO_ROOT } from '../content/load.ts';
import { buildPrompt as buildCalibratedPrompt } from '../calibration/build-run.ts';
import { codexBanner, codexCommands } from '../calibration/parse-output.ts';
import { loadOrCreateKey, resolveKeysDir } from './keys.ts';
import { signReceipt } from './receipts.ts';
import { packetHashOf, readPacket, runDir } from './store.ts';
import type { ReportItem, ReviewPacket, ReviewerVerdict, RouteMetadata, StoredReport } from './store.ts';

const CALIBRATION_PROMPTS = join(REPO_ROOT, 'content', 'reviews', 'calibration', 'prompts');

export interface RouteSpec {
  direction: 'A' | 'B';
  provider: 'openai' | 'anthropic';
  tool: 'codex exec' | 'claude -p';
  promptVersion: string;
  promptFile: string;
  promptSha256: string;
  schemaFile: string;
  schemaSha256: string;
  defaultModel: string;
  defaultEffort: string;
}

export const OUTPUT_SCHEMA_SHA256 = '232e91375422fae9f2799a750043c5511a463182e5716c524785d538faa019fe';

export const ROUTES: Record<'A' | 'B', RouteSpec> = {
  A: {
    direction: 'A',
    provider: 'openai',
    tool: 'codex exec',
    promptVersion: 'reviewer-prompt.v3',
    promptFile: join(CALIBRATION_PROMPTS, 'reviewer-prompt.v3.md'),
    promptSha256: 'c911aafe63284a69e5012da7f0bc67f633ba8c0204aa19edfe5d45290c734634',
    schemaFile: join(CALIBRATION_PROMPTS, 'review-output.schema.json'),
    schemaSha256: OUTPUT_SCHEMA_SHA256,
    defaultModel: 'gpt-6.1-sol',
    defaultEffort: 'xhigh',
  },
  B: {
    direction: 'B',
    provider: 'anthropic',
    tool: 'claude -p',
    promptVersion: 'reviewer-prompt.v2',
    promptFile: join(CALIBRATION_PROMPTS, 'reviewer-prompt.v2.md'),
    promptSha256: '4b7be042e9aa7c75bc786fefa722fdb0c6b812b9f322c4b7a7e926a9a1eeaaa8',
    schemaFile: join(CALIBRATION_PROMPTS, 'review-output.schema.json'),
    schemaSha256: OUTPUT_SCHEMA_SHA256,
    defaultModel: 'opus',
    defaultEffort: 'medium',
  },
};

export interface RunnerInput {
  bin: string;
  argv: string[];
  stdin: string;
  cwd: string;
  /** Extra environment on top of process.env (exactly the calibrated variables). */
  env: Record<string, string>;
  timeoutMs: number;
  /** Direction A: where `-o` makes codex write the final message. */
  lastMessagePath: string;
}

export interface RunnerOutput {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export type Runner = (input: RunnerInput) => Promise<RunnerOutput>;

/** Spawns only its own child (argument array, no shell) and kills only that child on timeout. */
export const spawnRunner: Runner = (input) =>
  new Promise((resolvePromise) => {
    const child = spawn(input.bin, input.argv, { cwd: input.cwd, env: { ...process.env, ...input.env }, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, input.timeoutMs);
    child.stdout.setEncoding('utf8').on('data', (d: string) => (stdout += d));
    child.stderr.setEncoding('utf8').on('data', (d: string) => (stderr += d));
    child.on('error', (error) => {
      clearTimeout(timer);
      resolvePromise({ exitCode: null, stdout, stderr: `${stderr}\n${String(error)}`, timedOut });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolvePromise({ exitCode: code, stdout, stderr, timedOut });
    });
    child.stdin.end(input.stdin);
  });

export function resolveOnPath(bin: string, pathEnv: string = process.env.PATH ?? ''): string | undefined {
  if (bin.includes('/')) return bin;
  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue;
    const candidate = join(dir, bin);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return undefined;
}

/** Reads a calibrated prompt/schema file and refuses it unless its SHA-256 is the calibrated one. */
export function readPinned(path: string, expected: string): Buffer {
  const bytes = readFileSync(path);
  const actual = sha256Hex(bytes);
  if (actual !== expected) throw new Error(`${path} has sha256 ${actual}, calibrated ${expected}: recalibrate before using a changed prompt or schema`);
  return bytes;
}

export function routeArgv(route: RouteSpec, run: string, model: string, effort: string, schemaText: string): { bin: string; argv: string[]; env: Record<string, string> } {
  if (route.direction === 'A') {
    return {
      bin: 'codex',
      argv: ['exec', '--cd', join(run, 'packet'), '--skip-git-repo-check', '--sandbox', 'read-only', '--ignore-user-config', '--disable', 'memories', '-m', model, '-c', `model_reasoning_effort=${effort}`, '--ephemeral', '--output-schema', join(run, 'output-schema.json'), '-o', join(run, 'last-message.json'), '-'],
      env: { CODEX_NO_LANG_DIRECTIVE: '1' },
    };
  }
  return {
    bin: 'claude',
    argv: ['-p', '--model', model, '--effort', effort, '--tools', '', '--safe-mode', '--setting-sources', 'project,local', '--no-session-persistence', '--output-format', 'json', '--json-schema', schemaText],
    env: {},
  };
}

/** Finds the JSON object in a final message: whole text, fenced block, or first balanced object. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (fence?.[1]) return JSON.parse(fence[1]);
  throw new Error('final message is not JSON');
}

function validateReviewerOutput(schemaText: string, value: unknown): string | undefined {
  const require = createRequire(import.meta.url);
  const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
  const validate = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false }).compile(JSON.parse(schemaText) as Record<string, unknown>);
  if (validate(value)) return undefined;
  return (validate.errors ?? []).slice(0, 5).map((e) => `${e.instancePath || '/'} ${e.message ?? ''}`).join('; ');
}

/** Maps calibrated verdicts onto per-item severities for apply/promote. */
export function mapVerdicts(packet: ReviewPacket, verdicts: ReviewerVerdict[]): Pick<StoredReport, 'items' | 'missingItems' | 'unexpectedItems'> & { duplicates: string[] } {
  const byCase = new Map(packet.items.map((p) => [`${p.kind}:${p.logicalId}`, p]));
  const items: ReportItem[] = [];
  const unexpectedItems: StoredReport['unexpectedItems'] = [];
  const duplicates: string[] = [];
  for (const v of verdicts) {
    const p = byCase.get(v.caseId);
    if (!p) {
      unexpectedItems.push({ kind: v.caseId.split(':')[0] ?? '', logicalId: v.caseId });
      continue;
    }
    if (items.some((i) => i.caseId === v.caseId)) {
      duplicates.push(v.caseId);
      continue;
    }
    // Calibration: flawed and uncertain are release-blocking; blocking:"yes" always blocks.
    const blocking = v.verdict !== 'valid' || v.blocking === 'yes';
    items.push({
      kind: p.kind,
      logicalId: p.logicalId,
      contentHash: p.contentHash,
      severity: blocking ? 'blocking' : 'none',
      declaredSeverity: v.blocking === 'yes' ? 'blocking' : 'none',
      findings: blocking ? [{ severity: 'blocking', category: v.verdict === 'uncertain' ? 'uncertain' : 'flawed', location: v.element, description: v.defect, suggestion: v.correction }] : [],
      caseId: v.caseId,
      verdict: v.verdict,
      reviewerAnswer: v.reviewerAnswer,
      notes: v.notes,
      sources: v.sources,
    });
  }
  const covered = new Set(items.map((i) => i.caseId));
  const missingItems = packet.items.filter((p) => !covered.has(`${p.kind}:${p.logicalId}`)).map((p) => ({ kind: p.kind, logicalId: p.logicalId }));
  return { items, missingItems, unexpectedItems, duplicates };
}

const clip = (text: string, max: number): string => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

/** Contract ReviewReport summary when it can be formed honestly (≤30 targets, ≥1 https citation). */
export function summaryReviewReport(packet: ReviewPacket, items: ReportItem[], meta: { provider: 'openai' | 'anthropic'; model: string; effort: string; completedAt: string }): { report: ReviewReport | null; note?: string } {
  if (packet.targets.length === 0 || packet.targets.length > 30) return { report: null, note: `${packet.targets.length} targets; the contract ReviewReport holds 1–30 verdicts` };
  const bodies = new Map(packet.items.map((p) => [`${p.kind}:${p.logicalId}`, p.body as { targets?: Array<{ skillId: string; modality: string }> }]));
  const sources = items
    .flatMap((i) => (i.sources ?? []).map((s) => ({ s, caseId: i.caseId ?? '' })))
    .map(({ s, caseId }) => ({ url: /https:\/\/[^\s)\]]+/.exec(s)?.[0]?.replace(/[.,;]+$/, ''), passage: clip(s, 1500), caseId }))
    .filter((x): x is { url: string; passage: string; caseId: string } => typeof x.url === 'string')
    .slice(0, 30)
    .map((x) => ({ url: x.url, passage: x.passage, checkedAt: meta.completedAt, finding: clip(`Reviewer citation for ${x.caseId}; unverified lead (calibration: citations are mostly from memory).`, 1000) }));
  if (sources.length === 0) return { report: null, note: 'no https citation in the reviewer output; ReviewReport.sources needs at least one' };
  const verdicts = packet.targets.map((key) => {
    const slash = key.lastIndexOf('/');
    const related = items.filter((i) => (bodies.get(i.caseId ?? '')?.targets ?? []).some((t) => `${t.skillId}/${t.modality}` === key));
    const correctness = related.some((i) => i.verdict === 'flawed') ? 'incorrect' : related.some((i) => i.verdict === 'uncertain') ? 'unresolved' : 'correct';
    return {
      target: { skillId: key.slice(0, slash), modality: key.slice(slash + 1) as 'written-form' },
      correctness: correctness as 'correct' | 'incorrect' | 'unresolved',
      independence: 'not-assessed' as const,
      explanationKey: correctness === 'incorrect' ? 'content-review.defect' : correctness === 'unresolved' ? 'content-review.uncertain' : 'content-review.ok',
    };
  });
  const findings = items.filter((i) => i.severity === 'blocking').slice(0, 50).map((i) => clip(`[${i.verdict}] ${i.caseId} ${i.findings[0]?.location ?? ''}: ${i.findings[0]?.description ?? ''}`, 1500));
  const report: ReviewReport = {
    provider: meta.provider,
    model: meta.model,
    effort: meta.effort,
    reviewedAt: meta.completedAt,
    artifactHash: packet.packetHash,
    authorProvider: packet.authorProvider,
    verdicts,
    sources,
    uncertainties: items.filter((i) => i.verdict === 'uncertain').slice(0, 30).map((i) => clip(`${i.caseId}: ${i.findings[0]?.description ?? ''}`, 1500)),
    findings,
  };
  const check = createContractValidator().validate('ReviewReport', report);
  return check.ok ? { report } : { report: null, note: `ReviewReport invalid: ${check.errors[0]?.instancePath ?? ''} ${check.errors[0]?.message ?? ''}` };
}

export interface RunReviewOptions {
  reviewsDir: string;
  batchId: string;
  direction?: 'A' | 'B';
  model?: string;
  effort?: string;
  keysDir?: string;
  runner?: Runner;
  versionProbe?: (bin: string) => string;
  /** Override the binary (tests); default codex / claude on PATH. */
  bin?: string;
  timeoutMs?: number;
  dryRun?: boolean;
  now?: () => Date;
  /** Keep the temp run directory (debugging). */
  keepTemp?: boolean;
}

export interface RunReviewResult {
  ok: boolean;
  status: 'dry-run' | 'completed' | 'failed' | 'invalid-report';
  jobId?: string;
  runDir?: string;
  receiptId?: string;
  argv: string[];
  promptSha256: string;
  problems: string[];
  counts?: Record<string, number>;
}

export async function runReview(options: RunReviewOptions): Promise<RunReviewResult> {
  const route = ROUTES[options.direction ?? 'A'];
  const packet = readPacket(options.reviewsDir, options.batchId);
  if (packetHashOf(packet) !== packet.packetHash) throw new Error(`packet ${options.batchId} does not match its packetHash; rebuild the packet`);
  if (!packet.reviewerPacket) throw new Error(`packet ${options.batchId} predates the calibrated case format; rebuild it with \`review packet\``);
  if (packet.authorProvider === route.provider) {
    throw new Error(`packet author provider is ${route.provider}; a ${route.tool} review would not be an opposite-provider review (use ${route.direction === 'A' ? 'run-claude' : 'run-codex'})`);
  }
  const template = readPinned(route.promptFile, route.promptSha256);
  const schemaBytes = readPinned(route.schemaFile, route.schemaSha256);
  const schemaText = schemaBytes.toString('utf8');
  const packetBytes = Buffer.from(`${JSON.stringify(packet.reviewerPacket, null, 2)}\n`, 'utf8');
  const prompt = buildCalibratedPrompt(template, packetBytes);
  const promptSha256 = sha256Hex(prompt);
  const model = options.model ?? route.defaultModel;
  const effort = options.effort ?? route.defaultEffort;
  const now = options.now ?? (() => new Date());

  const run = options.dryRun ? join(tmpdir(), 'sll-review-<run>') : mkdtempSync(join(tmpdir(), 'sll-review-'));
  const { bin, argv, env } = routeArgv(route, run, model, effort, schemaText);
  const resolvedBin = options.bin ?? resolveOnPath(bin) ?? bin;
  const display = [...Object.entries(env).map(([k, v]) => `${k}=${v}`), resolvedBin, ...argv];
  if (options.dryRun) return { ok: true, status: 'dry-run', argv: display, promptSha256, problems: [] };

  const jobId = randomUUID();
  const out = runDir(options.reviewsDir, options.batchId, jobId);
  try {
    mkdirSync(join(run, 'packet'), { recursive: true });
    writeFileSync(join(run, 'packet', 'packet.json'), packetBytes);
    writeFileSync(join(run, 'prompt.txt'), prompt);
    writeFileSync(join(run, 'output-schema.json'), schemaBytes);
    const workingDirectoryContents = readdirSync(join(run, 'packet'));
    if (workingDirectoryContents.join(',') !== 'packet.json') throw new Error(`reviewer working directory is not isolated: ${workingDirectoryContents.join(', ')}`);
    const probe = options.versionProbe ?? ((b: string) => spawnSync(b, ['--version'], { encoding: 'utf8' }).stdout.trim());
    let cliVersion = '';
    try {
      cliVersion = probe(resolvedBin);
    } catch (error) {
      cliVersion = `unavailable: ${String(error)}`;
    }
    const startedAt = now();
    const result = await (options.runner ?? spawnRunner)({
      bin: resolvedBin,
      argv,
      stdin: prompt.toString('utf8'),
      cwd: join(run, 'packet'),
      env,
      timeoutMs: options.timeoutMs ?? 60 * 60 * 1000,
      lastMessagePath: join(run, 'last-message.json'),
    });
    const completedAt = now();

    // Copy every input/output into the repository record before interpreting anything.
    mkdirSync(out, { recursive: true });
    copyFileSync(join(run, 'packet', 'packet.json'), join(out, 'reviewer-packet.json'));
    copyFileSync(join(run, 'prompt.txt'), join(out, 'prompt.txt'));
    copyFileSync(join(run, 'output-schema.json'), join(out, 'output-schema.json'));
    writeFileSync(join(out, route.direction === 'A' ? 'stdout.txt' : 'stdout.json'), result.stdout);
    writeFileSync(join(out, 'stderr.txt'), result.stderr);
    if (route.direction === 'A' && existsSync(join(run, 'last-message.json'))) copyFileSync(join(run, 'last-message.json'), join(out, 'last-message.json'));

    const problems: string[] = [];
    let resolved: Record<string, unknown> = {};
    let reviewer: unknown;
    if (result.timedOut) problems.push(`${route.tool} timed out`);
    if (result.exitCode !== 0) problems.push(`${route.tool} exited with ${String(result.exitCode)}`);
    try {
      if (route.direction === 'A') {
        resolved = { banner: codexBanner(result.stderr), commandsExecutedByReviewer: codexCommands(result.stderr) };
        if (!existsSync(join(run, 'last-message.json'))) throw new Error('codex wrote no last-message.json');
        reviewer = extractJson(readFileSync(join(run, 'last-message.json'), 'utf8'));
      } else {
        const envelope = JSON.parse(result.stdout) as Record<string, unknown>;
        const usage = (envelope.modelUsage ?? {}) as Record<string, { canonicalModel?: string; costUSD?: number }>;
        resolved = {
          models: Object.keys(usage),
          canonicalModels: Object.values(usage).map((u) => u.canonicalModel),
          sessionId: envelope.session_id,
          numTurns: envelope.num_turns,
          isError: envelope.is_error,
          subtype: envelope.subtype,
          durationMs: envelope.duration_ms,
          totalCostUsdListBasis: envelope.total_cost_usd,
        };
        if (envelope.is_error === true) throw new Error(`claude reported an error: ${String(envelope.subtype ?? envelope.result ?? '')}`);
        reviewer = envelope.structured_output ?? JSON.parse(String(envelope.result ?? ''));
      }
    } catch (error) {
      problems.push((error as Error).message);
    }

    let status: RunReviewResult['status'] = problems.length > 0 ? 'failed' : 'completed';
    let report: StoredReport | undefined;
    let counts: Record<string, number> | undefined;
    if (status === 'completed') {
      const shapeError = validateReviewerOutput(schemaText, reviewer);
      const verdicts = ((reviewer as { cases?: ReviewerVerdict[] }).cases ?? []) as ReviewerVerdict[];
      const mapped = mapVerdicts(packet, verdicts);
      if (shapeError) problems.push(`reviewer output does not match review-output.schema.json: ${shapeError}`);
      if (mapped.missingItems.length > 0) problems.push(`reviewer skipped ${mapped.missingItems.length} case(s): ${mapped.missingItems.map((m) => `${m.kind}:${m.logicalId}`).join(', ')}`);
      if (mapped.unexpectedItems.length > 0) problems.push(`reviewer returned unknown case(s): ${mapped.unexpectedItems.map((u) => u.logicalId).join(', ')}`);
      if (mapped.duplicates.length > 0) problems.push(`reviewer returned duplicate case(s): ${mapped.duplicates.join(', ')}`);
      if (problems.length > 0) status = 'invalid-report';
      const meta = { provider: route.provider, model, effort, completedAt: completedAt.toISOString() };
      const summary = summaryReviewReport(packet, mapped.items, meta);
      const routeMeta: RouteMetadata = {
        direction: route.direction,
        provider: route.provider,
        tool: route.tool,
        promptVersion: route.promptVersion,
        promptTemplate: { path: route.promptFile.slice(REPO_ROOT.length + 1), sha256: route.promptSha256 },
        outputSchema: { path: route.schemaFile.slice(REPO_ROOT.length + 1), sha256: route.schemaSha256 },
        promptAsSentSha256: promptSha256,
        reviewerPacketSha256: sha256Hex(packetBytes),
        argv: [bin, ...argv],
        env,
        cwd: join(run, 'packet'),
        workingDirectoryContents,
        cliVersion,
        requestedModel: model,
        requestedEffort: effort,
        resolved,
      };
      report = {
        schemaVersion: 2,
        batchId: packet.batchId,
        packetHash: packet.packetHash,
        reviewReport: summary.report,
        ...(summary.note ? { reviewReportNote: summary.note } : {}),
        route: routeMeta,
        reviewer: { cases: verdicts },
        items: mapped.items,
        missingItems: mapped.missingItems,
        unexpectedItems: mapped.unexpectedItems,
        missingVerdicts: [],
      };
      counts = {
        cases: verdicts.length,
        valid: mapped.items.filter((i) => i.verdict === 'valid').length,
        flawed: mapped.items.filter((i) => i.verdict === 'flawed').length,
        uncertain: mapped.items.filter((i) => i.verdict === 'uncertain').length,
        blocking: mapped.items.filter((i) => i.severity === 'blocking').length,
      };
    }

    let receiptId: string | undefined;
    if (report) writeFileSync(join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    if (report && status === 'completed') {
      const key = loadOrCreateKey(options.keysDir ?? resolveKeysDir());
      const receipt = signReceipt(
        { jobId, provider: route.provider, model, effort, artifactHash: packet.packetHash, reportHash: canonicalSha256(report), completedAt: completedAt.toISOString() },
        key,
      );
      writeFileSync(join(out, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
      receiptId = receipt.id;
    }
    const files: Record<string, string> = {};
    for (const name of readdirSync(out).sort()) files[name] = sha256Hex(readFileSync(join(out, name)));
    const runRecord = {
      schemaVersion: 2,
      batchId: options.batchId,
      jobId,
      status,
      problems,
      packetHash: packet.packetHash,
      direction: route.direction,
      promptVersion: route.promptVersion,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      command: { display, bin: resolvedBin, argv, env, cwd: join(run, 'packet'), stdin: 'prompt.txt' },
      cliVersion,
      resolved,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      counts: counts ?? null,
      files,
      receiptId: receiptId ?? null,
    };
    writeFileSync(join(out, 'run.json'), `${JSON.stringify(runRecord, null, 2)}\n`);
    return { ok: status === 'completed', status, jobId, runDir: out, ...(receiptId ? { receiptId } : {}), argv: display, promptSha256, problems, ...(counts ? { counts } : {}) };
  } finally {
    if (!options.keepTemp) rmSync(run, { recursive: true, force: true });
  }
}

export const runCodexReview = (options: Omit<RunReviewOptions, 'direction'>): Promise<RunReviewResult> => runReview({ ...options, direction: 'A' });
export const runClaudeReview = (options: Omit<RunReviewOptions, 'direction'>): Promise<RunReviewResult> => runReview({ ...options, direction: 'B' });
