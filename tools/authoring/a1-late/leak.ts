// Lint for held-out prompts: flags delayed/transfer tasks whose completed sentence (reference answer,
// accepted variants, or the prompt with the correct option filled in) already appears in a lesson
// step or material of the range. Review r1 of A1-04-L1 rejected such items as "not held out".
//   node tools/authoring/a1-late/leak.ts [--lesson A1-05-L4]
import type { Block, Task } from '../../content/types.ts';
import { MODULES } from './lessons/index.ts';

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[¿¡.,!?;:«»"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function blockTexts(b: Block): string[] {
  const x = b as unknown as Record<string, unknown>;
  const out: string[] = [];
  for (const key of ['text', 'spanish']) if (typeof x[key] === 'string') out.push(x[key] as string);
  if (Array.isArray(x.items)) out.push(...(x.items as string[]));
  if (Array.isArray(x.rows)) for (const r of x.rows as string[][]) out.push(r.join(' '));
  return out;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|:\s+/)
    .map(norm)
    .filter((s) => s.split(' ').length >= 3);
}

function completions(t: Task): string[] {
  const out: string[] = [];
  if (t.referenceAnswer) out.push(t.referenceAnswer);
  for (const v of t.accepted ?? []) out.push(v.text);
  const gap = t.prompt.map((b) => (b as { text?: string }).text ?? '').find((s) => s.includes('___'));
  if (gap) {
    for (const o of t.options ?? []) if (Object.values(o.outcomes).every((v) => v === 'correct')) out.push(gap.replace(/___/, o.label).replace(/\(.*?\)/g, ''));
    for (const v of t.accepted ?? []) out.push(gap.replace(/___/, v.text).replace(/\(.*?\)/g, ''));
  }
  return out.flatMap(sentences);
}

const only = process.argv.includes('--lesson') ? process.argv[process.argv.indexOf('--lesson') + 1] : undefined;
const shown = new Map<string, string>();
for (const m of MODULES) {
  for (const s of m.lesson.steps) for (const b of s.blocks ?? []) for (const tx of blockTexts(b)) for (const sn of sentences(tx)) shown.set(sn, `${m.lesson.id}/${s.id}`);
  for (const mat of m.materials) for (const b of mat.blocks) for (const tx of blockTexts(b)) for (const sn of sentences(tx)) shown.set(sn, mat.id);
}
let n = 0;
for (const m of MODULES) {
  if (only && m.lesson.id !== only) continue;
  for (const t of m.tasks) {
    if (t.role !== 'delayed' && t.role !== 'transfer') continue;
    for (const c of new Set(completions(t))) {
      const where = shown.get(c);
      if (where) {
        n++;
        console.log(`${t.id}: «${c}» shown in ${where}`);
      }
    }
  }
}
console.log(`${n} leak(s)`);
