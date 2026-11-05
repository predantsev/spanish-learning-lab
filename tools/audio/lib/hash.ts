// Hashing helpers shared by the audio tools. Pure except for sha256File.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function sha256Hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

export function sha256File(path: string): string {
  return sha256Hex(readFileSync(path));
}

/** Canonical JSON: object keys sorted recursively, no whitespace, UTF-8 when hashed. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = sortKeys(v);
    }
    return out;
  }
  return value;
}

/**
 * Transcript identity: SHA-256 of the NFC-normalized UTF-8 text, so composed vs decomposed
 * accents never trigger a regeneration or a false mismatch.
 */
export function transcriptSha256(transcript: string): string {
  return sha256Hex(transcript.normalize('NFC'));
}
