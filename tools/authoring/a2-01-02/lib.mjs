// Thin expander for hand-authored lesson/task/clip/material specs of range a2-01-02 (A2-01, A2-02).
// It only fills schema boilerplate (ids, policy, hint scaffolding, outcome maps, feedback framing);
// every Spanish and Ukrainian sentence comes from the per-lesson spec files. Outputs are committed
// JSON under content/source; nothing here runs at application runtime.

export const ES = (text) => ({ type: 'paragraph', language: 'es-ES', text });
export const UK = (text) => ({ type: 'paragraph', language: 'uk', text });
export const EX = (spanish, ukrainian) => ({ type: 'example', spanish, ukrainian });
export const LIST_UK = (items) => ({ type: 'bullet-list', language: 'uk', items });
export const LIST_ES = (items) => ({ type: 'bullet-list', language: 'es-ES', items });
export const TABLE_ES = (columns, rows) => ({ type: 'table', language: 'es-ES', columns, rows });
export const TABLE_UK = (columns, rows) => ({ type: 'table', language: 'uk', columns, rows });

export function target(key) {
  const i = key.lastIndexOf('/');
  return { skillId: key.slice(0, i), modality: key.slice(i + 1) };
}
export const LINK = (labelUk, keys, mode, maxItems) => ({ type: 'practice-link', labelUk, targets: keys.map(target), mode, maxItems });

/** Default checking policy: capitalization is never the assessed feature in this range. */
export const POLICY = { case: 'insensitive', terminalPunctuation: 'optional' };

export const UNRESOLVED_UK =
  'Цю відповідь не вдалося перевірити автоматично: вона може бути правильною. Порівняйте її з прикладом відповіді або збережіть для перегляду.';

const asList = (x) => (x === undefined ? [] : Array.isArray(x) ? x : [x]);

/** Reveal text: the full sentence when given, else the cue with ___ filled and "(…)" cues removed. */
function fill(es, answer) {
  const before = es.slice(0, es.indexOf('___')).trimEnd();
  const sentenceStart = before === '' || /[¿¡.!?]$/u.test(before);
  const word = sentenceStart ? answer.charAt(0).toUpperCase() + answer.slice(1) : answer;
  return es.replace(/\s*\([^)]*\)/gu, '').replace('___', word).replace(/\s+([,.?!])/gu, '$1');
}

function baseTask(lessonId, spec, mode, targets, input) {
  return {
    id: `${lessonId}-${spec.id}`,
    lessonId,
    role: spec.role,
    family: spec.family,
    mode,
    targets: targets.map(target),
    prompt: [],
    input,
  };
}

function hintsFor(spec, keys, revealText) {
  const hints = [];
  if (spec.rule) hints.push({ kind: 'rule', targets: spec.ruleTargets ?? keys, blocks: asList(spec.rule).map((r) => (typeof r === 'string' ? UK(r) : r)) });
  if (spec.clue) hints.push({ kind: 'targeted-clue', targets: spec.clueTargets ?? keys, blocks: [UK(spec.clue)] });
  if (spec.uk) hints.push({ kind: 'translation', targets: [], blocks: [UK(spec.uk)] });
  if (revealText) hints.push({ kind: 'reveal', targets: keys, blocks: [ES(revealText)] });
  return hints;
}

function promptFor(spec) {
  const prompt = [UK(spec.ask)];
  for (const m of spec.model ?? []) prompt.push(EX(m[0], m[1]));
  for (const p of asList(spec.es)) prompt.push(typeof p === 'string' ? ES(p) : p);
  return prompt;
}

/**
 * Single-target short answer (exact-variants). Closed by default: use only when the accepted list is
 * the complete set of right answers (one form). spec: {id, role, family, t, ask, model?, es, uk?, a,
 * err?: [[text, feedbackUk]], rule?, clue?, full?, why?, open?}
 */
