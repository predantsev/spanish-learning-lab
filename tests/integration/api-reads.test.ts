// Catalog search/filters/cursors, object-level resource scopes, profile settings with timezone
// preview, preferences, review drafts and the owner recovery routes (stub Recovery) — every
// response validated against its OpenAPI schema.
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Recovery } from '../../apps/server/src/recovery/types.ts';
import { installPack } from '../../apps/server/src/content/install.ts';
import { buildSyntheticPack } from '../fixtures/pack-synthetic/build-pack.ts';
import { command, contractErrors, send, startHarness, uuid, writeHeaders, type Harness } from './helpers/server-harness.ts';
import { createToken, ok, openTask, saveDraft, startLesson, submit, taskOf } from './helpers/flows.ts';

let h: Harness;
afterEach(async () => {
  await h?.close();
});

describe('catalog', () => {
  beforeEach(async () => {
    h = await startHarness();
  });

  const cat = async (qs: string, opts = { cookie: true as boolean | string }) => {
    const r = await h.req('GET', `/api/v1/catalog${qs}`, opts);
    if (r.status === 200) expect(contractErrors('get_catalog', 200, r.body)).toBeUndefined();
    return r;
  };

  it('searches Ukrainian titles, Spanish terms and explicit aliases accent-insensitively', async () => {
    const all = await cat('');
    expect(all.body.data.items.map((x: any) => x.id)).toEqual(['A1-05-L1', 'A2-03-L1', 'A2-03-L2', 'A2-03-C1']);
    expect((await cat('?query=hecho')).body.data.items.map((x: any) => x.id)).toEqual(['A2-03-L2']);
    expect((await cat('?query=HECHO')).body.data.items.map((x: any) => x.id)).toEqual(['A2-03-L2']);
    expect((await cat('?query=mas')).body.data.items.map((x: any) => x.id)).toEqual(['A1-05-L1']);
    expect((await cat(`?query=${encodeURIComponent('Причастя')}`)).body.data.items.map((x: any) => x.id)).toEqual(['A2-03-L2']);
    expect((await cat('?query=pan')).body.data.items.map((x: any) => x.id)).toEqual(['A1-05-L1']);
    expect((await cat('?block=A2-03&mode=written')).body.data.items.map((x: any) => x.id)).toEqual(['A2-03-L1', 'A2-03-L2', 'A2-03-C1']);
    expect((await cat('?mode=listening')).body.data.items.map((x: any) => x.id)).toEqual(['A1-05-L1']);
    expect((await cat('?situation=shop')).body.data.items.map((x: any) => x.id)).toEqual(['A1-05-L1']);
    expect((await cat(`?query=${'x'.repeat(101)}`)).status).toBe(422);
    expect((await cat('?limit=0')).status).toBe(422);
    expect((await cat('?unknown=1')).status).toBe(422);
  });

  it('pages with opaque cursors bound to filter + revision; stale/expired cursors give 409 STALE_CURSOR', async () => {
    const p1 = await cat('?limit=2');
    expect(p1.body.data.items).toHaveLength(2);
    const cursor = p1.body.data.nextCursor as string;
    expect(cursor.length).toBeGreaterThan(0);
    const p2 = await cat(`?limit=2&cursor=${encodeURIComponent(cursor)}`);
    expect(p2.body.data.items.map((x: any) => x.id)).toEqual(['A2-03-L2', 'A2-03-C1']);
    expect(p2.body.data.nextCursor).toBe('');
    const otherFilter = await cat(`?limit=2&block=A2-03&cursor=${encodeURIComponent(cursor)}`);
    expect(otherFilter.status).toBe(409);
    expect(otherFilter.body.code).toBe('STALE_CURSOR');
    expect(contractErrors('get_catalog', 409, otherFilter.body)).toBeUndefined();
    const forged = await cat(`?limit=2&cursor=${encodeURIComponent(cursor.slice(0, -2) + 'AA')}`);
    expect(forged.status).toBe(409);
    // A new content activation changes the catalog revision.
    const root = mkdtempSync(join(tmpdir(), 'sll-cat-'));
    try {
      await installPack(h.store, buildSyntheticPack(join(root, 'p'), { version: '0.0.9' }).dir);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
    expect((await cat(`?limit=2&cursor=${encodeURIComponent(cursor)}`)).body.code).toBe('STALE_CURSOR');
    const fresh = await cat('?limit=2');
    h.clock.advance(15 * 60_000 + 1);
    await h.login();
    expect((await cat(`?limit=2&cursor=${encodeURIComponent(fresh.body.data.nextCursor)}`)).body.code).toBe('STALE_CURSOR');
  });
});

describe('resources, profile, preferences and reviews', () => {
  beforeEach(async () => {
    h = await startHarness();
  });

  it('enforces object-level scopes and never exposes answer keys', async () => {
    const course = await createToken(h, ['course:read']);
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const attemptId = (await submit(h, c, { text: 'hecho' })).body.entities[0].id;
    const read = async (type: string, id: string, opts: any) => {
      const r = await h.req('GET', `/api/v1/resources/${type}/${id}`, opts);
      if (r.status === 200) expect(contractErrors('get_resources_resourceType_id', 200, r.body), type).toBeUndefined();
      return r;
    };
    const lessonRes = await read('lesson', lv.revisionId, { bearer: course.token });
    expect(lessonRes.status).toBe(200);
    expect(lessonRes.body.data).toMatchObject({ resourceType: 'lesson', logicalId: 'A2-03-L2', state: 'ready', topicId: 'A2-03' });
    const task = await read('task', c.taskRevisionId, { bearer: course.token });
    expect(task.status).toBe(200);
    expect(task.text).not.toMatch(/accepted|outcomes|referenceAnswer|hints/);
    const colId = (await h.req('GET', '/api/v1/views/phrases', { cookie: true })).body.data.collections[0].id;
    expect((await read('collection', colId, { bearer: course.token })).status).toBe(200);
    // course:read cannot read private learner records; the owner can.
    expect((await read('attempt', attemptId, { bearer: course.token })).status).toBe(403);
    expect((await read('session', sessionId, { bearer: course.token })).status).toBe(403);
    expect((await read('attempt', attemptId, { cookie: true })).status).toBe(200);
    expect((await read('lesson-progress', uuid(), { cookie: true })).status).toBe(404);
    expect((await h.req('GET', `/api/v1/resources/nothing/${uuid()}`, { cookie: true })).status).toBe(422);
    expect((await h.req('GET', '/api/v1/resources/task/not-a-uuid', { cookie: true })).status).toBe(404);
    // draft:write reads only what it created.
    const a = await createToken(h, ['draft:write']);
    const b = await createToken(h, ['draft:write']);
    const pid = uuid();
    await ok(await send(h, command(h, 'phrase.capture', pid, 0, { source: 'spanish', text: 'Quiero café.', meaning: 'Хочу кави' }), { bearer: a.token }));
    expect((await read('phrase', pid, { bearer: a.token })).status).toBe(200);
    expect((await read('phrase', pid, { bearer: b.token })).status).toBe(404);
  });

  it('profile settings need a matching timezone preview; preferences report their effect; reviews stay drafts', async () => {
    const prof = await h.req('GET', '/api/v1/profile', { cookie: true });
    expect(contractErrors('get_profile', 200, prof.body)).toBeUndefined();
    expect(prof.body.data).toMatchObject({ reviewTimezone: 'Europe/Madrid', audioSpeed: 1, theme: 'system', profileEpoch: 1 });
    const pid = prof.body.data.id;
    const rev = prof.body.data.revision;
    const noPreview = await send(h, command(h, 'profile.settings', pid, rev, { reviewTimezone: 'Asia/Tokyo' }));
    expect(noPreview.body.code).toBe('TIMEZONE_PREVIEW_REQUIRED');
    const badZone = await send(h, command(h, 'profile.timezone-preview', pid, rev, { reviewTimezone: 'Mars/Olympus' }));
    expect(badZone.body.code).toBe('INVALID_TIMEZONE');
    const preview = await ok(await send(h, command(h, 'profile.timezone-preview', pid, rev, { reviewTimezone: 'Asia/Tokyo' })));
    const previewId = preview.body.entities[0].id;
    const pv = await h.req('GET', `/api/v1/resources/timezone-preview/${previewId}`, { cookie: true });
    expect(contractErrors('get_resources_resourceType_id', 200, pv.body)).toBeUndefined();
    expect(pv.body.data).toMatchObject({ fromZone: 'Europe/Madrid', toZone: 'Asia/Tokyo', retainedDueDates: true, profileRevision: rev });
    const applied = await ok(await send(h, command(h, 'profile.settings', pid, rev, { reviewTimezone: 'Asia/Tokyo', timezonePreviewId: previewId, theme: 'dark', audioSpeed: 0.85 })));
    expect(applied.body.entities[0]).toEqual({ id: pid, revision: rev + 1, resourceType: 'profile' });
    const prof2 = await h.req('GET', '/api/v1/profile', { cookie: true });
    expect(prof2.body.data).toMatchObject({ reviewTimezone: 'Asia/Tokyo', theme: 'dark', audioSpeed: 0.85, revision: rev + 1 });
    const meta = JSON.parse((h.store.db().prepare('SELECT scheduler_state FROM profiles').get() as { scheduler_state: string }).scheduler_state);
    expect(meta.timezone).toBe('Asia/Tokyo');
    expect((await send(h, command(h, 'profile.settings', pid, rev + 1, {}))).body.code).toBe('SETTINGS_EMPTY');

    // Preferences: explicit targets, frequency/paused orthogonal; effect readable on the resource and progress view.
    const { sessionId } = await startLesson(h, 'A2-03-L2');
    await ok(await send(h, command(h, 'lesson.progress', uuid(), 0, { sessionId, stepId: 's1', action: 'visit' })));
    const HECHO = { skillId: 'participle.hecho', modality: 'written-form' };
    expect((await send(h, command(h, 'preference.set', uuid(), 0, { targets: [HECHO] }))).body.code).toBe('PREFERENCE_EMPTY');
    const prefId = uuid();
    await ok(await send(h, command(h, 'preference.set', prefId, 0, { targets: [HECHO], frequency: 'known', paused: true })));
    const pref = await h.req('GET', `/api/v1/resources/preference/${prefId}`, { cookie: true });
    expect(contractErrors('get_resources_resourceType_id', 200, pref.body)).toBeUndefined();
    expect(pref.body.data).toMatchObject({ frequency: 'known', paused: true });
    const progress = await h.req('GET', '/api/v1/views/progress', { cookie: true });
    expect(progress.body.data.targets.find((x: any) => x.target.skillId === 'participle.hecho')).toMatchObject({ frequency: 'known', paused: true, label: 'introduced' });

    // review.submit: a draft linked to the attempt with the exact answer hash; no verdict change.
    const { sessionId: s2, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, s2, taskOf(lv, 'A2-03-L2-T04').taskRevisionId);
    await ok(await saveDraft(h, c, 'Hoy he hecho la cena.', 1));
    const attemptId = (await submit(h, c, { text: 'Hoy he hecho la cena.' })).body.entities[0].id;
    const report = {
      provider: 'local', model: 'synthetic', effort: 'n/a', reviewedAt: h.clock.now().toISOString(), artifactHash: 'c'.repeat(64), authorProvider: 'other',
      verdicts: [{ target: HECHO, correctness: 'correct', independence: 'independent', explanationKey: 'review.correct' }],
      sources: [{ url: 'https://example.invalid/synthetic', passage: 'synthetic', checkedAt: h.clock.now().toISOString(), finding: 'synthetic' }],
      uncertainties: [], findings: [],
    };
    const answerHash = createHash('sha256').update('Hoy he hecho la cena.').digest('hex');
    const reviewer = await createToken(h, ['draft:write']);
    const wrong = await send(h, command(h, 'review.submit', uuid(), 0, { attemptId, taskRevisionId: c.taskRevisionId, answerHash: 'd'.repeat(64), report }), { bearer: reviewer.token });
    expect(wrong.body.code).toBe('ANSWER_HASH_MISMATCH');
    const reviewId = uuid();
    await ok(await send(h, command(h, 'review.submit', reviewId, 0, { attemptId, taskRevisionId: c.taskRevisionId, answerHash, report }), { bearer: reviewer.token }));
    const review = await h.req('GET', `/api/v1/resources/review/${reviewId}`, { bearer: reviewer.token });
    expect(contractErrors('get_resources_resourceType_id', 200, review.body)).toBeUndefined();
    expect(review.body.data).toMatchObject({ state: 'draft', attemptId });
    const att = await h.req('GET', `/api/v1/resources/attempt/${attemptId}`, { cookie: true });
    expect(att.body.data.verdicts[0].correctness).toBe('unresolved');
    expect(att.body.data.adjudicationIds).toEqual([]);
  });
});

describe('recovery routes', () => {
  it('answer 503 without a wired recovery module', async () => {
    h = await startHarness();
    const body = { operationId: uuid(), profileEpoch: 1, expectedRevision: 1, selfContained: false };
    const r = await h.req('POST', '/api/v1/recovery/export', { cookie: true, body, headers: writeHeaders(body) });
    expect(r.status).toBe(503);
    expect(r.body.code).toBe('RECOVERY_UNAVAILABLE');
    expect(contractErrors('post_recovery_export', 503, r.body)).toBeUndefined();
  });

  it('adapt export, upload, preview, confirm and download to the Recovery interface', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'sll-rec-'));
    const file = join(dir, 'export.zip');
    writeFileSync(file, Buffer.from('PK\u0003\u0004synthetic-zip'));
    const artifact = { id: uuid(), path: file, sha256: 'e'.repeat(64), sizeBytes: 21, expiresAt: '2026-10-01T08:15:00.000Z' };
    let uploaded = 0;
    const calls: string[] = [];
    const stub: Recovery = {
      start: async () => undefined,
      noteCommitted: () => undefined,
      backupNow: async () => ({ id: uuid(), kind: 'manual', relPath: 'x', sha256: 'a'.repeat(64), bytes: 1, eventSeq: 0, localDate: '2026-10-01' }),
      exportProfile: async () => (calls.push('export'), artifact),
      storeUpload: async (body: Readable) => {
        for await (const chunk of body) uploaded += (chunk as Buffer).length;
        calls.push('upload');
        return { ...artifact, id: uuid() };
      },
      previewRestore: async (uploadId: string) => (calls.push(`preview:${uploadId}`), {
        id: uuid(), archiveHash: 'f'.repeat(64), liveEventSeq: 3, profileEpoch: 1, profileId: uuid(), attemptCount: 0, draftCount: 0, schemaVersion: 2,
        missingAssets: [], unverifiedHistoricalReceiptCount: 0, requiresSourceTrust: false, confirmation: 'c'.repeat(43), expiresAt: '2026-10-01T08:05:00.000Z',
      }),
      confirmRestore: async (input) => {
        calls.push('confirm');
        h.store.db().prepare('UPDATE profiles SET epoch = 2').run();
        return { operationId: input.operationId, newEpoch: 2, archiveHash: input.archiveHash, profileId: uuid() };
      },
      download: (id: string) => (id === artifact.id ? artifact : undefined),
      stop: async () => undefined,
    };
    h = await startHarness({ recovery: stub });
    try {
      const rev = () => h.store.profile().revision;
      const exp = { operationId: uuid(), profileEpoch: 1, expectedRevision: rev(), selfContained: true };
      const e = await h.req('POST', '/api/v1/recovery/export', { cookie: true, body: exp, headers: writeHeaders(exp) });
      expect(e.status).toBe(200);
      expect(contractErrors('post_recovery_export', 200, e.body)).toBeUndefined();
      expect(e.body.data.downloadRoute).toBe(`/api/v1/recovery/downloads/${artifact.id}`);
      const again = await h.req('POST', '/api/v1/recovery/export', { cookie: true, body: exp, headers: writeHeaders(exp) });
      expect(again.body.data).toEqual(e.body.data);
      expect(calls.filter((c) => c === 'export')).toHaveLength(1);
      const dl = await h.req('GET', e.body.data.downloadRoute, { cookie: true });
      expect(dl.status).toBe(200);
      expect(dl.headers['content-type']).toBe('application/zip');
      expect((await h.req('GET', e.body.data.downloadRoute, { cookie: true, headers: { range: 'bytes=0-1' } })).status).toBe(206);

      const upHeaders = writeHeaders({ operationId: uuid(), profileEpoch: 1, expectedRevision: rev() });
      const up = await h.req('POST', '/api/v1/recovery/uploads', { cookie: true, raw: Buffer.alloc(100 * 1024, 1), contentType: 'application/zip', headers: upHeaders });
      expect(up.status, up.text).toBe(200);
      expect(contractErrors('post_recovery_uploads', 200, up.body)).toBeUndefined();
      expect(uploaded).toBe(100 * 1024);
      expect((await h.req('POST', '/api/v1/commands', { cookie: true, raw: 'PK', contentType: 'application/zip' })).status).toBe(400);

      const pre = { operationId: uuid(), profileEpoch: 1, expectedRevision: rev(), uploadId: up.body.data.id };
      const p = await h.req('POST', '/api/v1/recovery/restore-preview', { cookie: true, body: pre, headers: writeHeaders(pre) });
      expect(p.status).toBe(200);
      expect(contractErrors('post_recovery_restore_preview', 200, p.body)).toBeUndefined();

      const conf = { operationId: uuid(), profileEpoch: 1, expectedRevision: rev(), previewId: p.body.data.id, archiveHash: p.body.data.archiveHash, trustImportedProvenance: false, confirmation: p.body.data.confirmation };
      const agent = await createToken(h, ['context:read']);
      expect((await h.req('POST', '/api/v1/recovery/restore-confirm', { bearer: agent.token, body: conf, headers: writeHeaders(conf) })).status).toBe(403);
      const cr = await h.req('POST', '/api/v1/recovery/restore-confirm', { cookie: true, body: { ...conf, expectedRevision: rev() }, headers: writeHeaders({ ...conf, expectedRevision: rev() }) });
      expect(cr.status, cr.text).toBe(200);
      expect(contractErrors('post_recovery_restore_confirm', 200, cr.body)).toBeUndefined();
      expect(cr.body.profileEpoch).toBe(2);
      // Old-epoch credentials are void: the session and agent tokens no longer work.
      expect((await h.req('GET', '/api/v1/auth/session', { cookie: true })).status).toBe(401);
      expect((await h.req('GET', '/api/v1/contexts', { bearer: agent.token })).status).toBe(401);
      expect(calls).toContain('confirm');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
