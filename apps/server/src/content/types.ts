// Typed views of content bodies as authored under content/source (content/schemas/content.schema.json).
// Bodies are schema-validated at pack installation; these types describe what the server reads.
import type { Block, Target } from '@sll/contracts';

export type ContentState = 'draft' | 'needs-review' | 'reviewed' | 'ready' | 'retired' | 'quarantined';
export type TargetKey = string; // `${skillId}/${modality}`

export interface Policy {
  readonly case: 'sensitive' | 'insensitive';
  readonly terminalPunctuation: 'required' | 'optional';
}

export interface Variant {
  readonly id: string;
  readonly text: string;
  readonly noteUk?: string;
}

export interface ErrorVariant {
  readonly id: string;
  readonly text: string;
  readonly outcomes: Record<TargetKey, 'correct' | 'incorrect' | 'unresolved'>;
  readonly feedbackUk: string;
}

export interface Slot {
  readonly id: string;
  readonly target: TargetKey;
  readonly accepted: readonly string[];
  readonly errors?: ReadonlyArray<{ readonly text: string; readonly feedbackUk: string }>;
  readonly closed: boolean;
}

export interface Hint {
  readonly kind: 'rule' | 'targeted-clue' | 'translation' | 'transcript' | 'reveal';
  readonly targets: readonly TargetKey[];
  readonly blocks: readonly Block[];
}

export interface TaskOption {
  readonly id: string;
  readonly label: string;
  readonly outcomes: Record<TargetKey, 'correct' | 'incorrect' | 'unresolved'>;
  readonly feedbackUk?: string;
}

export interface TaskBody {
  readonly id: string;
  readonly lessonId: string;
  readonly role: 'supported' | 'independent' | 'delayed' | 'transfer';
  readonly family: string;
  readonly mode: 'choice' | 'exact-variants' | 'finite-slots' | 'rubric-review';
  readonly targets: readonly Target[];
  readonly prompt: readonly Block[];
  readonly input: 'options' | 'short' | 'multiline';
  readonly clipIds?: readonly string[];
  readonly options?: readonly TaskOption[];
  readonly accepted?: readonly Variant[];
  readonly errors?: readonly ErrorVariant[];
  readonly closed?: boolean;
  readonly policy?: Policy;
  readonly template?: ReadonlyArray<string | { readonly slot: string }>;
  readonly slots?: readonly Slot[];
  readonly rubric?: { readonly criteriaUk: readonly string[]; readonly exemplars: readonly Variant[] };
  readonly hints?: readonly Hint[];
  readonly referenceAnswer?: string;
  readonly feedback: { readonly correctUk: string; readonly incorrectUk: string; readonly unresolvedUk?: string };
  readonly reviewStatus: ContentState;
}

export interface StepBody {
  readonly id: string;
  readonly kind: 'explanation' | 'examples' | 'supported-practice' | 'independent-practice' | 'reading' | 'listening' | 'writing' | 'summary' | 'self-check';
  readonly titleUk: string;
  readonly required: boolean;
  readonly blocks?: readonly Block[];
  readonly taskIds?: readonly string[];
  readonly clipIds?: readonly string[];
}

export interface LessonBody {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly kind: 'lesson' | 'optional-check';
  readonly blockId: string;
  readonly titleUk: string;
  readonly termEs?: string;
  readonly summaryUk: string;
  readonly objectives: readonly string[];
  readonly cv?: readonly string[];
  readonly situations: readonly string[];
  readonly estimatedMinutes: number;
  readonly skippableFoundation?: boolean;
  readonly introduces: readonly string[];
  readonly revisits: readonly string[];
  readonly steps: readonly StepBody[];
  readonly reviewStatus: ContentState;
}

export interface SkillBody {
  readonly skillId: string;
  readonly parentObjectives: readonly string[];
  readonly kind: string;
  readonly modalities: ReadonlyArray<Target['modality']>;
  readonly titleUk: string;
  readonly termEs?: string;
  readonly scope: { readonly forms?: readonly string[]; readonly persons?: readonly string[]; readonly exceptionOf?: string; readonly noteUk: string };
  readonly firstLesson: string;
  readonly prerequisites: readonly string[];
  readonly ruleUk: string;
  readonly assessed: boolean;
  readonly situations?: readonly string[];
  readonly reviewStatus: ContentState;
}

export interface ClipBody {
  readonly id: string;
  readonly lessonId: string;
  readonly kind: 'phrase' | 'sentence' | 'dialogue-line' | 'text';
  readonly transcript: string;
  readonly translationUk: string;
  readonly targets: readonly Target[];
  readonly family: string;
  readonly reviewStatus: ContentState;
}

export interface PhraseBody {
  readonly id: string;
  readonly spanish: string;
  readonly ukrainian: string;
  readonly noteUk?: string;
  readonly firstLesson: string;
  readonly skills: readonly string[];
  readonly situations: readonly string[];
  readonly clipIds?: readonly string[];
  readonly recall?: { readonly accepted: readonly Variant[]; readonly policy: Policy };
  readonly variationTaskIds?: readonly string[];
  readonly reviewStatus: ContentState;
}

export interface CollectionBody {
  readonly id: string;
  readonly titleUk: string;
  readonly descriptionUk: string;
  readonly phraseIds: readonly string[];
  readonly reviewStatus: ContentState;
}

export interface MaterialBody {
  readonly id: string;
  readonly topicId: string;
  readonly titleUk: string;
  readonly blocks: readonly Block[];
  readonly linkedTargets: readonly TargetKey[];
  readonly reviewStatus: ContentState;
}

export interface SituationBody {
  readonly id: string;
  readonly titleUk: string;
  readonly firstLessons: readonly string[];
  readonly laterLessons?: readonly string[];
}

export interface LexemeBody {
  readonly id: string;
  readonly lemma: string;
  readonly pos: string;
  readonly meaningUk: string;
  readonly firstLesson: string;
}

export function targetKey(t: Target): TargetKey {
  return `${t.skillId}/${t.modality}`;
}

export function parseTargetKey(key: TargetKey): Target {
  const i = key.lastIndexOf('/');
  return { skillId: key.slice(0, i), modality: key.slice(i + 1) as Target['modality'] };
}

export const LISTENING_MODALITIES: ReadonlySet<string> = new Set(['listening-meaning', 'dictation']);
