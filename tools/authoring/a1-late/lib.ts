// Authoring helpers for the A1-04…A1-06 range ("a1-late", issue #111, WP-05).
// Lesson modules under ./lessons/ describe every lesson/task/clip/material by hand; these helpers
// only expand that data into the content/schemas/content.schema.json shapes (ids, outcome maps,
// default hints/feedback, conjugation error variants). build.ts writes the concrete JSON that is
// committed under content/source; nothing here runs at application runtime.
import type {
  Block,
  ChoiceOption,
  Clip,
  ErrorVariant,
  Hint,
  Lesson,
  LexicalItem,
  Material,
  Outcome,
  Policy,
  Slot,
  Step,
  Target,
  Task,
  TaskRole,
  TemplatePart,
  Variant,
} from '../../content/types.ts';
import { parseTargetKey } from '../../content/types.ts';

// ---------------------------------------------------------------- blocks

export const uk = (text: string): Block => ({ type: 'paragraph', language: 'uk', text });
export const es = (text: string): Block => ({ type: 'paragraph', language: 'es-ES', text });
export const ex = (spanish: string, ukrainian: string): Block => ({ type: 'example', spanish, ukrainian });
export const ul = (...items: string[]): Block => ({ type: 'bullet-list', language: 'uk', items });
export const el = (...items: string[]): Block => ({ type: 'bullet-list', language: 'es-ES', items });
export const tableEs = (columns: string[], rows: string[][]): Block => ({ type: 'table', language: 'es-ES', columns, rows });
export const tableUk = (columns: string[], rows: string[][]): Block => ({ type: 'table', language: 'uk', columns, rows });
export const plink = (labelUk: string, targets: string[], mode: 'written' | 'listening' | 'mixed', maxItems: number): Block => ({
  type: 'practice-link',
  labelUk,
  targets: targets.map(tg),
  mode,
  maxItems,
});

export function tg(key: string): Target {
  const t = parseTargetKey(key);
  if (!t) throw new Error(`bad target key ${key}`);
  return t;
}

// ---------------------------------------------------------------- policies

/** Case and a missing final mark are not assessed (form, word and sentence production). */
export const LOOSE: Policy = { case: 'insensitive', terminalPunctuation: 'optional' };
/** Dictation: case-insensitive, optional terminal punctuation (brief 09). */
export const DICTATION: Policy = { case: 'insensitive', terminalPunctuation: 'optional' };

// ---------------------------------------------------------------- feedback / hints

export const UNRESOLVED_UK =
  'Цю відповідь не вдалося перевірити автоматично, тож її не зараховано ні як правильну, ні як помилку. Порівняй її зі зразком у підказці «Показати відповідь».';

export const hRule = (targets: string[], ...blocks: Array<Block | string>): Hint => ({ kind: 'rule', targets, blocks: blocks.map(toUk) });
export const hClue = (targets: string[], ...blocks: Array<Block | string>): Hint => ({ kind: 'targeted-clue', targets, blocks: blocks.map(toUk) });
export const hTr = (text: string, targets: string[] = []): Hint => ({ kind: 'translation', targets, blocks: [uk(text)] });
export const hTranscript = (targets: string[], transcript: string): Hint => ({ kind: 'transcript', targets, blocks: [es(transcript)] });
export const hReveal = (targets: string[], answer: string): Hint => ({ kind: 'reveal', targets, blocks: [CYR.test(answer) ? uk(answer) : es(answer)] });

const CYR = /\p{Script=Cyrillic}/u;

function toUk(b: Block | string): Block {
  return typeof b === 'string' ? uk(b) : b;
}

function toEs(b: Block | string): Block {
  return typeof b === 'string' ? es(b) : b;
}

// ---------------------------------------------------------------- lesson kit

export interface TaskBase {
  /** Task number inside the lesson (stable; never renumbered). */
  n: number;
  role: TaskRole;
  /** Prompt/context family (local id). */
  fam: string;
  /** Ukrainian instruction (first prompt block). */
  ins: string;
  /** Further prompt blocks; plain strings are Spanish (es-ES) paragraphs. */
  p?: Array<Block | string>;
  /** Extra hints placed before the default rule/translation/reveal hints. */
  hints?: Hint[];
  /** Ukrainian translation of the Spanish prompt (vocabulary support, no grammar target). */
  tr?: string;
  /** Rule hint text override (default: the skill rule of every target). */
  rule?: string;
  noRule?: boolean;
  /** Reference answer (default: first accepted variant / correct option / first exemplar). */
  ref?: string;
  noReveal?: boolean;
  ok?: string;
  bad?: string;
  unres?: string;
  clips?: string[];
}

