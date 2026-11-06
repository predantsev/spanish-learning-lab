import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** 256-bit random secret, base64url without padding (43 chars, matches Snapshot/Exchange/TokenCreated patterns). */
export function randomSecret(): string {
  return randomBytes(32).toString('base64url');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function hmac(key: string, message: string): string {
  return createHmac('sha256', key).update(message, 'utf8').digest('base64url');
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/;
