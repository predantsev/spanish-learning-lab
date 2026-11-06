// A-26: an agent with the default skill scopes creates reviewed practice, captures phrase/material
// drafts and reads them back; privileged/unsupported operations are refused. Token lifecycle:
// secret shown once, lost-response replay → TOKEN_ALREADY_CREATED (metadata only), revoke/expiry.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { command, contractErrors, send, startHarness, uuid, writeHeaders, type Harness } from './helpers/server-harness.ts';
import { createToken, ok, rowCount } from './helpers/flows.ts';

let h: Harness;
beforeEach(async () => {
  h = await startHarness();
});
afterEach(async () => {
  await h.close();
});

const SKILL_SCOPES = ['context:read', 'course:read', 'draft:write', 'help:write', 'practice:write'];
const HECHO = { skillId: 'participle.hecho', modality: 'written-form' };

describe('A-26 agent allowed vs forbidden operations', () => {
  it('creates practice/phrase/material drafts, reads them back and is refused privileged operations', async () => {
    const { token } = await createToken(h, SKILL_SCOPES);
    const caps = await h.req('GET', '/api/v1/capabilities', { bearer: token });
    expect(contractErrors('get_capabilities', 200, caps.body)).toBeUndefined();
    expect(caps.body.scopes).toEqual([...SKILL_SCOPES].sort());
    expect(caps.body.commandKinds).toEqual(expect.arrayContaining(['practice.create', 'phrase.capture', 'material.draft', 'support.prepare']));
    expect(caps.body.commandKinds).not.toContain('attempt.submit');

    // practice.create: only installed ready items within scope (never the quarantined T05), ≤ maxItems.
    const setId = uuid();
    const created = await ok(await send(h, command(h, 'practice.create', setId, 0, { targets: [HECHO], mode: 'written', maxItems: 5, phraseIds: [] }), { bearer: token }));
    expect(created.body.route).toBe(`/practice/${setId}`);
    const set = await h.req('GET', `/api/v1/resources/practice-set/${setId}`, { bearer: token });
    expect(contractErrors('get_resources_resourceType_id', 200, set.body)).toBeUndefined();
    const logical = await Promise.all(set.body.data.taskRevisionIds.map(async (id: string) => (await h.req('GET', `/api/v1/resources/task/${id}`, { bearer: token })).body.data.logicalId));
    expect(logical.sort()).toEqual(['A2-03-L2-T01', 'A2-03-L2-T02', 'A2-03-L2-T03', 'A2-03-L2-T04']);
    const unknownTarget = await send(h, command(h, 'practice.create', uuid(), 0, { targets: [{ skillId: 'fake.skill', modality: 'written-form' }], mode: 'written', maxItems: 5, phraseIds: [] }), { bearer: token });
    expect(unknownTarget.status).toBe(422);
    expect(unknownTarget.body.code).toBe('UNKNOWN_TARGET');

    // phrase.capture: Ukrainian intent → private draft; course phrase → the shared ready record is reused.
    const phraseId = uuid();
    await ok(await send(h, command(h, 'phrase.capture', phraseId, 0, { source: 'uk-intent', text: 'Синтетичний намір', meaning: '' }), { bearer: token }));
    const phrase = await h.req('GET', `/api/v1/resources/phrase/${phraseId}`, { bearer: token });
    expect(contractErrors('get_resources_resourceType_id', 200, phrase.body)).toBeUndefined();
    expect(phrase.body.data).toMatchObject({ resourceType: 'phrase', state: 'draft' });
    const library = await h.req('GET', '/api/v1/views/phrases', { cookie: true });
    const coursePhrase = library.body.data.phrases.find((p: any) => p.logicalId === 'phrase.mas-pan');
    const courseRevision = h.store.db().prepare("SELECT revision_id FROM active_content WHERE kind = 'phrase' AND logical_id = 'phrase.mas-pan'").get() as { revision_id: string };
    const reuse = await ok(await send(h, command(h, 'phrase.capture', uuid(), 0, { source: 'course', sourceRevisionId: courseRevision.revision_id }), { bearer: token }));
    expect(reuse.body.outcome).toBe('unchanged');
    expect(reuse.body.entities[0].id).toBe(coursePhrase.id);
    const library2 = await h.req('GET', '/api/v1/views/phrases', { cookie: true });
    expect(library2.body.data.phrases.find((p: any) => p.id === phraseId)).toMatchObject({ state: 'draft', origin: 'uk-intent', practiceReady: false });

    // material.draft: typed blocks only; the active reviewed course material stays active.
    const matId = uuid();
    await ok(await send(h, command(h, 'material.draft', matId, 0, { title: 'Синтетична чернетка', topicId: 'A2-03', blocks: [{ type: 'paragraph', language: 'uk', text: 'Текст чернетки' }] }), { bearer: token }));
    const mat = await h.req('GET', `/api/v1/resources/material/${matId}`, { bearer: token });
    expect(contractErrors('get_resources_resourceType_id', 200, mat.body)).toBeUndefined();
    expect(mat.body.data).toMatchObject({ resourceType: 'material', state: 'draft', topicId: 'A2-03' });
    const view = await h.req('GET', '/api/v1/views/materials/A2-03', { cookie: true });
    const states = view.body.data.materials.map((m: any) => [m.origin, m.state]);
    expect(states).toEqual(expect.arrayContaining([['course', 'ready'], ['personal', 'draft']]));
    // Collection with the same phrase in several collections; removing never deletes the phrase.
    const colId = uuid();
    await ok(await send(h, command(h, 'collection.create', colId, 0, { name: 'Моя', phraseIds: [phraseId, coursePhrase.id] }), { bearer: token }));
    await ok(await send(h, command(h, 'collection.patch', colId, 1, { add: [], remove: [phraseId] }), { bearer: token }));
    const col = await h.req('GET', `/api/v1/resources/collection/${colId}`, { bearer: token });
    expect(col.body.data).toMatchObject({ revision: 2, phraseIds: [coursePhrase.id], origin: 'personal' });
    expect(await rowCount(h, 'SELECT count(*) AS n FROM phrase_records WHERE id = ?', phraseId)).toBe(1);
    const courseCol = library.body.data.collections.find((c: any) => c.origin === 'course');
    const patchCourse = await send(h, command(h, 'collection.patch', courseCol.id, courseCol.revision, { add: [phraseId], remove: [] }), { bearer: token });
    expect(patchCourse.status).toBe(422);

    // Refused: privileged review/promotion, unknown kinds, self-certification fields, learner-only and owner-only routes.
    const receiptsBefore = await rowCount(h, 'SELECT count(*) AS n FROM mutation_receipts');
    const promote = await send(h, command(h, 'content.promote', uuid(), 1, { expectedHash: 'a'.repeat(64), reviewReceiptIds: [uuid()], audioReceiptIds: [], rightsReceiptId: uuid(), coverageReceiptId: uuid() }), { bearer: token });
    expect(promote.status).toBe(403);
    expect(promote.body.code).toBe('PRIVILEGED_COMMAND');
    const validate = await send(h, command(h, 'review.validate', uuid(), 1, { executionReceiptIds: [uuid()], reportId: uuid(), evidenceHash: 'b'.repeat(64), verifiedSources: [] }), { bearer: token });
    expect(validate.status).toBe(403);
    // Not even the owner browser session may promote content over HTTP (privileged local CLI only).
    const ownerPromote = await send(h, command(h, 'content.promote', uuid(), 1, { expectedHash: 'a'.repeat(64), reviewReceiptIds: [uuid()], audioReceiptIds: [], rightsReceiptId: uuid(), coverageReceiptId: uuid() }));
    expect(ownerPromote.status).toBe(403);
    expect(ownerPromote.body.code).toBe('PRIVILEGED_COMMAND');
    const rawSql = await send(h, command(h, 'raw.sql', uuid(), 0, { sql: 'DROP TABLE attempts' }), { bearer: token });
    expect(rawSql.status).toBe(422);
    const selfReady = await send(h, command(h, 'phrase.capture', uuid(), 0, { source: 'uk-intent', text: 'x', meaning: '', ready: true }), { bearer: token });
    expect(selfReady.status).toBe(422);
    const html = await send(h, command(h, 'material.draft', uuid(), 0, { title: 't', topicId: 'A2-03', blocks: [{ type: 'html', language: 'uk', text: '<script>bad</script>' }] }), { bearer: token });
    expect(html.status).toBe(422);
    for (const [kind, payload] of [
      ['session.start', { source: 'recommended', targets: [], mode: 'review', minutes: 10, maxItems: 10 }],
      ['preference.set', { targets: [HECHO], frequency: 'known' }],
      ['profile.settings', { theme: 'dark' }],
    ] as const) {
      const r = await send(h, command(h, kind, uuid(), 0, payload), { bearer: token });
      expect(r.status, kind).toBe(403);
      expect(r.body.code, kind).toBe('SCOPE_FORBIDDEN');
    }
    for (const path of ['/api/v1/views/home', '/api/v1/profile', '/api/v1/auth/tokens', '/api/v1/auth/session', `/api/v1/media/${'a'.repeat(64)}`]) {
      const r = await h.req('GET', path, { bearer: token });
      expect(r.status, path).toBe(403);
      expect(r.body.code, path).toBe('OWNER_ONLY');
    }
    const exportReq = { operationId: uuid(), profileEpoch: h.epoch(), expectedRevision: 1, selfContained: false };
    expect((await h.req('POST', '/api/v1/recovery/export', { bearer: token, body: exportReq, headers: writeHeaders(exportReq) })).status).toBe(403);
    expect(await rowCount(h, 'SELECT count(*) AS n FROM mutation_receipts')).toBe(receiptsBefore);
  });

  it('token secret is delivered once; a lost-response replay is metadata-only; revoke and expiry are immediate', async () => {
    const op = uuid();
    const first = await createToken(h, ['course:read'], 1, op);
    expect(first.res.status).toBe(200);
    expect(contractErrors('post_auth_tokens', 200, first.res.body)).toBeUndefined();
    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    // Same operation again (the response was lost): no second token, no recovered secret.
    const list1 = await h.req('GET', '/api/v1/auth/tokens', { cookie: true });
    const body = { operationId: op, profileEpoch: h.epoch(), expectedRevision: list1.body.data.profileRevision - 1, label: 'Synthetic agent', scopes: ['course:read'], ttlDays: 1 };
    const replay = await h.req('POST', '/api/v1/auth/tokens', { cookie: true, body, headers: writeHeaders(body) });
    expect(replay.status).toBe(409);
    expect(contractErrors('post_auth_tokens', 409, replay.body)).toBeUndefined();
    expect(replay.body).toMatchObject({ code: 'TOKEN_ALREADY_CREATED', createdEntityId: first.id });
    expect(replay.text).not.toContain(first.token);
    const list2 = await h.req('GET', '/api/v1/auth/tokens', { cookie: true });
    expect(contractErrors('get_auth_tokens', 200, list2.body)).toBeUndefined();
    expect(list2.body.data.items).toHaveLength(1);
    expect(list2.text).not.toContain(first.token);
    expect(JSON.stringify(h.store.db().prepare('SELECT * FROM mutation_receipts').all())).not.toContain(first.token);
    expect(JSON.stringify(h.store.db().prepare('SELECT * FROM auth_tokens').all())).not.toContain(first.token);

    expect((await h.req('GET', '/api/v1/catalog', { bearer: first.token })).status).toBe(200);
    // Revoke (owner, If-Match = profile revision) → the next request fails at once.
    const rev = { operationId: uuid(), profileEpoch: h.epoch(), expectedRevision: list2.body.data.profileRevision };
    const revoke = await h.req('DELETE', `/api/v1/auth/tokens/${first.id}`, { cookie: true, body: rev, headers: writeHeaders(rev) });
    expect(revoke.status).toBe(200);
    expect(contractErrors('delete_auth_tokens_id', 200, revoke.body)).toBeUndefined();
    const denied = await h.req('GET', '/api/v1/catalog', { bearer: first.token });
    expect(denied.status).toBe(401);
    expect(denied.body.code).toBe('TOKEN_REVOKED');
    // Reissue under a new operation after refreshing the profile revision.
    const second = await createToken(h, ['course:read'], 1);
    expect(second.res.status).toBe(200);
    h.clock.advance(25 * 3600_000);
    const expired = await h.req('GET', '/api/v1/catalog', { bearer: second.token });
    expect(expired.status).toBe(401);
    expect(expired.body.code).toBe('TOKEN_EXPIRED');
    // Scope/TTL bounds come from the contract: ttlDays > 30 is a shape error.
    await h.login();
    const tooLong = { operationId: uuid(), profileEpoch: h.epoch(), expectedRevision: 1, label: 'x', scopes: ['course:read'], ttlDays: 31 };
    expect((await h.req('POST', '/api/v1/auth/tokens', { cookie: true, body: tooLong, headers: writeHeaders(tooLong) })).status).toBe(422);
  });

  it('logout revokes the session and clears the cookie', async () => {
    const s = await h.req('GET', '/api/v1/auth/session', { cookie: true });
    const body = { operationId: uuid(), profileEpoch: h.epoch(), expectedRevision: s.body.data.revision };
    const out = await h.req('POST', '/api/v1/auth/logout', { cookie: true, body, headers: writeHeaders(body) });
    expect(out.status).toBe(200);
    expect(contractErrors('post_auth_logout', 200, out.body)).toBeUndefined();
    expect(String(out.headers['set-cookie'])).toContain('Max-Age=0');
    expect((await h.req('GET', '/api/v1/auth/session', { cookie: true })).status).toBe(401);
  });
});
