// Changes only the `reviewStatus` field of entities in content/source files. Files are re-written
// as 2-space JSON (parse → set field → stringify); no content text is ever edited. After writing,
// the content hash of every touched entity is re-checked to prove only the status changed.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { entityHash, loadCorpus } from '../content/load.ts';
import type { AnyRecord } from '../content/load.ts';
import type { EntityKind, ReviewStatus } from '../content/types.ts';

const CONTAINER: Record<EntityKind, string | null> = {
  lesson: null,
  task: 'tasks',
  skill: 'skills',
  lexeme: 'items',
  clip: 'clips',
  phrase: 'phrases',
  collection: 'collections',
  material: 'materials',
  situation: 'situations',
  source: 'sources',
};

const ID_FIELD: Record<EntityKind, string> = {
  lesson: 'id',
  task: 'id',
  skill: 'skillId',
  lexeme: 'id',
  clip: 'id',
  phrase: 'id',
  collection: 'id',
  material: 'id',
  situation: 'id',
  source: 'id',
};

export interface StatusUpdate {
  record: AnyRecord;
  status: ReviewStatus;
}

export function setReviewStatuses(sourceDir: string, updates: StatusUpdate[]): void {
  const byFile = new Map<string, StatusUpdate[]>();
  for (const u of updates) {
    if (u.record.kind === 'source') throw new Error('sources have no review status');
    byFile.set(u.record.file, [...(byFile.get(u.record.file) ?? []), u]);
  }
  const before = new Map(updates.map((u) => [`${u.record.kind}|${u.record.id}`, entityHash(u.record)]));
  for (const [file, list] of byFile) {
    const path = join(sourceDir, file);
    const root = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    for (const { record, status } of list) {
      const container = CONTAINER[record.kind];
      const entity = (container === null ? root : (root[container] as Array<Record<string, unknown>> | undefined)?.[record.index]) as Record<string, unknown> | undefined;
      if (!entity || entity[ID_FIELD[record.kind]] !== record.id) throw new Error(`${file}: ${record.kind} ${record.id} is no longer at position ${record.index}; reload and retry`);
      entity.reviewStatus = status;
    }
    writeFileSync(path, `${JSON.stringify(root, null, 2)}\n`);
  }
  const { corpus } = loadCorpus({ sourceDir });
  const lists: AnyRecord[][] = [corpus.lessons, corpus.tasks, corpus.skills, corpus.lexemes, corpus.clips, corpus.phrases, corpus.collections, corpus.materials, corpus.situations];
  for (const u of updates) {
    const now = lists.flat().find((r) => r.kind === u.record.kind && r.id === u.record.id);
    if (!now || entityHash(now) !== before.get(`${u.record.kind}|${u.record.id}`)) {
      throw new Error(`content hash of ${u.record.kind} ${u.record.id} changed while setting its status`);
    }
    if ((now.body as { reviewStatus?: string }).reviewStatus !== u.status) throw new Error(`status of ${u.record.kind} ${u.record.id} was not written`);
  }
}
