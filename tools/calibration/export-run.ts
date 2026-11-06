// Copies one reviewer run's evidence into the repository (content/reviews/calibration/runs/<runId>/).
// Local absolute paths are redacted (public reports carry redacted paths only, docs/ACCEPTANCE.md); every exported
// file records the SHA-256 of the raw file and of the committed copy. Prompts-as-sent are stored once per hash under
// runs/prompts-as-sent/<sha256>.txt because several runs send byte-identical prompts.
// Usage: node tools/calibration/export-run.ts <run-dir> <runId> [<calibration-dir>]
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILES = ['command.txt', 'cli-version.txt', 'started-at.txt', 'finished-at.txt', 'exit-code.txt', 'input-manifest.json',
  'stdout.txt', 'stdout.json', 'stderr.txt', 'last-message.json', 'parsed.json', 'run-meta.json', 'hashes.json'];

function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function redact(text: string, runDir: string): string {
  const parent = dirname(runDir);
  return text
    .split(runDir).join('<run>')
    .split(parent).join('<runs>')
    .replace(/\/(?:private\/)?tmp\/[^\s"'<>]*/g, '<tmp>')
    .replace(/\/var\/folders\/[^\s"'<>]*/g, '<tmp>')
    .split(homedir()).join('~');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [runArg, runId, calArg] = process.argv.slice(2);
  if (!runArg || !runId) {
    console.error('usage: export-run.ts <run-dir> <runId> [<calibration-dir>]');
    process.exit(2);
  }
  const run = resolve(runArg);
  const cal = resolve(calArg ?? join(root, 'content', 'reviews', 'calibration'));
  const dest = join(cal, 'runs', runId);
  const promptDir = join(cal, 'runs', 'prompts-as-sent');
  mkdirSync(dest, { recursive: true });
  mkdirSync(promptDir, { recursive: true });
  const evidence: Record<string, { rawSha256: string; committedSha256: string; redacted: boolean; bytes: number }> = {};
  const prompt = readFileSync(join(run, 'prompt.txt'));
  const promptHash = sha256(prompt);
  const promptFile = join(promptDir, `${promptHash}.txt`);
  if (!existsSync(promptFile)) writeFileSync(promptFile, prompt);
  evidence['prompt.txt'] = { rawSha256: promptHash, committedSha256: promptHash, redacted: false, bytes: prompt.length };
  for (const f of FILES) {
    const src = join(run, f);
    if (!existsSync(src)) continue;
    const raw = readFileSync(src);
    const out = Buffer.from(redact(raw.toString('utf8'), run), 'utf8');
    writeFileSync(join(dest, f), out);
    evidence[f] = { rawSha256: sha256(raw), committedSha256: sha256(out), redacted: !out.equals(raw), bytes: out.length };
  }
  const leftovers = Object.keys(evidence).filter((f) => f !== 'prompt.txt'
    && /\/Users\/|\/private\/tmp|\/var\/folders/.test(readFileSync(join(dest, f), 'utf8')));
  writeFileSync(join(dest, 'evidence.json'), `${JSON.stringify({
    runId,
    promptAsSent: `runs/prompts-as-sent/${promptHash}.txt`,
    note: 'rawSha256 = SHA-256 of the file as produced by the run; committedSha256 = SHA-256 of the copy in this directory after path redaction.',
    files: evidence,
  }, null, 2)}\n`);
  console.log(`${runId}: exported ${Object.keys(evidence).length} files to ${dest}; unredacted paths left: ${leftovers.length}`);
  process.exit(leftovers.length ? 1 : 0);
}
