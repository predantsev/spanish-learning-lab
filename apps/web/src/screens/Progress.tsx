// Progress (C-045): lessons visited/completed are shown separately from evidence of recall —
// independent, supported, uncertain and listening — with the specific reason and date per target.
// No mastery percentage, streaks or quotas. Repeat more / Known / Pause use preference.set and
// explain their exact scheduling effect.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource } from '../app/hooks.ts';
import { makeCommand } from '../api/commands.ts';
import type { ProgressView, Target } from '../api/types.ts';
import { PageHeader, TargetLabel, targetKey } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { practiceCreateCommand, practiceRouteFromReceipt } from '../flows/session.ts';
import { foldForSearch } from '../lib/catalogSearch.ts';
import { formatCalendarDate } from '../lib/format.ts';
import { newId } from '../lib/ids.ts';
import { Link, navigate } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

type TargetRow = ProgressView['targets'][number];
type Group = 'stable' | 'independent' | 'supported' | 'uncertain' | 'introduced' | 'listening';

const GROUP_ORDER: readonly Group[] = ['supported', 'uncertain', 'independent', 'stable', 'introduced', 'listening'];

export function isListeningTarget(target: Target): boolean {
  return target.modality === 'listening-meaning' || target.modality === 'dictation';
}

export function groupOf(row: TargetRow): Group {
  return isListeningTarget(row.target) ? 'listening' : row.label;
}

const STATUS_ICON = { 'not-started': '○', visited: '◐', completed: '●' } as const;

export function ProgressScreen() {
  const { t } = useTranslation();
  const { api } = useApp();
  const progress = useResource('progress', (signal) => api.get<ProgressView>('/views/progress', signal).then((envelope) => envelope.data));
  return (
    <div className="page">
      <PageHeader title={t('progress.title')} lead={t('progress.lead')} help="progress.overview" />
      {progress.state.status === 'loading' ? <LoadingState /> : null}
      {progress.state.status === 'error' ? <ErrorState error={progress.state.error} onRetry={progress.reload} /> : null}
      {progress.state.status === 'ready' ? <ProgressContent view={progress.state.data} reload={progress.reload} /> : null}
    </div>
  );
}

