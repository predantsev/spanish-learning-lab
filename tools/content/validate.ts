// Semantic validator for content/source (release gate A-31). Schema validation happens in load.ts;
// this module checks identities, references, ledger/CV coverage, prerequisite DAG and teaching
// order, task structure, answer-key self-consistency, bank allocation, listening/collection
// coverage, language tagging and review/readiness receipts.
// CLI: node tools/content/validate.ts [--source dir] [--ledger file] [--reviews dir]
//        [--allow-incomplete] [--verify-signatures] [--json]
// Exit 1 when any error remains. Warnings are printed separately and never fail the run.
import {
  DEFAULT_LEDGER_PATH,
  DEFAULT_REVIEWS_DIR,
  DEFAULT_SOURCE_DIR,
  allEntities,
  entityHash,
  entityState,
  flagString,
  isMain,
  loadCorpus,
  parseArgs,
} from './load.ts';
import type { AnyRecord, Corpus, EntityRecord, EntityRef, Issue, LoadOptions } from './load.ts';
import { blockOfLesson, compareLessons, courseIndex, isCheckId, loadLedger } from './ledger.ts';
import type { Ledger } from './ledger.ts';
import {
  checkTask,
  hasAdjacentSlots,
  hasWhitespaceOnlySeparator,
  keyForms,
  normalizeBase,
  normalizeResponse,
  renderTemplate,
} from './checker.ts';
import type {
  Block,
  Clip,
  EntityKind,
  Lesson,
  Material,
  Modality,
  Phrase,
  Skill,
  SkillKind,
  Target,
  Task,
} from './types.ts';
import { parseTargetKey, targetKey } from './types.ts';

/** Readiness evidence lookup, implemented by tools/review/store.ts over content/reviews. */
export interface ReceiptIndex {
  /** A verified, opposite-provider review receipt without a blocking finding exists for this hash. */
  hasReviewReceipt(kind: EntityKind, id: string, hash: string): boolean;
  /** A local validation receipt (written by `review promote`) exists for this hash. */
  hasValidationReceipt(kind: EntityKind, id: string, hash: string): boolean;
}

export interface ValidateOptions {
  /** Report completeness gaps (missing ledger lessons, untested targets, …) as warnings. */
  allowIncomplete?: boolean;
  receipts?: ReceiptIndex;
}

export interface ValidationReport {
  errors: Issue[];
  warnings: Issue[];
}

export const PRODUCTIVE_KINDS: readonly SkillKind[] = ['orthography', 'form', 'exception', 'contrast', 'construction'];
export const PRODUCTIVE_MODALITIES: readonly Modality[] = ['written-form', 'construction-use'];
const LISTENING_MODALITIES: readonly Modality[] = ['listening-meaning', 'dictation'];
const TEXT_MODES = new Set(['exact-variants', 'finite-slots', 'rubric-review']);

const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATIN = /\p{Script=Latin}/u;
const RUSSIAN_ONLY = /[ыэъёЫЭЪЁ]/u;

/** Is the skill a "small productive grammar target" for the bank-size rule (README rule 3)? */
export function isProductiveSkill(skill: Skill): boolean {
  return skill.assessed && PRODUCTIVE_KINDS.includes(skill.kind) && skill.modalities.some((m) => PRODUCTIVE_MODALITIES.includes(m));
}

interface Ctx {
  corpus: Corpus;
  ledger: Ledger;
  out: Issue[];
  allowIncomplete: boolean;
  skills: Map<string, EntityRecord<Skill>>;
  lessons: Map<string, EntityRecord<Lesson>>;
  tasks: Map<string, EntityRecord<Task>>;
  clips: Map<string, EntityRecord<Clip>>;
  phrases: Map<string, EntityRecord<Phrase>>;
  situations: Set<string>;
  sources: Set<string>;
  ledgerLessons: Set<string>;
  ledgerObjectives: Map<string, string>;
  ledgerCv: Set<string>;
  ledgerBlocks: Set<string>;
}

function ref(record: { kind: EntityKind; id: string }): EntityRef {
  return { kind: record.kind, id: record.id };
}

function add(ctx: Ctx, level: 'error' | 'warning', code: string, at: { kind: EntityKind; id: string; file?: string } | undefined, message: string, completeness = false): void {
  const effective = completeness && ctx.allowIncomplete && level === 'error' ? 'warning' : level;
  ctx.out.push({
    level: effective,
    code,
    message,
    ...(at?.file ? { file: at.file } : {}),
    ...(at ? { entity: ref(at) } : {}),
  });
}

function byId<T>(list: EntityRecord<T>[]): Map<string, EntityRecord<T>> {
  const map = new Map<string, EntityRecord<T>>();
  for (const record of list) if (!map.has(record.id)) map.set(record.id, record);
  return map;
}

export function validateCorpus(corpus: Corpus, ledger: Ledger, options: ValidateOptions = {}): ValidationReport {
  const ctx: Ctx = {
    corpus,
    ledger,
    out: [],
    allowIncomplete: options.allowIncomplete ?? false,
    skills: byId(corpus.skills),
    lessons: byId(corpus.lessons),
    tasks: byId(corpus.tasks),
    clips: byId(corpus.clips),
    phrases: byId(corpus.phrases),
    situations: new Set(corpus.situations.map((s) => s.id)),
    sources: new Set(corpus.sources.map((s) => s.id)),
    ledgerLessons: new Set([...ledger.lessons, ...ledger.checks]),
    ledgerObjectives: new Map(ledger.rows.filter((r) => r.kind === 'objective').map((r) => [r.id, r.blockId])),
    ledgerCv: new Set(ledger.cv),
    ledgerBlocks: new Set(ledger.blocks),
  };
  checkUniqueness(ctx);
  checkLedger(ctx);
  checkSkills(ctx);
  checkPrerequisiteGraph(ctx);
  checkLessons(ctx);
  checkTasks(ctx);
  checkClipsAndListening(ctx);
  checkLexicon(ctx);
  checkPhrasesAndCollections(ctx);
  checkMaterials(ctx);
  checkSituations(ctx);
  checkCourseBlocks(ctx);
  checkTargetsTested(ctx);
  checkBanks(ctx);
  checkTexts(ctx);
  checkReadiness(ctx, options.receipts);
  return {
    errors: ctx.out.filter((i) => i.level === 'error'),
    warnings: ctx.out.filter((i) => i.level === 'warning'),
  };
}

// ---------------- identities ----------------

