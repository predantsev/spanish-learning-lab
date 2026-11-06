// npm run release:check — verifies a built release folder against release/release-manifest.json (every file's
// SHA-256/size/mode and every symlink target, nothing missing, nothing extra), refuses private/runtime material,
// checks the bundled Node version, and runs `sll status` as a smoke test against a throwaway SLL_HOME and HOME
// (never the real profile). Placeholders (no dist/web or no --pack) fail unless --allow-placeholders is given.
//   node tools/release/check.ts [--release <dir>] [--allow-placeholders]
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, walk, type ManifestFileEntry, type ReleaseManifest } from './build.ts';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Paths that must never ship: profiles, runtime/IPC files, credentials, environment files. */
const FORBIDDEN = [
  /\.sqlite(-wal|-shm|-journal)?$/,
  /(^|\/)runtime\.json$/,
  /(^|\/)ipc\.(key|sock)$/,
  /(^|\/)profile\.lock$/,
  /(^|\/)restore-journal\.json$/,
  /(^|\/)\.env(\..*)?$/,
  /\.(pem|key|p12)$/,
  /(^|\/)review-hmac\.key$/,
  /(^|\/)Library\/Application Support\//,
];

export interface CheckResult {
  readonly errors: string[];
  readonly warnings: string[];
}

export function checkRelease(releaseDir: string, opts: { allowPlaceholders: boolean }): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const manifestPath = join(releaseDir, 'release-manifest.json');
  if (!existsSync(manifestPath)) return { errors: [`no release manifest at ${manifestPath}; run node tools/release/build.ts first`], warnings };
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ReleaseManifest;
  const folder = join(releaseDir, manifest.folder);
  if (!existsSync(folder)) return { errors: [`release folder missing: ${folder}`], warnings };

  const expected = new Map<string, ManifestFileEntry>(manifest.files.map((f) => [f.path, f]));
  const actual = walk(folder);
  for (const rel of actual) {
    const want = expected.get(rel);
    if (!want) {
      errors.push(`unexpected file: ${rel}`);
      continue;
    }
    const got = describe(folder, rel);
    if (want.symlink !== undefined || got.symlink !== undefined) {
      if (want.symlink !== got.symlink) errors.push(`symlink changed: ${rel}`);
    } else if (want.sha256 !== got.sha256 || want.bytes !== got.bytes) errors.push(`content changed: ${rel}`);
    else if (want.mode !== got.mode) errors.push(`mode changed: ${rel} (${String(got.mode)} != ${String(want.mode)})`);
    expected.delete(rel);
  }
  for (const rel of expected.keys()) errors.push(`missing file: ${rel}`);
  for (const rel of actual) if (FORBIDDEN.some((re) => re.test(rel))) errors.push(`forbidden private/runtime file in release: ${rel}`);
  for (const must of ['Start.command', 'README-UK.md', 'THIRD-PARTY-NOTICES.txt', 'runtime/node/bin/node', 'runtime/node/LICENSE', 'app/bin/sll.mjs', 'app/dist/web/index.html', 'app/content/pack/pack.json']) {
    if (!actual.includes(must)) errors.push(`required file missing: ${must}`);
  }
  const start = manifest.files.find((f) => f.path === 'Start.command');
  if (start?.mode !== '0755') errors.push('Start.command is not executable (0755)');

  const node = join(folder, 'runtime', 'node', 'bin', 'node');
  if (existsSync(node)) {
    const v = spawnSync(node, ['--version'], { encoding: 'utf8' });
    if (v.stdout.trim() !== manifest.node.version) errors.push(`bundled node reports ${v.stdout.trim() || v.error?.message}, manifest says ${manifest.node.version}`);

    // Smoke: `sll status` with a throwaway SLL_HOME and HOME; a fresh install is "not running" (exit 3).
    const tmp = mkdtempSync(join(tmpdir(), 'sll-rc-'));
    try {
      const env = { PATH: '/usr/bin:/bin', HOME: tmp, SLL_HOME: join(tmp, 'home'), LANG: 'C' };
      const st = spawnSync(node, [join(folder, 'app', 'bin', 'sll.mjs'), 'status', '--json'], { env, encoding: 'utf8', timeout: 20_000 });
      let parsed: { running?: unknown } | undefined;
      try {
        parsed = JSON.parse(st.stdout.trim()) as { running?: unknown };
      } catch {
        parsed = undefined;
      }
      if (st.status !== 3 || parsed?.running !== false) errors.push(`sll status smoke failed (exit ${String(st.status)}): ${st.stdout.trim()} ${st.stderr.trim()}`);
      const help = spawnSync(node, [join(folder, 'app', 'bin', 'sll.mjs'), 'help'], { env, encoding: 'utf8', timeout: 20_000 });
      if (help.status !== 0 || !help.stdout.includes('sll')) errors.push('sll help smoke failed');
      if (!existsSync(join(tmp, 'home', 'runtime'))) errors.push('sll status did not use the injected SLL_HOME');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  for (const [what, placeholder] of [
    ['content pack (--pack)', manifest.pack.placeholder],
    ['web build (dist/web)', manifest.web.placeholder],
  ] as const) {
    if (placeholder) (opts.allowPlaceholders ? warnings : errors).push(`${what} is a PLACEHOLDER: not a usable owner release`);
  }
  if (manifest.gitDirty) warnings.push('built from a checkout with uncommitted changes');
  return { errors, warnings };
}

function main(argv: readonly string[]): number {
  let releaseDir = join(REPO, 'release');
  let allowPlaceholders = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--release' && argv[i + 1]) releaseDir = resolve(argv[++i]!);
    else if (argv[i] === '--allow-placeholders') allowPlaceholders = true;
    else {
      process.stderr.write(`release check: unknown argument ${String(argv[i])}\n`);
      return 2;
    }
  }
  const { errors, warnings } = checkRelease(releaseDir, { allowPlaceholders });
  for (const w of warnings) process.stdout.write(`warning: ${w}\n`);
  for (const e of errors) process.stdout.write(`error: ${e}\n`);
  process.stdout.write(errors.length ? `release check FAILED (${errors.length} error(s))\n` : 'release check passed\n');
  return errors.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
