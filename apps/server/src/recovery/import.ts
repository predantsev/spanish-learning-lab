// Import of a validated archive into an isolated shadow DB on the same volume (paths.runtime/shadow-*.sqlite):
// real application migrations via openDatabase, prepared INSERTs only (supplied SQL/schema is never executed;
// table and column names come from the shadow's own schema), every table digest and row count checked, every
// foreign key checked, a dry projection rebuild, and asset/pack files staged with hash verification.
// The live profile is never touched here.
import { createWriteStream, existsSync, lstatSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { APP_SCHEMA_VERSION, openDatabase, schemaVersion, type Db } from '../db/connection.ts';
import { PORTABLE_TABLES } from '../db/migrations/index.ts';
import type { ProfileStore } from '../store/types.ts';
import { RecoveryError } from './types.ts';
import {
  LineSplitter,
  MANIFEST_NAME,
  packEntryPath,
  packManifestHashes,
  parseManifest,
  scanArchive,
  streamEntry,
  type ExportManifest,
} from './archive.ts';
import { ensurePrivateDir, fsyncFile, isRegularFile, removeIfExists, removeSidecars, removeTreeIfExists } from './fsutil.ts';
import type { ResolvedOptions } from './options.ts';
import { scanReceipts, type ReceiptScan } from './provenance.ts';

/** A staged file or directory that confirm moves into place when the target does not exist yet. */
export interface Placement {
  readonly from: string;
  readonly to: string;
}

export interface ImportResult {
  readonly manifest: ExportManifest;
  readonly shadowPath: string;
  readonly stagingDir: string;
  readonly placements: readonly Placement[];
  readonly attemptCount: number;
  readonly draftCount: number;
  readonly missingAssets: readonly string[];
  readonly receipts: ReceiptScan;
}

export interface ImportDeps {
  readonly store: ProfileStore;
  readonly options: ResolvedOptions;
}

const utf8 = new TextDecoder('utf-8', { fatal: true });

function invalidRow(table: string, line: number, why: string): RecoveryError {
  return new RecoveryError('ARCHIVE_ROW_INVALID', 422, `record ${line} of ${table} is invalid: ${why}`);
}

function decodeRow(line: Buffer, columns: readonly string[], table: string, n: number): unknown[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(utf8.decode(line));
  } catch {
    throw invalidRow(table, n, 'not UTF-8 JSON');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw invalidRow(table, n, 'not an object');
  const obj = parsed as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length !== columns.length || !columns.every((c) => Object.hasOwn(obj, c))) throw invalidRow(table, n, 'unexpected or missing columns');
  return columns.map((c) => {
    const v = obj[c];
    if (v === null || typeof v === 'string') return v;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const b = v as Record<string, unknown>;
      if (Object.keys(b).length === 1 && typeof b.$base64 === 'string') return Buffer.from(b.$base64, 'base64');
    }
    throw invalidRow(table, n, `unsupported value in column ${c}`);
  });
}

function isDirectory(p: string): boolean {
  try {
    return lstatSync(p).isDirectory();
  } catch {
    return false;
  }
}

function safeRelPath(rel: string): boolean {
  return rel.length > 0 && !rel.startsWith('/') && !rel.includes('\\') && !rel.split('/').some((s) => s === '' || s === '.' || s === '..');
}

/** True when the target installation already has this exact pack (row + directory). */
export function packInstalledLocally(store: ProfileStore, o: ResolvedOptions, packId: string, version: string, manifestSha256: string): boolean {
  const row = store
    .db()
    .prepare('SELECT 1 AS ok FROM packs WHERE pack_id = ? AND version = ? AND manifest_sha256 = ? AND state IN (\'active\', \'retained\')')
    .get(packId, version, manifestSha256);
  return row !== undefined && isDirectory(o.resolvePackDir(packId, version));
}

async function writeChunk(ws: NodeJS.WritableStream, chunk: Buffer): Promise<void> {
  if (!ws.write(chunk)) await new Promise<void>((resolve) => ws.once('drain', () => resolve()));
}

