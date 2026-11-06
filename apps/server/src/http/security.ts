// Host/Origin allowlist and response security headers (API.md §Boundary and authentication).
export const CANONICAL_HOSTNAME = 'spanish-learning-lab.localhost';

export const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'x-content-type-options': 'nosniff',
  'content-security-policy': CSP,
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
};

/** Exact Host values accepted for a bound port; anything else (rebinding names, missing port, other ports) is rejected. */
export function allowedHosts(port: number): ReadonlySet<string> {
  return new Set([`${CANONICAL_HOSTNAME}:${port}`, `127.0.0.1:${port}`, `localhost:${port}`]);
}

export function allowedOrigins(port: number): ReadonlySet<string> {
  return new Set([...allowedHosts(port)].map((h) => `http://${h}`));
}

/** Forwarding headers are never trusted; their presence means a proxy or a forged request. */
export function hasForwardingHeaders(headers: Record<string, string | string[] | undefined>): boolean {
  for (const name of Object.keys(headers)) {
    if (name === 'forwarded' || name.startsWith('x-forwarded-') || name === 'x-real-ip' || name === 'x-original-host') return true;
  }
  return false;
}
