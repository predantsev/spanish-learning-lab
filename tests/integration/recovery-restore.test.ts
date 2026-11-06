// A-06 (module level) and A-07: logical export, bounded upload validation, shadow import, single-use preview,
// crash-journaled switch with rollback, hostile archives. Synthetic profiles in temp roots only.
import { afterEach, describe, expect, it } from 'vitest';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { NON_PORTABLE_TABLES, PORTABLE_TABLES } from '../../apps/server/src/db/migrations/index.ts';
import { APP_SCHEMA_VERSION } from '../../apps/server/src/db/connection.ts';
import { createRecovery, recoverJournalIfNeeded, RecoveryError, SimulatedCrash, type RecoveryOptions, type RecoveryService } from '../../apps/server/src/recovery/index.ts';
import type { ExportManifest } from '../../apps/server/src/recovery/archive.ts';
import type { Db } from '../../apps/server/src/db/connection.ts';
import {
  FakeClock,
  ManualTimers,
  REVIEW_KEY,
  REVIEW_KEY_ID,
  SECRET_MARKERS,
  TestStore,
  listDir,
  rawZip,
  readZip,
  seedProfile,
  seedSynthetic,
  tempRoot,
  writeZip,
} from './recovery-helpers.ts';

const stores: TestStore[] = [];
afterEach(() => {
  for (const s of stores.splice(0)) s.dispose();
});

interface Home {
  readonly root: string;
  readonly store: TestStore;
  readonly clock: FakeClock;
  readonly recovery: RecoveryService;
  readonly profileId: string;
}

function makeHome(opts: { epoch?: number; seed?: boolean; recovery?: RecoveryOptions; start?: string } = {}): Home {
  const clock = new FakeClock(opts.start ?? '2026-10-01T08:00:00Z');
  const root = join(tempRoot(), 'home');
  const store = new TestStore(root, clock);
  stores.push(store);
  const profileId = seedProfile(store, { epoch: opts.epoch ?? 1 });
  if (opts.seed !== false) seedSynthetic(store);
  const recovery = createRecovery(store, { timers: new ManualTimers(clock), ...opts.recovery });
  return { root, store, clock, recovery, profileId };
}

function reopenHome(h: Home, opts: RecoveryOptions = {}): Home {
  const store = new TestStore(h.root, h.clock);
  stores.push(store);
  return { ...h, store, recovery: createRecovery(store, { timers: new ManualTimers(h.clock), ...opts }) };
}

const sha = (b: Buffer): string => createHash('sha256').update(b).digest('hex');

async function exportBuffer(h: Home, selfContained = false): Promise<Buffer> {
  const art = await h.recovery.exportProfile({ selfContained });
  return readFileSync(art.path);
}

async function previewOf(h: Home, buf: Buffer) {
  const up = await h.recovery.storeUpload(Readable.from([buf], { objectMode: false }));
  return h.recovery.previewRestore(up.id);
}

async function failure(p: Promise<unknown>): Promise<RecoveryError> {
  const err = await p.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(RecoveryError);
  return err as RecoveryError;
}

function snapshotState(store: TestStore): { id: string; epoch: number; seq: number; drafts: number } {
  const p = store.profile();
  return { id: p.id, epoch: p.epoch, seq: store.lastEventSeq(), drafts: (store.db().prepare('SELECT count(*) AS n FROM drafts').get() as { n: number }).n };
}

function rowsOf(db: Db, table: string): unknown[] {
  return db.prepare(`SELECT * FROM "${table}" ORDER BY rowid`).all();
}

function runtimeLeftovers(store: TestStore): string[] {
  return listDir(store.paths.runtime).filter((f) => /^(shadow-|restore-staging-|export-)/.test(f));
}

type MutableManifest = { schemaVersion: number; tables: Array<{ name: string }>; files: unknown[] } & Record<string, unknown>;

