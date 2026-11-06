// Launcher backup/export/restore: through the running service over IPC (stub service wired to the real recovery
// module via recovery/ipc-handlers.ts), and offline under the profile lock when the service is stopped.
import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { killOwned, makeLauncherHome, sll } from './launcher-helpers.ts';

afterEach(() => killOwned());

const sha = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

describe('launcher recovery commands', () => {
  it('backs up, exports and restores through the running service', async () => {
    const h = makeLauncherHome({ SLL_STUB_MODE: 'recovery' });
    expect((await sll(h, ['start', '--json'])).code).toBe(0);

    const b = await sll(h, ['backup', '--json']);
    expect(b.code, b.stderr).toBe(0);
    expect(b.json).toMatchObject({ state: 'ok', mode: 'online', backup: { kind: 'manual' } });
    expect(sha(join(h.home, b.json.backup.relPath))).toBe(b.json.backup.sha256);

    const out = join(h.base, 'export.zip');
    const e = await sll(h, ['export', '--out', out, '--json']);
    expect(e.code, e.stderr).toBe(0);
    expect(e.json).toMatchObject({ state: 'ok', mode: 'online', out, selfContained: false });
    expect(sha(out)).toBe(e.json.sha256);
    expect(statSync(out).mode & 0o777).toBe(0o600);
    expect((await sll(h, ['export', '--out', out, '--json'])).json).toMatchObject({ code: 'OUTPUT_EXISTS' });

    const p = await sll(h, ['restore', '--preview', out, '--json']);
    expect(p.code, p.stderr).toBe(0);
    const pv = p.json.preview as { id: string; confirmation: string; requiresSourceTrust: boolean; profileEpoch: number };
    expect(p.json.mode).toBe('online');
    expect(Number.isNaN(Date.parse(p.json.archiveCreatedAt))).toBe(false);
    expect(pv.requiresSourceTrust).toBe(false);
    const human = await sll(h, ['restore', '--preview', out]);
    expect(human.stdout).toContain('sll restore --confirm');

    const c = await sll(h, ['restore', '--confirm', pv.id, '--token', pv.confirmation, '--json']);
    expect(c.code, c.stderr).toBe(0);
    expect(c.json).toMatchObject({ state: 'restored', mode: 'online', recovered: false, outcome: { newEpoch: 2 } });
    const st = await sll(h, ['status', '--json']);
    expect(st.json.profileEpoch).toBe(2);
    expect(JSON.parse(readFileSync(join(h.home, 'runtime', 'runtime.json'), 'utf8')).profileEpoch).toBe(2);
    // The same confirmation can never restore twice.
    const again = await sll(h, ['restore', '--confirm', pv.id, '--token', pv.confirmation, '--json']);
    expect(again.code).toBe(1);
    expect(again.json).toMatchObject({ code: 'RESTORE_PREVIEW_UNKNOWN' });
    expect((await sll(h, ['stop', '--json'])).code).toBe(0);
  });

  it('runs the same commands offline under the profile lock when the service is stopped', async () => {
    const h = makeLauncherHome({ SLL_STUB_MODE: 'recovery' });
    const lock = join(h.home, 'runtime', 'profile.lock');
    const b = await sll(h, ['backup', '--json']);
    expect(b.code, b.stderr).toBe(0);
    expect(b.json).toMatchObject({ mode: 'offline', backup: { kind: 'manual' } });
    expect(existsSync(lock)).toBe(false);

    const out = join(h.base, 'offline.zip');
    const e = await sll(h, ['export', '--self-contained', '--out', out, '--json']);
    expect(e.code, e.stderr).toBe(0);
    expect(e.json).toMatchObject({ mode: 'offline', selfContained: true });
    expect(sha(out)).toBe(e.json.sha256);

    const p = await sll(h, ['restore', '--preview', out, '--json']);
    expect(p.code, p.stderr).toBe(0);
    expect(p.json.mode).toBe('offline');
    const pv = p.json.preview as { id: string; confirmation: string };
    const c = await sll(h, ['restore', '--confirm', pv.id, '--token', pv.confirmation, '--json']);
    expect(c.code, c.stderr).toBe(0);
    expect(c.json).toMatchObject({ mode: 'offline', outcome: { newEpoch: 2 } });
    expect(existsSync(lock)).toBe(false);
    expect(existsSync(join(h.home, 'runtime', 'restore-journal.json'))).toBe(false);

    const s = await sll(h, ['start', '--json']);
    expect(s.code, s.stderr).toBe(0);
    expect((await sll(h, ['status', '--json'])).json.profileEpoch).toBe(2);
    expect((await sll(h, ['stop', '--json'])).code).toBe(0);
  });
});
