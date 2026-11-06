// content/source/blocks.json: loaded and validated as exactly the 14 ledger blocks, emitted into
// pack.json `blocks`; a preview pack with dangling references installs with warnings, a ready one fails.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_LEDGER_PATH, loadCorpus } from '../../tools/content/load.ts';
import { loadLedger } from '../../tools/content/ledger.ts';
import { validateCorpus } from '../../tools/content/validate.ts';
import { installPack, PackInstallError } from '../../apps/server/src/content/install.ts';
import { openProfileStore } from '../../apps/server/src/store/profile-store.ts';
import { buildSyntheticPack } from '../fixtures/pack-synthetic/build-pack.ts';

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe('course blocks', () => {
  it('content/source/blocks.json holds exactly the 14 ledger blocks and passes validation', () => {
    const { corpus, issues } = loadCorpus();
    expect(issues.filter((i) => i.file === 'blocks.json')).toEqual([]);
    const ids = corpus.blocks.map((b) => b.id).sort();
    const ledger = loadLedger(DEFAULT_LEDGER_PATH);
    expect(ids).toEqual([...ledger.blocks].sort());
    expect(ids).toHaveLength(14);
    const report = validateCorpus(corpus, ledger);
    expect([...report.errors, ...report.warnings].filter((e) => e.code.startsWith('blocks.'))).toEqual([]);
    for (const b of corpus.blocks) expect(b.titleUk.length).toBeGreaterThan(0);
  });

  it('a preview pack with dangling references installs with warnings; the same ready pack is refused', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sll-blk-'));
    dirs.push(root);
    const dangling = (e: any) => (e.skills.find((s: any) => s.skillId === 'shop.more').firstLesson = 'A1-05-L9');
    const store = openProfileStore({ root: join(root, 'home') });
    try {
      const ready = buildSyntheticPack(join(root, 'ready'), { mutate: dangling });
      const err = await installPack(store, ready.dir).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(PackInstallError);
      expect((err as PackInstallError).code).toBe('REFERENCE');
      const preview = buildSyntheticPack(join(root, 'preview'), { preview: true, mutate: dangling });
      const res = await installPack(store, preview.dir, { allowPreview: true });
      expect(res.outcome).toBe('activated');
      expect(res.warnings).toEqual(['REFERENCE: skill shop.more firstLesson A1-05-L9']);
      const manifest = JSON.parse(readFileSync(join(preview.dir, 'pack.json'), 'utf8'));
      expect(manifest.blocks.map((b: any) => b.id)).toEqual(['A1-05', 'A2-03']);
      expect(store.db().prepare("SELECT id, title_uk FROM curriculum_nodes WHERE kind = 'block' ORDER BY id").all()).toEqual(manifest.blocks.map((b: any) => ({ id: b.id, title_uk: b.titleUk })));
    } finally {
      store.close();
    }
  });
});
