// Portable export archive format and bounded, streamed ZIP validation (DOMAIN-SPEC limits: 512 MiB compressed,
// 2 GiB expanded, 10 000 entries, 240 UTF-8 bytes per path; reject traversal/absolute paths, symlinks,
// duplicates/case collisions, unknown or executable entries, size/hash mismatches). yauzl reads the central
// directory lazily, one entry at a time, and every bound is checked before or while data is decompressed.
import yauzl, { type Entry, type ZipFile } from 'yauzl';
import { createHash } from 'node:crypto';
import type { Readable } from 'node:stream';
import { PORTABLE_TABLES } from '../db/migrations/index.ts';
import { RecoveryError } from './types.ts';
import type { FileDigest } from './fsutil.ts';
import type { ArchiveLimits } from './options.ts';

export const EXPORT_FORMAT = 'spanish-learning-lab.profile-export';
export const EXPORT_FORMAT_VERSION = 1;
export const MANIFEST_NAME = 'manifest.json';

export interface ManifestTable {
  readonly name: string;
  readonly path: string;
  readonly rows: number;
  readonly bytes: number;
  readonly sha256: string;
}

export interface ManifestPack {
  readonly packId: string;
  readonly version: string;
  readonly manifestSha256: string;
  readonly state: 'active' | 'retained';
  /** Required packs must be installed on the target or included in the archive (self-contained). */
  readonly required: boolean;
  readonly included: boolean;
}

export interface ManifestFile {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly role: 'asset' | 'pack';
}

export interface ExportManifest {
  readonly format: typeof EXPORT_FORMAT;
  readonly formatVersion: typeof EXPORT_FORMAT_VERSION;
  readonly appVersion: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly profile: { readonly id: string; readonly epoch: number };
  readonly eventSeq: number;
  readonly selfContained: boolean;
  readonly tables: readonly ManifestTable[];
  readonly packs: readonly ManifestPack[];
  readonly files: readonly ManifestFile[];
  /** Asset hashes the source installation could not include (file missing at export time). */
  readonly missingAssets: readonly string[];
}

const HEX64 = /^[0-9a-f]{64}$/;
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const SAFE_FILE_SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,127}$/;
const PORTABLE = new Set<string>(PORTABLE_TABLES);

export function isSafeSegment(s: string): boolean {
  return SAFE_SEGMENT.test(s) && s !== '.' && s !== '..';
}

/** Archive path of a file inside an included pack directory. */
export function packEntryPath(packId: string, version: string, rel: string): string {
  return `packs/${packId}/${version}/${rel}`;
}

/** Only the entry names an export can produce are accepted; everything else is an unknown entry. */
export function isKnownEntryName(name: string): boolean {
  if (name === MANIFEST_NAME) return true;
  const table = /^tables\/([a-z_]+)\.ndjson$/.exec(name);
  if (table) return PORTABLE.has(table[1]!);
  if (/^assets\/[0-9a-f]{64}$/.test(name)) return true;
  const parts = name.split('/');
  if (parts[0] === 'packs' && parts.length >= 4) {
    return isSafeSegment(parts[1]!) && isSafeSegment(parts[2]!) && parts.slice(3).every((p) => SAFE_FILE_SEGMENT.test(p) && p !== '..');
  }
  return false;
}

function reject(code: string, message: string, status: 413 | 422 = 422): RecoveryError {
  return new RecoveryError(code, status, message);
}

function mapZipError(err: unknown): RecoveryError {
  if (err instanceof RecoveryError) return err;
  const msg = (err as Error)?.message ?? String(err);
  if (/absolute path|invalid relative path|invalid characters in fileName|backslash/i.test(msg)) return reject('ARCHIVE_UNSAFE_PATH', 'archive contains an unsafe path');
  if (/bytes in the stream|uncompressedSize|compressedSize/i.test(msg)) return reject('ARCHIVE_SIZE_MISMATCH', 'archive entry size does not match its header');
  if (/end of central directory|not a zip|signature/i.test(msg)) return reject('ARCHIVE_NOT_ZIP', 'file is not a valid ZIP archive');
  return reject('ARCHIVE_MALFORMED', 'archive is malformed');
}

export interface ScannedArchive {
  readonly zipfile: ZipFile;
  readonly entries: ReadonlyMap<string, Entry>;
  readonly declaredBytes: number;
  close(): void;
}

export interface ExpansionCounter {
  actual: number;
}

