// Catalog — "List and details" (C-050/C-080): topics and everyday situations lead to the same
// lesson IDs/history; accent-aware search over names, Spanish terms and skill-id aliases
// (e.g. "hecho"); filters block/situation/mode; detail with Rule, Learn and Practice of exactly the
// selected targets and mode — the scope is never silently widened. Phones open details separately;
// Back keeps the search, filters and selections (kept in an in-memory store).
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource, useWideLayout } from '../app/hooks.ts';
import { ApiRequestError } from '../api/errors.ts';
import type { CatalogEntry, CatalogPage, Target } from '../api/types.ts';
import { useTitles, type Titles } from '../app/titles.ts';
import { Es, PageHeader, StateBadge, TargetLabel, targetKey } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { practiceCreateCommand, practiceRouteFromReceipt } from '../flows/session.ts';
import { searchCatalog } from '../lib/catalogSearch.ts';
import { createStore, useStore } from '../lib/store.ts';
import { goBack, Link, navigate } from '../router/history.tsx';
import { paths, withQuery } from '../router/routes.ts';

type PracticeMode = 'written' | 'listening' | 'mixed';

interface CatalogUiState {
  readonly query: string;
  readonly tab: 'topics' | 'situations';
  readonly block: string;
  readonly situation: string;
  readonly mode: '' | PracticeMode;
  /** lessonId -> selected target keys (absent = all targets of that entry). */
  readonly selections: Readonly<Record<string, readonly string[]>>;
  readonly practiceModes: Readonly<Record<string, PracticeMode>>;
}

export const catalogStore = createStore<CatalogUiState>({
  query: '',
  tab: 'topics',
  block: '',
  situation: '',
  mode: '',
  selections: {},
  practiceModes: {},
});

export function isOptionalCheck(id: string): boolean {
  return /-C\d+$/.test(id);
}

async function loadCatalog(api: ReturnType<typeof useApp>['api'], mode: string, signal: AbortSignal): Promise<CatalogEntry[]> {
  const items: CatalogEntry[] = [];
  let cursor = '';
  for (let page = 0; page < 20; page += 1) {
    const params: Record<string, string> = { limit: '100' };
    if (mode) params['mode'] = mode;
    if (cursor) params['cursor'] = cursor;
    const envelope = await api.get<CatalogPage>(withQuery('/catalog', params), signal);
    items.push(...envelope.data.items);
    if (!envelope.data.nextCursor) break;
    cursor = envelope.data.nextCursor;
  }
  return items;
}

