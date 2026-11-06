// ProfileStore bootstrap, write gate, maintenance mode, committed listeners; disk-full rollback → 503
// with no partial state; scheduler projection rebuild equals the incremental fold; log rotation.
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { RotatingLogStream } from '../../apps/server/src/http/logging.ts';
import { rebuildSchedulerProjection } from '../../apps/server/src/learning/scheduler-store.ts';
import { openProfileStore } from '../../apps/server/src/store/profile-store.ts';
import { command, contractErrors, send, startHarness, uuid, type Harness } from './helpers/server-harness.ts';
import { ok, openTask, rowCount, saveDraft, startLesson, submit, taskOf } from './helpers/flows.ts';

let h: Harness | undefined;
const dirs: string[] = [];
afterEach(async () => {
  await h?.close();
  h = undefined;
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe('profile store', () => {
  it('bootstraps one profile (epoch 1, Europe/Madrid, system theme) and keeps it across reopen', () => {
    const root = mkdtempSync(join(tmpdir(), 'sll-store-'));
    dirs.push(root);
    const store = openProfileStore({ root: join(root, 'home') });
    const p = store.profile();
    expect(p).toMatchObject({ epoch: 1, revision: 1, reviewTimezone: 'Europe/Madrid', schemaVersion: 2 });
    expect(store.db().prepare('SELECT theme, audio_speed, locale FROM profiles').get()).toEqual({ theme: 'system', audio_speed: 1, locale: 'uk' });
    store.reopen();
    expect(store.profile().id).toBe(p.id);
    expect(store.db().prepare('SELECT count(*) AS n FROM profiles').get()).toEqual({ n: 1 });
    store.close();
    expect(statSync(join(root, 'home', 'profile.sqlite')).mode & 0o777).toBe(0o600);
  });

  it('holds new mutations at the write gate while paused, then releases them in order', async () => {
    h = await startHarness();
    const order: string[] = [];
    const paused = h.store.withWritesPaused(async () => {
      order.push('pause-start');
      await new Promise((r) => setTimeout(r, 50));
      order.push('pause-end');
    });
    const write = send(h, command(h, 'phrase.capture', uuid(), 0, { source: 'uk-intent', text: 'x', meaning: '' })).then((r) => order.push(`write-${r.status}`));
    await Promise.all([paused, write]);
    expect(order).toEqual(['pause-start', 'pause-end', 'write-200']);
  });

  it('maintenance mode: mutations and private reads 503 retryable, health reports maintenance', async () => {
    h = await startHarness();
    h.store.setMaintenance(true, 'restore');
    const health = await h.req('GET', '/api/v1/health');
    expect(health.body.status).toBe('maintenance');
    const read = await h.req('GET', '/api/v1/views/home', { cookie: true });
    expect(read.status).toBe(503);
    expect(read.body).toMatchObject({ code: 'MAINTENANCE', retryable: true });
    expect(contractErrors('get_views_home', 503, read.body)).toBeUndefined();
    const write = await send(h, command(h, 'phrase.capture', uuid(), 0, { source: 'uk-intent', text: 'x', meaning: '' }));
    expect(write.status).toBe(503);
    h.store.setMaintenance(false);
    expect((await h.req('GET', '/api/v1/views/home', { cookie: true })).status).toBe(200);
  });

  it('a disk-full failure rolls the whole command back and answers 503 retryable (no grade, no receipt)', async () => {
    h = await startHarness();
    const { sessionId, lv } = await startLesson(h, 'A2-03-L2');
    const c = await openTask(h, sessionId, taskOf(lv, 'A2-03-L2-T02').taskRevisionId);
    await ok(await saveDraft(h, c, 'hecho', 1));
    const before = {
      attempts: await rowCount(h, 'SELECT count(*) AS n FROM attempts'),
      receipts: await rowCount(h, 'SELECT count(*) AS n FROM mutation_receipts'),
      events: await rowCount(h, 'SELECT count(*) AS n FROM event_log'),
      targets: await rowCount(h, 'SELECT count(*) AS n FROM target_states'),
    };
    const db = h.store.db();
    const pages = db.pragma('page_count', { simple: true }) as number;
    db.pragma(`max_page_count = ${pages}`);
    const filler = 'x'.repeat(7000);
    let successes = 0;
    let res = await submit(h, c, { text: filler });
    while (res.status === 200 && successes < 5) {
      successes++;
      res = await submit(h, c, { text: filler });
    }
    db.pragma('max_page_count = 1073741823');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ code: 'STORAGE_UNAVAILABLE', retryable: true });
    expect(res.text).not.toMatch(/SQLITE|database|full/i);
    const afterFail = {
      attempts: await rowCount(h, 'SELECT count(*) AS n FROM attempts'),
      receipts: await rowCount(h, 'SELECT count(*) AS n FROM mutation_receipts'),
      events: await rowCount(h, 'SELECT count(*) AS n FROM event_log'),
      targets: await rowCount(h, 'SELECT count(*) AS n FROM target_states'),
    };
    // Submits that committed before the page limit are kept; the failing one left no attempt, receipt or event.
    expect(afterFail.attempts).toBe(before.attempts + successes);
    expect(afterFail.receipts).toBe(before.receipts + successes);
    expect(db.pragma('foreign_key_check')).toEqual([]);
    // The same operation can be retried once storage is available again.
    const retry = await submit(h, c, { text: 'hecho' });
    expect(retry.status).toBe(200);
  });

  it('rebuilding the scheduler projection from event_log equals the incremental projection', async () => {
    h = await startHarness();
    const { sessionId, lv } = await startLesson(h, 'A2-03-L1');
    await ok(await send(h, command(h, 'lesson.progress', uuid(), 0, { sessionId, stepId: 's1', action: 'visit' })));
    for (const [logical, response] of [['A2-03-L1-T01', { text: 'ha' }], ['A2-03-L1-T03', { optionId: 'a' }], ['A2-03-L1-T02', { text: 'hemos' }]] as const) {
      const c = await openTask(h, sessionId, taskOf(lv, logical).taskRevisionId);
      if ('text' in response) await ok(await saveDraft(h, c, response.text, 1));
      expect((await submit(h, c, response)).status).toBe(200);
      h.clock.advance(26 * 3600_000);
      await h.login();
    }
    await ok(await send(h, command(h, 'preference.set', uuid(), 0, { targets: [{ skillId: 'perfecto.choice', modality: 'context-choice' }], frequency: 'repeat-more' })));
    const db = h.store.db();
    const snapshot = () => ({
      targets: db.prepare('SELECT skill_id, modality, stage, due_date, pending_need, frequency, paused, introduced_date, state FROM target_states ORDER BY skill_id, modality').all(),
      meta: db.prepare('SELECT scheduler_state FROM profiles').get(),
    });
    const incremental = snapshot();
    expect((incremental.targets as unknown[]).length).toBeGreaterThan(0);
    db.transaction(() => rebuildSchedulerProjection(db))();
    expect(snapshot()).toEqual(incremental);
  });
});

describe('log rotation', () => {
  it('rotates at the size limit and keeps three files at most (0600)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sll-logs-'));
    dirs.push(dir);
    const s = new RotatingLogStream(dir, 200, 3);
    for (let i = 0; i < 40; i++) s.write(`{"line":${i},"pad":"${'x'.repeat(40)}"}\n`);
    s.close();
    const files = readdirSync(dir).sort();
    expect(files).toEqual(['server.log', 'server.log.1', 'server.log.2']);
    for (const f of files) {
      expect(statSync(join(dir, f)).size).toBeLessThanOrEqual(200);
      expect(statSync(join(dir, f)).mode & 0o777).toBe(0o600);
    }
    expect(existsSync(join(dir, 'server.log.3'))).toBe(false);
  });
});
