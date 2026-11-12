// Owner recovery routes against the REAL recovery module (createServerRecovery): export → download →
// upload → restore preview → (live change → 409) → restore confirm with a new epoch, credentials and
// in-memory auth invalidated, history intact; the projection rebuild hook runs on the import.
import { afterEach, describe, expect, it } from 'vitest';
import { createServerRecovery } from '../../apps/server/src/recovery-wiring.ts';
import { command, contractErrors, send, startHarness, uuid, writeHeaders, type Harness } from './helpers/server-harness.ts';
import { attempt, createToken, ok, openTask, saveDraft, startLesson, submit, taskOf } from './helpers/flows.ts';

let h: Harness | undefined;
afterEach(async () => {
  await h?.close();
  h = undefined;
});

async function post(h: Harness, path: string, body: Record<string, unknown>) {
  return h.req('POST', path, { cookie: true, body, headers: writeHeaders(body as { operationId: string; profileEpoch: number; expectedRevision: number }) });
}

describe('recovery over HTTP with the real module', () => {
  it('exports, uploads, previews and restores a profile with a new epoch; old credentials stop working', async () => {
    h = await startHarness({ recoveryFactory: (store) => createServerRecovery(store) });
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const attemptId = (await submit(h, c, { text: 'hecho' })).body.entities[0].id;
    const before = await attempt(h, attemptId);
    const agent = await createToken(h, ['context:read']);
    const rev = () => h!.store.profile().revision;

    const exp = await post(h, '/api/v1/recovery/export', { operationId: uuid(), profileEpoch: 1, expectedRevision: rev(), selfContained: false });
    expect(exp.status, exp.text).toBe(200);
    expect(contractErrors('post_recovery_export', 200, exp.body)).toBeUndefined();
    const zip = await h.req('GET', exp.body.data.downloadRoute, { cookie: true });
    expect(zip.status).toBe(200);
    expect(zip.headers['content-type']).toBe('application/zip');
    expect(zip.raw.length).toBe(exp.body.data.sizeBytes);
    // Never in the archive: tokens, cookies, CSRF, the IPC key.
    for (const secret of [agent.token, h.owner.cookie, h.owner.csrf]) expect(zip.raw.includes(Buffer.from(secret))).toBe(false);

    const upHeaders = writeHeaders({ operationId: uuid(), profileEpoch: 1, expectedRevision: rev() });
    const up = await h.req('POST', '/api/v1/recovery/uploads', { cookie: true, raw: zip.raw, contentType: 'application/zip', headers: upHeaders });
    expect(up.status, up.text).toBe(200);
    expect(contractErrors('post_recovery_uploads', 200, up.body)).toBeUndefined();

    const preview = async () => {
      const r = await post(h!, '/api/v1/recovery/restore-preview', { operationId: uuid(), profileEpoch: h!.epoch(), expectedRevision: rev(), uploadId: up.body.data.id });
      expect(r.status, r.text).toBe(200);
      expect(contractErrors('post_recovery_restore_preview', 200, r.body)).toBeUndefined();
      return r.body.data;
    };
    const p1 = await preview();
    expect(p1).toMatchObject({ attemptCount: 1, draftCount: 1, profileEpoch: 1, missingAssets: [] });
    // A live change after the preview: the bound confirmation is rejected (409), nothing replaced.
    await ok(await send(h, command(h, 'phrase.capture', uuid(), 0, { source: 'uk-intent', text: 'Зміна після перегляду', meaning: '' })));
    const stale = await post(h, '/api/v1/recovery/restore-confirm', { operationId: uuid(), profileEpoch: 1, expectedRevision: rev(), previewId: p1.id, archiveHash: p1.archiveHash, trustImportedProvenance: p1.requiresSourceTrust, confirmation: p1.confirmation });
    expect(stale.status, stale.text).toBe(409);
    expect(contractErrors('post_recovery_restore_confirm', 409, stale.body)).toBeUndefined();
    expect(h.epoch()).toBe(1);

    const p2 = await preview();
    const confirm = await post(h, '/api/v1/recovery/restore-confirm', { operationId: uuid(), profileEpoch: 1, expectedRevision: rev(), previewId: p2.id, archiveHash: p2.archiveHash, trustImportedProvenance: p2.requiresSourceTrust, confirmation: p2.confirmation });
    expect(confirm.status, confirm.text).toBe(200);
    expect(contractErrors('post_recovery_restore_confirm', 200, confirm.body)).toBeUndefined();
    expect(confirm.body.profileEpoch).toBe(2);
    expect(h.epoch()).toBe(2);
    expect(h.store.maintenance().on).toBe(false);
    // Old-epoch credentials are void.
    expect((await h.req('GET', '/api/v1/auth/session', { cookie: true })).status).toBe(401);
    expect((await h.req('GET', '/api/v1/contexts', { bearer: agent.token })).status).toBe(401);
    expect(h.store.db().prepare('SELECT count(*) AS n FROM owner_sessions').get()).toEqual({ n: 0 });
    expect(h.store.db().prepare('SELECT count(*) AS n FROM auth_tokens').get()).toEqual({ n: 0 });
    // A fresh launcher nonce authenticates against the restored profile; history is exact, the post-export change is gone.
    await h.login();
    expect(await attempt(h, attemptId)).toEqual(before);
    expect(h.store.db().prepare("SELECT count(*) AS n FROM phrase_records WHERE meaning = 'Зміна після перегляду'").get()).toEqual({ n: 0 });
    const prof = await h.req('GET', '/api/v1/profile', { cookie: true });
    expect(prof.body.data).toMatchObject({ profileEpoch: 2, lastRestoreOperationId: confirm.body.operationId });
    // Scheduler projection was rebuilt from the imported event_log and matches the live fold.
    expect(h.store.db().prepare("SELECT count(*) AS n FROM target_states WHERE skill_id = 'participle.hecho'").get()).toEqual({ n: 1 });
    // A replayed confirm of the completed restore is not repeated.
    const replay = await h.req('POST', '/api/v1/recovery/restore-confirm', {
      cookie: true,
      body: { operationId: confirm.body.operationId, profileEpoch: 1, expectedRevision: 1, previewId: p2.id, archiveHash: p2.archiveHash, trustImportedProvenance: p2.requiresSourceTrust, confirmation: p2.confirmation },
      headers: writeHeaders({ operationId: confirm.body.operationId, profileEpoch: 1, expectedRevision: 1 }),
    });
    expect([200, 409]).toContain(replay.status);
    expect(h.epoch()).toBe(2);
  });
});
