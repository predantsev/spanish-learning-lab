// Authoring helpers for blocks A2-03 and A2-04 (issue #111, brief 09, range "a2-03-04").
// The lesson modules in this directory hold the authored content as compact data; build.mjs turns
// them into concrete JSON under content/source/. The JSON is the committed source of truth; nothing
// here runs at application runtime. Re-running the build keeps an item's reviewStatus only when its
// canonical body (without reviewStatus) is unchanged, so an edit always returns the item to draft.
import { createHash } from 'node:crypto';

export const WORD = Object.freeze({ case: 'insensitive', terminalPunctuation: 'optional' });
export const SENTENCE = Object.freeze({ case: 'insensitive', terminalPunctuation: 'optional' });
export const FREE_TEXT = Object.freeze({ case: 'sensitive', terminalPunctuation: 'optional' });

/** Target key skillId/modality. */
export const key = (skillId, modality) => `${skillId}/${modality}`;
const target = ([skillId, modality]) => ({ skillId, modality });

// ---------- blocks ----------
export const uk = (text) => ({ type: 'paragraph', language: 'uk', text });
export const es = (text) => ({ type: 'paragraph', language: 'es-ES', text });
export const ex = (spanish, ukrainian) => ({ type: 'example', spanish, ukrainian });
export const ukList = (items) => ({ type: 'bullet-list', language: 'uk', items });
export const esList = (items) => ({ type: 'bullet-list', language: 'es-ES', items });
export const esTable = (columns, rows) => ({ type: 'table', language: 'es-ES', columns, rows });
export const ukTable = (columns, rows) => ({ type: 'table', language: 'uk', columns, rows });
export const link = (labelUk, targets, mode = 'written', maxItems = 10) => ({
  type: 'practice-link',
  labelUk,
  targets: targets.map(target),
  mode,
  maxItems,
});

// ---------- hints ----------
export const ruleHint = (keys, text) => ({ kind: 'rule', targets: keys, blocks: [uk(text)] });
export const clueHint = (keys, text) => ({ kind: 'targeted-clue', targets: keys, blocks: [uk(text)] });
/** Vocabulary gloss of a word that is not the assessed target: no grammar target. */
export const glossHint = (text) => ({ kind: 'translation', targets: [], blocks: [uk(text)] });
export const revealHint = (keys, spanish, ukrainian) => ({ kind: 'reveal', targets: keys, blocks: [ex(spanish, ukrainian)] });

/** Deterministic option order: sort by sha256(taskId|label). */
function shuffle(taskId, options) {
  const h = (label) => createHash('sha256').update(`${taskId}|${label}`).digest('hex');
  return [...options].sort((a, b) => (h(a.label) < h(b.label) ? -1 : 1));
}

function base(o, mode, input) {
  if (!o.id || !o.lesson || !o.role || !o.family) throw new Error(`task needs id/lesson/role/family: ${JSON.stringify(o).slice(0, 120)}`);
  const targets = o.targets ?? [o.target];
  return {
    id: `${o.lesson}-${o.id}`,
    lessonId: o.lesson,
    role: o.role,
    family: o.family,
    mode,
    targets: targets.map(target),
    prompt: o.prompt,
    input,
  };
}

function finish(task, o, keys, extraHints = []) {
  const hints = [];
  if (o.rule) hints.push(ruleHint(o.ruleTargets ?? keys, o.rule));
  if (o.clue) hints.push(clueHint(o.clueTargets ?? keys, o.clue));
  for (const g of o.glosses ?? []) hints.push(glossHint(g));
  hints.push(...extraHints);
  if (o.full) hints.push(revealHint(keys, o.full, o.fullUk));
  if (hints.length > 0) task.hints = hints;
  if (o.reference ?? o.full) task.referenceAnswer = o.reference ?? o.full;
  task.feedback = { correctUk: o.ok, incorrectUk: o.bad };
  if (o.unresolved) task.feedback.unresolvedUk = o.unresolved;
  task.reviewStatus = 'draft';
  for (const [k, v] of Object.entries(task)) if (v === undefined) delete task[k];
  if (!o.ok || !o.bad) throw new Error(`${task.id}: feedback ok/bad required`);
  return task;
}

/**
 * exact-variants task.
 * o: { id, lesson, role, family, target:[skill,modality] | targets, prompt:[blocks], answers:[text…],
 *      errors:[[text, feedbackUk, outcomes?]], closed?, policy?, input?, rule, clue?, glosses?, full, fullUk,
 *      reference?, ok, bad, unresolved?, clipIds? }
 */