function checkUniqueness(ctx: Ctx): void {
  const seen = new Map<string, AnyRecord>();
  for (const record of allEntities(ctx.corpus)) {
    const key = `${record.kind}|${record.id}`;
    const first = seen.get(key);
    if (first) add(ctx, 'error', 'id.duplicate', record, `duplicate ${record.kind} id ${record.id} (also in ${first.file})`);
    else seen.set(key, record);
  }
  for (const situation of ctx.corpus.situations) {
    if (ctx.skills.has(situation.id)) add(ctx, 'warning', 'id.cross-kind', situation, `situation id ${situation.id} equals a skill id`);
  }
  for (const task of ctx.corpus.tasks) {
    const t = task.body;
    dupCheck(ctx, task, 'option', (t.options ?? []).map((o) => o.id));
    dupCheck(ctx, task, 'variant', [...(t.accepted ?? []).map((v) => v.id), ...(t.errors ?? []).map((v) => v.id)]);
    dupCheck(ctx, task, 'slot', (t.slots ?? []).map((s) => s.id));
    dupCheck(ctx, task, 'exemplar', (t.rubric?.exemplars ?? []).map((v) => v.id));
    dupCheck(ctx, task, 'target', t.targets.map(targetKey));
  }
  for (const lesson of ctx.corpus.lessons) dupCheck(ctx, lesson, 'step', lesson.body.steps.map((s) => s.id));
  for (const phrase of ctx.corpus.phrases) dupCheck(ctx, phrase, 'recall variant', (phrase.body.recall?.accepted ?? []).map((v) => v.id));
}

function dupCheck(ctx: Ctx, at: AnyRecord, what: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) add(ctx, 'error', 'id.duplicate-local', at, `duplicate ${what} id ${id}`);
    seen.add(id);
  }
}

// ---------------- ledger, objectives, CV ----------------

function checkLedger(ctx: Ctx): void {
  const { ledger } = ctx;
  for (const id of [...ledger.lessons, ...ledger.checks]) {
    if (!ctx.lessons.has(id)) {
      add(ctx, 'error', 'ledger.lesson-missing', undefined, `${isCheckId(id) ? 'optional check' : 'lesson'} ${id} has no file lessons/${id}.json`, true);
    }
  }
  for (const lesson of ctx.corpus.lessons) {
    const l = lesson.body;
    if (!ctx.ledgerLessons.has(l.id)) add(ctx, 'error', 'ledger.unknown-lesson', lesson, `${l.id} is not a ledger lesson/check`);
    const expectedKind = isCheckId(l.id) ? 'optional-check' : 'lesson';
    if (l.kind !== expectedKind) add(ctx, 'error', 'lesson.kind', lesson, `${l.id} must have kind ${expectedKind}`);
    if (blockOfLesson(l.id) !== l.blockId) add(ctx, 'error', 'lesson.block', lesson, `blockId ${l.blockId} does not match ${l.id}`);
    for (const objective of l.objectives) {
      const block = ctx.ledgerObjectives.get(objective);
      if (!block) add(ctx, 'error', 'ref.objective', lesson, `unknown objective ${objective}`);
      else if (block !== l.blockId) add(ctx, 'warning', 'lesson.objective-block', lesson, `objective ${objective} belongs to block ${block}`);
    }
    for (const cv of l.cv ?? []) if (!ctx.ledgerCv.has(cv)) add(ctx, 'error', 'ref.cv', lesson, `unknown supporting allocation ${cv}`);
  }
  const objectivesWithSkill = new Set<string>();
  const objectivesWithLesson = new Set(ctx.corpus.lessons.flatMap((l) => l.body.objectives));
  for (const skill of ctx.corpus.skills) {
    for (const objective of skill.body.parentObjectives) {
      if (!ctx.ledgerObjectives.has(objective)) add(ctx, 'error', 'ref.objective', skill, `unknown parent objective ${objective}`);
      objectivesWithSkill.add(objective);
    }
    for (const cv of skill.body.cv ?? []) if (!ctx.ledgerCv.has(cv)) add(ctx, 'error', 'ref.cv', skill, `unknown supporting allocation ${cv}`);
  }
  for (const objective of ledger.objectives) {
    if (!objectivesWithSkill.has(objective)) {
      add(ctx, 'error', 'ledger.objective-unmapped', undefined, `objective ${objective} is not the parent of any skill`, true);
    }
    if (!objectivesWithLesson.has(objective) && ctx.corpus.lessons.length > 0) {
      add(ctx, 'warning', 'ledger.objective-no-lesson', undefined, `objective ${objective} is not listed by any lesson`);
    }
  }
  for (const cv of ledger.cv) {
    if (!ctx.corpus.lessons.some((l) => (l.body.cv ?? []).includes(cv))) {
      add(ctx, 'error', 'cv.lesson-missing', undefined, `${cv} is not allocated to any lesson (lesson.cv)`, true);
    }
    if (!ctx.corpus.skills.some((s) => (s.body.cv ?? []).includes(cv))) {
      add(ctx, 'error', 'cv.skill-missing', undefined, `${cv} is not allocated to any skill (skill.cv)`, true);
    }
  }
}

// ---------------- skills and prerequisites ----------------

function lessonRef(ctx: Ctx, at: AnyRecord, id: string, what: string): boolean {
  if (ctx.ledgerLessons.has(id)) return true;
  add(ctx, 'error', 'ref.lesson', at, `${what} ${id} is not a ledger lesson/check`);
  return false;
}

function checkSkills(ctx: Ctx): void {
  for (const record of ctx.corpus.skills) {
    const s = record.body;
    lessonRef(ctx, record, s.firstLesson, 'firstLesson');
    const fileBlock = /^skills\/(A[12]-0[1-8])\.json$/.exec(record.file)?.[1];
    if (fileBlock && blockOfLesson(s.firstLesson) !== fileBlock) {
      add(ctx, 'warning', 'skill.block-mismatch', record, `firstLesson ${s.firstLesson} is outside the file's block ${fileBlock}`);
    }
    for (const [group, ids] of Object.entries(s.returns)) {
      for (const id of ids as string[]) {
        if (!lessonRef(ctx, record, id, `returns.${group}`)) continue;
        if (compareLessons(id, s.firstLesson) < 0) add(ctx, 'warning', 'skill.return-before-first', record, `returns.${group} ${id} precedes firstLesson ${s.firstLesson}`);
        if (group === 'check' && !isCheckId(id)) add(ctx, 'warning', 'skill.return-check', record, `returns.check ${id} is not an optional check (C1)`);
      }
    }
    if (s.scope.exceptionOf !== undefined && !ctx.skills.has(s.scope.exceptionOf)) {
      add(ctx, 'error', 'ref.skill', record, `scope.exceptionOf ${s.scope.exceptionOf} does not exist`);
    }
    if (s.kind === 'exception' && s.scope.exceptionOf === undefined) add(ctx, 'warning', 'skill.exception-of', record, 'exception skill without scope.exceptionOf');
    for (const source of s.sources) if (!ctx.sources.has(source.sourceId)) add(ctx, 'error', 'ref.source', record, `unknown source ${source.sourceId}`);
    for (const situation of s.situations ?? []) if (!ctx.situations.has(situation)) add(ctx, 'error', 'ref.situation', record, `unknown situation ${situation}`);
    for (const p of s.prerequisites) {
      const prereq = ctx.skills.get(p);
      if (!prereq) {
        add(ctx, 'error', 'ref.skill', record, `unknown prerequisite ${p}`);
        continue;
      }
      if (courseIndex(prereq.body.firstLesson) !== undefined && courseIndex(s.firstLesson) !== undefined && compareLessons(prereq.body.firstLesson, s.firstLesson) > 0) {
        add(ctx, 'error', 'prereq.order', record, `prerequisite ${p} is first taught in ${prereq.body.firstLesson}, after ${s.firstLesson}`);
      }
    }
  }
}