function checkEntry(e: Entry, seen: Map<string, Entry>, folded: Set<string>, limits: ArchiveLimits): void {
  const name = e.fileName;
  if (name.length === 0 || name.endsWith('/')) throw reject('ARCHIVE_UNKNOWN_ENTRY', 'archive contains a directory or empty entry');
  if (Buffer.byteLength(name, 'utf8') > limits.maxPathBytes) throw reject('ARCHIVE_PATH_TOO_LONG', 'archive path exceeds the byte limit');
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(name) || name.startsWith('/') || /^[A-Za-z]:/.test(name)) throw reject('ARCHIVE_UNSAFE_PATH', 'archive contains an unsafe path');
  if (name.split('/').some((s) => s === '' || s === '.' || s === '..')) throw reject('ARCHIVE_UNSAFE_PATH', 'archive contains an unsafe path');
  if (seen.has(name)) throw reject('ARCHIVE_DUPLICATE_ENTRY', 'archive contains duplicate entries');
  const fold = name.normalize('NFC').toLowerCase();
  if (folded.has(fold)) throw reject('ARCHIVE_CASE_COLLISION', 'archive contains entries that differ only by case or normalization');
  if (e.isEncrypted()) throw reject('ARCHIVE_ENCRYPTED_ENTRY', 'archive contains an encrypted entry');
  if (e.compressionMethod !== 0 && e.compressionMethod !== 8) throw reject('ARCHIVE_UNSUPPORTED_COMPRESSION', 'archive uses an unsupported compression method');
  const madeByUnix = e.versionMadeBy >> 8 === 3;
  const mode = (e.externalFileAttributes >>> 16) & 0xffff;
  if (madeByUnix && mode !== 0) {
    const type = mode & 0o170000;
    if (type === 0o120000) throw reject('ARCHIVE_SYMLINK', 'archive contains a symbolic link');
    if (type !== 0 && type !== 0o100000) throw reject('ARCHIVE_SPECIAL_ENTRY', 'archive contains a non-regular entry');
    if ((mode & 0o111) !== 0) throw reject('ARCHIVE_EXECUTABLE_ENTRY', 'archive contains an executable entry');
  }
  if ((e.externalFileAttributes & 0x10) !== 0) throw reject('ARCHIVE_UNKNOWN_ENTRY', 'archive contains a directory entry');
  if (!isKnownEntryName(name)) throw reject('ARCHIVE_UNKNOWN_ENTRY', 'archive contains an unknown entry');
  seen.set(name, e);
  folded.add(fold);
}

/** Reads and checks the central directory only (no decompression). Stops at the first violated bound. */
export async function scanArchive(path: string, limits: ArchiveLimits): Promise<ScannedArchive> {
  const zipfile = await new Promise<ZipFile>((resolve, rejectP) => {
    yauzl.open(path, { lazyEntries: true, autoClose: false, decodeStrings: true, validateEntrySizes: true, strictFileNames: true }, (err, zf) =>
      err ? rejectP(mapZipError(err)) : resolve(zf),
    );
  });
  const close = (): void => {
    try {
      zipfile.close();
    } catch {
      /* already closed */
    }
  };
  try {
    if (zipfile.entryCount > limits.maxEntries) throw reject('ARCHIVE_TOO_MANY_ENTRIES', 'archive has too many entries', 413);
    const seen = new Map<string, Entry>();
    const folded = new Set<string>();
    let declared = 0;
    await new Promise<void>((resolve, rejectP) => {
      const cleanup = (): void => {
        zipfile.removeAllListeners('entry');
        zipfile.removeAllListeners('end');
        zipfile.removeAllListeners('error');
        zipfile.on('error', () => undefined);
      };
      zipfile.on('error', (err: unknown) => {
        cleanup();
        rejectP(mapZipError(err));
      });
      zipfile.on('entry', (entry: Entry) => {
        try {
          if (seen.size + 1 > limits.maxEntries) throw reject('ARCHIVE_TOO_MANY_ENTRIES', 'archive has too many entries', 413);
          checkEntry(entry, seen, folded, limits);
          declared += entry.uncompressedSize;
          if (declared > limits.maxExpandedBytes) throw reject('ARCHIVE_TOO_LARGE', 'archive expands beyond the size limit', 413);
          zipfile.readEntry();
        } catch (err) {
          cleanup();
          rejectP(err instanceof RecoveryError ? err : mapZipError(err));
        }
      });
      zipfile.on('end', () => {
        cleanup();
        resolve();
      });
      zipfile.readEntry();
    });
    return { zipfile, entries: seen, declaredBytes: declared, close };
  } catch (err) {
    close();
    throw err;
  }
}

/**
 * Streams one entry with bounded decompression: the running total across the whole archive and the entry's
 * declared size are enforced chunk by chunk, so a bomb is rejected as soon as a bound is exceeded.
 */
