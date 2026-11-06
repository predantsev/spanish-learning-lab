// Release packaging (IMPLEMENTATION-PLAN §Architecture and local delivery; WP-01/WP-08):
//   node tools/release/build.ts --pack <activated pack dir> [--node-dir <dir>] [--out <dir>]
// builds <out>/Spanish Learning Lab/ (default <repo>/release, gitignored) with the verified Node 24.22.1
// darwin-arm64 runtime (bin/node + LICENSE), production node_modules installed by `npm ci --omit=dev` in a staging
// copy (the checkout's own node_modules is never touched), server/package sources, dist/web, bin/, the content
// pack, THIRD-PARTY-NOTICES.txt, README-UK.md and Start.command, then writes <out>/release-manifest.json with the
// SHA-256 of every file. Missing dist/web or --pack become clearly marked placeholders (release:check rejects them
// unless --allow-placeholders). No network beyond npm's registry/cache, no global installs, no profile access.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NODE_VERSION = '24.22.1';
export const NPM_VERSION = '11.19.1';
export const FOLDER = 'Spanish Learning Lab';
const NODE_DIST = `node-v${NODE_VERSION}-darwin-arm64`;
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WORKSPACES = ['packages/contracts', 'packages/domain', 'apps/server', 'apps/web'] as const;

export interface ManifestFileEntry {
  readonly path: string;
  readonly sha256?: string;
  readonly bytes?: number;
  readonly mode?: string;
  readonly symlink?: string;
}

export interface ReleaseManifest {
  readonly schemaVersion: 1;
  readonly name: string;
  readonly appVersion: string;
  readonly folder: string;
  readonly builtAt: string;
  readonly gitCommit: string | null;
  readonly gitDirty: boolean | null;
  readonly node: { readonly version: string; readonly platform: string; readonly arch: string; readonly sha256: string };
  readonly npm: { readonly version: string };
  readonly lockfileSha256: string;
  readonly pack: {
    readonly placeholder: boolean;
    readonly packId: string | null;
    readonly version: string | null;
    readonly manifestSha256: string | null;
    readonly treeSha256: string;
  };
  readonly web: { readonly placeholder: boolean; readonly treeSha256: string };
  readonly files: readonly ManifestFileEntry[];
}

