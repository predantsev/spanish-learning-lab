// Home — "One focus" (C-049/C-079): one prominent next step (recommended review when due; else the
// saved activity; else the course), separate Resume and Choose topic, concise separate evidence
// counts (never a mastery percentage), no streaks, notifications or quotas.
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource } from '../app/hooks.ts';
import { Es, PageHeader } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, ErrorState, LoadingState } from '../components/States.tsx';
import type { HomeView } from '../api/types.ts';
import { firstTaskRoute, sessionFromReceipt, sessionStartCommand } from '../flows/session.ts';
import { formatDateTime } from '../lib/format.ts';
import { Link, navigate } from '../router/history.tsx';
import { paths } from '../router/routes.ts';
import { useState } from 'react';

type Focus = 'first-use' | 'review' | 'resume' | 'continue' | 'choose';

export function focusOf(view: HomeView): Focus {
  if (view.firstUse) return 'first-use';
  if (view.review.dueTargets > 0) return 'review';
  if (view.resume) return 'resume';
  if (view.nextLesson) return 'continue';
  return 'choose';
}

export function HomeScreen() {
  const { t } = useTranslation();
  const { api } = useApp();
  const home = useResource('home', (signal) => api.get<HomeView>('/views/home', signal).then((envelope) => envelope.data));

  return (
    <div className="page">
      <PageHeader title={t('home.title')} />
      {home.state.status === 'loading' ? <LoadingState /> : null}
      {home.state.status === 'error' ? <ErrorState error={home.state.error} onRetry={home.reload} /> : null}
      {home.state.status === 'ready' ? <HomeContent view={home.state.data} /> : null}
    </div>
  );
}