function checkPrerequisiteGraph(ctx: Ctx): void {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const stack: string[] = [];
  const reported = new Set<string>();
  const visit = (id: string): void => {
    color.set(id, GREY);
    stack.push(id);
    for (const next of ctx.skills.get(id)?.body.prerequisites ?? []) {
      if (!ctx.skills.has(next)) continue;
      const c = color.get(next) ?? WHITE;
      if (c === GREY) {
        const cycle = [...stack.slice(stack.indexOf(next)), next];
        const key = [...new Set(cycle)].sort().join(',');
        if (!reported.has(key)) {
          reported.add(key);
          const at = ctx.skills.get(next);
          add(ctx, 'error', 'prereq.cycle', at, `prerequisite cycle: ${cycle.join(' -> ')}`);
        }
      } else if (c === WHITE) visit(next);
    }
    stack.pop();
    color.set(id, BLACK);
  };
  for (const id of [...ctx.skills.keys()].sort()) if ((color.get(id) ?? WHITE) === WHITE) visit(id);
}

// ---------------- lessons ----------------

const BLOCK_STEPS = new Set(['explanation', 'examples', 'summary', 'reading']);
const PRACTICE_STEPS = new Set(['supported-practice', 'independent-practice', 'self-check', 'writing']);

function checkLessons(ctx: Ctx): void {
  const tasksByLesson = new Map<string, EntityRecord<Task>[]>();
  for (const task of ctx.corpus.tasks) tasksByLesson.set(task.body.lessonId, [...(tasksByLesson.get(task.body.lessonId) ?? []), task]);
  for (const record of ctx.corpus.lessons) {
    const l = record.body;
    for (const situation of l.situations) if (!ctx.situations.has(situation)) add(ctx, 'error', 'ref.situation', record, `unknown situation ${situation}`);
    for (const skillId of l.introduces) {
      const skill = ctx.skills.get(skillId);
      if (!skill) add(ctx, 'error', 'ref.skill', record, `introduces unknown skill ${skillId}`);
      else if (skill.body.firstLesson !== l.id) add(ctx, 'error', 'lesson.introduces-mismatch', record, `introduces ${skillId} whose firstLesson is ${skill.body.firstLesson}`);
    }
    for (const skillId of l.revisits) {
      const skill = ctx.skills.get(skillId);
      if (!skill) add(ctx, 'error', 'ref.skill', record, `revisits unknown skill ${skillId}`);
      else if (compareLessons(skill.body.firstLesson, l.id) >= 0) add(ctx, 'error', 'lesson.revisit-before-intro', record, `revisits ${skillId} first taught in ${skill.body.firstLesson}`);
    }
    if (l.kind === 'lesson' && !l.steps.some((s) => s.required)) add(ctx, 'warning', 'lesson.no-required-step', record, 'no step is required');
    const referenced = new Set<string>();
    for (const step of l.steps) {
      const blocks = step.blocks ?? [];
      const taskIds = step.taskIds ?? [];
      const clipIds = step.clipIds ?? [];
      checkBlocks(ctx, record, blocks, `step ${step.id}`);
      if (BLOCK_STEPS.has(step.kind) && blocks.length === 0) add(ctx, 'error', 'lesson.empty-step', record, `step ${step.id} (${step.kind}) has no blocks`);
      if (PRACTICE_STEPS.has(step.kind) && taskIds.length === 0 && !blocks.some((b) => b.type === 'practice-link')) {
        add(ctx, 'error', 'lesson.empty-step', record, `step ${step.id} (${step.kind}) has no tasks or practice link`);
      }
      if (step.kind === 'listening' && clipIds.length === 0 && taskIds.length === 0) add(ctx, 'error', 'lesson.empty-step', record, `listening step ${step.id} has no clips or tasks`);
      for (const clipId of clipIds) if (!ctx.clips.has(clipId)) add(ctx, 'error', 'ref.clip', record, `step ${step.id} references unknown clip ${clipId}`);
      for (const taskId of taskIds) {
        referenced.add(taskId);
        const task = ctx.tasks.get(taskId);
        if (!task) {
          add(ctx, 'error', 'ref.task', record, `step ${step.id} references unknown task ${taskId}`);
          continue;
        }
        if (task.body.lessonId !== l.id) {
          add(ctx, 'warning', 'lesson.foreign-task', record, `step ${step.id} uses task ${taskId} owned by ${task.body.lessonId}`);
          for (const target of task.body.targets) {
            const skill = ctx.skills.get(target.skillId);
            if (skill && compareLessons(skill.body.firstLesson, l.id) > 0) {
              add(ctx, 'error', 'task.untaught-target', record, `step ${step.id} task ${taskId} targets ${target.skillId}, first taught in ${skill.body.firstLesson}`);
            }
          }
        }
        if (task.body.role === 'delayed' || task.body.role === 'transfer') {
          add(ctx, 'warning', 'lesson.held-out-in-step', record, `step ${step.id} shows held-out ${task.body.role} task ${taskId}`);
        }
      }
    }
    for (const task of tasksByLesson.get(l.id) ?? []) {
      if ((task.body.role === 'supported' || task.body.role === 'independent') && !referenced.has(task.id)) {
        add(ctx, 'warning', 'lesson.unlinked-task', record, `${task.body.role} task ${task.id} is not referenced by any step`);
      }
    }
  }
  for (const skill of ctx.corpus.skills) {
    const lesson = ctx.lessons.get(skill.body.firstLesson);
    if (lesson && !lesson.body.introduces.includes(skill.id)) {
      add(ctx, 'error', 'lesson.introduces-missing', lesson, `skill ${skill.id} has firstLesson ${lesson.id} but is not in introduces`);
    }
  }
}

// ---------------- blocks (practice links, tables) ----------------

function checkTargetRef(ctx: Ctx, at: AnyRecord, target: Target, where: string): EntityRecord<Skill> | undefined {
  const skill = ctx.skills.get(target.skillId);
  if (!skill) {
    add(ctx, 'error', 'ref.skill', at, `${where}: unknown skill ${target.skillId}`);
    return undefined;
  }
  if (!skill.body.modalities.includes(target.modality)) {
    add(ctx, 'error', 'ref.modality', at, `${where}: skill ${target.skillId} has no modality ${target.modality}`);
  }
  return skill;
}

