// Immutable content pack builder and verifier (DOMAIN-SPEC § Versioned offline installation).
// node tools/content/pack.ts --out <dir> [--media <dir>] [--allow-unreviewed] [--version v]
//      [--created-at iso] [--source dir] [--ledger file] [--reviews dir] [--verify-signatures]
// node tools/content/pack.ts --verify <dir>
//
// Output directory (must not exist or be empty; written to a staging dir, then renamed):
//   pack.json         manifest (not listed in its own `files`; its SHA-256 is the pack hash)
//   entities.ndjson   one canonical JSON line per entity {kind, logicalId, revisionId, sha256, state, body}
//   coverage.json     coverage report of the source corpus (digest = manifest.coverageDigest)
//   media/<sha256>.mp3  only for clips whose media index entry carries review receipts + rights
// Without --allow-unreviewed only `ready` entities are packed and the build fails when a required
// entity is not ready, when validation reports errors or when a packed clip has no media.
import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, rmdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { canonicalJson, canonicalSha256, revisionId, sha256Hex } from './canonical.ts';
import { computeCoverage, coverageDigestOf } from './coverage.ts';
import type { CoverageReport } from './coverage.ts';
import {
  DEFAULT_LEDGER_PATH,
  DEFAULT_REVIEWS_DIR,
  DEFAULT_SOURCE_DIR,
  REPO_ROOT,
  TOOL_VERSION,
  allEntities,
  entityHash,
  entityState,
  flagString,
  isMain,
  loadCorpus,
  parseArgs,
  sourceDigest,
  stripStatus,
} from './load.ts';
import type { AnyRecord, Corpus } from './load.ts';
import { loadLedger } from './ledger.ts';
import { validateCorpus } from './validate.ts';
import type { ReceiptIndex } from './validate.ts';
import type { EntityKind, ReviewStatus } from './types.ts';

export const PACK_ID = 'sll-a1-a2';
export const MIN_APP_VERSION = '0.1.0';

export interface PackFile {
  path: string;
  sha256: string;
  bytes: number;
}

export interface MediaEntry {
  clipId: string;
  sha256: string;
  bytes: number;
  mime: 'audio/mpeg';
  durationMs: number;
  rights: Record<string, unknown>;
  receiptIds: string[];
}

export interface PackManifest {
  schemaVersion: 1;
  packId: string;
  version: string;
  minAppVersion: string;
  minSchemaVersion: 1;
  createdAt: string;
  language: 'es-ES';
  instructionLanguage: 'uk';
  sourceDigest: string;
  coverageDigest: string;
  files: PackFile[];
  counts: {
    entities: Partial<Record<EntityKind, number>>;
    states: Partial<Record<ReviewStatus, number>>;
    excluded: Partial<Record<EntityKind, number>>;
    media: number;
    clipsWithoutMedia: number;
  };
  media: MediaEntry[];
  validation: { errors: number; warnings: number };
  tool: string;
  preview?: true;
}

export interface EntityLine {
  kind: EntityKind;
  logicalId: string;
  revisionId: string;
  sha256: string;
  state: ReviewStatus;
  body: Record<string, unknown>;
}

export interface BuildOptions {
  out: string;
  sourceDir?: string;
  ledgerPath?: string;
  mediaDir?: string;
  allowUnreviewed?: boolean;
  version?: string;
  createdAt?: string;
  receipts?: ReceiptIndex;
}

export interface BuildResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  manifest?: PackManifest;
  packHash?: string;
}

