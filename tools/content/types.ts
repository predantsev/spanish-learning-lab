// TypeScript view of content/schemas/content.schema.json (hand-maintained; the schema is normative).
// Shapes are only trusted after load.ts has validated a file against its schema definition.

export type Modality =
  | 'written-form'
  | 'context-choice'
  | 'reading-meaning'
  | 'listening-meaning'
  | 'dictation'
  | 'phrase-recall'
  | 'construction-use';

export const MODALITIES: readonly Modality[] = [
  'written-form',
  'context-choice',
  'reading-meaning',
  'listening-meaning',
  'dictation',
  'phrase-recall',
  'construction-use',
];

export type ReviewStatus = 'draft' | 'needs-review' | 'reviewed' | 'ready' | 'quarantined';
export const REVIEW_STATUSES: readonly ReviewStatus[] = ['draft', 'needs-review', 'reviewed', 'ready', 'quarantined'];

export type Outcome = 'correct' | 'incorrect' | 'unresolved';

export interface Target {
  skillId: string;
  modality: Modality;
}

export interface SourceRef {
  sourceId: string;
  section: string;
  note?: string;
}

export type Block =
  | { type: 'paragraph'; language: 'uk' | 'es-ES'; text: string }
  | { type: 'bullet-list'; language: 'uk' | 'es-ES'; items: string[] }
  | { type: 'example'; spanish: string; ukrainian: string }
  | { type: 'practice-link'; labelUk: string; targets: Target[]; mode: 'written' | 'listening' | 'mixed'; maxItems: number }
  | { type: 'table'; language: 'uk' | 'es-ES'; columns: string[]; rows: string[][] };

export interface Policy {
  case: 'sensitive' | 'insensitive';
  terminalPunctuation: 'required' | 'optional';
}

export type TargetOutcomes = Record<string, Outcome>;

export interface Hint {
  kind: 'rule' | 'targeted-clue' | 'translation' | 'transcript' | 'reveal';
  targets: string[];
  blocks: Block[];
}

export interface Variant {
  id: string;
  text: string;
  noteUk?: string;
}

export interface ErrorVariant {
  id: string;
  text: string;
  outcomes: TargetOutcomes;
  feedbackUk: string;
}

export interface Slot {
  id: string;
  target: string;
  accepted: string[];
  errors?: Array<{ text: string; feedbackUk: string }>;
  closed: boolean;
}

export type TemplatePart = string | { slot: string };

export interface ChoiceOption {
  id: string;
  label: string;
  outcomes: TargetOutcomes;
  feedbackUk?: string;
}

export type TaskRole = 'supported' | 'independent' | 'delayed' | 'transfer';
export type TaskMode = 'choice' | 'exact-variants' | 'finite-slots' | 'rubric-review';

export interface Task {
  id: string;
  lessonId: string;
  role: TaskRole;
  family: string;
  mode: TaskMode;
  targets: Target[];
  prompt: Block[];
  input: 'options' | 'short' | 'multiline';
  clipIds?: string[];
  options?: ChoiceOption[];
  accepted?: Variant[];
  errors?: ErrorVariant[];
  closed?: boolean;
  policy?: Policy;
  template?: TemplatePart[];
  slots?: Slot[];
  rubric?: { criteriaUk: string[]; exemplars: Variant[] };
  hints?: Hint[];
  referenceAnswer?: string;
  feedback: { correctUk: string; incorrectUk: string; unresolvedUk?: string };
  reviewStatus: ReviewStatus;
}

export interface TaskFile {
  schemaVersion: 1;
  lessonId: string;
  tasks: Task[];
}

export type StepKind =
  | 'explanation'
  | 'examples'
  | 'supported-practice'
  | 'independent-practice'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'summary'
  | 'self-check';

export interface Step {
  id: string;
  kind: StepKind;
  titleUk: string;
  required: boolean;
  blocks?: Block[];
  taskIds?: string[];
  clipIds?: string[];
}

export interface Lesson {
  schemaVersion: 1;
  id: string;
  kind: 'lesson' | 'optional-check';
  blockId: string;
  titleUk: string;
  termEs?: string;
  summaryUk: string;
  objectives: string[];
  cv?: string[];
  situations: string[];
  estimatedMinutes: number;
  skippableFoundation?: boolean;
  introduces: string[];
  revisits: string[];
  steps: Step[];
  reviewStatus: ReviewStatus;
}

export type SkillKind =
  | 'orthography'
  | 'form'
  | 'exception'
  | 'contrast'
  | 'construction'
  | 'vocabulary'
  | 'function'
  | 'reading'
  | 'listening'
  | 'phrase'
  | 'text';