function checkBlocks(ctx: Ctx, at: AnyRecord, blocks: Block[], where: string): void {
  for (const block of blocks) {
    if (block.type === 'practice-link') {
      for (const target of block.targets) checkTargetRef(ctx, at, target, `${where} practice link`);
    }
    if (block.type === 'table') {
      for (const row of block.rows) {
        if (row.length !== block.columns.length) add(ctx, 'error', 'block.table-width', at, `${where}: table row width ${row.length} ≠ ${block.columns.length} columns`);
      }
    }
  }
}

// ---------------- tasks ----------------

function checkTasks(ctx: Ctx): void {
  for (const record of ctx.corpus.tasks) {
    const t = record.body;
    const fileLesson = /^tasks\/(.+)\.json$/.exec(record.file)?.[1];
    if (fileLesson && t.lessonId !== fileLesson) add(ctx, 'error', 'task.lesson-file', record, `lessonId ${t.lessonId} differs from its file ${record.file}`);
    if (!t.id.startsWith(`${t.lessonId}-T`)) add(ctx, 'error', 'task.id-prefix', record, `id ${t.id} does not start with ${t.lessonId}-T`);
    lessonRef(ctx, record, t.lessonId, 'lessonId');
    const keys = new Set(t.targets.map(targetKey));
    for (const target of t.targets) {
      const skill = checkTargetRef(ctx, record, target, 'target');
      if (!skill) continue;
      if (!skill.body.assessed) add(ctx, 'error', 'task.target-not-assessed', record, `targets ${target.skillId}, which is assessed:false`);
      if (courseIndex(skill.body.firstLesson) !== undefined && compareLessons(skill.body.firstLesson, t.lessonId) > 0) {
        add(ctx, 'error', 'task.untaught-target', record, `targets ${targetKey(target)} first taught in ${skill.body.firstLesson}, after ${t.lessonId}`);
      }
    }
    checkBlocks(ctx, record, t.prompt, 'prompt');
    for (const [i, hint] of (t.hints ?? []).entries()) {
      checkBlocks(ctx, record, hint.blocks, `hint ${i}`);
      for (const key of hint.targets) if (!keys.has(key)) add(ctx, 'error', 'task.hint-target', record, `hint ${i} target ${key} is not a task target`);
      if (hint.kind === 'transcript' && (t.clipIds ?? []).length === 0) add(ctx, 'warning', 'task.transcript-without-clip', record, `hint ${i} is a transcript but the task has no clip`);
    }
    // Mode-specific shape.
    const requireField = (cond: boolean, field: string): void => {
      if (!cond) add(ctx, 'error', 'task.mode-field', record, `mode ${t.mode} requires ${field}`);
    };
    const irrelevant = (present: boolean, field: string): void => {
      if (present) add(ctx, 'warning', 'task.irrelevant-field', record, `${field} is ignored in mode ${t.mode}`);
    };
    if (t.mode === 'choice') {
      requireField((t.options ?? []).length >= 2, 'options');
      if (t.input !== 'options') add(ctx, 'error', 'task.input', record, 'choice tasks use input "options"');
    } else if (t.input === 'options') add(ctx, 'error', 'task.input', record, `mode ${t.mode} needs input short or multiline`);
    if (t.mode === 'exact-variants') requireField((t.accepted ?? []).length > 0, 'accepted');
    if (t.mode === 'finite-slots') {
      requireField((t.template ?? []).length > 0, 'template');
      requireField((t.slots ?? []).length > 0, 'slots');
    }
    if (t.mode === 'rubric-review') requireField(t.rubric !== undefined, 'rubric');
    if (TEXT_MODES.has(t.mode) && t.policy === undefined) add(ctx, 'error', 'task.policy-missing', record, `mode ${t.mode} requires a policy`);
    irrelevant(t.mode !== 'choice' && t.options !== undefined, 'options');
    irrelevant(t.mode !== 'exact-variants' && (t.accepted !== undefined || t.errors !== undefined), 'accepted/errors');
    irrelevant(t.mode !== 'finite-slots' && (t.template !== undefined || t.slots !== undefined), 'template/slots');
    irrelevant(t.mode !== 'rubric-review' && t.rubric !== undefined, 'rubric');
    if (t.closed === true && (t.mode !== 'exact-variants' || t.targets.length !== 1)) {
      add(ctx, 'error', 'task.closed-misuse', record, 'closed:true is only allowed on single-target exact-variants tasks');
    }
    // Outcome keys must be the task's own targets.
    for (const option of t.options ?? []) for (const key of Object.keys(option.outcomes)) if (!keys.has(key)) add(ctx, 'error', 'key.outcome-target', record, `option ${option.id} outcome ${key} is not a task target`);
    for (const error of t.errors ?? []) for (const key of Object.keys(error.outcomes)) if (!keys.has(key)) add(ctx, 'error', 'key.outcome-target', record, `error variant ${error.id} outcome ${key} is not a task target`);
    for (const slot of t.slots ?? []) if (!keys.has(slot.target)) add(ctx, 'error', 'key.outcome-target', record, `slot ${slot.id} target ${slot.target} is not a task target`);
    if (t.mode === 'finite-slots' && t.template && t.slots) checkTemplate(ctx, record, t);
    // Listening targets need audio.
    const listening = t.targets.some((x) => LISTENING_MODALITIES.includes(x.modality));
    if (listening && (t.clipIds ?? []).length === 0) add(ctx, 'error', 'task.listening-without-clip', record, 'listening/dictation target without clipIds');
    for (const clipId of t.clipIds ?? []) {
      const clip = ctx.clips.get(clipId);
      if (!clip) {
        add(ctx, 'error', 'ref.clip', record, `unknown clip ${clipId}`);
        continue;
      }
      if (compareLessons(clip.body.lessonId, t.lessonId) > 0) add(ctx, 'error', 'task.clip-order', record, `clip ${clipId} belongs to later lesson ${clip.body.lessonId}`);
      for (const target of t.targets.filter((x) => LISTENING_MODALITIES.includes(x.modality))) {
        if (!clip.body.targets.some((ct) => ct.skillId === target.skillId)) {
          add(ctx, 'warning', 'task.clip-target', record, `clip ${clipId} does not target ${target.skillId}`);
        }
      }
    }
    if (canBeUnresolved(t) && t.feedback.unresolvedUk === undefined) {
      add(ctx, 'warning', 'task.unresolved-feedback', record, 'task can yield unresolved but has no feedback.unresolvedUk');
    }
    checkKeys(ctx, record);
  }
}