/** Entities that a release pack cannot omit (see tools/content/README.md § Pack). */
export function requiredEntities(corpus: Corpus, ledgerLessons: Set<string>): Set<string> {
  const req = new Set<string>();
  const key = (kind: EntityKind, id: string): string => `${kind}|${id}`;
  for (const l of corpus.lessons) if (ledgerLessons.has(l.id)) req.add(key('lesson', l.id));
  for (const t of corpus.tasks) if (ledgerLessons.has(t.body.lessonId)) req.add(key('task', t.id));
  for (const s of corpus.skills) req.add(key('skill', s.id));
  for (const x of corpus.lexemes) req.add(key('lexeme', x.id));
  for (const c of corpus.clips) req.add(key('clip', c.id));
  for (const c of corpus.collections) {
    req.add(key('collection', c.id));
    for (const p of c.body.phraseIds) req.add(key('phrase', p));
  }
  const situations = new Set([
    ...corpus.lessons.flatMap((l) => l.body.situations),
    ...corpus.skills.flatMap((s) => s.body.situations ?? []),
    ...corpus.phrases.filter((p) => req.has(key('phrase', p.id))).flatMap((p) => p.body.situations),
  ]);
  for (const s of situations) req.add(key('situation', s));
  for (const s of corpus.skills) for (const src of s.body.sources) req.add(key('source', src.sourceId));
  return req;
}

interface MediaIndexEntry {
  clipId: string;
  sha256: string;
  file?: string;
  durationMs: number;
  rights?: Record<string, unknown>;
  rightsRecordId?: string;
  receiptIds?: string[];
}