export async function streamEntry(
  scanned: ScannedArchive,
  name: string,
  limits: ArchiveLimits,
  counter: ExpansionCounter,
  onChunk?: (chunk: Buffer) => void | Promise<void>,
): Promise<FileDigest> {
  const entry = scanned.entries.get(name);
  if (!entry) throw reject('ARCHIVE_MISSING_ENTRY', 'archive entry referenced by the manifest is missing');
  const stream = await new Promise<Readable>((resolve, rejectP) => {
    scanned.zipfile.openReadStream(entry, (err, s) => (err ? rejectP(mapZipError(err)) : resolve(s)));
  });
  const hash = createHash('sha256');
  let bytes = 0;
  try {
    for await (const chunk of stream) {
      const buf = chunk as Buffer;
      bytes += buf.length;
      counter.actual += buf.length;
      if (bytes > entry.uncompressedSize) throw reject('ARCHIVE_SIZE_MISMATCH', 'archive entry is larger than its header declares');
      if (counter.actual > limits.maxExpandedBytes) throw reject('ARCHIVE_TOO_LARGE', 'archive expands beyond the size limit', 413);
      hash.update(buf);
      if (onChunk) await onChunk(buf);
    }
  } catch (err) {
    stream.destroy();
    throw mapZipError(err);
  }
  if (bytes !== entry.uncompressedSize) throw reject('ARCHIVE_SIZE_MISMATCH', 'archive entry size does not match its header');
  return { sha256: hash.digest('hex'), bytes };
}

/** Bounded NDJSON splitter: every line must end with \n and stay within maxLineBytes. */
export class LineSplitter {
  private parts: Buffer[] = [];
  private length = 0;
  private readonly maxLineBytes: number;

  constructor(maxLineBytes: number) {
    this.maxLineBytes = maxLineBytes;
  }

  push(chunk: Buffer, onLine: (line: Buffer) => void): void {
    let start = 0;
    for (;;) {
      const idx = chunk.indexOf(10, start);
      if (idx === -1) {
        const rest = chunk.subarray(start);
        this.length += rest.length;
        if (this.length > this.maxLineBytes) throw reject('ARCHIVE_LINE_TOO_LONG', 'archive record exceeds the size limit', 413);
        if (rest.length > 0) this.parts.push(Buffer.from(rest));
        return;
      }
      const piece = chunk.subarray(start, idx);
      if (this.length + piece.length > this.maxLineBytes) throw reject('ARCHIVE_LINE_TOO_LONG', 'archive record exceeds the size limit', 413);
      const line = this.parts.length ? Buffer.concat([...this.parts, piece]) : Buffer.from(piece);
      this.parts = [];
      this.length = 0;
      onLine(line);
      start = idx + 1;
    }
  }

  end(): void {
    if (this.length > 0 || this.parts.length > 0) throw reject('ARCHIVE_ROW_INVALID', 'archive record is not newline-terminated');
  }
}

// ---- manifest validation (strict: exact keys, exact types; no coercion) ----

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function exactKeys(o: Obj, keys: readonly string[], where: string): void {
  const actual = Object.keys(o).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((k, i) => k !== expected[i])) {
    throw reject('ARCHIVE_MANIFEST_INVALID', `manifest ${where} has unexpected or missing properties`);
  }
}

function nonNegInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
}

function str(v: unknown, max = 512): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= max;
}

