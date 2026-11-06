// work/media/index.json: the private media store index (gitignored; never committed).
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

export type ReviewState = 'unreviewed';

export interface MediaMeasurement {
  readonly integratedLufs: number | null;
  readonly lraLu: number | null;
  readonly truePeakDbtp: number | null;
  readonly codec: string | null;
  readonly sampleRate: number | null;
  readonly channels: number | null;
  readonly bitRate: number | null;
  readonly normalizationType: string;
  readonly loudnormTruePeakTarget: number;
  readonly shortClip: boolean;
}

export interface MediaOriginal {
  readonly file: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly codec: string | null;
  readonly sampleRate: number | null;
  readonly channels: number | null;
  readonly durationMs: number | null;
}

export interface MediaEntry {
  readonly clipId: string;
  readonly lessonId: string;
  readonly kind: string;
  /** Reviewed transcript as given to the engine (private store, not Git). */
  readonly transcript: string;
  readonly transcriptSha256: string;
  readonly voice: string;
  readonly voiceLabel: string;
  readonly engine: string;
  readonly voiceVersion: {
    readonly os: string;
    readonly engineVersion: string;
    readonly voiceIdentifier?: string;
    readonly voiceAssetVersion: string;
  };
  /** Locale the voice is published for; a claim, not a verified accent judgment. */
  readonly variety: string;
  readonly synthetic: true;
  readonly settings: Record<string, unknown>;
  readonly settingsSha256: string;
  /** sha256(canonical JSON {transcriptSha256, settings}); unchanged => re-run skips the clip. */
  readonly cacheKey: string;
  /** 1 = the voice's default speed; the app offers 0.85 through playbackRate. */
  readonly rate: 1;
  readonly file: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly durationMs: number | null;
  /** Integrated loudness of the final MP3 (LUFS). */
  readonly loudness: number | null;
  /** True peak of the final MP3 (dBTP). */
  readonly peak: number | null;
  readonly measurement: MediaMeasurement;
  readonly original: MediaOriginal;
  readonly commands: readonly (readonly string[])[];
  readonly tools: Record<string, string>;
  readonly generatedAt: string;
  readonly rightsRecordId: string;
  readonly reviewState: ReviewState;
  readonly warnings: readonly string[];
  /** Set for calibration files; voice/engine details are withheld so labels do not leak. */
  readonly calibration?: true;
}

export interface MediaIndex {
  readonly schemaVersion: 1;
  readonly kind: 'sll-audio-media-index';
  readonly note: string;
  updatedAt: string;
  entries: MediaEntry[];
}

export const INDEX_NOTE =
  'Private generated-media index. Audio bytes and this index stay out of Git; synthetic speech, unreviewed, ' +
  'rights UNCONFIRMED (see content/reviews/audio/rights.json).';

export function emptyIndex(now: Date): MediaIndex {
  return { schemaVersion: 1, kind: 'sll-audio-media-index', note: INDEX_NOTE, updatedAt: now.toISOString(), entries: [] };
}

export function readIndex(path: string, now: Date = new Date()): MediaIndex {
  if (!existsSync(path)) return emptyIndex(now);
  const data = JSON.parse(readFileSync(path, 'utf8')) as MediaIndex;
  if (data.schemaVersion !== 1 || data.kind !== 'sll-audio-media-index' || !Array.isArray(data.entries)) {
    throw new Error(`${path} is not an sll-audio-media-index v1`);
  }
  return data;
}

/** Atomic replace (write temp + rename) so an interrupted run never leaves a torn index. */
export function writeIndex(path: string, index: MediaIndex): void {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  renameSync(tmp, path);
}

export function entryKey(clipId: string, voice: string): string {
  return `${clipId}\u0000${voice}`;
}

export function upsertEntry(index: MediaIndex, entry: MediaEntry): void {
  const key = entryKey(entry.clipId, entry.voice);
  const at = index.entries.findIndex((e) => entryKey(e.clipId, e.voice) === key);
  if (at >= 0) index.entries[at] = entry;
  else index.entries.push(entry);
  index.entries.sort((a, b) => (a.clipId === b.clipId ? a.voice.localeCompare(b.voice) : a.clipId.localeCompare(b.clipId)));
}
