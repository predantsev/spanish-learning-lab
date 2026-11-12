// Contract v1 additions (28a6aef/9299426): phrase.archive, LessonView.progress identity (covered in
// api-commands), PhraseLibraryView.targets, /views/catalog-meta, /views/attempts/{id}, untargeted support,
// `reviewed` content state. Every response is validated against its OpenAPI schema.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installPack } from '../../apps/server/src/content/install.ts';
import { buildSyntheticPack } from '../fixtures/pack-synthetic/build-pack.ts';
import { command, contractErrors, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';
import { createToken, ok, openTask, saveDraft, snapshot, startLesson, submit, taskOf } from './helpers/flows.ts';

let h: Harness;
beforeEach(async () => {
  h = await startHarness();
});
afterEach(async () => {
  await h.close();
});

const view = async (path: string, op: string) => {
  const r = await h.req('GET', path, { cookie: true });
  expect(r.status, r.text).toBe(200);
  expect(contractErrors(op, 200, r.body)).toBeUndefined();
  return r.body.data;
};

describe('phrase.archive and phrase-recall targets', () => {
  it('archives and restores a phrase without deleting it; archived phrases leave practice', async () => {
    const lib = await view('/api/v1/views/phrases', 'get_views_phrases');
    const pan = lib.phrases.find((p: any) => p.logicalId === 'phrase.mas-pan');
    expect(pan.targets).toEqual([{ skillId: 'phrase.shop-more', modality: 'phrase-recall' }]);
    expect(lib.phrases.find((p: any) => p.logicalId === 'phrase.mas-agua').targets).toEqual([]);
    expect(pan).toMatchObject({ archived: false, practiceReady: true });

    const archived = await ok(await send(h, command(h, 'phrase.archive', pan.id, pan.revision, { archived: true })));
    expect(archived.body.entities[0]).toEqual({ id: pan.id, revision: pan.revision + 1, resourceType: 'phrase' });
    const lib2 = await view('/api/v1/views/phrases', 'get_views_phrases');
    expect(lib2.phrases.find((p: any) => p.id === pan.id)).toMatchObject({ archived: true, practiceReady: false, collectionIds: pan.collectionIds });
    const practice = await send(h, command(h, 'practice.create', uuid(), 0, { targets: [{ skillId: 'shop.more', modality: 'listening-meaning' }], mode: 'listening', maxItems: 5, phraseIds: [pan.id] }));
    expect(practice.status).toBe(422);
    expect(practice.body.code).toBe('PHRASE_NOT_READY');
    expect((await send(h, command(h, 'phrase.archive', pan.id, pan.revision, { archived: false }))).body.code).toBe('STALE_REVISION');
    const restored = await ok(await send(h, command(h, 'phrase.archive', pan.id, pan.revision + 1, { archived: false })));
    expect(restored.body.outcome).toBe('updated');
    expect((await view('/api/v1/views/phrases', 'get_views_phrases')).phrases.find((p: any) => p.id === pan.id)).toMatchObject({ archived: false, practiceReady: true });
    // Browser-only: an agent token cannot archive.
    const agent = await createToken(h, ['draft:write', 'practice:write']);
    const denied = await send(h, command(h, 'phrase.archive', pan.id, pan.revision + 2, { archived: true }), { bearer: agent.token });
    expect(denied.status).toBe(403);
  });
});

describe('catalog meta and attempt result views', () => {
  it('lists block, situation and skill titles for the catalog', async () => {
    const meta = await view('/api/v1/views/catalog-meta', 'get_views_catalog_meta');
    expect(meta.blocks).toEqual([
      { blockId: 'A1-05', titleUk: 'Конкретна інформація (синтетичний тестовий приклад)', termEs: 'información concreta' },
      { blockId: 'A2-03', titleUk: 'Pretérito perfecto compuesto (синтетичний тестовий приклад)', termEs: 'pretérito perfecto compuesto' },
    ]);
    expect(meta.situations.map((s: any) => s.id)).toEqual(['everyday', 'shop']);
    expect(meta.skills.map((s: any) => s.skillId)).toEqual(['participle.hecho', 'perfecto.choice', 'perfecto.haber', 'phrase.shop-more', 'shop.more']);
    expect(meta.skills.find((s: any) => s.skillId === 'participle.hecho').termEs).toBe('hecho');
    const progress = await view('/api/v1/views/progress', 'get_views_progress');
    expect(progress.blocks.map((b: any) => b.titleUk)).toEqual(meta.blocks.map((b: any) => b.titleUk));
  });

  it('resolves per-target feedback, reference answer, example flag and actual support from the pinned task', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    // Error variant → its own feedback; closed single-target key → the reference is THE answer.
    const t1 = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T01').taskRevisionId);
    await ok(await saveDraft(h, t1, 'hacido', 1));
    const wrong = (await submit(h, t1, { text: 'hacido' })).body.entities[0].id;
    const r1 = await view(`/api/v1/views/attempts/${wrong}`, 'get_views_attempts_attemptId');
    expect(r1).toMatchObject({ status: 'checked', originalAnswer: 'hacido', referenceAnswer: 'hecho', referenceIsExample: false, supportUsed: [], savedForReview: false });
    expect(r1.verdicts[0]).toMatchObject({ correctness: 'incorrect', independence: 'independent', feedbackUk: 'hacer має неправильне причастя (синтетичний тестовий приклад)', titleUk: 'Неправильне причастя hecho (синтетичний тестовий приклад)' });
    // Actually delivered reveal → supportUsed lists it; correct → correct feedback.
    const s = await snapshot(h, t1.contextId);
    const req = await ok(await send(h, command(h, 'support.request', uuid(), 0, { taskRevisionId: t1.taskRevisionId, kind: 'reveal', hintIndex: 1 }, { contextId: t1.contextId, contextRevision: s.revision, contextSnapshot: s.token })));
    await ok(await send(h, command(h, 'support.confirm', req.body.entities[0].id, 1, { contentHash: req.body.contentHash, deliveryId: uuid(), reportedDeliveredAt: h.clock.now().toISOString(), phase: 'before-submit', targets: [{ skillId: 'participle.hecho', modality: 'written-form' }] }, { contextId: t1.contextId, contextRevision: s.revision })));
    await ok(await saveDraft(h, t1, 'hecho', 2));
    const right = (await submit(h, t1, { text: 'hecho' })).body.entities[0].id;
    const r2 = await view(`/api/v1/views/attempts/${right}`, 'get_views_attempts_attemptId');
    expect(r2.verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'supported', feedbackUk: 'Правильно (синтетичний тестовий приклад)' });
    expect(r2.supportUsed).toEqual(['reveal']);
    // Free writing that does not match the exemplar: unresolved feedback, reference shown as an example.
    const t4 = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T04').taskRevisionId);
    await ok(await saveDraft(h, t4, 'Hoy he hecho la cama.', 1));
    const free = (await submit(h, t4, { text: 'Hoy he hecho la cama.' })).body.entities[0].id;
    const r3 = await view(`/api/v1/views/attempts/${free}`, 'get_views_attempts_attemptId');
    expect(r3).toMatchObject({ status: 'unresolved', referenceAnswer: 'Hoy he hecho la compra.', referenceIsExample: true, feedbackUk: 'Відповідь потребує перевірки (синтетичний тестовий приклад)' });
    expect(r3.verdicts[0]).toMatchObject({ correctness: 'unresolved', feedbackUk: 'Відповідь потребує перевірки (синтетичний тестовий приклад)' });
    // Choice distractor → the option's feedback.
    const { sessionId: s2, lv: lv1 } = await startLesson(h, 'A2-03-L1');
    const t3 = await openTask(h, s2, taskOf(lv1, 'A2-03-L1-T03').taskRevisionId);
    const pick = (await submit(h, t3, { optionId: 'b' })).body.entities[0].id;
    const r4 = await view(`/api/v1/views/attempts/${pick}`, 'get_views_attempts_attemptId');
    expect(r4.verdicts[0]).toMatchObject({ correctness: 'incorrect', feedbackUk: 'Майбутній час (синтетичний тестовий приклад)' });
    expect(r4).toMatchObject({ referenceAnswer: 'he tomado', referenceIsExample: false });
    // Owner-only and 404 for unknown attempts.
    expect((await h.req('GET', `/api/v1/views/attempts/${uuid()}`, { cookie: true })).status).toBe(404);
    const agent = await createToken(h, ['context:read']);
    expect((await h.req('GET', `/api/v1/views/attempts/${pick}`, { bearer: agent.token })).status).toBe(403);
  });
});

