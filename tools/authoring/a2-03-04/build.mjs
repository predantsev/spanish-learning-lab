// Writes the authored A2-03/A2-04 content to content/source as concrete 2-space JSON.
// Usage: node tools/authoring/a2-03-04/build.mjs [--check]
//   --check  write nothing; exit 1 when a generated file differs from the committed one.
// Review states survive a rebuild only for items whose canonical body (without reviewStatus) is
// unchanged; any content edit returns the item to draft (content/README.md rule 8).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', '..', '..', 'content', 'source');
const CHECK = process.argv.includes('--check');

/** Lesson modules in course order. Each default-exports { lesson, tasks, clips?, materials? }. */
const MODULES = [
  'a2-03-l1.mjs',
  'a2-03-l2.mjs',
  'a2-03-l3.mjs',
  'a2-03-l4.mjs',
  'a2-03-l5.mjs',
  'a2-03-l6.mjs',
  'a2-03-l7.mjs',
  'a2-03-c1.mjs',
  'a2-04-l1.mjs',
  'a2-04-l2.mjs',
  'a2-04-l3.mjs',
  'a2-04-l4.mjs',
  'a2-04-l5.mjs',
  'a2-04-l6.mjs',
  'a2-04-l7.mjs',
  'a2-04-l8.mjs',
];

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
    .join(',')}}`;
}
const body = (item) => {
  const { reviewStatus: _ignored, ...rest } = item;
  return canonical(rest);
};

function readExisting(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
}

/** Keep the previous reviewStatus of items whose content is unchanged. */
function preserve(items, previous) {
  const old = new Map((previous ?? []).map((x) => [x.id, x]));
  for (const item of items) {
    const before = old.get(item.id);
    if (before && body(before) === body(item) && before.reviewStatus) item.reviewStatus = before.reviewStatus;
  }
  return items;
}

let differences = 0;
function emit(relPath, value) {
  const path = join(SRC, relPath);
  const text = `${JSON.stringify(value, null, 2)}\n`;
  const current = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  if (current === text) return;
  differences++;
  if (CHECK) {
    console.log(`differs: ${relPath}`);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  console.log(`wrote ${relPath}`);
}

const clipsByBlock = new Map();
const materialsByBlock = new Map();
const seenTaskIds = new Set();
for (const name of MODULES) {
  const mod = (await import(join(HERE, name))).default;
  const { lesson, tasks } = mod;
  for (const t of tasks) {
    if (seenTaskIds.has(t.id)) throw new Error(`duplicate task id ${t.id}`);
    seenTaskIds.add(t.id);
    if (t.lessonId !== lesson.id) throw new Error(`${t.id} belongs to ${t.lessonId}, module ${name} is ${lesson.id}`);
  }
  const lessonPath = `lessons/${lesson.id}.json`;
  const prevLesson = readExisting(join(SRC, lessonPath));
  preserve([lesson], prevLesson ? [prevLesson] : []);
  emit(lessonPath, lesson);
  if (tasks.length > 0) {
    const taskPath = `tasks/${lesson.id}.json`;
    const prevTasks = readExisting(join(SRC, taskPath));
    emit(taskPath, { schemaVersion: 1, lessonId: lesson.id, tasks: preserve(tasks, prevTasks?.tasks) });
  }
  const block = lesson.blockId;
  for (const c of mod.clips ?? []) clipsByBlock.set(block, [...(clipsByBlock.get(block) ?? []), c]);
  for (const m of mod.materials ?? []) materialsByBlock.set(block, [...(materialsByBlock.get(block) ?? []), m]);
}
for (const [block, clips] of clipsByBlock) {
  const path = `audio/${block}.json`;
  const prev = readExisting(join(SRC, path));
  emit(path, { schemaVersion: 1, blockId: block, clips: preserve(clips, prev?.clips) });
}
for (const [block, materials] of materialsByBlock) {
  const path = `materials/${block}.json`;
  const prev = readExisting(join(SRC, path));
  emit(path, { schemaVersion: 1, blockId: block, materials: preserve(materials, prev?.materials) });
}
if (CHECK && differences > 0) process.exit(1);
console.log(CHECK ? 'build check: up to date' : `build: ${differences} file(s) written`);