export function CatalogScreen({ lessonId }: { readonly lessonId?: string }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const ui = useStore(catalogStore);
  const wide = useWideLayout();
  const catalog = useResource(`catalog:${ui.mode}`, (signal) => loadCatalog(api, ui.mode, signal));
  const titles = useTitles();
  const entries = catalog.state.status === 'ready' ? catalog.state.data : [];
  const selected = lessonId ? entries.find((entry) => entry.id === lessonId) : undefined;

  return (
    <div className="page">
      {!wide && lessonId ? null : <PageHeader title={t('catalog.title')} lead={t('catalog.lead')} help="catalog.overview" />}
      {catalog.state.status === 'loading' ? <LoadingState /> : null}
      {catalog.state.status === 'error' ? <ErrorState error={catalog.state.error} onRetry={catalog.reload} /> : null}
      {catalog.state.status === 'ready' ? (
        <div className={`split ${lessonId ? 'has-detail' : ''}`}>
          <div className="split-list">
            <CatalogList entries={entries} selectedId={lessonId} titles={titles} />
          </div>
          <div className="split-detail">
            {lessonId ? (
              selected ? (
                <CatalogDetail entry={selected} titles={titles} />
              ) : (
                <section className="card">
                  {!wide ? <BackToList /> : null}
                  <EmptyState
                    title={t('catalog.detail.notInList')}
                    body={t('catalog.detail.notInListBody')}
                    action={
                      <Link className="btn btn-secondary" to={paths.lesson(lessonId)}>
                        {t('catalog.detail.openLesson')}
                      </Link>
                    }
                  />
                </section>
              )
            ) : (
              <section className="card">
                <p className="muted">{t('catalog.detail.pick')}</p>
              </section>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BackToList() {
  const { t } = useTranslation();
  return (
    <button type="button" className="btn btn-ghost back-link" onClick={() => goBack(paths.catalog())}>
      ← {t('catalog.backToList')}
    </button>
  );
}

function situationLabel(id: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  // TODO(contract): CatalogEntry carries situation ids only; titles (content SituationFile.titleUk)
  // are not exposed by any view. Until they are, show the stable id.
  return t(`situations.${id}`, { defaultValue: id });
}

export function CatalogList({ entries, selectedId, titles }: { readonly entries: readonly CatalogEntry[]; readonly selectedId?: string; readonly titles: Titles }) {
  const { t } = useTranslation();
  const ui = useStore(catalogStore);
  const searchId = useId();
  const hintId = useId();
  const blocks = useMemo(() => [...new Set(entries.map((entry) => entry.blockId))], [entries]);
  const situations = useMemo(() => [...new Set(entries.flatMap((entry) => entry.situationIds))], [entries]);

  const filtered = useMemo(() => {
    let list = searchCatalog(entries, ui.query);
    if (ui.block) list = list.filter((entry) => entry.blockId === ui.block);
    if (ui.situation) list = list.filter((entry) => entry.situationIds.includes(ui.situation));
    return list;
  }, [entries, ui.query, ui.block, ui.situation]);

  const groups = useMemo(() => {
    if (ui.tab === 'topics') {
      const order = [...new Set(filtered.map((entry) => entry.blockId))];
      return order.map((blockId) => ({
        key: blockId,
        title: titles.blocks.get(blockId) ?? t('catalog.blockFallback', { id: blockId }),
        items: filtered.filter((entry) => entry.blockId === blockId),
      }));
    }
    const order = [...new Set(filtered.flatMap((entry) => entry.situationIds))];
    const groupsBySituation = order.map((situationId) => ({
      key: situationId,
      title: situationLabel(situationId, t),
      items: filtered.filter((entry) => entry.situationIds.includes(situationId)),
    }));
    const withoutSituation = filtered.filter((entry) => entry.situationIds.length === 0);
    return withoutSituation.length > 0
      ? [...groupsBySituation, { key: '-', title: t('catalog.noSituation'), items: withoutSituation }]
      : groupsBySituation;
  }, [filtered, ui.tab, titles, t]);

  const filtersActive = ui.query.trim() !== '' || ui.block !== '' || ui.situation !== '' || ui.mode !== '';

  return (
    <section aria-label={t('catalog.listLabel')}>
      <div className="tabs" role="group" aria-label={t('catalog.routes')}>
        <button type="button" className="btn btn-secondary tab" aria-pressed={ui.tab === 'topics'} onClick={() => catalogStore.set({ tab: 'topics' })}>
          {t('catalog.tabTopics')}
        </button>
        <button type="button" className="btn btn-secondary tab" aria-pressed={ui.tab === 'situations'} onClick={() => catalogStore.set({ tab: 'situations' })}>
          {t('catalog.tabSituations')}
        </button>
        <HelpButton topic="catalog.routes" />
      </div>
      <div className="search-row">
        <div className="field">
          <label htmlFor={searchId}>{t('catalog.search.label')}</label>
          <input
            id={searchId}
            type="search"
            value={ui.query}
            maxLength={100}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={hintId}
            onChange={(event) => catalogStore.set({ query: event.target.value })}
            data-testid="catalog-search"
          />
          <span id={hintId} className="field-hint">
            {t('catalog.search.hint')}
          </span>
        </div>
        <HelpButton topic="catalog.search" />
      </div>
      <div className="filters">
        <div className="field">
          <label htmlFor={`${searchId}-block`}>{t('catalog.filters.block')}</label>
          <select id={`${searchId}-block`} value={ui.block} onChange={(event) => catalogStore.set({ block: event.target.value })}>
            <option value="">{t('catalog.filters.allBlocks')}</option>
            {blocks.map((blockId) => (
              <option key={blockId} value={blockId}>
                {titles.blocks.get(blockId) ?? t('catalog.blockFallback', { id: blockId })}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${searchId}-situation`}>{t('catalog.filters.situation')}</label>
          <select id={`${searchId}-situation`} value={ui.situation} onChange={(event) => catalogStore.set({ situation: event.target.value })}>
            <option value="">{t('catalog.filters.allSituations')}</option>
            {situations.map((id) => (
              <option key={id} value={id}>
                {situationLabel(id, t)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${searchId}-mode`}>{t('catalog.filters.mode')}</label>
          <select
            id={`${searchId}-mode`}
            value={ui.mode}
            onChange={(event) => catalogStore.set({ mode: event.target.value as CatalogUiState['mode'] })}
          >
            <option value="">{t('catalog.filters.allModes')}</option>
            <option value="written">{t('modes.written')}</option>
            <option value="listening">{t('modes.listening')}</option>
            <option value="mixed">{t('modes.mixed')}</option>
          </select>
        </div>
      </div>
      <p className="muted small" role="status" aria-live="polite" data-testid="catalog-count">
        {t('catalog.count', { count: filtered.length })}
      </p>
      {filtered.length === 0 ? (
        <EmptyState
          title={entries.length === 0 ? t('catalog.empty.title') : t('catalog.noResults.title')}
          body={entries.length === 0 ? t('catalog.empty.body') : t('catalog.noResults.body')}
          action={
            filtersActive ? (
              <button type="button" className="btn btn-secondary" onClick={() => catalogStore.set({ query: '', block: '', situation: '', mode: '' })}>
                {t('catalog.noResults.clear')}
              </button>
            ) : undefined
          }
        />
      ) : (
        groups.map((group) => (
          <div key={group.key}>
            <h2 className="group-heading">{group.title}</h2>
            <ul className="result-list">
              {group.items.map((entry) => (
                <li key={`${group.key}:${entry.id}`}>
                  <Link
                    to={paths.catalog(entry.id)}
                    keepScroll
                    className="result-item"
                    aria-current={entry.id === selectedId ? 'true' : undefined}
                    data-testid="catalog-result"
                  >
                    <span className="result-title">{entry.titleUk}</span>
                    <span className="result-meta">
                      {entry.termEs ? <Es>{entry.termEs}</Es> : null}
                      {isOptionalCheck(entry.id) ? <> · {t('catalog.optionalCheck')}</> : null}
                      {entry.state !== 'ready' ? <> · {t(`contentStates.${entry.state}`)}</> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}

export function CatalogDetail({ entry, titles }: { readonly entry: CatalogEntry; readonly titles: Titles }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const ui = useStore(catalogStore);
  const wide = useWideLayout();
  const runner = useCommandRunner();
  const allKeys = entry.targets.map(targetKey);
  const selectedKeys = new Set(ui.selections[entry.id] ?? allKeys);
  const mode: PracticeMode = ui.practiceModes[entry.id] ?? 'written';
  const selectedTargets: Target[] = entry.targets.filter((target) => selectedKeys.has(targetKey(target)));
  const ready = entry.state === 'ready';

  const setSelection = (keys: readonly string[]) =>
    catalogStore.set((previous) => ({ ...previous, selections: { ...previous.selections, [entry.id]: keys } }));

  const practice = async () => {
    const receipt = await runner.run(practiceCreateCommand(api.profileEpoch, selectedTargets, mode, 10));
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  const unavailable = runner.status === 'failed' && runner.error instanceof ApiRequestError && runner.error.status === 422;

  return (
    <section className="card" aria-labelledby="catalog-detail-title" data-testid="catalog-detail">
      {!wide ? <BackToList /> : null}
      <div className="page-title-row">
        <h2 id="catalog-detail-title">{entry.titleUk}</h2>
        <StateBadge state={entry.state} />
      </div>
      {entry.termEs ? (
        <p>
          <Es>{entry.termEs}</Es>
        </p>
      ) : null}
      <p className="muted small">
        {titles.blocks.get(entry.blockId) ?? t('catalog.blockFallback', { id: entry.blockId })}
        {isOptionalCheck(entry.id) ? <> · {t('catalog.optionalCheck')}</> : null}
      </p>
      {entry.situationIds.length > 0 ? (
        <p className="small">
          {t('catalog.detail.situations')}: {entry.situationIds.map((id) => situationLabel(id, t)).join(', ')}
        </p>
      ) : null}

      <div className="row">
        <Link className="btn btn-secondary" to={withQuery(paths.lesson(entry.id), { focus: 'rule' })}>
          {t('catalog.detail.rule')}
        </Link>
        <Link className="btn btn-secondary" to={paths.lesson(entry.id)}>
          {t('catalog.detail.learn')}
        </Link>
        <HelpButton topic="catalog.actions" />
      </div>

      <fieldset>
        <legend>
          {t('catalog.detail.targets')} <HelpButton topic="catalog.targets" />
        </legend>
        {entry.targets.length === 0 ? <p className="muted">{t('catalog.detail.noTargets')}</p> : null}
        {entry.targets.map((target) => {
          const key = targetKey(target);
          return (
            <label key={key} className="choice">
              <input
                type="checkbox"
                checked={selectedKeys.has(key)}
                onChange={(event) => {
                  const next = new Set(selectedKeys);
                  if (event.target.checked) next.add(key);
                  else next.delete(key);
                  setSelection(allKeys.filter((k) => next.has(k)));
                }}
              />
              <TargetLabel target={target} title={titles.targets.get(key)} />
            </label>
          );
        })}
        {entry.targets.length > 1 ? (
          <div className="row">
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setSelection(allKeys)}>
              {t('catalog.detail.selectAll')}
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setSelection([])}>
              {t('catalog.detail.clearSelection')}
            </button>
          </div>
        ) : null}
      </fieldset>

      <fieldset>
        <legend>
          {t('catalog.detail.mode')} <HelpButton topic="catalog.mode" />
        </legend>
        <div className="segmented">
          {(['written', 'listening', 'mixed'] as const).map((value) => (
            <label key={value} className="choice">
              <input
                type="radio"
                name={`practice-mode-${entry.id}`}
                checked={mode === value}
                onChange={() => catalogStore.set((previous) => ({ ...previous, practiceModes: { ...previous.practiceModes, [entry.id]: value } }))}
              />
              {t(`modes.${value}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {selectedTargets.length === 0 ? <p className="notice notice-info">{t('catalog.detail.selectSomething')}</p> : null}
      {!ready ? <p className="notice notice-warning">{t('catalog.detail.notReady')}</p> : null}
      <button
        type="button"
        className="btn btn-primary"
        disabled={!ready || selectedTargets.length === 0 || runner.status === 'pending'}
        onClick={() => void practice()}
        data-testid="catalog-practice"
      >
        {t('catalog.detail.practice', { count: selectedTargets.length })}
      </button>
      <p className="muted small">{t('catalog.detail.scopeNote')}</p>
      {unavailable ? (
        <p className="notice notice-warning" role="alert">
          {t('catalog.detail.unavailable')}
        </p>
      ) : (
        <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
      )}
    </section>
  );
}
