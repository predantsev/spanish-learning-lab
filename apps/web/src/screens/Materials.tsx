// Materials — "Materials in topic" (C-083): explanations, tables, examples and practice links of
// the current topic rendered only by typed block components (never innerHTML). Drafts are labelled
// and cannot act as answer keys; the active reviewed revision stays the default while a change is a
// draft. A newly added material is never opened automatically. Returning to the exercise keeps the
// current answer (it is saved before leaving).
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource, useWideLayout } from '../app/hooks.ts';
import type { Block, MaterialsView } from '../api/types.ts';
import { Blocks } from '../components/Blocks.tsx';
import { DetailTitle, PageHeader, StateBadge, useDocumentTitle } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { practiceCreateCommand, practiceRouteFromReceipt } from '../flows/session.ts';
import { foldForSearch } from '../lib/catalogSearch.ts';
import { goBack, Link, navigate, useLocation, useSearchParams } from '../router/history.tsx';
import { safeAppRoute, withQuery } from '../router/routes.ts';

type Material = MaterialsView['materials'][number];
type StatusFilter = 'ready' | 'pending' | 'all';

/** Material ids already listed in this tab (anything else is shown as "new", never auto-opened). */
const seenMaterials = new Map<string, Set<string>>();

export function isReadyMaterial(material: Material): boolean {
  return material.state === 'ready';
}

