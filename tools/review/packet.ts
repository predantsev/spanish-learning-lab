// Review packet builder: the exact content of one batch (a lesson, ≤25 skills, or ≤25 explicit
// items) plus mapped prerequisites, source anchors and the reviewer instructions of
// CONTENT-PLAN § Text review. packetHash = SHA-256 of the canonical JSON without packetHash.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalSha256 } from '../content/canonical.ts';
import { TOOL_VERSION, allEntities, entityHash, entityState, loadCorpus, sourceDigest } from '../content/load.ts';
import type { AnyRecord, Corpus } from '../content/load.ts';
import { courseIndex } from '../content/ledger.ts';
import type { EntityKind, Skill, Task } from '../content/types.ts';
import { ENTITY_KINDS, targetKey } from '../content/types.ts';
import { batchDir, packetHashOf } from './store.ts';
import type { PacketItem, ReviewPacket, ReviewProvider, Severity } from './store.ts';

export const MAX_BATCH_SKILLS = 25;
export const MAX_BATCH_ITEMS = 25;
/** ReviewReport.verdicts holds at most 30 entries (docs/contracts/schemas.json). */
export const MAX_BATCH_TARGETS = 30;

export const REVIEWER_INSTRUCTIONS: ReviewPacket['instructions'] = {
  role:
    'You are an independent reviewer (fresh context, opposite provider) of Spain-Spanish A1–A2 course content written for Ukrainian-speaking learners. You did not write it. Do not assume it is correct; the author has made no claim that it is.',
  duties: [
    'False or overgeneralized rules (grammar, orthography, written accents), including rules stated in ruleUk, hints, explanations and feedback.',
    'Valid answers that the key would reject (missing accepted alternatives), and wrong answers that the key would accept.',
    'Answer leakage: the prompt, options, hints or examples reveal the answer of an independent, delayed or transfer task.',
    'Unknown prerequisites: words, forms or constructions used before the lesson that teaches them (see firstLesson/prerequisites and context.lessons order) without a gloss in the prompt.',
    'Regional overclaims: non-Peninsular usage presented as Spain Spanish, or Spain-only usage presented as universal.',
    'Poor, unnatural or incorrect Ukrainian (calques, Russianisms, wrong terminology).',
    'Wrong level (beyond A1–A2 for the stated lesson) or wrong meaning/translation.',
    'Conflicting feedback or wrong support attribution: feedback contradicting the key, hint targets that do not match what the hint explains, a vocabulary gloss attributed to a grammar target.',
  ],
  severity: {
    blocking: 'A learner would be taught something false, a valid answer would be graded wrong, a wrong answer would be accepted, the answer leaks, or the item cannot be used as written. Must be fixed before learners see it.',
    minor: 'Should be improved, but does not mis-teach or mis-grade.',
    none: 'No finding.',
  } satisfies Record<Severity, string>,
  checkingRules: [
    'choice: each option lists outcomes per target key (skillId/modality); the correct option marks all its targets correct; a distractor marks only the target it actually tests as incorrect.',
    'exact-variants: `accepted` lists every reviewed acceptable answer; `errors` lists reviewed wrong answers with per-target outcomes. An unlisted answer is incorrect only when closed:true and the task has exactly one target; otherwise it is unresolved.',
    'finite-slots: one text answer is parsed against `template` (literals + {slot}); each slot has its own accepted/error values and `closed`. A response that does not match the literals is unresolved for every target.',
    'rubric-review: free writing; an exact exemplar match may be correct, anything else is unresolved with the reference shown as an example.',
    'Normalization: Unicode NFC, trim, collapse whitespace, then only the task policy (case; optional terminal punctuation). Accents, ñ, ü, ¿, ¡, tú/tu, él/el, mí/mi, qué/que are never normalized away.',
    'Ukrainian is required for every instruction, explanation, hint and feedback; Spanish must be Spain Spanish (vosotros where person forms are taught). There is no speaking or microphone work.',
  ],
  evidenceRules: [
    'Review only the entries of `items`; `context` is background (prerequisite skills, source registry, lesson order) and is not graded.',
    'Cite only references you actually consulted. Never invent URLs or passages. If you could not retrieve a passage, write "not retrieved" in its finding.',
    'Your confidence is not evidence. When evidence is insufficient, add an uncertainty instead of guessing; use blocking when a learner could be graded wrongly.',
    'Copy each item kind, logicalId and contentHash exactly from the packet.',
  ],
};

