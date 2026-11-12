// Builds the SYNTHETIC test pack in the content-pack format (pack.json + entities.ndjson + media/).
// Usage: node tests/fixtures/pack-synthetic/build-pack.ts --out <dir> [--version 1.0.0] [--preview]
// The media files are synthetic, decodable MP3 silence (no recorded speech, no third-party audio).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  canonicalJson,
  deriveRevisionId,
  entitySha256,
  PACK_ENTITIES,
  PACK_MANIFEST,
  type EntityKind,
  type PackFileEntry,
  type PackManifest,
  type PackMediaEntry,
} from '../../../apps/server/src/content/pack-format.ts';
import { BLOCK_TITLES, NOTICE, syntheticEntities, type SyntheticEntities } from './entities.ts';

export interface BuildOptions {
  readonly version?: string;
  readonly preview?: boolean;
  /** Mutate the entity set before writing (e.g. a new task revision). */
  readonly mutate?: (e: SyntheticEntities) => void;
  /** Override review states for a preview pack. */
  readonly state?: (kind: EntityKind, body: Record<string, unknown>) => string;
  readonly omitMediaForClips?: readonly string[];
  /** Changes the synthetic audio bytes (a new audio revision with a new hash). */
  readonly mediaSalt?: string;
}

export interface BuiltPack {
  readonly dir: string;
  readonly manifest: PackManifest;
  readonly manifestSha256: string;
  readonly clipHashes: Record<string, string>;
}

/**
 * Deterministic synthetic MP3 that a browser can decode: an ID3v2.4 tag whose TXXX frame carries a
 * label-specific value (so every clip/salt has its own hash), then silent MPEG-1 Layer III frames
 * (32 kbps, 44.1 kHz, mono, 104 bytes each, all-zero side info = silence, ~26 ms per frame).
 * The total size stays exactly `size` bytes (Range tests rely on 4096); the tail after the last whole
 * frame is zero padding, which decoders skip.
 */
export function fakeMp3(label: string, size = 4096): Buffer {
  const value = Buffer.from(createHash('sha256').update(label).digest('hex'), 'latin1');
  const txxxBody = Buffer.concat([Buffer.from([0x03]), Buffer.from('sll', 'latin1'), Buffer.from([0x00]), value]);
  const txxx = Buffer.concat([Buffer.from('TXXX', 'latin1'), syncsafe(txxxBody.length), Buffer.from([0x00, 0x00]), txxxBody]);
  const tag = Buffer.concat([Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00]), syncsafe(txxx.length), txxx]);
  const b = Buffer.alloc(size);
  tag.copy(b, 0);
  const FRAME = 104;
  const header = Buffer.from([0xff, 0xfb, 0x10, 0xc4]);
  for (let off = tag.length; off + FRAME <= size; off += FRAME) header.copy(b, off);
  return b;
}

function syncsafe(n: number): Buffer {
  return Buffer.from([(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f]);
}

const KIND_OF: Array<[EntityKind, keyof SyntheticEntities, (b: any) => string]> = [
  ['source', 'sources', (b) => b.id],
  ['situation', 'situations', (b) => b.id],
  ['skill', 'skills', (b) => b.skillId],
  ['lexeme', 'lexemes', (b) => b.id],
  ['lesson', 'lessons', (b) => b.id],
  ['task', 'tasks', (b) => b.id],
  ['clip', 'clips', (b) => b.id],
  ['phrase', 'phrases', (b) => b.id],
  ['collection', 'collections', (b) => b.id],
  ['material', 'materials', (b) => b.id],
];

export function buildSyntheticPack(dir: string, options: BuildOptions = {}): BuiltPack {
  const entities = syntheticEntities();
  options.mutate?.(entities);
  mkdirSync(join(dir, 'media'), { recursive: true });
  const lines: string[] = [];
  for (const [kind, key, idOf] of KIND_OF) {
    for (const raw of entities[key] as any[]) {
      const full = { ...raw };
      if (options.state && 'reviewStatus' in full) full.reviewStatus = options.state(kind, full);
      const state = 'reviewStatus' in full ? full.reviewStatus : 'ready';
      // Same as tools/content/pack.ts: reviewStatus is stripped from the packed body; the hash and
      // revision id bind to the content, the review state travels in `state`.
      const { reviewStatus: _status, ...body } = full;
      const logicalId = idOf(body);
      lines.push(canonicalJson({ kind, logicalId, revisionId: deriveRevisionId(kind, logicalId, body), sha256: entitySha256(body), state, body }));
    }
  }
  const ndjson = `${lines.join('\n')}\n`;
  writeFileSync(join(dir, PACK_ENTITIES), ndjson);
  const files: PackFileEntry[] = [{ path: PACK_ENTITIES, sha256: createHash('sha256').update(ndjson).digest('hex'), bytes: Buffer.byteLength(ndjson) }];
  const media: PackMediaEntry[] = [];
  const clipHashes: Record<string, string> = {};
  for (const clip of entities.clips) {
    if (options.omitMediaForClips?.includes(clip.id)) continue;
    const bytes = fakeMp3(`${clip.id}${options.mediaSalt ?? ''}`);
    const sha = createHash('sha256').update(bytes).digest('hex');
    writeFileSync(join(dir, 'media', `${sha}.mp3`), bytes);
    files.push({ path: `media/${sha}.mp3`, sha256: sha, bytes: bytes.length });
    media.push({ clipId: clip.id, sha256: sha, bytes: bytes.length, mime: 'audio/mpeg', durationMs: 1500, rights: { synthetic: true }, receiptIds: [] });
    clipHashes[clip.id] = sha;
  }
  const manifest: PackManifest = {
    schemaVersion: 1,
    packId: 'sll-a1-a2',
    version: options.version ?? '0.0.1-synthetic',
    minAppVersion: '0.1.0',
    minSchemaVersion: 1,
    createdAt: '2026-10-01T08:00:00.000Z',
    language: 'es-ES',
    instructionLanguage: 'uk',
    sourceDigest: createHash('sha256').update(ndjson).digest('hex'),
    coverageDigest: createHash('sha256').update('synthetic').digest('hex'),
    files,
    counts: Object.fromEntries(KIND_OF.map(([kind, key]) => [kind, (entities[key] as unknown[]).length])),
    media,
    blocks: BLOCK_TITLES,
    notice: NOTICE,
    ...(options.preview ? { preview: true } : {}),
  };
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(join(dir, PACK_MANIFEST), manifestText);
  return { dir, manifest, manifestSha256: createHash('sha256').update(manifestText).digest('hex'), clipHashes };
}

function main(argv: string[]): void {
  const out = argv[argv.indexOf('--out') + 1];
  if (!argv.includes('--out') || !out) {
    process.stderr.write('usage: build-pack.ts --out <dir> [--version <v>] [--preview]\n');
    process.exit(2);
  }
  const vi = argv.indexOf('--version');
  const built = buildSyntheticPack(out, { ...(vi >= 0 && argv[vi + 1] ? { version: argv[vi + 1]! } : {}), preview: argv.includes('--preview') });
  process.stdout.write(`${JSON.stringify({ dir: built.dir, manifestSha256: built.manifestSha256 })}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
