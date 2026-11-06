// CatalogMetaView (/views/catalog-meta) and AttemptResultView (/views/attempts/{attemptId}).
import type { AttemptResultView, CatalogMetaView, Target } from '@sll/contracts';
import type { Db } from '../db/connection.ts';
import type { ContentRepository } from '../content/repository.ts';
import { blockOrderKey } from '../content/pack-format.ts';
import type { SituationBody, TaskBody } from '../content/types.ts';
import { notFound } from '../http/errors.ts';

/** Block titles/terms from the active pack manifest (`blocks`, content/source/blocks.json), else the curriculum node title. */
export function packBlocks(repo: ContentRepository): Map<string, { titleUk: string; termEs: string; summaryUk: string }> {
  const out = new Map<string, { titleUk: string; termEs: string; summaryUk: string }>();
  const row = repo.db.prepare("SELECT manifest FROM packs WHERE state = 'active' ORDER BY activated_at DESC LIMIT 1").get() as { manifest: string } | undefined;
  const blocks = row ? ((JSON.parse(row.manifest) as { blocks?: Array<{ id: string; titleUk: string; termEs?: string; summaryUk?: string }> }).blocks ?? []) : [];
  for (const b of blocks) out.set(b.id, { titleUk: b.titleUk, termEs: b.termEs ?? '', summaryUk: b.summaryUk ?? '' });
  return out;
}

export function catalogMetaView(repo: ContentRepository): CatalogMetaView {
  const meta = packBlocks(repo);
  const blockIds = [...new Set([...repo.blocks(), ...meta.keys()])].sort((a, b) => blockOrderKey(a) - blockOrderKey(b));
  return {
    viewsVersion: 1,
    blocks: blockIds.slice(0, 20).map((blockId) => ({
      blockId,
      titleUk: (meta.get(blockId)?.titleUk ?? repo.blockTitle(blockId)).slice(0, 160),
      termEs: (meta.get(blockId)?.termEs ?? '').slice(0, 160),
    })),
    situations: repo
      .listActive<SituationBody>('situation')
      .map((s) => ({ id: s.body.id.slice(0, 120), titleUk: s.body.titleUk.slice(0, 160) }))
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .slice(0, 40),
    skills: repo
      .skills()
      .map((s) => ({ skillId: s.body.skillId.slice(0, 120), titleUk: s.body.titleUk.slice(0, 160), termEs: (s.body.termEs ?? '').slice(0, 160) }))
      .sort((a, b) => (a.skillId < b.skillId ? -1 : a.skillId > b.skillId ? 1 : 0))
      .slice(0, 3000),
  };
}

type SupportKindUsed = AttemptResultView['supportUsed'][number];
const USED_KINDS: ReadonlySet<string> = new Set(['rule', 'targeted-clue', 'translation', 'transcript', 'reveal', 'external-help']);

/** Reference answer shown after checking: reviewed reference, else first accepted variant/exemplar/correct option. */
function referenceOf(task: TaskBody): string {
  if (task.referenceAnswer) return task.referenceAnswer;
  if (task.mode === 'choice') return task.options?.find((o) => Object.values(o.outcomes).every((x) => x === 'correct'))?.label ?? '';
  if (task.mode === 'exact-variants') return task.accepted?.[0]?.text ?? '';
  if (task.mode === 'rubric-review') return task.rubric?.exemplars[0]?.text ?? '';
  // finite-slots: the template filled with each slot's first accepted value.
  const slots = new Map((task.slots ?? []).map((sl) => [sl.id, sl.accepted[0] ?? '']));
  return (task.template ?? []).map((part) => (typeof part === 'string' ? part : (slots.get(part.slot) ?? ''))).join('');
}

/** The reference is only an example when alternatives are possible (open key or free writing). */
function referenceIsExample(task: TaskBody): boolean {
  if (task.mode === 'rubric-review') return true;
  if (task.mode === 'exact-variants') return !(task.closed === true && task.targets.length === 1) || (task.accepted?.length ?? 0) > 1;
  if (task.mode === 'finite-slots') return (task.slots ?? []).some((sl) => !sl.closed || sl.accepted.length > 1);
  return false;
}

