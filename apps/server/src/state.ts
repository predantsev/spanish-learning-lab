// Per-server in-memory state shared by the route modules.
import { createContractValidator, type ContractValidator } from '@sll/contracts';
import { NonceRegistry } from './auth/nonces.ts';
import { randomSecret } from './auth/crypto.ts';
import { LeaseRegistry } from './commands/leases.ts';
import { DEFAULT_RATE_LIMITS, RateLimiter, type RateLimits } from './http/rate-limit.ts';
import type { Recovery } from './recovery/types.ts';
import type { ProfileStore } from './store/types.ts';

export interface TimezonePreviewRecord {
  readonly id: string;
  readonly revision: number;
  readonly profileEpoch: number;
  readonly profileRevision: number;
  readonly fromZone: string;
  readonly toZone: string;
  readonly expiresAt: string;
}

export const TIMEZONE_PREVIEW_TTL_MS = 5 * 60_000;

export class ServerState {
  readonly store: ProfileStore;
  readonly recovery: Recovery | undefined;
  readonly now: () => Date;
  readonly nonces: NonceRegistry;
  readonly leases = new LeaseRegistry();
  readonly previews = new Map<string, TimezonePreviewRecord>();
  /** Key for HMAC-bound opaque catalog cursors (in memory; a restart invalidates cursors → 409 STALE_CURSOR). */
  readonly cursorKey = randomSecret();
  readonly limiter: RateLimiter;
  readonly validator: ContractValidator = createContractValidator();
  /** Bound TCP port (known after listen); the Host allowlist is computed from it. */
  port = 0;

  constructor(store: ProfileStore, recovery: Recovery | undefined, now: () => Date, limits: RateLimits = DEFAULT_RATE_LIMITS) {
    this.store = store;
    this.recovery = recovery;
    this.now = now;
    this.nonces = new NonceRegistry(now);
    this.limiter = new RateLimiter(limits);
  }

  /** Tells the store (and through it the recovery scheduler) about a committed learning change. */
  committed(eventSeq: number, kind: string): void {
    const notify = (this.store as unknown as { notifyCommitted?: (s: number, k: string) => void }).notifyCommitted;
    if (typeof notify === 'function') notify.call(this.store, eventSeq, kind);
  }

  /** After a restore switch: every nonce, lease and preview of the old epoch is void. */
  invalidateVolatileAuth(): void {
    this.nonces.clear();
    this.leases.clear();
    this.previews.clear();
  }
}
