// Exclusive profile lock: runtime/profile.lock created with O_EXCL (0600) holding
// { schemaVersion, pid, processStart, executable, entry, instanceId, role, createdAt }.
// While the service runs, the lock names the service child (role "service"); offline commands hold it themselves
// (role "offline"). A lock is stale only when its process is gone or its start time/command no longer match;
// stale locks are removed, their processes are never signalled.
import { closeSync, fsyncSync, openSync, statSync, writeSync } from 'node:fs';
import { readJson, removeQuiet, writeJsonAtomic } from './fsx.mjs';
import { sameProcess } from './proc.mjs';

export const LOCK_SCHEMA_VERSION = 1;

export function readLock(file) {
  const l = readJson(file);
  return l && typeof l === 'object' && Number.isInteger(l.pid) ? l : undefined;
}

/** A lock is live while its PID runs with the recorded start time (see proc.sameProcess). */
export function lockIsLive(lock) {
  return Boolean(lock) && sameProcess(lock.pid, lock.processStart);
}

function createExclusive(file, record) {
  const fd = openSync(file, 'wx', 0o600);
  try {
    writeSync(fd, `${JSON.stringify(record, null, 2)}\n`);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Serializes stale-lock takeovers between concurrent launchers (a tiny O_EXCL mutex, itself stale after 10 s). */
function withTakeover(file, fn) {
  const t = `${file}.takeover`;
  try {
    createExclusive(t, { pid: process.pid, createdAt: new Date().toISOString() });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    let age = 0;
    try {
      age = Date.now() - statSync(t).mtimeMs;
    } catch {
      age = Infinity;
    }
    if (age < 10_000) return false;
    removeQuiet(t);
    return false;
  }
  try {
    fn();
    return true;
  } finally {
    removeQuiet(t);
  }
}

/** Returns { ok: true } or { ok: false, holder } when a live process holds the profile. */
export function acquireLock(file, record) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      createExclusive(file, record);
      return { ok: true };
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    const holder = readLock(file);
    if (holder && lockIsLive(holder)) return { ok: false, holder };
    withTakeover(file, () => {
      const again = readLock(file);
      if (!again || !lockIsLive(again)) removeQuiet(file);
    });
  }
  return { ok: false, holder: readLock(file) };
}

/** Atomically rewrites the lock content (the file never disappears). */
export function replaceLock(file, record) {
  writeJsonAtomic(file, record);
}

/** Removes the lock only if it still describes the expected holder. */
export function releaseLock(file, expected) {
  const current = readLock(file);
  if (!current) return;
  if (current.pid === expected.pid && current.instanceId === expected.instanceId) removeQuiet(file);
}

/** Removes a lock whose holder is gone (never touches a live holder). Returns true when removed. */
export function clearStaleLock(file) {
  const current = readLock(file);
  if (!current) {
    removeQuiet(file);
    return true;
  }
  if (lockIsLive(current)) return false;
  removeQuiet(file);
  return true;
}
