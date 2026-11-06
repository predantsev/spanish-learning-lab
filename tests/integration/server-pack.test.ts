// A-08: staging, hash/manifest/reference verification, ready gates, preview flag, pre-change backup,
// atomic activation (crash before the switch keeps the old pack), old revisions/assets retained.
// A-14 (server side): correctness vs independence, unresolved free text, invalid item, quarantine.
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installPack, PackInstallError } from '../../apps/server/src/content/install.ts';
import { startIpcServer } from '../../apps/server/src/ipc/server.ts';
import { openProfileStore } from '../../apps/server/src/store/profile-store.ts';
import { buildSyntheticPack, type BuildOptions } from '../fixtures/pack-synthetic/build-pack.ts';
import { command, contractErrors, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';
import { attempt, lessonView, ok, openTask, saveDraft, snapshot, startLesson, submit, taskOf } from './helpers/flows.ts';

let h: Harness;
let scratch: string;
beforeEach(async () => {
  h = await startHarness();
  scratch = mkdtempSync(join(tmpdir(), 'sll-packs-'));
});
afterEach(async () => {
  await h.close();
  rmSync(scratch, { recursive: true, force: true });
});

function build(name: string, options: BuildOptions = {}) {
  return buildSyntheticPack(join(scratch, name), { version: '0.0.2', ...options });
}

async function expectRejected(dir: string, code: string, options = {}): Promise<void> {
  const err = await installPack(h.store, dir, options).then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(err, code).toBeInstanceOf(PackInstallError);
  expect((err as PackInstallError).code).toBe(code);
}

const activeManifest = () => (h.store.db().prepare("SELECT version, manifest_sha256 FROM packs WHERE state = 'active'").all() as Array<{ version: string; manifest_sha256: string }>);

describe('A-08 pack installation', () => {
  it('rejects incomplete, corrupt, unlisted, symlinked, inconsistent and unready packs; the old pack stays active', async () => {
    const before = activeManifest();
    expect(before).toEqual([{ version: '0.0.1-synthetic', manifest_sha256: h.pack!.manifestSha256 }]);

    const incomplete = build('incomplete');
    unlinkSync(join(incomplete.dir, 'media', `${incomplete.clipHashes['clip.shop.more.b']}.mp3`));
    await expectRejected(incomplete.dir, 'MISSING_FILE');

    const corrupt = build('corrupt');
    const mediaPath = join(corrupt.dir, 'media', `${corrupt.clipHashes['clip.shop.more.a']}.mp3`);
    writeFileSync(mediaPath, Buffer.alloc(4096, 7));
    await expectRejected(corrupt.dir, 'HASH_MISMATCH');

    const unlisted = build('unlisted');
    writeFileSync(join(unlisted.dir, 'extra.js'), 'alert(1)');
    await expectRejected(unlisted.dir, 'UNLISTED_FILE');

    const linked = build('linked');
    symlinkSync('/etc/hosts', join(linked.dir, 'media', 'link.mp3'));
    await expectRejected(linked.dir, 'PACK_SYMLINK');

    const truncated = build('truncated');
    appendFileSync(join(truncated.dir, 'entities.ndjson'), '{"kind":"task"');
    await expectRejected(truncated.dir, 'SIZE_MISMATCH');

    const badRef = build('badref', { mutate: (e) => (e.tasks[0].targets = [{ skillId: 'unknown.skill', modality: 'written-form' }]) });
    await expectRejected(badRef.dir, 'REFERENCE');

    const missingClip = build('noclip', { omitMediaForClips: ['clip.shop.more.b'] });
    await expectRejected(missingClip.dir, 'MISSING_MEDIA');

    const unready = build('unready', { state: (kind, body) => (kind === 'task' && body.id === 'A2-03-L1-T01' ? 'draft' : String(body.reviewStatus)) });
    await expectRejected(unready.dir, 'NOT_READY');

    const preview = build('preview', { preview: true, state: (kind, body) => (kind === 'lesson' ? 'reviewed' : String(body.reviewStatus)) });
    await expectRejected(preview.dir, 'PREVIEW_NOT_ALLOWED');
    expect(activeManifest()).toEqual(before);
    expect(h.store.db().prepare("SELECT count(*) AS n FROM content_revisions WHERE pack_id IS NOT NULL AND json_extract(provenance, '$.packVersion') = '0.0.2'").get()).toEqual({ n: 0 });

    // An explicit preview install is allowed and visibly flagged on Home.
    const res = await installPack(h.store, preview.dir, { allowPreview: true });
    expect(res.outcome).toBe('activated');
    const home = await h.req('GET', '/api/v1/views/home', { cookie: true });
    expect(home.body.data.pack).toEqual({ state: 'preview', version: '0.0.2', hash: preview.manifestSha256 });
    expect(contractErrors('get_views_home', 200, home.body)).toBeUndefined();
  });

  it('activation is atomic; a new revision keeps old keys, audio and history (no silent rescore)', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const oldTask = taskOf(lv, 'A2-03-L2-T02');
    const c = await openTask(h, sessionId, oldTask.taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const sub = await submit(h, c, { text: 'hecho' });
    const before = await attempt(h, sub.body.entities[0].id);
    const openCtx = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T01').taskRevisionId);
    await ok(await saveDraft(h, openCtx, 'borrador abierto', 1));
    const oldAudio = h.pack!.clipHashes['clip.shop.more.a']!;

    const v2 = build('v2', {
      mediaSalt: '-v2',
      mutate: (e) => {
        const t = e.tasks.find((x: any) => x.id === 'A2-03-L2-T02');
        t.accepted = [{ id: 'v1', text: 'hecho' }, { id: 'v2', text: 'hecho ya' }];
      },
    });
    // Crash inside the activation transaction: nothing of v2 becomes visible.
    await expect(installPack(h.store, v2.dir, { faults: { beforeSwitch: () => { throw new Error('injected crash at activation'); } } })).rejects.toThrow('injected crash');
    expect(activeManifest()).toEqual([{ version: '0.0.1-synthetic', manifest_sha256: h.pack!.manifestSha256 }]);
    expect((await lessonView(h, 'A2-03-L2')).steps[2].tasks[0].taskRevisionId).toBe(oldTask.taskRevisionId);

    const res = await installPack(h.store, v2.dir);
    expect(res.outcome).toBe('activated');
    const packs = h.store.db().prepare('SELECT version, state FROM packs ORDER BY version').all();
    expect(packs).toEqual([{ version: '0.0.1-synthetic', state: 'retained' }, { version: '0.0.2', state: 'active' }]);
    const lv2 = await lessonView(h, 'A2-03-L2');
    const newTask = taskOf(lv2, 'A2-03-L2-T02');
    expect(newTask.taskRevisionId).not.toBe(oldTask.taskRevisionId);
    // History keeps the pinned old key revision and its verdicts; the old revision stays readable.
    expect(await attempt(h, sub.body.entities[0].id)).toEqual(before);
    expect(before.taskRevisionId).toBe(oldTask.taskRevisionId);
    const oldRead = await h.req('GET', `/api/v1/resources/task/${oldTask.taskRevisionId}`, { cookie: true });
    expect(oldRead.status).toBe(200);
    expect(contractErrors('get_resources_resourceType_id', 200, oldRead.body)).toBeUndefined();
    // Old audio is retained and still served; the new audio revision has a new hash.
    expect(v2.clipHashes['clip.shop.more.a']).not.toBe(oldAudio);
    expect((await h.req('GET', `/api/v1/media/${oldAudio}`, { cookie: true })).status).toBe(200);
    expect((await h.req('GET', `/api/v1/media/${v2.clipHashes['clip.shop.more.a']}`, { cookie: true })).status).toBe(200);
    // The open context and its draft survive the activation.
    expect((await snapshot(h, openCtx.contextId)).body.draft.text).toBe('borrador abierto');
    // Re-installing the active pack is a no-op.
    expect((await installPack(h.store, v2.dir)).outcome).toBe('unchanged');
  });

  it('takes a pre-change backup before activation; a failed backup blocks the switch', async () => {
    const calls: Array<[string, string | undefined]> = [];
    const okRecovery = { backupNow: async (kind: string, reason?: string) => (calls.push([kind, reason]), { id: uuid(), kind: 'pre-change' as const, relPath: 'x', sha256: 'a'.repeat(64), bytes: 1, eventSeq: 1, localDate: '2026-10-01' }) };
    const failing = { backupNow: async () => { throw new Error('disk full'); } };
    await expectRejected(build('fail-backup').dir, 'BACKUP_FAILED', { recovery: failing });
    expect(activeManifest()[0]!.version).toBe('0.0.1-synthetic');
    const res = await installPack(h.store, build('with-backup').dir, { recovery: okRecovery });
    expect(res.outcome).toBe('activated');
    expect(calls).toEqual([['pre-change', 'content-activation']]);
  });

  it('CLI installs into SLL_HOME and refuses while a service owns the profile', async () => {
    const home = join(scratch, 'home');
    const pack = build('cli');
    const cli = fileURLToPath(new URL('../../apps/server/src/cli/pack.ts', import.meta.url));
    const run = () => spawnSync(process.execPath, [cli, 'install', pack.dir], { env: { ...process.env, SLL_HOME: home }, encoding: 'utf8' });
    const first = run();
    expect(first.status, first.stderr).toBe(0);
    expect(JSON.parse(first.stdout)).toMatchObject({ ok: true, outcome: 'activated', version: '0.0.2', preBackup: false });
    const store = openProfileStore({ root: home });
    const ipc = await startIpcServer(store.paths, { registerNonce: () => 'x', status: () => ({}), stop: async () => undefined });
    try {
      const refused = run();
      expect(refused.status).toBe(3);
      expect(JSON.parse(refused.stderr)).toMatchObject({ ok: false, code: 'SERVICE_RUNNING' });
    } finally {
      await ipc.close();
      store.close();
    }
  }, 30000);
});

describe('A-14 evidence states (server side)', () => {
  it('separates correctness from independence; unresolved free text changes no schedule; quarantine excludes evidence', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    await ok(await send(h, command(h, 'lesson.progress', uuid(), 0, { sessionId, stepId: 's1', action: 'visit' })));
    // Correct with actually delivered course help (reveal) → correct + supported.
    const sup = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T01').taskRevisionId);
    await ok(await saveDraft(h, sup, 'hecho', 1));
    const s1 = await snapshot(h, sup.contextId);
    const req = await ok(await send(h, command(h, 'support.request', uuid(), 0, { taskRevisionId: sup.taskRevisionId, kind: 'reveal', hintIndex: 1 }, { contextId: sup.contextId, contextRevision: s1.revision, contextSnapshot: s1.token })));
    const supportId = req.body.entities[0].id;
    await ok(await send(h, command(h, 'support.confirm', supportId, 1, { contentHash: req.body.contentHash, deliveryId: uuid(), reportedDeliveredAt: h.clock.now().toISOString(), phase: 'before-submit', targets: [{ skillId: 'participle.hecho', modality: 'written-form' }] }, { contextId: sup.contextId, contextRevision: s1.revision })));
    const a1 = await attempt(h, (await submit(h, sup, { text: 'hecho' })).body.entities[0].id);
    expect(a1.verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'supported' });

    // Unresolved free text (rubric-review, no exemplar match): neither pass nor failure, schedule untouched.
    const row = () => h.store.db().prepare("SELECT stage, due_date, pending_need FROM target_states WHERE skill_id = 'participle.hecho'").get();
    const before = row();
    const free = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T04').taskRevisionId);
    await ok(await saveDraft(h, free, 'Hoy he hecho muchas cosas.', 1));
    const res = await submit(h, free, { text: 'Hoy he hecho muchas cosas.' });
    expect(res.body.outcome).toBe('unresolved');
    const a2 = await attempt(h, res.body.entities[0].id);
    expect(a2).toMatchObject({ status: 'unresolved', originalAnswer: 'Hoy he hecho muchas cosas.' });
    expect(a2.verdicts[0]).toMatchObject({ correctness: 'unresolved', independence: 'independent', explanationKey: 'check.unresolved.rubric' });
    expect(row()).toEqual(before);

    // The quarantined item is left out of the session snapshot and cannot be opened (visible reason, no evidence).
    const t05 = taskOf(lv, 'A2-03-L2-T05');
    expect(t05.state).toBe('quarantined');
    const sess = await h.req('GET', `/api/v1/resources/session/${sessionId}`, { cookie: true });
    expect(sess.body.data.taskRevisionIds).not.toContain(t05.taskRevisionId);
    const q = await send(h, command(h, 'context.open', uuid(), 0, { sessionId, taskRevisionId: t05.taskRevisionId }));
    expect(q.status).toBe(422);
    expect(q.body.code).toBe('TASK_NOT_IN_SESSION');

    // Quarantining an item that already has evidence excludes that evidence from the projection.
    const t02 = taskOf(lv, 'A2-03-L2-T02');
    const c = await openTask(h, sessionId, t02.taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const a3 = (await submit(h, c, { text: 'hecho' })).body.entities[0].id;
    const v2 = build('quarantine', { mutate: (e) => (e.tasks.find((x: any) => x.id === 'A2-03-L2-T02').reviewStatus = 'quarantined') });
    await installPack(h.store, v2.dir);
    const lv2 = await lessonView(h, 'A2-03-L2');
    expect(taskOf(lv2, 'A2-03-L2-T02').state).toBe('quarantined');
    const meta = JSON.parse((h.store.db().prepare('SELECT scheduler_state FROM profiles').get() as { scheduler_state: string }).scheduler_state);
    expect(meta.invalidatedTaskRevisions).toContain(t02.taskRevisionId);
    const ts = JSON.parse((h.store.db().prepare("SELECT state FROM target_states WHERE skill_id = 'participle.hecho'").get() as { state: string }).state);
    const entry = ts.journal.find((j: any) => j.kind === 'attempt' && j.attemptId === a3);
    expect(entry.invalidated).toBe(true);
    // History stays readable and unchanged (append-only); only projections exclude it.
    expect((await attempt(h, a3)).verdicts[0]).toMatchObject({ correctness: 'correct' });
  });
});
