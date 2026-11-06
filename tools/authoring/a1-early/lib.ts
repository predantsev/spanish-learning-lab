// Authoring helpers for the A1-01 … A1-03 range (issue #111, brief 09). They only give the
// hand-written lesson/task/clip/material data a compact, type-checked shape; every Spanish and
// Ukrainian string is authored in the unit files. `build.ts` writes concrete JSON into
// content/source/ (committed); nothing is generated at runtime.
//
// Review status is preserved: when an entity's content hash (canonical body without
// `reviewStatus`, as tools/content/load.ts computes it) is unchanged, the status already on disk is
// kept; any content change writes `draft`, so a stale review receipt can never be reused.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSha256 } from '../../content/canonical.ts';
import type {
  Block,
  ChoiceOption,
  Clip,
  ErrorVariant,
  Hint,
  Lesson,
  Material,
  Modality,
  Outcome,
  Policy,
  ReviewStatus,
  Slot,
  Step,
  StepKind,
  Target,
  Task,
  TaskRole,
  TemplatePart,
  Variant,
} from '../../content/types.ts';

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const SOURCE = join(REPO, 'content', 'source');

// ---------------- blocks ----------------

export const uk = (text: string): Block => ({ type: 'paragraph', language: 'uk', text });
export const es = (text: string): Block => ({ type: 'paragraph', language: 'es-ES', text });
export const ex = (spanish: string, ukrainian: string): Block => ({ type: 'example', spanish, ukrainian });
export const ulUk = (...items: string[]): Block => ({ type: 'bullet-list', language: 'uk', items });
export const ulEs = (...items: string[]): Block => ({ type: 'bullet-list', language: 'es-ES', items });
export const tableUk = (columns: string[], rows: string[][]): Block => ({ type: 'table', language: 'uk', columns, rows });
export const tableEs = (columns: string[], rows: string[][]): Block => ({ type: 'table', language: 'es-ES', columns, rows });
export function link(labelUk: string, keys: string[], mode: 'written' | 'listening' | 'mixed', maxItems: number): Block {
  return { type: 'practice-link', labelUk, targets: keys.map(target), mode, maxItems };
}

// ---------------- targets, outcomes, policies ----------------

const MODALITIES: readonly Modality[] = ['written-form', 'context-choice', 'reading-meaning', 'listening-meaning', 'dictation', 'phrase-recall', 'construction-use'];

export function target(key: string): Target {
  const slash = key.lastIndexOf('/');
  const skillId = key.slice(0, slash);
  const modality = key.slice(slash + 1) as Modality;
  if (slash <= 0 || !MODALITIES.includes(modality)) throw new Error(`bad target key ${key}`);
  return { skillId, modality };
}

/** 'c' = every target correct; 'x' = the single target incorrect; object = explicit per-target verdicts (c/x/u). */
export type OutcomeSpec = 'c' | 'x' | Record<string, 'c' | 'x' | 'u'>;

const VERDICT: Record<'c' | 'x' | 'u', Outcome> = { c: 'correct', x: 'incorrect', u: 'unresolved' };

export function outcomes(targets: string[], spec: OutcomeSpec, where: string): Record<string, Outcome> {
  if (spec === 'c') return Object.fromEntries(targets.map((t) => [t, 'correct' as const]));
  if (spec === 'x') {
    if (targets.length !== 1) throw new Error(`${where}: 'x' needs exactly one target; give per-target verdicts`);
    return { [targets[0] as string]: 'incorrect' };
  }
  const out: Record<string, Outcome> = {};
  for (const [key, verdict] of Object.entries(spec)) {
    if (!targets.includes(key)) throw new Error(`${where}: outcome key ${key} is not a task target`);
    out[key] = VERDICT[verdict];
  }
  if (Object.keys(out).length === 0) throw new Error(`${where}: empty outcomes`);
  return out;
}

/** Case and terminal punctuation both assessed. */
export const STRICT: Policy = { case: 'sensitive', terminalPunctuation: 'required' };
/** Case assessed; a missing final . ? ! (and its opening ¿ ¡) tolerated. */
export const OPT: Policy = { case: 'sensitive', terminalPunctuation: 'optional' };
/** Neither capitalization nor the final mark is assessed. */
export const LOOSE: Policy = { case: 'insensitive', terminalPunctuation: 'optional' };
/** Capitalization not assessed; punctuation marks assessed. */
export const CI: Policy = { case: 'insensitive', terminalPunctuation: 'required' };

