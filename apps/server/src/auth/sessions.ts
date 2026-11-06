// Owner browser sessions: cookie `sll_session` (HttpOnly, SameSite=Strict, Path=/), 8 h sliding
// and 24 h absolute expiry. Only hashes are stored: cookie_hash = SHA-256(cookie); the CSRF token is
// HMAC(cookie, label), so it is reproducible from the cookie and owner_sessions.csrf_token keeps its hash.
import { randomUUID } from 'node:crypto';
import type { Db } from '../db/connection.ts';
import { hmac, randomSecret, safeEqual, SECRET_PATTERN, sha256 } from './crypto.ts';

export const COOKIE_NAME = 'sll_session';
export const SESSION_SLIDING_MS = 8 * 60 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 24 * 60 * 60 * 1000;
const TOUCH_MIN_INTERVAL_MS = 60_000;

export interface OwnerSession {
  readonly id: string;
  readonly revision: number;
  readonly profileEpoch: number;
  readonly expiresAt: string;
  readonly absoluteExpiresAt: string;
  readonly lastSeenAt: string;
}

interface SessionRow {
  id: string;
  csrf_token: string;
  revision: number;
  profile_epoch: number;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  absolute_expires_at: string;
  revoked_at: string | null;
}

export function csrfFor(cookieValue: string): string {
  return hmac(cookieValue, 'sll-csrf-v1');
}

function toSession(r: SessionRow): OwnerSession {
  return {
    id: r.id,
    revision: r.revision,
    profileEpoch: r.profile_epoch,
    expiresAt: r.expires_at,
    absoluteExpiresAt: r.absolute_expires_at,
    lastSeenAt: r.last_seen_at,
  };
}

export function createSession(db: Db, now: Date, profileEpoch: number): { cookie: string; session: OwnerSession } {
  const cookie = randomSecret();
  const id = randomUUID();
  const t = now.toISOString();
  const expires = new Date(now.getTime() + SESSION_SLIDING_MS).toISOString();
  const absolute = new Date(now.getTime() + SESSION_ABSOLUTE_MS).toISOString();
  db.prepare(
    `INSERT INTO owner_sessions (id, cookie_hash, csrf_token, revision, profile_epoch, created_at, last_seen_at, expires_at, absolute_expires_at)
     VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)`,
  ).run(id, sha256(cookie), sha256(csrfFor(cookie)), profileEpoch, t, t, expires, absolute);
  return { cookie, session: { id, revision: 1, profileEpoch, expiresAt: expires, absoluteExpiresAt: absolute, lastSeenAt: t } };
}

export type SessionLookup =
  | { readonly state: 'valid'; readonly session: OwnerSession }
  | { readonly state: 'expired' | 'revoked' | 'invalid' };

/** Looks up a cookie without extending it. An expired session is never revived. */
export function findSession(db: Db, cookieValue: string, now: Date, profileEpoch: number): SessionLookup {
  if (!SECRET_PATTERN.test(cookieValue)) return { state: 'invalid' };
  const r = db.prepare('SELECT * FROM owner_sessions WHERE cookie_hash = ?').get(sha256(cookieValue)) as SessionRow | undefined;
  if (!r) return { state: 'invalid' };
  if (r.revoked_at !== null) return { state: 'revoked' };
  if (r.profile_epoch !== profileEpoch) return { state: 'revoked' };
  const t = now.toISOString();
  if (r.expires_at <= t || r.absolute_expires_at <= t) return { state: 'expired' };
  return { state: 'valid', session: toSession(r) };
}

/** Sliding expiry for a valid session (throttled to one write per minute). */
export function touchSession(db: Db, session: OwnerSession, now: Date): OwnerSession {
  if (now.getTime() - Date.parse(session.lastSeenAt) < TOUCH_MIN_INTERVAL_MS) return session;
  const sliding = now.getTime() + SESSION_SLIDING_MS;
  const expires = new Date(Math.min(sliding, Date.parse(session.absoluteExpiresAt))).toISOString();
  const t = now.toISOString();
  db.prepare('UPDATE owner_sessions SET last_seen_at = ?, expires_at = ? WHERE id = ? AND revoked_at IS NULL').run(t, expires, session.id);
  return { ...session, lastSeenAt: t, expiresAt: expires };
}

export function revokeSession(db: Db, sessionId: string, now: Date): void {
  db.prepare('UPDATE owner_sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(now.toISOString(), sessionId);
}

export function checkCsrf(cookieValue: string, presented: string | undefined): boolean {
  if (typeof presented !== 'string' || presented.length === 0 || presented.length > 100) return false;
  return safeEqual(csrfFor(cookieValue), presented);
}

export function sessionCookieHeader(cookie: string, maxAgeSeconds: number): string {
  return `${COOKIE_NAME}=${cookie}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`;
}

export function clearedCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

/** Extracts sll_session from a Cookie header; undefined when absent. */
export function readSessionCookie(header: string | undefined): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === COOKIE_NAME) return part.slice(i + 1).trim();
  }
  return undefined;
}
