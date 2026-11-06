// Listening list (C-054/C-082): choose a short situation recording set; the task opens in the
// "Listening focus" exercise (player centred, transcript/translation on request, meaning first,
// dictation as a separate optional task). No microphone, no autoplay.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useResource } from '../app/hooks.ts';
import type { LessonView, ListeningView } from '../api/types.ts';
import { PageHeader } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { lessonSessionPayload, sessionFromReceipt, sessionStartCommand, taskRoute } from '../flows/session.ts';
import { Link, navigate } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

type ListeningItem = ListeningView['items'][number];

export function ListeningScreen() {
  const { t } = useTranslation();
  const { api } = useApp();
  const listening = useResource('listening', (signal) => api.get<ListeningView>('/views/listening', signal).then((envelope) => envelope.data));
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [empty, setEmpty] = useState<string | null>(null);

  const start = async (item: ListeningItem) => {
    setStarting(item.lessonId);
    setError(null);
    setEmpty(null);
    try {
      const lesson = (await api.get<LessonView>(`/views/lessons/${encodeURIComponent(item.lessonId)}`)).data;
      const receipt = await api.command(sessionStartCommand(api.profileEpoch, lessonSessionPayload(lesson, 'listening')));
      const session = await sessionFromReceipt(api, receipt);
      const first = item.taskRevisionIds.find((id) => session.taskRevisionIds.includes(id)) ?? session.taskRevisionIds[0];
      if (first) navigate(taskRoute(session, first));
      else setEmpty(item.lessonId);
    } catch (failure) {
      setError(failure);
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="page">
      <PageHeader title={t('listeningList.title')} lead={t('listeningList.lead')} help="listening.overview" />
      <p className="notice notice-info">{t('listeningList.noMic')}</p>
      <ActionError error={error} />
      {listening.state.status === 'loading' ? <LoadingState /> : null}
      {listening.state.status === 'error' ? <ErrorState error={listening.state.error} onRetry={listening.reload} /> : null}
      {listening.state.status === 'ready' ? (
        listening.state.data.items.length === 0 ? (
          <EmptyState
            title={t('listeningList.empty.title')}
            body={t('listeningList.empty.body')}
            action={
              <Link className="btn btn-secondary" to={paths.catalog()}>
                {t('listeningList.empty.action')}
              </Link>
            }
          />
        ) : (
          <ul className="result-list">
            {listening.state.data.items.map((item) => (
              <li key={item.lessonId} className="result-item" data-testid="listening-item">
                <span className="result-title">{item.titleUk}</span>
                <span className="result-meta">
                  {t(`listeningList.levels.${item.level}`)} · {t('listeningList.clips', { count: item.clipCount })}
                  {item.dueTargets > 0 ? ` · ${t('listeningList.due', { count: item.dueTargets })}` : ''}
                </span>
                <div className="row">
                  <button type="button" className="btn btn-secondary btn-small" disabled={starting !== null} onClick={() => void start(item)}>
                    {starting === item.lessonId ? t('listeningList.starting') : t('listeningList.start')}
                  </button>
                  <Link className="btn btn-ghost btn-small" to={paths.lesson(item.lessonId)}>
                    {t('listeningList.lesson')}
                  </Link>
                </div>
                {empty === item.lessonId ? <p className="notice notice-info">{t('listeningList.noTasks')}</p> : null}
              </li>
            ))}
          </ul>
        )
      ) : null}
      <HelpButton topic="listening.support" />
    </div>
  );
}
