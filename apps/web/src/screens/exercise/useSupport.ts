// Course help inside an exercise (API.md support.request, added for #111): the service copies the
// reviewed help into a reservation; the UI reads it, renders it, and only then confirms the actual
// delivery (support.confirm with the content hash). Closing the panel never deletes the record.
// Nothing is shown before the request returns, so help is never displayed without a reservation.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../../api/client.ts';
import { makeCommand, receiptEntity } from '../../api/commands.ts';
import { ApiRequestError } from '../../api/errors.ts';
import type { Command, Support } from '../../api/types.ts';
import { newId } from '../../lib/ids.ts';
import type { ContextLeaseManager } from './lease.ts';

export type HintKind = 'rule' | 'targeted-clue' | 'translation' | 'transcript' | 'reveal';

export interface DeliveredSupport {
  readonly key: string;
  readonly kind: HintKind;
  readonly hintIndex: number;
  readonly support: Support;
  readonly phase: 'before-submit' | 'after-submit';
  readonly confirmation: 'pending' | 'confirmed' | 'failed' | 'not-applicable';
}

export interface SupportController {
  readonly delivered: readonly DeliveredSupport[];
  readonly pendingKey: string | null;
  readonly error: unknown;
  readonly request: (kind: HintKind, hintIndex: number, phase: 'before-submit' | 'after-submit') => Promise<DeliveredSupport | null>;
  readonly retryConfirm: (key: string) => void;
}

export function supportKey(kind: HintKind, hintIndex: number): string {
  return `${kind}:${hintIndex}`;
}

export function useSupport(api: ApiClient, lease: ContextLeaseManager, epoch: number, taskRevisionId: string): SupportController {
  const [delivered, setDelivered] = useState<readonly DeliveredSupport[]>([]);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const failedRequest = useRef(new Map<string, Command>());
  const confirmCommands = useRef(new Map<string, Command>());
  const confirming = useRef(new Set<string>());

  const update = (key: string, confirmation: DeliveredSupport['confirmation']) =>
    setDelivered((previous) => previous.map((item) => (item.key === key ? { ...item, confirmation } : item)));

  const confirm = useCallback(
    async (item: DeliveredSupport) => {
      if (confirming.current.has(item.key)) return;
      if (item.support.targets.length === 0) {
        // Help without an assessed target is not language support for any target: nothing to confirm.
        update(item.key, 'not-applicable');
        return;
      }
      confirming.current.add(item.key);
      let command = confirmCommands.current.get(item.key);
      if (!command) {
        command = makeCommand('support.confirm', epoch, {
          subjectId: item.support.id,
          expectedRevision: item.support.revision,
          contextId: lease.contextId,
          contextRevision: lease.revision,
          payload: {
            contentHash: item.support.contentHash,
            deliveryId: newId(),
            reportedDeliveredAt: new Date().toISOString(),
            phase: item.phase,
            targets: item.support.targets.slice(0, 30),
          },
        });
        confirmCommands.current.set(item.key, command);
      }
      try {
        await api.command(command);
        update(item.key, 'confirmed');
      } catch (failure) {
        if (!(failure instanceof ApiRequestError && failure.retryable)) confirmCommands.current.delete(item.key);
        update(item.key, 'failed');
      } finally {
        confirming.current.delete(item.key);
      }
    },
    [api, epoch, lease],
  );

  // Confirm only after the help content has actually been rendered (next frame after commit).
  useEffect(() => {
    const waiting = delivered.filter((item) => item.confirmation === 'pending' && !confirming.current.has(item.key));
    if (waiting.length === 0) return;
    const frame = window.requestAnimationFrame(() => {
      for (const item of waiting) void confirm(item);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [delivered, confirm]);

  const request = useCallback(
    async (kind: HintKind, hintIndex: number, phase: 'before-submit' | 'after-submit') => {
      const key = supportKey(kind, hintIndex);
      const existing = delivered.find((item) => item.key === key);
      if (existing) return existing;
      if (pendingKey) return null;
      setPendingKey(key);
      setError(null);
      try {
        let command = failedRequest.current.get(key);
        if (!command) {
          const current = await lease.lease();
          command = makeCommand('support.request', epoch, {
            subjectId: newId(),
            expectedRevision: 0,
            contextId: current.contextId,
            contextRevision: current.contextRevision,
            contextSnapshot: current.contextSnapshot,
            payload: { taskRevisionId, kind, hintIndex },
          });
        }
        let receipt;
        try {
          receipt = await api.command(command);
          failedRequest.current.delete(key);
        } catch (failure) {
          if (failure instanceof ApiRequestError && failure.retryable) failedRequest.current.set(key, command);
          else failedRequest.current.delete(key);
          if (failure instanceof ApiRequestError && failure.status === 409) lease.markStale();
          throw failure;
        }
        const ref = receiptEntity(receipt, 'support');
        if (!ref) throw new ApiRequestError('invalid-response', 200);
        const support = await api.resource<Support>('support', ref.id);
        const item: DeliveredSupport = { key, kind, hintIndex, support, phase, confirmation: 'pending' };
        setDelivered((previous) => [...previous, item]);
        return item;
      } catch (failure) {
        setError(failure);
        return null;
      } finally {
        setPendingKey(null);
      }
    },
    [api, delivered, epoch, lease, pendingKey, taskRevisionId],
  );

  const retryConfirm = useCallback(
    (key: string) => {
      const item = delivered.find((candidate) => candidate.key === key);
      if (item) void confirm(item);
    },
    [confirm, delivered],
  );

  return { delivered, pendingKey, error, request, retryConfirm };
}