export type PacketScope = { type: 'lesson'; lessonId: string } | { type: 'skills'; skillIds: string[] } | { type: 'items'; items: Array<{ kind: EntityKind; id: string }> };

export interface PacketOptions {
  sourceDir: string;
  scope: PacketScope;
  authorProvider: ReviewProvider;
  authorModel?: string;
  authorEffort?: string;
  batchId?: string;
  createdAt?: string;
}

const KIND_ORDER = ENTITY_KINDS;

function find(corpus: Corpus, kind: EntityKind, id: string): AnyRecord | undefined {
  return allEntities(corpus).find((r) => r.kind === kind && r.id === id);
}

function selectItems(corpus: Corpus, scope: PacketScope): AnyRecord[] {
  const picked = new Map<string, AnyRecord>();
  const add = (r: AnyRecord | undefined): void => {
    if (r && r.kind !== 'source') picked.set(`${r.kind}|${r.id}`, r);
  };
  if (scope.type === 'lesson') {
    const lesson = corpus.lessons.find((l) => l.id === scope.lessonId);
    if (!lesson) throw new Error(`lesson ${scope.lessonId} does not exist in content/source`);
    add(lesson);
    const tasks = corpus.tasks.filter((t) => t.body.lessonId === scope.lessonId);
    tasks.forEach(add);
    corpus.skills.filter((s) => s.body.firstLesson === scope.lessonId).forEach(add);
    const clipIds = new Set([
      ...corpus.clips.filter((c) => c.body.lessonId === scope.lessonId).map((c) => c.id),
      ...tasks.flatMap((t) => t.body.clipIds ?? []),
      ...lesson.body.steps.flatMap((s) => s.clipIds ?? []),
    ]);
    corpus.clips.filter((c) => clipIds.has(c.id)).forEach(add);
    corpus.lexemes.filter((x) => x.body.firstLesson === scope.lessonId).forEach(add);
    corpus.phrases.filter((p) => p.body.firstLesson === scope.lessonId).forEach(add);
    corpus.materials.filter((m) => m.body.topicId === scope.lessonId).forEach(add);
    corpus.situations.filter((s) => s.body.firstLessons.includes(scope.lessonId)).forEach(add);
  } else if (scope.type === 'skills') {
    if (scope.skillIds.length === 0 || scope.skillIds.length > MAX_BATCH_SKILLS) throw new Error(`a skills batch needs 1–${MAX_BATCH_SKILLS} skills`);
    const ids = new Set(scope.skillIds);
    for (const id of ids) {
      const skill = corpus.skills.find((s) => s.id === id);
      if (!skill) throw new Error(`skill ${id} does not exist in content/source`);
      add(skill);
    }
    corpus.tasks.filter((t) => t.body.targets.some((x) => ids.has(x.skillId))).forEach(add);
    corpus.clips.filter((c) => c.body.targets.some((x) => ids.has(x.skillId))).forEach(add);
  } else {
    if (scope.items.length === 0 || scope.items.length > MAX_BATCH_ITEMS) throw new Error(`an items batch needs 1–${MAX_BATCH_ITEMS} items`);
    for (const ref of scope.items) {
      const r = find(corpus, ref.kind, ref.id);
      if (!r) throw new Error(`${ref.kind} ${ref.id} does not exist in content/source`);
      if (r.kind === 'source') throw new Error('sources are a citation registry and are not reviewed as items');
      add(r);
    }
  }
  return [...picked.values()].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (a.id < b.id ? -1 : 1));
}

