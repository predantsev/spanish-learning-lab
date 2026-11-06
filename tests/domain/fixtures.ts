// SYNTHETIC domain test fixtures (docs/ACCEPTANCE.md §Automated fixtures).
// Unreviewed for teaching and NOT production Spanish answer keys. IDs, families and hashes are fixed.
import { assessEvidence, checkResponse, targetKey } from '@sll/domain';
import type {
  AttemptResultEvent,
  CheckResponse,
  CheckableTask,
  QueueTask,
  SchedulerEvent,
  SupportKind,
  SupportSnapshotEntry,
  TargetKey,
  TaskRole,
  Verdict,
} from '@sll/domain';

export const TZ = 'Europe/Madrid';
export const CLOCK_START = '2026-10-01T08:00:00Z';

export const HECHO: TargetKey = 'participle.hecho/written-form';
export const HABER: TargetKey = 'perfecto.haber/written-form';
export const CHOICE: TargetKey = 'perfecto.choice/context-choice';
export const SHOP: TargetKey = 'shop.more/listening-meaning';
export const ALL_TARGETS: readonly TargetKey[] = [HECHO, HABER, CHOICE, SHOP];

export const CLIP_A = `sha256:${'a'.repeat(64)}`;
export const CLIP_B = `sha256:${'b'.repeat(64)}`;

const t = (key: TargetKey) => {
  const slash = key.lastIndexOf('/');
  return { skillId: key.slice(0, slash), modality: key.slice(slash + 1) } as CheckableTask['targets'][number];
};
const LENIENT = { case: 'insensitive', terminalPunctuation: 'optional' } as const;
const SENTENCE = { case: 'sensitive', terminalPunctuation: 'optional' } as const;

export interface FixtureTask extends CheckableTask {
  readonly id: string;
  readonly revision: number;
  readonly revisionId: string;
  readonly role: TaskRole;
  readonly family: string;
  readonly clipHash: string | null;
  readonly ready: boolean;
}

function task(spec: Omit<FixtureTask, 'revision' | 'revisionId' | 'clipHash' | 'ready'> & Partial<FixtureTask>): FixtureTask {
  return { revision: 1, revisionId: `${spec.id}@1`, clipHash: null, ready: true, ...spec };
}

/** participle.hecho — held-out "form" family. */
export const T01 = task({
  id: 'A2-01-L1-T01',
  role: 'delayed',
  family: 'fam.hecho.form',
  mode: 'exact-variants',
  targets: [t(HECHO)],
  accepted: [{ id: 'hecho', text: 'hecho' }],
  errors: [{ id: 'hacido', text: 'hacido', outcomes: { [HECHO]: 'incorrect' } }],
  closed: true,
  policy: LENIENT,
});

/** participle.hecho — held-out "sentence" family (finite slot). */
export const T02 = task({
  id: 'A2-01-L1-T02',
  role: 'transfer',
  family: 'fam.hecho.sentence',
  mode: 'finite-slots',
  targets: [t(HECHO)],
  template: ['Hoy he ', { slot: 'part' }, ' la cena.'],
  slots: [{ id: 'part', target: HECHO, accepted: ['hecho'], errors: [{ text: 'hacido' }], closed: true }],
  policy: SENTENCE,
});

/** perfecto.haber — held-out "form" family. */
export const T03 = task({
  id: 'A2-01-L1-T03',
  role: 'delayed',
  family: 'fam.haber.form',
  mode: 'exact-variants',
  targets: [t(HABER)],
  accepted: [{ id: 'he', text: 'he' }],
  errors: [{ id: 'ha', text: 'ha', outcomes: { [HABER]: 'incorrect' } }],
  closed: true,
  policy: LENIENT,
});

/** perfecto.haber — held-out "sentence" family. */
export const T04 = task({
  id: 'A2-01-L1-T04',
  role: 'transfer',
  family: 'fam.haber.sentence',
  mode: 'finite-slots',
  targets: [t(HABER)],
  template: ['Ya ', { slot: 'aux' }, ' terminado.'],
  slots: [{ id: 'aux', target: HABER, accepted: ['he'], errors: [{ text: 'ha' }], closed: true }],
  policy: SENTENCE,
});

