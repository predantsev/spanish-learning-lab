// Exercise — "Focus with collapsible reference" (C-048/C-056) and "In the exercise" (D-001).
// Focus column ≤44rem; reference collapsed on the left on desktop, dismissible bottom sheet on
// phones; rule/hint/reveal available before answering (support.request → read → render →
// support.confirm); closing keeps the support record; input, caret, focus and scroll survive panel
// changes and route changes. Short answers: Enter checks; multiline: Cmd/Ctrl+Enter; IME never
// submits; visible shortcut text; no on-screen character strip. Checking freezes the committed
// answer; an explicit Next button, no timer or automatic advance.
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../app/context.tsx';
import { HelpObserverContext } from '../../app/context.tsx';
import { useResource, useWideLayout } from '../../app/hooks.ts';
import { targetTitle, useTitles } from '../../app/titles.ts';
import type { ApiClient } from '../../api/client.ts';
import { makeCommand, receiptEntity } from '../../api/commands.ts';
import { ApiRequestError, isMissing } from '../../api/errors.ts';
import type { AttemptResultView, Command, Context, ExerciseView, LearningSession, LessonView, Target } from '../../api/types.ts';
import { Blocks } from '../../components/Blocks.tsx';
import { CopyButton, PageHeader, SavePill, StateBadge, TargetLabel, targetKey } from '../../components/Common.tsx';
import { Modal } from '../../components/Dialog.tsx';
import { HelpButton } from '../../components/HelpButton.tsx';
import { ActionError, ErrorState, LoadingState } from '../../components/States.tsx';
import { ensureLessonSession } from '../../flows/session.ts';
import { newId } from '../../lib/ids.ts';
import { shortcutHintKey, shouldSubmitAnswer } from '../../lib/keyboard.ts';
import { addLeaveListener, Link, navigate, useLocation, useSearchParams } from '../../router/history.tsx';
import { paths, withQuery } from '../../router/routes.ts';
import { ContextLeaseManager } from './lease.ts';
import { ListeningPlayer, type PlaybackSpeed } from './ListeningPlayer.tsx';
import { isUnresolved, ResultPanel } from './ResultPanel.tsx';
import { MAX_DRAFT_CHARS, useDraft } from './useDraft.ts';
import { supportKey, useSupport, type DeliveredSupport, type HintKind } from './useSupport.ts';

interface ExerciseSetup {
  readonly view: ExerciseView;
  readonly context: Context | null;
  readonly session: LearningSession | null;
  readonly lesson: LessonView | null;
}

interface SetupIds {
  readonly sessionId?: string;
  readonly lessonId?: string;
  readonly contextId?: string;
}

const openings = new Map<string, Promise<Context>>();

async function readContext(api: ApiClient, contextId: string, signal?: AbortSignal): Promise<Context | null> {
  try {
    return (await api.get<Context>(`/contexts/${encodeURIComponent(contextId)}`, signal)).data;
  } catch (error) {
    if (isMissing(error) || (error instanceof ApiRequestError && error.status === 409)) return null;
    throw error;
  }
}

/** context.open once per session/task in this tab; a closed context is replaced by a new one. */
async function openContext(api: ApiClient, sessionId: string, taskRevisionId: string): Promise<Context> {
  const key = `${sessionId}:${taskRevisionId}`;
  const known = openings.get(key);
  if (known) {
    const previous = await known.catch(() => null);
    if (previous) {
      const fresh = await readContext(api, previous.metadata.id);
      if (fresh && fresh.metadata.open) return fresh;
    }
    openings.delete(key);
  }
  const opening = (async () => {
    const receipt = await api.command(
      makeCommand('context.open', api.profileEpoch, { subjectId: newId(), expectedRevision: 0, payload: { sessionId, taskRevisionId } }),
    );
    const ref = receiptEntity(receipt, 'context');
    if (!ref) throw new ApiRequestError('invalid-response', 200);
    const context = await readContext(api, ref.id);
    if (!context) throw new ApiRequestError('invalid-response', 200);
    return context;
  })();
  openings.set(key, opening);
  opening.catch(() => openings.delete(key));
  return opening;
}

