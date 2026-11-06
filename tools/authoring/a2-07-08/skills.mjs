// Edits to existing skill rows of A2-07/A2-08 made during authoring (IDs never change).
// Idempotent: sets the listed fields; prints what changed.
//   node tools/authoring/a2-07-08/skills.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './lib.mjs';

const single = (form, inf) =>
  `Одна незмінна форма (${form}): 7 завдань в уроці A2-07-L4 (1 з підтримкою, 3 самостійні, 2 відкладені, 1 перенесення) і повернення в A2-07-C1, у кількох контекстах і двох типах завдань. Ще більше однотипних речень з однією формою ${inf} не дає нових доказів; форма повертається в L6–L8.`;

export const EDITS = {
  'A2-07': {
    'imperative.tu.decir': { bankJustificationUk: single('di', 'decir') },
    'imperative.tu.hacer': { bankJustificationUk: single('haz', 'hacer') },
    'imperative.tu.poner': { bankJustificationUk: single('pon', 'poner') },
    'imperative.tu.salir': { bankJustificationUk: single('sal', 'salir') },
    'imperative.tu.tener': { bankJustificationUk: single('ten', 'tener') },
    'imperative.tu.venir': { bankJustificationUk: single('ven', 'venir') },
    'imperative.tu.ir': { bankJustificationUk: single('ve', 'ir') },
  },
  'A2-08': {},
};

export function applyEdits() {
  const changed = [];
  for (const [block, edits] of Object.entries(EDITS)) {
    const path = join(SRC, 'skills', `${block}.json`);
    const json = JSON.parse(readFileSync(path, 'utf8'));
    for (const [skillId, fields] of Object.entries(edits)) {
      const skill = json.skills.find((s) => s.skillId === skillId);
      if (!skill) throw new Error(`unknown skill ${skillId}`);
      for (const [field, value] of Object.entries(fields)) {
        if (JSON.stringify(skill[field]) === JSON.stringify(value)) continue;
        // A content edit returns the row to draft (content/README rule 8); new optional fields are
        // inserted before reviewStatus so the key order stays readable.
        const { reviewStatus: _previous, ...rest } = skill;
        rest[field] = value;
        for (const key of Object.keys(skill)) delete skill[key];
        Object.assign(skill, rest, { reviewStatus: 'draft' });
        changed.push(`${skillId}.${field}`);
      }
    }
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  }
  return changed;
}

if (process.argv[1]?.endsWith('skills.mjs')) console.log(applyEdits().join('\n') || 'no skill edits');
