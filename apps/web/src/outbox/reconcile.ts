// Reconciliation of unacknowledged drafts after start-up or reconnect. Every precondition is
// re-checked against the service: the exact stored operation is resent first (lost-response
// recovery); otherwise the draft is resent as a new operation only if the service still has the
// same base revision. A newer service draft is never overwritten: the entry becomes a conflict
// that the exercise screen and the recovery list show separately.
import type { ApiClient } from '../api/client.ts';
import { makeCommand } from '../api/commands.ts';
import { ApiRequestError } from '../api/errors.ts';
import type { Context } from '../api/types.ts';
import type { OutboxEntry, OutboxStore } from './store.ts';

/** Drafts currently owned by a mounted exercise screen (it reconciles them itself). */
export const activeDrafts = new Set<string>();

export type ReconcileOutcome = 'saved' | 'kept' | 'conflict' | 'skipped';

export async function reconcileEntry(api: ApiClient, outbox: OutboxStore, entry: OutboxEntry, epoch: number): Promise<ReconcileOutcome> {
  if (entry.epoch !== epoch || entry.state === 'conflict' || activeDrafts.has(entry.draftId)) return 'skipped';
  if (entry.command) {
    try {
      await api.command(entry.command);
      await outbox.remove(entry.operationId);
      return 'saved';
    } catch (error) {
      if (error instanceof ApiRequestError && error.retryable) return 'kept';
      // Rejected (e.g. expired context snapshot or stale revision): re-check below.
    }
  }
  let context: Context;
  try {
    context = (await api.get<Context>(`/contexts/${encodeURIComponent(entry.contextId)}`)).data;
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 409)) {
      await outbox.put({ ...entry, state: 'conflict', updatedAt: new Date().toISOString() });
      return 'conflict';
    }
    return 'kept';
  }
  if (context.draft.id !== entry.draftId) {
    await outbox.put({ ...entry, state: 'conflict', updatedAt: new Date().toISOString() });
    return 'conflict';
  }
  if (context.draft.text === entry.text) {
    await outbox.remove(entry.operationId);
    return 'saved';
  }
  if (context.draft.revision !== entry.baseRevision) {
    await outbox.put({ ...entry, state: 'conflict', updatedAt: new Date().toISOString() });
    return 'conflict';
  }
  const command = makeCommand('draft.save', epoch, {
    subjectId: entry.draftId,
    expectedRevision: context.draft.revision,
    contextId: context.metadata.id,
    contextRevision: context.metadata.revision,
    contextSnapshot: context.snapshotToken,
    payload: { text: entry.text, cursor: Math.min(entry.cursor, entry.text.length), taskRevisionId: entry.taskRevisionId },
  });
  // Persist the new body before sending so a lost response can be recovered with the same key.
  const next: OutboxEntry = { ...entry, operationId: command.operationId, command, state: 'pending', updatedAt: new Date().toISOString() };
  await outbox.put(next);
  try {
    await api.command(command);
    await outbox.remove(command.operationId);
    return 'saved';
  } catch (error) {
    if (error instanceof ApiRequestError && error.retryable) {
      await outbox.put({ ...next, state: 'failed' });
      return 'kept';
    }
    await outbox.put({ ...next, state: 'conflict' });
    return 'conflict';
  }
}

export async function reconcileOutbox(api: ApiClient, outbox: OutboxStore, epoch: number): Promise<void> {
  await outbox.ready;
  for (const entry of [...outbox.all()]) {
    await reconcileEntry(api, outbox, entry, epoch);
  }
}
