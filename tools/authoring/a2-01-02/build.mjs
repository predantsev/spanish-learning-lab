// Writes the committed JSON of range a2-01-02 from the per-lesson spec modules.
// Usage: node tools/authoring/a2-01-02/build.mjs [lessonId …]   (default: every module in LESSONS)
// A regenerated entity keeps the reviewStatus already on disk when its content (without
// reviewStatus) is unchanged, so review/apply results survive a rebuild; any content change resets
// it to the module's value (draft).
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { nfc } from './lib.mjs';

const ROOT = new URL('../../../', import.meta.url).pathname;
const SRC = join(ROOT, 'content', 'source');

export const LESSONS = [
  'A2-01-L1', 'A2-01-L2', 'A2-01-L3', 'A2-01-L4', 'A2-01-L5', 'A2-01-L6', 'A2-01-L7', 'A2-01-C1',
  'A2-02-L1', 'A2-02-L2', 'A2-02-L3', 'A2-02-L4', 'A2-02-L5', 'A2-02-L6', 'A2-02-L7', 'A2-02-L8', 'A2-02-C1',
];

const stable = (v) => {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])]));
  return v;
};
const bodyKey = (entity) => {
  const { reviewStatus, ...rest } = entity;
  return JSON.stringify(stable(rest));
};
const readIfExists = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined);
const keepStatus = (fresh, old) => (old && bodyKey(old) === bodyKey(fresh) ? { ...fresh, reviewStatus: old.reviewStatus } : fresh);
const write = (path, data) => {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

const requested = process.argv.slice(2);
const available = [];
for (const id of LESSONS) if (existsSync(join(ROOT, 'tools', 'authoring', 'a2-01-02', 'lessons', `${id}.mjs`))) available.push(id);
const ids = requested.length ? requested : available;

const clipsByBlock = new Map();
const materialsByBlock = new Map();
for (const id of available) {
  const mod = await import(`./lessons/${id}.mjs`);
  const block = id.slice(0, 5);
  for (const c of mod.clips ?? []) clipsByBlock.set(block, [...(clipsByBlock.get(block) ?? []), nfc(c)]);
  for (const m of mod.materials ?? []) materialsByBlock.set(block, [...(materialsByBlock.get(block) ?? []), nfc(m)]);
  if (!ids.includes(id)) continue;
  const lessonPath = join(SRC, 'lessons', `${id}.json`);
  write(lessonPath, keepStatus(nfc(mod.lesson), readIfExists(lessonPath)));
  const taskPath = join(SRC, 'tasks', `${id}.json`);
  const oldTasks = new Map((readIfExists(taskPath)?.tasks ?? []).map((t) => [t.id, t]));
  const tasks = mod.tasks.map((t) => keepStatus(nfc(t), oldTasks.get(t.id)));
  write(taskPath, { schemaVersion: 1, lessonId: id, tasks });
  console.log(`${id}: lesson + ${tasks.length} task(s)`);
}
for (const [block, clips] of clipsByBlock) {
  const path = join(SRC, 'audio', `${block}.json`);
  const old = new Map((readIfExists(path)?.clips ?? []).map((c) => [c.id, c]));
  write(path, { schemaVersion: 1, blockId: block, clips: clips.map((c) => keepStatus(c, old.get(c.id))) });
  console.log(`${block}: ${clips.length} clip(s)`);
}
for (const [block, materials] of materialsByBlock) {
  const path = join(SRC, 'materials', `${block}.json`);
  const old = new Map((readIfExists(path)?.materials ?? []).map((m) => [m.id, m]));
  write(path, { schemaVersion: 1, blockId: block, materials: materials.map((m) => keepStatus(m, old.get(m.id))) });
  console.log(`${block}: ${materials.length} material(s)`);
}

// Bank stats per skill targeted by the built lessons (productive modalities only, like the validator).
const PRODUCTIVE = new Set(['written-form', 'construction-use']);
const stats = new Map();
for (const id of available) {
  const data = readIfExists(join(SRC, 'tasks', `${id}.json`));
  for (const t of data?.tasks ?? []) {
    for (const x of t.targets) {
      const k = `${x.skillId}/${x.modality}`;
      const s = stats.get(k) ?? { total: 0, supported: 0, independent: 0, held: 0, fam: new Set(), modes: new Set() };
      s.total++;
      if (t.role === 'supported') s.supported++;
      else if (t.role === 'independent') s.independent++;
      else s.held++;
      s.fam.add(t.family);
      s.modes.add(t.mode);
      stats.set(k, s);
    }
  }
}
if (process.env.BANKS) {
  for (const [k, s] of [...stats.entries()].sort()) {
    const flag = PRODUCTIVE.has(k.split('/')[1]) && (s.total < 8 || s.total > 12 || s.supported < 2 || s.independent < 4 || s.held < 4 || s.fam.size < 2) ? '  <-- check' : '';
    console.log(`${k}: ${s.total} (s${s.supported}/i${s.independent}/h${s.held}) fam ${s.fam.size} modes ${[...s.modes].join(',')}${flag}`);
  }
}
