// Launcher nonce hand-off (API.md): the launcher opens `<origin>/#n=<nonce>`. The UI reads the nonce
// once and immediately removes the fragment with history.replaceState, before any network call, so
// the nonce never stays in the address bar, history, referrer or logs.

const NONCE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export interface LocationLike {
  readonly hash: string;
  readonly pathname: string;
  readonly search: string;
}

export interface HistoryLike {
  readonly state: unknown;
  replaceState(data: unknown, unused: string, url?: string | null): void;
}

export function takeFragmentNonce(location: LocationLike, history: HistoryLike): string | null {
  const hash = location.hash;
  if (!hash || hash.length < 2) return null;
  const params = new URLSearchParams(hash.slice(1));
  if (!params.has('n')) return null;
  const nonce = params.get('n') ?? '';
  history.replaceState(history.state, '', `${location.pathname}${location.search}`);
  return NONCE_PATTERN.test(nonce) ? nonce : null;
}
