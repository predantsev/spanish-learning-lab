// Executes the opposite-provider (OpenAI) text review of a packet through the local Codex CLI:
//   codex exec --cd <repo> --sandbox read-only -m <model> -c model_reasoning_effort=<effort>
//              --ephemeral --json -o <run>/last-message.txt --output-schema <batch>/report-schema.json -
// The prompt goes over stdin. The machine's `codex` wrapper (~/.local/bin/codex) prepends an English
// directive only to a positional prompt and passes a stdin prompt through untouched (its debug note
// is captured from stderr into run.json), so this tool includes the same English directive itself
// and stores prompt.txt byte-for-byte as sent. Only an actual execution produces a receipt; there is
// no way to import a pasted report.
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { accessSync, constants, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { createRequire } from 'node:module';
import type { ValidateFunction } from 'ajv';
import { createContractValidator } from '@sll/contracts';
import type { ReviewReport } from '@sll/contracts';
import { canonicalSha256, sha256Hex } from '../content/canonical.ts';
import { ENTITY_KINDS, MODALITIES } from '../content/types.ts';
import type { EntityKind, Modality } from '../content/types.ts';
import { loadOrCreateKey, resolveKeysDir } from './keys.ts';
import { signReceipt } from './receipts.ts';
import { FINDING_CATEGORIES, batchDir, packetHashOf, readPacket, runDir } from './store.ts';
import type { ItemFinding, ReportItem, ReviewPacket, Severity, StoredReport } from './store.ts';

export const DEFAULT_MODEL = 'gpt-6.1-sol';
export const DEFAULT_EFFORT = 'xhigh';
export const LANGUAGE_DIRECTIVE = 'Respond in English. This output is consumed by another agent, not read by a person.';
const PROVIDER = 'openai';

/** Final-message schema given to `codex exec --output-schema` (strict structured-output subset). */
export const MODEL_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'verdicts', 'sources', 'uncertainties', 'findings'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'logicalId', 'contentHash', 'severity', 'findings'],
        properties: {
          kind: { type: 'string', enum: [...ENTITY_KINDS] },
          logicalId: { type: 'string' },
          contentHash: { type: 'string' },
          severity: { type: 'string', enum: ['blocking', 'minor', 'none'] },
          findings: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['severity', 'category', 'location', 'description', 'suggestion'],
              properties: {
                severity: { type: 'string', enum: ['blocking', 'minor'] },
                category: { type: 'string', enum: [...FINDING_CATEGORIES] },
                location: { type: 'string' },
                description: { type: 'string' },
                suggestion: { type: 'string' },
              },
            },
          },
        },
      },
    },
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['skillId', 'modality', 'correctness', 'explanationKey'],
        properties: {
          skillId: { type: 'string' },
          modality: { type: 'string', enum: [...MODALITIES] },
          correctness: { type: 'string', enum: ['correct', 'incorrect', 'unresolved', 'invalid-item'] },
          explanationKey: { type: 'string' },
        },
      },
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['url', 'passage', 'finding'],
        properties: { url: { type: 'string' }, passage: { type: 'string' }, finding: { type: 'string' } },
      },
    },
    uncertainties: { type: 'array', items: { type: 'string' } },
    findings: { type: 'array', items: { type: 'string' } },
  },
} as const;

export interface ModelOutput {
  items: Array<{ kind: EntityKind; logicalId: string; contentHash: string; severity: Severity; findings: ItemFinding[] }>;
  verdicts: Array<{ skillId: string; modality: Modality; correctness: 'correct' | 'incorrect' | 'unresolved' | 'invalid-item'; explanationKey: string }>;
  sources: Array<{ url: string; passage: string; finding: string }>;
  uncertainties: string[];
  findings: string[];
}