type Verdict = true | false | string | string[];

export interface ChoiceSpec extends TaskBase {
  t: string[];
  /** [label, verdict, feedbackUk?]: true = correct for every target, false = incorrect for every target,
   * string/string[] = target key(s) marked incorrect (other targets unmapped = unresolved). */
  o: Array<[string, Verdict, string?]>;
}

export interface ExactSpec extends TaskBase {
  t: string[];
  acc: string[];
  /** [text, feedbackUk, outcomes?] — default outcomes: every target incorrect. */
  err?: Array<[string, string, Record<string, Outcome>?]>;
  closed?: boolean;
  pol?: Policy;
  input?: 'short' | 'multiline';
}

export interface SlotSpec {
  id: string;
  t: string;
  acc: string[];
  err?: Array<[string, string]>;
  closed?: boolean;
}

export interface SlotsSpec extends TaskBase {
  t: string[];
  tpl: TemplatePart[];
  slots: SlotSpec[];
  pol?: Policy;
  input?: 'short' | 'multiline';
}

export interface RubricSpec extends TaskBase {
  t: string[];
  crit: string[];
  exm: string[];
  pol?: Policy;
}

export interface StepSpec {
  kind: Step['kind'];
  title: string;
  required?: boolean;
  blocks?: Array<Block | string>;
  tasks?: string[];
  clips?: string[];
}

export interface LessonSpec {
  kind?: 'lesson' | 'optional-check';
  title: string;
  termEs?: string;
  summary: string;
  objectives: string[];
  cv?: string[];
  situations: string[];
  minutes: number;
  skippableFoundation?: boolean;
  introduces: string[];
  revisits: string[];
  steps: StepSpec[];
}

export interface LessonModule {
  lesson: Lesson;
  tasks: Task[];
  clips: Clip[];
  materials: Material[];
  lexicon: LexicalItem[];
}

export const S = (slot: string): TemplatePart => ({ slot });

const pad = (n: number): string => String(n).padStart(2, '0');

/** Per-lesson builder: collects tasks, clips and materials with the lesson id baked in. */
export class Kit {
  readonly lessonId: string;
  readonly blockId: string;
  readonly rules: Record<string, string>;
  readonly tasks: Task[] = [];
  readonly clips: Clip[] = [];
  readonly materials: Material[] = [];
  readonly lexicon: LexicalItem[] = [];

  constructor(lessonId: string, rules: Record<string, string>) {
    this.lessonId = lessonId;
    this.blockId = lessonId.slice(0, 5);
    this.rules = rules;
  }

  id(n: number): string {
    return `${this.lessonId}-T${pad(n)}`;
  }

  private ruleText(targets: string[]): string {
    const skills = [...new Set(targets.map((t) => tg(t).skillId))];
    const texts = skills.map((s) => this.rules[s]).filter((x): x is string => typeof x === 'string' && x.length > 0);
    if (texts.length === 0) throw new Error(`${this.lessonId}: no rule text for ${skills.join(', ')}`);
    return texts.join(' ');
  }

  private hints(b: TaskBase, targets: string[], reference: string | undefined): Hint[] {
    const out: Hint[] = [...(b.hints ?? [])];
    if (!b.noRule) out.push(hRule(targets, b.rule ?? this.ruleText(targets)));
    if (b.tr) out.push(hTr(b.tr));
    if (!b.noReveal && reference) out.push(hReveal(targets, reference));
    if (out.length > 6) throw new Error(`${this.id(b.n)}: more than 6 hints`);
    return out;
  }

  private base(b: TaskBase, mode: Task['mode'], targets: string[], input: Task['input']): Task {
    if (this.tasks.some((t) => t.id === this.id(b.n))) throw new Error(`duplicate task ${this.id(b.n)}`);
    const task: Task = {
      id: this.id(b.n),
      lessonId: this.lessonId,
      role: b.role,
      family: b.fam,
      mode,
      targets: targets.map(tg),
      prompt: [uk(b.ins), ...(b.p ?? []).map(toEs)],
      input,
      feedback: { correctUk: 'Правильно!', incorrectUk: 'Поки що ні.' },
      reviewStatus: 'draft',
    };
    if (b.clips && b.clips.length > 0) task.clipIds = b.clips;
    return task;
  }