export function parseManifest(buf: Buffer): ExportManifest {
  let raw: unknown;
  try {
    raw = JSON.parse(buf.toString('utf8'));
  } catch {
    throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest is not valid JSON');
  }
  if (!isObj(raw)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest is not an object');
  exactKeys(raw, ['format', 'formatVersion', 'appVersion', 'schemaVersion', 'createdAt', 'profile', 'eventSeq', 'selfContained', 'tables', 'packs', 'files', 'missingAssets'], 'root');
  if (raw.format !== EXPORT_FORMAT) throw reject('ARCHIVE_UNSUPPORTED_FORMAT', 'archive is not a Spanish Learning Lab profile export');
  if (raw.formatVersion !== EXPORT_FORMAT_VERSION) throw reject('ARCHIVE_UNSUPPORTED_FORMAT', 'archive format version is not supported');
  if (!str(raw.appVersion, 64) || !str(raw.createdAt, 64) || Number.isNaN(Date.parse(raw.createdAt))) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest metadata is invalid');
  if (!nonNegInt(raw.schemaVersion) || raw.schemaVersion < 1) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest schemaVersion is invalid');
  if (!nonNegInt(raw.eventSeq) || typeof raw.selfContained !== 'boolean') throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest metadata is invalid');
  const profile = raw.profile;
  if (!isObj(profile)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest profile is invalid');
  exactKeys(profile, ['id', 'epoch'], 'profile');
  if (!str(profile.id, 128) || !nonNegInt(profile.epoch) || profile.epoch < 1) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest profile is invalid');
  if (!Array.isArray(raw.tables) || !Array.isArray(raw.packs) || !Array.isArray(raw.files) || !Array.isArray(raw.missingAssets)) {
    throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest lists are invalid');
  }
  const tables: ManifestTable[] = raw.tables.map((t: unknown) => {
    if (!isObj(t)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest table entry is invalid');
    exactKeys(t, ['name', 'path', 'rows', 'bytes', 'sha256'], 'table');
    if (!str(t.name, 64) || !PORTABLE.has(t.name) || t.path !== `tables/${t.name}.ndjson`) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest table is not portable');
    if (!nonNegInt(t.rows) || !nonNegInt(t.bytes) || typeof t.sha256 !== 'string' || !HEX64.test(t.sha256)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest table digest is invalid');
    return { name: t.name, path: t.path, rows: t.rows, bytes: t.bytes, sha256: t.sha256 };
  });
  const names = new Set(tables.map((t) => t.name));
  if (names.size !== tables.length) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest lists a table twice');
  for (const t of PORTABLE_TABLES) if (!names.has(t)) throw reject('ARCHIVE_MISSING_TABLE', 'archive is missing a required table');
  const packs: ManifestPack[] = raw.packs.map((p: unknown) => {
    if (!isObj(p)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest pack entry is invalid');
    exactKeys(p, ['packId', 'version', 'manifestSha256', 'state', 'required', 'included'], 'pack');
    if (!str(p.packId, 64) || !isSafeSegment(p.packId) || !str(p.version, 64) || !isSafeSegment(p.version)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest pack id is invalid');
    if (typeof p.manifestSha256 !== 'string' || !HEX64.test(p.manifestSha256)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest pack hash is invalid');
    if ((p.state !== 'active' && p.state !== 'retained') || typeof p.required !== 'boolean' || typeof p.included !== 'boolean') {
      throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest pack entry is invalid');
    }
    return { packId: p.packId, version: p.version, manifestSha256: p.manifestSha256, state: p.state, required: p.required, included: p.included };
  });
  const files: ManifestFile[] = raw.files.map((f: unknown) => {
    if (!isObj(f)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest file entry is invalid');
    exactKeys(f, ['path', 'sha256', 'bytes', 'role'], 'file');
    if (!str(f.path, 1024) || !isKnownEntryName(f.path) || f.path === MANIFEST_NAME || f.path.startsWith('tables/')) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest file path is invalid');
    if (typeof f.sha256 !== 'string' || !HEX64.test(f.sha256) || !nonNegInt(f.bytes)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest file digest is invalid');
    const role = f.path.startsWith('assets/') ? 'asset' : 'pack';
    if (f.role !== role) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest file role is invalid');
    if (role === 'asset' && f.path !== `assets/${f.sha256}`) throw reject('ARCHIVE_MANIFEST_INVALID', 'asset path must be its hash');
    return { path: f.path, sha256: f.sha256, bytes: f.bytes, role };
  });
  if (new Set(files.map((f) => f.path)).size !== files.length) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest lists a file twice');
  const missingAssets = raw.missingAssets.map((h: unknown) => {
    if (typeof h !== 'string' || !HEX64.test(h)) throw reject('ARCHIVE_MANIFEST_INVALID', 'manifest missing-asset entry is invalid');
    return h;
  });
  return {
    format: EXPORT_FORMAT,
    formatVersion: EXPORT_FORMAT_VERSION,
    appVersion: raw.appVersion,
    schemaVersion: raw.schemaVersion,
    createdAt: raw.createdAt,
    profile: { id: profile.id, epoch: profile.epoch },
    eventSeq: raw.eventSeq,
    selfContained: raw.selfContained,
    tables,
    packs,
    files,
    missingAssets,
  };
}

/** Hash set of media/files declared by a stored pack manifest (format from tools/content/pack.ts; parsed defensively). */
export function packManifestHashes(manifestJson: string): Set<string> {
  const out = new Set<string>();
  try {
    const m = JSON.parse(manifestJson) as Obj;
    for (const key of ['files', 'media']) {
      const list = m[key];
      if (!Array.isArray(list)) continue;
      for (const item of list) if (isObj(item) && typeof item.sha256 === 'string' && HEX64.test(item.sha256)) out.add(item.sha256);
    }
  } catch {
    /* unparseable manifest covers nothing: its assets are then treated as private and exported */
  }
  return out;
}
