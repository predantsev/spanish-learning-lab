// Draft autosave for one exercise context: 500 ms debounce, flush on blur / navigation / check,
// IndexedDB outbox for every unacknowledged text, "saved" only after the service ACK, identical
// resend on retryable failures, conflict = separately shown recovered draft (never overwrite).
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../../api/client.ts';
import { makeCommand, receiptEntity } from '../../api/commands.ts';
import { ApiRequestError } from '../../api/errors.ts';
import type { Command } from '../../api/types.ts';
import { newId } from '../../lib/ids.ts';
import {
  draftReducer,
  hasUnsavedText,
  initialDraft,
  planSave,
  saveStatus,
  type DraftEvent,
  type DraftMachine,
  type SaveStatus,
} from '../../outbox/draftMachine.ts';
import { activeDrafts } from '../../outbox/reconcile.ts';
import type { OutboxEntry, OutboxStore } from '../../outbox/store.ts';
import { addLeaveListener } from '../../router/history.tsx';
import type { ContextLeaseManager } from './lease.ts';

const DEBOUNCE_MS = 500;
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000];
export const MAX_DRAFT_CHARS = 8000;

export interface DraftController {
  readonly machine: DraftMachine;
  /** Latest machine state (not the render snapshot); use after awaiting flush(). */
  readonly current: () => DraftMachine;
  readonly status: SaveStatus;
  readonly edit: (text: string, cursor: number) => void;
  /** Saves now; resolves true when the current text is acknowledged by the service. */
  readonly flush: () => Promise<boolean>;
  readonly retry: () => void;
  readonly resolveConflict: (keep: 'local' | 'server') => void;
}

interface DraftOptions {
  readonly api: ApiClient;
  readonly outbox: OutboxStore;
  readonly lease: ContextLeaseManager;
  readonly epoch: number;
  readonly taskRevisionId: string;
  readonly title: string;
}

function initialMachine(options: DraftOptions): DraftMachine {
  const { draft } = options.lease.current;
  const base = initialDraft(draft.id, draft.revision, draft.text, draft.cursor);
  const entry = options.outbox.forDraft(draft.id);
  if (!entry || entry.epoch !== options.epoch) return base;
  if (entry.text === draft.text) return base;
  if (entry.state !== 'conflict' && entry.baseRevision === draft.revision) {
    return draftReducer(base, { type: 'restore', text: entry.text, cursor: entry.cursor, operationId: entry.operationId });
  }
  // The service draft moved on: keep the browser text as a separately shown recovered draft.
  return { ...base, conflict: { localText: entry.text, serverText: draft.text, serverRevision: draft.revision } };
}