export function gap(lessonId, spec) {
  const accepted = asList(spec.a);
  const task = baseTask(lessonId, spec, 'exact-variants', [spec.t], 'short');
  task.prompt = promptFor(spec);
  task.accepted = accepted.map((text, i) => ({ id: `a${i + 1}`, text }));
  if (spec.err?.length) task.errors = spec.err.map(([text, feedbackUk], i) => ({ id: `e${i + 1}`, text, outcomes: { [spec.t]: 'incorrect' }, feedbackUk }));
  task.closed = !spec.open;
  task.policy = spec.policy ?? POLICY;
  const reveal = spec.full ?? (typeof spec.es === 'string' && spec.es.includes('___') ? fill(spec.es, accepted[0]) : accepted[0]);
  task.hints = hintsFor(spec, [spec.t], reveal);
  task.referenceAnswer = accepted[0];
  task.feedback = {
    correctUk: spec.ok ?? `Правильно: ${accepted[0]}.${spec.why ? ` ${spec.why}` : ''}`,
    incorrectUk: spec.no ?? `Правильна відповідь: ${accepted[0]}.${spec.why ? ` ${spec.why}` : ''}`,
    ...(spec.open ? { unresolvedUk: UNRESOLVED_UK } : {}),
  };
  task.reviewStatus = 'draft';
  return task;
}

/**
 * Multi-target (or open single-target) short/multiline answer (exact-variants, never closed when
 * several targets). spec: {id, role, family, ts: [keys], ask, model?, es, uk?, a: [texts],
 * err?: [[text, {key: outcome}, feedbackUk]], rule?, ruleTargets?, clue?, full?, ok?, no?, input?}
 */
export function open(lessonId, spec) {
  const accepted = asList(spec.a);
  const task = baseTask(lessonId, spec, 'exact-variants', spec.ts, spec.input ?? 'short');
  task.prompt = promptFor(spec);
  task.accepted = accepted.map((text, i) => ({ id: `a${i + 1}`, text }));
  if (spec.err?.length) task.errors = spec.err.map(([text, outcomes, feedbackUk], i) => ({ id: `e${i + 1}`, text, outcomes, feedbackUk }));
  if (spec.ts.length === 1 && spec.closed) task.closed = true;
  else task.closed = false;
  task.policy = spec.policy ?? POLICY;
  task.hints = hintsFor(spec, spec.ts, spec.full ?? accepted[0]);
  task.referenceAnswer = accepted[0];
  task.feedback = {
    correctUk: spec.ok ?? `Правильно: ${accepted[0]}`,
    incorrectUk: spec.no ?? `Правильна відповідь: ${accepted[0]}`,
    ...(task.closed ? {} : { unresolvedUk: spec.unres ?? UNRESOLVED_UK }),
  };
  task.reviewStatus = 'draft';
  return task;
}

/**
 * finite-slots. spec: {id, role, family, ask, model?, es, uk?, tpl: [string | {s, t, a:[...], err?:[[text, fb]], closed?}],
 * rule?, full, ok, no}
 */
export function slots(lessonId, spec) {
  const slotDefs = spec.tpl.filter((p) => typeof p !== 'string');
  const keys = [...new Set(slotDefs.map((s) => s.t))];
  const task = baseTask(lessonId, spec, 'finite-slots', keys, 'short');
  task.prompt = promptFor(spec);
  task.policy = spec.policy ?? POLICY;
  task.template = spec.tpl.map((p) => (typeof p === 'string' ? p : { slot: p.s }));
  task.slots = slotDefs.map((s) => ({
    id: s.s,
    target: s.t,
    accepted: s.a,
    ...(s.err?.length ? { errors: s.err.map(([text, feedbackUk]) => ({ text, feedbackUk })) } : {}),
    closed: s.closed !== false,
  }));
  task.hints = hintsFor(spec, keys, spec.full);
  task.referenceAnswer = spec.full;
  task.feedback = { correctUk: spec.ok ?? `Правильно: ${spec.full}`, incorrectUk: spec.no ?? `Правильна відповідь: ${spec.full}`, unresolvedUk: spec.unres ?? UNRESOLVED_UK };
  task.reviewStatus = 'draft';
  return task;
}

