// DEVELOPMENT-ONLY fixture adapter ("демо-дані"). Imported only behind `import.meta.env.DEV`, so it
// is tree-shaken out of production builds. It serves synthetic read models for layout work and
// refuses every write with a visible error: it never returns a Receipt, an Attempt or a verdict,
// i.e. it never pretends to save or grade anything.
import { demoFixtures } from './fixtures.ts';

const DEMO_KEY = 'sll-demo';

export function demoRequested(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') window.sessionStorage.setItem(DEMO_KEY, '1');
    if (params.get('demo') === '0') window.sessionStorage.removeItem(DEMO_KEY);
    return window.sessionStorage.getItem(DEMO_KEY) === '1';
  } catch {
    return false;
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const REQUEST_ID = '00000000-0000-4000-8000-00000000dee0';

function envelope(data: unknown): Response {
  return json(200, { apiVersion: '1', requestId: REQUEST_ID, profileEpoch: 1, data });
}

function refusal(): Response {
  return json(403, {
    apiVersion: '1',
    requestId: REQUEST_ID,
    code: 'DEMO_READ_ONLY',
    messageKey: 'errors.DEMO_READ_ONLY',
    retryable: false,
  });
}

export function createDemoTransport() {
  return async (url: string, init: RequestInit): Promise<Response> => {
    const method = (init.method ?? 'GET').toUpperCase();
    const path = url.replace(/^\/api\/v1/, '').split('?')[0] ?? '';
    if (method !== 'GET') return refusal();
    if (path === '/health') return json(200, { status: 'ok', instanceId: REQUEST_ID, apiVersion: '1', storageWritable: false });
    const data = demoFixtures(path, url);
    return data === undefined ? json(404, { apiVersion: '1', requestId: REQUEST_ID, code: 'NOT_FOUND', messageKey: 'errors.NOT_FOUND', retryable: false }) : envelope(data);
  };
}
