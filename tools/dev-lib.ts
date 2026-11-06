// Shared bring-up for `npm run dev` (tools/dev.ts) and the Playwright global setup: build the web UI if
// missing, build + install a content pack while the service is stopped, start the service through the
// launcher on 127.0.0.1 (prior port or 0), and print a one-use open link. Every child is started with an
// explicit SLL_HOME; nothing here touches a real profile unless the caller passes it.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = fileURLToPath(new URL('..', import.meta.url));
export const SLL = join(REPO, 'bin', 'sll.mjs');
const PACK_CLI = join(REPO, 'apps', 'server', 'src', 'cli', 'pack.ts');
const CONTENT_PACK = join(REPO, 'tools', 'content', 'pack.ts');
const VITE = join(REPO, 'node_modules', 'vite', 'bin', 'vite.js');

export interface Run {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

export function run(args: readonly string[], env: Record<string, string | undefined>, timeoutMs = 300_000): Run {
  const r = spawnSync(process.execPath, args, { cwd: REPO, env: { ...process.env, ...env }, encoding: 'utf8', timeout: timeoutMs });
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function lastJson(out: string): any {
  const line = out.trim().split('\n').filter(Boolean).at(-1);
  return line ? JSON.parse(line) : undefined;
}

export function ensureWebBuild(log: (s: string) => void = () => undefined): void {
  if (existsSync(join(REPO, 'dist', 'web', 'index.html'))) return;
  log('building the web UI (dist/web missing)…');
  const r = run([VITE, 'build', '--config', 'apps/web/vite.config.ts'], {});
  if (r.status !== 0) throw new Error(`web build failed:\n${r.stderr || r.stdout}`);
}

/** node tools/content/pack.ts --allow-unreviewed (preview pack of content/source) into a fresh directory. */
export function buildPreviewPack(outDir: string, version: string): void {
  mkdirSync(join(outDir, '..'), { recursive: true });
  const r = run([CONTENT_PACK, '--out', outDir, '--allow-unreviewed', '--version', version], {});
  if (r.status !== 0) throw new Error(`pack build failed:\n${r.stderr || r.stdout}`);
}

export function installPackDir(home: string, packDir: string, allowPreview: boolean): any {
  const r = run([PACK_CLI, 'install', packDir, ...(allowPreview ? ['--allow-preview'] : [])], { SLL_HOME: home });
  if (r.status !== 0) throw new Error(`pack install failed (${r.status}): ${r.stderr || r.stdout}`);
  return lastJson(r.stdout);
}

export function launcher(home: string, args: readonly string[]): { status: number; json: any; stderr: string } {
  const r = run([SLL, ...args, '--json'], { SLL_HOME: home, SLL_SERVER_ENTRY: '' }, 60_000);
  let json: any;
  try {
    json = lastJson(r.stdout);
  } catch {
    json = undefined;
  }
  return { status: r.status, json, stderr: r.stderr };
}

export function startService(home: string): { url: string; port: number; pid: number } {
  const s = launcher(home, ['start']);
  if (s.status !== 0 || !s.json?.url) throw new Error(`service start failed (${s.status}): ${s.stderr}`);
  return { url: s.json.url, port: s.json.port, pid: s.json.pid };
}

export function stopService(home: string): void {
  launcher(home, ['stop']);
}

/** A fresh one-use (60 s) link with the nonce in the fragment. */
export function openLink(home: string): string {
  const o = launcher(home, ['open', '--print-url']);
  if (o.status !== 0 || !o.json?.url) throw new Error(`open --print-url failed (${o.status}): ${o.stderr}`);
  return o.json.url;
}
