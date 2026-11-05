import { describe, expect, it } from 'vitest';
import { mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase, migrate, schemaVersion } from '../../apps/server/src/db/connection.ts';
import { ensurePrivateDirs } from '../../apps/server/src/db/paths.ts';
import { PORTABLE_TABLES, NON_PORTABLE_TABLES } from '../../apps/server/src/db/migrations/index.ts';

describe('db foundation', () => {
  it('creates private dirs 0700, db file 0600, WAL/FULL/FK pragmas and all tables', () => {
    const root = mkdtempSync(join(tmpdir(), 'sll-db-'));
    const paths = ensurePrivateDirs(join(root, 'home'));
    expect(statSync(paths.root).mode & 0o777).toBe(0o700);
    const db = openDatabase(paths.profileDb);
    expect(statSync(paths.profileDb).mode & 0o777).toBe(0o600);
    expect(db.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(db.pragma('synchronous', { simple: true })).toBe(2);
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>).map((r) => r.name);
    for (const t of [...PORTABLE_TABLES, ...NON_PORTABLE_TABLES]) expect(tables).toContain(t);
    expect(schemaVersion(db)).toBe(1);
    expect(migrate(db)).toEqual({ from: 1, to: 1 });
    expect(db.pragma('foreign_key_check')).toEqual([]);
    db.close();
  });
});
