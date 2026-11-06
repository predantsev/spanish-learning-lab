// Writes the concrete content JSON of the a1-late range (A1-04…A1-06) from ./lessons/*.ts.
//   node tools/authoring/a1-late/build.ts [--source content/source] [--dry-run]
// Output: lessons/<id>.json, tasks/<id>.json, audio/<block>.json, materials/<block>.json and
// lexicon additions (append-only) for the lesson modules listed in ./lessons/index.ts.
// An entity whose content (everything except reviewStatus) is unchanged keeps its current
// reviewStatus, so review results written by tools/review are never regressed; any content
// change returns the entity to draft (content/README rule 8).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { canonicalJson } from '../../content/canonical.ts';
import { DEFAULT_SOURCE_DIR, flagString, parseArgs } from '../../content/load.ts';
import type { Clip, LexicalItem, LexiconFile, Material, ReviewStatus, Task } from '../../content/types.ts';
import type { LessonModule } from './lib.ts';
import { MODULES } from './lessons/index.ts';

interface Versioned {
  id: string;
  reviewStatus?: ReviewStatus;
}

function readJson<T>(path: string): T | undefined {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : undefined;
}

function bodyKey(item: Versioned): string {
  const { reviewStatus: _status, ...body } = item;
  return canonicalJson(body);
}

function previous(items: Versioned[] | undefined): Map<string, { key: string; status: ReviewStatus | undefined }> {
  return new Map((items ?? []).map((i) => [i.id, { key: bodyKey(i), status: i.reviewStatus }]));
}

function keepStatus<T extends Versioned>(item: T, prev: Map<string, { key: string; status: ReviewStatus | undefined }>): T {
  const p = prev.get(item.id);
  if (!p || p.status === undefined) return item;
  return bodyKey(item) === p.key ? { ...item, reviewStatus: p.status } : { ...item, reviewStatus: 'draft' };
}

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const sourceDir = flagString(flags, 'source') ?? DEFAULT_SOURCE_DIR;
  const dryRun = flags.has('dry-run');
  const written: string[] = [];
  const write = (rel: string, value: unknown): void => {
    const path = join(sourceDir, rel);
    const text = `${JSON.stringify(value, null, 2)}\n`;
    if (existsSync(path) && readFileSync(path, 'utf8') === text) return;
    written.push(rel);
    if (dryRun) return;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  };

  const byBlock = new Map<string, LessonModule[]>();
  for (const m of MODULES) byBlock.set(m.lesson.blockId, [...(byBlock.get(m.lesson.blockId) ?? []), m]);

  for (const m of MODULES) {
    const id = m.lesson.id;
    const prevLesson = readJson<Versioned>(join(sourceDir, `lessons/${id}.json`));
    write(`lessons/${id}.json`, keepStatus(m.lesson as unknown as Versioned, previous(prevLesson ? [prevLesson] : [])));
    const prevTasks = readJson<{ tasks: Task[] }>(join(sourceDir, `tasks/${id}.json`))?.tasks;
    const pt = previous(prevTasks as unknown as Versioned[]);
    write(`tasks/${id}.json`, { schemaVersion: 1, lessonId: id, tasks: m.tasks.map((t) => keepStatus(t as unknown as Versioned, pt)) });
  }

  for (const [blockId, modules] of byBlock) {
    const clips: Clip[] = modules.flatMap((m) => m.clips);
    if (clips.length > 0) {
      const prev = previous(readJson<{ clips: Clip[] }>(join(sourceDir, `audio/${blockId}.json`))?.clips as unknown as Versioned[]);
      write(`audio/${blockId}.json`, { schemaVersion: 1, blockId, clips: clips.map((c) => keepStatus(c as unknown as Versioned, prev)) });
    }
    const materials: Material[] = modules.flatMap((m) => m.materials);
    if (materials.length > 0) {
      const prev = previous(readJson<{ materials: Material[] }>(join(sourceDir, `materials/${blockId}.json`))?.materials as unknown as Versioned[]);
      write(`materials/${blockId}.json`, { schemaVersion: 1, blockId, materials: materials.map((x) => keepStatus(x as unknown as Versioned, prev)) });
    }
    const additions: LexicalItem[] = modules.flatMap((m) => m.lexicon);
    if (additions.length > 0) {
      const path = join(sourceDir, `lexicon/${blockId}.json`);
      const file = readJson<LexiconFile>(path);
      if (!file) throw new Error(`missing ${path}`);
      const ids = new Set(file.items.map((x) => x.id));
      const fresh = additions.filter((x) => !ids.has(x.id));
      if (fresh.length > 0) write(`lexicon/${blockId}.json`, { ...file, items: [...file.items, ...fresh] });
    }
  }
  console.log(`${dryRun ? 'would write' : 'wrote'} ${written.length} file(s)`);
  for (const rel of written) console.log(`  ${rel}`);
}

main();