// ---------------- hints ----------------

export const rule = (targets: string[], ...texts: string[]): Hint => ({ kind: 'rule', targets, blocks: texts.map(uk) });
export const clue = (targets: string[], ...texts: string[]): Hint => ({ kind: 'targeted-clue', targets, blocks: texts.map(uk) });
/** Vocabulary support: never attributed to a grammar target. */
export const gloss = (...blocks: Block[]): Hint => ({ kind: 'translation', targets: [], blocks });
/** Translation help that does support a meaning target (e.g. reading/listening meaning). */
export const translationFor = (targets: string[], ...blocks: Block[]): Hint => ({ kind: 'translation', targets, blocks });
export const transcript = (targets: string[], text: string): Hint => ({ kind: 'transcript', targets, blocks: [es(text)] });
/** Marker replaced by the builder: reveal hint over every task target. */
export function reveal(...blocks: Block[]): Hint {
  return { kind: 'reveal', targets: ['*'], blocks };
}

// ---------------- tasks ----------------

export interface TaskCommon {
  n: number;
  role: TaskRole;
  family: string;
  targets: string[];
  prompt: Block[];
  hints?: Hint[];
  ref?: string;
  ok: string;
  bad: string;
  unres?: string;
  clips?: string[];
  status?: ReviewStatus;
}

export type TaskSpec =
  | (TaskCommon & { mode: 'choice'; options: Array<[string, OutcomeSpec, string?]> })
  | (TaskCommon & {
      mode: 'exact-variants';
      accepted: Array<string | [string, string]>;
      errors?: Array<[string, OutcomeSpec, string]>;
      policy: Policy;
      closed?: boolean;
      input?: 'short' | 'multiline';
    })
  | (TaskCommon & {
      mode: 'finite-slots';
      template: TemplatePart[];
      slots: Array<{ id: string; target: string; accepted: string[]; errors?: Array<[string, string]>; closed: boolean }>;
      policy: Policy;
      input?: 'short' | 'multiline';
    })
  | (TaskCommon & {
      mode: 'rubric-review';
      criteria: string[];
      exemplars: Array<string | [string, string]>;
      policy: Policy;
      input?: 'short' | 'multiline';
    });

export const taskId = (lessonId: string, n: number): string => `${lessonId}-T${String(n).padStart(2, '0')}`;

function variant(prefix: string, i: number, v: string | [string, string]): Variant {
  return typeof v === 'string' ? { id: `${prefix}${i + 1}`, text: v } : { id: `${prefix}${i + 1}`, text: v[0], noteUk: v[1] };
}

export function buildTask(lessonId: string, spec: TaskSpec): Task {
  const id = taskId(lessonId, spec.n);
  const keys = spec.targets;
  const hints = (spec.hints ?? []).map((h) => (h.targets.includes('*') ? { ...h, targets: [...keys] } : h));
  for (const h of hints) for (const k of h.targets) if (!keys.includes(k)) throw new Error(`${id}: hint target ${k} is not a task target`);
  const base = {
    id,
    lessonId,
    role: spec.role,
    family: spec.family,
    mode: spec.mode,
    targets: keys.map(target),
    prompt: spec.prompt,
  };
  const tail = {
    ...(hints.length > 0 ? { hints } : {}),
    ...(spec.ref !== undefined ? { referenceAnswer: spec.ref } : {}),
    feedback: { correctUk: spec.ok, incorrectUk: spec.bad, ...(spec.unres !== undefined ? { unresolvedUk: spec.unres } : {}) },
    reviewStatus: spec.status ?? 'draft',
  };
  const clipIds = spec.clips && spec.clips.length > 0 ? { clipIds: spec.clips } : {};
  switch (spec.mode) {
    case 'choice': {
      const options: ChoiceOption[] = spec.options.map(([label, o, fb], i) => ({
        id: String.fromCharCode(97 + i),
        label,
        outcomes: outcomes(keys, o, `${id} option ${i}`),
        ...(fb !== undefined ? { feedbackUk: fb } : {}),
      }));
      return { ...base, input: 'options', ...clipIds, options, ...tail } as Task;
    }
    case 'exact-variants': {
      const accepted = spec.accepted.map((v, i) => variant('a', i, v));
      const errors: ErrorVariant[] = (spec.errors ?? []).map(([text, o, fb], i) => ({ id: `e${i + 1}`, text, outcomes: outcomes(keys, o, `${id} error ${i}`), feedbackUk: fb }));
      return {
        ...base,
        input: spec.input ?? 'short',
        ...clipIds,
        accepted,
        ...(errors.length > 0 ? { errors } : {}),
        ...(spec.closed !== undefined ? { closed: spec.closed } : {}),
        policy: spec.policy,
        ...tail,
      } as Task;
    }
    case 'finite-slots': {
      const slots: Slot[] = spec.slots.map((s) => ({
        id: s.id,
        target: s.target,
        accepted: s.accepted,
        ...(s.errors && s.errors.length > 0 ? { errors: s.errors.map(([text, feedbackUk]) => ({ text, feedbackUk })) } : {}),
        closed: s.closed,
      }));
      return { ...base, input: spec.input ?? 'short', ...clipIds, policy: spec.policy, template: spec.template, slots, ...tail } as Task;
    }
    case 'rubric-review': {
      const exemplars = spec.exemplars.map((v, i) => variant('x', i, v));
      return { ...base, input: spec.input ?? 'multiline', ...clipIds, policy: spec.policy, rubric: { criteriaUk: spec.criteria, exemplars }, ...tail } as Task;
    }
  }
}

