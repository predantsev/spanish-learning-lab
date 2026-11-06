// Small durable-file helpers for the launcher (0600 files, atomic replace, fsync).
import { randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function fsyncPath(path) {
  const fd = openSync(path, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Atomic durable replace: temp (0600) → fsync → rename → fsync directory. The target never disappears. */
export function writeFileAtomic(path, data) {
  const tmp = join(dirname(path), `.tmp-${randomUUID()}`);
  writeFileSync(tmp, data, { mode: 0o600, flag: 'wx' });
  try {
    fsyncPath(tmp);
    renameSync(tmp, path);
  } catch (err) {
    removeQuiet(tmp);
    throw err;
  }
  fsyncPath(dirname(path));
}

export function writeJsonAtomic(path, value) {
  writeFileAtomic(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** Parsed JSON, or undefined when the file is missing or unreadable. */
export function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return undefined;
  }
}

export function removeQuiet(path) {
  try {
    unlinkSync(path);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}
