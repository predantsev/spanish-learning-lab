// Practice hub (/review): recommended review with an explicit time budget, plus routes to
// listening, topic practice and phrases. /practice/:setId opens a created practice set and starts
// it only on an explicit learner action. A finished session shows its summary (?finished=<id>).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource } from '../app/hooks.ts';
import { targetTitle, useTitles } from '../app/titles.ts';
import type { HomeView, LearningSession, PracticeSet, Summary, Target } from '../api/types.ts';
import { PageHeader, TargetLabel, targetKey } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import {
  firstTaskRoute,
  practiceCreateCommand,
  practiceRouteFromReceipt,
  practiceSessionPayload,
  sessionFromReceipt,
  sessionStartCommand,
} from '../flows/session.ts';
import { Link, navigate, useSearchParams } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

const BUDGETS = [5, 10, 20] as const;

export function ReviewScreen() {
  const params = useSearchParams();
  const finished = params.get('finished');
  return finished ? <SessionSummaryScreen sessionId={finished} /> : <PracticeHub />;
}

function PracticeHub() {
  const { t } = useTranslation();
  const { api } = useApp();
  const home = useResource('home', (signal) => api.get<HomeView>('/views/home', signal).then((envelope) => envelope.data));
  const runner = useCommandRunner();
  const [minutes, setMinutes] = useState<(typeof BUDGETS)[number]>(10);
  const [empty, setEmpty] = useState(false);

  const start = async () => {
    setEmpty(false);
    const receipt = await runner.run(
      sessionStartCommand(api.profileEpoch, { source: 'recommended', targets: [], mode: 'review', minutes, maxItems: minutes }),
    );
    if (!receipt) return;
    const session = await sessionFromReceipt(api, receipt).catch(() => null);
    const route = session ? firstTaskRoute(session) : null;
    if (route) navigate(route);
    else setEmpty(true);
  };

  return (
    <div className="page">
      <PageHeader title={t('practice.title')} lead={t('practice.lead')} help="practice.hub" />
      <section className="card card-focus" aria-labelledby="practice-review-title">
        <div className="page-title-row">
          <h2 id="practice-review-title">{t('practice.review.title')}</h2>
          <HelpButton topic="home.review" />
        </div>
        {home.state.status === 'loading' ? <LoadingState /> : null}
        {home.state.status === 'error' ? <ErrorState error={home.state.error} onRetry={home.reload} /> : null}
        {home.state.status === 'ready' ? (
          home.state.data.review.dueTargets > 0 ? (
            <>
              <p>{t('home.review.reason', { count: home.state.data.review.dueTargets })}</p>
              <fieldset>
                <legend>{t('practice.review.budget')}</legend>
                <div className="segmented">
                  {BUDGETS.map((value) => (
                    <label key={value} className="choice">
                      <input type="radio" name="review-budget" checked={minutes === value} onChange={() => setMinutes(value)} />
                      {t('practice.review.minutes', { count: value })}
                    </label>
                  ))}
                </div>
                <p className="field-hint">{t('practice.review.budgetHint')}</p>
              </fieldset>
              <button type="button" className="btn btn-primary" disabled={runner.status === 'pending'} onClick={() => void start()}>
                {t('home.review.start')}
              </button>
              <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
              {empty ? <p className="notice notice-info">{t('home.review.empty')}</p> : null}
            </>
          ) : (
            <p>{t('practice.review.nothingDue')}</p>
          )
        ) : null}
      </section>
      <div className="card-grid">
        <section className="card">
          <h2>{t('practice.listening.title')}</h2>
          <p>{t('practice.listening.body')}</p>
          <Link className="btn btn-secondary" to={paths.listening()}>
            {t('practice.listening.action')}
          </Link>
        </section>
        <section className="card">
          <h2>{t('practice.topic.title')}</h2>
          <p>{t('practice.topic.body')}</p>
          <Link className="btn btn-secondary" to={paths.catalog()}>
            {t('practice.topic.action')}
          </Link>
        </section>
        <section className="card">
          <h2>{t('practice.phrases.title')}</h2>
          <p>{t('practice.phrases.body')}</p>
          <Link className="btn btn-secondary" to={paths.phrases()}>
            {t('practice.phrases.action')}
          </Link>
        </section>
      </div>
    </div>
  );
}