export interface Skill {
  skillId: string;
  parentObjectives: string[];
  kind: SkillKind;
  modalities: Modality[];
  titleUk: string;
  termEs?: string;
  scope: {
    forms?: string[];
    persons?: Array<'1s' | '2s' | '3s' | '1p' | '2p' | '3p'>;
    exceptionOf?: string;
    noteUk: string;
  };
  firstLesson: string;
  prerequisites: string[];
  ruleUk: string;
  assessed: boolean;
  returns: { practice: string[]; check: string[]; later: string[] };
  cv?: string[];
  situations?: string[];
  sources: SourceRef[];
  variantPolicyUk?: string;
  bankJustificationUk?: string;
  reviewStatus: ReviewStatus;
}

export interface SkillFile {
  schemaVersion: 1;
  blockId: string;
  skills: Skill[];
}

export interface LexicalItem {
  id: string;
  lemma: string;
  pos: string;
  gender?: 'm' | 'f' | 'm/f';
  plural?: string;
  meaningUk: string;
  firstLesson: string;
  noteUk?: string;
  /** Optional (added 2026-11-06, #111): absent means not yet reviewed, i.e. treated as `draft`. */
  reviewStatus?: ReviewStatus;
}

export interface LexiconFile {
  schemaVersion: 1;
  blockId: string;
  items: LexicalItem[];
}

export interface Clip {
  id: string;
  lessonId: string;
  kind: 'phrase' | 'sentence' | 'dialogue-line' | 'text';
  transcript: string;
  translationUk: string;
  targets: Target[];
  family: string;
  pronunciationNoteUk?: string;
  reviewStatus: ReviewStatus;
}

export interface ClipFile {
  schemaVersion: 1;
  blockId: string;
  clips: Clip[];
}

export interface Phrase {
  id: string;
  spanish: string;
  ukrainian: string;
  noteUk?: string;
  firstLesson: string;
  skills: string[];
  situations: string[];
  clipIds?: string[];
  recall?: { accepted: Variant[]; policy: Policy };
  variationTaskIds?: string[];
  reviewStatus: ReviewStatus;
}

export interface PhraseFile {
  schemaVersion: 1;
  phrases: Phrase[];
}

export interface Collection {
  id: string;
  titleUk: string;
  descriptionUk: string;
  phraseIds: string[];
  reviewStatus: ReviewStatus;
}

export interface CollectionFile {
  schemaVersion: 1;
  collections: Collection[];
}

export interface Material {
  id: string;
  topicId: string;
  titleUk: string;
  blocks: Block[];
  linkedTargets: string[];
  reviewStatus: ReviewStatus;
}

export interface MaterialFile {
  schemaVersion: 1;
  blockId: string;
  materials: Material[];
}

export interface Situation {
  id: string;
  titleUk: string;
  firstLessons: string[];
  laterLessons?: string[];
  /** Optional (added 2026-11-06, #111): absent means not yet reviewed, i.e. treated as `draft`. */
  reviewStatus?: ReviewStatus;
}

export interface SituationFile {
  schemaVersion: 1;
  situations: Situation[];
}

/** One curriculum block of content/source/blocks.json (emitted into pack.json `blocks`). */
export interface CourseBlock {
  id: string;
  titleUk: string;
  termEs?: string;
  summaryUk: string;
  reviewStatus: ReviewStatus;
}

export interface BlockFile {
  schemaVersion: 1;
  blocks: CourseBlock[];
}

export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  useNote: string;
}

export interface SourceRegistry {
  schemaVersion: 1;
  sources: SourceEntry[];
}

/** Entity kinds as they appear in packs, review packets and receipts. */
export type EntityKind =
  | 'lesson'
  | 'task'
  | 'skill'
  | 'lexeme'
  | 'clip'
  | 'phrase'
  | 'collection'
  | 'material'
  | 'situation'
  | 'source';

export const ENTITY_KINDS: readonly EntityKind[] = [
  'source',
  'situation',
  'skill',
  'lexeme',
  'lesson',
  'task',
  'clip',
  'phrase',
  'collection',
  'material',
];

export type EntityBody =
  | Lesson
  | Task
  | Skill
  | LexicalItem
  | Clip
  | Phrase
  | Collection
  | Material
  | Situation
  | SourceEntry;

export function targetKey(target: Target): string {
  return `${target.skillId}/${target.modality}`;
}

export function parseTargetKey(key: string): Target | undefined {
  const slash = key.lastIndexOf('/');
  if (slash <= 0) return undefined;
  const modality = key.slice(slash + 1) as Modality;
  if (!MODALITIES.includes(modality)) return undefined;
  return { skillId: key.slice(0, slash), modality };
}
