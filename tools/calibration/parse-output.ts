// Parses one reviewer run into parsed.json + run-meta.json + hashes.json, validating the reviewer JSON against the
// strict output schema and the packet's case list. Model identity is taken from the tools' own output (codex stderr
// banner; claude JSON envelope modelUsage), never from the flags we passed.
// Usage: node tools/calibration/parse-output.ts <run-dir> <a|b>
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);

interface ReviewCase {
  caseId: string;
  reviewerAnswer: string;
  verdict: 'valid' | 'flawed' | 'uncertain';
  blocking: 'yes' | 'no';
  element: string;
  defect: string;
  correction: string;
  sources: string[];
  notes: string;
}

function sha256File(path: string): string | null {
  return existsSync(path) ? createHash('sha256').update(readFileSync(path)).digest('hex') : null;
}

/** Fields of the codex banner printed to stderr at startup (non-JSON mode). */
export function codexBanner(stderr: string): Record<string, string> {
  const out: Record<string, string> = {};
  const header = stderr.split('\n--------\n')[1] ?? '';
  for (const line of header.split('\n')) {
    const m = /^([a-z ]+):\s+(.*)$/.exec(line.trim());
    if (m?.[1] && m[2] !== undefined) out[m[1]] = m[2];
  }
  const version = /^OpenAI Codex (v[\w.]+)/m.exec(stderr)?.[1];
  if (version) out.version = version;
  const tokens = /\ntokens used\n([\d,]+)/.exec(stderr)?.[1];
  if (tokens) out['tokens used'] = tokens;
  return out;
}

/** Shell commands the codex agent executed (non-JSON transcript marks them with an `exec` line). */
export function codexCommands(stderr: string): string[] {
  const lines = stderr.split('\n');
  const cmds: string[] = [];
  for (let i = 0; i < lines.length; i += 1) if (lines[i]?.trim() === 'exec' && lines[i + 1]) cmds.push((lines[i + 1] ?? '').trim());
  return cmds;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [runArg, direction] = process.argv.slice(2);
  if (!runArg || (direction !== 'a' && direction !== 'b')) {
    console.error('usage: parse-output.ts <run-dir> <a|b>');
    process.exit(2);
  }
  const run = resolve(runArg);
  const read = (f: string): string => (existsSync(join(run, f)) ? readFileSync(join(run, f), 'utf8') : '');
  let reviewer: unknown;
  let meta: Record<string, unknown>;
  if (direction === 'a') {
    const stderr = read('stderr.txt');
    const banner = codexBanner(stderr);
    reviewer = JSON.parse(read('last-message.json'));
    meta = {
      direction: 'A',
      tool: 'codex exec',
      cliVersion: read('cli-version.txt').trim(),
      resolved: banner,
      commandsExecutedByReviewer: codexCommands(stderr),
      exitCode: Number.parseInt(read('exit-code.txt'), 10),
      startedAt: read('started-at.txt').trim(),
      finishedAt: read('finished-at.txt').trim(),
      command: read('command.txt').trim(),
    };
  } else {
    const env = JSON.parse(read('stdout.json')) as Record<string, unknown>;
    reviewer = env.structured_output ?? JSON.parse(String(env.result ?? ''));
    const usage = (env.modelUsage ?? {}) as Record<string, { canonicalModel?: string; costUSD?: number }>;
    meta = {
      direction: 'B',
      tool: 'claude -p',
      cliVersion: read('cli-version.txt').trim(),
      resolved: {
        models: Object.keys(usage),
        canonicalModels: Object.values(usage).map((u) => u.canonicalModel),
        sessionId: env.session_id,
        numTurns: env.num_turns,
        isError: env.is_error,
        subtype: env.subtype,
        terminalReason: env.terminal_reason,
        permissionDenials: env.permission_denials,
        durationMs: env.duration_ms,
        totalCostUsdListBasis: env.total_cost_usd,
        usage: env.usage,
      },
      exitCode: Number.parseInt(read('exit-code.txt'), 10),
      startedAt: read('started-at.txt').trim(),
      finishedAt: read('finished-at.txt').trim(),
      command: read('command.txt').trim(),
    };
  }
  const Ajv2020 = require('ajv/dist/2020').default as typeof import('ajv').default;
  const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
  const validate = ajv.compile(JSON.parse(read('output-schema.json')) as Record<string, unknown>);
  const schemaOk = validate(reviewer);
  const packet = JSON.parse(read('packet/packet.json')) as { cases: Array<{ caseId: string }> };
  const expected = packet.cases.map((c) => c.caseId);
  const got = ((reviewer as { cases?: ReviewCase[] }).cases ?? []).map((c) => c.caseId);
  const coverage = {
    schemaValid: schemaOk,
    schemaErrors: schemaOk ? [] : validate.errors,
    expectedCases: expected.length,
    returnedCases: got.length,
    missing: expected.filter((id) => !got.includes(id)),
    unexpected: got.filter((id) => !expected.includes(id)),
    duplicates: got.filter((id, i) => got.indexOf(id) !== i),
    inPacketOrder: JSON.stringify(got) === JSON.stringify(expected),
  };
  writeFileSync(join(run, 'parsed.json'), `${JSON.stringify(reviewer, null, 2)}\n`);
  writeFileSync(join(run, 'run-meta.json'), `${JSON.stringify({ ...meta, coverage }, null, 2)}\n`);
  const files = ['prompt.txt', 'output-schema.json', 'packet/packet.json', 'command.txt', 'stdout.txt', 'stdout.json', 'stderr.txt', 'last-message.json', 'parsed.json'];
  const hashes = Object.fromEntries(files.filter((f) => existsSync(join(run, f))).map((f) => [f, sha256File(join(run, f))]));
  writeFileSync(join(run, 'hashes.json'), `${JSON.stringify(hashes, null, 2)}\n`);
  console.log(JSON.stringify({ run, resolved: meta.resolved, coverage: { ...coverage, schemaErrors: undefined } }, null, 2));
  process.exit(schemaOk && coverage.missing.length === 0 && coverage.unexpected.length === 0 ? 0 : 1);
}