export function HomeContent({ view }: { readonly view: HomeView }) {
  const { t } = useTranslation();
  const { api, locale } = useApp();
  const runner = useCommandRunner();
  const [emptySession, setEmptySession] = useState(false);
  const focus = focusOf(view);

  const startReview = async () => {
    setEmptySession(false);
    const receipt = await runner.run(
      sessionStartCommand(api.profileEpoch, { source: 'recommended', targets: [], mode: 'review', minutes: 10, maxItems: 10 }),
    );
    if (!receipt) return;
    try {
      const session = await sessionFromReceipt(api, receipt);
      const route = firstTaskRoute(session);
      if (route) navigate(route);
      else setEmptySession(true);
    } catch {
      setEmptySession(true);
    }
  };

  const resumeRoute = view.resume ? paths.exercise(view.resume.taskRevisionId, { context: view.resume.contextId }) : null;

  return (
    <>
      {view.pack.state !== 'ready' ? (
        <p className={`notice ${view.pack.state === 'missing' ? 'notice-error' : 'notice-warning'}`} role="status">
          {t(`home.pack.${view.pack.state}`, { version: view.pack.version })}
        </p>
      ) : null}

      <section className="card card-focus focus-panel" aria-labelledby="home-focus-title" data-testid="home-focus" data-focus={focus}>
        {focus === 'first-use' ? (
          <>
            <div className="page-title-row">
              <h2 id="home-focus-title">{t('home.firstUse.title')}</h2>
              <HelpButton topic="home.start" />
            </div>
            <p>{t('home.firstUse.body')}</p>
            <div className="row">
              <Link className="btn btn-primary" to={view.nextLesson ? paths.lesson(view.nextLesson.lessonId) : paths.catalog()}>
                {t('home.firstUse.start')}
              </Link>
              <Link className="btn btn-secondary" to={paths.catalog()}>
                {t('home.chooseTopic.action')}
              </Link>
            </div>
          </>
        ) : null}

        {focus === 'review' ? (
          <>
            <div className="page-title-row">
              <h2 id="home-focus-title">{t('home.review.title')}</h2>
              <HelpButton topic="home.review" />
            </div>
            <p>{t('home.review.reason', { count: view.review.dueTargets })}</p>
            {view.review.supportPending > 0 ? <p>{t('home.review.supportPending', { count: view.review.supportPending })}</p> : null}
            {view.review.estimatedMinutes > 0 ? (
              <p className="muted">{t('home.review.estimate', { count: view.review.estimatedMinutes })}</p>
            ) : null}
            <div className="row">
              <button type="button" className="btn btn-primary" onClick={() => void startReview()} disabled={runner.status === 'pending'}>
                {runner.status === 'pending' ? t('home.review.starting') : t('home.review.start')}
              </button>
              <Link className="btn btn-secondary" to={paths.review()}>
                {t('home.review.customize')}
              </Link>
            </div>
            <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
            {emptySession ? <p className="notice notice-info">{t('home.review.empty')}</p> : null}
          </>
        ) : null}

        {focus === 'resume' && view.resume && resumeRoute ? (
          <>
            <div className="page-title-row">
              <h2 id="home-focus-title">{t('home.resume.title')}</h2>
              <HelpButton topic="home.resume" />
            </div>
            <p>{t('home.noReviewNow')}</p>
            <p>
              <strong>{view.resume.titleUk}</strong>
              <br />
              <span className="muted">{t('home.resume.savedAt', { date: formatDateTime(view.resume.lastActivityAt, locale) })}</span>
            </p>
            <Link className="btn btn-primary" to={resumeRoute}>
              {t('home.resume.action')}
            </Link>
          </>
        ) : null}

        {focus === 'continue' && view.nextLesson ? (
          <>
            <div className="page-title-row">
              <h2 id="home-focus-title">{t('home.continue.title')}</h2>
              <HelpButton topic="home.continue" />
            </div>
            <p>{t('home.noReviewNow')}</p>
            <p>
              <strong>{view.nextLesson.titleUk}</strong>
            </p>
            <Link className="btn btn-primary" to={paths.lesson(view.nextLesson.lessonId)}>
              {t('home.continue.action')}
            </Link>
          </>
        ) : null}

        {focus === 'choose' ? (
          <>
            <h2 id="home-focus-title">{t('home.choose.title')}</h2>
            <p>{t('home.choose.body')}</p>
            <Link className="btn btn-primary" to={paths.catalog()}>
              {t('home.chooseTopic.action')}
            </Link>
          </>
        ) : null}
      </section>

      <div className="card-grid">
        {view.resume && resumeRoute && focus !== 'resume' ? (
          <section className="card" aria-labelledby="home-resume-title" data-testid="home-resume">
            <div className="page-title-row">
              <h2 id="home-resume-title">{t('home.resume.cardTitle')}</h2>
              <HelpButton topic="home.resume" />
            </div>
            <p>
              <strong>{view.resume.titleUk}</strong>
              <br />
              <span className="muted">{t('home.resume.savedAt', { date: formatDateTime(view.resume.lastActivityAt, locale) })}</span>
            </p>
            <Link className="btn btn-secondary" to={resumeRoute}>
              {t('home.resume.action')}
            </Link>
          </section>
        ) : null}
        <section className="card" aria-labelledby="home-choose-title" data-testid="home-choose">
          <div className="page-title-row">
            <h2 id="home-choose-title">{t('home.chooseTopic.title')}</h2>
            <HelpButton topic="home.chooseTopic" />
          </div>
          <p>{t('home.chooseTopic.body')}</p>
          <Link className="btn btn-secondary" to={paths.catalog()}>
            {t('home.chooseTopic.action')}
          </Link>
        </section>
      </div>

      {view.firstUse ? null : (
        <section className="card" aria-labelledby="home-evidence-title" data-testid="home-evidence">
          <div className="page-title-row">
            <h2 id="home-evidence-title">{t('home.evidence.title')}</h2>
            <HelpButton topic="home.evidence" />
          </div>
          <ul className="evidence-list">
            {(['introduced', 'independent', 'supported', 'uncertain', 'listening', 'stable'] as const).map((kind) => (
              <li key={kind} className="evidence-item">
                <span className="evidence-count">{view.evidence[kind]}</span>
                <span>{t(`home.evidence.${kind}`)}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">{t('home.evidence.note')}</p>
          <Link to={paths.progress()}>{t('home.evidence.details')}</Link>
        </section>
      )}
      <p className="muted small">
        {t('home.spainNote')} <Es>{t('home.spainVariety')}</Es>
      </p>
    </>
  );
}
