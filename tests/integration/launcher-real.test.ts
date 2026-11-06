// A-01 against the REAL server: bin/sll.mjs starts apps/server/src/main.ts (no stub) in a temp SLL_HOME →
// status → a second start reuses the proven instance → open --print-url registers a one-use nonce and prints
// the link (no browser) → the link authenticates over HTTP → backup → export → stop. Only the child this
// test started is ever signalled (killOwned in afterEach, and only if still alive).
import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isAlive, killOwned, makeLauncherHome, openedUrls, sll } from './launcher-helpers.ts';
import { rawRequest } from './helpers/server-harness.ts';

afterEach(() => killOwned());

describe('launcher with the real server process', () => {
  it('start → status → reuse → open --print-url → authenticated read → backup → export → stop', async () => {
    const h = makeLauncherHome();
    const env = { SLL_SERVER_ENTRY: '' }; // empty → the launcher's default entry: apps/server/src/main.ts
    const s1 = await sll(h, ['start', '--json'], env);
    expect(s1.code, `${s1.stderr}\n${s1.stdout}`).toBe(0);
    expect(s1.json).toMatchObject({ state: 'started' });
    const { pid, port, instanceId } = s1.json as { pid: number; port: number; instanceId: string };
    expect(isAlive(pid)).toBe(true);
    const lock = JSON.parse(readFileSync(join(h.home, 'runtime', 'profile.lock'), 'utf8'));
    expect(lock).toMatchObject({ pid, instanceId, role: 'service' });
    expect(lock.entry).toMatch(/apps\/server\/src\/main\.ts$/);
    expect(statSync(join(h.home, 'runtime', 'ipc.key')).mode & 0o777).toBe(0o600);
    expect(statSync(join(h.home, 'runtime', 'ipc.sock')).mode & 0o777).toBe(0o600);

    const st = await sll(h, ['status', '--json'], env);
    expect(st.code, st.stderr).toBe(0);
    expect(st.json).toMatchObject({ running: true, pid, instanceId, port, profileEpoch: 1 });

    const s2 = await sll(h, ['start', '--json'], env);
    expect(s2.code, s2.stderr).toBe(0);
    expect(s2.json).toMatchObject({ state: 'already-running', pid, instanceId });

    const op = await sll(h, ['open', '--print-url', '--json'], env);
    expect(op.code, op.stderr).toBe(0);
    expect(op.json).toMatchObject({ opened: false, port });
    const url = op.json.url as string;
    expect(url).toMatch(new RegExp(`^http://spanish-learning-lab\\.localhost:${port}/#n=[A-Za-z0-9_-]{43}$`));
    expect(openedUrls(h)).toEqual([]); // no browser launched
    // The printed one-use link authenticates once against the real server.
    const nonce = url.split('#n=')[1]!;
    const host = `spanish-learning-lab.localhost:${port}`;
    const body = JSON.stringify({ nonce });
    const exchange = await rawRequest(port, 'POST', '/api/v1/auth/exchange', { host, origin: `http://${host}`, 'content-type': 'application/json', 'content-length': String(body.length) }, body);
    expect(exchange.status).toBe(200);
    const cookie = /sll_session=([^;]+)/.exec(String(exchange.headers['set-cookie']))![1]!;
    const home = await rawRequest(port, 'GET', '/api/v1/views/home', { host, cookie: `sll_session=${cookie}` });
    expect(home.status).toBe(200);
    expect(home.body.data.pack.state).toBe('missing');

    const backup = await sll(h, ['backup', '--json'], env);
    expect(backup.code, backup.stderr).toBe(0);
    const exported = await sll(h, ['export', '--json', '--out', join(h.base, 'profile-export.zip')], env);
    expect(exported.code, exported.stderr).toBe(0);
    expect(existsSync(join(h.base, 'profile-export.zip'))).toBe(true);

    const stop = await sll(h, ['stop', '--json'], env);
    expect(stop.code, stop.stderr).toBe(0);
    expect(stop.json).toMatchObject({ state: 'stopped', pid, forced: false });
    expect(isAlive(pid)).toBe(false);
    for (const f of ['ipc.sock', 'ipc.key', 'profile.lock', 'runtime.json']) expect(existsSync(join(h.home, 'runtime', f)), f).toBe(false);
    const after = await sll(h, ['status', '--json'], env);
    expect(after.code).toBe(3);
  }, 60000);
});