// ---------------- lessons ----------------

export interface StepSpec {
  kind: StepKind;
  title: string;
  required?: boolean;
  blocks?: Block[];
  tasks?: number[];
  clips?: string[];
}

export interface LessonSpec {
  id: string;
  kind?: 'lesson' | 'optional-check';
  titleUk: string;
  termEs?: string;
  summaryUk: string;
  objectives: string[];
  cv?: string[];
  situations?: string[];
  estimatedMinutes: number;
  skippableFoundation?: boolean;
  introduces: string[];
  revisits: string[];
  steps: StepSpec[];
  status?: ReviewStatus;
}

export interface Unit {
  lesson: LessonSpec;
  tasks: TaskSpec[];
  clips?: Clip[];
  materials?: Material[];
}

export function buildLesson(spec: LessonSpec): Lesson {
  const blockId = spec.id.slice(0, 5);
  const steps: Step[] = spec.steps.map((s, i) => ({
    id: `s${i + 1}`,
    kind: s.kind,
    titleUk: s.title,
    required: s.required ?? true,
    ...(s.blocks && s.blocks.length > 0 ? { blocks: s.blocks } : {}),
    ...(s.tasks && s.tasks.length > 0 ? { taskIds: s.tasks.map((n) => taskId(spec.id, n)) } : {}),
    ...(s.clips && s.clips.length > 0 ? { clipIds: s.clips } : {}),
  }));
  return {
    schemaVersion: 1,
    id: spec.id,
    kind: spec.kind ?? (spec.id.endsWith('-C1') ? 'optional-check' : 'lesson'),
    blockId,
    titleUk: spec.titleUk,
    ...(spec.termEs !== undefined ? { termEs: spec.termEs } : {}),
    summaryUk: spec.summaryUk,
    objectives: spec.objectives,
    ...(spec.cv !== undefined ? { cv: spec.cv } : {}),
    situations: spec.situations ?? [],
    estimatedMinutes: spec.estimatedMinutes,
    ...(spec.skippableFoundation !== undefined ? { skippableFoundation: spec.skippableFoundation } : {}),
    introduces: spec.introduces,
    revisits: spec.revisits,
    steps,
    reviewStatus: spec.status ?? 'draft',
  };
}

export function clip(c: Omit<Clip, 'targets' | 'reviewStatus'> & { targets: string[]; status?: ReviewStatus }): Clip {
  const { status, targets, ...rest } = c;
  return { ...rest, targets: targets.map(target), reviewStatus: status ?? 'draft' };
}

export function material(m: Omit<Material, 'reviewStatus'> & { status?: ReviewStatus }): Material {
  const { status, ...rest } = m;
  return { ...rest, reviewStatus: status ?? 'draft' };
}

// ---------------- writing with status preservation ----------------

type WithStatus = { reviewStatus?: ReviewStatus } & Record<string, unknown>;

function hashWithoutStatus(body: object): string {
  const { reviewStatus: _ignored, ...rest } = body as Record<string, unknown>;
  return canonicalSha256(rest);
}

function readJsonIfExists(path: string): unknown {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as unknown) : undefined;
}

