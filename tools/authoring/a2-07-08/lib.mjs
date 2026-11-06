// Authoring helpers for the A2-07/A2-08 range (issue #111, brief 09). The data modules in this
// directory describe lessons, tasks, clips, materials, phrases and collections compactly; build.mjs
// expands them into concrete JSON under content/source/ (committed; never generated at runtime).
// A rebuild keeps an item's existing reviewStatus only while its content hash (canonical JSON
// without reviewStatus, the same hash the review tool binds receipts to) is unchanged; any content
// edit returns the item to draft.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSha256 } from '../../content/canonical.ts';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const SRC = join(ROOT, 'content', 'source');

// ---------------- blocks ----------------
export const uk = (text) => ({ type: 'paragraph', language: 'uk', text });
export const es = (text) => ({ type: 'paragraph', language: 'es-ES', text });
export const ex = (spanish, ukrainian) => ({ type: 'example', spanish, ukrainian });
export const ul = (items, language = 'uk') => ({ type: 'bullet-list', language, items });
export const table = (columns, rows, language = 'es-ES') => ({ type: 'table', language, columns, rows });
export const target = (key) => {
  const at = key.lastIndexOf('/');
  return { skillId: key.slice(0, at), modality: key.slice(at + 1) };
};
export const link = (labelUk, keys, mode = 'written', maxItems = 10) => ({ type: 'practice-link', labelUk, targets: keys.map(target), mode, maxItems });

// ---------------- policies ----------------
export const LOOSE = { case: 'insensitive', terminalPunctuation: 'optional' };
export const STRICT_CASE = { case: 'sensitive', terminalPunctuation: 'optional' };

const pad = (n) => String(n).padStart(2, '0');

/**
 * Builds one task. `t` fields:
 *  n, role, fam, targets (array of 'skill/modality' keys), mode, prompt (blocks), input,
 *  options [{label, out: {key: outcome} | 'c' | 'x', fb}], accepted [text|{text,noteUk}],
 *  errors [{text, out: {key: outcome} | 'x', fb}], closed, policy, template, slots, rubric,
 *  hints [{kind, targets, blocks}], ref, feedback {correctUk, incorrectUk, unresolvedUk}, clips.
 */
export function makeTask(lessonId, t) {
  const keys = t.targets;
  const one = (o) => {
    if (o === 'c') return Object.fromEntries(keys.map((k) => [k, 'correct']));
    if (o === 'x') {
      if (keys.length !== 1) throw new Error(`${lessonId}-T${pad(t.n)}: shorthand 'x' needs exactly one target`);
      return { [keys[0]]: 'incorrect' };
    }
    return o;
  };
  const task = {
    id: `${lessonId}-T${pad(t.n)}`,
    lessonId,
    role: t.role,
    family: t.fam,
    mode: t.mode,
    targets: keys.map(target),
    prompt: t.prompt,
    input: t.mode === 'choice' ? 'options' : (t.input ?? 'short'),
  };
  if (t.clips) task.clipIds = t.clips;
  if (t.mode === 'choice') {
    const letters = 'abcdefgh';
    task.options = t.options.map((o, i) => ({
      id: letters[i],
      label: o.label,
      outcomes: one(o.out),
      ...(o.fb ? { feedbackUk: o.fb } : {}),
    }));
  }
  if (t.mode === 'exact-variants') {
    task.accepted = t.accepted.map((a, i) => (typeof a === 'string' ? { id: `v${i + 1}`, text: a } : { id: `v${i + 1}`, text: a.text, noteUk: a.noteUk }));
    if (t.errors?.length) task.errors = t.errors.map((e, i) => ({ id: `e${i + 1}`, text: e.text, outcomes: one(e.out ?? 'x'), feedbackUk: e.fb }));
    if (t.closed) task.closed = true;
  }
  if (t.mode === 'finite-slots') {
    task.template = t.template;
    task.slots = t.slots;
  }
  if (t.mode === 'rubric-review') {
    task.rubric = {
      criteriaUk: t.rubric.criteria,
      exemplars: t.rubric.exemplars.map((x, i) => ({ id: `x${i + 1}`, text: x })),
    };
  }
  if (t.mode !== 'choice') task.policy = t.policy ?? LOOSE;
  if (t.hints?.length) task.hints = t.hints;
  if (t.ref) task.referenceAnswer = t.ref;
  task.feedback = t.feedback;
  task.reviewStatus = 'draft';
  return task;
}

// ---------------- hint helpers ----------------
export const hRule = (keys, text) => ({ kind: 'rule', targets: keys, blocks: [uk(text)] });
export const hClue = (keys, text) => ({ kind: 'targeted-clue', targets: keys, blocks: [uk(text)] });
export const hTr = (text) => ({ kind: 'translation', targets: [], blocks: [uk(text)] });
export const hReveal = (keys, spanish) => ({ kind: 'reveal', targets: keys, blocks: [es(spanish)] });
export const hTranscript = (keys, spanish) => ({ kind: 'transcript', targets: keys, blocks: [es(spanish)] });

// ---------------- writing with status preservation ----------------
const stripStatus = (body) => {
  const { reviewStatus: _ignored, ...rest } = body;
  return rest;
};
export const contentHash = (body) => canonicalSha256(stripStatus(body));

function existingStatuses(path, listKey, idKey) {
  const map = new Map();
  if (!existsSync(path)) return map;
  const json = JSON.parse(readFileSync(path, 'utf8'));
  const list = listKey ? json[listKey] : [json];
  for (const item of list ?? []) {
    if (item.reviewStatus !== undefined) map.set(item[idKey], { hash: contentHash(item), status: item.reviewStatus });
  }
  return map;
}

function carry(items, previous, idKey) {
  let kept = 0;
  for (const item of items) {
    const prior = previous.get(item[idKey]);
    if (prior && prior.hash === contentHash(item)) {
      item.reviewStatus = prior.status;
      kept++;
    }
  }
  return kept;
}

function write(path, json) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}

/** Writes a list file (tasks/clips/materials/phrases/collections) keeping unchanged statuses. */
export function writeList(rel, header, listKey, items, idKey = 'id') {
  const path = join(SRC, rel);
  const kept = carry(items, existingStatuses(path, listKey, idKey), idKey);
  write(path, { ...header, [listKey]: items });
  return { rel, count: items.length, kept };
}

/** Writes a single-entity file (a lesson) keeping its status when unchanged. */
export function writeSingle(rel, body) {
  const path = join(SRC, rel);
  const kept = carry([body], existingStatuses(path, null, 'id'), 'id');
  write(path, body);
  return { rel, count: 1, kept };
}