  private finish(task: Task, b: TaskBase, targets: string[], reference: string | undefined, canBeUnresolved: boolean): string {
    const hints = this.hints(b, targets, reference);
    if (hints.length > 0) task.hints = hints;
    if (reference !== undefined && !CYR.test(reference)) task.referenceAnswer = reference;
    task.feedback = {
      correctUk: b.ok ?? 'Правильно!',
      incorrectUk: b.bad ?? `Поки що ні. ${this.ruleText(targets)}`,
      ...(canBeUnresolved ? { unresolvedUk: b.unres ?? UNRESOLVED_UK } : {}),
    };
    // Keep key order stable: feedback and reviewStatus last.
    const { feedback, reviewStatus, ...rest } = task;
    const ordered: Task = { ...rest, feedback, reviewStatus } as Task;
    this.tasks.push(ordered);
    return ordered.id;
  }

  choice(b: ChoiceSpec): string {
    const task = this.base(b, 'choice', b.t, 'options');
    const letters = 'abcdefgh';
    let reference: string | undefined;
    task.options = b.o.map(([label, verdict, fb], i): ChoiceOption => {
      const outcomes: Record<string, Outcome> = {};
      if (verdict === true) {
        for (const t of b.t) outcomes[t] = 'correct';
        reference ??= label;
      } else if (verdict === false) {
        for (const t of b.t) outcomes[t] = 'incorrect';
      } else {
        for (const t of Array.isArray(verdict) ? verdict : [verdict]) {
          if (!b.t.includes(t)) throw new Error(`${task.id}: option ${label} marks foreign target ${t}`);
          outcomes[t] = 'incorrect';
        }
      }
      const option: ChoiceOption = { id: letters[i] ?? 'z', label, outcomes };
      if (fb) option.feedbackUk = fb;
      return option;
    });
    const unresolvable = task.options.some((o) => b.t.some((t) => o.outcomes[t] === undefined));
    return this.finish(task, b, b.t, b.ref ?? reference, unresolvable);
  }

  exact(b: ExactSpec): string {
    const task = this.base(b, 'exact-variants', b.t, b.input ?? 'short');
    task.accepted = b.acc.map((text, i): Variant => ({ id: `v${i + 1}`, text }));
    if (b.err && b.err.length > 0) {
      task.errors = b.err.map(([text, feedbackUk, outcomes], i): ErrorVariant => ({
        id: `e${i + 1}`,
        text,
        outcomes: outcomes ?? Object.fromEntries(b.t.map((t) => [t, 'incorrect' as Outcome])),
        feedbackUk,
      }));
    }
    if (b.closed) task.closed = true;
    task.policy = b.pol ?? LOOSE;
    const closed = b.closed === true && b.t.length === 1;
    return this.finish(task, b, b.t, b.ref ?? b.acc[0], !closed);
  }

  slots(b: SlotsSpec): string {
    const task = this.base(b, 'finite-slots', b.t, b.input ?? 'short');
    task.policy = b.pol ?? LOOSE;
    task.template = b.tpl;
    task.slots = b.slots.map((s): Slot => {
      const slot: Slot = { id: s.id, target: s.t, accepted: s.acc, closed: s.closed ?? false };
      if (s.err && s.err.length > 0) slot.errors = s.err.map(([text, feedbackUk]) => ({ text, feedbackUk }));
      return { id: slot.id, target: slot.target, accepted: slot.accepted, ...(slot.errors ? { errors: slot.errors } : {}), closed: slot.closed };
    });
    const values = new Map(b.slots.map((s) => [s.id, s.acc[0] ?? '']));
    const reference = b.ref ?? b.tpl.map((p) => (typeof p === 'string' ? p : (values.get(p.slot) ?? ''))).join('');
    return this.finish(task, b, b.t, reference, true);
  }

  rubric(b: RubricSpec): string {
    const task = this.base(b, 'rubric-review', b.t, 'multiline');
    task.policy = b.pol ?? LOOSE;
    task.rubric = { criteriaUk: b.crit, exemplars: b.exm.map((text, i) => ({ id: `x${i + 1}`, text })) };
    return this.finish(task, b, b.t, b.ref ?? b.exm[0], true);
  }

  clip(c: { id: string; kind: Clip['kind']; es: string; uk: string; t: string[]; fam: string; note?: string }): string {
    const clip: Clip = {
      id: c.id,
      lessonId: this.lessonId,
      kind: c.kind,
      transcript: c.es,
      translationUk: c.uk,
      targets: c.t.map(tg),
      family: c.fam,
      ...(c.note ? { pronunciationNoteUk: c.note } : {}),
      reviewStatus: 'draft',
    };
    this.clips.push(clip);
    return clip.id;
  }