export function buildPacket(options: PacketOptions): ReviewPacket {
  const { corpus, issues } = loadCorpus({ sourceDir: options.sourceDir });
  const loadErrors = issues.filter((i) => i.level === 'error');
  if (loadErrors.length > 0) throw new Error(`content/source has ${loadErrors.length} load error(s); run content:validate first (${loadErrors[0]?.file ?? ''}: ${loadErrors[0]?.message ?? ''})`);
  const items = selectItems(corpus, options.scope);
  const skills = new Map(corpus.skills.map((s) => [s.id, s.body]));

  // Targets assessed by the batch: task targets plus the assessed modalities of item skills.
  const targets = new Set<string>();
  for (const r of items) {
    if (r.kind === 'task') for (const t of (r.body as Task).targets) targets.add(targetKey(t));
    if (r.kind === 'skill' && (r.body as Skill).assessed) for (const m of (r.body as Skill).modalities) targets.add(`${r.id}/${m}`);
    if (r.kind === 'clip') for (const t of (r.body as { targets: Array<{ skillId: string; modality: string }> }).targets) targets.add(`${t.skillId}/${t.modality}`);
  }
  if (targets.size === 0) throw new Error('the batch assesses no target; add a related skill (ReviewReport needs at least one verdict)');
  if (targets.size > MAX_BATCH_TARGETS) throw new Error(`the batch has ${targets.size} targets; at most ${MAX_BATCH_TARGETS} fit one review report — split it with --skills`);

  // Context: prerequisite and targeted skills that are not themselves under review, sources, lessons.
  const itemSkillIds = new Set(items.filter((r) => r.kind === 'skill').map((r) => r.id));
  const contextSkillIds = new Set<string>();
  for (const key of targets) {
    const skillId = key.slice(0, key.lastIndexOf('/'));
    if (!itemSkillIds.has(skillId)) contextSkillIds.add(skillId);
  }
  for (const id of [...itemSkillIds, ...contextSkillIds]) for (const p of skills.get(id)?.prerequisites ?? []) if (!itemSkillIds.has(p)) contextSkillIds.add(p);
  const contextSkills = [...contextSkillIds].sort().map((id) => skills.get(id)).filter((s): s is Skill => s !== undefined);
  const sourceIds = new Set([...itemSkillIds, ...contextSkillIds].flatMap((id) => (skills.get(id)?.sources ?? []).map((s) => s.sourceId)));
  const sources = corpus.sources.filter((s) => sourceIds.has(s.id)).map((s) => s.body);
  const lessons = corpus.lessons
    .map((l) => ({ id: l.id, titleUk: l.body.titleUk, order: courseIndex(l.id) ?? 0 }))
    .sort((a, b) => a.order - b.order);

  const packetItems: PacketItem[] = items.map((r) => ({
    kind: r.kind,
    logicalId: r.id,
    contentHash: entityHash(r),
    reviewStatus: entityState(r),
    body: r.body,
  }));
  const createdAt = options.createdAt ?? new Date().toISOString();
  const scope: ReviewPacket['scope'] =
    options.scope.type === 'lesson'
      ? { type: 'lesson', lessonId: options.scope.lessonId }
      : options.scope.type === 'skills'
        ? { type: 'skills', skillIds: [...options.scope.skillIds].sort() }
        : { type: 'items', items: packetItems.map((i) => ({ kind: i.kind, id: i.logicalId })) };
  const draft: Omit<ReviewPacket, 'packetHash' | 'batchId'> = {
    schemaVersion: 1,
    createdAt,
    toolVersion: TOOL_VERSION,
    scope,
    authorProvider: options.authorProvider,
    author: {
      provider: options.authorProvider,
      ...(options.authorModel ? { model: options.authorModel } : {}),
      ...(options.authorEffort ? { effort: options.authorEffort } : {}),
    },
    sourceDigest: sourceDigest(corpus),
    instructions: REVIEWER_INSTRUCTIONS,
    targets: [...targets].sort(),
    items: packetItems,
    context: { skills: contextSkills, sources, lessons },
  };
  const slug =
    options.scope.type === 'lesson'
      ? options.scope.lessonId
      : options.scope.type === 'skills'
        ? `skills-${[...options.scope.skillIds].sort()[0] ?? 'x'}-n${options.scope.skillIds.length}`
        : `items-${packetItems[0]?.logicalId ?? 'x'}-n${packetItems.length}`;
  const batchId = options.batchId ?? `${slug}.${createdAt.slice(0, 10)}.${canonicalSha256(draft).slice(0, 8)}`;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/.test(batchId)) throw new Error(`invalid batch id ${batchId}`);
  const withId = { ...draft, batchId } as Omit<ReviewPacket, 'packetHash'>;
  return { ...withId, packetHash: packetHashOf(withId) };
}

/** Writes <reviewsDir>/<batchId>/packet.json; refuses to overwrite an existing batch. */
export function writePacket(reviewsDir: string, packet: ReviewPacket): string {
  const dir = batchDir(reviewsDir, packet.batchId);
  if (existsSync(join(dir, 'packet.json'))) throw new Error(`batch ${packet.batchId} already exists; packets are immutable`);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, 'packet.json');
  writeFileSync(path, `${JSON.stringify(packet, null, 2)}\n`);
  return path;
}
