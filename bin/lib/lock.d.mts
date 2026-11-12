// Type declarations for lock.mjs (shared by the launcher, apps/server/src/main.ts and the pack CLI).
export declare const LOCK_SCHEMA_VERSION: 1;

export interface LockRecord {
  readonly schemaVersion: number;
  readonly pid: number;
  readonly processStart: string;
  readonly executable?: string;
  readonly entry?: string;
  readonly instanceId: string;
  readonly role: 'launcher' | 'service' | 'offline';
  readonly createdAt: string;
}

export declare function readLock(file: string): LockRecord | undefined;
export declare function lockIsLive(lock: LockRecord | undefined): boolean;
export declare function acquireLock(file: string, record: LockRecord): { ok: true } | { ok: false; holder: LockRecord | undefined };
export declare function replaceLock(file: string, record: LockRecord): void;
export declare function releaseLock(file: string, expected: { pid: number; instanceId: string }): void;
export declare function clearStaleLock(file: string): boolean;