export interface RunnerInput {
  bin: string;
  argv: string[];
  stdin: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
  /** Where `-o` asks codex to write the last message. */
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
    const child = spawn(input.bin, input.argv, { cwd: input.cwd, env: input.env, stdio: ['pipe', 'pipe', 'pipe'] });
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

export function buildPrompt(packet: ReviewPacket): string {
  const i = packet.instructions;
  return [
    LANGUAGE_DIRECTIVE,
    '',
    '# Task',
    i.role,
    'You run read-only inside the course repository. You may read files (for example content/README.md and docs/CONTENT-PLAN.md) and consult external references if your tools allow it. Do not modify anything.',
    '',
    '## Look specifically for',
    ...i.duties.map((d, n) => `${n + 1}. ${d}`),
    '',
    '## Severity',
    ...Object.entries(i.severity).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## Checking rules the application applies',
    ...i.checkingRules.map((r) => `- ${r}`),
    '',
    '## Evidence rules',
    ...i.evidenceRules.map((r) => `- ${r}`),
    '',
    '## Output',
    'Return exactly one JSON object and nothing else (no prose, no code fence):',
    '- items: one entry for EVERY entry of packet.items, copying kind, logicalId and contentHash exactly; severity = the worst of its findings ("none" when findings is empty); findings[] = {severity: blocking|minor, category: one of ' +
      FINDING_CATEGORIES.join(', ') +
      ', location: path inside the item such as "accepted[1].text", description, suggestion ("" when none)}.',
    '- verdicts: one entry for EVERY target in packet.targets ("skillId/modality" split into skillId and modality): correctness = correct (no blocking defect affects this target) | incorrect (a blocking defect affects it) | unresolved (evidence insufficient) | invalid-item (an item for this target is unusable as written); explanationKey = content-review.ok | content-review.defect | content-review.uncertain | content-review.invalid respectively.',
    '- sources: at least one reference you actually consulted: {url (https), passage (an exact short quote you read, at most 300 characters, or "not retrieved"), finding (what it supports or contradicts)}.',
    '- uncertainties: claims you could not verify (may be empty).',
    '- findings: short overall summary lines (may be empty).',
    '',
    `## Packet (packetHash ${packet.packetHash})`,
    JSON.stringify(packet, null, 2),
    '',
  ].join('\n');
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
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1]);
    } catch {
      // fall through
    }
  }
  for (let start = trimmed.indexOf('{'); start >= 0; start = trimmed.indexOf('{', start + 1)) {
    let depth = 0;
    let inString = false;
    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (inString) {
        if (ch === '\\') i++;
        else if (ch === '"') inString = false;
      } else if (ch === '"') inString = true;
      else if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) {
        try {
          return JSON.parse(trimmed.slice(start, i + 1));
        } catch {
          break;
        }
      }
    }
  }
  throw new Error('no JSON object found in the final message');
}

export interface ParsedEvents {
  threadId?: string;
  usage: Record<string, number>;
  agentMessages: string[];
  errors: string[];
  eventCount: number;
}

export function parseEvents(stdout: string): ParsedEvents {
  const out: ParsedEvents = { usage: {}, agentMessages: [], errors: [], eventCount: 0 };
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    let ev: Record<string, any>;
    try {
      ev = JSON.parse(line) as Record<string, any>;
    } catch {
      continue;
    }
    out.eventCount++;
    if (ev.type === 'thread.started' && typeof ev.thread_id === 'string') out.threadId = ev.thread_id;
    if (ev.type === 'turn.completed' && ev.usage && typeof ev.usage === 'object') {
      for (const [k, v] of Object.entries(ev.usage as Record<string, unknown>)) if (typeof v === 'number') out.usage[k] = (out.usage[k] ?? 0) + v;
    }
    if (ev.type === 'item.completed' && ev.item?.type === 'agent_message' && typeof ev.item.text === 'string') out.agentMessages.push(ev.item.text);
    if (ev.type === 'item.completed' && ev.item?.type === 'error') out.errors.push(String(ev.item.message ?? 'error item'));
    if (ev.type === 'error' || ev.type === 'turn.failed') out.errors.push(JSON.stringify(ev.error ?? ev).slice(0, 600));
  }
  return out;
}