/**
 * choice. spec: {id, role, family, ts: [keys], ask, es?, clips?, opts: [[label, outcome | {key: outcome}, feedbackUk?]],
 * rule?, clue?, uk?, ok, no}. outcome shorthand: 'c' = every target correct; 'x' = every target incorrect;
 * an object maps keys to outcomes explicitly.
 */
export function choice(lessonId, spec) {
  const task = baseTask(lessonId, spec, 'choice', spec.ts, 'options');
  task.prompt = promptFor({ ...spec, es: spec.es ?? [] });
  if (spec.clips) task.clipIds = spec.clips;
  task.options = spec.opts.map(([label, outcome, feedbackUk], i) => {
    let outcomes;
    if (outcome === 'c') outcomes = Object.fromEntries(spec.ts.map((k) => [k, 'correct']));
    else if (outcome === 'x') outcomes = Object.fromEntries(spec.ts.map((k) => [k, 'incorrect']));
    else outcomes = outcome;
    return { id: String.fromCharCode(97 + i), label, outcomes, ...(feedbackUk ? { feedbackUk } : {}) };
  });
  const correct = spec.opts.find(([, o]) => o === 'c');
  const hints = [];
  if (spec.rule) hints.push({ kind: 'rule', targets: spec.ruleTargets ?? spec.ts, blocks: asList(spec.rule).map((r) => (typeof r === 'string' ? UK(r) : r)) });
  if (spec.clue) hints.push({ kind: 'targeted-clue', targets: spec.clueTargets ?? spec.ts, blocks: [UK(spec.clue)] });
  if (spec.uk) hints.push({ kind: 'translation', targets: spec.ukTargets ?? [], blocks: [UK(spec.uk)] });
  if (spec.transcript) hints.push({ kind: 'transcript', targets: spec.ts, blocks: [ES(spec.transcript)] });
  const cyr = (x) => /\p{Script=Cyrillic}/u.test(x);
  if (spec.ref) hints.push({ kind: 'reveal', targets: spec.ts, blocks: [ES(spec.ref)] });
  else if (correct) hints.push({ kind: 'reveal', targets: spec.ts, blocks: [cyr(correct[0]) ? UK(correct[0]) : ES(correct[0])] });
  task.hints = hints;
  if (spec.ref) task.referenceAnswer = spec.ref;
  else if (correct && !cyr(correct[0])) task.referenceAnswer = correct[0];
  task.feedback = { correctUk: spec.ok, incorrectUk: spec.no };
  task.reviewStatus = 'draft';
  return task;
}

/** rubric-review free writing. spec: {id, role, family, ts, ask, es?, criteria: [uk], exemplars: [es], rule?, ok?, no?} */
export function rubric(lessonId, spec) {
  const task = baseTask(lessonId, spec, 'rubric-review', spec.ts, 'multiline');
  task.prompt = promptFor({ ...spec, es: spec.es ?? [] });
  task.policy = spec.policy ?? POLICY;
  task.rubric = { criteriaUk: spec.criteria, exemplars: spec.exemplars.map((text, i) => ({ id: `x${i + 1}`, text })) };
  const hints = [];
  if (spec.rule) hints.push({ kind: 'rule', targets: spec.ruleTargets ?? spec.ts, blocks: asList(spec.rule).map((r) => (typeof r === 'string' ? UK(r) : r)) });
  hints.push({ kind: 'reveal', targets: spec.ts, blocks: [ES(spec.exemplars[0])] });
  task.hints = hints;
  task.referenceAnswer = spec.exemplars[0];
  task.feedback = {
    correctUk: spec.ok ?? 'Ваш текст збігається з прикладом відповіді.',
    incorrectUk: spec.no ?? 'Порівняйте свій текст із критеріями та прикладом.',
    unresolvedUk:
      spec.unres ??
      'Вільний текст не перевіряється автоматично. Звірте його з критеріями: приклад нижче — лише один із можливих варіантів, а не єдина правильна відповідь. Можна зберегти текст для перегляду.',
  };
  task.reviewStatus = 'draft';
  return task;
}