export function exact(o) {
  const t = base(o, 'exact-variants', o.input ?? 'short');
  const keys = t.targets.map((x) => key(x.skillId, x.modality));
  if (o.clipIds) t.clipIds = o.clipIds;
  t.accepted = o.answers.map((text, i) => ({ id: `a${i + 1}`, text }));
  if (o.errors && o.errors.length > 0) {
    t.errors = o.errors.map(([text, feedbackUk, outcomes], i) => ({
      id: `e${i + 1}`,
      text,
      outcomes: outcomes ?? Object.fromEntries(keys.map((k) => [k, 'incorrect'])),
      feedbackUk,
    }));
  }
  const closed = o.closed ?? false;
  if (closed && keys.length !== 1) throw new Error(`${t.id}: closed needs exactly one target`);
  t.closed = closed;
  t.policy = o.policy ?? WORD;
  if (!closed && !o.unresolved) throw new Error(`${t.id}: open exact task needs unresolved feedback`);
  return finish(t, o, keys, o.extraHints);
}

/**
 * choice task (single target unless o.targets is given with per-option outcomes).
 * o.options: [[label, true|false|outcomesObject, feedbackUk?]]
 */
export function choice(o) {
  const t = base(o, 'choice', 'options');
  const keys = t.targets.map((x) => key(x.skillId, x.modality));
  if (o.clipIds) t.clipIds = o.clipIds;
  const raw = o.options.map(([label, verdict, feedbackUk]) => {
    let outcomes;
    if (verdict === true) outcomes = Object.fromEntries(keys.map((k) => [k, 'correct']));
    else if (verdict === false) outcomes = Object.fromEntries(keys.map((k) => [k, 'incorrect']));
    else outcomes = verdict;
    return { label, outcomes, ...(feedbackUk ? { feedbackUk } : {}) };
  });
  const ordered = o.keepOrder ? raw : shuffle(t.id, raw);
  t.options = ordered.map((opt, i) => ({ id: 'abcdefgh'[i], ...opt }));
  return finish(t, o, keys, o.extraHints);
}

/** rubric-review task for free writing. o.criteria: [uk…], o.exemplars: [text…] */
export function rubric(o) {
  const t = base(o, 'rubric-review', 'multiline');
  const keys = t.targets.map((x) => key(x.skillId, x.modality));
  t.policy = o.policy ?? FREE_TEXT;
  t.rubric = { criteriaUk: o.criteria, exemplars: o.exemplars.map((text, i) => ({ id: `x${i + 1}`, text })) };
  if (!o.unresolved) throw new Error(`${t.id}: rubric task needs unresolved feedback`);
  return finish(t, o, keys, o.extraHints);
}

// ---------- lessons ----------
export function step(id, kind, titleUk, required, content = {}) {
  const s = { id, kind, titleUk, required };
  if (content.blocks) s.blocks = content.blocks;
  if (content.taskIds) s.taskIds = content.taskIds;
  if (content.clipIds) s.clipIds = content.clipIds;
  return s;
}

export function lesson(o) {
  const l = {
    schemaVersion: 1,
    id: o.id,
    kind: o.kind ?? 'lesson',
    blockId: o.id.slice(0, 5),
    titleUk: o.titleUk,
    ...(o.termEs ? { termEs: o.termEs } : {}),
    summaryUk: o.summaryUk,
    objectives: o.objectives,
    cv: o.cv ?? [],
    situations: o.situations,
    estimatedMinutes: o.estimatedMinutes,
    introduces: o.introduces,
    revisits: o.revisits,
    steps: o.steps,
    reviewStatus: 'draft',
  };
  return l;
}

export function clip(o) {
  return {
    id: o.id,
    lessonId: o.lesson,
    kind: o.kind,
    transcript: o.transcript,
    translationUk: o.translationUk,
    targets: o.targets.map(target),
    family: o.family,
    ...(o.noteUk ? { pronunciationNoteUk: o.noteUk } : {}),
    reviewStatus: 'draft',
  };
}

export function material(o) {
  return {
    id: o.id,
    topicId: o.topicId,
    titleUk: o.titleUk,
    blocks: o.blocks,
    linkedTargets: o.linkedTargets,
    reviewStatus: 'draft',
  };
}

/** Task ids of a lesson by role, in authored order (for lesson steps). */
export function idsBy(tasks, predicate) {
  return tasks.filter(predicate).map((t) => t.id);
}
