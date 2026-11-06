// A-25: prepare → deliver → confirm; cancel undelivered; lost confirm response; pending/unknown at
// submit; UI-mediated route (support.request → render → support.confirm); late confirm after close.
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canonicalJson } from '../../apps/server/src/content/pack-format.ts';
import { command, contractErrors, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';
import { attempt, createToken, ok, openTask, saveDraft, snapshot, startLesson, submit, taskOf, type Ctx } from './helpers/flows.ts';

let h: Harness;
beforeEach(async () => {
  h = await startHarness();
});
afterEach(async () => {
  await h.close();
});

const HECHO = { skillId: 'participle.hecho', modality: 'written-form' } as const;
const BLOCKS = [{ type: 'paragraph', language: 'uk', text: 'Синтетична зовнішня підказка' }];

async function prepare(h: Harness, token: string, c: Ctx, route: 'external' | 'app' = 'external'): Promise<{ id: string; hash: string; contextRevision: number }> {
  const s = await snapshot(h, c.contextId, { bearer: token });
  const id = uuid();
  const r = await send(h, command(h, 'support.prepare', id, 0, { targets: [HECHO], kind: 'targeted-clue', blocks: BLOCKS, taskRevisionId: c.taskRevisionId, deliveryRoute: route }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token }), { bearer: token });
  await ok(r);
  expect(r.body.outcome).toBe('prepared');
  return { id, hash: r.body.contentHash, contextRevision: s.revision };
}

function confirmCmd(h: Harness, r: { id: string; hash: string; contextRevision: number }, c: Ctx, revision: number, extra: Record<string, unknown> = {}, op = uuid()) {
  return command(
    h,
    'support.confirm',
    r.id,
    revision,
    { contentHash: r.hash, deliveryId: uuid(), reportedDeliveredAt: h.clock.now().toISOString(), phase: 'before-submit', targets: [HECHO], ...extra },
    { contextId: c.contextId, contextRevision: r.contextRevision },
    op,
  );
}

