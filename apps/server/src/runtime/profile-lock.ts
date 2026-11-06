// One profile-lock convention for the launcher (bin/sll.mjs), the server process (main.ts) and the
// privileged pack CLI: runtime/profile.lock created with O_EXCL (0600) by bin/lib/lock.mjs. A lock is
// live while its PID runs with the recorded start time; stale locks are removed, never signalled.
//   - launcher start: role "launcher" (launcher PID) → replaced by role "service" naming the child
//   - main.ts started by the launcher: the lock names this process or its launcher parent → proceed
//   - main.ts started directly: takes the lock itself (role "service") and releases it on stop
//   - pack CLI / offline work: role "offline" for the duration of the operation
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { acquireLock, LOCK_SCHEMA_VERSION, lockIsLive, readLock, releaseLock, type LockRecord } from '../../../../bin/lib/lock.mjs';
import { processIdentity } from '../../../../bin/lib/proc.mjs';
import type { PrivatePaths } from '../db/paths.ts';

export const LOCK_FILE = 'profile.lock';

export function lockPath(paths: PrivatePaths): string {
  return join(paths.runtime, LOCK_FILE);
}

export class ProfileLockedError extends Error {
  readonly code = 'PROFILE_LOCKED';
  readonly holder: LockRecord | undefined;
  constructor(holder: LockRecord | undefined) {
    super(`profile is in use by process ${holder?.pid ?? '?'} (${holder?.role ?? 'unknown'})`);
    this.holder = holder;
  }
}

export interface HeldLock {
  /** True when this process created the lock and must release it. */
  readonly owned: boolean;
  release(): void;
}

function record(role: LockRecord['role'], instanceId: string, entry: string): LockRecord {
  return {
    schemaVersion: LOCK_SCHEMA_VERSION,
    pid: process.pid,
    processStart: processIdentity(process.pid)?.start ?? '',
    executable: process.execPath,
    entry,
    instanceId,
    role,
    createdAt: new Date().toISOString(),
  };
}

/** Server process: accept a launcher-managed lock naming us (or our launcher parent), else take it ourselves. */
export function claimServiceLock(paths: PrivatePaths, instanceId: string, entry: string): HeldLock {
  const file = lockPath(paths);
  const holder = readLock(file);
  if (holder && lockIsLive(holder)) {
    const ours = holder.pid === process.pid || (holder.role === 'launcher' && holder.pid === process.ppid && holder.instanceId === instanceId);
    if (!ours) throw new ProfileLockedError(holder);
    return { owned: false, release: () => releaseLock(file, { pid: process.pid, instanceId }) };
  }
  const got = acquireLock(file, record('service', instanceId, entry));
  if (!got.ok) throw new ProfileLockedError(got.holder);
  return { owned: true, release: () => releaseLock(file, { pid: process.pid, instanceId }) };
}

/** Offline privileged work (pack install): exclusive for the duration, refused while anyone else holds the profile. */
export function claimOfflineLock(paths: PrivatePaths, instanceId: string): HeldLock {
  const file = lockPath(paths);
  const got = acquireLock(file, record('offline', instanceId, fileURLToPath(import.meta.url)));
  if (!got.ok) throw new ProfileLockedError(got.holder);
  return { owned: true, release: () => releaseLock(file, { pid: process.pid, instanceId }) };
}
