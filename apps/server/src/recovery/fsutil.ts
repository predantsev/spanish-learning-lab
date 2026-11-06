// Durable filesystem helpers: fsync of files and directories, atomic JSON writes, streamed SHA-256.
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, renameSync, rmSync, unlinkSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Flushes a file's data and metadata to stable storage. */
export function fsyncFile(path: string): void {
  const fd = openSync(path, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Flushes a directory entry table so a completed rename survives a crash. */
export function fsyncDir(dir: string): void {
  const fd = openSync(dir, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Creates a private directory (0700) if missing. */
export function ensurePrivateDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
}

/** Atomic durable write: temp file (0600) → fsync → rename → fsync parent directory. */
export function writeFileDurable(path: string, data: string | Buffer): void {
  const tmp = join(dirname(path), `.tmp-${randomUUID()}`);
  writeFileSync(tmp, data, { mode: 0o600, flag: 'wx' });
  try {
    fsyncFile(tmp);
    renameSync(tmp, path);
  } catch (err) {
    removeIfExists(tmp);
    throw err;
  }
  fsyncDir(dirname(path));
}

export function writeJsonDurable(path: string, value: unknown): void {
  writeFileDurable(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function readJsonIfExists<T>(path: string): T | undefined {
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function removeIfExists(path: string): void {
  try {
    unlinkSync(path);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}

export function removeTreeIfExists(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

/** True when the path exists and is a regular file (symlinks are never followed). */
export function isRegularFile(path: string): boolean {
  try {
    return lstatSync(path).isFile();
  } catch {
    return false;
  }
}

/** SQLite sidecar files that would be replayed onto whatever main file sits at `dbPath`. */
export function existingSidecars(dbPath: string): string[] {
  return ['-wal', '-shm', '-journal'].map((s) => `${dbPath}${s}`).filter((p) => existsSync(p));
}

export function removeSidecars(dbPath: string): void {
  for (const p of existingSidecars(dbPath)) removeIfExists(p);
}

export interface FileDigest {
  readonly sha256: string;
  readonly bytes: number;
}

export async function sha256File(path: string): Promise<FileDigest> {
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(path)) {
    const buf = chunk as Buffer;
    bytes += buf.length;
    hash.update(buf);
  }
  return { sha256: hash.digest('hex'), bytes };
}

export function sha256Hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}