export function ProgressContent({ view, reload }: { readonly view: ProgressView; readonly reload: () => void }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const practiceRunner = useCommandRunner();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group | 'all'>('all');
  const needle = foldForSearch(query);
  const rows = useMemo(
    () =>
      view.targets.filter(
        (row) => (group === 'all' || groupOf(row) === group) && (!needle || foldForSearch(`${row.titleUk} ${row.target.skillId}`).includes(needle)),
      ),
    [view.targets, group, needle],
  );
  const counts = useMemo(() => {
    const result = new Map<Group, number>();
    for (const row of view.targets) result.set(groupOf(row), (result.get(groupOf(row)) ?? 0) + 1);
    return result;
  }, [view.targets]);

  const practiceRecommended = async () => {
    const receipt = await practiceRunner.run(
      practiceCreateCommand(api.profileEpoch, view.summary.recommendedTargetIds, 'written', Math.min(10, view.summary.recommendedTargetIds.length * 2)),
    );
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  return (
    <>
      <section className="card" aria-labelledby="progress-coverage">
        <div className="page-title-row">
          <h2 id="progress-coverage">{t('progress.coverage.title')}</h2>
          <HelpButton topic="progress.coverage" />
        </div>
        <p className="muted small">{t('progress.coverage.note')}</p>
        {view.blocks.length === 0 ? <p className="muted">{t('progress.coverage.empty')}</p> : null}
        {view.blocks.map((block) => {
          const completed = block.lessons.filter((lesson) => lesson.status === 'completed').length;
          const visited = block.lessons.filter((lesson) => lesson.status === 'visited').length;
          return (
            <details key={block.blockId}>
              <summary>
                <strong>{block.titleUk}</strong>{' '}
                <span className="muted small">{t('progress.coverage.counts', { completed, visited, total: block.lessons.length })}</span>
              </summary>
              <ul className="plain-list">
                {block.lessons.map((lesson) => (
                  <li key={lesson.lessonId}>
                    <Link to={paths.lesson(lesson.lessonId)}>{lesson.titleUk}</Link>{' '}
                    <span className="small">
                      <span aria-hidden="true">{STATUS_ICON[lesson.status]}</span> {t(`lesson.status.${lesson.status}`)}
                      {lesson.kind === 'optional-check' ? ` · ${t('lesson.optionalCheck')}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </section>

      <section className="card" aria-labelledby="progress-evidence">
        <div className="page-title-row">
          <h2 id="progress-evidence">{t('progress.evidence.title')}</h2>
          <HelpButton topic="progress.evidence" />
        </div>
        <p className="muted small">{t('progress.evidence.note')}</p>
        <div className="tabs" role="group" aria-label={t('progress.evidence.filterLabel')}>
          <button type="button" className="btn btn-secondary tab btn-small" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>
            {t('progress.groups.all', { count: view.targets.length })}
          </button>
          {GROUP_ORDER.map((value) => (
            <button key={value} type="button" className="btn btn-secondary tab btn-small" aria-pressed={group === value} onClick={() => setGroup(value)}>
              {t(`progress.groups.${value}`, { count: counts.get(value) ?? 0 })}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="progress-search">{t('progress.evidence.search')}</label>
          <input id="progress-search" type="search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} />
        </div>
        {rows.length === 0 ? (
          <EmptyState title={view.targets.length === 0 ? t('progress.evidence.empty') : t('progress.evidence.noResults')} />
        ) : (
          <ul className="plain-list">
            {rows.map((row) => (
              <TargetEvidence key={targetKey(row.target)} row={row} onChanged={reload} />
            ))}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="progress-summary">
        <div className="page-title-row">
          <h2 id="progress-summary">{t('progress.summary.title')}</h2>
          <HelpButton topic="summary" />
        </div>
        <dl className="definition-list">
          <dt>{t('summary.independent')}</dt>
          <dd>{view.summary.independentTargets}</dd>
          <dt>{t('summary.supported')}</dt>
          <dd>{view.summary.supportedTargets}</dd>
          <dt>{t('summary.unresolved')}</dt>
          <dd>{view.summary.unresolvedTargets}</dd>
          <dt>{t('summary.visitedLessons')}</dt>
          <dd>{view.summary.visitedLessons}</dd>
          <dt>{t('summary.completedLessons')}</dt>
          <dd>{view.summary.completedLessons}</dd>
        </dl>
        {view.summary.recommendedTargetIds.length > 0 ? (
          <>
            <h3>{t('summary.next')}</h3>
            <ul>
              {view.summary.recommendedTargetIds.map((target) => (
                <li key={targetKey(target)}>
                  <TargetLabel target={target} title={view.targets.find((row) => targetKey(row.target) === targetKey(target))?.titleUk} />
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-secondary" disabled={practiceRunner.status === 'pending'} onClick={() => void practiceRecommended()}>
              {t('summary.practiceNext')}
            </button>
            <ActionError
              error={practiceRunner.status === 'failed' ? practiceRunner.error : null}
              onRetry={practiceRunner.canRetry ? () => void practiceRunner.retry() : undefined}
            />
          </>
        ) : null}
      </section>
    </>
  );
}

function TargetEvidence({ row, onChanged }: { readonly row: TargetRow; readonly onChanged: () => void }) {
  const { t, i18n } = useTranslation();
  const { api, locale } = useApp();
  const runner = useCommandRunner();
  const [message, setMessage] = useState<string | null>(null);
  const reasonKey = i18n.exists(`progress.reasons.${row.reasonKey}`) ? `progress.reasons.${row.reasonKey}` : `progress.labels.${row.label}Reason`;

  const setPreference = async (change: { frequency?: 'usual' | 'repeat-more' | 'known'; paused?: boolean }, messageKey: string) => {
    setMessage(null);
    // preference.set appends a new preference record each time (API.md v1 clarification):
    // a new subjectId with expectedRevision 0.
    const receipt = await runner.run(
      makeCommand('preference.set', api.profileEpoch, {
        subjectId: newId(),
        expectedRevision: 0,
        payload: { targets: [row.target], ...change },
      }),
    );
    if (receipt) {
      setMessage(t(messageKey));
      onChanged();
    }
  };

  return (
    <li className="target-row" data-testid="progress-target" data-label={row.label}>
      <div className="row">
        <TargetLabel target={row.target} title={row.titleUk} />
        <span className="badge badge-neutral">{t(`progress.labels.${row.label}`)}</span>
        {row.paused ? <span className="badge badge-draft">{t('progress.paused')}</span> : null}
        {row.frequency !== 'usual' ? <span className="badge badge-neutral">{t(`progress.frequency.${row.frequency}`)}</span> : null}
      </div>
      <p className="small">
        {t(reasonKey)}
        {row.lastEvidenceDate ? ` · ${t('progress.lastEvidence', { date: formatCalendarDate(row.lastEvidenceDate, locale) })}` : ''}
      </p>
      <p className="small muted">
        {row.paused ? t('progress.pausedNote') : row.dueDate ? t('progress.due', { date: formatCalendarDate(row.dueDate, locale) }) : t('progress.notScheduled')}
      </p>
      <div className="row">
        {row.frequency === 'repeat-more' ? (
          <button type="button" className="btn btn-secondary btn-small" disabled={runner.status === 'pending'} onClick={() => void setPreference({ frequency: 'usual' }, 'progress.saved.usual')}>
            {t('progress.actions.usual')}
          </button>
        ) : (
          <button type="button" className="btn btn-secondary btn-small" disabled={runner.status === 'pending'} onClick={() => void setPreference({ frequency: 'repeat-more' }, 'progress.saved.repeatMore')}>
            {t('progress.actions.repeatMore')}
          </button>
        )}
        {row.frequency === 'known' ? (
          <button type="button" className="btn btn-secondary btn-small" disabled={runner.status === 'pending'} onClick={() => void setPreference({ frequency: 'usual' }, 'progress.saved.usual')}>
            {t('progress.actions.notKnown')}
          </button>
        ) : (
          <button type="button" className="btn btn-secondary btn-small" disabled={runner.status === 'pending'} onClick={() => void setPreference({ frequency: 'known' }, 'progress.saved.known')}>
            {t('progress.actions.known')}
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-small"
          disabled={runner.status === 'pending'}
          onClick={() => void setPreference({ paused: !row.paused }, row.paused ? 'progress.saved.resumed' : 'progress.saved.paused')}
        >
          {row.paused ? t('progress.actions.resume') : t('progress.actions.pause')}
        </button>
        <HelpButton topic="progress.controls" />
      </div>
      {message ? (
        <p className="small notice notice-success" role="status">
          {message}
        </p>
      ) : null}
      <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
    </li>
  );
}