  material(m: { id: string; topic?: string; title: string; blocks: Array<Block | string>; linked: string[] }): string {
    this.materials.push({
      id: m.id,
      topicId: m.topic ?? this.blockId,
      titleUk: m.title,
      blocks: m.blocks.map(toUk),
      linkedTargets: m.linked,
      reviewStatus: 'draft',
    });
    return m.id;
  }

  lex(item: Omit<LexicalItem, 'firstLesson'>): void {
    this.lexicon.push({ ...item, firstLesson: this.lessonId });
  }

  build(spec: LessonSpec): LessonModule {
    const lesson: Lesson = {
      schemaVersion: 1,
      id: this.lessonId,
      kind: spec.kind ?? 'lesson',
      blockId: this.blockId,
      titleUk: spec.title,
      ...(spec.termEs ? { termEs: spec.termEs } : {}),
      summaryUk: spec.summary,
      objectives: spec.objectives,
      ...(spec.cv && spec.cv.length > 0 ? { cv: spec.cv } : {}),
      situations: spec.situations,
      estimatedMinutes: spec.minutes,
      ...(spec.skippableFoundation ? { skippableFoundation: true } : {}),
      introduces: spec.introduces,
      revisits: spec.revisits,
      steps: spec.steps.map((s, i): Step => {
        const step: Step = { id: `s${i + 1}`, kind: s.kind, titleUk: s.title, required: s.required ?? true };
        if (s.blocks && s.blocks.length > 0) step.blocks = s.blocks.map(toUk);
        if (s.tasks && s.tasks.length > 0) step.taskIds = s.tasks;
        if (s.clips && s.clips.length > 0) step.clipIds = s.clips;
        return step;
      }),
      reviewStatus: 'draft',
    };
    return { lesson, tasks: this.tasks, clips: this.clips, materials: this.materials, lexicon: this.lexicon };
  }
}

export { toEs };

// ---------------------------------------------------------------- verbs

/** Person index: 0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 vosotros, 5 ellos/ellas/ustedes. */
export type Person = 0 | 1 | 2 | 3 | 4 | 5;

export const WHO: readonly string[] = [
  'yo («я»)',
  'tú («ти»)',
  'él / ella / usted',
  'nosotros / nosotras («ми»)',
  'vosotros / vosotras («ви» — кілька людей, на «ти»)',
  'ellos / ellas / ustedes',
];

const ENDINGS: Record<'ar' | 'er' | 'ir', readonly string[]> = {
  ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
  er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
  ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
};

const IRREGULAR: Record<string, readonly string[]> = {
  ser: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
  estar: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
  tener: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
  ir: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
  hacer: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
  preferir: ['prefiero', 'prefieres', 'prefiere', 'preferimos', 'preferís', 'prefieren'],
  querer: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
};

export function family(verb: string): 'ar' | 'er' | 'ir' {
  const base = verb.endsWith('se') ? verb.slice(0, -2) : verb;
  const f = base.slice(-2);
  if (f !== 'ar' && f !== 'er' && f !== 'ir') throw new Error(`not an infinitive: ${verb}`);
  return f;
}

export function isIrregular(verb: string): boolean {
  return verb in IRREGULAR;
}

/** Present indicative forms (pronoun-free) of the verbs used in A1-04…A1-06. */
export function forms(verb: string): readonly string[] {
  const irregular = IRREGULAR[verb];
  if (irregular) return irregular;
  const base = verb.endsWith('se') ? verb.slice(0, -2) : verb;
  const stem = base.slice(0, -2);
  return ENDINGS[family(verb)].map((e) => stem + e);
}

export function form(verb: string, p: Person): string {
  const f = forms(verb)[p];
  if (f === undefined) throw new Error(`no form ${verb}/${p}`);
  return f;
}

export function ending(verb: string, p: Person): string | undefined {
  if (verb === 'hacer') return p === 0 ? undefined : `-${ENDINGS.er[p] ?? ''}`;
  if (verb === 'preferir' || verb === 'querer') {
    const end = `-${ENDINGS[verb === 'preferir' ? 'ir' : 'er'][p] ?? ''}`;
    return p === 3 || p === 4 ? end : `${end}, а в основі e → ie (${verb === 'preferir' ? 'prefier-' : 'quier-'})`;
  }
  if (isIrregular(verb)) return undefined;
  return `-${ENDINGS[family(verb)][p] ?? ''}`;
}

const ACCENT_STRIP: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

export function stripAccents(text: string): string {
  return text.replace(/[áéíóú]/g, (c) => ACCENT_STRIP[c] ?? c);
}

/**
 * Reviewed-style error variants for one person form of a verb: the other person forms, the
 * infinitive and (for written-accent forms) the form without its accent mark. Feedback explains the
 * person/ending rule; the correct form is named only for the accent slip.
 */