export function PracticeSetScreen({ setId }: { readonly setId: string }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const set = useResource(`practice-set:${setId}`, (signal) => api.resource<PracticeSet>('practice-set', setId, signal));
  const runner = useCommandRunner();
  const [empty, setEmpty] = useState(false);

  const start = async (practice: PracticeSet) => {
    setEmpty(false);
    const receipt = await runner.run(sessionStartCommand(api.profileEpoch, practiceSessionPayload(practice)));
    if (!receipt) return;
    const session = await sessionFromReceipt(api, receipt).catch(() => null);
    const route = session ? firstTaskRoute(session) : null;
    if (route) navigate(route);
    else setEmpty(true);
  };

  return (
    <div className="page">
      <PageHeader title={t('practice.set.title')} help="practice.set" />
      {set.state.status === 'loading' ? <LoadingState /> : null}
      {set.state.status === 'error' ? <ErrorState error={set.state.error} onRetry={set.reload} /> : null}
      {set.state.status === 'ready' ? (
        <section className="card">
          <p>
            {t('practice.set.mode')}: <strong>{t(`modes.${set.state.data.mode}`)}</strong> ·{' '}
            {t('practice.set.items', { count: set.state.data.taskRevisionIds.length })}
          </p>
          <h2>{t('practice.set.targets')}</h2>
          <TargetList targets={set.state.data.targets} />
          <p className="muted">{t('practice.set.scopeNote')}</p>
          {set.state.data.taskRevisionIds.length === 0 ? (
            <p className="notice notice-info">{t('practice.set.noTasks')}</p>
          ) : (
            <button type="button" className="btn btn-primary" disabled={runner.status === 'pending'} onClick={() => void start(set.state.data as PracticeSet)}>
              {t('practice.set.start')}
            </button>
          )}
          <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
          {empty ? <p className="notice notice-info">{t('practice.set.noTasks')}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function TargetList({ targets }: { readonly targets: readonly Target[] }) {
  const titles = useTitles();
  return (
    <ul>
      {targets.map((target) => (
        <li key={targetKey(target)}>
          <TargetLabel target={target} title={targetTitle(titles, target)} />
        </li>
      ))}
    </ul>
  );
}

function SessionSummaryScreen({ sessionId }: { readonly sessionId: string }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const data = useResource(`summary:${sessionId}`, async (signal) => {
    const session = await api.resource<LearningSession>('session', sessionId, signal);
    const summary = session.summaryId ? await api.resource<Summary>('summary', session.summaryId, signal) : null;
    return { session, summary };
  });
  const runner = useCommandRunner();

  const practiceRecommended = async (targets: readonly Target[]) => {
    const receipt = await runner.run(practiceCreateCommand(api.profileEpoch, targets, 'written', Math.min(10, targets.length * 2)));
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  return (
    <div className="page">
      <PageHeader title={t('summary.title')} help="summary" />
      {data.state.status === 'loading' ? <LoadingState /> : null}
      {data.state.status === 'error' ? <ErrorState error={data.state.error} onRetry={data.reload} /> : null}
      {data.state.status === 'ready' ? (
        data.state.data.summary ? (
          <section className="card" data-testid="session-summary">
            <dl className="definition-list">
              <dt>{t('summary.independent')}</dt>
              <dd>{data.state.data.summary.independentTargets}</dd>
              <dt>{t('summary.supported')}</dt>
              <dd>{data.state.data.summary.supportedTargets}</dd>
              <dt>{t('summary.unresolved')}</dt>
              <dd>{data.state.data.summary.unresolvedTargets}</dd>
              <dt>{t('summary.visitedLessons')}</dt>
              <dd>{data.state.data.summary.visitedLessons}</dd>
              <dt>{t('summary.completedLessons')}</dt>
              <dd>{data.state.data.summary.completedLessons}</dd>
            </dl>
            <p className="muted">{t('summary.note')}</p>
            {data.state.data.summary.recommendedTargetIds.length > 0 ? (
              <>
                <h2>{t('summary.next')}</h2>
                <TargetList targets={data.state.data.summary.recommendedTargetIds} />
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={runner.status === 'pending'}
                  onClick={() => void practiceRecommended(data.state.data?.summary?.recommendedTargetIds ?? [])}
                >
                  {t('summary.practiceNext')}
                </button>
                <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
              </>
            ) : null}
            <div className="row">
              <Link className="btn btn-primary" to={paths.home()}>
                {t('summary.home')}
              </Link>
            </div>
          </section>
        ) : (
          <EmptyState title={t('summary.pendingTitle')} body={t('summary.pendingBody')} action={<Link to={paths.home()}>{t('summary.home')}</Link>} />
        )
      ) : null}
    </div>
  );
}
