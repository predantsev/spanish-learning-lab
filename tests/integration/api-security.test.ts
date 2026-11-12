// A-27 (401/403/422/413/429 matrix, no CORS, no proxy trust, no coercion, no state mutation) and
// A-28 (malicious blocks escaped/rejected, traversal and range abuse, CSP/nosniff/frames, redacted logs).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { command, contractErrors, rawRequest, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';
import { createToken, ok, openTask, rowCount, saveDraft, startLesson, taskOf } from './helpers/flows.ts';

let h: Harness;
beforeEach(async () => {
  h = await startHarness();
});
afterEach(async () => {
  await h.close();
});

const state = async () => ({
  receipts: await rowCount(h, 'SELECT count(*) AS n FROM mutation_receipts'),
  events: await rowCount(h, 'SELECT count(*) AS n FROM event_log'),
  sessions: await rowCount(h, 'SELECT count(*) AS n FROM sessions'),
  phrases: await rowCount(h, 'SELECT count(*) AS n FROM phrase_records'),
});

function phrase(h: Harness, extra: Record<string, unknown> = {}) {
  return command(h, 'phrase.capture', uuid(), 0, { source: 'uk-intent', text: 'Синтетичний намір', meaning: '', ...extra });
}

describe('A-27 rejection matrix', () => {
  it('maps credentials, origin, shape and size failures to 401/403/422/400/413 without mutating state', async () => {
    const before = await state();
    const expectError = (r: { status: number; body: any; headers: Record<string, unknown> }, status: number, code: string, op = 'post_commands') => {
      expect(r.status, code).toBe(status);
      expect(r.body.code).toBe(code);
      expect(contractErrors(op, status === 400 || status === 401 || status === 403 || status === 409 || status === 413 || status === 422 || status === 429 ? status : 400, r.body)).toBeUndefined();
      expect(JSON.stringify(r.body)).not.toMatch(/stack|SQLITE|select |at Object|\.ts:/i);
    };
    // 401: no credentials, unknown token, revoked/expired covered in api-agent.
    expectError(await send(h, phrase(h), { cookie: false }), 401, 'AUTH_REQUIRED');
    expectError(await send(h, phrase(h), { bearer: 'A'.repeat(43) }), 401, 'AUTH_INVALID');
    expectError(await send(h, phrase(h), { bearer: 'not-a-token' }), 401, 'AUTH_INVALID');
    const { token } = await createToken(h, ['draft:write']);
    const afterToken = await state();
    // 403: mixed cookie + bearer, foreign Origin with bearer, cookie mutation without CSRF/Origin.
    expectError(await send(h, phrase(h), { cookie: true, bearer: token }), 403, 'MIXED_CREDENTIALS');
    expectError(await send(h, phrase(h), { bearer: token, origin: 'http://evil.example' }), 403, 'ORIGIN_FORBIDDEN');
    expectError(await send(h, phrase(h), { cookie: true, csrf: false }), 403, 'CSRF_INVALID');
    expectError(await send(h, phrase(h), { cookie: true, csrf: 'x'.repeat(43) }), 403, 'CSRF_INVALID');
    expectError(await send(h, phrase(h), { cookie: true, origin: null }), 403, 'ORIGIN_REQUIRED');
    expectError(await send(h, phrase(h), { cookie: true, origin: `http://localhost:${h.port}` }), 403, 'ORIGIN_REQUIRED');
    // 403: Host allowlist (DNS rebinding variants, missing port, other port) and forwarding headers.
    for (const host of ['evil.example', `evil.example:${h.port}`, `spanish-learning-lab.localhost.evil.com:${h.port}`, 'spanish-learning-lab.localhost', `127.0.0.1:${h.port + 1}`, `spanish-learning-lab.localhost.:${h.port}`]) {
      const r = await h.req('GET', '/api/v1/health', { host });
      expect(r.status, host).toBe(403);
      expect(r.body.code).toBe('HOST_FORBIDDEN');
    }
    for (const fwd of ['x-forwarded-host', 'x-forwarded-for', 'forwarded']) {
      const r = await h.req('GET', '/api/v1/health', { headers: { [fwd]: 'spanish-learning-lab.localhost' } });
      expect(r.status, fwd).toBe(403);
      expect(r.body.code).toBe('FORWARDED_FORBIDDEN');
    }
    for (const allowed of [`127.0.0.1:${h.port}`, `localhost:${h.port}`, `spanish-learning-lab.localhost:${h.port}`]) {
      expect((await h.req('GET', '/api/v1/health', { host: allowed })).status, allowed).toBe(200);
    }
    // 422: unexpected property, wrong type (no coercion), unknown kind; 400: malformed JSON / content type.
    expectError(await send(h, phrase(h, { ready: true })), 422, 'INVALID_SHAPE');
    const coerced = command(h, 'session.start', uuid(), 0, { source: 'recommended', targets: [], mode: 'review', minutes: '10', maxItems: 10 });
    expectError(await send(h, coerced), 422, 'INVALID_SHAPE');
    const extra = { ...phrase(h).body, extra: 1 };
    expectError(await send(h, { body: extra, headers: phrase(h).headers }), 422, 'INVALID_SHAPE');
    expectError(await h.req('POST', '/api/v1/commands', { cookie: true, raw: '{"operationId":', headers: { 'idempotency-key': uuid() } }), 400, 'MALFORMED_JSON');
    expectError(await h.req('POST', '/api/v1/commands', { cookie: true, raw: 'kind=raw.sql', contentType: 'application/x-www-form-urlencoded' }), 400, 'UNSUPPORTED_CONTENT_TYPE');
    expectError(await h.req('POST', '/api/v1/commands', { cookie: true, raw: 'hello', contentType: 'text/plain' }), 400, 'UNSUPPORTED_CONTENT_TYPE');
    // 413: body above 64 KiB.
    const big = phrase(h, { text: 'x'.repeat(70 * 1024) });
    expectError(await send(h, big), 413, 'BODY_TOO_LARGE');
    expect(await state()).toEqual(afterToken);
    expect(afterToken.phrases).toBe(before.phrases);
  });

  it('never emits CORS headers and does not answer preflights', async () => {
    const pre = await h.req('OPTIONS', '/api/v1/commands', { headers: { origin: 'http://evil.example', 'access-control-request-method': 'POST' }, origin: null });
    expect(pre.status).toBeGreaterThanOrEqual(400);
    for (const r of [pre, await h.req('GET', '/api/v1/health'), await h.req('GET', '/api/v1/views/home', { cookie: true })]) {
      for (const name of Object.keys(r.headers)) expect(name.startsWith('access-control-')).toBe(false);
    }
  });

  it('rate limits 600 requests/min and mutation bursts of 20 per 10 s with 429 and Retry-After', async () => {
    await h.close();
    h = await startHarness({ rateLimits: { requestsPerMinute: 600, mutationBurst: 20, mutationWindowMs: 10_000 } });
    for (let i = 0; i < 20; i++) expect((await send(h, phrase(h))).status).toBe(200);
    const before = await state();
    const limited = await send(h, phrase(h));
    expect(limited.status).toBe(429);
    expect(limited.body).toMatchObject({ code: 'RATE_LIMITED', retryable: true });
    expect(contractErrors('post_commands', 429, limited.body)).toBeUndefined();
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    expect(await state()).toEqual(before);
    h.clock.advance(10_001);
    expect((await send(h, phrase(h))).status).toBe(200);
    // 600 requests/minute for reads (the exchange already used some of the minute's budget).
    let last = 0;
    for (let i = 0; i < 600 && last !== 429; i++) last = (await h.req('GET', '/api/v1/health')).status;
    expect(last).toBe(429);
  });
});