let outputValidator: ValidateFunction | undefined;
function validateModelOutput(value: unknown): string | undefined {
  if (!outputValidator) {
    const require = createRequire(import.meta.url);
    const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
    outputValidator = new Ajv2020({ strict: true, allErrors: true }).compile(MODEL_OUTPUT_SCHEMA);
  }
  if (outputValidator(value)) return undefined;
  return (outputValidator.errors ?? []).slice(0, 5).map((e) => `${e.instancePath || '/'} ${e.message ?? ''}`).join('; ');
}

const SEVERITY_RANK: Record<Severity, number> = { none: 0, minor: 1, blocking: 2 };
const clip = (text: string, max: number): string => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

/** Assembles the stored report; provider/model/effort/hashes come from the tool, never the model. */
export function assembleReport(packet: ReviewPacket, output: ModelOutput, meta: { model: string; effort: string; completedAt: string }): { report: StoredReport; rejectedSources: unknown[] } {
  const packetItems = new Map(packet.items.map((p) => [`${p.kind}|${p.logicalId}`, p]));
  const items: ReportItem[] = [];
  const unexpected: StoredReport['unexpectedItems'] = [];
  for (const item of output.items) {
    const p = packetItems.get(`${item.kind}|${item.logicalId}`);
    if (!p || p.contentHash !== item.contentHash || items.some((x) => x.kind === item.kind && x.logicalId === item.logicalId)) {
      unexpected.push({ kind: item.kind, logicalId: item.logicalId });
      continue;
    }
    const worst = item.findings.reduce<Severity>((acc, f) => (SEVERITY_RANK[f.severity] > SEVERITY_RANK[acc] ? f.severity : acc), 'none');
    const severity = SEVERITY_RANK[worst] > SEVERITY_RANK[item.severity] ? worst : item.severity;
    items.push({ kind: item.kind, logicalId: item.logicalId, contentHash: item.contentHash, severity, declaredSeverity: item.severity, findings: item.findings });
  }
  const covered = new Set(items.map((i) => `${i.kind}|${i.logicalId}`));
  const missingItems = packet.items.filter((p) => !covered.has(`${p.kind}|${p.logicalId}`)).map((p) => ({ kind: p.kind, logicalId: p.logicalId }));

  const missingVerdicts: string[] = [];
  const verdicts = packet.targets.map((key) => {
    const slash = key.lastIndexOf('/');
    const skillId = key.slice(0, slash);
    const modality = key.slice(slash + 1) as Modality;
    const v = output.verdicts.find((x) => x.skillId === skillId && x.modality === modality);
    if (!v) missingVerdicts.push(key);
    return {
      target: { skillId, modality },
      correctness: v?.correctness ?? ('unresolved' as const),
      independence: 'not-assessed' as const,
      explanationKey: clip(v?.explanationKey || 'content-review.no-verdict', 150),
    };
  });

  const rejectedSources: unknown[] = [];
  const sources = output.sources
    .filter((s) => {
      const ok = /^https:\/\/\S+$/.test(s.url) && s.url.length <= 2048 && s.passage.trim().length > 0 && s.finding.trim().length > 0;
      if (!ok) rejectedSources.push(s);
      return ok;
    })
    .slice(0, 30)
    .map((s) => ({ url: s.url, passage: clip(s.passage, 1500), checkedAt: meta.completedAt, finding: clip(s.finding, 1000) }));

  const itemLines = items
    .flatMap((i) => i.findings.map((f) => ({ rank: SEVERITY_RANK[f.severity], text: `[${f.severity}] ${i.kind} ${i.logicalId} (${f.category}) ${f.location}: ${f.description}` })))
    .sort((a, b) => b.rank - a.rank)
    .map((x) => x.text);
  const findings = [...output.findings, ...itemLines].filter((f) => f.trim().length > 0).slice(0, 50).map((f) => clip(f, 1500));

  const reviewReport: ReviewReport = {
    provider: PROVIDER,
    model: meta.model,
    effort: meta.effort,
    reviewedAt: meta.completedAt,
    artifactHash: packet.packetHash,
    authorProvider: packet.authorProvider,
    verdicts,
    sources,
    uncertainties: output.uncertainties.filter((u) => u.trim().length > 0).slice(0, 30).map((u) => clip(u, 1500)),
    findings,
  };
  return {
    report: { schemaVersion: 1, batchId: packet.batchId, packetHash: packet.packetHash, reviewReport, items, missingItems, unexpectedItems: unexpected, missingVerdicts },
    rejectedSources,
  };
}