function readMediaIndex(mediaDir: string, errors: string[]): MediaIndexEntry[] {
  const path = join(mediaDir, 'index.json');
  if (!existsSync(path)) {
    errors.push(`--media ${mediaDir}: index.json not found`);
    return [];
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  const list = Array.isArray(raw) ? raw : ((raw as { entries?: unknown }).entries ?? []);
  if (!Array.isArray(list)) {
    errors.push(`${path}: expected an array or {entries: [...]}`);
    return [];
  }
  const out: MediaIndexEntry[] = [];
  for (const [i, e] of (list as Array<Record<string, unknown>>).entries()) {
    if (typeof e.clipId !== 'string' || typeof e.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(e.sha256)) {
      errors.push(`${path}: entry ${i} needs clipId and a lowercase hex sha256`);
      continue;
    }
    out.push(e as unknown as MediaIndexEntry);
  }
  return out;
}

function isMp3(bytes: Buffer): boolean {
  if (bytes.length < 3) return false;
  if (bytes.subarray(0, 3).toString('latin1') === 'ID3') return true;
  return bytes[0] === 0xff && ((bytes[1] ?? 0) & 0xe0) === 0xe0;
}

function writeFileWithHash(path: string, data: string | Buffer): { sha256: string; bytes: number } {
  mkdirSync(dirname(path), { recursive: true });
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  writeFileSync(path, buf);
  return { sha256: sha256Hex(buf), bytes: buf.length };
}

function rootPackageVersion(): string {
  try {
    return (JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { version?: string }).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function buildPack(options: BuildOptions): BuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const preview = options.allowUnreviewed === true;
  const out = resolve(options.out);
  if (existsSync(out) && readdirSync(out).length > 0) {
    return { ok: false, errors: [`--out ${out} exists and is not empty; packs are immutable`], warnings };
  }

  const { corpus, issues } = loadCorpus({ sourceDir: options.sourceDir ?? DEFAULT_SOURCE_DIR });
  const loadErrors = issues.filter((i) => i.level === 'error');
  if (loadErrors.length > 0) {
    return { ok: false, errors: loadErrors.map((i) => `${i.file ?? ''}: ${i.message}`), warnings };
  }
  const ledger = loadLedger(options.ledgerPath ?? DEFAULT_LEDGER_PATH);
  const validation = validateCorpus(corpus, ledger, options.receipts ? { receipts: options.receipts } : {});
  if (validation.errors.length > 0) {
    const msg = `validation reports ${validation.errors.length} error(s) (run npm run content:validate)`;
    if (preview) warnings.push(msg);
    else errors.push(msg);
  }

  const required = requiredEntities(corpus, new Set([...ledger.lessons, ...ledger.checks]));
  const selected: AnyRecord[] = [];
  const excluded: Partial<Record<EntityKind, number>> = {};
  for (const record of allEntities(corpus)) {
    const state = entityState(record);
    if (preview || state === 'ready') {
      selected.push(record);
      continue;
    }
    excluded[record.kind] = (excluded[record.kind] ?? 0) + 1;
    if (required.has(`${record.kind}|${record.id}`)) errors.push(`required ${record.kind} ${record.id} is ${state}, not ready`);
  }
  if (!preview) {
    const present = new Set(allEntities(corpus).map((r) => `${r.kind}|${r.id}`));
    for (const k of required) if (!present.has(k)) errors.push(`required ${k.replace('|', ' ')} does not exist`);
  }

  // Media: only files that carry review receipts and a rights record.
  const media: MediaEntry[] = [];
  const mediaFiles = new Map<string, Buffer>();
  const packedClips = new Set(selected.filter((r) => r.kind === 'clip').map((r) => r.id));
  if (options.mediaDir) {
    for (const entry of readMediaIndex(options.mediaDir, errors)) {
      if (!packedClips.has(entry.clipId)) {
        warnings.push(`media ${entry.clipId}: clip is not packed; skipped`);
        continue;
      }
      const receiptIds = (entry.receiptIds ?? []).filter((x) => typeof x === 'string' && x.length > 0);
      const rights = entry.rights ?? (typeof entry.rightsRecordId === 'string' ? { rightsRecordId: entry.rightsRecordId } : undefined);
      if (receiptIds.length === 0 || !rights) {
        warnings.push(`media ${entry.clipId}: no review receipts or rights record; skipped`);
        continue;
      }
      if (!Number.isInteger(entry.durationMs) || entry.durationMs <= 0) {
        errors.push(`media ${entry.clipId}: durationMs must be a positive integer`);
        continue;
      }
      const file = join(options.mediaDir, entry.file ?? `${entry.sha256}.mp3`);
      if (!existsSync(file)) {
        errors.push(`media ${entry.clipId}: file ${file} not found`);
        continue;
      }
      const bytes = readFileSync(file);
      if (sha256Hex(bytes) !== entry.sha256) {
        errors.push(`media ${entry.clipId}: sha256 mismatch for ${file}`);
        continue;
      }
      if (!isMp3(bytes)) {
        errors.push(`media ${entry.clipId}: ${file} is not an MP3 stream`);
        continue;
      }
      mediaFiles.set(entry.sha256, bytes);
      media.push({ clipId: entry.clipId, sha256: entry.sha256, bytes: bytes.length, mime: 'audio/mpeg', durationMs: entry.durationMs, rights, receiptIds });
    }
  }
  const clipsWithMedia = new Set(media.map((m) => m.clipId));
  const clipsWithoutMedia = [...packedClips].filter((id) => !clipsWithMedia.has(id));
  if (clipsWithoutMedia.length > 0) {
    const msg = `${clipsWithoutMedia.length} packed clip(s) without reviewed media: ${clipsWithoutMedia.slice(0, 5).join(', ')}${clipsWithoutMedia.length > 5 ? ', …' : ''}`;
    if (preview) warnings.push(msg);
    else errors.push(msg);
  }

  if (errors.length > 0) return { ok: false, errors, warnings };

  const coverage: CoverageReport = computeCoverage(corpus, ledger);
  const lines: EntityLine[] = selected.map((record) => {
    const body = stripStatus(record.body);
    return {
      kind: record.kind,
      logicalId: record.id,
      revisionId: revisionId(record.kind, record.id, body),
      sha256: entityHash(record),
      state: entityState(record),
      body,
    };
  });

  const staging = join(dirname(out), `.${randomBytes(6).toString('hex')}.pack-staging`);
  mkdirSync(staging, { recursive: true });
  try {
    const files: PackFile[] = [];
    const put = (rel: string, data: string | Buffer): void => {
      const written = writeFileWithHash(join(staging, rel), data);
      files.push({ path: rel, sha256: written.sha256, bytes: written.bytes });
    };
    put('entities.ndjson', lines.map((l) => canonicalJson(l)).join('\n') + (lines.length > 0 ? '\n' : ''));
    put('coverage.json', `${JSON.stringify(coverage, null, 2)}\n`);
    for (const [sha, bytes] of [...mediaFiles.entries()].sort()) put(`media/${sha}.mp3`, bytes);
    files.sort((a, b) => (a.path < b.path ? -1 : 1));

    const entityCounts: Partial<Record<EntityKind, number>> = {};
    const stateCounts: Partial<Record<ReviewStatus, number>> = {};
    for (const l of lines) {
      entityCounts[l.kind] = (entityCounts[l.kind] ?? 0) + 1;
      stateCounts[l.state] = (stateCounts[l.state] ?? 0) + 1;
    }
    const manifest: PackManifest = {
      schemaVersion: 1,
      packId: PACK_ID,
      version: options.version ?? rootPackageVersion(),
      minAppVersion: MIN_APP_VERSION,
      minSchemaVersion: 1,
      createdAt: options.createdAt ?? new Date().toISOString(),
      language: 'es-ES',
      instructionLanguage: 'uk',
      sourceDigest: sourceDigest(corpus),
      coverageDigest: coverage.coverageDigest,
      files,
      counts: { entities: entityCounts, states: stateCounts, excluded, media: media.length, clipsWithoutMedia: clipsWithoutMedia.length },
      media: media.sort((a, b) => (a.clipId < b.clipId ? -1 : 1)),
      validation: { errors: validation.errors.length, warnings: validation.warnings.length },
      tool: TOOL_VERSION,
      ...(preview ? { preview: true as const } : {}),
    };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    writeFileSync(join(staging, 'pack.json'), manifestText);
    for (const f of [...files.map((x) => x.path), 'pack.json']) chmodSync(join(staging, f), 0o444);
    if (existsSync(out)) rmdirSync(out); // verified empty above
    renameSync(staging, out);
    return { ok: true, errors, warnings, manifest, packHash: sha256Hex(Buffer.from(manifestText, 'utf8')) };
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function walkFiles(dir: string, root: string, out: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, root, out);
    else out.push(relative(root, full).split(sep).join('/'));
  }
}

const ID_FIELD: Record<EntityKind, string> = {
  lesson: 'id',
  task: 'id',
  skill: 'skillId',
  lexeme: 'id',
  clip: 'id',
  phrase: 'id',
  collection: 'id',
  material: 'id',
  situation: 'id',
  source: 'id',
};

/** Re-hashes every file and entity of a pack against its manifest. */
export function verifyPack(dir: string): { ok: boolean; errors: string[]; packHash?: string } {
  const errors: string[] = [];
  const manifestPath = join(dir, 'pack.json');
  if (!existsSync(manifestPath)) return { ok: false, errors: ['pack.json missing'] };
  const manifestText = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText) as PackManifest;
  if (manifest.schemaVersion !== 1 || manifest.packId !== PACK_ID) errors.push('unexpected schemaVersion/packId');
  const listed = new Map(manifest.files.map((f) => [f.path, f]));
  const actual: string[] = [];
  walkFiles(dir, dir, actual);
  for (const path of actual) if (path !== 'pack.json' && !listed.has(path)) errors.push(`unlisted file ${path}`);
  for (const f of manifest.files) {
    const abs = join(dir, f.path);
    if (!existsSync(abs)) {
      errors.push(`missing file ${f.path}`);
      continue;
    }
    const bytes = readFileSync(abs);
    if (bytes.length !== f.bytes) errors.push(`${f.path}: ${bytes.length} bytes, manifest says ${f.bytes}`);
    if (sha256Hex(bytes) !== f.sha256) errors.push(`${f.path}: sha256 mismatch`);
  }
  if (existsSync(join(dir, 'entities.ndjson'))) {
    const seen = new Set<string>();
    const lines = readFileSync(join(dir, 'entities.ndjson'), 'utf8').split('\n').filter((l) => l.length > 0);
    for (const [i, line] of lines.entries()) {
      let e: EntityLine;
      try {
        e = JSON.parse(line) as EntityLine;
      } catch {
        errors.push(`entities.ndjson line ${i + 1}: invalid JSON`);
        continue;
      }
      if (canonicalJson(e) !== line) errors.push(`entities.ndjson line ${i + 1}: not canonical JSON`);
      const k = `${e.kind}|${e.logicalId}`;
      if (seen.has(k)) errors.push(`duplicate entity ${k}`);
      seen.add(k);
      if (!(e.kind in ID_FIELD) || e.body[ID_FIELD[e.kind]] !== e.logicalId) errors.push(`${k}: logicalId does not match body`);
      if (canonicalSha256(e.body) !== e.sha256) errors.push(`${k}: sha256 does not match body`);
      if (revisionId(e.kind, e.logicalId, e.body) !== e.revisionId) errors.push(`${k}: revisionId does not match body`);
      if (!manifest.preview && e.state !== 'ready') errors.push(`${k}: state ${e.state} in a non-preview pack`);
    }
  } else errors.push('entities.ndjson missing');
  for (const m of manifest.media) {
    const f = listed.get(`media/${m.sha256}.mp3`);
    if (!f || f.sha256 !== m.sha256) errors.push(`media ${m.clipId}: file media/${m.sha256}.mp3 not listed with that hash`);
    if (m.receiptIds.length === 0) errors.push(`media ${m.clipId}: no receipts`);
  }
  if (existsSync(join(dir, 'coverage.json'))) {
    const coverage = JSON.parse(readFileSync(join(dir, 'coverage.json'), 'utf8')) as CoverageReport;
    if (coverage.coverageDigest !== manifest.coverageDigest || coverageDigestOf(coverage) !== manifest.coverageDigest) errors.push('coverage.json does not match manifest.coverageDigest');
  }
  return { ok: errors.length === 0, errors, packHash: sha256Hex(Buffer.from(manifestText, 'utf8')) };
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));
  const verify = flagString(flags, 'verify');
  if (verify) {
    const result = verifyPack(verify);
    for (const e of result.errors) console.error(`ERROR ${e}`);
    console.log(result.ok ? `pack OK — packHash ${result.packHash}` : `pack INVALID (${result.errors.length} error(s))`);
    if (!result.ok) process.exit(1);
    return;
  }
  const out = flagString(flags, 'out');
  if (!out) {
    console.error('usage: node tools/content/pack.ts --out <dir> [--media <dir>] [--allow-unreviewed] [--version v] [--created-at iso]\n       node tools/content/pack.ts --verify <dir>');
    process.exit(2);
  }
  const { createReceiptIndex } = await import('../review/store.ts');
  const receipts = createReceiptIndex({ reviewsDir: flagString(flags, 'reviews') ?? DEFAULT_REVIEWS_DIR, verifySignatures: flags.has('verify-signatures') });
  const mediaDir = flagString(flags, 'media');
  const version = flagString(flags, 'version');
  const createdAt = flagString(flags, 'created-at');
  const result = buildPack({
    out,
    sourceDir: flagString(flags, 'source') ?? DEFAULT_SOURCE_DIR,
    ledgerPath: flagString(flags, 'ledger') ?? DEFAULT_LEDGER_PATH,
    allowUnreviewed: flags.has('allow-unreviewed'),
    receipts,
    ...(mediaDir ? { mediaDir } : {}),
    ...(version ? { version } : {}),
    ...(createdAt ? { createdAt } : {}),
  });
  for (const w of result.warnings) console.log(`WARNING ${w}`);
  for (const e of result.errors) console.error(`ERROR ${e}`);
  if (!result.ok || !result.manifest) {
    console.error(`pack NOT built (${result.errors.length} error(s))`);
    process.exit(1);
  }
  const m = result.manifest;
  console.log(`pack ${m.packId}@${m.version}${m.preview ? ' (PREVIEW: unreviewed content included)' : ''} → ${resolve(out)}`);
  console.log(`entities ${JSON.stringify(m.counts.entities)} states ${JSON.stringify(m.counts.states)} media ${m.counts.media}`);
  console.log(`sourceDigest ${m.sourceDigest}\ncoverageDigest ${m.coverageDigest}\npackHash ${result.packHash}`);
}

if (isMain(import.meta.url)) await main();