function canBeUnresolved(t: Task): boolean {
  switch (t.mode) {
    case 'choice':
      return (t.options ?? []).some((o) => t.targets.some((x) => o.outcomes[targetKey(x)] === undefined || o.outcomes[targetKey(x)] === 'unresolved'));
    case 'exact-variants':
      return !(t.closed === true && t.targets.length === 1);
    default:
      return true;
  }
}

function checkTemplate(ctx: Ctx, record: EntityRecord<Task>, t: Task): void {
  const template = t.template ?? [];
  if (hasAdjacentSlots(template)) add(ctx, 'error', 'task.template-adjacent-slots', record, 'template has two slot references without a literal between them');
  if (hasWhitespaceOnlySeparator(template)) add(ctx, 'warning', 'task.template-whitespace-separator', record, 'two slots are separated only by whitespace');
  const used = template.filter((p): p is { slot: string } => typeof p !== 'string').map((p) => p.slot);
  const defined = new Set((t.slots ?? []).map((s) => s.id));
  for (const id of used) if (!defined.has(id)) add(ctx, 'error', 'task.template-slot', record, `template references undefined slot ${id}`);
  for (const id of defined) {
    const n = used.filter((u) => u === id).length;
    if (n !== 1) add(ctx, 'error', 'task.template-slot', record, `slot ${id} appears ${n} times in the template (expected exactly once)`);
  }
}

/** Answer-key self-consistency under the deterministic checker (content/README rule 4). */
function checkKeys(ctx: Ctx, record: EntityRecord<Task>): void {
  const t = record.body;
  const policy = t.policy ?? { case: 'sensitive' as const, terminalPunctuation: 'required' as const };
  const allCorrect = (response: string): boolean => checkTask(t, response).results.every((r) => r.outcome === 'correct');
  if (t.mode === 'choice') {
    const options = t.options ?? [];
    if (!options.some((o) => t.targets.every((x) => o.outcomes[targetKey(x)] === 'correct'))) {
      add(ctx, 'error', 'key.no-correct-option', record, 'no option marks every task target correct');
    }
    for (const option of options) {
      if (!Object.values(option.outcomes).includes('incorrect') && !t.targets.every((x) => option.outcomes[targetKey(x)] === 'correct')) {
        add(ctx, 'warning', 'key.option-uninformative', record, `option ${option.id} marks no target correct or incorrect`);
      }
    }
    const labels = options.map((o) => normalizeBase(o.label));
    labels.forEach((label, i) => {
      if (labels.indexOf(label) !== i) add(ctx, 'error', 'key.duplicate-option', record, `options ${options[labels.indexOf(label)]?.id} and ${options[i]?.id} have the same label`);
    });
  }
  if (t.mode === 'exact-variants') {
    const accepted = t.accepted ?? [];
    for (const v of accepted) if (!allCorrect(v.text)) add(ctx, 'error', 'key.accepted-not-accepted', record, `accepted variant ${v.id} is not accepted by the checker`);
    duplicateForms(ctx, record, accepted.map((v) => ({ id: v.id, text: v.text })), policy, 'accepted');
    for (const e of t.errors ?? []) {
      if (Object.values(e.outcomes).every((o) => o === 'correct')) add(ctx, 'error', 'key.error-all-correct', record, `error variant ${e.id} marks every target correct`);
      const collision = accepted.find((a) => keyForms(a.text, policy).includes(normalizeResponse(e.text, policy)));
      if (collision) {
        add(ctx, 'error', 'key.error-collides-accepted', record, `error variant ${e.id} normalizes to accepted variant ${collision.id}`);
        continue;
      }
      const result = checkTask(t, e.text).results;
      for (const r of result) {
        const declared = e.outcomes[r.key];
        if (declared !== undefined && declared !== r.outcome) {
          add(ctx, 'error', 'key.error-outcome', record, `error variant ${e.id} checks as ${r.outcome} for ${r.key}, declared ${declared}`);
        }
      }
    }
    duplicateForms(ctx, record, (t.errors ?? []).map((v) => ({ id: v.id, text: v.text })), policy, 'error');
  }
  if (t.mode === 'finite-slots' && t.template && t.slots && !hasAdjacentSlots(t.template)) {
    const slots = t.slots;
    const base = new Map(slots.map((s) => [s.id, s.accepted[0] ?? '']));
    for (const slot of slots) {
      const norms = slot.accepted.map((a) => normalizeResponse(a, policy));
      for (const err of slot.errors ?? []) {
        if (norms.includes(normalizeResponse(err.text, policy))) add(ctx, 'error', 'key.error-collides-accepted', record, `slot ${slot.id} error "${err.text}" equals an accepted value`);
      }
      for (const value of slot.accepted) {
        const values = new Map(base);
        values.set(slot.id, value);
        if (!allCorrect(renderTemplate(t.template, values))) {
          add(ctx, 'error', 'key.slot-roundtrip', record, `slot ${slot.id} accepted value "${value}" does not check as correct when rendered into the template`);
        }
      }
      for (const err of slot.errors ?? []) {
        if (norms.includes(normalizeResponse(err.text, policy))) continue;
        const values = new Map(base);
        values.set(slot.id, err.text);
        const outcome = checkTask(t, renderTemplate(t.template, values)).results.find((r) => r.key === slot.target)?.outcome;
        if (outcome !== 'incorrect') add(ctx, 'error', 'key.slot-roundtrip', record, `slot ${slot.id} error value "${err.text}" checks as ${outcome ?? 'missing'}, expected incorrect`);
      }
    }
  }
  if (t.mode === 'rubric-review') {
    const exemplars = t.rubric?.exemplars ?? [];
    for (const v of exemplars) if (!allCorrect(v.text)) add(ctx, 'error', 'key.accepted-not-accepted', record, `exemplar ${v.id} is not accepted by the checker`);
    duplicateForms(ctx, record, exemplars.map((v) => ({ id: v.id, text: v.text })), policy, 'exemplar');
  }
}

function duplicateForms(ctx: Ctx, at: AnyRecord, variants: Array<{ id: string; text: string }>, policy: { case: 'sensitive' | 'insensitive'; terminalPunctuation: 'required' | 'optional' }, what: string): void {
  const seen = new Map<string, string>();
  for (const v of variants) {
    const norm = normalizeResponse(v.text, policy);
    const first = seen.get(norm);
    if (first) add(ctx, 'warning', 'key.duplicate-variant', at, `${what} variants ${first} and ${v.id} are identical after normalization`);
    else seen.set(norm, v.id);
  }
}

// ---------------- clips and listening ----------------