async function rebuildManifest(entries: Map<string, Buffer>, edit: (m: MutableManifest) => void): Promise<Buffer> {
  const m = JSON.parse(entries.get('manifest.json')!.toString('utf8')) as MutableManifest;
  edit(m);
  entries.set('manifest.json', Buffer.from(JSON.stringify(m)));
  return writeZip(entries);
}

function retable(entries: Map<string, Buffer>, table: string, mapRow: (row: Record<string, unknown>) => Record<string, unknown>): void {
  const path = `tables/${table}.ndjson`;
  const lines = entries.get(path)!.toString('utf8').split('\n').filter(Boolean);
  const out = Buffer.from(lines.map((l) => `${JSON.stringify(mapRow(JSON.parse(l) as Record<string, unknown>))}\n`).join(''));
  entries.set(path, out);
  const m = JSON.parse(entries.get('manifest.json')!.toString('utf8')) as { tables: Array<{ name: string; sha256: string; bytes: number }> };
  const t = m.tables.find((x) => x.name === table)!;
  t.sha256 = sha(out);
  t.bytes = out.length;
  entries.set('manifest.json', Buffer.from(JSON.stringify(m)));
}

describe('portable export (A-06)', () => {
  it('writes logical NDJSON rows with a verifiable manifest and never credentials, sessions, runtime, logs or keys', async () => {
    const src = makeHome();
    for (let i = 0; i < 3; i++) await src.store.commit();
    writeFileSync(join(src.store.paths.runtime, 'runtime.json'), '{"pid":1}');
    writeFileSync(join(src.store.paths.keys, 'review-hmac.key'), REVIEW_KEY);
    const art = await src.recovery.exportProfile({ selfContained: false });
    expect(art.path.startsWith(src.store.paths.exports)).toBe(true);
    const raw = readFileSync(art.path);
    expect(sha(raw)).toBe(art.sha256);
    const entries = await readZip(art.path);
    const manifest = JSON.parse(entries.get('manifest.json')!.toString('utf8')) as ExportManifest;
    expect(manifest).toMatchObject({ format: 'spanish-learning-lab.profile-export', formatVersion: 1, schemaVersion: APP_SCHEMA_VERSION(), eventSeq: 3, selfContained: false });
    expect(manifest.profile).toEqual({ id: src.profileId, epoch: 1 });
    expect(manifest.tables.map((t) => t.name).sort()).toEqual([...PORTABLE_TABLES].sort());
    expect([...entries.keys()].sort()).toEqual(['manifest.json', ...PORTABLE_TABLES.map((t) => `tables/${t}.ndjson`)].sort());
    for (const t of manifest.tables) {
      const buf = entries.get(t.path)!;
      expect(sha(buf)).toBe(t.sha256);
      expect(buf.toString('utf8').split('\n').filter(Boolean)).toHaveLength(t.rows);
    }
    for (const t of NON_PORTABLE_TABLES) expect(entries.has(`tables/${t}.ndjson`)).toBe(false);
    const everything = Buffer.concat([...entries.values()]).toString('utf8');
    for (const secret of [SECRET_MARKERS.tokenHash, SECRET_MARKERS.cookieHash, SECRET_MARKERS.csrf, REVIEW_KEY.toString('utf8'), '"pid":1']) {
      expect(everything.includes(secret)).toBe(false);
    }
    // Downloads are hash-bound and expire after 15 minutes.
    expect(src.recovery.download(art.id)).toEqual(art);
    src.clock.advance(15 * 60_000);
    expect(src.recovery.download(art.id)).toBeUndefined();
    expect(existsSync(art.path)).toBe(false);
  });
});

