// Content pack wire format shared by the installer and the synthetic test fixture.
// Format source: work/briefs/02-content-tools.md item 4 (pack.json + entities.ndjson + media/).
// Canonical JSON = recursively sorted object keys, no whitespace, UTF-8.
// revisionId = UUID (RFC 9562 version 8) from the first 16 bytes of
// sha256(`${kind}|${logicalId}|${canonicalJson(body)}`); entity sha256 = sha256(canonicalJson(body)).
import { createHash } from 'node:crypto';

export const PACK_MANIFEST = 'pack.json';
export const PACK_ENTITIES = 'entities.ndjson';
export const PACK_SCHEMA_VERSION = 1;
export const CONTENT_SCHEMA_VERSION = 1;
export const APP_VERSION = '0.1.0';

export const ENTITY_KINDS = ['lesson', 'task', 'skill', 'lexeme', 'clip', 'phrase', 'collection', 'material', 'situation', 'source'] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export const PACK_STATES = ['draft', 'needs-review', 'reviewed', 'ready', 'quarantined'] as const;
export type PackEntityState = (typeof PACK_STATES)[number];

export interface PackFileEntry {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
}

export interface PackMediaEntry {
  readonly clipId: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly mime: 'audio/mpeg';
  readonly durationMs?: number;
  readonly rights?: Record<string, unknown>;
  readonly receiptIds?: readonly string[];
}

export interface PackBlockTitle {
  readonly id: string;
  readonly titleUk: string;
}

export interface PackManifest {
  readonly schemaVersion: number;
  readonly packId: string;
  readonly version: string;
  readonly minAppVersion: string;
  readonly minSchemaVersion: number;
  readonly createdAt: string;
  readonly language: string;
  readonly instructionLanguage: string;
  readonly sourceDigest?: string;
  readonly coverageDigest?: string;
  readonly files: readonly PackFileEntry[];
  readonly counts?: Record<string, number>;
  readonly preview?: boolean;
  readonly media?: readonly PackMediaEntry[];
  /** Optional Ukrainian block titles (server-core proposal; see report Questions). */
  readonly blocks?: readonly PackBlockTitle[];
  readonly notice?: string;
}

export interface PackEntityLine {
  readonly kind: EntityKind;
  readonly logicalId: string;
  readonly revisionId: string;
  readonly sha256: string;
  readonly state: PackEntityState;
  readonly body: Record<string, unknown>;
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('non-finite number in canonical JSON');
    if (value === undefined) throw new Error('undefined in canonical JSON');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v)).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(',')}}`;
}

export function sha256Hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

/** UUID version 8 built from the first 16 bytes of a SHA-256 digest (RFC 9562 §5.8). */
export function uuidV8FromDigest(digest: Buffer): string {
  const b = Buffer.from(digest.subarray(0, 16));
  b[6] = (b[6]! & 0x0f) | 0x80;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

export function deriveRevisionId(kind: string, logicalId: string, body: unknown): string {
  return uuidV8FromDigest(createHash('sha256').update(`${kind}|${logicalId}|${canonicalJson(body)}`).digest());
}

/** Deterministic id for a profile-side record derived from a course logical id (stable across packs). */
export function deriveStableId(namespace: string, logicalId: string): string {
  return uuidV8FromDigest(createHash('sha256').update(`${namespace}|${logicalId}`).digest());
}

export function entitySha256(body: unknown): string {
  return sha256Hex(canonicalJson(body));
}

/** Pack-relative paths: forward slashes, no traversal, no absolute paths, bounded length. */
export function isSafeRelativePath(p: string): boolean {
  if (typeof p !== 'string' || p.length === 0 || Buffer.byteLength(p, 'utf8') > 240) return false;
  if (p.startsWith('/') || p.includes('\\') || p.includes('\0')) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(p)) return false;
  return p.split('/').every((seg) => seg !== '' && seg !== '.' && seg !== '..');
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.+-]/).map((x) => Number.parseInt(x, 10));
  const pb = b.split(/[.+-]/).map((x) => Number.parseInt(x, 10));
  for (let i = 0; i < 3; i++) {
    const x = Number.isFinite(pa[i]) ? pa[i]! : 0;
    const y = Number.isFinite(pb[i]) ? pb[i]! : 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/** True when the bytes start with an ID3v2 tag or an MPEG audio frame sync (MIME sniff for audio/mpeg). */
export function looksLikeMpegAudio(head: Uint8Array): boolean {
  if (head.length >= 3 && head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) return true;
  return head.length >= 2 && head[0] === 0xff && (head[1]! & 0xe0) === 0xe0;
}

/** Course order: A1 before A2, block number, lessons L1..Ln, optional check C1 last in its block. */
export function lessonOrderKey(lessonId: string): number {
  const m = /^A([12])-0([1-8])-(L([0-9]{1,2})|C1)$/.exec(lessonId);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const level = Number(m[1]);
  const block = Number(m[2]);
  const lesson = m[4] ? Number(m[4]) : 99;
  return level * 10000 + block * 100 + lesson;
}

export function blockOrderKey(blockId: string): number {
  const m = /^A([12])-0([1-8])$/.exec(blockId);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return Number(m[1]) * 100 + Number(m[2]);
}
