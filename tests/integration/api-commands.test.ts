// A-03 (idempotency/lost response), A-04 (two tabs, distinct contexts, polling), A-24 (context
// selection, leases, stale writes), lesson completion, session summary and recommended review.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { command, contractErrors, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';
import { attempt, createToken, lessonView, ok, openTask, rowCount, saveDraft, snapshot, startLesson, submit, taskOf } from './helpers/flows.ts';

let h: Harness;
beforeEach(async () => {
  h = await startHarness();
});
afterEach(async () => {
  await h.close();
});

describe('A-03 idempotent commands', () => {
  it('replays the original receipt once, rejects a changed body and a stale fresh write, authenticates first', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const task = taskOf(lv, 'A2-03-L2-T02');
    const c = await openTask(h, sessionId, task.taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const s = await snapshot(h, c.contextId);
    const k = command(h, 'attempt.submit', uuid(), 0, { draftId: c.draftId, draftRevision: 2, taskRevisionId: c.taskRevisionId, response: { text: 'hecho' } }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token });
    const first = await send(h, k); // response "lost" by the client
    expect(first.status).toBe(200);
    const counts = async () => ({
      attempts: await rowCount(h, 'SELECT count(*) AS n FROM attempts'),
      results: await rowCount(h, 'SELECT count(*) AS n FROM target_results'),
      events: await rowCount(h, 'SELECT count(*) AS n FROM event_log'),
      receipts: await rowCount(h, 'SELECT count(*) AS n FROM mutation_receipts'),
      targetRevision: await rowCount(h, "SELECT revision AS n FROM target_states WHERE skill_id = 'participle.hecho'"),
    });
    const before = await counts();
    expect(before.attempts).toBe(1);

    // Same key + identical body + old If-Match, after the context revision moved on: original receipt.
    const replay = await send(h, k);
    expect(replay.status).toBe(200);
    expect(replay.body).toEqual(first.body);
    expect(await counts()).toEqual(before);

    // Same key, different answer: 409 IDEMPOTENCY_CONFLICT, nothing written.
    const changed = { body: { ...k.body, payload: { ...(k.body.payload as object), response: { text: 'hacido' } } }, headers: k.headers };
    const conflictRes = await send(h, changed);
    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.code).toBe('IDEMPOTENCY_CONFLICT');
    expect(contractErrors('post_commands', 409, conflictRes.body)).toBeUndefined();
    expect(await counts()).toEqual(before);

    // Fresh key against the stale context revision: 409 STALE_REVISION with the current revision.
    const stale = await send(h, command(h, 'attempt.submit', uuid(), 0, { draftId: c.draftId, draftRevision: 2, taskRevisionId: c.taskRevisionId, response: { text: 'hecho' } }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token }));
    expect(stale.status).toBe(409);
    expect(stale.body).toMatchObject({ code: 'STALE_REVISION', currentRevision: s.revision + 1, messageKey: 'error.staleRevision', retryable: false });
    expect(await counts()).toEqual(before);

    // Authentication precedes receipt lookup: no credentials → 401, not the stored receipt.
    const anon = await send(h, k, { cookie: false });
    expect(anon.status).toBe(401);
    expect(anon.body.code).toBe('AUTH_REQUIRED');
    // A token without the authority for this kind never receives the owner's receipt.
    const agent = await createToken(h, ['context:read']);
    const agentReplay = await send(h, k, { bearer: agent.token });
    expect(agentReplay.status).toBe(403);
    // The receipt itself stays readable by the owner through GET /operations/{id}.
    const op = await h.req('GET', `/api/v1/operations/${k.body.operationId}`, { cookie: true });
    expect(op.status).toBe(200);
    expect(op.body).toEqual(first.body);
    expect(contractErrors('get_operations_operationId', 200, op.body)).toBeUndefined();
  });

  it('rejects header/body mismatches and wrong epochs', async () => {
    const c = command(h, 'session.start', uuid(), 0, { source: 'recommended', targets: [], mode: 'review', minutes: 10, maxItems: 10 });
    expect((await send(h, { body: c.body, headers: { ...c.headers, 'idempotency-key': uuid() } })).body.code).toBe('IDEMPOTENCY_KEY_MISMATCH');
    expect((await send(h, { body: c.body, headers: { ...c.headers, 'if-match': '"7"' } })).body.code).toBe('IF_MATCH_MISMATCH');
    expect((await send(h, { body: c.body, headers: { ...c.headers, 'x-profile-epoch': '9' } })).body.code).toBe('EPOCH_HEADER_MISMATCH');
    const wrongEpoch = { ...c.body, profileEpoch: 9 };
    const r = await send(h, { body: wrongEpoch, headers: { ...c.headers, 'x-profile-epoch': '9' } });
    expect(r.status).toBe(409);
    expect(r.body.code).toBe('EPOCH_MISMATCH');
  });
});