function fail(msg: string): never {
  process.stderr.write(`release build: ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv: readonly string[]): { pack?: string; nodeDir?: string; out: string } {
  const out: { pack?: string; nodeDir?: string; out: string } = { out: join(REPO, 'release') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = argv[i + 1];
    if ((a === '--pack' || a === '--node-dir' || a === '--out') && v !== undefined) {
      if (a === '--pack') out.pack = resolve(v);
      else if (a === '--node-dir') out.nodeDir = resolve(v);
      else out.out = resolve(v);
      i++;
    } else fail(`unknown or incomplete argument ${String(a)}`);
  }
  return out;
}

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** Every file/symlink below `dir` as sorted POSIX paths relative to `dir` (symlinks are never followed). */
export function walk(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(dir, prefix), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(dir, rel));
    else out.push(rel);
  }
  return out;
}

export function describe(root: string, rel: string): ManifestFileEntry {
  const abs = join(root, rel);
  const st = lstatSync(abs);
  if (st.isSymbolicLink()) return { path: rel, symlink: readlinkSync(abs) };
  return { path: rel, sha256: sha256File(abs), bytes: st.size, mode: (st.mode & 0o777).toString(8).padStart(4, '0') };
}

export function treeSha(root: string): string {
  const h = createHash('sha256');
  if (!existsSync(root)) return h.digest('hex');
  for (const rel of walk(root)) {
    const d = describe(root, rel);
    h.update(`${rel}\0${d.sha256 ?? `->${d.symlink}`}\n`);
  }
  return h.digest('hex');
}

/** The verified runtime: --node-dir, this checkout's .runtime, or the main checkout's (git worktree). */
function resolveNodeDir(explicit?: string): string {
  const candidates: string[] = [];
  if (explicit) candidates.push(explicit);
  candidates.push(join(REPO, '.runtime', NODE_DIST));
  try {
    const dotGit = join(REPO, '.git');
    if (statSync(dotGit).isFile()) {
      const gitdir = /^gitdir:\s*(.+)$/m.exec(readFileSync(dotGit, 'utf8'))?.[1]?.trim();
      if (gitdir) {
        const abs = isAbsolute(gitdir) ? gitdir : resolve(REPO, gitdir);
        const common = resolve(abs, readFileSync(join(abs, 'commondir'), 'utf8').trim());
        candidates.push(join(dirname(common), '.runtime', NODE_DIST));
      }
    }
  } catch {
    /* not a worktree */
  }
  const found = candidates.find((c) => existsSync(join(c, 'bin', 'node')));
  if (!found) fail(`Node ${NODE_VERSION} runtime not found (run scripts/fetch-node.sh or pass --node-dir)`);
  return found;
}

function run(cmd: string, args: readonly string[], opts: { cwd?: string } = {}): string {
  return execFileSync(cmd, args, { cwd: opts.cwd ?? REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const LICENSE_FILE = /^(licen[cs]e|copying|notice)(\..*)?$/i;

/** THIRD-PARTY-NOTICES.txt from the installed production packages (workspace links are our own code). */
function notices(nodeModules: string, nodeLicense: string): string {
  const seen = new Map<string, string>();
  const visit = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (!e.isDirectory()) continue;
      if (e.name.startsWith('@')) {
        visit(p);
        continue;
      }
      const pkgFile = join(p, 'package.json');
      if (existsSync(pkgFile)) {
        const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as { name?: string; version?: string; license?: unknown };
        const id = `${pkg.name ?? e.name}@${pkg.version ?? '?'}`;
        if (!seen.has(id)) {
          const lic = typeof pkg.license === 'string' ? pkg.license : typeof (pkg.license as { type?: unknown })?.type === 'string' ? String((pkg.license as { type: string }).type) : 'UNKNOWN';
          const texts = readdirSync(p)
            .filter((f) => LICENSE_FILE.test(f))
            .sort()
            .map((f) => readFileSync(join(p, f), 'utf8').trim());
          seen.set(id, `${'='.repeat(78)}\n${id}\nLicense: ${lic}\n\n${texts.length ? texts.join('\n\n') : '(no license file shipped in the package)'}\n`);
        }
      }
      visit(join(p, 'node_modules'));
    }
  };
  visit(nodeModules);
  const sorted = [...seen.keys()].sort().map((k) => seen.get(k)!);
  return [
    'Spanish Learning Lab — third-party notices',
    '',
    'This folder bundles the following third-party software. Each component is provided under its own license, reproduced below.',
    'Application code and course content of Spanish Learning Lab are not covered by these notices.',
    '',
    `${'='.repeat(78)}\nNode.js v${NODE_VERSION} (runtime/node)\n\n${nodeLicense.trim()}\n`,
    ...sorted,
  ].join('\n');
}

function placeholderWeb(dir: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'index.html'),
    '<!doctype html>\n<html lang="uk"><head><meta charset="utf-8"><title>Spanish Learning Lab</title></head>\n<body><p>Заглушка: інтерфейс не було зібрано для цієї збірки (dist/web відсутній). Це не придатний реліз.</p></body></html>\n',
  );
}

function placeholderPack(dir: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'pack.json'), `${JSON.stringify({ placeholder: true, note: 'No content pack was supplied to tools/release/build.ts (--pack). This build is not a usable release.' }, null, 2)}\n`);
}

function copyTree(src: string, dst: string): void {
  cpSync(src, dst, { recursive: true, verbatimSymlinks: true, errorOnExist: true, force: false });
}

export function main(argv: readonly string[]): void {
  if (process.platform !== 'darwin' || process.arch !== 'arm64') fail('the release targets darwin-arm64 and must be built on it');
  const args = parseArgs(argv);
  const nodeDir = resolveNodeDir(args.nodeDir);
  const nodeBin = join(nodeDir, 'bin', 'node');
  const nodeVersion = run(nodeBin, ['--version']);
  if (nodeVersion !== `v${NODE_VERSION}`) fail(`runtime ${nodeBin} is ${nodeVersion}, expected v${NODE_VERSION}`);
  const target = run(nodeBin, ['-p', "process.platform + '-' + process.arch"]);
  if (target !== 'darwin-arm64') fail(`runtime ${nodeBin} targets ${target}, expected darwin-arm64`);
  const npmCli = join(nodeDir, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const npmVersion = run(nodeBin, [npmCli, '--version']);
  if (npmVersion !== NPM_VERSION) fail(`npm is ${npmVersion}, expected ${NPM_VERSION}`);

  const outDir = args.out;
  const folder = join(outDir, FOLDER);
  const manifestPath = join(outDir, 'release-manifest.json');
  // Remove only this builder's own artifacts.
  rmSync(folder, { recursive: true, force: true });
  rmSync(manifestPath, { force: true });
  mkdirSync(folder, { recursive: true });

  // 1. Production dependencies in a staging copy (never the checkout's node_modules).
  const staging = join(REPO, '.tmp', 'release-staging');
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  for (const f of ['package.json', 'package-lock.json', '.npmrc']) copyFileSync(join(REPO, f), join(staging, f));
  for (const ws of WORKSPACES) {
    mkdirSync(join(staging, ws), { recursive: true });
    copyFileSync(join(REPO, ws, 'package.json'), join(staging, ws, 'package.json'));
  }
  const install = spawnSync(nodeBin, [npmCli, 'ci', '--omit=dev', '--ignore-scripts', '--prefer-offline', '--no-audit', '--no-fund'], {
    cwd: staging,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${join(nodeDir, 'bin')}:/usr/bin:/bin` },
  });
  if (install.status !== 0) fail(`npm ci --omit=dev failed:\n${install.stderr}`);

  // 2. Application files.
  const app = join(folder, 'app');
  mkdirSync(app, { recursive: true });
  for (const f of ['package.json', 'package-lock.json']) copyFileSync(join(REPO, f), join(app, f));
  for (const ws of WORKSPACES) {
    mkdirSync(join(app, ws), { recursive: true });
    copyFileSync(join(REPO, ws, 'package.json'), join(app, ws, 'package.json'));
    if (ws !== 'apps/web' && existsSync(join(REPO, ws, 'src'))) copyTree(join(REPO, ws, 'src'), join(app, ws, 'src'));
  }
  copyTree(join(staging, 'node_modules'), join(app, 'node_modules'));
  copyTree(join(REPO, 'bin'), join(app, 'bin'));
  const webSrc = join(REPO, 'dist', 'web');
  const webPlaceholder = !existsSync(join(webSrc, 'index.html'));
  if (webPlaceholder) placeholderWeb(join(app, 'dist', 'web'));
  else copyTree(webSrc, join(app, 'dist', 'web'));
  const packDst = join(app, 'content', 'pack');
  let packPlaceholder = !args.pack;
  if (args.pack) {
    if (!existsSync(join(args.pack, 'pack.json'))) fail(`--pack ${args.pack} has no pack.json`);
    copyTree(args.pack, packDst);
    for (const rel of walk(packDst)) if (lstatSync(join(packDst, rel)).isSymbolicLink()) fail(`pack contains a symbolic link: ${rel}`);
  } else placeholderPack(packDst);
  const packJson = JSON.parse(readFileSync(join(packDst, 'pack.json'), 'utf8')) as { packId?: unknown; version?: unknown; placeholder?: unknown };
  if (packJson.placeholder === true) packPlaceholder = true;

  // 3. Runtime, notices, owner docs, launcher shortcut.
  mkdirSync(join(folder, 'runtime', 'node', 'bin'), { recursive: true });
  copyFileSync(nodeBin, join(folder, 'runtime', 'node', 'bin', 'node'));
  chmodSync(join(folder, 'runtime', 'node', 'bin', 'node'), 0o755);
  copyFileSync(join(nodeDir, 'LICENSE'), join(folder, 'runtime', 'node', 'LICENSE'));
  writeFileSync(join(folder, 'THIRD-PARTY-NOTICES.txt'), notices(join(app, 'node_modules'), readFileSync(join(nodeDir, 'LICENSE'), 'utf8')));
  copyFileSync(join(REPO, 'tools', 'release', 'README-UK.md'), join(folder, 'README-UK.md'));
  copyFileSync(join(REPO, 'tools', 'release', 'Start.command'), join(folder, 'Start.command'));
  chmodSync(join(folder, 'Start.command'), 0o755);

  // 4. Manifest.
  let gitCommit: string | null = null;
  let gitDirty: boolean | null = null;
  try {
    gitCommit = run('git', ['rev-parse', 'HEAD']);
    gitDirty = run('git', ['status', '--porcelain']).length > 0;
  } catch {
    /* not a git checkout */
  }
  const rootPkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')) as { version: string };
  const manifest: ReleaseManifest = {
    schemaVersion: 1,
    name: 'Spanish Learning Lab',
    appVersion: rootPkg.version,
    folder: FOLDER,
    builtAt: new Date().toISOString(),
    gitCommit,
    gitDirty,
    node: { version: nodeVersion, platform: 'darwin', arch: 'arm64', sha256: sha256File(nodeBin) },
    npm: { version: npmVersion },
    lockfileSha256: sha256File(join(REPO, 'package-lock.json')),
    pack: {
      placeholder: packPlaceholder,
      packId: typeof packJson.packId === 'string' ? packJson.packId : null,
      version: typeof packJson.version === 'string' ? packJson.version : null,
      manifestSha256: packPlaceholder ? null : sha256File(join(packDst, 'pack.json')),
      treeSha256: treeSha(packDst),
    },
    web: { placeholder: webPlaceholder, treeSha256: treeSha(join(app, 'dist', 'web')) },
    files: walk(folder).map((rel) => describe(folder, rel)),
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  rmSync(staging, { recursive: true, force: true });
  const files = manifest.files.length;
  process.stdout.write(
    `release built: ${relative(REPO, folder) || folder}\n  files: ${files}\n  node: ${nodeVersion}  npm: ${npmVersion}\n  pack: ${packPlaceholder ? 'PLACEHOLDER' : `${String(manifest.pack.packId)}@${String(manifest.pack.version)}`}\n  web: ${webPlaceholder ? 'PLACEHOLDER' : 'dist/web'}\n  manifest: ${relative(REPO, manifestPath) || manifestPath}\n`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
