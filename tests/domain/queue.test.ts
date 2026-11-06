import { describe, expect, it } from 'vitest';
import {
  deriveSeed,
  estimateSecondsPerItem,
  hashSeed,
  initialQueueState,
  initialTargetState,
  proposeSession,
  pruneQuarantined,
  seededShuffle,
  sessionItemCap,
} from '@sll/domain';
import type { QueueTask, TargetKey, TargetState } from '@sll/domain';
import { CLIP_A, CLIP_B, SHOP } from './fixtures.ts';

describe('queue', () => {
  it('estimates 60 s per item until 10 real attempts, then the median of bounded times', () => {
    expect(estimateSecondsPerItem([])).toBe(60);
    expect(estimateSecondsPerItem([10, 20, 30, 40, 50, 60, 70, 80, 90])).toBe(60); // only 9 samples
    expect(estimateSecondsPerItem([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(5.5); // 1–4 bounded up to 5; median (5+6)/2
    expect(estimateSecondsPerItem([10, 20, 30, 40, 50, 60, 70, 80, 90, 1000])).toBe(55); // even count, 1000 → 180
    expect(estimateSecondsPerItem([500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 10])).toBe(180);
  });

  it('caps the item count at min(30, ceil(minutes*60/estimate)), at least 1', () => {
    expect(sessionItemCap({ kind: 'minutes', minutes: 10 }, 60)).toBe(10);
    expect(sessionItemCap({ kind: 'minutes', minutes: 5 }, 45)).toBe(7);
    expect(sessionItemCap({ kind: 'minutes', minutes: 20 }, 5)).toBe(30);
    expect(sessionItemCap({ kind: 'minutes', minutes: 5 }, 180)).toBe(2);
    expect(sessionItemCap({ kind: 'count', count: 45 }, 60)).toBe(30);
    expect(sessionItemCap({ kind: 'count', count: 0 }, 60)).toBe(1);
    expect(() => sessionItemCap({ kind: 'minutes', minutes: 0 }, 60)).toThrow();
  });

  it('selects the least recently used varied held-out task, tie by taskId then revision', () => {
    const ts: TargetState = {
      ...initialTargetState(SHOP),
      introducedDate: '2026-10-01',
      stage: 1,
      dueDate: '2026-10-05',
      history: [{ date: '2026-10-02', eventSeq: 2, attemptId: 'a', contextFamily: 'fam.x', clipHash: CLIP_A, outcome: 'success' }],
    };
    const task = (taskId: string, revision: number, clipHash: string, lastUsedSeq: number | null, role: QueueTask['role'] = 'delayed'): QueueTask => ({
      taskId,
      revision,
      targets: [SHOP],
      role,
      contextFamily: `fam.${taskId}`,
      clipHash,
      ready: true,
      lastUsedSeq,
    });
    const base = { today: '2026-10-05', targets: [ts], queueState: initialQueueState(), sessionSeed: 's' };
    const pickFor = (tasks: QueueTask[]) => proposeSession({ ...base, tasks }).items[0];
    // Same clip as the previous eligible check is not a new listening context.
    expect(pickFor([task('A2-01-L3-T09', 1, CLIP_A, null), task('A2-01-L3-T05', 1, CLIP_B, 7)])).toMatchObject({ taskId: 'A2-01-L3-T05', scored: true });
    expect(pickFor([task('A2-01-L3-T06', 1, CLIP_B, 3), task('A2-01-L3-T05', 1, CLIP_B, 9)])).toMatchObject({ taskId: 'A2-01-L3-T06' });
    expect(pickFor([task('A2-01-L3-T06', 2, CLIP_B, null), task('A2-01-L3-T05', 3, CLIP_B, null)])).toMatchObject({ taskId: 'A2-01-L3-T05' });
    expect(pickFor([task('A2-01-L3-T05', 2, CLIP_B, null), task('A2-01-L3-T05', 1, CLIP_B, null)])).toMatchObject({ revision: 1 });
    // Only non-held-out tasks: still offered, but labeled extra practice and reported as a shortage.
    const extra = proposeSession({ ...base, tasks: [task('A2-01-L3-T07', 1, CLIP_B, null, 'independent')] });
    expect(extra.items[0]).toMatchObject({ scored: false, reasonKey: 'queue.extra.noHeldOut' });
    expect(extra.shortages).toEqual([{ target: SHOP, reasonKey: 'queue.shortage.heldOut' }]);
  });

  it('defers a target whose only task is already in the session', () => {
    const k = (n: string) => `queue.${n}/written-form` as TargetKey;
    const mk = (key: TargetKey, due: string): TargetState => ({ ...initialTargetState(key), introducedDate: '2026-10-01', stage: 1, dueDate: due });
    const shared: QueueTask = { taskId: 'A2-03-L1-T01', revision: 1, targets: [k('a'), k('b')], role: 'delayed', contextFamily: 'fam.s', ready: true };
    const p = proposeSession({ today: '2026-10-05', targets: [mk(k('a'), '2026-10-02'), mk(k('b'), '2026-10-03')], tasks: [shared], queueState: initialQueueState(), sessionSeed: 's' });
    expect(p.items.map((i) => i.target)).toEqual([k('a')]);
    expect(p.deferred).toEqual([k('b')]);
  });

  it('keeps the cursor when nothing is due and removes quarantined items without substitution', () => {
    const empty = proposeSession({ today: '2026-10-05', targets: [], tasks: [], queueState: { revision: 4, cursor: 2, offerSequence: 9, lastOfferedSequence: {} }, sessionSeed: 's' });
    expect(empty.items).toEqual([]);
    expect(empty.nextQueueState).toMatchObject({ revision: 5, cursor: 2, offerSequence: 9 });
    const items = [
      { target: SHOP, lane: 'O' as const, dueDate: '2026-10-05', taskId: 'A2-01-L3-T01', revision: 1, scored: true, reasonKey: 'queue.review.due' },
      { target: SHOP, lane: 'O' as const, dueDate: '2026-10-05', taskId: 'A2-01-L3-T03', revision: 1, scored: true, reasonKey: 'queue.review.due' },
    ];
    const pruned = pruneQuarantined(items, (taskId) => taskId === 'A2-01-L3-T03');
    expect(pruned.kept).toEqual([items[0]]);
    expect(pruned.removed).toEqual([{ item: items[1], reasonKey: 'queue.removed.quarantined' }]);
  });

  it('shuffles optional prompts only from the stored session seed (deterministic)', () => {
    const seed = hashSeed('session-0001');
    expect(hashSeed('session-0001')).toBe(seed);
    const options = ['a', 'b', 'c', 'd', 'e'];
    const once = seededShuffle(options, deriveSeed(seed, 'A2-01-L2-T01'));
    expect(seededShuffle(options, deriveSeed(seed, 'A2-01-L2-T01'))).toEqual(once);
    expect([...once].sort()).toEqual(options);
    expect(options).toEqual(['a', 'b', 'c', 'd', 'e']); // input untouched
    const p1 = proposeSession({ today: '2026-10-05', targets: [], tasks: [], queueState: initialQueueState(), sessionSeed: 'session-0001' });
    expect(p1.seed).toBe(seed);
  });
});