export function verbErrors(verb: string, p: Person, opts: { pronoun?: string; extra?: Array<[string, string]> } = {}): Array<[string, string]> {
  const all = forms(verb);
  const correct = all[p] ?? '';
  const pre = opts.pronoun ? `${opts.pronoun} ` : '';
  const end = ending(verb, p);
  const need = end ? `потрібна форма для ${WHO[p]}: закінчення ${end}.` : `потрібна форма для ${WHO[p]}; у дієслова ${verb} її треба запам’ятати (див. таблицю).`;
  const out: Array<[string, string]> = [];
  const seen = new Set<string>([correct]);
  all.forEach((f, q) => {
    if (seen.has(f)) return;
    seen.add(f);
    out.push([pre + f, `«${pre + f}» — форма для ${WHO[q]}. Тут ${need}`]);
  });
  const inf = verb.endsWith('se') ? verb.slice(0, -2) : verb;
  if (!seen.has(inf)) {
    seen.add(inf);
    out.push([pre + inf, `«${inf}» — це інфінітив (словникова форма). У реченні з підметом ${need}`]);
  }
  const plain = stripAccents(correct);
  if (plain !== correct && !seen.has(plain)) {
    seen.add(plain);
    out.push([pre + plain, `Майже: форма пишеться зі знаком наголосу — «${pre + correct}».`]);
  }
  for (const e of opts.extra ?? []) if (!seen.has(e[0])) out.push(e);
  return out;
}

export interface GapSpec extends Omit<ExactSpec, 'acc' | 'err' | 'ins' | 'p'> {
  verb: string;
  person: Person;
  /** Spanish sentence shown with the gap, e.g. "Yo ___ en casa. (desayunar)". */
  s: string;
  ins?: string;
  /** Visible model for supported tasks, e.g. "hablar → yo hablo". */
  model?: string;
  /** Pronoun typed together with the verb (reflexive tasks), e.g. "me". */
  pronoun?: string;
  extra?: Array<[string, string]>;
}

/** Exact-variants gap task for one verb form with generated person/infinitive/accent error variants. */
export function vgap(k: Kit, b: GapSpec): string {
  const correct = (b.pronoun ? `${b.pronoun} ` : '') + form(b.verb, b.person);
  const ins =
    b.ins ??
    (b.model
      ? `Впиши форму дієслова ${b.verb} для ${WHO[b.person]}. Зразок: ${b.model}.`
      : 'Впиши правильну форму дієслова, поданого в дужках.');
  const { verb: _v, person, s, model: _m, pronoun, extra, ...rest } = b;
  return k.exact({ ...rest, ins, p: [s], acc: [correct], err: verbErrors(b.verb, person, { ...(pronoun ? { pronoun } : {}), ...(extra ? { extra } : {}) }) });
}

/** Slot for one verb form with generated error values. */
export function vslot(id: string, t: string, verb: string, p: Person, extra: Array<[string, string]> = []): SlotSpec {
  return { id, t, acc: [form(verb, p)], err: verbErrors(verb, p, { extra }) };
}

/** Every concatenation of one option per part (reviewed variant sets such as comma/connector choices). */
export function combos(...parts: string[][]): string[] {
  return parts.reduce<string[]>((acc, options) => acc.flatMap((prefix) => options.map((o) => prefix + o)), ['']);
}

export const VERB_UK: Record<string, string> = {
  hablar: 'говорити',
  trabajar: 'працювати',
  estudiar: 'вчитися, вивчати',
  cocinar: 'готувати (їжу)',
  desayunar: 'снідати',
  cenar: 'вечеряти',
  comprar: 'купувати',
  escuchar: 'слухати',
  tomar: 'брати; пити, їсти',
  llegar: 'приходити, прибувати',
  descansar: 'відпочивати',
  pasear: 'гуляти',
  comer: 'їсти; обідати',
  beber: 'пити',
  leer: 'читати',
  aprender: 'вчити, вивчати',
  correr: 'бігати',
  vivir: 'жити',
  escribir: 'писати',
  abrir: 'відчиняти',
  recibir: 'отримувати',
  ir: 'іти, їхати',
  hacer: 'робити',
  levantarse: 'вставати',
  ducharse: 'приймати душ',
  lavarse: 'вмиватися',
  peinarse: 'зачісуватися',
  necesitar: 'потребувати',
  preferir: 'воліти',
  querer: 'хотіти',
  nadar: 'плавати',
  bailar: 'танцювати',
  viajar: 'подорожувати',
};