function checkClipsAndListening(ctx: Ctx): void {
  const meaningTaskClips = new Set<string>();
  for (const task of ctx.corpus.tasks) {
    if (task.body.targets.some((x) => x.modality === 'listening-meaning')) for (const c of task.body.clipIds ?? []) meaningTaskClips.add(c);
  }
  for (const record of ctx.corpus.clips) {
    const c = record.body;
    lessonRef(ctx, record, c.lessonId, 'lessonId');
    const fileBlock = /^audio\/(A[12]-0[1-8])\.json$/.exec(record.file)?.[1];
    if (fileBlock && blockOfLesson(c.lessonId) !== fileBlock) add(ctx, 'warning', 'clip.block-mismatch', record, `lessonId ${c.lessonId} is outside the file's block ${fileBlock}`);
    for (const target of c.targets) {
      const skill = checkTargetRef(ctx, record, target, 'target');
      if (!LISTENING_MODALITIES.includes(target.modality)) add(ctx, 'warning', 'clip.target-modality', record, `target ${targetKey(target)} is not a listening modality`);
      if (skill && courseIndex(skill.body.firstLesson) !== undefined && compareLessons(skill.body.firstLesson, c.lessonId) > 0) {
        add(ctx, 'error', 'clip.untaught-target', record, `targets ${targetKey(target)} first taught in ${skill.body.firstLesson}, after ${c.lessonId}`);
      }
    }
    if (!meaningTaskClips.has(c.id)) add(ctx, 'error', 'clip.no-meaning-task', record, 'no listening-meaning task uses this clip', true);
  }
  for (const skill of ctx.corpus.skills) {
    if (!skill.body.assessed || !skill.body.modalities.includes('listening-meaning')) continue;
    const transcripts = new Set(
      ctx.corpus.clips
        .filter((c) => c.body.reviewStatus !== 'quarantined' && c.body.targets.some((x) => x.skillId === skill.id && x.modality === 'listening-meaning'))
        .map((c) => normalizeResponse(c.body.transcript, { case: 'insensitive', terminalPunctuation: 'required' })),
    );
    if (transcripts.size < 2) {
      add(ctx, 'error', 'listening.clips', skill, `listening target ${skill.id}/listening-meaning has ${transcripts.size} distinct clip(s); at least 2 required`, true);
    }
  }
}

// ---------------- lexicon, phrases, collections, materials, situations ----------------

function checkLexicon(ctx: Ctx): void {
  const lemmas = new Map<string, string>();
  for (const record of ctx.corpus.lexemes) {
    const x = record.body;
    lessonRef(ctx, record, x.firstLesson, 'firstLesson');
    const fileBlock = /^lexicon\/(A[12]-0[1-8])\.json$/.exec(record.file)?.[1];
    if (fileBlock && blockOfLesson(x.firstLesson) !== fileBlock) add(ctx, 'warning', 'lexeme.block-mismatch', record, `firstLesson ${x.firstLesson} is outside the file's block ${fileBlock}`);
    const key = `${x.lemma.normalize('NFC')}|${x.pos}`;
    const first = lemmas.get(key);
    if (first) add(ctx, 'warning', 'lexeme.duplicate-lemma', record, `lemma ${x.lemma} (${x.pos}) is also ${first}`);
    else lemmas.set(key, x.id);
  }
}

function checkPhrasesAndCollections(ctx: Ctx): void {
  const inCollection = new Set(ctx.corpus.collections.flatMap((c) => c.body.phraseIds));
  for (const record of ctx.corpus.phrases) {
    const p = record.body;
    lessonRef(ctx, record, p.firstLesson, 'firstLesson');
    for (const skillId of p.skills) {
      const skill = ctx.skills.get(skillId);
      if (!skill) add(ctx, 'error', 'ref.skill', record, `unknown skill ${skillId}`);
      else if (compareLessons(skill.body.firstLesson, p.firstLesson) > 0) add(ctx, 'warning', 'phrase.untaught-skill', record, `skill ${skillId} is first taught in ${skill.body.firstLesson}, after ${p.firstLesson}`);
    }
    for (const situation of p.situations) if (!ctx.situations.has(situation)) add(ctx, 'error', 'ref.situation', record, `unknown situation ${situation}`);
    for (const clipId of p.clipIds ?? []) if (!ctx.clips.has(clipId)) add(ctx, 'error', 'ref.clip', record, `unknown clip ${clipId}`);
    for (const taskId of p.variationTaskIds ?? []) if (!ctx.tasks.has(taskId)) add(ctx, 'error', 'ref.task', record, `unknown variation task ${taskId}`);
    if (p.recall) duplicateForms(ctx, record, p.recall.accepted.map((v) => ({ id: v.id, text: v.text })), p.recall.policy, 'recall');
    if (inCollection.has(p.id) && !p.recall) add(ctx, 'warning', 'phrase.no-recall', record, 'collection phrase without exact recall variants');
  }
  if (!ctx.corpus.files.some((f) => f.def === 'CollectionFile')) {
    add(ctx, 'error', 'collections.missing', undefined, 'collections.json is missing (exactly 8 prepared collections required)', true);
  }
  if (ctx.corpus.collections.length > 0 && ctx.corpus.collections.length !== 8) {
    add(ctx, 'error', 'collections.count', undefined, `${ctx.corpus.collections.length} collections; exactly 8 required`);
  }
  for (const record of ctx.corpus.collections) {
    const c = record.body;
    if (new Set(c.phraseIds).size !== 12) add(ctx, 'error', 'collection.size', record, `${new Set(c.phraseIds).size} distinct phrases; exactly 12 required`);
    for (const id of c.phraseIds) if (!ctx.phrases.has(id)) add(ctx, 'error', 'ref.phrase', record, `unknown phrase ${id}`);
  }
}

function checkMaterials(ctx: Ctx): void {
  for (const record of ctx.corpus.materials) {
    const m: Material = record.body;
    const isBlock = /^A[12]-0[1-8]$/.test(m.topicId);
    if (isBlock ? !ctx.ledgerBlocks.has(m.topicId) : !ctx.ledgerLessons.has(m.topicId)) add(ctx, 'error', 'ref.topic', record, `unknown topic ${m.topicId}`);
    const fileBlock = /^materials\/(A[12]-0[1-8])\.json$/.exec(record.file)?.[1];
    if (fileBlock && !m.topicId.startsWith(fileBlock)) add(ctx, 'warning', 'material.block-mismatch', record, `topic ${m.topicId} is outside the file's block ${fileBlock}`);
    checkBlocks(ctx, record, m.blocks, 'material');
    for (const key of m.linkedTargets) {
      const target = parseTargetKey(key);
      if (!target) {
        add(ctx, 'error', 'ref.target', record, `malformed target ${key}`);
        continue;
      }
      const skill = checkTargetRef(ctx, record, target, 'linkedTargets');
      if (skill && !isBlock && compareLessons(skill.body.firstLesson, m.topicId) > 0) add(ctx, 'warning', 'material.untaught-target', record, `${key} is first taught in ${skill.body.firstLesson}`);
    }
  }
}