describe('A-25 two-phase help recording', () => {
  it('prepare is not evidence; cancel is neutral; confirm is bound to hash/targets and deduplicated', async () => {
    const agent = await createToken(h, ['context:read', 'help:write']);
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));

    const r1 = await prepare(h, agent.token, c);
    expect(r1.hash).toBe(createHash('sha256').update(canonicalJson(BLOCKS)).digest('hex'));
    const read = await h.req('GET', `/api/v1/resources/support/${r1.id}`, { bearer: agent.token });
    expect(read.status).toBe(200);
    expect(contractErrors('get_resources_resourceType_id', 200, read.body)).toBeUndefined();
    expect(read.body.data).toMatchObject({ delivery: 'prepared', contentHash: r1.hash, contextId: c.contextId });
    expect(h.store.db().prepare("SELECT count(*) AS n FROM target_states WHERE skill_id = 'participle.hecho' AND pending_need = 1").get()).toEqual({ n: 0 });

    const cancel = await send(h, command(h, 'support.cancel', r1.id, 1, { delivery: 'confirmed-undelivered', reason: 'not shown' }, { contextId: c.contextId, contextRevision: r1.contextRevision }), { bearer: agent.token });
    await ok(cancel);
    expect(cancel.body.outcome).toBe('cancelled');

    const r2 = await prepare(h, agent.token, c);
    const wrongHash = await send(h, confirmCmd(h, { ...r2, hash: 'a'.repeat(64) }, c, 1), { bearer: agent.token });
    expect(wrongHash.status).toBe(422);
    expect(wrongHash.body.code).toBe('BINDING_MISMATCH');
    const wrongTargets = await send(h, confirmCmd(h, r2, c, 1, { targets: [{ skillId: 'perfecto.haber', modality: 'written-form' }] }), { bearer: agent.token });
    expect(wrongTargets.body.code).toBe('BINDING_MISMATCH');
    const base = confirmCmd(h, r2, c, 1);
    const wrongContext = await send(h, { headers: base.headers, body: { ...base.body, contextRevision: r2.contextRevision + 5 } }, { bearer: agent.token });
    expect(wrongContext.status).toBe(422); // the reservation's original context revision cannot change
    expect(wrongContext.body.code).toBe('BINDING_MISMATCH');
    const op = uuid();
    const confirm = confirmCmd(h, r2, c, 1, {}, op);
    const first = await send(h, confirm, { bearer: agent.token }); // lost response
    await ok(first);
    expect(first.body.outcome).toBe('delivered');
    const retry = await send(h, confirm, { bearer: agent.token });
    expect(retry.body).toEqual(first.body);
    const second = await send(h, confirmCmd(h, r2, c, 1), { bearer: agent.token });
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('STALE_REVISION');
    expect(h.store.db().prepare("SELECT count(*) AS n FROM support_events WHERE delivery = 'delivered'").get()).toEqual({ n: 1 });

    // The confirmed targeted help supports the answer: correct + supported, never independent.
    const sub = await submit(h, c, { text: 'hecho' });
    const a = await attempt(h, sub.body.entities[0].id);
    expect(a.verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'supported' });
    expect(a.supportIds).toEqual(expect.arrayContaining([r1.id, r2.id]));
  });

  it('pending external help at submit makes independence unknown; a late confirm after close never grants it', async () => {
    const agent = await createToken(h, ['context:read', 'help:write']);
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const r = await prepare(h, agent.token, c);
    const sub = await submit(h, c, { text: 'hecho' });
    expect(sub.body.outcome).toBe('checked');
    const attemptId = sub.body.entities[0].id;
    expect((await attempt(h, attemptId)).verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'unknown' });
    const s = await snapshot(h, c.contextId);
    await ok(await send(h, command(h, 'context.close', c.contextId, s.revision, {}, { contextId: c.contextId, contextRevision: s.revision })));
    h.clock.advance(10 * 60_000); // after the 5 min reservation expiry and the 60 s context lease
    const late = await send(h, confirmCmd(h, r, c, 1), { bearer: agent.token });
    await ok(late);
    expect(late.body.outcome).toBe('delivered');
    expect((await attempt(h, attemptId)).verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'unknown' });
    const progress = await h.req('GET', '/api/v1/views/progress', { cookie: true });
    const row = progress.body.data.targets.find((x: any) => x.target.skillId === 'participle.hecho');
    expect(row.label).not.toBe('independent');
  });

  it('UI-mediated route: requested course help is recorded on render; never-rendered help is neutral', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L1');
    const task = taskOf(lv, 'A2-03-L1-T02');
    const c = await openTask(h, sessionId, task.taskRevisionId);
    await ok(await saveDraft(h, c, 'hemos', 1));
    const request = async () => {
      const s = await snapshot(h, c.contextId);
      const id = uuid();
      const r = await send(h, command(h, 'support.request', id, 0, { taskRevisionId: c.taskRevisionId, kind: 'targeted-clue', hintIndex: 0 }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token }));
      await ok(r);
      return { id, hash: r.body.contentHash as string, contextRevision: s.revision };
    };
    const neverRendered = await request();
    const sub = await submit(h, c, { text: 'hemos' });
    const a = await attempt(h, sub.body.entities[0].id);
    expect(a.verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'independent' });
    const sup = await h.req('GET', `/api/v1/resources/support/${neverRendered.id}`, { cookie: true });
    expect(sup.body.data.delivery).toBe('confirmed-undelivered');

    // Hint index/kind must match the task's reviewed help.
    const s = await snapshot(h, c.contextId);
    const wrong = await send(h, command(h, 'support.request', uuid(), 0, { taskRevisionId: c.taskRevisionId, kind: 'reveal', hintIndex: 0 }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token }));
    expect(wrong.status).toBe(422);
    expect(wrong.body.code).toBe('HINT_NOT_FOUND');

    // Render then confirm: the support resource carries exactly the reviewed hint blocks.
    const shown = await request();
    const body = await h.req('GET', `/api/v1/resources/support/${shown.id}`, { cookie: true });
    expect(body.body.data.blocks).toEqual([{ type: 'paragraph', language: 'uk', text: 'nosotros (синтетичний тестовий приклад)' }]);
    const conf = await send(h, confirmCmd(h, shown, c, 1, { phase: 'after-submit', targets: [{ skillId: 'perfecto.haber', modality: 'written-form' }] }));
    await ok(conf);
    // A display may not start after the 5 min reservation expiry (app route).
    const expiring = await request();
    h.clock.advance(6 * 60_000);
    const tooLate = await send(h, confirmCmd(h, expiring, c, 1, { targets: [{ skillId: 'perfecto.haber', modality: 'written-form' }] }));
    expect(tooLate.status).toBe(409);
    expect(tooLate.body.code).toBe('RESERVATION_EXPIRED');
  });
});
