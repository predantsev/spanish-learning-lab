// DEVELOPMENT-ONLY synthetic read models ("демо-дані"). Not reviewed course content, not learner
// records. Used only by dev/demo.ts for layout work; excluded from production builds.

export function demoFixtures(path: string, _url: string): unknown {
  if (path === '/auth/session') {
    return {
      csrfToken: 'demo',
      profileEpoch: 1,
      profileId: '00000000-0000-4000-8000-000000000001',
      profileRevision: 1,
      revision: 1,
      expiresAt: '2099-01-01T00:00:00Z',
    };
  }
  return undefined;
}
