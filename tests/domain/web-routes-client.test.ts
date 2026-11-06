import { describe, expect, it } from 'vitest';
import { ApiClient, type Transport } from '../../apps/web/src/api/client.ts';
import { makeCommand } from '../../apps/web/src/api/commands.ts';
import { ApiRequestError, errorMessageKey } from '../../apps/web/src/api/errors.ts';
import { takeFragmentNonce } from '../../apps/web/src/api/nonce.ts';
import { parseRoute, paths, safeAppRoute } from '../../apps/web/src/router/routes.ts';

describe('routes', () => {
  it('parses every application route', () => {
    expect(parseRoute('/')).toEqual({ name: 'home' });
    expect(parseRoute('/catalog')).toEqual({ name: 'catalog' });
    expect(parseRoute('/catalog/A2-03-L2')).toEqual({ name: 'catalog', lessonId: 'A2-03-L2' });
    expect(parseRoute('/lesson/A1-01-L1')).toEqual({ name: 'lesson', lessonId: 'A1-01-L1' });
    expect(parseRoute('/lesson/A1-01-L1/step-2')).toEqual({ name: 'lesson', lessonId: 'A1-01-L1', stepId: 'step-2' });
    expect(parseRoute('/exercise/abc')).toEqual({ name: 'exercise', taskRevisionId: 'abc' });
    expect(parseRoute('/review')).toEqual({ name: 'review' });
    expect(parseRoute('/listening')).toEqual({ name: 'listening' });
    expect(parseRoute('/phrases')).toEqual({ name: 'phrases' });
    expect(parseRoute('/phrases/p1')).toEqual({ name: 'phrases', phraseId: 'p1' });
    expect(parseRoute('/collections/c1')).toEqual({ name: 'collection', collectionId: 'c1' });
    expect(parseRoute('/materials/A2-03')).toEqual({ name: 'materials', topicId: 'A2-03' });
    expect(parseRoute('/progress')).toEqual({ name: 'progress' });
    expect(parseRoute('/settings')).toEqual({ name: 'settings' });
    expect(parseRoute('/settings/agents')).toEqual({ name: 'settings-agents' });
    expect(parseRoute('/settings/recovery')).toEqual({ name: 'settings-recovery' });
    expect(parseRoute('/practice/set-1')).toEqual({ name: 'practice', setId: 'set-1' });
    expect(parseRoute('/nope').name).toBe('not-found');
    expect(parseRoute('/catalog/a/b').name).toBe('not-found');
  });

  it('builds links that parse back', () => {
    expect(parseRoute(paths.lesson('A1-01-L1', 's 1'))).toEqual({ name: 'lesson', lessonId: 'A1-01-L1', stepId: 's 1' });
    expect(paths.exercise('t1', { session: 's1', context: undefined })).toBe('/exercise/t1?session=s1');
  });

  it('only follows relative application routes from the service', () => {
    expect(safeAppRoute('/practice/abc')).toBe('/practice/abc');
    expect(safeAppRoute('https://evil.example/x')).toBeNull();
    expect(safeAppRoute('//evil.example')).toBeNull();
    expect(safeAppRoute('/unknown/x')).toBeNull();
    expect(safeAppRoute(undefined)).toBeNull();
  });
});

describe('launcher nonce', () => {
  it('reads #n=<nonce> and removes the fragment immediately', () => {
    const nonce = 'A'.repeat(43);
    const calls: string[] = [];
    const result = takeFragmentNonce(
      { hash: `#n=${nonce}`, pathname: '/', search: '' },
      { state: null, replaceState: (_d, _u, url) => calls.push(String(url)) },
    );
    expect(result).toBe(nonce);
    expect(calls).toEqual(['/']);
  });

  it('removes a malformed nonce without using it and ignores unrelated fragments', () => {
    const calls: string[] = [];
    const history = { state: null, replaceState: (_d: unknown, _u: string, url?: string | null) => calls.push(String(url)) };
    expect(takeFragmentNonce({ hash: '#n=short', pathname: '/catalog', search: '?q=1' }, history)).toBeNull();
    expect(calls).toEqual(['/catalog?q=1']);
    expect(takeFragmentNonce({ hash: '#main', pathname: '/', search: '' }, history)).toBeNull();
    expect(calls).toHaveLength(1);
  });
});

interface Recorded {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
}