describe('untargeted help and reviewed state', () => {
  it('records an untargeted vocabulary gloss with targets [] and no evidence effect', async () => {
    const { sessionId, lv } = await startLesson(h, 'A2-03-L1');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L1-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'hemos', 1));
    const s = await snapshot(h, c.contextId);
    const req = await ok(await send(h, command(h, 'support.request', uuid(), 0, { taskRevisionId: c.taskRevisionId, kind: 'translation', hintIndex: 1 }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token })));
    const sup = await h.req('GET', `/api/v1/resources/support/${req.body.entities[0].id}`, { cookie: true });
    expect(contractErrors('get_resources_resourceType_id', 200, sup.body)).toBeUndefined();
    expect(sup.body.data).toMatchObject({ targets: [], kind: 'translation', delivery: 'prepared' });
    const a = (await submit(h, c, { text: 'hemos' })).body.entities[0].id;
    const r = await view(`/api/v1/views/attempts/${a}`, 'get_views_attempts_attemptId');
    expect(r.verdicts[0]).toMatchObject({ correctness: 'correct', independence: 'independent' });
  });

  it('reports `reviewed` content as reviewed (no mapping) in resources and the catalog', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sll-rev-'));
    try {
      const preview = buildSyntheticPack(join(root, 'p'), { version: '0.0.3', preview: true, state: (kind, body) => (kind === 'lesson' && body.id === 'A2-03-L2' ? 'reviewed' : String(body.reviewStatus)) });
      await installPack(h.store, preview.dir, { allowPreview: true });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
    const lv = await view('/api/v1/views/lessons/A2-03-L2', 'get_views_lessons_lessonId');
    expect(lv.state).toBe('reviewed');
    const res = await h.req('GET', `/api/v1/resources/lesson/${lv.revisionId}`, { cookie: true });
    expect(contractErrors('get_resources_resourceType_id', 200, res.body)).toBeUndefined();
    expect(res.body.data.state).toBe('reviewed');
    const cat = await h.req('GET', '/api/v1/catalog?query=hecho', { cookie: true });
    expect(contractErrors('get_catalog', 200, cat.body)).toBeUndefined();
    expect(cat.body.data.items[0]).toMatchObject({ id: 'A2-03-L2', state: 'reviewed' });
  });
});
