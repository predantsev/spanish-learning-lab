// A-01 (launcher part): start → status → second start reuses the proven instance → open → stop; prior-port
// reuse; forced stop limited to the exact own child; failed startup leaves no records. Temp SLL_HOME, stub service.
import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { importLauncherModule, isAlive, killOwned, makeLauncherHome, openedUrls, sll, waitFor } from './launcher-helpers.ts';

afterEach(() => killOwned());

describe('launcher lifecycle', () => {
  it('starts one instance, reuses it on a second start, opens with a fresh nonce and stops it', async () => {
    const h = makeLauncherHome();
    const s1 = await sll(h, ['start', '--json']);
    expect(s1.code, s1.stderr).toBe(0);
    expect(s1.json).toMatchObject({ state: 'started' });
    const { pid, port, instanceId } = s1.json as { pid: number; port: number; instanceId: string };
    expect(s1.json.url).toBe(`http://spanish-learning-lab.localhost:${port}`);
    expect(isAlive(pid)).toBe(true);

    const runtimeFile = join(h.home, 'runtime', 'runtime.json');
    const rt = JSON.parse(readFileSync(runtimeFile, 'utf8')) as Record<string, unknown>;
    expect(Object.keys(rt).sort()).toEqual(['instanceId', 'pid', 'processStart', 'profileEpoch', 'schemaVersion', 'startedAt', 'url']);
    expect(rt).toMatchObject({ schemaVersion: 1, instanceId, pid, profileEpoch: 1, url: s1.json.url });
    expect(statSync(runtimeFile).mode & 0o777).toBe(0o600);
    const ipcKey = readFileSync(join(h.home, 'runtime', 'ipc.key'), 'utf8');
    expect(JSON.stringify(rt)).not.toContain(ipcKey);
    const lock = JSON.parse(readFileSync(join(h.home, 'runtime', 'profile.lock'), 'utf8')) as Record<string, unknown>;
    expect(lock).toMatchObject({ pid, instanceId, role: 'service', executable: process.execPath });
    expect(statSync(join(h.home, 'runtime', 'profile.lock')).mode & 0o777).toBe(0o600);
    expect(readFileSync(join(h.home, 'runtime', 'last-port'), 'utf8').trim()).toBe(String(port));
    expect(statSync(h.home).mode & 0o777).toBe(0o700);

    const st = await sll(h, ['status', '--json']);
    expect(st.code).toBe(0);
    expect(st.json).toMatchObject({ running: true, pid, instanceId, port, profileEpoch: 1 });

    const s2 = await sll(h, ['start', '--open', '--json']);
    expect(s2.code, s2.stderr).toBe(0);
    expect(s2.json).toMatchObject({ state: 'already-running', pid, instanceId });
    const first = await waitFor(() => openedUrls(h)[0]);
    expect(first).toMatch(new RegExp(`^http://spanish-learning-lab\\.localhost:${port}/#n=[A-Za-z0-9_-]{43}$`));

    const o = await sll(h, ['open', '--loopback', '--json']);
    expect(o.code).toBe(0);
    const second = await waitFor(() => openedUrls(h)[1]);
    expect(second).toMatch(new RegExp(`^http://127\\.0\\.0\\.1:${port}/#n=[A-Za-z0-9_-]{43}$`));
    expect(second.split('#n=')[1]).not.toBe(first.split('#n=')[1]);
    const { ipcRequest } = await importLauncherModule('bin/lib/ipc.mjs');
    const { launcherPaths, privatePaths } = await importLauncherModule('bin/lib/paths.mjs');
    const live = (await ipcRequest(launcherPaths(privatePaths(h.home)), 'status')) as { nonceCount: number };
    expect(live.nonceCount).toBe(2);
    const logText = readFileSync(join(h.home, 'logs', 'launcher.log'), 'utf8');
    for (const url of [first, second]) expect(logText).not.toContain(url.split('#n=')[1]!);
    expect(logText).not.toContain(ipcKey);

    const stop = await sll(h, ['stop', '--json']);
    expect(stop.code, stop.stderr).toBe(0);
    expect(stop.json).toMatchObject({ state: 'stopped', pid, forced: false });
    expect(isAlive(pid)).toBe(false);
    expect(existsSync(runtimeFile)).toBe(false);
    expect(existsSync(join(h.home, 'runtime', 'profile.lock'))).toBe(false);

    const st2 = await sll(h, ['status', '--json']);
    expect(st2.code).toBe(3);
    expect(st2.json).toMatchObject({ running: false, state: 'not-running' });
    const stop2 = await sll(h, ['stop', '--json']);
    expect(stop2.code).toBe(0);
    expect(stop2.json).toMatchObject({ state: 'not-running' });
    const open2 = await sll(h, ['open', '--json']);
    expect(open2.code).toBe(3);

    // Restart tries the prior port first.
    const s3 = await sll(h, ['start', '--json']);
    expect(s3.code, s3.stderr).toBe(0);
    expect(s3.json.port).toBe(port);
    expect(s3.json.pid).not.toBe(pid);
    expect((await sll(h, ['stop', '--json'])).code).toBe(0);
  });

  it('signals only its own child, by PID, when the service ignores the IPC stop', async () => {
    const h = makeLauncherHome({ SLL_STUB_MODE: 'ignore-stop', SLL_STOP_TIMEOUT_MS: '1000' });
    const s = await sll(h, ['start', '--json']);
    expect(s.code, s.stderr).toBe(0);
    const stop = await sll(h, ['stop', '--json']);
    expect(stop.code, stop.stderr).toBe(0);
    expect(stop.json).toMatchObject({ state: 'stopped', pid: s.json.pid, forced: true });
    expect(isAlive(s.json.pid)).toBe(false);
    expect(existsSync(join(h.home, 'runtime', 'runtime.json'))).toBe(false);
  });

  it('reports a failed startup and leaves no runtime record or lock', async () => {
    const h = makeLauncherHome({ SLL_STUB_MODE: 'crash' });
    const s = await sll(h, ['start', '--json']);
    expect(s.code).toBe(1);
    expect(s.json).toMatchObject({ state: 'error', code: 'START_FAILED' });
    expect(existsSync(join(h.home, 'runtime', 'runtime.json'))).toBe(false);
    expect(existsSync(join(h.home, 'runtime', 'profile.lock'))).toBe(false);
    expect(readFileSync(join(h.home, 'logs', 'service-output.log'), 'utf8')).toContain('simulated startup failure');
  });

  it('explains a missing server entry and a not-running service clearly', async () => {
    const h = makeLauncherHome({ SLL_SERVER_ENTRY: '/nonexistent/main.ts' });
    const s = await sll(h, ['start']);
    expect(s.code).toBe(1);
    expect(s.stderr).toContain('ENTRY_MISSING');
    const st = await sll(h, ['status']);
    expect(st.code).toBe(3);
    expect(st.stdout).toContain('не запущено');
    const usage = await sll(h, ['restore']);
    expect(usage.code).toBe(2);
  });
});