describe('A-28 hostile input and response hardening', () => {
  it('stores scripts/HTML as inert text in typed blocks, rejects unsupported blocks and bounds sizes', async () => {
    const script = '<script>alert(1)</script><img src=x onerror=alert(2)>';
    const id = uuid();
    await ok(await send(h, command(h, 'material.draft', id, 0, { title: script, topicId: 'A2-03', blocks: [{ type: 'paragraph', language: 'uk', text: script }] })));
    const read = await h.req('GET', `/api/v1/resources/material/${id}`, { cookie: true });
    expect(read.headers['content-type']).toMatch(/^application\/json/);
    expect(read.headers['x-content-type-options']).toBe('nosniff');
    expect(read.body.data.blocks[0]).toEqual({ type: 'paragraph', language: 'uk', text: script });
    const bad = [
      [{ type: 'html', html: '<b>x</b>' }],
      [{ type: 'paragraph', language: 'uk', text: 'x', onclick: 'alert(1)' }],
      [{ type: 'practice-link', labelUk: 'x', targets: [{ skillId: 'participle.hecho', modality: 'written-form' }], mode: 'written', maxItems: 31 }],
      [{ type: 'paragraph', language: 'en', text: 'x' }],
    ];
    for (const blocks of bad) {
      const r = await send(h, command(h, 'material.draft', uuid(), 0, { title: 't', topicId: 'A2-03', blocks }));
      expect(r.status, JSON.stringify(blocks)).toBe(422);
    }
    const table = await send(h, command(h, 'material.draft', uuid(), 0, { title: 't', topicId: 'A2-03', blocks: [{ type: 'table', language: 'es-ES', columns: ['a', 'b'], rows: [['1', '2', '3']] }] }));
    expect(table.body.code).toBe('TABLE_WIDTH');
    const long = Array.from({ length: 11 }, () => ({ type: 'paragraph', language: 'uk', text: 'a'.repeat(1990) }));
    const tooLong = await send(h, command(h, 'material.draft', uuid(), 0, { title: 't', topicId: 'A2-03', blocks: long }));
    expect(tooLong.body.code).toBe('MATERIAL_TOO_LONG');
    const unknownTopic = await send(h, command(h, 'material.draft', uuid(), 0, { title: 't', topicId: 'A1-01', blocks: [{ type: 'paragraph', language: 'uk', text: 'x' }] }));
    expect(unknownTopic.body.code).toBe('UNKNOWN_TOPIC');
    const remote = await send(h, command(h, 'material.draft', uuid(), 0, { title: 't', topicId: 'https://evil.example/x', blocks: [{ type: 'paragraph', language: 'uk', text: 'x' }] }));
    expect(remote.status).toBe(422);
  });

  it('bounds media access: no traversal, no unknown hashes, bounded ranges', async () => {
    const hash = h.pack!.clipHashes['clip.shop.more.a']!;
    for (const path of ['/api/v1/media/..%2F..%2Fprofile.sqlite', '/api/v1/media/../../profile.sqlite', `/api/v1/media/${hash.toUpperCase()}`, '/api/v1/media/%2e%2e%2f', `/api/v1/media/${hash}/..`]) {
      const r = await rawRequest(h.port, 'GET', path, { host: h.host, cookie: `sll_session=${h.owner.cookie}` });
      expect([403, 404], path).toContain(r.status);
      expect(r.raw.length).toBeLessThan(1000);
    }
    for (const range of ['bytes=-0', 'bytes=10-5', 'bytes=abc', 'bytes=0-1,2-3', 'items=0-1', `bytes=99999999999999-`]) {
      const r = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true, headers: { range } });
      expect(r.status, range).toBe(416);
      expect(r.headers['content-range']).toBe('bytes */4096');
    }
    const suffix = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true, headers: { range: 'bytes=-100' } });
    expect(suffix.status).toBe(206);
    expect(suffix.headers['content-range']).toBe('bytes 3996-4095/4096');
    const open = await h.req('GET', `/api/v1/media/${hash}`, { cookie: true, headers: { range: 'bytes=4000-999999' } });
    expect(open.headers['content-range']).toBe('bytes 4000-4095/4096');
  });

  it('sends CSP, nosniff, no-frames and no-referrer on every response and no-store on private reads', async () => {
    const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
    const responses = [
      await h.req('GET', '/api/v1/health'),
      await h.req('GET', '/api/v1/views/home', { cookie: true }),
      await h.req('GET', '/api/v1/views/home'),
      await h.req('GET', '/api/v1/nope', { cookie: true }),
      await h.req('GET', '/api/v1/health', { host: 'evil.example' }),
      await h.req('GET', `/api/v1/media/${h.pack!.clipHashes['clip.shop.more.a']}`, { cookie: true }),
    ];
    for (const r of responses) {
      expect(r.headers['content-security-policy']).toBe(csp);
      expect(r.headers['x-content-type-options']).toBe('nosniff');
      expect(r.headers['referrer-policy']).toBe('no-referrer');
      expect(r.headers['x-frame-options']).toBe('DENY');
      expect(String(r.headers['content-security-policy'])).not.toMatch(/unsafe-inline|unsafe-eval/);
    }
    expect(responses[1]!.headers['cache-control']).toBe('no-store');
    expect(responses[3]!.status).toBe(404);
    expect(responses[3]!.body.code).toBe('NOT_FOUND');
  });

  it('logs request ids, status and operation kinds only — never drafts, answers, tokens, cookies or nonces', async () => {
    await h.close();
    const lines: string[] = [];
    h = await startHarness({ logSink: { write: (s: string) => lines.push(s) }, login: false });
    const nonce = h.app.registerNonce();
    const ex = await h.req('POST', '/api/v1/auth/exchange', { body: { nonce }, origin: h.origin });
    h.owner = { cookie: /sll_session=([^;]+)/.exec(String(ex.headers['set-cookie']))![1]!, csrf: ex.body.data.csrfToken };
    const { token } = await createToken(h, ['draft:write']);
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'BORRADOR-SECRETO-123', 1));
    await send(h, command(h, 'phrase.capture', uuid(), 0, { source: 'spanish', text: 'FRASE-PRIVADA-456', meaning: 'x' }), { bearer: token });
    await h.req('GET', '/api/v1/catalog?query=PRIVATE-QUERY-789', { bearer: token });
    await send(h, phrase(h), { bearer: 'B'.repeat(43) });
    const log = lines.join('');
    expect(log).toContain('"op":"commands"');
    expect(log).toContain('"kind":"draft.save"');
    expect(log).toMatch(/"reqId":"[0-9a-f-]{36}"/);
    for (const secret of ['BORRADOR-SECRETO-123', 'FRASE-PRIVADA-456', 'PRIVATE-QUERY-789', nonce, token, h.owner.cookie, h.owner.csrf, 'B'.repeat(43), 'authorization', 'cookie']) {
      expect(log, secret).not.toContain(secret);
    }
  });
});