export function useDraft(options: DraftOptions): DraftController {
  const { api, outbox, lease, epoch, taskRevisionId, title } = options;
  const machineRef = useRef<DraftMachine | null>(null);
  if (machineRef.current === null) machineRef.current = initialMachine(options);
  const [, setVersion] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const flight = useRef<Promise<boolean> | null>(null);
  const mounted = useRef(true);
  /** Exact body of every sent, unacknowledged operation: an operationId is never reused with another body. */
  const sentCommands = useRef(new Map<string, Command>());
  const draftId = lease.current.draft.id;

  const machine = (): DraftMachine => machineRef.current as DraftMachine;
  const apply = useCallback((event: DraftEvent) => {
    machineRef.current = draftReducer(machineRef.current as DraftMachine, event);
    if (mounted.current) setVersion((value) => value + 1);
  }, []);

  const persist = useCallback(
    async (operationId: string, text: string, cursor: number, baseRevision: number, state: OutboxEntry['state'], command?: Command) => {
      const now = new Date().toISOString();
      const previous = outbox.forDraft(draftId);
      await outbox.put({
        operationId,
        epoch,
        contextId: lease.contextId,
        draftId,
        taskRevisionId,
        baseRevision,
        text,
        cursor,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
        title,
        state,
        command,
      });
    },
    [outbox, epoch, lease, draftId, taskRevisionId, title],
  );

  const sendOnce = useCallback(async (): Promise<boolean> => {
    const plan = planSave(machine(), newId());
    if (!plan) return !hasUnsavedText(machine());
    apply({ type: 'sent', save: plan });
    const stored = outbox.forDraft(draftId);
    const known = sentCommands.current.get(plan.operationId) ?? (stored?.operationId === plan.operationId ? stored.command : undefined);
    let command: Command;
    if (known && known.kind === 'draft.save') {
      command = known; // identical resend: same operationId, same body
    } else {
      const current = await lease.lease();
      command = makeCommand(
        'draft.save',
        epoch,
        {
          subjectId: draftId,
          expectedRevision: plan.baseRevision,
          contextId: current.contextId,
          contextRevision: current.contextRevision,
          contextSnapshot: current.contextSnapshot,
          payload: { text: plan.text, cursor: Math.min(plan.cursor, MAX_DRAFT_CHARS, plan.text.length), taskRevisionId },
        },
        plan.operationId,
      );
    }
    sentCommands.current.set(plan.operationId, command);
    await persist(plan.operationId, plan.text, plan.cursor, plan.baseRevision, 'pending', command);
    try {
      const receipt = await api.command(command);
      sentCommands.current.clear();
      lease.markStale(); // a saved answer changes the context revision
      const draftRef = receiptEntity(receipt, 'draft');
      const revision = draftRef ? draftRef.revision : (await lease.refresh()).draft.revision;
      apply({ type: 'ack', operationId: plan.operationId, revision });
      retryCount.current = 0;
      if (machine().text === plan.text) await outbox.removeDraft(draftId);
      return machine().text === plan.text;
    } catch (error) {
      if (error instanceof ApiRequestError && error.retryable) {
        apply({ type: 'fail', operationId: plan.operationId, retryable: true });
        await persist(plan.operationId, plan.text, plan.cursor, plan.baseRevision, 'failed', command);
        return false;
      }
      apply({ type: 'fail', operationId: plan.operationId, retryable: false });
      try {
        const context = await lease.refresh();
        apply({ type: 'server', revision: context.draft.revision, text: context.draft.text });
        const after = machine();
        if (after.conflict) {
          await persist(newId(), after.conflict.localText, after.conflict.localText.length, after.conflict.serverRevision, 'conflict');
          return false;
        }
        if (!hasUnsavedText(after)) {
          await outbox.removeDraft(draftId);
          return true;
        }
        return false; // a new operation is planned on the next flush
      } catch {
        await persist(plan.operationId, plan.text, plan.cursor, plan.baseRevision, 'failed', command);
        return false;
      }
    }
  }, [api, apply, draftId, epoch, lease, outbox, persist, taskRevisionId]);

  const scheduleRetry = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    const delay = RETRY_DELAYS_MS[Math.min(retryCount.current, RETRY_DELAYS_MS.length - 1)] ?? 30000;
    retryCount.current += 1;
    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;
      void flushRef.current();
    }, delay);
  }, []);

  const flush = useCallback(async (): Promise<boolean> => {
    if (debounce.current) {
      clearTimeout(debounce.current);
      debounce.current = null;
    }
    while (flight.current) await flight.current;
    // Up to three rounds: an expired snapshot or a stale context revision is rebuilt as a new operation.
    for (let round = 0; round < 3; round += 1) {
      const run = sendOnce();
      flight.current = run;
      let ok: boolean;
      try {
        ok = await run;
      } finally {
        flight.current = null;
      }
      const state = machine();
      if (ok || !hasUnsavedText(state)) return !hasUnsavedText(state);
      if (state.failed || state.conflict) {
        if (state.failed) scheduleRetry();
        return false;
      }
    }
    return !hasUnsavedText(machine());
  }, [scheduleRetry, sendOnce]);

  const flushRef = useRef(flush);
  flushRef.current = flush;

  const edit = useCallback(
    (text: string, cursor: number) => {
      const bounded = text.slice(0, MAX_DRAFT_CHARS);
      apply({ type: 'edit', text: bounded, cursor: Math.min(cursor, bounded.length), operationId: newId() });
      const state = machine();
      if (bounded === state.ackedText && !state.inFlight) {
        void outbox.removeDraft(draftId);
      } else {
        const key = state.nextOperationId ?? state.failed?.operationId ?? newId();
        void persist(key, bounded, cursor, state.ackedRevision, state.failed ? 'failed' : 'pending');
      }
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        debounce.current = null;
        void flushRef.current();
      }, DEBOUNCE_MS);
    },
    [apply, draftId, outbox, persist],
  );

  const retry = useCallback(() => {
    retryCount.current = 0;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    void flushRef.current();
  }, []);

  const resolveConflict = useCallback(
    (keep: 'local' | 'server') => {
      apply({ type: 'resolve', keep, operationId: newId() });
      if (keep === 'server') void outbox.removeDraft(draftId);
      else void flushRef.current();
    },
    [apply, draftId, outbox],
  );

  useEffect(() => {
    mounted.current = true;
    activeDrafts.add(draftId);
    const removeLeave = addLeaveListener(() => void flushRef.current());
    // Unacknowledged text restored from the outbox is sent right away.
    if (hasUnsavedText(machine())) void flushRef.current();
    return () => {
      mounted.current = false;
      removeLeave();
      activeDrafts.delete(draftId);
      if (debounce.current) clearTimeout(debounce.current);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (hasUnsavedText(machine())) void flushRef.current();
    };
  }, [draftId]);

  return {
    machine: machine(),
    current: machine,
    status: saveStatus(machine()),
    edit,
    flush,
    retry,
    resolveConflict,
  };
}