function checkSituations(ctx: Ctx): void {
  const used = new Set([
    ...ctx.corpus.lessons.flatMap((l) => l.body.situations),
    ...ctx.corpus.skills.flatMap((s) => s.body.situations ?? []),
    ...ctx.corpus.phrases.flatMap((p) => p.body.situations),
  ]);
  for (const record of ctx.corpus.situations) {
    for (const id of [...record.body.firstLessons, ...(record.body.laterLessons ?? [])]) lessonRef(ctx, record, id, 'lesson');
    if (!used.has(record.id) && ctx.corpus.lessons.length > 0) add(ctx, 'warning', 'situation.unused', record, 'not used by any lesson, skill or phrase');
  }
}

/**
 * content/source/blocks.json: when present, exactly the ledger's blocks (A1-01 … A2-08), each once.
 * An absent file (partial corpus/test fixture) is not an issue: packs then carry no `blocks` and the app
 * falls back to block ids. The real corpus is covered by tests/integration/server-blocks.test.ts.
 */
function checkCourseBlocks(ctx: Ctx): void {
  const blocks = ctx.corpus.blocks;
  const fileRef = (id: string) => ({ kind: 'situation' as EntityKind, id, file: 'blocks.json' });
  if (!ctx.corpus.files.some((f) => f.file === 'blocks.json')) return;
  const seen = new Set<string>();
  for (const b of blocks) {
    if (seen.has(b.id)) add(ctx, 'error', 'blocks.duplicate', fileRef(b.id), `block ${b.id} is listed twice`);
    seen.add(b.id);
    if (!ctx.ledgerBlocks.has(b.id)) add(ctx, 'error', 'blocks.unknown', fileRef(b.id), `block ${b.id} is not a ledger block`);
  }
  for (const id of ctx.ledgerBlocks) if (!seen.has(id)) add(ctx, 'error', 'blocks.missing-block', undefined, `ledger block ${id} has no entry in blocks.json`);
}

// ---------------- target coverage and banks ----------------

function checkTargetsTested(ctx: Ctx): void {
  const tested = new Set<string>();
  for (const task of ctx.corpus.tasks) for (const target of task.body.targets) tested.add(targetKey(target));
  for (const phrase of ctx.corpus.phrases) if (phrase.body.recall) for (const s of phrase.body.skills) tested.add(`${s}/phrase-recall`);
  for (const skill of ctx.corpus.skills) {
    if (!skill.body.assessed) continue;
    for (const modality of skill.body.modalities) {
      const key = `${skill.id}/${modality}`;
      if (!tested.has(key)) add(ctx, 'error', 'target.untested', skill, `assessed target ${key} has no task`, true);
    }
  }
}

export interface BankStats {
  skillId: string;
  total: number;
  supported: number;
  independent: number;
  heldOut: number;
  families: number;
  modes: number;
  justified: boolean;
}

/** Tasks indexed by every skill they target (any modality). */
export function tasksBySkill(corpus: Corpus): Map<string, EntityRecord<Task>[]> {
  const index = new Map<string, EntityRecord<Task>[]>();
  for (const task of corpus.tasks) {
    for (const skillId of new Set(task.body.targets.map((x) => x.skillId))) {
      const list = index.get(skillId) ?? [];
      list.push(task);
      index.set(skillId, list);
    }
  }
  return index;
}

/** Bank allocation of every small productive grammar target (non-quarantined tasks). */
export function bankStats(corpus: Corpus): BankStats[] {
  const stats: BankStats[] = [];
  const index = tasksBySkill(corpus);
  for (const record of corpus.skills) {
    const skill = record.body;
    if (!isProductiveSkill(skill)) continue;
    const tasks = (index.get(skill.skillId) ?? [])
      .map((t) => t.body)
      .filter((t) => t.reviewStatus !== 'quarantined' && t.targets.some((x) => x.skillId === skill.skillId && PRODUCTIVE_MODALITIES.includes(x.modality)));
    stats.push({
      skillId: skill.skillId,
      total: tasks.length,
      supported: tasks.filter((t) => t.role === 'supported').length,
      independent: tasks.filter((t) => t.role === 'independent').length,
      heldOut: tasks.filter((t) => t.role === 'delayed' || t.role === 'transfer').length,
      families: new Set(tasks.map((t) => t.family)).size,
      modes: new Set(tasks.map((t) => t.mode)).size,
      justified: (skill.bankJustificationUk ?? '').trim().length > 0,
    });
  }
  return stats;
}

function checkBanks(ctx: Ctx): void {
  for (const s of bankStats(ctx.corpus)) {
    const at = ctx.skills.get(s.skillId);
    if (s.total === 0 || s.justified) continue;
    if (s.total < 8 || s.total > 12) add(ctx, 'warning', 'bank.size', at, `${s.total} task instances (accepted 8–12) without bankJustificationUk`);
    if (s.supported < 2 || s.independent < 4 || s.heldOut < 4) {
      add(ctx, 'warning', 'bank.roles', at, `roles supported ${s.supported}/2, independent ${s.independent}/4, delayed+transfer ${s.heldOut}/4`);
    }
    if (s.families < 2) add(ctx, 'warning', 'bank.families', at, `${s.families} context family; at least 2 required`);
  }
  const index = tasksBySkill(ctx.corpus);
  for (const record of ctx.corpus.skills) {
    const own = index.get(record.id) ?? [];
    const practiceFamilies = new Set(own.filter((t) => t.body.role === 'supported' || t.body.role === 'independent').map((t) => t.body.family));
    for (const t of own) {
      if (t.body.role === 'transfer' && practiceFamilies.has(t.body.family)) {
        add(ctx, 'warning', 'bank.transfer-family', t, `transfer task reuses practice family ${t.body.family} of ${record.id}`);
      }
    }
  }
}

// ---------------- language, placeholders, normalization ----------------

const SPANISH_FIELDS = new Set(['spanish', 'transcript', 'lemma', 'plural', 'termEs', 'referenceAnswer']);

/** Walks string leaves with their key path. */
function walkStrings(value: unknown, path: string[], visit: (text: string, path: string[]) => void): void {
  if (typeof value === 'string') visit(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, [...path, String(i)], visit));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walkStrings(v, [...path, k], visit);
}

