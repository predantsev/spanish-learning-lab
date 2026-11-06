// Pure draft-autosave state machine (DOMAIN-SPEC § Draft lifecycle). No timers, no I/O: the hook
// feeds events and persists the outbox entry. Rules:
//  - "saved" only after the service acknowledged a revision (ACK);
//  - a retry resends the identical operation (same id + same body) while the text is unchanged;
//  - a changed body always gets a new operationId;
//  - on a stale-revision answer the server text is compared with our own unacknowledged sends;
//    an unknown server text is a real conflict: the editor shows the newer server text and the
//    local text is kept separately as a recovered draft (never overwritten, never auto-merged).

export interface PendingSave {
  readonly operationId: string;
  readonly text: string;
  readonly cursor: number;
  readonly baseRevision: number;
}

export interface DraftConflict {
  readonly localText: string;
  readonly serverText: string;
  readonly serverRevision: number;
}

export interface DraftMachine {
  readonly draftId: string;
  readonly ackedRevision: number;
  readonly ackedText: string;
  readonly text: string;
  readonly cursor: number;
  /** Operation id reserved for the next send of `text` (never sent yet). */
  readonly nextOperationId: string | null;
  readonly inFlight: PendingSave | null;
  /** Last send that failed with a retryable error; resent unchanged while `text` is unchanged. */
  readonly failed: PendingSave | null;
  /** Texts sent without an acknowledgement: any of them may have been committed. */
  readonly unacknowledgedTexts: readonly string[];
  readonly conflict: DraftConflict | null;
  readonly lastResult: 'none' | 'acked' | 'failed';
}

export type DraftEvent =
  | { readonly type: 'edit'; readonly text: string; readonly cursor: number; readonly operationId: string }
  | { readonly type: 'sent'; readonly save: PendingSave }
  | { readonly type: 'ack'; readonly operationId: string; readonly revision: number }
  | { readonly type: 'fail'; readonly operationId: string; readonly retryable: boolean }
  | { readonly type: 'server'; readonly revision: number; readonly text: string }
  | { readonly type: 'resolve'; readonly keep: 'local' | 'server'; readonly operationId: string }
  | { readonly type: 'restore'; readonly text: string; readonly cursor: number; readonly operationId: string };

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'failed';

export function initialDraft(draftId: string, revision: number, text: string, cursor: number): DraftMachine {
  return {
    draftId,
    ackedRevision: revision,
    ackedText: text,
    text,
    cursor: Math.min(Math.max(0, cursor), text.length),
    nextOperationId: null,
    inFlight: null,
    failed: null,
    unacknowledgedTexts: [],
    conflict: null,
    lastResult: 'none',
  };
}

function addUnique(list: readonly string[], value: string): readonly string[] {
  return list.includes(value) ? list : [...list, value];
}

export function draftReducer(state: DraftMachine, event: DraftEvent): DraftMachine {
  switch (event.type) {
    case 'edit': {
      if (event.text === state.text) return state.cursor === event.cursor ? state : { ...state, cursor: event.cursor };
      return {
        ...state,
        text: event.text,
        cursor: event.cursor,
        nextOperationId: state.nextOperationId ?? event.operationId,
      };
    }
    case 'restore': {
      // Unacknowledged local text found in the outbox for the same base revision.
      if (event.text === state.ackedText) return state;
      return { ...state, text: event.text, cursor: event.cursor, nextOperationId: event.operationId };
    }
    case 'sent': {
      if (state.inFlight) return state;
      return {
        ...state,
        inFlight: event.save,
        failed: null,
        nextOperationId: state.nextOperationId === event.save.operationId ? null : state.nextOperationId,
      };
    }
    case 'ack': {
      const acked = state.inFlight;
      if (!acked || acked.operationId !== event.operationId) return state;
      return {
        ...state,
        ackedRevision: event.revision,
        ackedText: acked.text,
        inFlight: null,
        failed: null,
        unacknowledgedTexts: [],
        nextOperationId: state.text === acked.text ? null : state.nextOperationId,
        lastResult: 'acked',
      };
    }
    case 'fail': {
      const sent = state.inFlight;
      if (!sent || sent.operationId !== event.operationId) return state;
      return {
        ...state,
        inFlight: null,
        failed: event.retryable ? sent : null,
        unacknowledgedTexts: addUnique(state.unacknowledgedTexts, sent.text),
        lastResult: 'failed',
      };
    }
    case 'server': {
      if (event.revision === state.ackedRevision && event.text === state.ackedText) {
        // Nothing changed on the service: the rejected send must be rebuilt as a new operation.
        return { ...state, failed: null };
      }
      const ours =
        event.text === state.text ||
        event.text === state.ackedText ||
        state.unacknowledgedTexts.includes(event.text) ||
        state.failed?.text === event.text;
      if (ours) {
        return {
          ...state,
          ackedRevision: event.revision,
          ackedText: event.text,
          failed: null,
          inFlight: null,
          unacknowledgedTexts: [],
          nextOperationId: state.text === event.text ? null : state.nextOperationId,
          lastResult: 'acked',
        };
      }
      return {
        ...state,
        conflict: { localText: state.text, serverText: event.text, serverRevision: event.revision },
        text: event.text,
        cursor: Math.min(state.cursor, event.text.length),
        ackedText: event.text,
        ackedRevision: event.revision,
        failed: null,
        inFlight: null,
        unacknowledgedTexts: [],
        nextOperationId: null,
        lastResult: 'acked',
      };
    }
    case 'resolve': {
      const conflict = state.conflict;
      if (!conflict) return state;
      if (event.keep === 'server') return { ...state, conflict: null };
      return {
        ...state,
        conflict: null,
        text: conflict.localText,
        cursor: conflict.localText.length,
        nextOperationId: conflict.localText === state.ackedText ? null : event.operationId,
      };
    }
  }
}

/** True when the editor holds text the service has not acknowledged. */
export function hasUnsavedText(state: DraftMachine): boolean {
  return state.text !== state.ackedText || state.inFlight !== null;
}

/**
 * The operation to send next, or null when nothing needs saving or a send is in flight.
 * `freshOperationId` is used only when no id is reserved yet.
 */
export function planSave(state: DraftMachine, freshOperationId: string): PendingSave | null {
  if (state.inFlight) return null;
  if (state.failed && state.failed.text === state.text && state.failed.baseRevision === state.ackedRevision) {
    return state.failed;
  }
  if (state.text === state.ackedText) return null;
  return {
    operationId: state.nextOperationId ?? freshOperationId,
    text: state.text,
    cursor: state.cursor,
    baseRevision: state.ackedRevision,
  };
}

export function saveStatus(state: DraftMachine): SaveStatus {
  if (state.inFlight) return 'saving';
  if (state.text !== state.ackedText) return state.lastResult === 'failed' ? 'failed' : 'pending';
  if (state.lastResult === 'failed' && state.failed) return 'failed';
  return state.lastResult === 'none' ? 'idle' : 'saved';
}
