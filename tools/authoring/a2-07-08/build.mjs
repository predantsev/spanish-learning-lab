// Expands the A2-07/A2-08 authoring modules into content/source JSON.
//   node tools/authoring/a2-07-08/build.mjs [--only phrases|A2-07|A2-08]
// Output files (owned by this range): phrases.json, collections.json, lessons/A2-0{7,8}-*.json,
// tasks/A2-0{7,8}-*.json, audio/A2-0{7,8}.json, materials/A2-0{7,8}.json.
import { writeList, writeSingle } from './lib.mjs';
import { buildCollections, buildPhrases } from './phrases.mjs';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : undefined;
const results = [];

if (!only || only === 'phrases') {
  results.push(writeList('phrases.json', { schemaVersion: 1 }, 'phrases', buildPhrases()));
  results.push(writeList('collections.json', { schemaVersion: 1 }, 'collections', buildCollections()));
}

const blocks = [];
try {
  blocks.push(...(await import('./blocks.mjs')).BLOCKS);
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}
for (const block of blocks) {
  if (only && only !== 'phrases' && only !== block.blockId) continue;
  if (only === 'phrases') continue;
  for (const lesson of block.lessons) {
    results.push(writeSingle(`lessons/${lesson.lesson.id}.json`, lesson.lesson));
    results.push(writeList(`tasks/${lesson.lesson.id}.json`, { schemaVersion: 1, lessonId: lesson.lesson.id }, 'tasks', lesson.tasks));
  }
  if (block.clips.length) results.push(writeList(`audio/${block.blockId}.json`, { schemaVersion: 1, blockId: block.blockId }, 'clips', block.clips));
  if (block.materials.length) results.push(writeList(`materials/${block.blockId}.json`, { schemaVersion: 1, blockId: block.blockId }, 'materials', block.materials));
}

for (const r of results) console.log(`${r.rel}: ${r.count} item(s), ${r.kept} kept their review status`);
