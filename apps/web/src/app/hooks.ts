import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ApiRequestError } from '../api/errors.ts';
import type { Command, Receipt } from '../api/types.ts';
import type { OutboxEntry, OutboxStore } from '../outbox/store.ts';
import { useApp } from './context.tsx';

export type LoadState<T> =
  | { readonly status: 'loading'; readonly data?: undefined; readonly error?: undefined }
  | { readonly status: 'ready'; readonly data: T; readonly error?: undefined }
  | { readonly status: 'error'; readonly data?: undefined; readonly error: unknown };

export interface Resource<T> {
  readonly state: LoadState<T>;
  readonly reload: () => void;
  /** Replaces the loaded value after a successful write that returned fresh data. */
  readonly replace: (value: T) => void;
}

/**
 * Loads data for a key; reloads when the key changes. A null key keeps the resource loading
 * (dependencies not ready yet). Previous requests are aborted.
 */
export function useResource<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>): Resource<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    setState((previous) => (previous.status === 'loading' ? previous : { status: 'loading' }));
    loadRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error });
      });
    return () => controller.abort();
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  const replace = useCallback((value: T) => setState({ status: 'ready', data: value }), []);
  return { state, reload, replace };
}

export type MutationStatus = 'idle' | 'pending' | 'failed' | 'done';

export interface CommandRunner {
  readonly status: MutationStatus;
  readonly error: unknown;
  /** Sends a command; resolves to the receipt or null on failure (the error is kept in state). */
  readonly run: (command: Command) => Promise<Receipt | null>;
  /** Resends the last retryable failed command unchanged (same operationId and body). */
  readonly retry: () => Promise<Receipt | null>;
  readonly canRetry: boolean;
  readonly reset: () => void;
}

export function useCommandRunner(): CommandRunner {
  const { api } = useApp();
  const [status, setStatus] = useState<MutationStatus>('idle');
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState<Command | null>(null);
  const busy = useRef(false);

  const run = useCallback(
    async (command: Command): Promise<Receipt | null> => {
      if (busy.current) return null;
      busy.current = true;
      setStatus('pending');
      setError(null);
      try {
        const receipt = await api.command(command);
        setPending(null);
        setStatus('done');
        return receipt;
      } catch (failure) {
        setError(failure);
        setStatus('failed');
        setPending(failure instanceof ApiRequestError && failure.retryable ? command : null);
        return null;
      } finally {
        busy.current = false;
      }
    },
    [api],
  );

  const retry = useCallback(async () => (pending ? run(pending) : null), [pending, run]);
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setPending(null);
  }, []);
  return { status, error, run, retry, canRetry: pending !== null, reset };
}

export function useOutboxEntries(outbox: OutboxStore): readonly OutboxEntry[] {
  return useSyncExternalStore(
    (listener) => outbox.subscribe(listener),
    () => outbox.all(),
    () => outbox.all(),
  );
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener('change', listener);
      return () => list.removeEventListener('change', listener);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : true),
    () => true,
  );
}

/** Desktop layout (≥768 px): side-by-side list/detail, left navigation, inline reference panel. */
export function useWideLayout(): boolean {
  return useMediaQuery('(min-width: 48rem)');
}
