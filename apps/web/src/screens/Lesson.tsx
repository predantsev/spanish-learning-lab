// Lesson flow (C-047): explanation → supported practice → independent attempts → summary.
// Manual step navigation, no perfect-score locks; optional foundation self-check or skip;
// lesson.progress visit/finish against a learn session.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource, useWideLayout } from '../app/hooks.ts';
import { makeCommand, receiptEntity } from '../api/commands.ts';
import { ApiRequestError } from '../api/errors.ts';
import type { Block, LearningSession, LessonView } from '../api/types.ts';
import { Blocks } from '../components/Blocks.tsx';
import { Es, PageHeader, StateBadge } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, ErrorState, LoadingState } from '../components/States.tsx';
import { ensureLessonSession, practiceCreateCommand, practiceRouteFromReceipt, taskRoute } from '../flows/session.ts';
import { newId } from '../lib/ids.ts';
import { Link, navigate, useSearchParams } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

type LessonStep = LessonView['steps'][number];

export function LessonScreen({ lessonId, stepId }: { readonly lessonId: string; readonly stepId?: string }) {
  const { api } = useApp();
  const lesson = useResource(`lesson:${lessonId}`, (signal) =>
    api.get<LessonView>(`/views/lessons/${encodeURIComponent(lessonId)}`, signal).then((envelope) => envelope.data),
  );
  return (
    <div className="page">
      {lesson.state.status === 'loading' ? <LoadingState /> : null}
      {lesson.state.status === 'error' ? <ErrorState error={lesson.state.error} onRetry={lesson.reload} /> : null}
      {lesson.state.status === 'ready' ? <LessonContent lesson={lesson.state.data} stepId={stepId} reload={lesson.reload} /> : null}
    </div>
  );
}

const PROGRESS_PREFIX = 'sll-lesson-progress:';

interface ProgressRef {
  readonly id: string;
  readonly revision: number;
}

function loadProgressRef(lessonId: string): ProgressRef | null {
  try {
    const raw = window.localStorage.getItem(PROGRESS_PREFIX + lessonId);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ProgressRef>;
    return typeof value.id === 'string' && typeof value.revision === 'number' ? { id: value.id, revision: value.revision } : null;
  } catch {
    return null;
  }
}

function saveProgressRef(lessonId: string, ref: ProgressRef): void {
  try {
    window.localStorage.setItem(PROGRESS_PREFIX + lessonId, JSON.stringify(ref));
  } catch {
    // Convenience cache only.
  }
}

export function currentStepOf(lesson: LessonView, stepId: string | undefined, focus: string | null): LessonStep | undefined {
  if (stepId) {
    const explicit = lesson.steps.find((step) => step.id === stepId);
    if (explicit) return explicit;
  }
  if (focus === 'rule') {
    const rule = lesson.steps.find((step) => step.kind === 'explanation');
    if (rule) return rule;
  }
  const visited = new Set(lesson.progress.visitedStepIds);
  return lesson.steps.find((step) => !visited.has(step.id)) ?? lesson.steps[0];
}