function session(csrf: string, epoch = 1) {
  return {
    apiVersion: '1',
    requestId: '00000000-0000-4000-8000-000000000099',
    profileEpoch: epoch,
    data: {
      csrfToken: csrf,
      profileEpoch: epoch,
      profileId: '00000000-0000-4000-8000-000000000001',
      profileRevision: 2,
      revision: 1,
      expiresAt: '2026-11-06T10:00:00Z',
    },
  };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('API client mutations', () => {
  it('sends idempotency, epoch, quoted If-Match and CSRF headers', async () => {
    const recorded: Recorded[] = [];
    const transport: Transport = async (url, init) => {
      recorded.push({
        url,
        method: init.method ?? 'GET',
        headers: init.headers as Record<string, string>,
        body: init.body as string | undefined,
      });
      if (url.endsWith('/auth/session')) return json(200, session('csrf-1'));
      return json(200, {
        apiVersion: '1',
        requestId: '00000000-0000-4000-8000-000000000098',
        operationId: JSON.parse(String(init.body)).operationId,
        profileEpoch: 1,
        kind: 'phrase.capture',
        eventSeq: 3,
        entities: [],
        outcome: 'created',
      });
    };
    const client = new ApiClient({ transport });
    await client.readSession();
    const command = makeCommand('phrase.capture', client.profileEpoch, {
      subjectId: '00000000-0000-4000-8000-000000000002',
      expectedRevision: 0,
      payload: { source: 'uk-intent', text: 'Синтетичний намір', meaning: '' },
    });
    const receipt = await client.command(command);
    expect(receipt.operationId).toBe(command.operationId);
    const post = recorded[1];
    expect(post?.headers['Idempotency-Key']).toBe(command.operationId);
    expect(post?.headers['X-Profile-Epoch']).toBe('1');
    expect(post?.headers['If-Match']).toBe('"0"');
    expect(post?.headers['X-CSRF-Token']).toBe('csrf-1');
    expect(JSON.parse(String(post?.body))).toEqual(command);
  });

  it('on a CSRF 403 refreshes the session and resends the same operation and body once', async () => {
    const recorded: Recorded[] = [];
    let sessionReads = 0;
    let posts = 0;
    const transport: Transport = async (url, init) => {
      recorded.push({ url, method: init.method ?? 'GET', headers: init.headers as Record<string, string>, body: init.body as string | undefined });
      if (url.endsWith('/auth/session')) {
        sessionReads += 1;
        return json(200, session(sessionReads === 1 ? 'old' : 'new'));
      }
      posts += 1;
      if (posts === 1) {
        return json(403, { apiVersion: '1', requestId: '00000000-0000-4000-8000-000000000097', code: 'CSRF_MISMATCH', messageKey: 'errors.CSRF_MISMATCH', retryable: false });
      }
      return json(200, {
        apiVersion: '1',
        requestId: '00000000-0000-4000-8000-000000000096',
        operationId: JSON.parse(String(init.body)).operationId,
        profileEpoch: 1,
        kind: 'collection.create',
        eventSeq: 4,
        entities: [],
        outcome: 'created',
      });
    };
    const client = new ApiClient({ transport });
    await client.readSession();
    const command = makeCommand('collection.create', 1, {
      subjectId: '00000000-0000-4000-8000-000000000003',
      expectedRevision: 0,
      payload: { name: 'Synthetic', phraseIds: [] },
    });
    await client.command(command);
    const commandPosts = recorded.filter((call) => call.url.endsWith('/commands'));
    expect(commandPosts).toHaveLength(2);
    expect(commandPosts[0]?.body).toBe(commandPosts[1]?.body);
    expect(commandPosts[0]?.headers['Idempotency-Key']).toBe(commandPosts[1]?.headers['Idempotency-Key']);
    expect(commandPosts[0]?.headers['X-CSRF-Token']).toBe('old');
    expect(commandPosts[1]?.headers['X-CSRF-Token']).toBe('new');
  });

  it('reports network failures as retryable "not saved" errors', async () => {
    const client = new ApiClient({
      transport: async (url) => {
        if (url.endsWith('/auth/session')) return json(200, session('c'));
        throw new TypeError('Failed to fetch');
      },
    });
    await client.readSession();
    const command = makeCommand('collection.create', 1, {
      subjectId: '00000000-0000-4000-8000-000000000004',
      expectedRevision: 0,
      payload: { name: 'x', phraseIds: [] },
    });
    const error = await client.command(command).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).retryable).toBe(true);
    expect((error as ApiRequestError).notSaved).toBe(true);
  });

  it('maps error codes to locale keys errors.<CODE>, then messageKey, then generic', () => {
    const known = new Set(['errors.STALE_REVISION', 'error.staleRevision', 'errors.generic409', 'errors.generic']);
    const has = (key: string) => known.has(key);
    const stale = new ApiRequestError('http', 409, {
      apiVersion: '1',
      requestId: '00000000-0000-4000-8000-000000000095',
      code: 'STALE_REVISION',
      messageKey: 'error.staleRevision',
      retryable: false,
    });
    expect(errorMessageKey(stale, has)).toBe('errors.STALE_REVISION');
    const other = new ApiRequestError('http', 409, {
      apiVersion: '1',
      requestId: '00000000-0000-4000-8000-000000000094',
      code: 'SOMETHING_NEW',
      messageKey: 'error.staleRevision',
      retryable: false,
    });
    expect(errorMessageKey(other, has)).toBe('error.staleRevision');
    expect(errorMessageKey(new ApiRequestError('http', 409), has)).toBe('errors.generic409');
  });
});