/** Per-target Ukrainian feedback resolved from the pinned task revision and the recorded explanation key. */
function targetFeedback(task: TaskBody, correctness: string, explanationKey: string): string {
  if (correctness === 'correct') return task.feedback.correctUk;
  if (correctness === 'unresolved') return task.feedback.unresolvedUk ?? '';
  if (correctness === 'invalid-item') return '';
  const errorVariant = /^check\.errorVariant:(.+)$/.exec(explanationKey);
  if (errorVariant) return task.errors?.find((e) => e.id === errorVariant[1])?.feedbackUk ?? task.feedback.incorrectUk;
  const option = /^check\.option:(.+)$/.exec(explanationKey);
  if (option) return task.options?.find((o) => o.id === option[1])?.feedbackUk ?? task.feedback.incorrectUk;
  const slotError = /^check\.slot:([^:]+):error:(\d+)$/.exec(explanationKey);
  if (slotError) return task.slots?.find((s) => s.id === slotError[1])?.errors?.[Number(slotError[2])]?.feedbackUk ?? task.feedback.incorrectUk;
  return task.feedback.incorrectUk;
}

export function attemptResultView(db: Db, repo: ContentRepository, attemptId: string): AttemptResultView {
  const a = db.prepare('SELECT id, task_revision_id, original_answer, status, support_snapshot, saved_for_review FROM attempts WHERE id = ?').get(attemptId) as
    | { id: string; task_revision_id: string; original_answer: string; status: 'checked' | 'unresolved'; support_snapshot: string; saved_for_review: number }
    | undefined;
  if (!a) throw notFound('ATTEMPT_NOT_FOUND');
  const task = repo.byRevision<TaskBody>(a.task_revision_id);
  if (!task) throw notFound('ATTEMPT_NOT_FOUND');
  const results = db.prepare('SELECT skill_id, modality, correctness, independence, explanation_key FROM target_results WHERE attempt_id = ? ORDER BY rowid').all(a.id) as Array<{
    skill_id: string;
    modality: Target['modality'];
    correctness: 'correct' | 'incorrect' | 'unresolved' | 'invalid-item';
    independence: 'independent' | 'supported' | 'unknown' | 'not-assessed';
    explanation_key: string;
  }>;
  const verdicts = results.map((r) => ({
    target: { skillId: r.skill_id, modality: r.modality },
    titleUk: (repo.skill(r.skill_id)?.body.titleUk ?? r.skill_id).slice(0, 160),
    correctness: r.correctness,
    independence: r.independence,
    feedbackUk: targetFeedback(task.body, r.correctness, r.explanation_key).slice(0, 2000),
  }));
  const overall =
    a.status === 'unresolved'
      ? (task.body.feedback.unresolvedUk ?? '')
      : verdicts.every((v) => v.correctness === 'correct')
        ? task.body.feedback.correctUk
        : verdicts.some((v) => v.correctness === 'incorrect')
          ? task.body.feedback.incorrectUk
          : '';
  const snapshot = JSON.parse(a.support_snapshot) as Array<{ kind: string; delivery?: string }>;
  const used = new Set<SupportKindUsed>();
  for (const s of snapshot) {
    if (s.delivery === 'pending' || s.delivery === 'delivery-unknown') used.add('delivery-unknown');
    else if (s.delivery === 'delivered' && USED_KINDS.has(s.kind)) used.add(s.kind as SupportKindUsed);
    else if (s.delivery === 'delivered' && s.kind === 'learner-reported-help') used.add('external-help');
  }
  const reviewed = (db.prepare('SELECT count(*) AS n FROM review_reports WHERE attempt_id = ?').get(a.id) as { n: number }).n > 0;
  return {
    viewsVersion: 1,
    attemptId: a.id,
    taskRevisionId: a.task_revision_id,
    status: a.status,
    originalAnswer: a.original_answer,
    verdicts,
    feedbackUk: overall.slice(0, 2000),
    referenceAnswer: referenceOf(task.body).slice(0, 2000),
    referenceIsExample: referenceIsExample(task.body),
    supportUsed: [...used].slice(0, 12),
    savedForReview: a.saved_for_review === 1 || reviewed,
  };
}
