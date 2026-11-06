// SQLite connection with the durability settings from DOMAIN-SPEC (D-007): single writer,
// foreign keys on, WAL, synchronous FULL, busy timeout 5 s. Migrations are applied in order.
import Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { tightenFile } from './paths.ts';
import { migrations, type Migration } from './migrations/index.ts';

export type Db = Database.Database;

export interface OpenOptions {
  readonly readonly?: boolean;
  readonly migrate?: boolean;
}

export const APP_SCHEMA_VERSION = (): number => Math.max(...migrations.map((m) => m.version));

export function openDatabase(file: string, options: OpenOptions = {}): Db {
  const db = new Database(file, { readonly: options.readonly === true, fileMustExist: options.readonly === true });
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  if (!options.readonly) {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = FULL');
    if (file !== ':memory:') tightenFile(file);
  }
  if (options.migrate !== false && !options.readonly) migrate(db);
  return db;
}

function checksum(m: Migration): string {
  return createHash('sha256').update(m.sql).digest('hex');
}

export class SchemaTooNewError extends Error {
  readonly found: number;
  readonly supported: number;
  constructor(found: number, supported: number) {
    super(`profile schema ${found} is newer than this application supports (${supported})`);
    this.found = found;
    this.supported = supported;
  }
}

/** Applies pending migrations, each in its own transaction. Refuses a profile from a newer app. */
export function migrate(db: Db): { from: number; to: number } {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    checksum TEXT NOT NULL,
    applied_at TEXT NOT NULL
  ) STRICT`);
  const rows = db.prepare('SELECT version, checksum FROM schema_migrations ORDER BY version').all() as Array<{ version: number; checksum: string }>;
  const applied = new Map(rows.map((r) => [r.version, r.checksum]));
  const from = rows.length ? rows[rows.length - 1]!.version : 0;
  const supported = APP_SCHEMA_VERSION();
  if (from > supported) throw new SchemaTooNewError(from, supported);
  for (const m of migrations) {
    const known = applied.get(m.version);
    if (known !== undefined) {
      if (known !== checksum(m)) throw new Error(`migration ${m.version} checksum mismatch`);
      continue;
    }
    db.transaction(() => {
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, ?, ?, ?)')
        .run(m.version, m.name, checksum(m), new Date().toISOString());
    })();
  }
  return { from, to: supported };
}

export function schemaVersion(db: Db): number {
  const row = db.prepare('SELECT max(version) AS v FROM schema_migrations').get() as { v: number | null };
  return row.v ?? 0;
}
