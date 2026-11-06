// Shared domain vocabulary (DOMAIN-SPEC §Identity, §Checking). Pure types and tiny helpers only.

export const MODALITIES = [
  'written-form',
  'context-choice',
  'reading-meaning',
  'listening-meaning',
  'dictation',
  'phrase-recall',
  'construction-use',
] as const;

export type Modality = (typeof MODALITIES)[number];

/** Wire-compatible with the contract `Target` (`{ skillId, modality }`). */
export interface Target {
  readonly skillId: string;
  readonly modality: Modality;
}

/** `skillId/modality`, the string form used by content outcomes, hints and slots. */
export type TargetKey = `${string}/${Modality}`;

/** Local calendar date `YYYY-MM-DD` in the profile review timezone. */
export type CalendarDate = string;

export type Correctness = 'correct' | 'incorrect' | 'unresolved' | 'invalid-item';
export type Independence = 'independent' | 'supported' | 'unknown' | 'not-assessed';

/** Per-target verdict a reviewed option/variant may declare (content `TargetOutcomes`). */
export type Outcome = 'correct' | 'incorrect' | 'unresolved';

export type TaskRole = 'supported' | 'independent' | 'delayed' | 'transfer';

/** Listening evidence needs a distinct audio asset, not only a distinct prompt family. */
export const LISTENING_MODALITIES: readonly Modality[] = ['listening-meaning', 'dictation'];

const SKILL_ID = /^[a-z0-9][a-z0-9._-]{1,119}$/;

export class DomainError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export function isModality(value: unknown): value is Modality {
  return typeof value === 'string' && (MODALITIES as readonly string[]).includes(value);
}

export function isListeningModality(modality: Modality): boolean {
  return LISTENING_MODALITIES.includes(modality);
}

export function targetKey(target: Target): TargetKey {
  if (!SKILL_ID.test(target.skillId) || !isModality(target.modality)) {
    throw new DomainError('invalid-target', `invalid target ${JSON.stringify(target)}`);
  }
  return `${target.skillId}/${target.modality}`;
}

export function isTargetKey(value: unknown): value is TargetKey {
  if (typeof value !== 'string') return false;
  const slash = value.lastIndexOf('/');
  if (slash <= 0) return false;
  return SKILL_ID.test(value.slice(0, slash)) && isModality(value.slice(slash + 1));
}

export function parseTargetKey(key: string): Target {
  if (!isTargetKey(key)) throw new DomainError('invalid-target', `invalid target key ${JSON.stringify(key)}`);
  const slash = key.lastIndexOf('/');
  return { skillId: key.slice(0, slash), modality: key.slice(slash + 1) as Modality };
}

/** Deterministic, locale-independent ordering (UTF-16 code units), used for every tie-break. */
export function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