export async function importArchive(deps: ImportDeps, archivePath: string, previewId: string): Promise<ImportResult> {
  const { store, options: o } = deps;
  const paths = store.paths;
  const limits = o.limits;
  const scanned = await scanArchive(archivePath, limits);
  const shadowPath = join(paths.runtime, `shadow-${previewId}.sqlite`);
  const stagingDir = join(paths.runtime, `restore-staging-${previewId}`);
  let shadow: Db | undefined;
  let inTransaction = false;
  let ok = false;
  try {
    const counter = { actual: 0 };
    const manifestEntry = scanned.entries.get(MANIFEST_NAME);
    if (!manifestEntry) throw new RecoveryError('ARCHIVE_MISSING_MANIFEST', 422, 'archive has no manifest');
    if (manifestEntry.uncompressedSize > limits.maxManifestBytes) throw new RecoveryError('ARCHIVE_TOO_LARGE', 413, 'archive manifest exceeds the size limit');
    const manifestParts: Buffer[] = [];
    await streamEntry(scanned, MANIFEST_NAME, limits, counter, (c) => {
      manifestParts.push(Buffer.from(c));
    });
    const manifest = parseManifest(Buffer.concat(manifestParts));
    const appSchema = APP_SCHEMA_VERSION();
    if (manifest.schemaVersion > appSchema) {
      throw new RecoveryError('UNSUPPORTED_FUTURE_SCHEMA', 422, `archive schema ${manifest.schemaVersion} is newer than this application supports (${appSchema})`);
    }
    if (manifest.schemaVersion !== appSchema) {
      throw new RecoveryError('UNSUPPORTED_SCHEMA', 422, `archive schema ${manifest.schemaVersion} cannot be imported by schema ${appSchema}`);
    }

    // The ZIP must contain exactly the manifest-declared entries, with the declared sizes.
    const declared = new Map<string, number>([[MANIFEST_NAME, manifestEntry.uncompressedSize]]);
    for (const t of manifest.tables) declared.set(t.path, t.bytes);
    for (const f of manifest.files) declared.set(f.path, f.bytes);
    for (const name of scanned.entries.keys()) if (!declared.has(name)) throw new RecoveryError('ARCHIVE_UNKNOWN_ENTRY', 422, 'archive contains an entry the manifest does not declare');
    for (const [name, bytes] of declared) {
      const e = scanned.entries.get(name);
      if (!e) throw new RecoveryError('ARCHIVE_MISSING_ENTRY', 422, 'archive is missing an entry its manifest declares');
      if (e.uncompressedSize !== bytes) throw new RecoveryError('ARCHIVE_SIZE_MISMATCH', 422, 'archive entry size does not match the manifest');
    }

    // Pack references: included packs must be complete; required packs must be included or installed here.
    const includedPacks = new Set(manifest.packs.filter((p) => p.included).map((p) => `${p.packId}/${p.version}`));
    for (const f of manifest.files) {
      if (f.role !== 'pack') continue;
      const [, packId, version] = f.path.split('/');
      if (!includedPacks.has(`${packId}/${version}`)) throw new RecoveryError('ARCHIVE_UNKNOWN_ENTRY', 422, 'archive contains files of an undeclared pack');
    }
    for (const p of manifest.packs) {
      if (p.included) {
        if (!manifest.files.some((f) => f.path === packEntryPath(p.packId, p.version, 'pack.json'))) {
          throw new RecoveryError('ARCHIVE_PACK_INCOMPLETE', 422, `included pack ${p.packId}@${p.version} has no pack.json`);
        }
      } else if (p.required && !packInstalledLocally(store, o, p.packId, p.version, p.manifestSha256)) {
        throw new RecoveryError('MISSING_PACK', 422, `required content pack ${p.packId}@${p.version} is not installed here; use a self-contained export`);
      }
    }

    ensurePrivateDir(paths.runtime);
    removeIfExists(shadowPath);
    removeSidecars(shadowPath);
    shadow = openDatabase(shadowPath);
    if (schemaVersion(shadow) !== manifest.schemaVersion) throw new RecoveryError('UNSUPPORTED_SCHEMA', 422, 'archive schema does not match the application schema');

    const columns = new Map<string, string[]>();
    for (const t of PORTABLE_TABLES) {
      columns.set(t, (shadow.prepare(`PRAGMA table_info("${t}")`).all() as Array<{ name: string }>).map((c) => c.name));
    }
    shadow.exec('BEGIN IMMEDIATE');
    inTransaction = true;
    shadow.pragma('defer_foreign_keys = ON');
    for (const t of manifest.tables) {
      const cols = columns.get(t.name)!;
      const stmt = shadow.prepare(`INSERT INTO "${t.name}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`);
      const splitter = new LineSplitter(limits.maxLineBytes);
      let rows = 0;
      const onLine = (line: Buffer): void => {
        rows++;
        if (rows > t.rows) throw new RecoveryError('ARCHIVE_DIGEST_MISMATCH', 422, `table ${t.name} has more records than its manifest declares`);
        const values = decodeRow(line, cols, t.name, rows);
        try {
          stmt.run(values);
        } catch {
          throw invalidRow(t.name, rows, 'violates the profile schema');
        }
      };
      const digest = await streamEntry(scanned, t.path, limits, counter, (chunk) => splitter.push(chunk, onLine));
      splitter.end();
      if (digest.sha256 !== t.sha256 || digest.bytes !== t.bytes || rows !== t.rows) {
        throw new RecoveryError('ARCHIVE_DIGEST_MISMATCH', 422, `table ${t.name} does not match its manifest digest`);
      }
    }
    const fk = shadow.pragma('foreign_key_check') as unknown[];
    if (fk.length > 0) throw new RecoveryError('ARCHIVE_FOREIGN_KEY', 422, `${fk.length} imported references point to missing records`);
    shadow.exec('COMMIT');
    inTransaction = false;

    if (shadow.pragma('quick_check', { simple: true }) !== 'ok') throw new RecoveryError('ARCHIVE_INTEGRITY', 422, 'imported profile failed the integrity check');
    const profiles = shadow.prepare('SELECT id, epoch FROM profiles').all() as Array<{ id: string; epoch: number }>;
    if (profiles.length !== 1 || profiles[0]!.id !== manifest.profile.id || profiles[0]!.epoch !== manifest.profile.epoch) {
      throw new RecoveryError('ARCHIVE_PROFILE_MISMATCH', 422, 'imported profile does not match the manifest');
    }
    const seq = (shadow.prepare('SELECT coalesce(max(event_seq), 0) AS s FROM event_log').get() as { s: number }).s;
    if (seq !== manifest.eventSeq) throw new RecoveryError('ARCHIVE_PROFILE_MISMATCH', 422, 'imported event log does not match the manifest');
    for (const t of ['auth_tokens', 'owner_sessions']) {
      const n = (shadow.prepare(`SELECT count(*) AS n FROM "${t}"`).get() as { n: number }).n;
      if (n !== 0) throw new RecoveryError('ARCHIVE_PROFILE_MISMATCH', 422, 'imported profile contains credentials');
    }

    // Stage asset/pack files with hash verification; they are moved into place only on confirm.
    ensurePrivateDir(stagingDir);
    for (const f of manifest.files) {
      const staged = join(stagingDir, f.path);
      mkdirSync(dirname(staged), { recursive: true, mode: 0o700 });
      const ws = createWriteStream(staged, { mode: 0o600, flags: 'wx' });
      const finished = new Promise<void>((resolve, reject) => {
        ws.once('finish', () => resolve());
        ws.once('error', reject);
      });
      let digest;
      try {
        digest = await streamEntry(scanned, f.path, limits, counter, (chunk) => writeChunk(ws, chunk));
      } finally {
        ws.end();
        await finished;
      }
      if (digest.sha256 !== f.sha256 || digest.bytes !== f.bytes) throw new RecoveryError('ARCHIVE_DIGEST_MISMATCH', 422, 'archive file does not match its manifest digest');
      fsyncFile(staged);
    }

    // Asset availability: carried in the archive, covered by an included/installed pack, or already present.
    const available = new Set(manifest.files.filter((f) => f.role === 'asset').map((f) => f.sha256));
    for (const p of manifest.packs.filter((x) => x.included)) {
      for (const f of manifest.files) if (f.path.startsWith(`packs/${p.packId}/${p.version}/`)) available.add(f.sha256);
    }
    const livePacks = store.db().prepare("SELECT pack_id, version, manifest FROM packs WHERE state IN ('active', 'retained')").all() as Array<{
      pack_id: string;
      version: string;
      manifest: string;
    }>;
    for (const p of livePacks) if (isDirectory(o.resolvePackDir(p.pack_id, p.version))) for (const h of packManifestHashes(p.manifest)) available.add(h);
    const placements: Placement[] = [];
    const missing = new Set<string>(manifest.missingAssets);
    for (const a of shadow.prepare('SELECT sha256, rel_path, bytes FROM assets ORDER BY sha256').all() as Array<{ sha256: string; rel_path: string; bytes: number }>) {
      if (!safeRelPath(a.rel_path)) throw new RecoveryError('ARCHIVE_UNSAFE_PATH', 422, 'imported asset path is unsafe');
      const target = o.resolveAssetFile(a.rel_path);
      if (available.has(a.sha256)) {
        if (existsSync(join(stagingDir, 'assets', a.sha256))) placements.push({ from: join(stagingDir, 'assets', a.sha256), to: target });
        continue;
      }
      if (isRegularFile(target) && statSync(target).size === a.bytes) continue;
      missing.add(a.sha256);
    }
    for (const p of manifest.packs.filter((x) => x.included)) {
      placements.push({ from: join(stagingDir, 'packs', p.packId, p.version), to: o.resolvePackDir(p.packId, p.version) });
    }

    try {
      await o.rebuildProjections(shadow);
    } catch {
      throw new RecoveryError('PROJECTION_REBUILD_FAILED', 422, 'projections could not be rebuilt from the imported history');
    }
    const receipts = scanReceipts(shadow, o.reviewKey);
    const attemptCount = (shadow.prepare('SELECT count(*) AS n FROM attempts').get() as { n: number }).n;
    const draftCount = (shadow.prepare('SELECT count(*) AS n FROM drafts').get() as { n: number }).n;
    shadow.pragma('wal_checkpoint(TRUNCATE)');
    shadow.close();
    shadow = undefined;
    removeSidecars(shadowPath);
    await o.faults('restore:shadow-built', { path: shadowPath });
    ok = true;
    return { manifest, shadowPath, stagingDir, placements, attemptCount, draftCount, missingAssets: [...missing].sort(), receipts };
  } finally {
    scanned.close();
    if (shadow) {
      if (inTransaction) {
        try {
          shadow.exec('ROLLBACK');
        } catch {
          /* transaction already aborted */
        }
      }
      shadow.close();
    }
    if (!ok) {
      removeIfExists(shadowPath);
      removeSidecars(shadowPath);
      removeTreeIfExists(stagingDir);
    }
  }
}
