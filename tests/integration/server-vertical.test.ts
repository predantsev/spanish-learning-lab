// Vertical path: store → auth exchange → session/context/draft/attempt commands → home/lesson/
// exercise views → media. Every JSON response is validated against its OpenAPI response schema.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { command, contractErrors, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';

let h: Harness;

beforeAll(async () => {
  h = await startHarness();
});
afterAll(async () => {
  await h.close();
});

describe('vertical path', () => {
  it('health is public and minimal; capabilities need auth', async () => {
    const health = await h.req('GET', '/api/v1/health');
    expect(health.status).toBe(200);
    expect(contractErrors('get_health', 200, health.body)).toBeUndefined();
    expect(Object.keys(health.body).sort()).toEqual(['apiVersion', 'instanceId', 'status', 'storageWritable']);
    expect((await h.req('GET', '/api/v1/capabilities')).status).toBe(401);
    const caps = await h.req('GET', '/api/v1/capabilities', { cookie: true });
    expect(caps.status).toBe(200);
    expect(contractErrors('get_capabilities', 200, caps.body)).toBeUndefined();
    expect(caps.body.packHash).toMatch(/^[a-f0-9]{64}$/);
    expect(caps.body.commandKinds).not.toContain('content.promote');
  });

  it('session read returns the same CSRF token, never a new cookie', async () => {
    const s = await h.req('GET', '/api/v1/auth/session', { cookie: true });
    expect(s.status).toBe(200);
    expect(contractErrors('get_auth_session', 200, s.body)).toBeUndefined();
    expect(s.body.data.csrfToken).toBe(h.owner.csrf);
    expect(s.headers['set-cookie']).toBeUndefined();
  });

  it('runs a lesson: start → open → lease → save → submit → views', async () => {
    const home = await h.req('GET', '/api/v1/views/home', { cookie: true });
    expect(home.status).toBe(200);
    expect(contractErrors('get_views_home', 200, home.body)).toBeUndefined();
    expect(home.body.data.firstUse).toBe(true);
    expect(home.body.data.pack.state).toBe('ready');
    expect(home.body.data.nextLesson.lessonId).toBe('A1-05-L1');

    const lesson = await h.req('GET', '/api/v1/views/lessons/A2-03-L2', { cookie: true });
    expect(lesson.status).toBe(200);
    expect(contractErrors('get_views_lessons_lessonId', 200, lesson.body)).toBeUndefined();
    const lv = lesson.body.data;
    expect(lv.progress.status).toBe('not-started');
    // No answer keys, outcomes, error variants, rubric exemplars, reference answers or hint bodies.
    for (const leak of ['accepted', 'outcomes', 'hacido', 'referenceAnswer', 'exemplars', 'Hoy he hecho la compra', 'criteriaUk']) {
      expect(JSON.stringify(lv), leak).not.toContain(leak);
    }
    const supportedTask = lv.steps.find((s: any) => s.id === 's2').tasks[0];
    expect(supportedTask.hints.map((x: any) => x.kind)).toEqual(['rule', 'reveal']);

    const sessionId = uuid();
    const start = await send(h, command(h, 'session.start', sessionId, 0, { source: 'lesson', sourceId: lv.revisionId, targets: [], mode: 'learn', minutes: 10, maxItems: 30 }));
    expect(start.status).toBe(200);
    expect(contractErrors('post_commands', 200, start.body)).toBeUndefined();
    expect(start.body.outcome).toBe('created');

    const visit = await send(h, command(h, 'lesson.progress', uuid(), 0, { sessionId, stepId: 's1', action: 'visit' }));
    expect(visit.status).toBe(200);
    expect(visit.body.outcome).toBe('created');

    const contextId = uuid();
    const open = await send(h, command(h, 'context.open', contextId, 0, { sessionId, taskRevisionId: supportedTask.taskRevisionId }));
    expect(open.status).toBe(200);
    const draftRef = open.body.entities.find((e: any) => e.resourceType === 'draft');

    const ctx = await h.req('GET', `/api/v1/contexts/${contextId}`, { cookie: true });
    expect(ctx.status).toBe(200);
    expect(contractErrors('get_contexts_id', 200, ctx.body)).toBeUndefined();
    const snapshot = ctx.body.data.snapshotToken;
    expect(snapshot).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(JSON.stringify(ctx.body.data.task)).not.toContain('hacido');

    const save = await send(
      h,
      command(h, 'draft.save', draftRef.id, 1, { text: 'hecho', cursor: 5, taskRevisionId: supportedTask.taskRevisionId }, { contextId, contextRevision: 1, contextSnapshot: snapshot }),
    );
    expect(save.status).toBe(200);
    expect(save.body.entities[0]).toEqual({ id: draftRef.id, revision: 2, resourceType: 'draft' });

    const attemptId = uuid();
    const submit = await send(
      h,
      command(h, 'attempt.submit', attemptId, 0, { draftId: draftRef.id, draftRevision: 2, taskRevisionId: supportedTask.taskRevisionId, response: { text: '  Hecho ' } }, { contextId, contextRevision: 1, contextSnapshot: snapshot }),
    );
    expect(submit.status).toBe(200);
    expect(contractErrors('post_commands', 200, submit.body)).toBeUndefined();
    expect(submit.body.outcome).toBe('checked');

    const attempt = await h.req('GET', `/api/v1/resources/attempt/${attemptId}`, { cookie: true });
    expect(attempt.status).toBe(200);
    expect(contractErrors('get_resources_resourceType_id', 200, attempt.body)).toBeUndefined();
    expect(attempt.body.data.verdicts).toEqual([
      { target: { skillId: 'participle.hecho', modality: 'written-form' }, correctness: 'correct', independence: 'independent', explanationKey: 'check.correct', matchedVariantId: 'v1' },
    ]);

    const exercise = await h.req('GET', `/api/v1/views/exercises/${supportedTask.taskRevisionId}`, { cookie: true });
    expect(exercise.status).toBe(200);
    expect(contractErrors('get_views_exercises_taskRevisionId', 200, exercise.body)).toBeUndefined();

    const home2 = await h.req('GET', '/api/v1/views/home', { cookie: true });
    expect(home2.body.data.firstUse).toBe(false);
    expect(home2.body.data.evidence.introduced).toBeGreaterThanOrEqual(1);
    for (const view of ['progress', 'phrases', 'listening']) {
      const r = await h.req('GET', `/api/v1/views/${view}`, { cookie: true });
      expect(r.status, view).toBe(200);
      expect(contractErrors(`get_views_${view}`, 200, r.body), view).toBeUndefined();
    }
    const mats = await h.req('GET', '/api/v1/views/materials/A2-03', { cookie: true });
    expect(mats.status).toBe(200);
    expect(contractErrors('get_views_materials_topicId', 200, mats.body)).toBeUndefined();
  });

  it('serves installed media with bounded Range support to the owner only', async () => {
    const hash = h.pack!.clipHashes['clip.shop.more.a']!;
    const full = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true });
    expect(full.status).toBe(200);
    expect(full.headers['content-type']).toBe('audio/mpeg');
    expect(full.headers['x-content-type-options']).toBe('nosniff');
    expect(full.raw.length).toBe(4096);
    const part = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true, headers: { range: 'bytes=10-19' } });
    expect(part.status).toBe(206);
    expect(part.headers['content-range']).toBe('bytes 10-19/4096');
    expect(part.raw.length).toBe(10);
    const bad = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true, headers: { range: 'bytes=5000-6000' } });
    expect(bad.status).toBe(416);
    expect(bad.headers['content-range']).toBe('bytes */4096');
    const multi = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true, headers: { range: 'bytes=0-1,5-6' } });
    expect(multi.status).toBe(416);
    expect(contractErrors('get_media_sha256', 416, multi.body)).toBeUndefined();
    const anon = await h.req('GET', `/api/v1/media/${hash}`);
    expect(anon.status).toBe(401);
    expect(contractErrors('get_media_sha256', 401, anon.body)).toBeUndefined();
    const missing = await h.req('GET', `/api/v1/media/${'0'.repeat(64)}`, { cookie: true });
    expect(missing.status).toBe(404);
    expect(contractErrors('get_media_sha256', 404, missing.body)).toBeUndefined();
  });
});