describe('A-04 tabs, drafts and activity', () => {
  it('keeps both drafts on a two-tab conflict and never overwrites the newer one', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    const tabA = await saveDraft(h, c, 'texto de A', 1);
    expect(tabA.status).toBe(200);
    const opB = uuid();
    const tabB = await saveDraft(h, c, 'texto de B', 1, { cookie: true }, opB);
    expect(tabB.status).toBe(409);
    expect(tabB.body).toMatchObject({ code: 'STALE_REVISION', currentRevision: 2 });
    const ctx = await snapshot(h, c.contextId);
    expect(ctx.body.draft.text).toBe('texto de A');
    const recovered = h.store.db().prepare('SELECT text FROM drafts WHERE recovered_from_operation_id = ?').all(opB) as Array<{ text: string }>;
    expect(recovered).toEqual([{ text: 'texto de B' }]);
    // Retrying the same failed operation keeps exactly one recovered copy.
    expect((await saveDraft(h, c, 'texto de B', 1, { cookie: true }, opB)).status).toBe(409);
    expect(await rowCount(h, 'SELECT count(*) AS n FROM drafts WHERE recovered_from_operation_id = ?', opB)).toBe(1);
  });

  it('keeps distinct contexts independent; reads and polling never count as activity', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const a = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T01').taskRevisionId);
    const b = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, a, 'uno', 1));
    h.clock.advance(1000);
    await ok(await saveDraft(h, b, 'dos', 1));
    expect((await snapshot(h, a.contextId)).body.draft.text).toBe('uno');
    expect((await snapshot(h, b.contextId)).body.draft.text).toBe('dos');
    const list1 = await h.req('GET', '/api/v1/contexts', { cookie: true });
    expect(contractErrors('get_contexts', 200, list1.body)).toBeUndefined();
    h.clock.advance(60_000);
    for (let i = 0; i < 3; i++) await snapshot(h, a.contextId);
    const list2 = await h.req('GET', '/api/v1/contexts', { cookie: true });
    expect(list2.body.data.items).toEqual(list1.body.data.items);
    expect(list2.body.data.items[0].id).toBe(b.contextId);

    // Typing activity is coalesced to once per 5 s and never changes the context revision.
    const act = async (activity: string) => {
      const s = await snapshot(h, a.contextId);
      return send(h, command(h, 'context.activity', a.contextId, s.revision, { activity, draftRevision: s.draftRevision }, { contextId: a.contextId, contextRevision: s.revision, contextSnapshot: s.token }));
    };
    expect((await act('typing')).body.outcome).toBe('updated');
    expect((await act('typing')).body.outcome).toBe('unchanged');
    h.clock.advance(5_000);
    const third = await act('typing');
    expect(third.body.outcome).toBe('updated');
    expect(third.body.entities[0].revision).toBe(1);
    const list3 = await h.req('GET', '/api/v1/contexts', { cookie: true });
    expect(list3.body.data.items[0].id).toBe(a.contextId);
  });

  it('a second browser tab reuses the session and CSRF token; a bad nonce never destroys the session', async () => {
    const nonce = h.app.registerNonce();
    const again = await h.req('POST', '/api/v1/auth/exchange', { body: { nonce }, cookie: true, csrf: false });
    expect(again.status).toBe(200);
    expect(contractErrors('post_auth_exchange', 200, again.body)).toBeUndefined();
    expect(again.body.data.csrfToken).toBe(h.owner.csrf);
    expect(again.headers['set-cookie']).toBeUndefined();
    const bad = await h.req('POST', '/api/v1/auth/exchange', { body: { nonce }, cookie: true, csrf: false });
    expect(bad.status).toBe(401);
    expect(bad.body.code).toBe('NONCE_INVALID');
    expect((await h.req('GET', '/api/v1/auth/session', { cookie: true })).status).toBe(200);
    // Expired nonce (60 s) is rejected.
    const late = h.app.registerNonce();
    h.clock.advance(61_000);
    expect((await h.req('POST', '/api/v1/auth/exchange', { body: { nonce: late }, origin: h.origin })).status).toBe(401);
  });
});