describe('replacement restore (A-06)', () => {
  it('rejects a confirm after the live profile changed, then restores exact history with a new epoch', async () => {
    const src = makeHome({ epoch: 1, recovery: { reviewKey: (id) => (id === REVIEW_KEY_ID ? REVIEW_KEY : undefined) } });
    for (let i = 0; i < 4; i++) await src.store.commit('attempt.submit');
    const archive = await exportBuffer(src);
    const rebuilt: string[] = [];
    const dst = makeHome({
      epoch: 3,
      recovery: {
        reviewKey: (id) => (id === REVIEW_KEY_ID ? REVIEW_KEY : undefined),
        rebuildProjections: (db: Db) => {
          rebuilt.push((db.prepare('SELECT id FROM profiles').get() as { id: string }).id);
        },
      },
    });
    await dst.store.commit();
    const before = snapshotState(dst.store);

    const first = await previewOf(dst, archive);
    expect(first).toMatchObject({ profileId: src.profileId, attemptCount: 1, draftCount: 1, schemaVersion: APP_SCHEMA_VERSION(), liveEventSeq: before.seq, profileEpoch: 3 });
    expect(first.missingAssets).toEqual([]);
    expect(first.requiresSourceTrust).toBe(false);
    expect(first.confirmation).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(rebuilt).toEqual([src.profileId]);
    await dst.store.commit(); // live state changes after the preview
    const changed = await failure(
      dst.recovery.confirmRestore({ operationId: randomUUID(), previewId: first.id, archiveHash: first.archiveHash, confirmation: first.confirmation, trustImportedProvenance: false }),
    );
    expect([changed.code, changed.status]).toEqual(['LIVE_STATE_CHANGED', 409]);
    expect(snapshotState(dst.store)).toMatchObject({ id: dst.profileId, epoch: 3, seq: before.seq + 1 });
    expect(dst.store.maintenance().on).toBe(false);
    expect(runtimeLeftovers(dst.store)).toEqual([]);

    const second = await previewOf(dst, archive);
    const operationId = randomUUID();
    const outcome = await dst.recovery.confirmRestore({ operationId, previewId: second.id, archiveHash: second.archiveHash, confirmation: second.confirmation, trustImportedProvenance: false });
    expect(outcome).toEqual({ operationId, newEpoch: 4, archiveHash: second.archiveHash, profileId: src.profileId });
    expect(dst.store.maintenance().on).toBe(false);
    const p = dst.store.profile();
    expect([p.id, p.epoch]).toEqual([src.profileId, 4]);
    expect(dst.store.lastEventSeq()).toBe(src.store.lastEventSeq());
    for (const t of PORTABLE_TABLES) {
      if (t === 'profiles' || t === 'backup_records' || t === 'import_attestations') continue;
      expect(rowsOf(dst.store.db(), t), t).toEqual(rowsOf(src.store.db(), t));
    }
    const marker = dst.store.db().prepare('SELECT last_restore_operation_id AS op, last_restore_archive_hash AS h FROM profiles').get();
    expect(marker).toEqual({ op: operationId, h: second.archiveHash });
    for (const t of ['auth_tokens', 'owner_sessions']) expect(rowsOf(dst.store.db(), t)).toEqual([]);
    const att = dst.store.db().prepare('SELECT * FROM import_attestations').all() as Array<{ source_trust: string; operation_id: string; unverified_receipt_count: number }>;
    expect(att).toHaveLength(1);
    expect(att[0]).toMatchObject({ source_trust: 'verified-key', operation_id: operationId, unverified_receipt_count: 0 });
    // Pre-restore backup and rollback slot are registered in the new profile; the new profile got its own daily.
    const kinds = (dst.store.db().prepare("SELECT kind, reason, profile_epoch FROM backup_records WHERE state = 'verified'").all() as Array<{ kind: string; reason: string; profile_epoch: number }>);
    expect(kinds.some((k) => k.kind === 'pre-change' && k.profile_epoch === 3)).toBe(true);
    expect(kinds.some((k) => k.kind === 'rollback' && k.profile_epoch === 3)).toBe(true);
    expect(kinds.some((k) => k.kind === 'daily' && k.profile_epoch === 4)).toBe(true);
    expect(existsSync(dst.store.paths.journal)).toBe(false);
    expect(runtimeLeftovers(dst.store)).toEqual([]);
  });

  it('requires explicit source trust for receipts signed by an unknown key and records imported evidence', async () => {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({ epoch: 2 }); // fresh installation: no review key
    const pv = await previewOf(dst, archive);
    expect(pv.requiresSourceTrust).toBe(true);
    expect(pv.unverifiedHistoricalReceiptCount).toBe(3);
    const base = { previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation };
    const denied = await failure(dst.recovery.confirmRestore({ ...base, operationId: randomUUID(), trustImportedProvenance: false }));
    expect([denied.code, denied.status]).toEqual(['SOURCE_TRUST_REQUIRED', 422]);
    expect(dst.store.profile().id).toBe(dst.profileId);
    const outcome = await dst.recovery.confirmRestore({ ...base, operationId: randomUUID(), trustImportedProvenance: true });
    expect(outcome.newEpoch).toBe(3);
    const att = dst.store.db().prepare('SELECT source_trust, unverified_receipt_count, details FROM import_attestations').get() as { source_trust: string; unverified_receipt_count: number; details: string };
    expect(att.source_trust).toBe('imported-unverified');
    expect(att.unverified_receipt_count).toBe(3);
    expect(JSON.parse(att.details)).toMatchObject({ evidence: 'imported-historical', trustImportedProvenance: true });
    // Imported phrases/history stay usable.
    expect((dst.store.db().prepare('SELECT count(*) AS n FROM phrase_records').get() as { n: number }).n).toBe(1);
  });

  it('keeps the outcome marker for a lost response and never restores twice from one confirmation', async () => {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({ epoch: 1 });
    const pv = await previewOf(dst, archive);
    const input = { operationId: randomUUID(), previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true };
    await dst.recovery.confirmRestore(input);
    // "Lost response": a new process reads only the private outcome marker of the profile on disk.
    dst.store.dispose();
    const again = reopenHome(dst);
    const marker = again.store.db().prepare('SELECT last_restore_operation_id AS op, last_restore_archive_hash AS h, epoch FROM profiles').get();
    expect(marker).toEqual({ op: input.operationId, h: pv.archiveHash, epoch: 2 });
    const replay = await failure(again.recovery.confirmRestore(input));
    expect([replay.code, replay.status]).toEqual(['RESTORE_PREVIEW_UNKNOWN', 409]);
    expect(again.store.profile().epoch).toBe(2);
  });

  it('carries pack files and private assets only in a self-contained export and places them on restore', async () => {
    const src = makeHome();
    const media = Buffer.from('ID3 synthetic audio bytes, not a real clip');
    const mediaSha = sha(media);
    const privateAudio = Buffer.from('ID3 synthetic private recording placeholder');
    const privateSha = sha(privateAudio);
    const packDir = join(src.store.paths.packs, 'sll-synthetic', '0.0.1');
    mkdirSync(join(packDir, 'media'), { recursive: true });
    writeFileSync(join(packDir, 'media', `${mediaSha}.mp3`), media);
    const packJson = Buffer.from(JSON.stringify({ packId: 'sll-synthetic', version: '0.0.1', synthetic: true, files: [{ path: `media/${mediaSha}.mp3`, sha256: mediaSha, bytes: media.length }] }));
    writeFileSync(join(packDir, 'pack.json'), packJson);
    mkdirSync(join(src.store.paths.assets, 'private'), { recursive: true });
    writeFileSync(join(src.store.paths.assets, 'private', `${privateSha}.mp3`), privateAudio);
    const now = src.clock.now().toISOString();
    const db = src.store.db();
    db.prepare("INSERT INTO packs (pack_id, version, manifest_sha256, manifest, state, installed_at) VALUES ('sll-synthetic', '0.0.1', ?, ?, 'active', ?)").run(sha(packJson), packJson.toString(), now);
    db.prepare("INSERT INTO assets (sha256, mime, bytes, rel_path, created_at) VALUES (?, 'audio/mpeg', ?, ?, ?)").run(mediaSha, media.length, `packs/sll-synthetic/0.0.1/media/${mediaSha}.mp3`, now);
    db.prepare("INSERT INTO assets (sha256, mime, bytes, rel_path, created_at) VALUES (?, 'audio/mpeg', ?, ?, ?)").run(privateSha, privateAudio.length, `private/${privateSha}.mp3`, now);
    db.prepare("INSERT INTO assets (sha256, mime, bytes, rel_path, created_at) VALUES (?, 'audio/mpeg', 7, 'private/missing.mp3', ?)").run('d'.repeat(64), now);

    const lean = await readZip((await src.recovery.exportProfile({ selfContained: false })).path);
    const leanManifest = JSON.parse(lean.get('manifest.json')!.toString()) as ExportManifest;
    expect(leanManifest.packs).toEqual([{ packId: 'sll-synthetic', version: '0.0.1', manifestSha256: sha(packJson), state: 'active', required: true, included: false }]);
    expect(leanManifest.files.map((f) => f.path)).toEqual([`assets/${privateSha}`]);
    expect(leanManifest.missingAssets).toEqual(['d'.repeat(64)]);

    const dst = makeHome({ epoch: 1, seed: false });
    const missing = await failure(previewOf(dst, await writeZip(lean)));
    expect([missing.code, missing.status]).toEqual(['MISSING_PACK', 422]);

    const fullBuf = await exportBuffer(src, true);
    const pv = await previewOf(dst, fullBuf);
    expect(pv.missingAssets).toEqual(['d'.repeat(64)]);
    await dst.recovery.confirmRestore({ operationId: randomUUID(), previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true });
    const placedPack = join(dst.store.paths.packs, 'sll-synthetic', '0.0.1');
    expect(readFileSync(join(placedPack, 'pack.json'))).toEqual(packJson);
    expect(readFileSync(join(placedPack, 'media', `${mediaSha}.mp3`))).toEqual(media);
    expect(readFileSync(join(dst.store.paths.assets, 'private', `${privateSha}.mp3`))).toEqual(privateAudio);
  });

  it('never sweeps temp files of concurrent work during a preview; orphans are removed only at startup', async () => {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({ epoch: 2 });
    // Stand-ins for an export copy and a preview shadow that another in-flight operation still owns.
    const exportTemp = join(dst.store.paths.runtime, `export-${randomUUID()}.sqlite`);
    const shadowTemp = join(dst.store.paths.runtime, `shadow-${randomUUID()}.sqlite`);
    writeFileSync(exportTemp, 'in-flight export copy');
    writeFileSync(shadowTemp, 'in-flight preview shadow');
    await previewOf(dst, archive);
    expect(existsSync(exportTemp)).toBe(true);
    expect(existsSync(shadowTemp)).toBe(true);
    await dst.recovery.prepare(); // startup: nothing can own them any more
    expect(existsSync(exportTemp)).toBe(false);
    expect(existsSync(shadowTemp)).toBe(false);
  });

  it('aborts safely on epoch overflow before anything is replaced', async () => {
    const src = makeHome({ epoch: Number.MAX_SAFE_INTEGER });
    const archive = await exportBuffer(src);
    const dst = makeHome({ epoch: 5 });
    const before = snapshotState(dst.store);
    const pv = await previewOf(dst, archive);
    const err = await failure(dst.recovery.confirmRestore({ operationId: randomUUID(), previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true }));
    expect([err.code, err.status]).toEqual(['EPOCH_OVERFLOW', 422]);
    expect(snapshotState(dst.store)).toEqual(before);
    expect(dst.store.maintenance().on).toBe(false);
    expect(existsSync(dst.store.paths.journal)).toBe(false);
  });
});

