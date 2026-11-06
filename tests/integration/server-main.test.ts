// Process-level checks for apps/server/src/main.ts: starts on 127.0.0.1 with port 0 in a temporary
// SLL_HOME, launcher IPC (status/register-nonce/stop) authenticated by the 0600 key, 0600/0700 private
// files, redacted logs, graceful stop. Only the child process started here is ever signalled.
import { afterAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ipcRequest } from '../../apps/server/src/ipc/server.ts';
import { rawRequest, secret } from './helpers/server-harness.ts';

const MAIN = fileURLToPath(new URL('../../apps/server/src/main.ts', import.meta.url));
const roots: string[] = [];
const children: ChildProcess[] = [];

afterAll(() => {
  for (const c of children) if (c.exitCode === null && c.signalCode === null) c.kill('SIGKILL');
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

function startMain(home: string): Promise<{ child: ChildProcess; info: { port: number; pid: number; instanceId: string; url: string } }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [MAIN], { env: { ...process.env, SLL_HOME: home, SLL_PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    children.push(child);
    let out = '';
    let err = '';
    const timer = setTimeout(() => reject(new Error(`no listening line; stderr=${err}`)), 15000);
    child.stdout!.setEncoding('utf8');
    child.stderr!.setEncoding('utf8');
    child.stderr!.on('data', (c: string) => (err += c));
    child.stdout!.on('data', (c: string) => {
      out += c;
      const nl = out.indexOf('\n');
      if (nl >= 0) {
        clearTimeout(timer);
        resolve({ child, info: JSON.parse(out.slice(0, nl)) });
      }
    });
    child.once('exit', (code) => reject(new Error(`exited early ${code}: ${err}`)));
  });
}

function waitExit(child: ChildProcess, ms = 10000): Promise<number | null> {
  return new Promise((resolve) => {
    if (child.exitCode !== null) return resolve(child.exitCode);
    const t = setTimeout(() => resolve(null), ms);
    child.once('exit', (code) => {
      clearTimeout(t);
      resolve(code);
    });
  });
}

describe('server process (main.ts)', () => {
  it('starts on loopback port 0, answers IPC, keeps secrets 0600 and stops cleanly', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sll-main-'));
    roots.push(root);
    const home = join(root, 'home');
    const { child, info } = await startMain(home);
    expect(info.pid).toBe(child.pid);
    expect(info.port).toBeGreaterThan(0);
    expect(info.url).toBe(`http://spanish-learning-lab.localhost:${info.port}`);

    const health = await rawRequest(info.port, 'GET', '/api/v1/health', { host: `spanish-learning-lab.localhost:${info.port}` });
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');
    const foreign = await rawRequest(info.port, 'GET', '/api/v1/health', { host: `evil.example:${info.port}` });
    expect(foreign.status).toBe(403);

    const runtime = join(home, 'runtime');
    const keyPath = join(runtime, 'ipc.key');
    const sockPath = join(runtime, 'ipc.sock');
    expect(statSync(keyPath).mode & 0o777).toBe(0o600);
    expect(statSync(sockPath).mode & 0o777).toBe(0o600);
    expect(statSync(join(home, 'profile.sqlite')).mode & 0o777).toBe(0o600);
    for (const d of ['', 'runtime', 'logs', 'keys', 'assets', 'backups', 'exports']) expect(statSync(join(home, d)).mode & 0o777, d).toBe(0o700);
    const key = readFileSync(keyPath, 'utf8').trim();

    expect(await ipcRequest(sockPath, { secret: 'wrong', verb: 'status' })).toEqual({ ok: false, error: 'UNAUTHORIZED' });
    const status = await ipcRequest(sockPath, { secret: key, verb: 'status' });
    expect(status).toMatchObject({ ok: true, pid: child.pid, port: info.port, instanceId: info.instanceId, profileEpoch: 1 });

    // Launcher flow: register a nonce over IPC, exchange it once from the browser origin.
    const nonce = secret();
    expect(await ipcRequest(sockPath, { secret: key, verb: 'register-nonce', nonce })).toEqual({ ok: true, nonce });
    const host = `spanish-learning-lab.localhost:${info.port}`;
    const body = JSON.stringify({ nonce });
    const exchange = await rawRequest(info.port, 'POST', '/api/v1/auth/exchange', { host, origin: `http://${host}`, 'content-type': 'application/json', 'content-length': String(body.length) }, body);
    expect(exchange.status).toBe(200);
    const again = await rawRequest(info.port, 'POST', '/api/v1/auth/exchange', { host, origin: `http://${host}`, 'content-type': 'application/json', 'content-length': String(body.length) }, body);
    expect(again.status).toBe(401);

    expect(await ipcRequest(sockPath, { secret: key, verb: 'stop' })).toEqual({ ok: true });
    expect(await waitExit(child)).toBe(0);
    expect(existsSync(sockPath)).toBe(false);
    expect(existsSync(keyPath)).toBe(false);

    // Logs: request ids/status/op only — no nonce, cookie, CSRF token or IPC secret.
    const logs = readdirSync(join(home, 'logs')).map((f) => readFileSync(join(home, 'logs', f), 'utf8')).join('\n');
    expect(logs).toContain('"op":"auth.exchange"');
    const cookie = /sll_session=([^;]+)/.exec(String(exchange.headers['set-cookie']))![1]!;
    for (const s of [nonce, cookie, exchange.body.data.csrfToken, key, 'sll_session']) expect(logs).not.toContain(s);
    expect(statSync(join(home, 'logs', 'server.log')).mode & 0o777).toBe(0o600);
  }, 30000);
});
