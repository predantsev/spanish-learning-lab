// Agent bearer tokens: 256-bit secrets shown once, stored as SHA-256, scoped, 7-day default/30-day max,
// revocation immediate. Tokens are capabilities, not content signatures.
import type { Scope, TokenMetadata } from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import { randomSecret, SECRET_PATTERN, sha256 } from './crypto.ts';

export const ALL_SCOPES: readonly Scope[] = ['context:read', 'course:read', 'draft:write', 'help:write', 'practice:write', 'preference:write'];
export const MAX_TTL_DAYS = 30;

interface TokenRow {
  id: string;
  label: string;
  scopes: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export interface AgentToken {
  readonly id: string;
  readonly label: string;
  readonly scopes: readonly Scope[];
  readonly createdAt: string;
  readonly expiresAt: string;
}

export function createToken(db: Db, input: { id: string; label: string; scopes: readonly Scope[]; ttlDays: number; now: Date }): { token: string; expiresAt: string } {
  const token = randomSecret();
  const ttl = Math.min(Math.max(1, input.ttlDays), MAX_TTL_DAYS);
  const expiresAt = new Date(input.now.getTime() + ttl * 86_400_000).toISOString();
  const scopes = [...new Set(input.scopes)].sort();
  db.prepare('INSERT INTO auth_tokens (id, label, scopes, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    input.id,
    input.label,
    JSON.stringify(scopes),
    sha256(token),
    input.now.toISOString(),
    expiresAt,
  );
  return { token, expiresAt };
}

export type TokenLookup = { readonly state: 'valid'; readonly token: AgentToken } | { readonly state: 'expired' | 'revoked' | 'invalid' };

export function findToken(db: Db, secret: string, now: Date): TokenLookup {
  if (!SECRET_PATTERN.test(secret)) return { state: 'invalid' };
  const r = db.prepare('SELECT id, label, scopes, created_at, expires_at, revoked_at FROM auth_tokens WHERE token_hash = ?').get(sha256(secret)) as TokenRow | undefined;
  if (!r) return { state: 'invalid' };
  if (r.revoked_at !== null) return { state: 'revoked' };
  if (r.expires_at <= now.toISOString()) return { state: 'expired' };
  return { state: 'valid', token: { id: r.id, label: r.label, scopes: JSON.parse(r.scopes) as Scope[], createdAt: r.created_at, expiresAt: r.expires_at } };
}

export function tokenExists(db: Db, id: string): { revoked: boolean } | undefined {
  const r = db.prepare('SELECT revoked_at FROM auth_tokens WHERE id = ?').get(id) as { revoked_at: string | null } | undefined;
  return r ? { revoked: r.revoked_at !== null } : undefined;
}

export function revokeToken(db: Db, id: string, now: Date): boolean {
  return db.prepare('UPDATE auth_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(now.toISOString(), id).changes > 0;
}

export function listTokens(db: Db): TokenMetadata[] {
  const rows = db.prepare('SELECT id, label, scopes, created_at, expires_at, revoked_at FROM auth_tokens ORDER BY created_at, id').all() as TokenRow[];
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    scopes: JSON.parse(r.scopes) as Scope[],
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    revoked: r.revoked_at !== null,
  }));
}
