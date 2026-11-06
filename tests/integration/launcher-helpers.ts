// Helpers for launcher tests: run bin/sll.mjs as a real child process against a temp SLL_HOME, with the stub
// service as the server entry and a fake browser opener. Only processes started by these tests are ever signalled.
import { execFile } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const REPO = fileURLToPath(new URL('../../', import.meta.url));
export const SLL = join(REPO, 'bin', 'sll.mjs');
export const STUB = join(REPO, 'tests', 'integration', 'launcher-stub-server.mjs');

export interface Run {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly json: any;
}

export interface LauncherHome {
  readonly base: string;
  readonly home: string;
  readonly openedLog: string;
  readonly env: Record<string, string>;
}

/** Test-owned service PIDs; afterEach signals only these, and only if still alive. */
export const ownedPids = new Set<number>();

export function makeLauncherHome(extraEnv: Record<string, string> = {}): LauncherHome {
  const base = mkdtempSync(join(tmpdir(), 'sll-l-'));
  const home = join(base, 'home');
  const openedLog = join(base, 'opened.log');
  const opener = join(base, 'fake-open.sh');
  writeFileSync(opener, `#!/bin/sh\nprintf '%s\\n' "$1" >> '${openedLog}'\n`);
  chmodSync(opener, 0o755);
  return {
    base,
    home,
    openedLog,
    env: {
      SLL_HOME: home,
      SLL_SERVER_ENTRY: STUB,
      SLL_OPEN_COMMAND: opener,
      SLL_START_TIMEOUT_MS: '15000',
      SLL_STOP_TIMEOUT_MS: '5000',
      ...extraEnv,
    },
  };
}

export function sll(h: LauncherHome, args: readonly string[], env: Record<string, string> = {}): Promise<Run> {
  const childEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined && k !== 'NODE_OPTIONS' && !k.startsWith('SLL_')) childEnv[k] = v;
  Object.assign(childEnv, h.env, env);
  return new Promise((resolve) => {
    execFile(process.execPath, [SLL, ...args], { env: childEnv, cwd: h.base, timeout: 25_000 }, (err, stdout, stderr) => {
      const code = err ? (typeof (err as { code?: unknown }).code === 'number' ? ((err as { code: number }).code) : 1) : 0;
      let json: unknown;
      const last = stdout.trim().split('\n').filter(Boolean).at(-1);
      if (args.includes('--json') && last) {
        try {
          json = JSON.parse(last);
        } catch {
          json = undefined;
        }
      }
      if (json && typeof json === 'object' && Number.isInteger((json as { pid?: unknown }).pid)) ownedPids.add((json as { pid: number }).pid);
      resolve({ code, stdout, stderr, json });
    });
  });
}

export function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === 'EPERM';
  }
}

export async function waitFor<T>(fn: () => T | undefined, timeoutMs = 5000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const v = fn();
    if (v !== undefined) return v;
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise((r) => setTimeout(r, 50));
  }
}

export function openedUrls(h: LauncherHome): string[] {
  return existsSync(h.openedLog) ? readFileSync(h.openedLog, 'utf8').split('\n').filter(Boolean) : [];
}

export function killOwned(): void {
  for (const pid of ownedPids) {
    if (isAlive(pid)) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        /* gone */
      }
    }
  }
  ownedPids.clear();
}

/** Dynamically imports a plain-JS launcher module (untyped on purpose: the launcher is not TypeScript). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importLauncherModule(rel: string): Promise<any> {
  return import(pathToFileURL(join(REPO, rel)).href);
}
