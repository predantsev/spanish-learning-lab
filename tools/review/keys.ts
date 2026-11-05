// Local HMAC-SHA256 key store for review/validation receipts.
// Location: $SLL_REVIEW_KEYS_DIR, else $SLL_HOME/keys, else
// ~/Library/Application Support/Spanish Learning Lab/keys (the private root, IMPLEMENTATION-PLAN).
// Directory 0700, key file 0600, created on first use with a random keyId (UUID v4). The key never
// leaves this directory: receipts carry only its keyId. Tests and dev runs must set
// SLL_REVIEW_KEYS_DIR or SLL_HOME to a temporary directory.
import { randomBytes, randomUUID } from 'node:crypto';
import { chmodSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, writeSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const KEY_FILE = 'review-hmac.key';

export interface ReviewKey {
  keyId: string;
  key: Buffer;
  createdAt: string;
  path: string;
}

/** Resolved at call time so tests can point it at a temporary directory. */
export function resolveKeysDir(env: NodeJS.ProcessEnv = process.env): string {
  if (env.SLL_REVIEW_KEYS_DIR) return resolve(env.SLL_REVIEW_KEYS_DIR);
  if (env.SLL_HOME) return join(resolve(env.SLL_HOME), 'keys');
  return join(homedir(), 'Library', 'Application Support', 'Spanish Learning Lab', 'keys');
}

function assertPrivate(path: string, what: string): void {
  const mode = statSync(path).mode & 0o777;
  if ((mode & 0o077) !== 0) {
    throw new Error(`${what} ${path} is accessible by group/others (mode ${mode.toString(8)}); expected 0700/0600`);
  }
}

function parseKeyFile(path: string): ReviewKey {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  const { keyId, key, createdAt, algorithm } = raw;
  if (algorithm !== 'HMAC-SHA256' || typeof keyId !== 'string' || typeof key !== 'string' || !/^[0-9a-f]{64}$/.test(key)) {
    throw new Error(`${path}: malformed review key file`);
  }
  return { keyId, key: Buffer.from(key, 'hex'), createdAt: typeof createdAt === 'string' ? createdAt : '', path };
}

/** Reads the existing key; undefined when none exists. Never creates anything. */
export function loadKey(dir: string = resolveKeysDir()): ReviewKey | undefined {
  const path = join(dir, KEY_FILE);
  if (!existsSync(path)) return undefined;
  assertPrivate(dir, 'review keys directory');
  assertPrivate(path, 'review key file');
  return parseKeyFile(path);
}

/** Reads the key, creating directory (0700) and key file (0600, exclusive create) on first use. */
export function loadOrCreateKey(dir: string = resolveKeysDir()): ReviewKey {
  const existing = loadKey(dir);
  if (existing) return existing;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    chmodSync(dir, 0o700);
  }
  assertPrivate(dir, 'review keys directory');
  const path = join(dir, KEY_FILE);
  const body = {
    schemaVersion: 1,
    keyId: randomUUID(),
    algorithm: 'HMAC-SHA256',
    key: randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString(),
  };
  let fd: number;
  try {
    fd = openSync(path, 'wx', 0o600);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return loadKey(dir) as ReviewKey;
    throw error;
  }
  try {
    writeSync(fd, `${JSON.stringify(body, null, 2)}\n`);
  } finally {
    closeSync(fd);
  }
  chmodSync(path, 0o600);
  return parseKeyFile(path);
}