async function setupExercise(api: ApiClient, taskRevisionId: string, ids: SetupIds, signal: AbortSignal): Promise<ExerciseSetup> {
  const view = (await api.get<ExerciseView>(`/views/exercises/${encodeURIComponent(taskRevisionId)}`, signal)).data;
  const lesson = ids.lessonId
    ? await api.get<LessonView>(`/views/lessons/${encodeURIComponent(ids.lessonId)}`, signal).then((envelope) => envelope.data, () => null)
    : null;
  let session = ids.sessionId ? await api.resource<LearningSession>('session', ids.sessionId, signal).catch(() => null) : null;
  let context = ids.contextId ? await readContext(api, ids.contextId, signal) : null;
  if (context && context.metadata.taskRevisionId !== taskRevisionId) context = null;
  if (!context && view.task.state === 'ready') {
    if (!session) {
      const lessonView =
        lesson ?? (await api.get<LessonView>(`/views/lessons/${encodeURIComponent(view.task.lessonId)}`, signal)).data;
      session = await ensureLessonSession(api, lessonView, view.task.audioHashes.length > 0 ? 'listening' : 'learn');
    }
    context = await openContext(api, session.id, taskRevisionId);
  }
  return { view, context, session, lesson };
}

interface ExerciseViewState {
  readonly scrollY: number;
  readonly selectionStart: number;
  readonly selectionEnd: number;
  readonly inputFocused: boolean;
  readonly referenceOpen: boolean;
}

/** Per-context view state kept across route changes inside the tab (caret, focus, scroll, panel). */
const exerciseViewState = new Map<string, ExerciseViewState>();

export function ExerciseScreen({ taskRevisionId }: { readonly taskRevisionId: string }) {
  const { api, outbox } = useApp();
  const params = useSearchParams();
  const ids: SetupIds = {
    sessionId: params.get('session') ?? undefined,
    lessonId: params.get('lesson') ?? undefined,
    contextId: params.get('context') ?? undefined,
  };
  const key = `exercise:${taskRevisionId}:${ids.sessionId ?? ''}:${ids.lessonId ?? ''}`;
  const setup = useResource(key, async (signal) => {
    // The draft machine reads unacknowledged text from the outbox synchronously on mount, so the
    // IndexedDB load must finish first (cold load straight into an exercise after a failure).
    await outbox.ready;
    return setupExercise(api, taskRevisionId, ids, signal);
  });
  return (
    <div className="page">
      {setup.state.status === 'loading' ? <LoadingState /> : null}
      {setup.state.status === 'error' ? <ErrorState error={setup.state.error} onRetry={setup.reload} /> : null}
      {setup.state.status === 'ready' ? (
        setup.state.data.context ? (
          <ExerciseWorkspace key={setup.state.data.context.metadata.id} setup={{ ...setup.state.data, context: setup.state.data.context }} stepId={params.get('step') ?? undefined} />
        ) : (
          <UnavailableTask view={setup.state.data.view} />
        )
      ) : null}
    </div>
  );
}

export function UnavailableTask({ view }: { readonly view: ExerciseView }) {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={view.lessonTitleUk} />
      <p className="notice notice-warning" role="status">
        {t(view.task.state === 'quarantined' ? 'exercise.quarantined' : 'exercise.notReady')} <StateBadge state={view.task.state} />
      </p>
      <Link className="btn btn-secondary" to={paths.lesson(view.task.lessonId)}>
        {t('exercise.toLesson')}
      </Link>
    </>
  );
}

const HINT_ORDER: readonly HintKind[] = ['rule', 'targeted-clue', 'translation', 'transcript', 'reveal'];

function listeningTargets(targets: readonly Target[]): Target[] {
  const listening = targets.filter((target) => target.modality === 'listening-meaning' || target.modality === 'dictation');
  return listening.length > 0 ? listening : [...targets];
}