export function LessonContent({ lesson, stepId, reload }: { readonly lesson: LessonView; readonly stepId?: string; readonly reload: () => void }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const wide = useWideLayout();
  const params = useSearchParams();
  const current = currentStepOf(lesson, stepId, params.get('focus'));
  const index = current ? lesson.steps.indexOf(current) : -1;
  const [session, setSession] = useState<LearningSession | null>(null);
  const [sessionError, setSessionError] = useState<unknown>(null);
  const [localVisits, setLocalVisits] = useState<ReadonlySet<string>>(new Set());
  const [progressError, setProgressError] = useState<unknown>(null);
  const [finishState, setFinishState] = useState<'idle' | 'pending' | 'done'>('idle');
  const progressRef = useRef<ProgressRef | null>(loadProgressRef(lesson.lessonId));
  const sessionPromise = useRef<Promise<LearningSession> | null>(null);
  const visited = new Set([...lesson.progress.visitedStepIds, ...localVisits]);

  const getSession = useCallback(async (): Promise<LearningSession> => {
    if (session) return session;
    if (!sessionPromise.current) {
      sessionPromise.current = ensureLessonSession(api, lesson).then(
        (created) => {
          setSession(created);
          setSessionError(null);
          return created;
        },
        (error: unknown) => {
          sessionPromise.current = null;
          setSessionError(error);
          throw error;
        },
      );
    }
    return sessionPromise.current;
  }, [api, lesson, session]);

  const sendProgress = useCallback(
    async (step: string, action: 'visit' | 'finish'): Promise<boolean> => {
      const learnSession = await getSession();
      // TODO(contract): LessonView.progress exposes no lesson-progress id/revision, so the subject is
      // taken from the last receipt (cached per lesson) or created with expectedRevision 0.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const ref = progressRef.current;
        const command = makeCommand('lesson.progress', api.profileEpoch, {
          subjectId: ref?.id ?? newId(),
          expectedRevision: ref?.revision ?? 0,
          payload: { sessionId: learnSession.id, stepId: step, action },
        });
        try {
          const receipt = await api.command(command);
          const entity = receiptEntity(receipt, 'lesson-progress');
          if (entity) {
            progressRef.current = { id: entity.id, revision: entity.revision };
            saveProgressRef(lesson.lessonId, progressRef.current);
          }
          return true;
        } catch (error) {
          const body = error instanceof ApiRequestError ? error.body : undefined;
          if (error instanceof ApiRequestError && error.status === 409 && body?.currentRevision !== undefined) {
            progressRef.current = { id: body.createdEntityId ?? ref?.id ?? command.subjectId, revision: body.currentRevision };
            continue;
          }
          throw error;
        }
      }
      return false;
    },
    [api, getSession, lesson.lessonId],
  );

  useEffect(() => {
    if (!current || visited.has(current.id)) return;
    let cancelled = false;
    sendProgress(current.id, 'visit')
      .then((ok) => {
        if (!cancelled && ok) {
          setLocalVisits((previous) => new Set([...previous, current.id]));
          setProgressError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setProgressError(error);
      });
    return () => {
      cancelled = true;
    };
    // Runs only when the displayed step changes.
  }, [current?.id]);

  const startTask = async (taskRevisionId: string, step: LessonStep) => {
    try {
      const learnSession = await getSession();
      navigate(taskRoute(learnSession, taskRevisionId, { lesson: lesson.lessonId, step: step.id }));
    } catch {
      // sessionError is shown
    }
  };

  const finish = async () => {
    const last = lesson.steps.at(-1);
    if (!last) return;
    setFinishState('pending');
    try {
      await sendProgress(last.id, 'finish');
      setFinishState('done');
      reload();
    } catch (error) {
      setProgressError(error);
      setFinishState('idle');
    }
  };

  const missingRequired = lesson.steps.filter((step) => step.required && !visited.has(step.id));
  const selfCheck = lesson.steps.find((step) => step.kind === 'self-check');
  const isLast = index === lesson.steps.length - 1;

  return (
    <>
      <PageHeader
        title={lesson.titleUk}
        help="lesson.overview"
        lead={
          <>
            {lesson.termEs ? (
              <p>
                <Es>{lesson.termEs}</Es>
              </p>
            ) : null}
            <p>{lesson.summaryUk}</p>
            <p className="row small">
              {lesson.kind === 'optional-check' ? <span className="badge badge-neutral">{t('lesson.optionalCheck')}</span> : null}
              {lesson.state !== 'ready' ? <StateBadge state={lesson.state} /> : null}
              <span className="badge badge-neutral">{t(`lesson.status.${lesson.progress.status}`)}</span>
              <span className="muted">{t('lesson.minutes', { count: lesson.estimatedMinutes })}</span>
            </p>
          </>
        }
      />
      {lesson.kind === 'optional-check' ? <p className="notice notice-info">{t('lesson.optionalCheckNote')}</p> : null}
      {lesson.skippableFoundation ? (
        <section className="notice notice-info" aria-labelledby="lesson-foundation">
          <div>
            <p id="lesson-foundation" className="strong">
              {t('lesson.foundation.title')}
            </p>
            <p>{t('lesson.foundation.body')}</p>
            <div className="row">
              {selfCheck ? (
                <Link className="btn btn-secondary btn-small" to={paths.lesson(lesson.lessonId, selfCheck.id)}>
                  {t('lesson.foundation.selfCheck')}
                </Link>
              ) : null}
              <Link className="btn btn-ghost btn-small" to={lesson.nextLessonId ? paths.lesson(lesson.nextLessonId) : paths.catalog()}>
                {t('lesson.foundation.skip')}
              </Link>
              <HelpButton topic="lesson.foundation" />
            </div>
          </div>
        </section>
      ) : null}
      <ActionError error={sessionError} onRetry={() => void getSession().catch(() => undefined)} />

      <div className="lesson-layout">
        <nav className="step-nav" aria-label={t('lesson.stepsLabel')}>
          <details open={wide}>
            <summary className="strong">{t('lesson.stepsSummary', { current: index + 1, total: lesson.steps.length })}</summary>
            <ol className="step-list">
              {lesson.steps.map((step, position) => (
                <li key={step.id}>
                  <Link
                    to={paths.lesson(lesson.lessonId, step.id)}
                    className="step-link"
                    aria-current={step.id === current?.id ? 'step' : undefined}
                  >
                    <span className="step-mark" aria-hidden="true">
                      {visited.has(step.id) ? '✓' : position + 1}
                    </span>
                    <span>
                      {step.titleUk}
                      <span className="visually-hidden">
                        {visited.has(step.id) ? ` (${t('lesson.visited')})` : ''}
                        {step.required ? '' : ` (${t('lesson.optionalStep')})`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </details>
          {lesson.materials.length > 0 ? (
            <div className="card">
              <h2 className="group-heading">{t('lesson.materials')}</h2>
              <ul className="plain-list">
                {lesson.materials.map((material) => (
                  <li key={material.revisionId}>
                    <Link to={paths.materials(lesson.lessonId, { material: material.materialId })}>{material.titleUk}</Link>{' '}
                    {material.state !== 'ready' ? <StateBadge state={material.state} /> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </nav>

        <div className="step-content">
          {current ? (
            <StepView step={current} onStartTask={(taskId) => void startTask(taskId, current)} />
          ) : (
            <p className="notice notice-warning">{t('lesson.noSteps')}</p>
          )}
          {progressError ? (
            <p className="notice notice-warning" role="status">
              {t('lesson.progressNotSaved')}
            </p>
          ) : null}
          {isLast ? (
            <section className="card" aria-labelledby="lesson-finish">
              <h2 id="lesson-finish">{t('lesson.finish.title')}</h2>
              {lesson.progress.status === 'completed' ? (
                <p className="notice notice-success">{t('lesson.finish.completed')}</p>
              ) : missingRequired.length > 0 ? (
                <p>{t('lesson.finish.missing', { count: missingRequired.length })}</p>
              ) : (
                <p>{t('lesson.finish.ready')}</p>
              )}
              <p className="muted small">{t('lesson.finish.note')}</p>
              <div className="row">
                <button type="button" className="btn btn-primary" disabled={finishState === 'pending'} onClick={() => void finish()}>
                  {t('lesson.finish.action')}
                </button>
                <Link className="btn btn-secondary" to={paths.review()}>
                  {t('lesson.finish.practice')}
                </Link>
              </div>
              {finishState === 'done' && lesson.progress.status !== 'completed' ? (
                <p className="notice notice-info" role="status">
                  {t('lesson.finish.recorded')}
                </p>
              ) : null}
            </section>
          ) : null}
          <div className="step-pager">
            {index > 0 ? (
              <Link className="btn btn-secondary" to={paths.lesson(lesson.lessonId, lesson.steps[index - 1]?.id)}>
                ← {t('lesson.previousStep')}
              </Link>
            ) : lesson.previousLessonId ? (
              <Link className="btn btn-ghost" to={paths.lesson(lesson.previousLessonId)}>
                ← {t('lesson.previousLesson')}
              </Link>
            ) : (
              <span />
            )}
            {index >= 0 && index < lesson.steps.length - 1 ? (
              <Link className="btn btn-primary" to={paths.lesson(lesson.lessonId, lesson.steps[index + 1]?.id)}>
                {t('lesson.nextStep')} →
              </Link>
            ) : lesson.nextLessonId ? (
              <Link className="btn btn-secondary" to={paths.lesson(lesson.nextLessonId)}>
                {t('lesson.nextLesson')} →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function StepView({ step, onStartTask }: { readonly step: LessonStep; readonly onStartTask: (taskRevisionId: string) => void }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const runner = useCommandRunner();

  const practiceLink = async (block: Extract<Block, { type: 'practice-link' }>) => {
    const receipt = await runner.run(practiceCreateCommand(api.profileEpoch, block.targets, block.mode, block.maxItems));
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  return (
    <section aria-labelledby="step-title" data-testid="lesson-step" data-step-kind={step.kind}>
      <p className="muted small">
        {t(`lesson.kinds.${step.kind}`)}
        {step.required ? '' : ` · ${t('lesson.optionalStep')}`}
      </p>
      <h2 id="step-title">{step.titleUk}</h2>
      <Blocks blocks={step.blocks} onPracticeLink={(block) => void practiceLink(block)} />
      <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
      {step.audio.length > 0 ? (
        <div className="stack">
          <h3>{t('lesson.audio')}</h3>
          <p className="muted small">{t('lesson.audioNote')}</p>
          {step.audio.map((clip) => (
            <audio key={clip.hash} controls preload="none" src={api.mediaUrl(clip.hash)} aria-label={t('lesson.audioClip')} />
          ))}
        </div>
      ) : null}
      {step.tasks.length > 0 ? (
        <div className="stack">
          <div className="page-title-row">
            <h3>{t('lesson.tasks')}</h3>
            <HelpButton topic="lesson.tasks" />
          </div>
          <ul className="result-list">
            {step.tasks.map((task, position) => (
              <li key={task.taskRevisionId} className="result-item">
                <span className="result-title">{t('lesson.taskTitle', { number: position + 1 })}</span>
                <span className="result-meta">
                  {t(`lesson.roles.${task.role}`)} · {t(`lesson.inputs.${task.input}`)}
                  {task.audioHashes.length > 0 ? ` · ${t('lesson.withAudio')}` : ''}
                </span>
                <div className="row">
                  {task.state === 'ready' ? (
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => onStartTask(task.taskRevisionId)}>
                      {t('lesson.startTask')}
                    </button>
                  ) : (
                    <StateBadge state={task.state} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
