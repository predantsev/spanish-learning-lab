// In-memory per-client limits: 600 requests/min and a mutation burst of 20 per 10 s (API.md).
// Sliding windows over an injected clock so tests are deterministic.
export interface RateLimits {
  readonly requestsPerMinute: number;
  readonly mutationBurst: number;
  readonly mutationWindowMs: number;
}

export const DEFAULT_RATE_LIMITS: RateLimits = { requestsPerMinute: 600, mutationBurst: 20, mutationWindowMs: 10_000 };

const MAX_CLIENTS = 2000;

export class RateLimiter {
  private readonly limits: RateLimits;
  private readonly requests = new Map<string, number[]>();
  private readonly mutations = new Map<string, number[]>();

  constructor(limits: RateLimits = DEFAULT_RATE_LIMITS) {
    this.limits = limits;
  }

  /** Records the request; returns retry-after seconds when a limit is exceeded, otherwise 0. */
  hit(client: string, isMutation: boolean, nowMs: number): number {
    if (this.requests.size > MAX_CLIENTS) this.prune(nowMs);
    const minute = this.window(this.requests, client, nowMs, 60_000);
    if (minute.length >= this.limits.requestsPerMinute) return Math.max(1, Math.ceil((minute[0]! + 60_000 - nowMs) / 1000));
    if (isMutation) {
      const burst = this.window(this.mutations, client, nowMs, this.limits.mutationWindowMs);
      if (burst.length >= this.limits.mutationBurst) return Math.max(1, Math.ceil((burst[0]! + this.limits.mutationWindowMs - nowMs) / 1000));
      burst.push(nowMs);
    }
    minute.push(nowMs);
    return 0;
  }

  private window(map: Map<string, number[]>, client: string, nowMs: number, spanMs: number): number[] {
    let list = map.get(client);
    if (!list) {
      list = [];
      map.set(client, list);
    }
    while (list.length > 0 && list[0]! <= nowMs - spanMs) list.shift();
    return list;
  }

  private prune(nowMs: number): void {
    for (const [k, v] of this.requests) if (v.length === 0 || v[v.length - 1]! <= nowMs - 60_000) this.requests.delete(k);
    for (const [k, v] of this.mutations) if (v.length === 0 || v[v.length - 1]! <= nowMs - this.limits.mutationWindowMs) this.mutations.delete(k);
  }
}