describe('A-24 agent context selection and leases', () => {
  it('lists metadata only, issues per-client 60 s leases and rejects stale/expired/foreign snapshots', async () => {
    const agent = await createToken(h, ['context:read', 'help:write']);
    expect(agent.res.status).toBe(200);
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const ids: string[] = [];
    for (const logical of ['A2-03-L2-T01', 'A2-03-L2-T02', 'A2-03-L2-T04']) {
      const c = await openTask(h, sessionId, taskOf(lv, logical).taskRevisionId);
      await ok(await saveDraft(h, c, `privado ${logical}`, 1));
      ids.push(c.contextId);
      h.clock.advance(30_000);
    }
    const list = await h.req('GET', '/api/v1/contexts', { bearer: agent.token });
    expect(list.status).toBe(200);
    expect(contractErrors('get_contexts', 200, list.body)).toBeUndefined();
    expect(list.body.data.items.map((x: any) => x.id)).toEqual([...ids].reverse());
    expect(list.text).not.toContain('privado');

    const target = ids[1]!;
    const detail = await h.req('GET', `/api/v1/contexts/${target}`, { bearer: agent.token });
    expect(detail.status).toBe(200);
    expect(contractErrors('get_contexts_id', 200, detail.body)).toBeUndefined();
    const tr = detail.body.data.task.id;
    const prep = (snap: string, rev: number, bearer = agent.token) =>
      send(
        h,
        command(h, 'support.prepare', uuid(), 0, { targets: [{ skillId: 'participle.hecho', modality: 'written-form' }], kind: 'targeted-clue', blocks: [{ type: 'paragraph', language: 'uk', text: 'Синтетична підказка' }], taskRevisionId: tr, deliveryRoute: 'external' }, { contextId: target, contextRevision: rev, contextSnapshot: snap }),
        { bearer },
      );
    // The owner's snapshot is bound to the owner session: rejected for the agent even with an unchanged revision.
    const ownerSnap = await snapshot(h, target);
    const foreign = await prep(ownerSnap.token, ownerSnap.revision);
    expect(foreign.status).toBe(409);
    expect(foreign.body.code).toBe('SNAPSHOT_INVALID');
    // Expired lease (61 s) with an unchanged context revision.
    h.clock.advance(61_000);
    const expired = await prep(detail.body.data.snapshotToken, detail.body.data.metadata.revision);
    expect(expired.status).toBe(409);
    expect(expired.body.code).toBe('SNAPSHOT_INVALID');
    // Fresh lease works; renewing it wrote nothing.
    const fresh = await h.req('GET', `/api/v1/contexts/${target}`, { bearer: agent.token });
    const good = await prep(fresh.body.data.snapshotToken, fresh.body.data.metadata.revision);
    expect(good.status).toBe(200);
    expect(good.body.outcome).toBe('prepared');
    // The learner submits meanwhile → the agent's write against the old revision is a stale 409.
    const c2 = { contextId: target, draftId: fresh.body.data.draft.id, taskRevisionId: tr, sessionId };
    expect((await submit(h, c2, { text: 'hecho' })).status).toBe(200);
    const stale = await prep(fresh.body.data.snapshotToken, fresh.body.data.metadata.revision);
    expect(stale.status).toBe(409);
    expect(stale.body).toMatchObject({ code: 'STALE_REVISION', currentRevision: fresh.body.data.metadata.revision + 1 });
    // A token without context:read cannot list or read contexts.
    const noRead = await createToken(h, ['course:read']);
    expect((await h.req('GET', '/api/v1/contexts', { bearer: noRead.token })).status).toBe(403);
    expect((await h.req('GET', `/api/v1/contexts/${target}`, { bearer: noRead.token })).status).toBe(403);
  });
});