const PLACEHOLDER_ANY_CASE = /\b(?:TBD|FIXME|lorem ipsum|placeholder)\b|\{\{|\}\}|\?\?\?/i;
// Case-sensitive and only in its marker forms ("TODO:", "TODO(", a trailing bare "TODO"):
// Spanish "todo/todos" is ordinary text and an all-caps notice ("TODO A 1 €") is legitimate.
const PLACEHOLDER_UPPER = /\bTODO\b\s*(?:[:(]|$)|\bXXX\b/;

export function placeholderMatch(text: string): string | undefined {
  return PLACEHOLDER_ANY_CASE.exec(text)?.[0] ?? PLACEHOLDER_UPPER.exec(text)?.[0];
}

function checkTexts(ctx: Ctx): void {
  for (const record of allEntities(ctx.corpus)) {
    const state = entityState(record);
    const strict = state === 'reviewed' || state === 'ready';
    walkStrings(record.body, [], (text, path) => {
      const field = path.filter((p) => !/^\d+$/.test(p)).at(-1) ?? '';
      const where = path.join('.');
      const hit = placeholderMatch(text);
      if (hit) {
        add(ctx, strict ? 'error' : 'warning', 'text.placeholder', record, `${where} contains placeholder text "${hit}"${strict ? ` in a ${state} item` : ''}`);
      }
      if (text !== text.normalize('NFC')) add(ctx, 'warning', 'text.not-nfc', record, `${where} is not Unicode NFC`);
      if (field.endsWith('Uk') || field === 'ukrainian' || field === 'meaningUk') {
        if (!CYRILLIC.test(text)) add(ctx, 'warning', 'lang.uk-no-cyrillic', record, `${where} has no Cyrillic letters`);
        if (RUSSIAN_ONLY.test(text)) add(ctx, 'warning', 'lang.uk-russian-letters', record, `${where} contains letters that do not exist in Ukrainian (ы э ъ ё)`);
      }
      if (SPANISH_FIELDS.has(field) && CYRILLIC.test(text)) add(ctx, 'warning', 'lang.es-cyrillic', record, `${where} (Spanish) contains Cyrillic`);
    });
    walkBlocks(record.body, (block, where) => {
      if (block.type === 'paragraph' || block.type === 'bullet-list' || block.type === 'table') {
        const text = block.type === 'paragraph' ? block.text : block.type === 'bullet-list' ? block.items.join(' ') : [...block.columns, ...block.rows.flat()].join(' ');
        if (block.language === 'uk' && !CYRILLIC.test(text) && LATIN.test(text)) {
          add(ctx, 'warning', 'lang.block-uk-latin', record, `${where}: block tagged uk has only Latin text (Spanish blocks must be tagged es-ES)`);
        }
        if (block.language === 'es-ES' && CYRILLIC.test(text)) add(ctx, 'warning', 'lang.block-es-cyrillic', record, `${where}: block tagged es-ES contains Cyrillic`);
      }
      if (block.type === 'example' && CYRILLIC.test(block.spanish)) add(ctx, 'warning', 'lang.es-cyrillic', record, `${where}: example.spanish contains Cyrillic`);
    });
  }
}

function walkBlocks(value: unknown, visit: (block: Block, where: string) => void, path = ''): void {
  if (Array.isArray(value)) value.forEach((v, i) => walkBlocks(v, visit, `${path}.${i}`));
  else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.type === 'string' && ['paragraph', 'bullet-list', 'example', 'practice-link', 'table'].includes(obj.type) && !('id' in obj)) {
      visit(obj as unknown as Block, path.slice(1));
      return;
    }
    for (const [k, v] of Object.entries(obj)) walkBlocks(v, visit, `${path}.${k}`);
  }
}

// ---------------- review / readiness evidence ----------------

function checkReadiness(ctx: Ctx, receipts: ReceiptIndex | undefined): void {
  for (const record of allEntities(ctx.corpus)) {
    if (record.kind === 'source') continue;
    const state = entityState(record);
    if (state !== 'reviewed' && state !== 'ready') continue;
    const hash = entityHash(record);
    if (!receipts) {
      add(ctx, 'error', 'review.no-index', record, `${state} item cannot be verified: no review index`);
      continue;
    }
    if (!receipts.hasReviewReceipt(record.kind, record.id, hash)) {
      add(ctx, 'error', 'review.receipt-missing', record, `${state} without an opposite-provider review receipt for content hash ${hash.slice(0, 12)}…`);
    }
    if (state === 'ready' && !receipts.hasValidationReceipt(record.kind, record.id, hash)) {
      add(ctx, 'error', 'review.validation-missing', record, `ready without a local validation receipt for content hash ${hash.slice(0, 12)}…`);
    }
  }
}

// ---------------- entry points ----------------

export interface RunValidationOptions extends LoadOptions, ValidateOptions {
  ledgerPath?: string;
}

export interface RunValidationResult extends ValidationReport {
  corpus: Corpus;
  ledger: Ledger;
}

/** Loads (schema-validates) and semantically validates the corpus. */
export function runValidation(options: RunValidationOptions = {}): RunValidationResult {
  const { corpus, issues } = loadCorpus(options);
  const ledger = loadLedger(options.ledgerPath ?? DEFAULT_LEDGER_PATH);
  const report = validateCorpus(corpus, ledger, options);
  return {
    corpus,
    ledger,
    errors: [...issues.filter((i) => i.level === 'error'), ...report.errors],
    warnings: [...issues.filter((i) => i.level === 'warning'), ...report.warnings],
  };
}

export function formatIssue(issue: Issue): string {
  const where = [issue.file, issue.entity ? `${issue.entity.kind} ${issue.entity.id}` : undefined].filter(Boolean).join(' · ');
  return `[${issue.code}] ${where ? `${where}: ` : ''}${issue.message}`;
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));
  const { createReceiptIndex } = await import('../review/store.ts');
  const reviewsDir = flagString(flags, 'reviews') ?? DEFAULT_REVIEWS_DIR;
  const receipts = createReceiptIndex({ reviewsDir, verifySignatures: flags.has('verify-signatures') });
  const result = runValidation({
    sourceDir: flagString(flags, 'source') ?? DEFAULT_SOURCE_DIR,
    ledgerPath: flagString(flags, 'ledger') ?? DEFAULT_LEDGER_PATH,
    allowIncomplete: flags.has('allow-incomplete'),
    receipts,
  });
  if (flags.has('json')) {
    console.log(JSON.stringify({ errors: result.errors, warnings: result.warnings }, null, 2));
  } else {
    const byCode = (list: Issue[]): string =>
      Object.entries(list.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.code]: (acc[i.code] ?? 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1])
        .map(([code, n]) => `${code}×${n}`)
        .join(', ');
    console.log(`content:validate — ${result.corpus.files.length} files, ${allEntities(result.corpus).length} entities`);
    if (result.warnings.length > 0) {
      console.log(`\nWARNINGS (${result.warnings.length}): ${byCode(result.warnings)}`);
      for (const w of result.warnings) console.log(`  ${formatIssue(w)}`);
    }
    if (result.errors.length > 0) {
      console.error(`\nERRORS (${result.errors.length}): ${byCode(result.errors)}`);
      for (const e of result.errors) console.error(`  ${formatIssue(e)}`);
    }
    console.log(`\n${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
  }
  if (result.errors.length > 0) process.exit(1);
}

if (isMain(import.meta.url)) await main();