describe('restore failures (A-07)', () => {
  async function crashAt(point: string): Promise<{ dst: Home; before: ReturnType<typeof snapshotState> }> {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({
      epoch: 2,
      recovery: {
        faults: (p) => {
          if (p === point) throw new SimulatedCrash(p);
        },
      },
    });
    await dst.store.commit();
    const before = snapshotState(dst.store);
    const pv = await previewOf(dst, archive);
    await expect(
      dst.recovery.confirmRestore({ operationId: randomUUID(), previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true }),
    ).rejects.toBeInstanceOf(SimulatedCrash);
    expect(existsSync(dst.store.paths.journal)).toBe(true);
    dst.store.dispose(); // the process died
    return { dst, before };
  }

  for (const point of ['restore:before-switch', 'restore:after-live-moved', 'restore:after-switch']) {
    it(`recovers the verified old profile after a crash at ${point}`, async () => {
      const { dst, before } = await crashAt(point);
      expect(recoverJournalIfNeeded(dst.store.paths)).toMatchObject({ action: 'rolled-back' });
      const restarted = reopenHome(dst);
      expect(snapshotState(restarted.store)).toEqual(before);
      expect(restarted.store.db().pragma('quick_check', { simple: true })).toBe('ok');
      expect(existsSync(restarted.store.paths.journal)).toBe(false);
      expect(listDir(restarted.store.paths.backups).filter((f) => f.startsWith('rollback-'))).toEqual([]);
      expect(runtimeLeftovers(restarted.store)).toEqual([]);
      expect(recoverJournalIfNeeded(restarted.store.paths)).toEqual({ action: 'none' });
      await restarted.recovery.start();
      await restarted.recovery.stop();
    });
  }

  it('keeps the committed new profile after a crash between commit and cleanup', async () => {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({
      epoch: 2,
      recovery: {
        faults: (p) => {
          if (p === 'restore:after-commit') throw new SimulatedCrash(p);
        },
      },
    });
    const pv = await previewOf(dst, archive);
    const operationId = randomUUID();
    await expect(
      dst.recovery.confirmRestore({ operationId, previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true }),
    ).rejects.toBeInstanceOf(SimulatedCrash);
    dst.store.dispose();
    expect(recoverJournalIfNeeded(dst.store.paths)).toEqual({ action: 'completed', operationId });
    const restarted = reopenHome(dst);
    const p = restarted.store.profile();
    expect([p.id, p.epoch]).toEqual([src.profileId, 3]);
    expect(restarted.store.db().prepare('SELECT last_restore_operation_id AS op FROM profiles').get()).toEqual({ op: operationId });
    expect(existsSync(restarted.store.paths.journal)).toBe(false);
    // The next start registers the rollback slot and pre-restore backup it finds on disk.
    await restarted.recovery.start();
    const kinds = restarted.store.db().prepare("SELECT kind FROM backup_records WHERE state = 'verified'").all() as Array<{ kind: string }>;
    expect(kinds.map((k) => k.kind)).toEqual(expect.arrayContaining(['rollback', 'pre-change', 'daily']));
    expect(runtimeLeftovers(restarted.store)).toEqual([]);
    await restarted.recovery.stop();
  });

  it('rolls back in-process when the reopened profile fails verification, then leaves maintenance', async () => {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({
      epoch: 2,
      recovery: {
        faults: (p) => {
          if (p === 'restore:verify-reopen') throw new Error('injected reopen verification failure');
        },
      },
    });
    const before = snapshotState(dst.store);
    const pv = await previewOf(dst, archive);
    const err = await failure(dst.recovery.confirmRestore({ operationId: randomUUID(), previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true }));
    expect([err.code, err.status]).toEqual(['RESTORE_FAILED', 503]);
    expect(snapshotState(dst.store)).toEqual(before);
    expect(dst.store.maintenance().on).toBe(false);
    expect(existsSync(dst.store.paths.journal)).toBe(false);
    expect(runtimeLeftovers(dst.store)).toEqual([]);
    expect(dst.store.reopenCount).toBe(2); // new profile reopened, then the old one
  });

  it('blocks the restore when the pre-restore backup cannot be verified', async () => {
    const src = makeHome();
    const archive = await exportBuffer(src);
    const dst = makeHome({
      epoch: 2,
      recovery: {
        faults: (p, ctx) => {
          if (p === 'backup:before-verify' && ctx.kind === 'pre-change' && ctx.path) writeFileSync(ctx.path, 'not a database');
        },
      },
    });
    const before = snapshotState(dst.store);
    const pv = await previewOf(dst, archive);
    const err = await failure(dst.recovery.confirmRestore({ operationId: randomUUID(), previewId: pv.id, archiveHash: pv.archiveHash, confirmation: pv.confirmation, trustImportedProvenance: true }));
    expect([err.code, err.status, err.retryable]).toEqual(['PRE_RESTORE_BACKUP_FAILED', 503, true]);
    expect(snapshotState(dst.store)).toEqual(before);
    expect(dst.store.maintenance().on).toBe(false);
    expect(dst.store.closeCount).toBe(0);
    expect(runtimeLeftovers(dst.store)).toEqual([]);
  });

  describe('rejects hostile or broken archives before anything is replaced', () => {
    const hex = 'c'.repeat(64);
    const one = (name: string, extra: Partial<{ mode: number }> = {}) => rawZip([{ name, data: Buffer.from('x'), ...extra }]);
    const cases: Array<[string, () => Buffer, string, number]> = [
      ['path traversal', () => one('../evil'), 'ARCHIVE_UNSAFE_PATH', 422],
      ['absolute path', () => one('/etc/evil'), 'ARCHIVE_UNSAFE_PATH', 422],
      ['backslash path', () => one('tables\\drafts.ndjson'), 'ARCHIVE_UNSAFE_PATH', 422],
      ['symbolic link', () => one(`assets/${hex}`, { mode: 0o120777 }), 'ARCHIVE_SYMLINK', 422],
      ['executable entry', () => one(`assets/${hex}`, { mode: 0o100755 }), 'ARCHIVE_EXECUTABLE_ENTRY', 422],
      ['duplicate entries', () => rawZip([{ name: 'manifest.json', data: Buffer.from('{}') }, { name: 'manifest.json', data: Buffer.from('{}') }]), 'ARCHIVE_DUPLICATE_ENTRY', 422],
      ['case collision', () => rawZip([{ name: 'manifest.json', data: Buffer.from('{}') }, { name: 'MANIFEST.json', data: Buffer.from('{}') }]), 'ARCHIVE_CASE_COLLISION', 422],
      ['unknown entry', () => one('scripts/run.sh'), 'ARCHIVE_UNKNOWN_ENTRY', 422],
      ['path over 240 bytes', () => one(`packs/p/v/${'a'.repeat(240)}`), 'ARCHIVE_PATH_TOO_LONG', 422],
      ['not a ZIP', () => Buffer.from('definitely not a zip archive'), 'ARCHIVE_NOT_ZIP', 422],
      [
        'entry larger than declared (bomb)',
        () => rawZip([{ name: 'manifest.json', data: Buffer.alloc(3 * 1024 * 1024, 0x20), deflate: true, declaredSize: 1000 }]),
        'ARCHIVE_SIZE_MISMATCH',
        422,
      ],
    ];
    for (const [label, build, code, status] of cases) {
      it(label, async () => {
        const dst = makeHome({ epoch: 2 });
        const before = snapshotState(dst.store);
        const err = await failure(previewOf(dst, build()));
        expect([err.code, err.status]).toEqual([code, status]);
        expect(snapshotState(dst.store)).toEqual(before);
        expect(runtimeLeftovers(dst.store)).toEqual([]);
        expect(listDir(dst.store.paths.uploads)).toEqual([]);
      });
    }

    it('enforces entry-count, expansion and upload-size bounds', async () => {
      const tiny = makeHome({ recovery: { limits: { maxEntries: 3, maxExpandedBytes: 1024 * 1024, maxCompressedBytes: 64 * 1024 } } });
      const four = rawZip([0, 1, 2, 3].map((i) => ({ name: `assets/${String(i).repeat(64)}`, data: Buffer.from('x') })));
      expect((await failure(previewOf(tiny, four))).code).toBe('ARCHIVE_TOO_MANY_ENTRIES');
      const bomb = rawZip([{ name: 'tables/event_log.ndjson', data: Buffer.alloc(3 * 1024 * 1024), deflate: true }]);
      expect(bomb.length).toBeLessThan(64 * 1024);
      const big = await failure(previewOf(tiny, bomb));
      expect([big.code, big.status]).toEqual(['ARCHIVE_TOO_LARGE', 413]);
      const large = await failure(previewOf(tiny, Buffer.alloc(100 * 1024, 1)));
      expect([large.code, large.status]).toEqual(['UPLOAD_TOO_LARGE', 413]);
      expect(listDir(tiny.store.paths.uploads)).toEqual([]);
    });

    it('rejects tampered, incomplete, future-schema and reference-breaking exports', async () => {
      const src = makeHome();
      const good = await readZip((await src.recovery.exportProfile({ selfContained: false })).path);
      const dst = makeHome({ epoch: 2 });
      const before = snapshotState(dst.store);
      const variant = async (mutate: (e: Map<string, Buffer>) => Promise<Buffer> | Buffer): Promise<RecoveryError> =>
        failure(previewOf(dst, await mutate(new Map([...good].map(([k, v]) => [k, Buffer.from(v)])))));

      expect((await variant((e) => rebuildManifest(e, (m) => (m.schemaVersion = 99)))).code).toBe('UNSUPPORTED_FUTURE_SCHEMA');
      expect(
        (
          await variant((e) => {
            const t = e.get('tables/drafts.ndjson')!.toString('utf8').replace('synthetic private draft', 'synthetic private drafT');
            e.set('tables/drafts.ndjson', Buffer.from(t));
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_DIGEST_MISMATCH');
      expect(
        (
          await variant((e) => {
            e.delete('tables/drafts.ndjson');
            return rebuildManifest(e, (m) => (m.tables = m.tables.filter((t) => t.name !== 'drafts')));
          })
        ).code,
      ).toBe('ARCHIVE_MISSING_TABLE');
      expect(
        (
          await variant((e) => {
            e.delete('tables/drafts.ndjson');
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_MISSING_ENTRY');
      expect(
        (
          await variant((e) => {
            e.set(`assets/${'e'.repeat(64)}`, Buffer.from('undeclared'));
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_UNKNOWN_ENTRY');
      expect(
        (
          await variant((e) => rebuildManifest(e, (m) => (m.files = [{ path: `assets/${'f'.repeat(64)}`, sha256: 'f'.repeat(64), bytes: 3, role: 'asset' }])))
        ).code,
      ).toBe('ARCHIVE_MISSING_ENTRY');
      expect(
        (
          await variant((e) => {
            retable(e, 'drafts', (r) => ({ ...r, context_id: randomUUID() }));
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_FOREIGN_KEY');
      expect(
        (
          await variant((e) => {
            retable(e, 'drafts', (r) => ({ ...r, injected: 'DROP TABLE drafts' }));
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_ROW_INVALID');
      expect(
        (
          await variant((e) => {
            retable(e, 'attempts', (r) => ({ ...r, status: 'graded-by-archive' }));
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_ROW_INVALID');
      // Credentials can never be smuggled in: non-portable tables are not valid archive entries.
      expect(
        (
          await variant((e) => {
            e.set('tables/auth_tokens.ndjson', Buffer.from('{}\n'));
            return writeZip(e);
          })
        ).code,
      ).toBe('ARCHIVE_UNKNOWN_ENTRY');
      expect(snapshotState(dst.store)).toEqual(before);
      expect(runtimeLeftovers(dst.store)).toEqual([]);
    });
  });
});
