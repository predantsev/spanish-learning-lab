import { describe, expect, it } from 'vitest';
import {
  draftReducer,
  hasUnsavedText,
  initialDraft,
  planSave,
  saveStatus,
  type DraftMachine,
} from '../../apps/web/src/outbox/draftMachine.ts';

const start = (): DraftMachine => initialDraft('draft-1', 3, 'hola', 4);

describe('draft autosave state machine', () => {
  it('starts idle with nothing to save', () => {
    const state = start();
    expect(saveStatus(state)).toBe('idle');
    expect(planSave(state, 'op-x')).toBeNull();
    expect(hasUnsavedText(state)).toBe(false);
  });

  it('an edit reserves one operation id and plans a save on the acknowledged base revision', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'hola m', cursor: 6, operationId: 'op-1' });
    state = draftReducer(state, { type: 'edit', text: 'hola mu', cursor: 7, operationId: 'op-2' });
    expect(saveStatus(state)).toBe('pending');
    expect(planSave(state, 'op-fresh')).toEqual({ operationId: 'op-1', text: 'hola mu', cursor: 7, baseRevision: 3 });
  });

  it('shows saved only after the ACK and clears unacknowledged texts', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'hola mundo', cursor: 10, operationId: 'op-1' });
    const save = planSave(state, 'unused');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    expect(saveStatus(state)).toBe('saving');
    expect(planSave(state, 'op-z')).toBeNull();
    state = draftReducer(state, { type: 'ack', operationId: 'op-1', revision: 4 });
    expect(saveStatus(state)).toBe('saved');
    expect(state.ackedRevision).toBe(4);
    expect(state.ackedText).toBe('hola mundo');
    expect(state.unacknowledgedTexts).toEqual([]);
  });

  it('a stale ACK for another operation is ignored', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'a', cursor: 1, operationId: 'op-1' });
    const save = planSave(state, 'x');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    const after = draftReducer(state, { type: 'ack', operationId: 'other', revision: 9 });
    expect(after).toBe(state);
  });

  it('edits during flight need a new operation after the ACK', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'hola 1', cursor: 6, operationId: 'op-1' });
    const first = planSave(state, 'x');
    if (!first) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save: first });
    state = draftReducer(state, { type: 'edit', text: 'hola 12', cursor: 7, operationId: 'op-2' });
    state = draftReducer(state, { type: 'ack', operationId: 'op-1', revision: 4 });
    expect(saveStatus(state)).toBe('pending');
    expect(planSave(state, 'x')).toEqual({ operationId: 'op-2', text: 'hola 12', cursor: 7, baseRevision: 4 });
  });

  it('a retryable failure resends the identical operation while the text is unchanged', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'hola!', cursor: 5, operationId: 'op-1' });
    const save = planSave(state, 'x');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    state = draftReducer(state, { type: 'fail', operationId: 'op-1', retryable: true });
    expect(saveStatus(state)).toBe('failed');
    expect(planSave(state, 'fresh')).toEqual(save);
  });

  it('a changed text after a failure gets a new operation id; the failed text is remembered as possibly committed', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'hola!', cursor: 5, operationId: 'op-1' });
    const save = planSave(state, 'x');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    state = draftReducer(state, { type: 'fail', operationId: 'op-1', retryable: true });
    state = draftReducer(state, { type: 'edit', text: 'hola!!', cursor: 6, operationId: 'op-2' });
    expect(saveStatus(state)).toBe('failed');
    expect(planSave(state, 'fresh')?.operationId).toBe('op-2');
    expect(state.unacknowledgedTexts).toEqual(['hola!']);
  });

  it('a stale-revision answer that matches our own lost write is adopted, not shown as a conflict', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'mine 1', cursor: 6, operationId: 'op-1' });
    const save = planSave(state, 'x');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    state = draftReducer(state, { type: 'fail', operationId: 'op-1', retryable: true });
    state = draftReducer(state, { type: 'edit', text: 'mine 12', cursor: 7, operationId: 'op-2' });
    state = draftReducer(state, { type: 'server', revision: 4, text: 'mine 1' });
    expect(state.conflict).toBeNull();
    expect(state.ackedRevision).toBe(4);
    expect(planSave(state, 'fresh')).toEqual({ operationId: 'op-2', text: 'mine 12', cursor: 7, baseRevision: 4 });
  });

  it('an unknown newer server text becomes a separately shown recovered draft; nothing is overwritten', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'tab A text', cursor: 10, operationId: 'op-1' });
    const save = planSave(state, 'x');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    state = draftReducer(state, { type: 'fail', operationId: 'op-1', retryable: false });
    state = draftReducer(state, { type: 'server', revision: 5, text: 'tab B text' });
    expect(state.conflict).toEqual({ localText: 'tab A text', serverText: 'tab B text', serverRevision: 5 });
    expect(state.text).toBe('tab B text');
    expect(planSave(state, 'fresh')).toBeNull();
    const kept = draftReducer(state, { type: 'resolve', keep: 'local', operationId: 'op-3' });
    expect(kept.conflict).toBeNull();
    expect(planSave(kept, 'fresh')).toEqual({ operationId: 'op-3', text: 'tab A text', cursor: 10, baseRevision: 5 });
    const dropped = draftReducer(state, { type: 'resolve', keep: 'server', operationId: 'op-4' });
    expect(dropped.conflict).toBeNull();
    expect(planSave(dropped, 'fresh')).toBeNull();
  });

  it('an unchanged server state after a rejection rebuilds the send as a new operation', () => {
    let state = draftReducer(start(), { type: 'edit', text: 'hola!', cursor: 5, operationId: 'op-1' });
    const save = planSave(state, 'x');
    if (!save) throw new Error('expected a save');
    state = draftReducer(state, { type: 'sent', save });
    state = draftReducer(state, { type: 'fail', operationId: 'op-1', retryable: false });
    state = draftReducer(state, { type: 'server', revision: 3, text: 'hola' });
    expect(planSave(state, 'op-new')).toEqual({ operationId: 'op-new', text: 'hola!', cursor: 5, baseRevision: 3 });
  });

  it('restores unacknowledged outbox text on top of the same base revision', () => {
    const state = draftReducer(start(), { type: 'restore', text: 'hola desde outbox', cursor: 17, operationId: 'op-r' });
    expect(saveStatus(state)).toBe('pending');
    expect(planSave(state, 'x')?.operationId).toBe('op-r');
  });
});