describe('lessons, summaries and recommended review', () => {
  it('completes a lesson only after required steps and tasks; finish summarizes actual work', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L1');
    const visit = (stepId: string, action = 'visit') => send(h, command(h, 'lesson.progress', uuid(), 0, { sessionId, stepId, action }));
    await ok(await visit('s1'));
    const early = await ok(await visit('s4', 'finish'));
    expect(early.body.outcome).toBe('updated');
    expect((await lessonView(h, 'A2-03-L1')).progress.status).toBe('visited');
    await ok(await visit('s2'));
    await ok(await visit('s3'));
    for (const [logical, response] of [['A2-03-L1-T01', { text: 'he' }], ['A2-03-L1-T02', { text: 'hemos' }], ['A2-03-L1-T03', { optionId: 'a' }]] as const) {
      const c = await openTask(h, sessionId, taskOf(lv, logical).taskRevisionId);
      if ('text' in response) await ok(await saveDraft(h, c, response.text, 1));
      expect((await submit(h, c, response)).status).toBe(200);
    }
    const done = await ok(await visit('s4', 'finish'));
    expect(done.body.entities[0].resourceType).toBe('lesson-progress');
    const view = await lessonView(h, 'A2-03-L1');
    expect(view.progress).toEqual({ status: 'completed', visitedStepIds: ['s1', 's2', 's3', 's4'] });

    const sess = await h.req('GET', `/api/v1/resources/session/${sessionId}`, { cookie: true });
    const finish = await ok(await send(h, command(h, 'session.finish', sessionId, sess.body.data.revision, {})));
    expect(finish.body.entities[0]).toMatchObject({ id: sessionId, revision: 2 });
    const after = await h.req('GET', `/api/v1/resources/session/${sessionId}`, { cookie: true });
    expect(contractErrors('get_resources_resourceType_id', 200, after.body)).toBeUndefined();
    expect(after.body.data.status).toBe('finished');
    const summary = await h.req('GET', `/api/v1/resources/summary/${after.body.data.summaryId}`, { cookie: true });
    expect(contractErrors('get_resources_resourceType_id', 200, summary.body)).toBeUndefined();
    expect(summary.body.data).toMatchObject({ visitedLessons: 1, completedLessons: 1, independentTargets: 2 });
  });

  it('starts recommended review from due targets; viewing home never consumes queue priority', async () => {
    const { sessionId } = await startLesson(h, 'A2-03-L2');
    await ok(await send(h, command(h, 'lesson.progress', uuid(), 0, { sessionId, stepId: 's1', action: 'visit' })));
    const empty = await send(h, command(h, 'session.start', uuid(), 0, { source: 'recommended', targets: [], mode: 'review', minutes: 10, maxItems: 10 }));
    expect(empty.status).toBe(422);
    expect(empty.body.code).toBe('QUEUE_EMPTY');
    h.clock.advance(24 * 3600_000);
    // The 8 h sliding / 24 h absolute session has expired: a reads never revives it, a new launcher nonce does.
    expect((await h.req('GET', '/api/v1/auth/session', { cookie: true })).status).toBe(401);
    await h.login();
    const queueBefore = (h.store.db().prepare('SELECT queue_state FROM profiles').get() as { queue_state: string }).queue_state;
    const home = await h.req('GET', '/api/v1/views/home', { cookie: true });
    expect(home.body.data.review.dueTargets).toBe(1);
    await h.req('GET', '/api/v1/views/home', { cookie: true });
    expect((h.store.db().prepare('SELECT queue_state FROM profiles').get() as { queue_state: string }).queue_state).toBe(queueBefore);
    const rec = uuid();
    const start = await ok(await send(h, command(h, 'session.start', rec, 0, { source: 'recommended', targets: [], mode: 'review', minutes: 10, maxItems: 10 })));
    const s = await h.req('GET', `/api/v1/resources/session/${rec}`, { cookie: true });
    expect(s.body.data.taskRevisionIds).toHaveLength(1);
    const t = await h.req('GET', `/api/v1/resources/task/${s.body.data.taskRevisionIds[0]}`, { cookie: true });
    expect(['A2-03-L2-T03', 'A2-03-L2-T04']).toContain(t.body.data.logicalId);
    expect(start.body.route).toBe(`/exercise/${s.body.data.taskRevisionIds[0]}`);
    const queueAfter = JSON.parse((h.store.db().prepare('SELECT queue_state FROM profiles').get() as { queue_state: string }).queue_state);
    expect(queueAfter.revision).toBe(1);
    expect(queueAfter.lastOfferedSequence['participle.hecho/written-form']).toBe(1);
    // Delayed independent success on the due date advances the ladder (stage 1, +3 days).
    const c = await openTask(h, rec, s.body.data.taskRevisionIds[0]);
    if (t.body.data.mode !== 'rubric-review') {
      await ok(await saveDraft(h, c, 'hecho', 1));
      const sub = await submit(h, c, { text: 'hecho' });
      expect(sub.body.outcome).toBe('checked');
      const a = await attempt(h, sub.body.entities[0].id);
      expect(a.verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'independent' });
      const progress = await h.req('GET', '/api/v1/views/progress', { cookie: true });
      const row = progress.body.data.targets.find((x: any) => x.target.skillId === 'participle.hecho');
      expect(row).toMatchObject({ label: 'independent', dueDate: '2026-10-05', lastEvidenceDate: '2026-10-02' });
    }
  });
});
