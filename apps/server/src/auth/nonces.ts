// Launcher nonces: registered over authenticated IPC, kept only as SHA-256 hashes in memory,
// 60 s TTL, single use. The nonce travels in the URL fragment and is never logged.
import { randomSecret, SECRET_PATTERN, sha256 } from './crypto.ts';

export const NONCE_TTL_MS = 60_000;
const MAX_PENDING = 64;

export class NonceRegistry {
  private readonly pending = new Map<string, number>();
  private readonly now: () => Date;

  constructor(now: () => Date) {
    this.now = now;
  }

  /** Registers a launcher nonce (or creates one) and returns it. */
  register(nonce?: string): string {
    const value = nonce ?? randomSecret();
    if (!SECRET_PATTERN.test(value)) throw new Error('nonce must be 256-bit base64url (43 chars)');
    this.prune();
    if (this.pending.size >= MAX_PENDING) {
      const oldest = [...this.pending.entries()].sort((a, b) => a[1] - b[1])[0];
      if (oldest) this.pending.delete(oldest[0]);
    }
    this.pending.set(sha256(value), this.now().getTime() + NONCE_TTL_MS);
    return value;
  }

  /** One use: a valid nonce is removed when consumed; expired or unknown nonces return false. */
  consume(nonce: string): boolean {
    if (!SECRET_PATTERN.test(nonce)) return false;
    const key = sha256(nonce);
    const expires = this.pending.get(key);
    if (expires === undefined) return false;
    this.pending.delete(key);
    return expires > this.now().getTime();
  }

  clear(): void {
    this.pending.clear();
  }

  private prune(): void {
    const t = this.now().getTime();
    for (const [k, exp] of this.pending) if (exp <= t) this.pending.delete(k);
  }
}
