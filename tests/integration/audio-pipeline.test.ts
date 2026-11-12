// Audio pipeline (tools/audio) against the real macOS `say` and ffmpeg, in a temp media dir.
// Skipped where those binaries are unavailable (e.g. Linux CI). Never touches work/media.
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { commandExists, runChecked } from '../../tools/audio/lib/exec.ts';
import { encodeRawArgs, FFMPEG } from '../../tools/audio/lib/ffmpeg.ts';
import { sha256File } from '../../tools/audio/lib/hash.ts';
import { loadClips } from '../../tools/audio/lib/clips.ts';
import { readIndex, writeIndex } from '../../tools/audio/lib/media-index.ts';
import { ROOT, synthesizeClips } from '../../tools/audio/synthesize.ts';
import { runTechnicalQa } from '../../tools/audio/qa-technical.ts';

const available = process.platform === 'darwin' && (await commandExists(FFMPEG)) && (await commandExists('say', ['-v', '?']));
const fixture = join(ROOT, 'tools', 'audio', 'fixtures', 'benchmark', 'A1-05.json');
const schema = join(ROOT, 'content', 'schemas', 'content.schema.json');
const work = mkdtempSync(join(tmpdir(), 'sll-audio-it-'));
const media = join(work, 'media');
const quiet = { log: () => undefined };

afterAll(() => rmSync(work, { recursive: true, force: true }));

describe.skipIf(!available)('audio pipeline with say + ffmpeg', () => {
  it('synthesizes, normalizes and indexes the fixture clips', { timeout: 60_000 }, async () => {
    const r = await synthesizeClips({ inputs: [fixture], voices: ['macos.monica'], mediaDir: media, ...quiet });
    expect(r.generated).toHaveLength(2);
    for (const e of r.index.entries) {
      expect(e.measurement).toMatchObject({ codec: 'mp3', sampleRate: 44100, channels: 1, bitRate: 128000, normalizationType: 'linear' });
      expect(Math.abs((e.loudness ?? 0) - -19)).toBeLessThanOrEqual(1);
      expect(e.peak ?? 0).toBeLessThanOrEqual(-1);
      expect(e.reviewState).toBe('unreviewed');
      expect(e.rightsRecordId).toBe('rights.macos-system-voices.tahoe-26');
      expect(sha256File(join(media, e.file))).toBe(e.sha256);
      expect(existsSync(join(media, e.original.file))).toBe(true);
      expect(e.commands[0]?.[0]).toBe('say');
    }
  });

  it('skips unchanged clips and regenerates a changed transcript or a tampered file', { timeout: 60_000 }, async () => {
    const again = await synthesizeClips({ inputs: [fixture], voices: ['macos.monica'], mediaDir: media, ...quiet });
    expect([again.generated.length, again.skipped.length]).toEqual([0, 2]);

    const changed = JSON.parse(readFileSync(fixture, 'utf8'));
    changed.clips[0].transcript = 'Hola, buenas tardes. ¿Me pone un té, por favor?';
    const changedPath = join(work, 'A1-05.json');
    writeFileSync(changedPath, JSON.stringify(changed));
    const afterEdit = await synthesizeClips({ inputs: [changedPath], voices: ['macos.monica'], mediaDir: media, ...quiet });
    expect(afterEdit.generated).toEqual([`${changed.clips[0].id} × macos.monica`]);
    expect(afterEdit.skipped).toHaveLength(1);

    const victim = afterEdit.index.entries[0]!;
    writeFileSync(join(media, victim.file), 'corrupted');
    const afterTamper = await synthesizeClips({ inputs: [changedPath], voices: ['macos.monica'], mediaDir: media, ...quiet });
    expect(afterTamper.generated).toEqual([`${victim.clipId} × macos.monica`]);
  });

  it('technical QA passes the generated files and fails a clipped one', { timeout: 60_000 }, async () => {
    const indexPath = join(media, 'index.json');
    const clean = await runTechnicalQa(indexPath, 'test');
    expect(clean.summary.fail).toBe(0);
    expect(clean.files.every((f) => f.measurements.playable === 'yes')).toBe(true);

    // Build a hard-clipped MP3 from a kept original and register it as an extra entry.
    const index = readIndex(indexPath);
    const base = index.entries[0]!;
    const clippedTmp = join(work, 'clipped.mp3');
    await runChecked(FFMPEG, encodeRawArgs(join(media, base.original.file), clippedTmp, 'volume=24dB,aformat=sample_fmts=s16'));
    const sha = sha256File(clippedTmp);
    copyFileSync(clippedTmp, join(media, `${sha}.mp3`));
    index.entries.push({ ...base, clipId: 'clip.test.clipped', file: `${sha}.mp3`, sha256: sha });
    writeIndex(indexPath, index);
    const report = await runTechnicalQa(indexPath, 'test');
    const bad = report.files.find((f) => f.clipId === 'clip.test.clipped');
    expect(bad?.status).toBe('fail');
    expect(bad?.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['clipping', 'peak.true-peak']));
  });

  it('rejects clip files that violate the content schema', () => {
    const broken = JSON.parse(readFileSync(fixture, 'utf8'));
    broken.clips[0].id = 'not-a-clip-id';
    const path = join(work, 'broken.json');
    writeFileSync(path, JSON.stringify(broken));
    expect(() => loadClips([path], schema)).toThrow(/clip input invalid/);
  });
});
