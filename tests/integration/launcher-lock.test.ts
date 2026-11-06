// Profile lock and process identity: stale locks are replaced without signalling anyone; a live foreign process
// that a record points at is never killed; the launcher's path layout mirrors the server's.
import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { privatePaths as serverPrivatePaths } from '../../apps/server/src/db/paths.ts';
import { STUB, importLauncherModule, isAlive, killOwned, makeLauncherHome, sll } from './launcher-helpers.ts';

const foreign: ChildProcess[] = [];
afterEach(() => {
  killOwned();
  for (const p of foreign.splice(0)) if (p.pid && isAlive(p.pid)) p.kill('SIGKILL');
});

function lstart(pid: number): string {
  return execFileSync('/bin/ps', ['-o', 'lstart=', '-p', String(pid)], { env: { LC_ALL: 'C', LANG: 'C', TZ: 'UTC', PATH: '/usr/bin:/bin' }, encoding: 'utf8' }).trim();
}

function writeRecords(home: string, pid: number, processStart: string): void {
  const runtime = join(home, 'runtime');
  mkdirSync(runtime, { recursive: true, mode: 0o700 });
  const instanceId = randomUUID();
  writeFileSync(
    join(runtime, 'runtime.json'),
    JSON.stringify({ schemaVersion: 1, instanceId, url: 'http://spanish-learning-lab.localhost:1', pid, processStart, profileEpoch: 1, startedAt: new Date().toISOString() }),
    { mode: 0o600 },
  );
  writeFileSync(
    join(runtime, 'profile.lock'),
    JSON.stringify({ schemaVersion: 1, pid, processStart, executable: process.execPath, entry: STUB, instanceId, role: 'service', createdAt: new Date().toISOString() }),
    { mode: 0o600 },
  );
}

describe('launcher profile lock', () => {
  it('replaces a stale lock whose process has exited', async () => {
    const h = makeLauncherHome();
    const gone = spawn(process.execPath, ['-e', '']);
    await new Promise((r) => gone.once('exit', r));
    writeRecords(h.home, gone.pid!, 'Thu Jan  1 00:00:00 2026');
    const s = await sll(h, ['start', '--json']);
    expect(s.code, s.stderr).toBe(0);
    const lock = JSON.parse(readFileSync(join(h.home, 'runtime', 'profile.lock'), 'utf8')) as { pid: number };
    expect(lock.pid).toBe(s.json.pid);
    expect((await sll(h, ['stop', '--json'])).code).toBe(0);
  });

  it('treats a live PID with a different start time as stale and never signals it', async () => {
    const h = makeLauncherHome();
    writeRecords(h.home, process.pid, 'Mon Jan  1 00:00:00 2001');
    const st = await sll(h, ['status', '--json']);
    expect(st.code).toBe(3);
    expect(st.json).toMatchObject({ running: false, state: 'stale' });
    const s = await sll(h, ['start', '--json']);
    expect(s.code, s.stderr).toBe(0);
    expect(s.json.pid).not.toBe(process.pid);
    expect((await sll(h, ['stop', '--json'])).code).toBe(0);
    expect(isAlive(process.pid)).toBe(true);
  });

  it('refuses to start over, or to kill, a live foreign process that a record points at', async () => {
    const h = makeLauncherHome({ SLL_STOP_TIMEOUT_MS: '500' });
    const sleeper = spawn('/bin/sleep', ['30'], { stdio: 'ignore' });
    foreign.push(sleeper);
    const pid = sleeper.pid!;
    writeRecords(h.home, pid, lstart(pid));
    const st = await sll(h, ['status', '--json']);
    expect(st.code).toBe(1);
    expect(st.json).toMatchObject({ running: false, state: 'unresponsive', pid });
    const start = await sll(h, ['start', '--json']);
    expect(start.code).toBe(1);
    expect(start.json).toMatchObject({ state: 'error', code: 'SERVICE_UNRESPONSIVE' });
    const stop = await sll(h, ['stop', '--json']);
    expect(stop.code).toBe(1);
    expect(stop.json).toMatchObject({ state: 'error', code: 'REFUSED_TO_SIGNAL' });
    expect(isAlive(pid)).toBe(true);
    // Records are kept for diagnosis; nothing was removed or signalled.
    expect(JSON.parse(readFileSync(join(h.home, 'runtime', 'runtime.json'), 'utf8')).pid).toBe(pid);
  });

  it('mirrors the server private-root layout exactly', async () => {
    const { privatePaths, resolvePrivateRoot } = await importLauncherModule('bin/lib/paths.mjs');
    expect(privatePaths('/tmp/x/root')).toEqual(serverPrivatePaths('/tmp/x/root'));
    expect(resolvePrivateRoot({ SLL_HOME: '/tmp/x/root' })).toBe('/tmp/x/root');
    expect(resolvePrivateRoot({})).toMatch(/\/Library\/Application Support\/Spanish Learning Lab$/);
  });
});
