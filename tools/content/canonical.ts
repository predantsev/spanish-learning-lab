// Canonical JSON, SHA-256 digests and deterministic revision IDs shared by the content and review tools.
// Canonical JSON = object keys sorted by UTF-16 code unit order (Array.prototype.sort default),
// no insignificant whitespace, ECMAScript JSON string escaping, UTF-8 bytes. Undefined members are
// omitted; non-finite numbers are rejected because they have no JSON representation.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function canonicalJson(value: unknown): string {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) throw new Error(`canonicalJson: non-finite number ${String(value)}`);
      return JSON.stringify(value);
    case 'object': {
      if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item ?? null)).join(',')}]`;
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
    }
    default:
      throw new Error(`canonicalJson: unsupported value of type ${typeof value}`);
  }
}

export function sha256Hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

/** SHA-256 over the canonical UTF-8 JSON of a value. */
export function canonicalSha256(value: unknown): string {
  return sha256Hex(Buffer.from(canonicalJson(value), 'utf8'));
}

/**
 * Deterministic revision ID: first 16 bytes of sha256(kind|logicalId|canonicalJSON(body)) with the
 * RFC 9562 version-8 nibble and variant bits set. Formatted as a lowercase UUID string.
 */
export function revisionId(kind: string, logicalId: string, body: unknown): string {
  const digest = createHash('sha256')
    .update(Buffer.from(`${kind}|${logicalId}|${canonicalJson(body)}`, 'utf8'))
    .digest();
  const bytes = Buffer.from(digest.subarray(0, 16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x80; // version 8
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // RFC 9562 variant 10xx
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Hex HMAC-SHA256 over the canonical UTF-8 JSON of `fields`. */
export function hmacHex(key: Uint8Array, fields: unknown): string {
  return createHmac('sha256', key).update(Buffer.from(canonicalJson(fields), 'utf8')).digest('hex');
}

/** Constant-time comparison of two lowercase hex digests of equal length. */
export function hexEqual(a: string, b: string): boolean {
  if (!/^[0-9a-f]*$/.test(a) || !/^[0-9a-f]*$/.test(b) || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