export interface RunCodexOptions {
  reviewsDir: string;
  batchId: string;
  repoRoot: string;
  model?: string;
  effort?: string;
  keysDir?: string;
  runner?: Runner;
  versionProbe?: (bin: string) => string;
  codexBin?: string;
  useOutputSchema?: boolean;
  timeoutMs?: number;
  dryRun?: boolean;
  now?: () => Date;
}

export interface RunCodexResult {
  ok: boolean;
  status: 'dry-run' | 'completed' | 'failed' | 'invalid-report';
  jobId?: string;
  runDir?: string;
  receiptId?: string;
  argv: string[];
  promptSha256: string;
  problems: string[];
}

export async function runCodexReview(options: RunCodexOptions): Promise<RunCodexResult> {
  const packet = readPacket(options.reviewsDir, options.batchId);
  if (packetHashOf(packet) !== packet.packetHash) throw new Error(`packet ${options.batchId} does not match its packetHash; rebuild the packet`);
  if (packet.authorProvider === PROVIDER) {
    throw new Error(`packet author provider is ${PROVIDER}; a Codex review would not be an opposite-provider review`);
  }
  const model = options.model ?? DEFAULT_MODEL;
  const effort = options.effort ?? DEFAULT_EFFORT;
  const now = options.now ?? (() => new Date());
  const jobId = randomUUID();
  const dir = runDir(options.reviewsDir, options.batchId, jobId);
  const schemaPath = join(batchDir(options.reviewsDir, options.batchId), 'report-schema.json');
  const lastMessagePath = join(dir, 'last-message.txt');
  const prompt = buildPrompt(packet);
  const promptSha256 = sha256Hex(Buffer.from(prompt, 'utf8'));
  const useSchema = options.useOutputSchema ?? true;
  const argv = [
    'exec',
    '--cd',
    options.repoRoot,
    '--sandbox',
    'read-only',
    '-m',
    model,
    '-c',
    `model_reasoning_effort=${effort}`,
    '--ephemeral',
    '--json',
    '-o',
    lastMessagePath,
    ...(useSchema ? ['--output-schema', schemaPath] : []),
    ...(existsSync(join(options.repoRoot, '.git')) ? [] : ['--skip-git-repo-check']),
    '-',
  ];
  const bin = options.codexBin ?? 'codex';
  if (options.dryRun) return { ok: true, status: 'dry-run', argv: [bin, ...argv], promptSha256, problems: [] };

  mkdirSync(dir, { recursive: true });
  const schemaText = `${JSON.stringify(MODEL_OUTPUT_SCHEMA, null, 2)}\n`;
  if (!existsSync(schemaPath)) writeFileSync(schemaPath, schemaText);
  writeFileSync(join(dir, 'prompt.txt'), prompt);
  const resolvedBin = resolveOnPath(bin) ?? bin;
  const probe = options.versionProbe ?? ((b: string) => spawnSync(b, ['--version'], { encoding: 'utf8' }).stdout.trim());
  let codexVersion = '';
  try {
    codexVersion = probe(resolvedBin);
  } catch (error) {
    codexVersion = `unavailable: ${String(error)}`;
  }
  const startedAt = now();
  const result = await (options.runner ?? spawnRunner)({
    bin: resolvedBin,
    argv,
    stdin: prompt,
    cwd: options.repoRoot,
    env: { ...process.env, CODEX_WRAPPER_DEBUG: '1' },
    timeoutMs: options.timeoutMs ?? 45 * 60 * 1000,
    lastMessagePath,
  });
  const completedAt = now();
  writeFileSync(join(dir, 'events.jsonl'), result.stdout);
  writeFileSync(join(dir, 'stderr.txt'), result.stderr);
  const events = parseEvents(result.stdout);
  let lastMessageSource = 'output-last-message';
  if (!existsSync(lastMessagePath) && events.agentMessages.length > 0) {
    writeFileSync(lastMessagePath, events.agentMessages.at(-1) ?? '');
    lastMessageSource = 'events (agent_message)';
  }
  const lastMessage = existsSync(lastMessagePath) ? readFileSync(lastMessagePath, 'utf8') : '';

  const problems: string[] = [];
  let status: RunCodexResult['status'] = 'completed';
  let report: StoredReport | undefined;
  let rejectedSources: unknown[] = [];
  if (result.timedOut) problems.push('codex exec timed out');
  if (result.exitCode !== 0) problems.push(`codex exec exited with ${String(result.exitCode)}`);
  if (events.errors.length > 0) problems.push(...events.errors.map((e) => `event error: ${e}`));
  if (!lastMessage.trim()) problems.push('no final message');
  if (problems.length > 0) status = 'failed';
  else {
    try {
      const output = extractJson(lastMessage);
      const shapeError = validateModelOutput(output);
      if (shapeError) throw new Error(`final message does not match report-schema.json: ${shapeError}`);
      const assembled = assembleReport(packet, output as ModelOutput, { model, effort, completedAt: completedAt.toISOString() });
      report = assembled.report;
      rejectedSources = assembled.rejectedSources;
      const check = createContractValidator().validate('ReviewReport', report.reviewReport);
      if (!check.ok) throw new Error(`assembled ReviewReport violates the contract: ${check.errors[0]?.instancePath ?? ''} ${check.errors[0]?.message ?? ''}`);
    } catch (error) {
      status = 'invalid-report';
      problems.push((error as Error).message);
    }
  }

  let receiptId: string | undefined;
  const files: Record<string, string> = {};
  if (report && status === 'completed') {
    writeFileSync(join(dir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    const key = loadOrCreateKey(options.keysDir ?? resolveKeysDir());
    const receipt = signReceipt(
      { jobId, provider: PROVIDER, model, effort, artifactHash: packet.packetHash, reportHash: canonicalSha256(report), completedAt: completedAt.toISOString() },
      key,
    );
    writeFileSync(join(dir, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
    receiptId = receipt.id;
  }
  for (const name of ['prompt.txt', 'events.jsonl', 'stderr.txt', 'last-message.txt', 'report.json', 'receipt.json']) {
    if (existsSync(join(dir, name))) files[name] = sha256Hex(readFileSync(join(dir, name)));
  }
  const wrapperNotes = result.stderr.split('\n').filter((l) => l.startsWith('[codex-wrapper]'));
  const run = {
    schemaVersion: 1,
    batchId: options.batchId,
    jobId,
    status,
    problems,
    packetHash: packet.packetHash,
    reportSchemaSha256: sha256Hex(Buffer.from(readFileSync(schemaPath, 'utf8'), 'utf8')),
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    command: { bin: resolvedBin, argv, stdin: 'prompt.txt' },
    codexVersion,
    wrapper: {
      notes: wrapperNotes,
      behavior:
        'The local codex wrapper prepends an English directive to a positional prompt only; this tool sends the prompt over stdin with the directive already included, so prompt.txt is exactly what codex received.',
    },
    provider: PROVIDER,
    model,
    effort,
    modelSource: 'requested with -m; codex exec --json does not report the served model independently',
    threadId: events.threadId ?? null,
    usage: events.usage,
    eventCount: events.eventCount,
    exitCode: result.exitCode,
    timedOut: result.timedOut,
    lastMessageSource,
    rejectedSources,
    files,
    receiptId: receiptId ?? null,
  };
  writeFileSync(join(dir, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
  return { ok: status === 'completed', status, jobId, runDir: dir, ...(receiptId ? { receiptId } : {}), argv: [resolvedBin, ...argv], promptSha256, problems };
}
