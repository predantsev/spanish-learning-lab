// Portable logical export (DOMAIN-SPEC §Backups, export): ZIP with manifest.json + one NDJSON file per portable
// table (logical rows, never the raw DB file), private assets, and optionally the installed pack files.
// Rows are read from a pinned online copy, so the export matches exactly one eventSeq without blocking writes
// while the ZIP is compressed. Credentials, sessions, runtime, logs and keys are never included.
import Database from 'better-sqlite3';
import yazl from 'yazl';
import { randomUUID } from 'node:crypto';
import { createWriteStream, lstatSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { NON_PORTABLE_TABLES, PORTABLE_TABLES } from '../db/migrations/index.ts';
import type { ProfileStore } from '../store/types.ts';
import { RecoveryError, type ArtifactInfo } from './types.ts';
import type { ArtifactRegistry } from './artifacts.ts';
import {
  EXPORT_FORMAT,
  EXPORT_FORMAT_VERSION,
  MANIFEST_NAME,
  isKnownEntryName,
  isSafeSegment,
  packEntryPath,
  packManifestHashes,
  type ExportManifest,
  type ManifestFile,
  type ManifestPack,
  type ManifestTable,
} from './archive.ts';
import { convertToDeleteJournal, type BackupManager } from './backups.ts';
import { ensurePrivateDir, fsyncDir, fsyncFile, isRegularFile, removeIfExists, removeSidecars, sha256File, sha256Hex } from './fsutil.ts';
import type { ResolvedOptions } from './options.ts';

export interface ExportDeps {
  readonly store: ProfileStore;
  readonly backups: BackupManager;
  readonly artifacts: ArtifactRegistry;
  readonly options: ResolvedOptions;
}

/** Encodes a row as a JSON object in column order. BLOBs become {"$base64": "..."}. */
export function encodeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null || typeof v === 'string') out[k] = v;
    else if (typeof v === 'number') {
      if (!Number.isFinite(v)) throw new RecoveryError('EXPORT_VALUE_UNSUPPORTED', 503, 'non-finite number in profile data');
      out[k] = v;
    } else if (Buffer.isBuffer(v)) out[k] = { $base64: v.toString('base64') };
    else throw new RecoveryError('EXPORT_VALUE_UNSUPPORTED', 503, 'unsupported value type in profile data');
  }
  return out;
}

function dumpTable(db: Database.Database, name: string): { buf: Buffer; rows: number } {
  const sql = (db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) as { sql: string } | undefined)?.sql ?? '';
  let order = 'rowid';
  if (/WITHOUT\s+ROWID/i.test(sql)) {
    const cols = db.prepare(`PRAGMA table_info("${name}")`).all() as Array<{ name: string; pk: number }>;
    order = cols
      .filter((c) => c.pk > 0)
      .sort((a, b) => a.pk - b.pk)
      .map((c) => `"${c.name}"`)
      .join(', ');
  }
  const parts: Buffer[] = [];
  let rows = 0;
  for (const row of db.prepare(`SELECT * FROM "${name}" ORDER BY ${order}`).iterate() as IterableIterator<Record<string, unknown>>) {
    parts.push(Buffer.from(`${JSON.stringify(encodeRow(row))}\n`, 'utf8'));
    rows++;
  }
  return { buf: Buffer.concat(parts), rows };
}

/** Regular files of a directory tree as sorted POSIX relative paths; symlinks or special files abort the export. */
function walkFiles(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(dir, prefix), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkFiles(dir, rel));
    else if (entry.isFile()) out.push(rel);
    else throw new RecoveryError('EXPORT_PACK_INVALID', 503, 'installed pack contains a link or special file');
  }
  return out;
}

function isDirectory(p: string): boolean {
  try {
    return lstatSync(p).isDirectory();
  } catch {
    return false;
  }
}

function safeRelPath(rel: string): boolean {
  return rel.length > 0 && !rel.startsWith('/') && !rel.split('/').some((s) => s === '' || s === '.' || s === '..') && !rel.includes('\\');
}