export function ExerciseWorkspace({ setup, stepId }: { readonly setup: ExerciseSetup & { readonly context: Context }; readonly stepId?: string }) {
  const { t } = useTranslation();
  const { api, outbox, platform, profile, session: auth } = useApp();
  const epoch = auth.profileEpoch;
  const { view, session, lesson } = setup;
  const task = view.task;
  const leaseRef = useRef<ContextLeaseManager | null>(null);
  if (!leaseRef.current) leaseRef.current = new ContextLeaseManager(api, setup.context);
  const lease = leaseRef.current;
  const contextId = lease.contextId;
  const draft = useDraft({ api, outbox, lease, epoch, taskRevisionId: task.taskRevisionId, title: view.lessonTitleUk });
  const support = useSupport(api, lease, epoch, task.taskRevisionId);
  const titles = useTitles();
  const wide = useWideLayout();
  const location = useLocation();
  const saved = exerciseViewState.get(contextId);
  const [referenceOpen, setReferenceOpen] = useState(saved?.referenceOpen ?? false);
  const [attempt, setAttempt] = useState<AttemptResultView | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [draftNotSaved, setDraftNotSaved] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<Command | null>(null);
  const [pendingAttemptId, setPendingAttemptId] = useState<string | null>(null);
  const [writtenAlternative, setWrittenAlternative] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const selection = useRef({ start: saved?.selectionStart ?? draft.machine.cursor, end: saved?.selectionEnd ?? draft.machine.cursor });
  const submitLock = useRef(false);
  const observedHelp = useRef(new Set<string>());
  const referenceId = useId();
  const inputId = useId();
  const hintId = useId();
  const kind = task.input;
  const text = draft.machine.text;
  const ready = task.state === 'ready';
  const isListening = task.audioHashes.length > 0;
  const isDictation = task.targets.some((target) => target.modality === 'dictation');
  const phase: 'before-submit' | 'after-submit' = attempt ? 'after-submit' : 'before-submit';
  const position = session ? session.taskRevisionIds.indexOf(task.taskRevisionId) : -1;
  const hints = [...task.hints].sort((a, b) => HINT_ORDER.indexOf(a.kind) - HINT_ORDER.indexOf(b.kind) || a.index - b.index);
  const transcriptHint = task.hints.find((hint) => hint.kind === 'transcript');
  const ruleHint = task.hints.find((hint) => hint.kind === 'rule');

  // Record the context in the URL so a reload resumes the same context (no duplicate contexts).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('context') !== contextId) {
      params.set('context', contextId);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true, keepScroll: true });
    }
    // Only once per context.
  }, [contextId]);

  // Restore scroll, caret and focus after returning to this exercise.
  useEffect(() => {
    if (!saved) return;
    window.requestAnimationFrame(() => {
      window.scrollTo(0, saved.scrollY);
      const input = inputRef.current;
      if (saved.inputFocused && input) {
        input.focus({ preventScroll: true });
        try {
          input.setSelectionRange(saved.selectionStart, saved.selectionEnd);
        } catch {
          // radio inputs have no selection
        }
      }
    });
    // Mount only.
  }, []);

  const rememberViewState = useCallback(() => {
    exerciseViewState.set(contextId, {
      scrollY: window.scrollY,
      selectionStart: selection.current.start,
      selectionEnd: selection.current.end,
      inputFocused: document.activeElement === inputRef.current,
      referenceOpen,
    });
  }, [contextId, referenceOpen]);

  useEffect(() => addLeaveListener(rememberViewState), [rememberViewState]);

  const observe = useCallback(
    (kindOfHelp: 'interface-help' | 'replay' | 'speed-change', detailKey: string, targets: readonly Target[]) => {
      void (async () => {
        try {
          const current = await lease.lease();
          await api.command(
            makeCommand('support.observe', epoch, {
              subjectId: current.contextId,
              expectedRevision: current.contextRevision,
              contextId: current.contextId,
              contextRevision: current.contextRevision,
              contextSnapshot: current.contextSnapshot,
              payload: { kind: kindOfHelp, targets: targets.slice(0, 30), detailKey },
            }),
          );
        } catch {
          // Neutral observation: a failure changes no evidence and is not shown as an error.
        }
      })();
    },
    [api, epoch, lease],
  );

  const onInterfaceHelp = useCallback(
    (topic: string) => {
      if (observedHelp.current.has(topic)) return;
      observedHelp.current.add(topic);
      observe('interface-help', `help.${topic}`, []);
    },
    [observe],
  );

  const focusInput = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: false });
    try {
      input.setSelectionRange(selection.current.start, selection.current.end);
    } catch {
      // radio
    }
  };

  const loadAttempt = async (attemptId: string) => {
    try {
      const result = (await api.get<AttemptResultView>(`/views/attempts/${encodeURIComponent(attemptId)}`)).data;
      setAttempt(result);
      setPendingAttemptId(null);
      setSubmitError(null);
      window.requestAnimationFrame(() => resultHeading.current?.focus());
    } catch (error) {
      setPendingAttemptId(attemptId);
      setSubmitError(error);
    }
  };

  const submit = async (command: Command) => {
    try {
      const receipt = await api.command(command);
      setPendingSubmit(null);
      // attempt.submit increments the context revision: the next active-context command re-reads
      // GET /contexts/{id} for a new snapshot token first.
      lease.markStale();
      const ref = receiptEntity(receipt, 'attempt');
      if (!ref) throw new ApiRequestError('invalid-response', 200);
      await loadAttempt(ref.id);
    } catch (error) {
      if (error instanceof ApiRequestError && error.retryable) {
        setPendingSubmit(command); // stays frozen: the retry resends the identical operation
        setSubmitError(error);
      } else {
        setPendingSubmit(null);
        setFrozen(false);
        setSubmitError(error);
        if (error instanceof ApiRequestError && error.status === 409) lease.markStale();
      }
    }
  };

  const check = async () => {
    if (submitLock.current || frozen || !ready) return;
    const empty = draft.current().text.trim() === '';
    if (empty) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setDraftNotSaved(false);
    try {
      const savedOk = await draft.flush();
      const state = draft.current();
      if (!savedOk || state.conflict || state.text !== state.ackedText) {
        // No answer is graded while its durable save failed.
        setDraftNotSaved(true);
        return;
      }
      const current = await lease.lease();
      const response = kind === 'options' ? { optionId: state.ackedText } : { text: state.ackedText };
      const command = makeCommand('attempt.submit', epoch, {
        subjectId: newId(),
        expectedRevision: 0,
        contextId: current.contextId,
        contextRevision: current.contextRevision,
        contextSnapshot: current.contextSnapshot,
        payload: { draftId: state.draftId, draftRevision: state.ackedRevision, taskRevisionId: task.taskRevisionId, response },
      });
      setFrozen(true);
      await submit(command);
    } catch (error) {
      setSubmitError(error);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const retrySubmit = async () => {
    if (!pendingSubmit || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    try {
      await submit(pendingSubmit);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  /** Leave a failed submission: first check whether it was committed (lost response). */
  const editAfterFailedSubmit = async () => {
    if (!pendingSubmit) return;
    try {
      const receipt = await api.operation(pendingSubmit.operationId);
      const ref = receipt ? receiptEntity(receipt, 'attempt') : undefined;
      if (ref) {
        setPendingSubmit(null);
        lease.markStale();
        await loadAttempt(ref.id);
        return;
      }
      setPendingSubmit(null);
      setFrozen(false);
      setSubmitError(null);
      window.requestAnimationFrame(focusInput);
    } catch (error) {
      setSubmitError(error);
    }
  };

  const retryAfterResult = () => {
    setAttempt(null);
    setFrozen(false);
    window.requestAnimationFrame(focusInput);
  };

  const closeContext = () => {
    void (async () => {
      try {
        // Re-read the context when a submit or save changed its revision (no lease needed for close).
        const current = await lease.lease();
        await api.command(
          makeCommand('context.close', epoch, {
            subjectId: current.contextId,
            expectedRevision: current.contextRevision,
            contextId: current.contextId,
            contextRevision: current.contextRevision,
            payload: {},
          }),
        );
      } catch {
        // Closing is housekeeping: the draft and attempts are already saved.
      }
    })();
  };

  const finishSession = async (target: LearningSession): Promise<void> => {
    let revision = target.revision;
    for (let round = 0; round < 2; round += 1) {
      try {
        await api.command(makeCommand('session.finish', epoch, { subjectId: target.id, expectedRevision: revision, payload: {} }));
        return;
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 409) {
          revision = (await api.resource<LearningSession>('session', target.id)).revision;
          continue;
        }
        return;
      }
    }
  };

  const nextRoute = async (): Promise<string> => {
    if (lesson && stepId) {
      const step = lesson.steps.find((candidate) => candidate.id === stepId);
      const tasks = (step?.tasks ?? []).filter((candidate) => candidate.state === 'ready');
      const index = tasks.findIndex((candidate) => candidate.taskRevisionId === task.taskRevisionId);
      const next = index >= 0 ? tasks[index + 1] : undefined;
      if (next && session) return paths.exercise(next.taskRevisionId, { session: session.id, lesson: lesson.lessonId, step: stepId });
      return paths.lesson(lesson.lessonId, stepId);
    }
    if (session) {
      const next = position >= 0 ? session.taskRevisionIds[position + 1] : undefined;
      if (next) return paths.exercise(next, { session: session.id });
      await finishSession(session);
      return withQuery(paths.review(), { finished: session.id });
    }
    return paths.home();
  };

  const goNext = async () => {
    if (leaving) return;
    setLeaving(true);
    await draft.flush().catch(() => false);
    closeContext();
    navigate(await nextRoute());
  };

  const stopSession = async () => {
    if (!session || leaving) return;
    setLeaving(true);
    await draft.flush().catch(() => false);
    closeContext();
    await finishSession(session);
    navigate(withQuery(paths.review(), { finished: session.id }));
  };

  const requestHelp = async (hintKind: HintKind, hintIndex: number) => {
    const item = await support.request(hintKind, hintIndex, phase);
    if (item) {
      window.requestAnimationFrame(() => document.getElementById(`support-${item.key}`)?.focus({ preventScroll: false }));
    }
  };

  const startWrittenAlternative = async () => {
    setWrittenAlternative(true);
    if (transcriptHint) {
      setReferenceOpen(true);
      await support.request('transcript', transcriptHint.index, phase);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const native = event.nativeEvent;
    if (
      shouldSubmitAnswer(
        {
          key: native.key,
          metaKey: native.metaKey,
          ctrlKey: native.ctrlKey,
          altKey: native.altKey,
          shiftKey: native.shiftKey,
          repeat: native.repeat,
          isComposing: native.isComposing,
          keyCode: native.keyCode,
        },
        kind,
        platform,
      )
    ) {
      event.preventDefault();
      void check();
    }
  };

  const trackSelection = (element: HTMLInputElement | HTMLTextAreaElement) => {
    selection.current = { start: element.selectionStart ?? element.value.length, end: element.selectionEnd ?? element.value.length };
  };

  const shortcutKey = shortcutHintKey(kind, platform);
  const canCheck = ready && !frozen && !submitting && text.trim() !== '';
  const nextLabel = (() => {
    if (lesson && stepId) return t('exercise.nextInLesson');
    if (session && position >= 0 && position === session.taskRevisionIds.length - 1) return t('exercise.finishSession');
    return t('exercise.next');
  })();
  const supportFor = (key: string): DeliveredSupport | undefined => support.delivered.find((item) => item.key === key);

  const referenceContent = (
    <div className="stack">
      <p className="small">{t('exercise.reference.note')}</p>
      {hints.length === 0 ? <p className="muted">{t('exercise.reference.none')}</p> : null}
      <div className="stack">
        {hints.map((hint) => {
          const key = supportKey(hint.kind, hint.index);
          const delivered = supportFor(key);
          return (
            <div key={key} className="row">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={support.pendingKey !== null || Boolean(delivered)}
                aria-describedby={`${referenceId}-${key}`}
                onClick={() => void requestHelp(hint.kind, hint.index)}
                data-testid={`hint-${hint.kind}`}
              >
                {t(`exercise.hints.${hint.kind}`, { number: hint.index + 1 })}
              </button>
              <span id={`${referenceId}-${key}`} className="muted small">
                {delivered ? t('exercise.reference.opened') : t(`exercise.hintEffect.${hint.kind}`)}
              </span>
            </div>
          );
        })}
      </div>
      <HelpButton topic="exercise.reference" />
      <ActionError error={support.error} />
      {support.delivered.map((item) => (
        <section key={item.key} id={`support-${item.key}`} tabIndex={-1} className="support-item" aria-label={t(`exercise.hints.${item.kind}`, { number: item.hintIndex + 1 })} data-testid="support-item">
          <p className="support-kind">{t(`exercise.hints.${item.kind}`, { number: item.hintIndex + 1 })}</p>
          {item.kind === 'reveal' ? <p className="notice notice-info">{t('exercise.reference.revealIsExample')}</p> : null}
          <Blocks blocks={item.support.blocks} />
          <p className="muted small">
            {item.confirmation === 'confirmed'
              ? t('exercise.reference.recorded')
              : item.confirmation === 'failed'
                ? t('exercise.reference.recordFailed')
                : item.confirmation === 'not-applicable'
                  ? t('exercise.reference.neutral')
                  : t('exercise.reference.recording')}
            {item.confirmation === 'failed' ? (
              <button type="button" className="btn btn-small btn-ghost" onClick={() => support.retryConfirm(item.key)}>
                {t('common.retry')}
              </button>
            ) : null}
          </p>
        </section>
      ))}
      {view.materials.length > 0 ? (
        <div>
          <h3 className="group-heading">{t('exercise.reference.materials')}</h3>
          <ul className="plain-list">
            {view.materials.map((material) => (
              <li key={material.revisionId}>
                <Link to={paths.materials(task.lessonId, { material: material.materialId, from: location.pathname + location.search })}>
                  {material.titleUk}
                </Link>{' '}
                {material.state !== 'ready' ? <StateBadge state={material.state} /> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {setup.context.supportState !== 'none' && support.delivered.length === 0 ? (
        <p className="muted small">{t('exercise.reference.earlier')}</p>
      ) : null}
    </div>
  );

  return (
    <HelpObserverContext.Provider value={onInterfaceHelp}>
      <PageHeader
        title={view.lessonTitleUk}
        lead={
          <span className="row small">
            {position >= 0 && session ? <span>{t('exercise.position', { current: position + 1, total: session.taskRevisionIds.length })}</span> : null}
            <span className="badge badge-neutral">{t(`lesson.roles.${task.role}`)}</span>
            {isListening ? <span className="badge badge-neutral">{isDictation ? t('exercise.dictation') : t('exercise.listening')}</span> : null}
          </span>
        }
        actions={
          session ? (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => void stopSession()} disabled={leaving}>
              {t('exercise.stop')}
            </button>
          ) : undefined
        }
      />
      <div className={`exercise ${referenceOpen && wide ? 'reference-open' : ''}`} data-testid="exercise">
        <div className="reference-rail">
          <button
            type="button"
            className="btn btn-secondary reference-toggle"
            aria-expanded={referenceOpen}
            aria-controls={wide ? referenceId : undefined}
            onClick={() => setReferenceOpen((open) => !open)}
            data-testid="reference-toggle"
          >
            {referenceOpen && wide ? t('exercise.reference.hide') : t('exercise.reference.show')}
          </button>
          {wide && referenceOpen ? (
            <aside id={referenceId} className="reference-panel" aria-label={t('exercise.reference.title')} data-testid="reference-panel">
              <h2 className="group-heading">{t('exercise.reference.title')}</h2>
              {referenceContent}
            </aside>
          ) : null}
        </div>

        <div className="exercise-main">
          <section aria-labelledby={`${inputId}-label`}>
            <p className="muted small">
              {t('exercise.assesses')}{' '}
              {task.targets.map((target, index) => (
                <span key={targetKey(target)}>
                  {index > 0 ? ', ' : ''}
                  <TargetLabel target={target} title={targetTitle(titles, target)} />
                </span>
              ))}
            </p>
            {isListening ? (
              <div className="stack">
                {isDictation ? <p className="notice notice-info">{t('exercise.dictationNote')}</p> : null}
                {task.audioHashes.map((hash, index) => (
                  <ListeningPlayer
                    key={hash}
                    src={api.mediaUrl(hash)}
                    label={t('exercise.audioLabel', { number: index + 1 })}
                    defaultSpeed={(profile?.audioSpeed ?? 1) as PlaybackSpeed}
                    onReplay={() => observe('replay', 'audio.replay', listeningTargets(task.targets))}
                    onSpeedChange={(speed) => observe('speed-change', `audio.speed.${speed}`, listeningTargets(task.targets))}
                    onError={() => undefined}
                    onWrittenAlternative={() => void startWrittenAlternative()}
                  />
                ))}
                <div className="row">
                  {task.hints
                    .filter((hint) => hint.kind === 'transcript' || hint.kind === 'translation')
                    .map((hint) => (
                      <button
                        key={supportKey(hint.kind, hint.index)}
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={support.pendingKey !== null || Boolean(supportFor(supportKey(hint.kind, hint.index)))}
                        onClick={() => {
                          setReferenceOpen(true);
                          void requestHelp(hint.kind, hint.index);
                        }}
                      >
                        {t(`exercise.hints.${hint.kind}`, { number: hint.index + 1 })}
                      </button>
                    ))}
                  <HelpButton topic="listening.support" />
                </div>
                {writtenAlternative ? (
                  <p className="notice notice-warning" role="status" data-testid="written-alternative">
                    {transcriptHint ? t('exercise.writtenAlternative') : t('exercise.writtenAlternativeNoText')}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="prompt" id={`${inputId}-label`}>
              <Blocks blocks={task.prompt} />
            </div>

            {draft.machine.conflict ? (
              <div className="recovered-draft" role="alert" data-testid="recovered-draft">
                <p className="strong">{t('exercise.recovered.title')}</p>
                <p>{t('exercise.recovered.body')}</p>
                <pre className="draft-text" lang="es-ES">
                  {draft.machine.conflict.localText}
                </pre>
                <div className="row">
                  <button type="button" className="btn btn-secondary btn-small" onClick={() => draft.resolveConflict('local')} disabled={frozen}>
                    {t('exercise.recovered.useMine')}
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => draft.resolveConflict('server')}>
                    {t('exercise.recovered.discard')}
                  </button>
                  <CopyButton text={draft.machine.conflict.localText} />
                </div>
              </div>
            ) : null}

            <div className="answer-area">
              {kind === 'options' ? (
                <fieldset className="options" disabled={frozen || !ready}>
                  <legend className="visually-hidden">{t('exercise.options')}</legend>
                  {task.options.map((option, index) => (
                    <label key={option.id} className="choice option">
                      <input
                        ref={index === 0 ? (element) => { inputRef.current = element; } : undefined}
                        type="radio"
                        name={`answer-${contextId}`}
                        value={option.id}
                        checked={text === option.id}
                        onChange={() => draft.edit(option.id, 0)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div className="field">
                  <label htmlFor={inputId}>{isDictation ? t('exercise.answerDictation') : t('exercise.answer')}</label>
                  {kind === 'multiline' ? (
                    <textarea
                      id={inputId}
                      ref={(element) => {
                        inputRef.current = element;
                      }}
                      value={text}
                      lang="es-ES"
                      maxLength={MAX_DRAFT_CHARS}
                      readOnly={frozen || !ready}
                      aria-describedby={shortcutKey ? hintId : undefined}
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(event) => {
                        trackSelection(event.target);
                        draft.edit(event.target.value, event.target.selectionStart ?? event.target.value.length);
                      }}
                      onSelect={(event) => trackSelection(event.currentTarget)}
                      onKeyDown={onKeyDown}
                      onBlur={(event) => {
                        trackSelection(event.currentTarget);
                        void draft.flush();
                      }}
                      data-testid="answer-input"
                    />
                  ) : (
                    <input
                      id={inputId}
                      ref={(element) => {
                        inputRef.current = element;
                      }}
                      type="text"
                      value={text}
                      lang="es-ES"
                      maxLength={MAX_DRAFT_CHARS}
                      readOnly={frozen || !ready}
                      aria-describedby={shortcutKey ? hintId : undefined}
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      onChange={(event) => {
                        trackSelection(event.target);
                        draft.edit(event.target.value, event.target.selectionStart ?? event.target.value.length);
                      }}
                      onSelect={(event) => trackSelection(event.currentTarget)}
                      onKeyDown={onKeyDown}
                      onBlur={(event) => {
                        trackSelection(event.currentTarget);
                        void draft.flush();
                      }}
                      data-testid="answer-input"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="check-row">
              <button type="button" className="btn btn-primary" disabled={!canCheck} onClick={() => void check()} data-testid="check-button">
                {submitting ? t('exercise.checking') : t('exercise.check')}
              </button>
              {shortcutKey ? (
                <span id={hintId} className="shortcut-hint" data-testid="shortcut-hint">
                  {t(shortcutKey)}
                </span>
              ) : null}
              <HelpButton topic={`exercise.input.${kind}`} />
              <SavePill status={draft.status} onRetry={draft.retry} />
              {draft.status === 'failed' ? <CopyButton text={text} labelKey="exercise.copyUnsaved" /> : null}
            </div>
            {!attempt && !frozen ? (
              <div className="row">
                <button type="button" className="btn btn-ghost btn-small" onClick={() => void goNext()} disabled={leaving}>
                  {isDictation ? t('exercise.skipDictation') : t('exercise.skip')}
                </button>
              </div>
            ) : null}

            {draftNotSaved ? (
              <p className="notice notice-error" role="alert">
                {t('exercise.notCheckedUnsaved')}
              </p>
            ) : null}
            {pendingSubmit ? (
              <div className="notice notice-error" role="alert">
                <span>{t('exercise.submitNotSaved')}</span>
                <button type="button" className="btn btn-small btn-secondary" onClick={() => void retrySubmit()} disabled={submitting}>
                  {t('common.retry')}
                </button>
                <button type="button" className="btn btn-small btn-ghost" onClick={() => void editAfterFailedSubmit()}>
                  {t('exercise.editAnswer')}
                </button>
              </div>
            ) : submitError ? (
              <ActionError error={submitError} onRetry={pendingAttemptId ? () => void loadAttempt(pendingAttemptId) : undefined} />
            ) : null}
            {frozen && !attempt && !pendingSubmit && !submitError ? <p className="muted small">{t('exercise.frozen')}</p> : null}

            {attempt ? (
              <ResultPanel
                ref={resultHeading}
                result={attempt}
                answerLang={kind === 'options' ? undefined : 'es-ES'}
                actions={{
                  onNext: () => void goNext(),
                  nextLabel,
                  onRetry: retryAfterResult,
                  onOpenRule: ruleHint
                    ? () => {
                        setReferenceOpen(true);
                        void requestHelp('rule', ruleHint.index);
                      }
                    : undefined,
                }}
              />
            ) : null}
            <p className="visually-hidden" role="status" aria-live="polite">
              {attempt ? (isUnresolved(attempt) ? t('result.unresolvedTitle') : t('result.title')) : ''}
            </p>
          </section>
        </div>
      </div>

      {!wide ? (
        <Modal open={referenceOpen} title={t('exercise.reference.title')} variant="sheet" onClose={() => setReferenceOpen(false)}>
          {referenceContent}
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => {
              setReferenceOpen(false);
              window.requestAnimationFrame(focusInput);
            }}
          >
            {t('exercise.reference.backToAnswer')}
          </button>
        </Modal>
      ) : null}
    </HelpObserverContext.Provider>
  );
}
