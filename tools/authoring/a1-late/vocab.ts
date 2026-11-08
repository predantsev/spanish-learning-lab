// Lexical gate helper (authoring aid, not a release gate): lists Spanish word tokens used in the
// a1-late lessons/tasks/clips that are not covered by a lexicon item, a skill scope form or a
// generated inflection taught no later than the lesson (content/README rule 1). Glossed words show
// up here too; the author decides whether the prompt glosses them.
//   node tools/authoring/a1-late/vocab.ts [--lesson A1-04-L1]
import { loadCorpus, flagString, parseArgs } from '../../content/load.ts';
import { compareLessons } from '../../content/ledger.ts';
import type { Block, Task } from '../../content/types.ts';
import { family, forms } from './lib.ts';

const WORD = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;
const CYRILLIC = /\p{Script=Cyrillic}/u;

/** Function words, names and formula words that need no lexicon row. */
const ALWAYS = new Set(
  (
    'el la los las un una unos unas lo al del de en a con y o e ni que qué no sí se me te le nos os les mi mis tu tus su sus ' +
    'yo tú él ella usted nosotros nosotras vosotros vosotras ellos ellas ustedes ' +
    'ana pablo marta luis carmen javier lucía lucia diego sofía sofia elena carlos laura sergio isabel jorge raquel pedro ' +
    'madrid valencia sevilla barcelona bilbao málaga granada salamanca kiev kyiv lviv ucrania españa toledo zaragoza ' +
    'mayor sol garcía garcia pérez perez lópez lopez martín martin'
  ).split(' '),
);

function variants(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>([w, `${w}s`, `${w}es`]);
  if (w.endsWith('z')) out.add(`${w.slice(0, -1)}ces`);
  if (w.endsWith('o')) for (const s of ['a', 'os', 'as']) out.add(w.slice(0, -1) + s);
  if (/(ón|és|án)$/.test(w)) {
    const plain = w.replace(/ón$/, 'on').replace(/és$/, 'es').replace(/án$/, 'an');
    out.add(`${plain}es`);
    out.add(`${plain}a`);
    out.add(`${plain}as`);
  }
  if (/(ar|er|ir)(se)?$/.test(w)) {
    try {
      family(w);
      for (const f of forms(w)) out.add(f);
    } catch {
      /* not a verb */
    }
  }
  return [...out];
}

function tokens(text: string): string[] {
  return (text.match(WORD) ?? []).map((t) => t.toLowerCase());
}

function blockTexts(b: Block): string[] {
  switch (b.type) {
    case 'paragraph':
      return b.language === 'es-ES' ? [b.text] : [];
    case 'bullet-list':
      return b.language === 'es-ES' ? b.items : [];
    case 'table':
      return b.language === 'es-ES' ? [...b.columns, ...b.rows.flat()] : [];
    case 'example':
      return [b.spanish];
    default:
      return [];
  }
}

function taskTexts(t: Task): string[] {
  const out: string[] = [];
  for (const b of t.prompt) out.push(...blockTexts(b));
  for (const h of t.hints ?? []) for (const b of h.blocks) out.push(...blockTexts(b));
  for (const o of t.options ?? []) if (!CYRILLIC.test(o.label)) out.push(o.label);
  for (const v of t.accepted ?? []) out.push(v.text);
  for (const s of t.slots ?? []) out.push(...s.accepted);
  for (const p of t.template ?? []) if (typeof p === 'string') out.push(p);
  for (const x of t.rubric?.exemplars ?? []) out.push(x.text);
  if (t.referenceAnswer) out.push(t.referenceAnswer);
  return out;
}

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const only = flagString(flags, 'lesson');
  const { corpus } = loadCorpus();
  const known = (lessonId: string): Set<string> => {
    const set = new Set<string>(ALWAYS);
    for (const x of corpus.lexemes) {
      if (compareLessons(x.body.firstLesson, lessonId) > 0) continue;
      for (const w of tokens(x.body.lemma)) for (const v of variants(w)) set.add(v);
      if (x.body.plural) for (const w of tokens(x.body.plural)) set.add(w);
    }
    for (const s of corpus.skills) {
      if (compareLessons(s.body.firstLesson, lessonId) > 0) continue;
      for (const f of s.body.scope.forms ?? []) for (const w of tokens(f)) set.add(w);
      if (s.body.termEs) for (const w of tokens(s.body.termEs)) set.add(w);
    }
    return set;
  };
  const lessons = corpus.lessons.filter((l) => /^A1-0[4-6]/.test(l.id) && (!only || l.id === only)).sort((a, b) => compareLessons(a.id, b.id));
  for (const lesson of lessons) {
    const k = known(lesson.id);
    const unknown = new Map<string, string[]>();
    const note = (text: string, where: string): void => {
      for (const w of tokens(text)) if (!k.has(w)) unknown.set(w, [...(unknown.get(w) ?? []), where]);
    };
    for (const step of lesson.body.steps) for (const b of step.blocks ?? []) for (const text of blockTexts(b)) note(text, `${lesson.id}/${step.id}`);
    for (const t of corpus.tasks.filter((x) => x.body.lessonId === lesson.id)) for (const text of taskTexts(t.body)) note(text, t.id);
    for (const c of corpus.clips.filter((x) => x.body.lessonId === lesson.id)) note(c.body.transcript, c.id);
    const entries = [...unknown.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    console.log(`${lesson.id}: ${entries.length} unknown token(s)`);
    for (const [w, where] of entries) console.log(`  ${w}  (${[...new Set(where)].slice(0, 4).join(', ')}${where.length > 4 ? ', …' : ''})`);
  }
}

main();