export async function createExport(deps: ExportDeps, selfContained: boolean): Promise<ArtifactInfo> {
  const { store, backups, artifacts, options: o } = deps;
  if (store.maintenance().on) throw new RecoveryError('MAINTENANCE', 503, 'profile is in maintenance mode', true);
  const paths = store.paths;
  ensurePrivateDir(paths.exports);
  ensurePrivateDir(paths.runtime);
  const id = randomUUID();
  const snap = join(paths.runtime, `export-${id}.sqlite`);
  const part = join(paths.exports, `${id}.zip.part`);
  const final = join(paths.exports, `${id}.zip`);
  let src: Database.Database | undefined;
  try {
    const identity = await backups.exclusive(() => backups.copyLive(snap, false));
    convertToDeleteJournal(snap);
    if (identity.profileId === null) throw new RecoveryError('NO_PROFILE', 409, 'there is no profile to export yet');
    src = new Database(snap, { readonly: true, fileMustExist: true });

    const all = (src.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all() as Array<{ name: string }>).map((r) => r.name);
    const classified = new Set<string>([...PORTABLE_TABLES, ...NON_PORTABLE_TABLES]);
    const unclassified = all.filter((n) => !classified.has(n));
    if (unclassified.length > 0) {
      throw new RecoveryError('EXPORT_UNCLASSIFIED_TABLE', 503, `tables not classified as portable or non-portable: ${unclassified.join(', ')}`);
    }

    const tables: ManifestTable[] = [];
    const tableData: Array<{ path: string; buf: Buffer }> = [];
    for (const name of PORTABLE_TABLES) {
      const { buf, rows } = dumpTable(src, name);
      const path = `tables/${name}.ndjson`;
      tables.push({ name, path, rows, bytes: buf.length, sha256: sha256Hex(buf) });
      tableData.push({ path, buf });
    }

    const packRows = src
      .prepare("SELECT pack_id, version, manifest_sha256, manifest, state FROM packs WHERE state IN ('active', 'retained') ORDER BY pack_id, version")
      .all() as Array<{ pack_id: string; version: string; manifest_sha256: string; manifest: string; state: 'active' | 'retained' }>;
    const covered = new Set<string>();
    for (const p of packRows) for (const h of packManifestHashes(p.manifest)) covered.add(h);

    const packs: ManifestPack[] = [];
    const files: Array<ManifestFile & { readonly abs: string }> = [];
    for (const p of packRows) {
      if (!isSafeSegment(p.pack_id) || !isSafeSegment(p.version)) throw new RecoveryError('EXPORT_PACK_INVALID', 503, 'installed pack has an unsafe identifier');
      let included = false;
      if (selfContained) {
        const dir = o.resolvePackDir(p.pack_id, p.version);
        if (!isDirectory(dir)) {
          throw new RecoveryError('EXPORT_PACK_MISSING', 503, `installed pack ${p.pack_id}@${p.version} files are missing; a self-contained export is not possible`);
        }
        for (const rel of walkFiles(dir)) {
          const path = packEntryPath(p.pack_id, p.version, rel);
          if (!isKnownEntryName(path)) throw new RecoveryError('EXPORT_PACK_INVALID', 503, 'installed pack contains an unsupported file name');
          const d = await sha256File(join(dir, rel));
          files.push({ path, sha256: d.sha256, bytes: d.bytes, role: 'pack', abs: join(dir, rel) });
        }
        included = true;
      }
      packs.push({ packId: p.pack_id, version: p.version, manifestSha256: p.manifest_sha256, state: p.state, required: p.state === 'active', included });
    }

    // Private assets: anything not obtainable from a pack is carried in the archive by content hash.
    const missingAssets: string[] = [];
    const seenAssets = new Set<string>();
    for (const a of src.prepare('SELECT sha256, rel_path FROM assets ORDER BY sha256').all() as Array<{ sha256: string; rel_path: string }>) {
      if (covered.has(a.sha256) || seenAssets.has(a.sha256)) continue;
      seenAssets.add(a.sha256);
      const abs = safeRelPath(a.rel_path) ? o.resolveAssetFile(a.rel_path) : '';
      if (!abs || !isRegularFile(abs)) {
        missingAssets.push(a.sha256);
        continue;
      }
      const d = await sha256File(abs);
      if (d.sha256 !== a.sha256) {
        missingAssets.push(a.sha256);
        continue;
      }
      files.push({ path: `assets/${a.sha256}`, sha256: d.sha256, bytes: d.bytes, role: 'asset', abs });
    }

    const createdAt = store.clock.now().toISOString();
    const manifest: ExportManifest = {
      format: EXPORT_FORMAT,
      formatVersion: EXPORT_FORMAT_VERSION,
      appVersion: o.appVersion,
      schemaVersion: identity.schemaVersion,
      createdAt,
      profile: { id: identity.profileId, epoch: identity.epoch },
      eventSeq: identity.eventSeq,
      selfContained,
      tables,
      packs,
      files: files.map(({ path, sha256, bytes, role }) => ({ path, sha256, bytes, role })),
      missingAssets,
    };

    const zip = new yazl.ZipFile();
    const out = createWriteStream(part, { mode: 0o600, flags: 'wx' });
    const done = pipeline(zip.outputStream, out);
    const entry = { mtime: new Date(createdAt), mode: 0o100600 };
    zip.addBuffer(Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8'), MANIFEST_NAME, entry);
    for (const t of tableData) zip.addBuffer(t.buf, t.path, entry);
    for (const f of files) zip.addFile(f.abs, f.path, { ...entry, compress: f.role === 'pack' && !f.path.endsWith('.mp3') });
    zip.end();
    await done;
    await o.faults('export:before-finalize', { path: part });
    fsyncFile(part);
    renameSync(part, final);
    fsyncDir(paths.exports);
    const digest = await sha256File(final);
    return artifacts.add('export', { id, path: final, sha256: digest.sha256, sizeBytes: digest.bytes, expiresAt: artifacts.expiryFromNow() });
  } catch (err) {
    removeIfExists(part);
    removeIfExists(final);
    if (err instanceof RecoveryError) throw err;
    if ((err as NodeJS.ErrnoException).code === 'ENOSPC') throw new RecoveryError('EXPORT_DISK_FULL', 503, 'not enough disk space for the export', true);
    throw new RecoveryError('EXPORT_FAILED', 503, 'export failed', true);
  } finally {
    src?.close();
    removeIfExists(snap);
    removeSidecars(snap);
  }
}