/** Keeps the on-disk status of every entity whose content hash is unchanged; an explicit spec status wins. */
function preserve<T extends object>(fresh: T, old: object | undefined, explicit: boolean): T {
  if (explicit || old === undefined) return fresh;
  if (hashWithoutStatus(fresh) !== hashWithoutStatus(old)) return { ...fresh, reviewStatus: 'draft' };
  const status = (old as WithStatus).reviewStatus;
  return status === undefined ? fresh : { ...fresh, reviewStatus: status };
}

function writeJson(path: string, value: unknown): boolean {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  const before = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  if (before === text) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  return true;
}

export interface WriteSummary {
  file: string;
  changed: boolean;
  entities: number;
}

export function writeUnits(units: Unit[]): WriteSummary[] {
  const out: WriteSummary[] = [];
  const clipsByBlock = new Map<string, Array<{ clip: Clip; explicit: boolean }>>();
  const materialsByBlock = new Map<string, Array<{ material: Material; explicit: boolean }>>();
  for (const unit of units) {
    const lesson = buildLesson(unit.lesson);
    const lessonPath = join(SOURCE, 'lessons', `${lesson.id}.json`);
    const finalLesson = preserve(lesson, readJsonIfExists(lessonPath) as object | undefined, unit.lesson.status !== undefined);
    out.push({ file: `lessons/${lesson.id}.json`, changed: writeJson(lessonPath, finalLesson), entities: 1 });

    const seen = new Set<number>();
    for (const t of unit.tasks) {
      if (seen.has(t.n)) throw new Error(`${lesson.id}: duplicate task number ${t.n}`);
      seen.add(t.n);
    }
    for (const step of unit.lesson.steps) for (const n of step.tasks ?? []) if (!seen.has(n)) throw new Error(`${lesson.id}: step "${step.title}" references missing task ${n}`);
    const tasksPath = join(SOURCE, 'tasks', `${lesson.id}.json`);
    const oldTasks = new Map(((readJsonIfExists(tasksPath) as { tasks?: Array<{ id: string }> } | undefined)?.tasks ?? []).map((t) => [t.id, t]));
    const tasks = [...unit.tasks]
      .sort((a, b) => a.n - b.n)
      .map((spec) => {
        const task = buildTask(lesson.id, spec);
        return preserve(task, oldTasks.get(task.id), spec.status !== undefined);
      });
    out.push({ file: `tasks/${lesson.id}.json`, changed: writeJson(tasksPath, { schemaVersion: 1, lessonId: lesson.id, tasks }), entities: tasks.length });

    // A clip/material built with a non-draft status (e.g. quarantined) carries an explicit status.
    for (const c of unit.clips ?? []) clipsByBlock.set(lesson.blockId, [...(clipsByBlock.get(lesson.blockId) ?? []), { clip: c, explicit: c.reviewStatus !== 'draft' }]);
    for (const m of unit.materials ?? []) materialsByBlock.set(lesson.blockId, [...(materialsByBlock.get(lesson.blockId) ?? []), { material: m, explicit: m.reviewStatus !== 'draft' }]);
  }
  for (const [blockId, list] of clipsByBlock) {
    const path = join(SOURCE, 'audio', `${blockId}.json`);
    const old = new Map(((readJsonIfExists(path) as { clips?: Array<{ id: string }> } | undefined)?.clips ?? []).map((c) => [c.id, c]));
    const ids = new Set<string>();
    const clips = list.map(({ clip: c, explicit }) => {
      if (ids.has(c.id)) throw new Error(`duplicate clip ${c.id}`);
      ids.add(c.id);
      return preserve(c, old.get(c.id), explicit);
    });
    out.push({ file: `audio/${blockId}.json`, changed: writeJson(path, { schemaVersion: 1, blockId, clips }), entities: clips.length });
  }
  for (const [blockId, list] of materialsByBlock) {
    const path = join(SOURCE, 'materials', `${blockId}.json`);
    const old = new Map(((readJsonIfExists(path) as { materials?: Array<{ id: string }> } | undefined)?.materials ?? []).map((m) => [m.id, m]));
    const materials = list.map(({ material: m, explicit }) => preserve(m, old.get(m.id), explicit));
    out.push({ file: `materials/${blockId}.json`, changed: writeJson(path, { schemaVersion: 1, blockId, materials }), entities: materials.length });
  }
  return out;
}