/** perfecto.choice — held-out context choice, family "today". */
export const T05 = task({
  id: 'A2-01-L2-T01',
  role: 'delayed',
  family: 'fam.choice.today',
  mode: 'choice',
  targets: [t(CHOICE)],
  options: [
    { id: 'a', outcomes: { [CHOICE]: 'correct' } },
    { id: 'b', outcomes: { [CHOICE]: 'incorrect' } },
  ],
});

/** perfecto.choice — held-out context choice, family "ever". */
export const T06 = task({
  id: 'A2-01-L2-T02',
  role: 'transfer',
  family: 'fam.choice.ever',
  mode: 'choice',
  targets: [t(CHOICE)],
  options: [
    { id: 'a', outcomes: { [CHOICE]: 'incorrect' } },
    { id: 'b', outcomes: { [CHOICE]: 'correct' } },
  ],
});

/** shop.more — listening meaning, clip A. */
export const T07 = task({
  id: 'A2-01-L3-T01',
  role: 'delayed',
  family: 'fam.shop.counter',
  clipHash: CLIP_A,
  mode: 'choice',
  targets: [t(SHOP)],
  options: [
    { id: 'a', outcomes: { [SHOP]: 'correct' } },
    { id: 'b', outcomes: { [SHOP]: 'incorrect' } },
  ],
});

/** shop.more — listening meaning, clip B. */
export const T08 = task({
  id: 'A2-01-L3-T02',
  role: 'transfer',
  family: 'fam.shop.market',
  clipHash: CLIP_B,
  mode: 'choice',
  targets: [t(SHOP)],
  options: [
    { id: 'a', outcomes: { [SHOP]: 'incorrect' } },
    { id: 'b', outcomes: { [SHOP]: 'correct' } },
  ],
});

/** The supported task: both perfect-tense parts; its rule hint explains only the participle. */
export const T09 = task({
  id: 'A2-01-L1-T05',
  role: 'supported',
  family: 'fam.perfecto.supported',
  mode: 'finite-slots',
  targets: [t(HABER), t(HECHO)],
  template: [{ slot: 'aux' }, ' ', { slot: 'part' }, ' los deberes.'],
  slots: [
    { id: 'aux', target: HABER, accepted: ['he'], errors: [{ text: 'ha' }], closed: true },
    { id: 'part', target: HECHO, accepted: ['hecho'], errors: [{ text: 'hacido' }], closed: true },
  ],
  policy: LENIENT,
});
export const T09_RULE_HINT: SupportSnapshotEntry & { readonly kind: SupportKind } = { kind: 'rule', targets: [HECHO] };

/** The intentionally unresolved free-text task. */
export const T10 = task({
  id: 'A2-01-L1-T06',
  role: 'independent',
  family: 'fam.perfecto.free',
  mode: 'rubric-review',
  targets: [t(HABER)],
  rubric: { exemplars: [{ id: 'ex1', text: 'Hoy he trabajado mucho.' }] },
  policy: SENTENCE,
});

/** The quarantined task (its key is later found invalid). */
export const T11 = task({
  id: 'A2-01-L3-T03',
  role: 'delayed',
  family: 'fam.shop.bus',
  clipHash: CLIP_A,
  mode: 'choice',
  targets: [t(SHOP)],
  options: [
    { id: 'a', outcomes: { [SHOP]: 'correct' } },
    { id: 'b', outcomes: { [SHOP]: 'incorrect' } },
  ],
});

/** Two-target exact-variants task used for error-variant attribution. */
export const T12 = task({
  id: 'A2-01-L1-T07',
  role: 'independent',
  family: 'fam.perfecto.pair',
  mode: 'exact-variants',
  targets: [t(HABER), t(HECHO)],
  accepted: [{ id: 'he-hecho', text: 'He hecho' }],
  errors: [
    { id: 'he-hacido', text: 'He hacido', outcomes: { [HECHO]: 'incorrect' } },
    { id: 'ha-hecho', text: 'Ha hecho', outcomes: { [HABER]: 'incorrect', [HECHO]: 'correct' } },
  ],
  closed: false,
  policy: LENIENT,
});

