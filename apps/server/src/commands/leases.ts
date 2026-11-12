// Context snapshot leases (API.md §Commands): GET /contexts/{id} issues a random 256-bit token; only
// its hash is kept, in memory, for 60 s, bound to instanceId, principal, profileEpoch and the context
// id + revision. Active-context commands present it as `contextSnapshot`.
import { randomSecret, sha256 } from '../auth/crypto.ts';

export const LEASE_TTL_MS = 60_000;
const MAX_LEASES = 5000;

export interface LeaseBinding {
  readonly instanceId: string;
  readonly principalKey: string;
  readonly epoch: number;
  readonly contextId: string;
  readonly contextRevision: number;
}

interface Lease extends LeaseBinding {
  readonly expiresAt: number;
}

export type LeaseCheck = 'ok' | 'unknown' | 'expired' | 'other-client' | 'mismatch';

export class LeaseRegistry {
  private readonly leases = new Map<string, Lease>();

  issue(binding: LeaseBinding, now: Date): { token: string; expiresAt: Date } {
    this.prune(now);
    if (this.leases.size >= MAX_LEASES) {
      const oldest = [...this.leases.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0];
      if (oldest) this.leases.delete(oldest[0]);
    }
    const token = randomSecret();
    const expiresAt = now.getTime() + LEASE_TTL_MS;
    this.leases.set(sha256(token), { ...binding, expiresAt });
    return { token, expiresAt: new Date(expiresAt) };
  }

  check(token: string | undefined, binding: LeaseBinding, now: Date): LeaseCheck {
    if (!token) return 'unknown';
    const lease = this.leases.get(sha256(token));
    if (!lease) return 'unknown';
    if (lease.expiresAt <= now.getTime()) return 'expired';
    if (lease.instanceId !== binding.instanceId || lease.principalKey !== binding.principalKey) return 'other-client';
    if (lease.epoch !== binding.epoch || lease.contextId !== binding.contextId || lease.contextRevision !== binding.contextRevision) return 'mismatch';
    return 'ok';
  }

  clear(): void {
    this.leases.clear();
  }

  private prune(now: Date): void {
    const t = now.getTime();
    for (const [k, l] of this.leases) if (l.expiresAt <= t) this.leases.delete(k);
  }
}
