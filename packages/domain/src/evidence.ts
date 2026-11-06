// Combining a check result with the attempt's support snapshot (DOMAIN-SPEC §Draft, attempt and
// support lifecycle; §Checking). Correctness and independence are kept as separate fields.
import { isListeningModality, parseTargetKey, targetKey } from './types.ts';
import type { Correctness, Independence, Target, TargetKey } from './types.ts';
import type { CheckResult, TargetCheck } from './checker.ts';

export type SupportKind =
  | 'interface-help'
  | 'replay'
  | 'speed-change'
  | 'rule'
  | 'targeted-clue'
  | 'translation'
  | 'transcript'
  | 'reveal'
  | 'external-help'
  | 'delivery-unknown'
  | 'learner-reported-help';

/** Interface help and audio controls never count as language support. */
export const NEUTRAL_SUPPORT_KINDS: readonly SupportKind[] = ['interface-help', 'replay', 'speed-change'];

export type SupportDelivery = 'delivered' | 'pending' | 'delivery-unknown' | 'confirmed-undelivered';
export type SupportPhase = 'before-submit' | 'after-submit' | 'unknown';

/** One support event pinned into an attempt's support snapshot at submission. */
export interface SupportSnapshotEntry {
  readonly kind: SupportKind;
  /** Explicitly mapped targets the help actually explains (content `hints[].targets`). */
  readonly targets: readonly TargetKey[];
  /** Actual delivery state at submission; default `delivered`. */
  readonly delivery?: SupportDelivery;
  /** When delivery happened relative to the submission; default `before-submit`. */
  readonly phase?: SupportPhase;
  /**
   * `unclear`: the help was delivered but which targets it affects is uncertain. Mapped targets
   * (or, when none are mapped, every assessed target) become `unknown`, never wrong.
   */
  readonly relevance?: 'explicit' | 'unclear';
}

/** Wire-compatible with the contract `Verdict`. */
export interface Verdict {
  readonly target: Target;
  readonly correctness: Correctness;
  readonly independence: Independence;
  readonly explanationKey: string;
  readonly matchedVariantId?: string;
}

export type SupportEffect = 'none' | 'supported' | 'unknown';

/** Effect of one snapshot entry on one assessed target. */
export function supportEffect(entry: SupportSnapshotEntry, key: TargetKey): SupportEffect {
  if (NEUTRAL_SUPPORT_KINDS.includes(entry.kind)) return 'none';
  const delivery = entry.delivery ?? 'delivered';
  const phase = entry.phase ?? 'before-submit';
  if (delivery === 'confirmed-undelivered') return 'none';
  if (phase === 'after-submit') return 'none'; // review after checking never rewrites the snapshot
  const unclear = entry.relevance === 'unclear';
  const mapped = entry.targets.includes(key) || (unclear && entry.targets.length === 0);
  if (!mapped) return 'none';
  // A transcript affects listening-meaning/dictation evidence, not written targets.
  if (entry.kind === 'transcript' && !isListeningModality(parseTargetKey(key).modality)) return 'none';
  if (entry.kind === 'delivery-unknown') return 'unknown';
  if (delivery === 'pending' || delivery === 'delivery-unknown') return 'unknown';
  if (phase === 'unknown' || unclear) return 'unknown';
  return 'supported';
}

/** `supported` if any entry supported the target, else `unknown` if any was uncertain, else `independent`. */
export function independenceFor(key: TargetKey, snapshot: readonly SupportSnapshotEntry[]): Exclude<Independence, 'not-assessed'> {
  let unknown = false;
  for (const entry of snapshot) {
    const effect = supportEffect(entry, key);
    if (effect === 'supported') return 'supported';
    if (effect === 'unknown') unknown = true;
  }
  return unknown ? 'unknown' : 'independent';
}

/**
 * Per-target verdicts for one submission. `not-assessed` is used only for `invalid-item` targets,
 * whose evidence is excluded; unresolved targets keep their actual independence so a later
 * adjudication can resolve correctness without rewriting the original support snapshot.
 */
export function assessEvidence(check: CheckResult | readonly TargetCheck[], snapshot: readonly SupportSnapshotEntry[]): Verdict[] {
  const results = 'results' in check ? check.results : check;
  return results.map((r) => {
    const independence: Independence = r.correctness === 'invalid-item' ? 'not-assessed' : independenceFor(targetKey(r.target), snapshot);
    const base = {
      target: { skillId: r.target.skillId, modality: r.target.modality },
      correctness: r.correctness,
      independence,
      explanationKey: r.explanationKey,
    };
    return r.matchedVariantId === undefined ? base : { ...base, matchedVariantId: r.matchedVariantId };
  });
}
