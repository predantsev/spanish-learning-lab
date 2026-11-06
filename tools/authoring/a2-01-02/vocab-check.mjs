// Authoring aid (range a2-01-02): lists Spanish word tokens in A2-01/A2-02 lesson, task, clip and
// material files that are not taught (lexicon lemma or skill form) at or before the owning lesson.
// Crude by design: inflection stripping only; every hit is a prompt to gloss, replace or add a
// lexicon row — not a verdict. Usage: node tools/authoring/a2-01-02/vocab-check.mjs [--all]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../', import.meta.url).pathname;
const SRC = join(ROOT, 'content', 'source');
const SHOW_ALL = process.argv.includes('--all');

function courseIndex(id) {
  const m = /^A([12])-0([1-8])-(?:L([0-9]{1,2})|(C1))$/.exec(id);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return (Number(m[1]) * 100 + Number(m[2])) * 1000 + (m[4] ? 99 : Number(m[3]));
}
const blockStart = (blockId) => courseIndex(`${blockId}-L1`);

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const listJson = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : []);

const WORD = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/gu;
const words = (text) => (text.match(WORD) ?? []).map((w) => w.toLowerCase());

// known: token -> earliest course index where it is taught
const known = new Map();
const teach = (token, idx) => {
  const t = token.toLowerCase();
  if (!known.has(t) || known.get(t) > idx) known.set(t, idx);
};
const verbStems = []; // {stem, cls, idx}

for (const f of listJson(join(SRC, 'lexicon'))) {
  for (const x of readJson(join(SRC, 'lexicon', f)).items) {
    const idx = courseIndex(x.firstLesson);
    for (const w of words(x.lemma)) teach(w, idx);
    if (x.plural) for (const w of words(x.plural)) teach(w, idx);
    if (x.pos === 'verb') {
      const lemma = x.lemma.toLowerCase().replace(/se$/u, '');
      const m = /^(.*)(ar|er|ir|ír)$/u.exec(lemma);
      if (m) verbStems.push({ stem: m[1], idx });
    }
  }
}
for (const f of listJson(join(SRC, 'skills'))) {
  for (const s of readJson(join(SRC, 'skills', f)).skills) {
    const idx = courseIndex(s.firstLesson);
    for (const form of s.scope.forms ?? []) for (const w of words(form)) teach(w, idx);
    if (s.termEs) for (const w of words(s.termEs)) teach(w, idx);
  }
}

// Function words and closed classes taught across A1 (articles, pronouns, prepositions, etc.).
const A1 = courseIndex('A1-06-L6');
for (const w of 'el la los las un una unos unas lo al del de en a con para por sin que y o e pero porque si no sí yo tú él ella usted nosotros nosotras vosotros vosotras ellos ellas ustedes me te se nos os le les mi mis tu tus su sus nuestro nuestra nuestros nuestras vuestro vuestra vuestros vuestras este esta estos estas qué quién quiénes dónde cómo cuándo cuánto cuánta cuántos cuántas cuál cuáles muy mucho mucha muchos muchas poco poca pocos pocas más menos también tampoco hoy ya bien mal aquí allí'.split(' ')) teach(w, A1);

function knownIndex(token) {
  if (known.has(token)) return known.get(token);
  // plural / gender stripping for nouns and adjectives
  const candidates = [];
  if (token.endsWith('es')) candidates.push(token.slice(0, -2));
  if (token.endsWith('s')) candidates.push(token.slice(0, -1));
  if (/[ao]s?$/u.test(token)) candidates.push(token.replace(/[ao]s?$/u, 'o'), token.replace(/[ao]s?$/u, 'a'));
  for (const c of candidates) if (known.has(c)) return known.get(c);
  // regular verb inflection (present, gerund, infinitive) from a taught verb stem
  let best;
  for (const { stem, idx } of verbStems) {
    if (stem.length >= 2 && token.startsWith(stem)) {
      const ending = token.slice(stem.length);
      if (/^(o|as|a|amos|áis|an|es|e|emos|éis|en|imos|ís|ar|er|ir|ando|iendo|ado|ido)$/u.test(ending)) best = Math.min(best ?? Infinity, idx);
    }
  }
  return best;
}

const files = [];
for (const dir of ['lessons', 'tasks']) for (const f of listJson(join(SRC, dir))) if (/^A2-0[12]-/.test(f)) files.push({ path: join(dir, f), lessonOf: (x) => x.lessonId ?? x.id });
for (const dir of ['audio', 'materials']) for (const f of listJson(join(SRC, dir))) if (/^A2-0[12]\.json$/.test(f)) files.push({ path: join(dir, f) });

const SPANISH_KEYS = new Set(['spanish', 'transcript', 'referenceAnswer', 'text']);
const hits = new Map(); // token -> {lessons:Set, idx}

function scan(value, lessonId, inEs) {
  if (Array.isArray(value)) return value.forEach((v) => scan(v, lessonId, inEs));
  if (!value || typeof value !== 'object') return;
  let lesson = lessonId;
  if (typeof value.lessonId === 'string') lesson = value.lessonId;
  else if (typeof value.id === 'string' && /^A2-0[12]-(L\d+|C1)$/.test(value.id)) lesson = value.id;
  else if (typeof value.topicId === 'string') lesson = /-(L\d+|C1)$/.test(value.topicId) ? value.topicId : `${value.topicId}-L1`;
  const isEsBlock = value.language === 'es-ES';
  for (const [k, v] of Object.entries(value)) {
    if (k === 'errors' || k === 'feedbackUk' || k.endsWith('Uk') || k === 'ukrainian') continue;
    if (typeof v === 'string') {
      const spanish = (SPANISH_KEYS.has(k) && (value.type !== 'paragraph' || isEsBlock)) || (k === 'label' && !/\p{Script=Cyrillic}/u.test(v));
      if (spanish) check(v, lesson);
    } else if (k === 'items' && isEsBlock) v.forEach((s) => check(s, lesson));
    else if (k === 'rows' && isEsBlock) v.flat().forEach((s) => check(s, lesson));
    else if (k === 'template') v.filter((p) => typeof p === 'string').forEach((s) => check(s, lesson));
    else if (k === 'accepted' && Array.isArray(v) && typeof v[0] === 'string') v.forEach((s) => check(s, lesson));
    else scan(v, lesson, inEs || isEsBlock);
  }
}

function check(text, lessonId) {
  if (/\p{Script=Cyrillic}/u.test(text)) return;
  const at = courseIndex(lessonId);
  for (const w of words(text)) {
    const idx = knownIndex(w);
    if (idx === undefined || idx > at) {
      const h = hits.get(w) ?? { lessons: new Set(), idx };
      h.lessons.add(lessonId);
      hits.set(w, h);
    }
  }
}

for (const file of files) scan(readJson(join(SRC, file.path)), undefined, false);

const rows = [...hits.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
for (const [w, h] of rows) {
  const where = [...h.lessons].sort().join(',');
  const note = h.idx === undefined ? 'not taught anywhere' : `taught later (${h.idx})`;
  if (SHOW_ALL || !/^[A-ZÁÉÍÓÚÑ]/u.test(w)) console.log(`${w}\t${note}\t${where}`);
}
console.log(`${rows.length} untaught token(s)`);