export function MaterialsScreen({ topicId }: { readonly topicId: string }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const wide = useWideLayout();
  const location = useLocation();
  const params = useSearchParams();
  const selectedId = params.get('material');
  const from = safeAppRoute(params.get('from') ?? undefined);
  const [status, setStatus] = useState<StatusFilter>('ready');
  const [query, setQuery] = useState('');
  const materials = useResource(`materials:${topicId}`, (signal) =>
    api.get<MaterialsView>(`/views/materials/${encodeURIComponent(topicId)}`, signal).then((envelope) => envelope.data),
  );

  const view = materials.state.status === 'ready' ? materials.state.data : null;
  const seen = useMemo(() => {
    const known = seenMaterials.get(topicId) ?? new Set<string>();
    const isNew = new Set<string>();
    if (view) {
      const firstLoad = !seenMaterials.has(topicId);
      for (const material of view.materials) {
        if (!firstLoad && !known.has(material.revisionId)) isNew.add(material.revisionId);
        known.add(material.revisionId);
      }
      seenMaterials.set(topicId, known);
    }
    return isNew;
  }, [view, topicId]);

  const filtered = useMemo(() => {
    if (!view) return [];
    const needle = foldForSearch(query);
    return view.materials.filter((material) => {
      if (status === 'ready' && !isReadyMaterial(material)) return false;
      if (status === 'pending' && isReadyMaterial(material)) return false;
      return needle === '' || foldForSearch(material.titleUk).includes(needle);
    });
  }, [view, query, status]);

  const selected = view && selectedId ? view.materials.filter((material) => material.materialId === selectedId) : [];
  const select = (materialId: string) =>
    navigate(withQuery(location.pathname, { material: materialId, from: params.get('from') ?? undefined }), { keepScroll: true });

  return (
    <div className="page">
      {from ? (
        <Link className="btn btn-ghost back-link" to={from}>
          ← {t('materials.backToExercise')}
        </Link>
      ) : null}
      {!wide && selectedId ? null : (
        <PageHeader title={view ? view.titleUk : t('materials.title')} lead={t('materials.lead')} help="materials.overview" />
      )}
      {materials.state.status === 'loading' ? <LoadingState /> : null}
      {materials.state.status === 'error' ? <ErrorState error={materials.state.error} onRetry={materials.reload} /> : null}
      {view ? (
        <div className={`split ${selectedId ? 'has-detail' : ''}`}>
          <div className="split-list">
            <div className="tabs" role="group" aria-label={t('materials.filterLabel')}>
              {(['ready', 'pending', 'all'] as const).map((value) => (
                <button key={value} type="button" className="btn btn-secondary tab" aria-pressed={status === value} onClick={() => setStatus(value)}>
                  {t(`materials.filters.${value}`)}
                </button>
              ))}
              <HelpButton topic="materials.status" />
            </div>
            <div className="field">
              <label htmlFor="materials-search">{t('materials.search')}</label>
              <input id="materials-search" type="search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="row">
              <button type="button" className="btn btn-ghost btn-small" onClick={materials.reload}>
                {t('materials.refresh')}
              </button>
              <span className="muted small">{t('materials.refreshNote')}</span>
            </div>
            {filtered.length === 0 ? (
              <EmptyState
                title={view.materials.length === 0 ? t('materials.empty.title') : t('materials.noResults.title')}
                body={view.materials.length === 0 ? t('materials.empty.body') : t('materials.noResults.body')}
                action={
                  query || status !== 'all' ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setQuery('');
                        setStatus('all');
                      }}
                    >
                      {t('materials.noResults.showAll')}
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="result-list">
                {filtered.map((material) => (
                  <li key={material.revisionId}>
                    <a
                      href={withQuery(location.pathname, { material: material.materialId, from: params.get('from') ?? undefined })}
                      className="result-item"
                      aria-current={material.materialId === selectedId ? 'true' : undefined}
                      onClick={(event) => {
                        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        select(material.materialId);
                      }}
                      data-testid="material-item"
                    >
                      <span className="result-title">{material.titleUk}</span>
                      <span className="result-meta row">
                        <StateBadge state={material.state} />
                        <span>{t(`materials.origin.${material.origin}`)}</span>
                        {seen.has(material.revisionId) ? <span className="badge badge-neutral">{t('materials.new')}</span> : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="split-detail">
            {selectedId ? (
              selected.length > 0 ? (
                <MaterialReader revisions={selected} onBack={() => goBack(withQuery(location.pathname, { from: params.get('from') ?? undefined }))} />
              ) : (
                <section className="card">
                  <EmptyState title={t('materials.notFound')} />
                </section>
              )
            ) : (
              <section className="card">
                <p className="muted">{t('materials.pick')}</p>
              </section>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MaterialReader({ revisions, onBack }: { readonly revisions: readonly Material[]; readonly onBack: () => void }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const wide = useWideLayout();
  const runner = useCommandRunner();
  const active = revisions.find(isReadyMaterial);
  const drafts = revisions.filter((material) => !isReadyMaterial(material));
  const [showDraftId, setShowDraftId] = useState<string | null>(active ? null : (drafts[0]?.revisionId ?? null));
  const shown = (showDraftId ? revisions.find((material) => material.revisionId === showDraftId) : active) ?? revisions[0];
  useDocumentTitle(!wide && shown ? shown.titleUk : null);
  if (!shown) return null;
  const ready = isReadyMaterial(shown);

  const practice = async (block: Extract<Block, { type: 'practice-link' }>) => {
    const receipt = await runner.run(practiceCreateCommand(api.profileEpoch, block.targets, block.mode, block.maxItems));
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  return (
    <article className="card" aria-labelledby="material-title" data-testid="material-reader">
      {!wide ? (
        <button type="button" className="btn btn-ghost back-link" onClick={onBack}>
          ← {t('materials.backToList')}
        </button>
      ) : null}
      <div className="page-title-row">
        <DetailTitle id="material-title" wide={wide}>{shown.titleUk}</DetailTitle>
        <StateBadge state={shown.state} />
      </div>
      <p className="muted small">
        {t(`materials.origin.${shown.origin}`)} · {t('materials.revision', { revision: shown.revision })}
      </p>
      {!ready ? <p className="notice notice-warning">{t('materials.draftNote')}</p> : null}
      {active && drafts.length > 0 ? (
        <div className="row">
          {showDraftId ? (
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowDraftId(null)}>
              {t('materials.showActive')}
            </button>
          ) : (
            drafts.map((draft) => (
              <button key={draft.revisionId} type="button" className="btn btn-ghost btn-small" onClick={() => setShowDraftId(draft.revisionId)}>
                {t('materials.showDraft', { revision: draft.revision })}
              </button>
            ))
          )}
          <HelpButton topic="materials.revisions" />
        </div>
      ) : null}
      <Blocks
        blocks={shown.blocks}
        onPracticeLink={(block) => void practice(block)}
        practiceLinkState={ready ? { enabled: true } : { enabled: false, reasonKey: 'blocks.practiceLinkDisabled' }}
      />
      <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
    </article>
  );
}
