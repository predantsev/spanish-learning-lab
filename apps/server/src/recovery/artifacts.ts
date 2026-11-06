// Expiring local artifacts (exports to download, uploaded archives). Owner-only, hash-bound, removed after
// expiry (API.md: downloads/uploads expire after 15 min). The registry is in memory; files left behind by a
// previous process are swept at start because their IDs no longer exist.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Clock } from '../store/types.ts';
import type { ArtifactInfo } from './types.ts';
import { removeIfExists } from './fsutil.ts';
import type { Timers, TimerHandle } from './options.ts';

export type ArtifactKind = 'export' | 'upload';

interface Entry {
  readonly kind: ArtifactKind;
  readonly info: ArtifactInfo;
  readonly timer: TimerHandle;
}

export const ARTIFACT_FILE_RE = /^[0-9a-f-]{36}\.zip(?:\.part)?$/;

export class ArtifactRegistry {
  private readonly entries = new Map<string, Entry>();
  private readonly clock: Clock;
  private readonly timers: Timers;
  private readonly ttlMs: number;

  constructor(clock: Clock, timers: Timers, ttlMs: number) {
    this.clock = clock;
    this.timers = timers;
    this.ttlMs = ttlMs;
  }

  expiryFromNow(): string {
    return new Date(this.clock.now().getTime() + this.ttlMs).toISOString();
  }

  add(kind: ArtifactKind, info: ArtifactInfo): ArtifactInfo {
    const delay = Math.max(0, Date.parse(info.expiresAt) - this.clock.now().getTime());
    const timer = this.timers.setTimeout(() => this.remove(info.id), delay);
    this.entries.set(info.id, { kind, info, timer });
    return info;
  }

  get(id: string, kind: ArtifactKind): ArtifactInfo | undefined {
    const e = this.entries.get(id);
    if (!e || e.kind !== kind) return undefined;
    if (Date.parse(e.info.expiresAt) <= this.clock.now().getTime()) {
      this.remove(id);
      return undefined;
    }
    return e.info;
  }

  /** Forgets the artifact and deletes its file. */
  remove(id: string): void {
    const e = this.entries.get(id);
    if (!e) return;
    e.timer.cancel();
    this.entries.delete(id);
    removeIfExists(e.info.path);
  }

  sweepExpired(): void {
    const now = this.clock.now().getTime();
    for (const [id, e] of this.entries) if (Date.parse(e.info.expiresAt) <= now) this.remove(id);
  }

  removeAll(): void {
    for (const id of [...this.entries.keys()]) this.remove(id);
  }

  /** Deletes artifact files in `dir` that this registry does not know (left by an earlier process). */
  sweepOrphans(dir: string): void {
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    const known = new Set([...this.entries.values()].map((e) => e.info.path));
    for (const n of names) {
      const p = join(dir, n);
      if (ARTIFACT_FILE_RE.test(n) && !known.has(p)) removeIfExists(p);
    }
  }
}