export const FIXTURE_TASKS: readonly FixtureTask[] = [T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12];

export function queueTasks(tasks: readonly FixtureTask[] = FIXTURE_TASKS): QueueTask[] {
  return tasks.map((x) => ({
    taskId: x.id,
    revision: x.revision,
    targets: x.targets.map((tt) => targetKey(tt)),
    role: x.role,
    contextFamily: x.family,
    clipHash: x.clipHash,
    ready: x.ready,
    lastUsedSeq: null,
  }));
}

/** `YYYY-MM-DD` + UTC time → ISO instant from the injected clock. */
export function at(date: string, time = '08:00:00'): string {
  return `${date}T${time}Z`;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewEvent = DistributiveOmit<SchedulerEvent, 'eventSeq'>;

/** Event log builder assigning strictly increasing eventSeq values. */
export class EventLog {
  readonly events: SchedulerEvent[] = [];
  private seq = 0;
  private attemptNo = 0;

  add(event: NewEvent): SchedulerEvent {
    this.seq += 1;
    const full = { ...event, eventSeq: this.seq } as SchedulerEvent;
    this.events.push(full);
    return full;
  }

  introduce(instant: string, targets: readonly TargetKey[]): SchedulerEvent {
    return this.add({ kind: 'introduced', at: instant, targets });
  }

  /** Checks `response` with the real checker + evidence pipeline and records the attempt result. */
  submit(
    instant: string,
    fixture: FixtureTask,
    response: CheckResponse,
    snapshot: readonly SupportSnapshotEntry[] = [],
    attemptId?: string,
  ): { event: AttemptResultEvent; verdicts: Verdict[] } {
    this.attemptNo += 1;
    const verdicts = assessEvidence(checkResponse(fixture, response), snapshot);
    const event = this.add({
      kind: 'attempt-result',
      at: instant,
      attemptId: attemptId ?? `attempt-${String(this.attemptNo).padStart(3, '0')}`,
      taskRevisionId: fixture.revisionId,
      results: verdicts.map((v) => ({
        target: targetKey(v.target),
        correctness: v.correctness,
        independence: v.independence,
        contextFamily: fixture.family,
        clipHash: fixture.clipHash,
        itemReady: fixture.ready,
      })),
    }) as AttemptResultEvent;
    return { event, verdicts };
  }

  support(instant: string, supportKind: SupportKind, targets: readonly TargetKey[], withinAssessedTask = true): SchedulerEvent {
    return this.add({ kind: 'support-delivered', at: instant, supportKind, targets, withinAssessedTask });
  }

  preference(instant: string, targets: readonly TargetKey[], change: { frequency?: 'usual' | 'repeat-more' | 'known'; paused?: boolean }): SchedulerEvent {
    return this.add({ kind: 'preference-set', at: instant, targets, ...change });
  }
}

/** Correct answers for the fixture tasks (synthetic). */
export const CORRECT: Readonly<Record<string, CheckResponse>> = {
  [T01.id]: { text: 'hecho' },
  [T02.id]: { text: 'Hoy he hecho la cena.' },
  [T03.id]: { text: 'he' },
  [T04.id]: { text: 'Ya he terminado.' },
  [T05.id]: { optionId: 'a' },
  [T06.id]: { optionId: 'b' },
  [T07.id]: { optionId: 'a' },
  [T08.id]: { optionId: 'b' },
  [T09.id]: { text: 'He hecho los deberes.' },
  [T11.id]: { optionId: 'a' },
};

export function correct(fixture: FixtureTask): CheckResponse {
  const r = CORRECT[fixture.id];
  if (r === undefined) throw new Error(`no correct response fixture for ${fixture.id}`);
  return r;
}

export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
  }
  return value;
}
