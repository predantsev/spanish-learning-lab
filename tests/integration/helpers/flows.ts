// Reusable learner flows for integration tests (owner session unless a bearer token is given).
import { expect } from 'vitest';
import { command, contractErrors, send, uuid, type Harness, type ReqOptions, type Res } from './server-harness.ts';

export interface Ctx {
  contextId: string;
  draftId: string;
  taskRevisionId: string;
  sessionId: string;
}

export async function lessonView(h: Harness, lessonId: string): Promise<any> {
  const r = await h.req('GET', `/api/v1/views/lessons/${lessonId}`, { cookie: true });
  expect(r.status).toBe(200);
  return r.body.data;
}

export function taskOf(lv: any, logicalId: string): any {
  for (const s of lv.steps) for (const t of s.tasks) if (t.logicalId === logicalId) return t;
  throw new Error(`task ${logicalId} not in lesson`);
}

export async function ok(r: Res, op = 'post_commands'): Promise<Res> {
  expect(r.status, r.text).toBe(200);
  expect(contractErrors(op, 200, r.body)).toBeUndefined();
  return r;
}

export async function startLesson(h: Harness, lessonId: string): Promise<{ sessionId: string; lv: any }> {
  const lv = await lessonView(h, lessonId);
  const sessionId = uuid();
  await ok(await send(h, command(h, 'session.start', sessionId, 0, { source: 'lesson', sourceId: lv.revisionId, targets: [], mode: 'learn', minutes: 10, maxItems: 30 })));
  return { sessionId, lv };
}

export async function openTask(h: Harness, sessionId: string, taskRevisionId: string): Promise<Ctx> {
  const contextId = uuid();
  const r = await ok(await send(h, command(h, 'context.open', contextId, 0, { sessionId, taskRevisionId })));
  const draftId = r.body.entities.find((e: any) => e.resourceType === 'draft').id;
  return { contextId, draftId, taskRevisionId, sessionId };
}

export async function snapshot(h: Harness, contextId: string, opts: ReqOptions = { cookie: true }): Promise<{ token: string; revision: number; draftRevision: number; body: any }> {
  const r = await h.req('GET', `/api/v1/contexts/${contextId}`, opts);
  expect(r.status, r.text).toBe(200);
  return { token: r.body.data.snapshotToken, revision: r.body.data.metadata.revision, draftRevision: r.body.data.draft.revision, body: r.body.data };
}

export async function saveDraft(h: Harness, c: Ctx, text: string, baseRevision: number, opts: ReqOptions = { cookie: true }, operationId = uuid()): Promise<Res> {
  const s = await snapshot(h, c.contextId);
  return send(h, command(h, 'draft.save', c.draftId, baseRevision, { text, cursor: text.length, taskRevisionId: c.taskRevisionId }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token }, operationId), opts);
}

export async function submit(h: Harness, c: Ctx, response: { text: string } | { optionId: string }, attemptId = uuid()): Promise<Res> {
  const s = await snapshot(h, c.contextId);
  return send(h, command(h, 'attempt.submit', attemptId, 0, { draftId: c.draftId, draftRevision: s.draftRevision, taskRevisionId: c.taskRevisionId, response }, { contextId: c.contextId, contextRevision: s.revision, contextSnapshot: s.token }));
}

export async function attempt(h: Harness, attemptId: string): Promise<any> {
  const r = await h.req('GET', `/api/v1/resources/attempt/${attemptId}`, { cookie: true });
  expect(r.status, r.text).toBe(200);
  expect(contractErrors('get_resources_resourceType_id', 200, r.body)).toBeUndefined();
  return r.body.data;
}

export async function rowCount(h: Harness, sql: string, ...params: unknown[]): Promise<number> {
  return (h.store.db().prepare(sql).get(...params) as { n: number }).n;
}

/** Creates an agent token through the owner API and returns its secret and id. */
export async function createToken(h: Harness, scopes: string[], ttlDays = 7, operationId = uuid()): Promise<{ token: string; id: string; res: Res }> {
  const list = await h.req('GET', '/api/v1/auth/tokens', { cookie: true });
  const body = { operationId, profileEpoch: h.epoch(), expectedRevision: list.body.data.profileRevision, label: 'Synthetic agent', scopes, ttlDays };
  const res = await h.req('POST', '/api/v1/auth/tokens', { cookie: true, body, headers: { 'idempotency-key': operationId, 'x-profile-epoch': String(h.epoch()), 'if-match': `"${body.expectedRevision}"` } });
  return { token: res.body?.data?.token, id: res.body?.data?.id, res };
}