/** Dictation of a clip transcript (exact-variants, single dictation target, closed). */
export function dictation(lessonId, spec) {
  const task = baseTask(lessonId, spec, 'exact-variants', [spec.t], 'multiline');
  task.prompt = [UK(spec.ask ?? 'Прослухайте запис і запишіть почуте іспанською. Великі літери та крапку в кінці не оцінюємо.')];
  task.clipIds = [spec.clip];
  const accepted = asList(spec.a);
  task.accepted = accepted.map((text, i) => ({ id: `a${i + 1}`, text }));
  if (spec.err?.length) task.errors = spec.err.map(([text, feedbackUk], i) => ({ id: `e${i + 1}`, text, outcomes: { [spec.t]: 'incorrect' }, feedbackUk }));
  task.closed = spec.closed !== false;
  task.policy = POLICY;
  task.hints = [{ kind: 'transcript', targets: [spec.t], blocks: [ES(accepted[0])] }];
  task.referenceAnswer = accepted[0];
  task.feedback = {
    correctUk: 'Правильно: ви точно записали почуте.',
    incorrectUk: `Порівняйте з текстом запису: ${accepted[0]}`,
    ...(task.closed ? {} : { unresolvedUk: UNRESOLVED_UK }),
  };
  task.reviewStatus = 'draft';
  return task;
}

export function step(id, kind, titleUk, required, { blocks, tasks, clips, lessonId } = {}) {
  return {
    id,
    kind,
    titleUk,
    required,
    ...(blocks ? { blocks } : {}),
    ...(tasks ? { taskIds: tasks.map((t) => (t.startsWith('A') ? t : `${lessonId}-${t}`)) } : {}),
    ...(clips ? { clipIds: clips } : {}),
  };
}

export function lesson(spec) {
  return {
    schemaVersion: 1,
    id: spec.id,
    kind: spec.id.endsWith('-C1') ? 'optional-check' : 'lesson',
    blockId: spec.id.slice(0, 5),
    titleUk: spec.titleUk,
    ...(spec.termEs ? { termEs: spec.termEs } : {}),
    summaryUk: spec.summaryUk,
    objectives: spec.objectives,
    cv: spec.cv ?? [],
    situations: spec.situations,
    estimatedMinutes: spec.estimatedMinutes,
    ...(spec.skippableFoundation !== undefined ? { skippableFoundation: spec.skippableFoundation } : {}),
    introduces: spec.introduces,
    revisits: spec.revisits,
    steps: spec.steps,
    reviewStatus: 'draft',
  };
}

export function clip(spec) {
  return {
    id: spec.id,
    lessonId: spec.lessonId,
    kind: spec.kind,
    transcript: spec.transcript,
    translationUk: spec.translationUk,
    targets: spec.targets.map(target),
    family: spec.family,
    ...(spec.note ? { pronunciationNoteUk: spec.note } : {}),
    reviewStatus: 'draft',
  };
}

export function material(spec) {
  return { id: spec.id, topicId: spec.topicId, titleUk: spec.titleUk, blocks: spec.blocks, linkedTargets: spec.linkedTargets, reviewStatus: 'draft' };
}

/** Deep NFC normalization of every string. */
export function nfc(value) {
  if (typeof value === 'string') return value.normalize('NFC');
  if (Array.isArray(value)) return value.map(nfc);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, nfc(v)]));
  return value;
}
