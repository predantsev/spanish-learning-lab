// context.open, context.activity, context.close, draft.save, attempt.submit
import { randomUUID } from 'node:crypto';
import type { Payload_attempt_submit, Payload_context_activity, Payload_context_open, Payload_draft_save } from '@sll/contracts';
import { HttpError, conflict, notFound, unprocessable } from '../../http/errors.ts';
import { assessEvidence, CHECK_KEYS, checkResponse, type CheckResult, type SupportKind, type SupportSnapshotEntry, type TargetKey } from '@sll/domain';
import { targetKey, type LessonBody, type TaskBody } from '../../content/types.ts';
import { activeDraft, failure, loadContext, ref, requireActiveContext, requireRevision, type CommandEnv, type CommandFailure, type CommandResult, type DraftRow } from '../env.ts';
import { introduceTargets, lessonIntroducedTargets, loadSession } from './session.ts';
import { targetState } from '../../learning/scheduler-store.ts';

export const TYPING_COALESCE_MS = 5_000;

function existingContextRevision(env: CommandEnv, id: string): number {
  const r = env.db.prepare('SELECT revision FROM contexts WHERE id = ?').get(id) as { revision: number } | undefined;
  return r?.revision ?? 0;
}

export function contextOpen(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_context_open;
  const id = env.cmd.subjectId;
  requireRevision(existingContextRevision(env, id), env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  const session = loadSession(env, p.sessionId);
  if (session.status !== 'active') throw unprocessable('SESSION_FINISHED');
  const taskIds = (JSON.parse(session.task_revision_ids) as string[]).map((x) => x.toLowerCase());
  if (!taskIds.includes(p.taskRevisionId.toLowerCase())) throw unprocessable('TASK_NOT_IN_SESSION');
  const task = env.repo.byRevision<TaskBody>(p.taskRevisionId);
  if (!task || task.kind !== 'task') throw unprocessable('UNKNOWN_TASK');
  if (!env.repo.isUsable(task.state)) throw unprocessable('TASK_NOT_READY');
  const lesson = env.repo.lesson(task.body.lessonId) as { body: LessonBody } | undefined;
  const title = `${lesson?.body.titleUk ?? task.body.lessonId} · ${task.logicalId}`.slice(0, 160);
  const t = env.now.toISOString();
  env.db
    .prepare('INSERT INTO contexts (id, revision, session_id, task_revision_id, open, title, mode, last_activity_at, created_at) VALUES (?, 1, ?, ?, 1, ?, ?, ?, ?)')
    .run(id, session.id, task.revisionId, title, session.mode, t, t);
  const draftId = randomUUID();
  env.db.prepare("INSERT INTO drafts (id, revision, context_id, task_revision_id, text, cursor, saved_at) VALUES (?, 1, ?, ?, '', 0, ?)").run(draftId, id, task.revisionId, t);
  env.event('context.opened', 'context', id, { sessionId: session.id, taskRevisionId: task.revisionId, draftId });
  env.markCommitted('context.open');
  return { entities: [ref(id, 1, 'context'), ref(draftId, 1, 'draft')], outcome: 'created', createdEntityId: id, route: `/exercise/${task.revisionId.toLowerCase()}` };
}

export function contextActivity(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_context_activity;
  const current = loadContext(env.db, env.cmd.subjectId);
  requireRevision(current.revision, env.cmd.expectedRevision);
  const ctx = requireActiveContext(env, env.cmd.subjectId);
  const draft = activeDraft(env.db, ctx.id);
  if (!draft || draft.revision !== p.draftRevision) throw conflict('STALE_REVISION', draft?.revision ?? 0);
  const t = env.now.getTime();
  if (p.activity === 'typing' && ctx.last_typing_at !== null && t - Date.parse(ctx.last_typing_at) < TYPING_COALESCE_MS) {
    return { entities: [ref(ctx.id, ctx.revision, 'context')], outcome: 'unchanged' };
  }
  // Timestamp-only activity: no context revision change and no learning event.
  if (p.activity === 'typing') env.db.prepare('UPDATE contexts SET last_activity_at = ?, last_typing_at = ? WHERE id = ?').run(env.now.toISOString(), env.now.toISOString(), ctx.id);
  else env.db.prepare('UPDATE contexts SET last_activity_at = ? WHERE id = ?').run(env.now.toISOString(), ctx.id);
  return { entities: [ref(ctx.id, ctx.revision, 'context')], outcome: 'updated' };
}

export function contextClose(env: CommandEnv): CommandResult {
  const ctx = loadContext(env.db, env.cmd.subjectId);
  requireRevision(ctx.revision, env.cmd.expectedRevision);
  const c = env.cmd as { contextId?: string; contextRevision?: number };
  if (c.contextId?.toLowerCase() !== ctx.id.toLowerCase()) throw unprocessable('CONTEXT_MISMATCH');
  if (c.contextRevision !== ctx.revision) throw conflict('STALE_REVISION', ctx.revision);
  if (ctx.open === 0) return { entities: [ref(ctx.id, ctx.revision, 'context')], outcome: 'unchanged' };
  env.db.prepare('UPDATE contexts SET open = 0, closed_at = ?, revision = revision + 1 WHERE id = ?').run(env.now.toISOString(), ctx.id);
  env.event('context.closed', 'context', ctx.id);
  env.markCommitted('context.close');
  return { entities: [ref(ctx.id, ctx.revision + 1, 'context')], outcome: 'updated' };
}

export function draftSave(env: CommandEnv): CommandResult | CommandFailure {
  const p = env.cmd.payload as Payload_draft_save;
  const draft = env.db.prepare('SELECT * FROM drafts WHERE id = ?').get(env.cmd.subjectId) as DraftRow | undefined;
  if (!draft) throw notFound('DRAFT_NOT_FOUND');
  const c = env.cmd as { contextId?: string };
  if (c.contextId?.toLowerCase() !== draft.context_id.toLowerCase()) throw unprocessable('CONTEXT_MISMATCH');
  if (draft.recovered_from_operation_id !== null) throw unprocessable('DRAFT_IS_RECOVERED');
  if (p.taskRevisionId.toLowerCase() !== draft.task_revision_id.toLowerCase()) throw unprocessable('TASK_MISMATCH');
  if (p.cursor > p.text.length) throw unprocessable('CURSOR_OUT_OF_RANGE');
  if (draft.revision !== env.cmd.expectedRevision) {
    // Never last-writer-wins: keep the conflicting text as a separate recovered draft, report 409.
    env.db
      .prepare(
        `INSERT INTO drafts (id, revision, context_id, task_revision_id, text, cursor, recovered_from_operation_id, saved_at)
         VALUES (?, 1, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
      )
      .run(randomUUID(), draft.context_id, draft.task_revision_id, p.text, p.cursor, env.cmd.operationId.toLowerCase(), env.now.toISOString());
    env.event('draft.recovered', 'draft', draft.id, { baseRevision: env.cmd.expectedRevision, currentRevision: draft.revision });
    env.markCommitted('draft.recovered');
    return failure(new HttpError(409, 'STALE_REVISION', { currentRevision: draft.revision }));
  }
  requireActiveContext(env, draft.context_id);
  if (draft.text === p.text && draft.cursor === p.cursor) return { entities: [ref(draft.id, draft.revision, 'draft')], outcome: 'unchanged' };
  const t = env.now.toISOString();
  env.db.prepare('UPDATE drafts SET text = ?, cursor = ?, revision = revision + 1, saved_at = ? WHERE id = ?').run(p.text, p.cursor, t, draft.id);
  env.db.prepare('UPDATE contexts SET last_activity_at = ? WHERE id = ?').run(t, draft.context_id);
  env.event('draft.saved', 'draft', draft.id, { revision: draft.revision + 1, length: p.text.length });
  env.markCommitted('draft.save');
  return { entities: [ref(draft.id, draft.revision + 1, 'draft')], outcome: 'updated' };
}

interface SupportRow {
  id: string;
  revision: number;
  kind: string;
  delivery: string;
  delivery_route: string | null;
  phase: string | null;
  targets: string;
}

export interface PinnedSupport extends SupportSnapshotEntry {
  readonly supportId: string;
}

/**
 * Support captured at submit (pinned into the attempt): an app-route reservation never rendered is
 * confirmed-undelivered (neutral); a pending external reservation is `pending` (independence unknown);
 * help already delivered in this context counts as before THIS submission.
 */
function captureSupport(env: CommandEnv, contextId: string): PinnedSupport[] {
  const rows = env.db.prepare('SELECT id, revision, kind, delivery, delivery_route, phase, targets FROM support_events WHERE context_id = ? ORDER BY recorded_at, rowid').all(contextId) as SupportRow[];
  const out: PinnedSupport[] = [];
  for (const r of rows) {
    const targets = (JSON.parse(r.targets) as Array<{ skillId: string; modality: string }>).map((t) => `${t.skillId}/${t.modality}` as TargetKey);
    const kind = r.kind as SupportKind;
    if (r.delivery === 'prepared' && r.delivery_route === 'app') {
      env.db.prepare("UPDATE support_events SET delivery = 'confirmed-undelivered', revision = revision + 1 WHERE id = ?").run(r.id);
      out.push({ supportId: r.id, kind, targets, delivery: 'confirmed-undelivered' });
    } else if (r.delivery === 'prepared') out.push({ supportId: r.id, kind, targets, delivery: 'pending' });
    else if (r.delivery === 'delivered') out.push({ supportId: r.id, kind, targets, delivery: 'delivered', phase: r.phase === 'unknown' ? 'unknown' : 'before-submit' });
    else if (r.delivery === 'delivery-unknown') out.push({ supportId: r.id, kind, targets, delivery: 'delivery-unknown' });
    else if (r.delivery === 'confirmed-undelivered') out.push({ supportId: r.id, kind, targets, delivery: 'confirmed-undelivered' });
    else out.push({ supportId: r.id, kind, targets });
  }
  return out;
}

export function attemptSubmit(env: CommandEnv): CommandResult {
  const p = env.cmd.payload as Payload_attempt_submit;
  const id = env.cmd.subjectId;
  const exists = env.db.prepare('SELECT revision FROM attempts WHERE id = ?').get(id) as { revision: number } | undefined;
  requireRevision(exists?.revision ?? 0, env.cmd.expectedRevision);
  if (env.cmd.expectedRevision !== 0) throw conflict('STALE_REVISION', 0);
  const contextId = (env.cmd as { contextId?: string }).contextId;
  if (!contextId) throw unprocessable('CONTEXT_REQUIRED');
  const ctx = requireActiveContext(env, contextId);
  if (p.taskRevisionId.toLowerCase() !== ctx.task_revision_id.toLowerCase()) throw unprocessable('TASK_MISMATCH');
  const draft = env.db.prepare('SELECT * FROM drafts WHERE id = ?').get(p.draftId) as DraftRow | undefined;
  if (!draft || draft.context_id !== ctx.id) throw unprocessable('DRAFT_CONTEXT_MISMATCH');
  if (draft.revision !== p.draftRevision) throw conflict('STALE_REVISION', draft.revision);
  const task = env.repo.byRevision<TaskBody>(ctx.task_revision_id);
  if (!task) throw unprocessable('UNKNOWN_TASK');
  // Responses the checker cannot evaluate are rejected before checking (never a fabricated grade).
  if ('optionId' in p.response) {
    const optionId = p.response.optionId;
    if (task.body.input !== 'options' || !(task.body.options ?? []).some((o) => o.id === optionId)) throw unprocessable('INVALID_RESPONSE');
  } else if (task.body.input === 'options') throw unprocessable('INVALID_RESPONSE');
  const support = captureSupport(env, ctx.id);
  const quarantined = task.state === 'quarantined' || task.state === 'retired';
  // A quarantined item never produces evidence: every target is invalid-item (not-assessed).
  const check: CheckResult = quarantined
    ? { mode: task.body.mode, wellFormed: true, normalizedText: null, results: task.body.targets.map((t) => ({ target: t, correctness: 'invalid-item' as const, explanationKey: CHECK_KEYS.invalidItem })) }
    : checkResponse(task.body, p.response);
  const verdicts = assessEvidence(check, support);
  const status = verdicts.some((v) => v.correctness === 'unresolved') ? 'unresolved' : 'checked';
  const original = 'optionId' in p.response ? p.response.optionId : p.response.text;
  const normalized = 'optionId' in p.response ? p.response.optionId : (check.normalizedText ?? p.response.text.normalize('NFC').trim());
  const audioHashes = env.repo.taskAudioHashes(task.body);
  const pinned = {
    taskRevisionId: task.revisionId,
    taskSha256: task.sha256,
    keyRevisionId: task.revisionId,
    rubricRevisionId: task.body.mode === 'rubric-review' ? task.revisionId : null,
    audioHashes,
    contextId: ctx.id,
    contextRevision: ctx.revision,
    draftId: draft.id,
    draftRevision: draft.revision,
    clock: env.now.toISOString(),
  };
  const previous = env.db.prepare('SELECT id FROM attempts WHERE context_id = ? ORDER BY submitted_at DESC, rowid DESC LIMIT 1').get(ctx.id) as { id: string } | undefined;
  env.db
    .prepare(
      `INSERT INTO attempts (id, revision, context_id, draft_id, draft_revision, task_revision_id, previous_attempt_id, response_kind, original_answer, normalized_answer,
         status, support_snapshot, pinned, submitted_at, local_date, saved_for_review) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    )
    .run(id, ctx.id, draft.id, draft.revision, task.revisionId, previous?.id ?? null, 'optionId' in p.response ? 'option' : 'text', original, normalized, status, JSON.stringify(support), JSON.stringify(pinned), env.now.toISOString(), env.today);
  // Within a lesson session the lesson's own targets count as introduced before the first result.
  const session = loadSession(env, ctx.session_id);
  if (session.source === 'lesson' && session.source_id) {
    const lesson = env.repo.byRevision<LessonBody>(session.source_id);
    const taught = new Set(lesson ? lessonIntroducedTargets(env, lesson.body) : []);
    introduceTargets(env, task.body.targets.map(targetKey).filter((k) => taught.has(k)), { lessonId: lesson?.logicalId ?? null });
  }
  const clip = audioHashes[0] ?? null;
  const itemReady = !quarantined && env.repo.isUsable(task.state);
  env.schedule(
    'attempt.submitted',
    'attempt',
    id,
    {
      kind: 'attempt-result',
      attemptId: id,
      taskRevisionId: task.revisionId,
      results: verdicts.map((v) => ({ target: targetKey(v.target) as TargetKey, correctness: v.correctness, independence: v.independence, contextFamily: task.body.family, clipHash: clip, itemReady })),
    },
    { contextId: ctx.id },
  );
  const insertResult = env.db.prepare(
    `INSERT INTO target_results (attempt_id, skill_id, modality, correctness, independence, explanation_key, matched_variant_id, context_family, clip_hash, eligible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const v of verdicts) {
    // Eligible = recorded by the scheduler as a delayed eligible check for this attempt.
    const ts = targetState(env.db, targetKey(v.target));
    const eligible = ts?.history.some((h) => h.attemptId === id) === true;
    insertResult.run(id, v.target.skillId, v.target.modality, v.correctness, v.independence, v.explanationKey, v.matchedVariantId ?? null, task.body.family, clip, eligible ? 1 : 0);
  }
  env.db.prepare('UPDATE contexts SET revision = revision + 1, last_activity_at = ? WHERE id = ?').run(env.now.toISOString(), ctx.id);
  env.markCommitted('attempt.submit');
  return { entities: [ref(id, 1, 'attempt'), ref(ctx.id, ctx.revision + 1, 'context')], outcome: status === 'checked' ? 'checked' : 'unresolved', createdEntityId: id };
}
