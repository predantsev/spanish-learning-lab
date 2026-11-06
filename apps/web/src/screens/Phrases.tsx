// My phrases — "Library and collections" (C-022/C-051/C-052/C-081): one searchable library (drafts
// searchable but labelled and never used as answer models), three add paths, personal and course
// collections over the same phrase records (one history), copy of a course collection by
// references, practice of an explicitly selected ready subset, membership removal with undo.
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../app/context.tsx';
import { useCommandRunner, useResource, useWideLayout, type Resource } from '../app/hooks.ts';
import { makeCommand, receiptEntity } from '../api/commands.ts';
import type { Collection, PhraseLibraryView, Target } from '../api/types.ts';
import { ConfirmDialog, Modal } from '../components/Dialog.tsx';
import { Es, PageHeader, StateBadge, UndoBar } from '../components/Common.tsx';
import { HelpButton } from '../components/HelpButton.tsx';
import { ActionError, EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { practiceCreateCommand, practiceRouteFromReceipt } from '../flows/session.ts';
import { foldForSearch } from '../lib/catalogSearch.ts';
import { newId } from '../lib/ids.ts';
import { createStore, useStore } from '../lib/store.ts';
import { goBack, Link, navigate } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

export type Phrase = PhraseLibraryView['phrases'][number];
type Filter = 'all' | 'ready' | 'drafts' | 'archived';
type PracticeMode = 'written' | 'listening' | 'mixed';

const MAX_PRACTICE_PHRASES = 30;

interface PhraseUiState {
  readonly query: string;
  readonly filter: Filter;
  readonly selected: readonly string[];
  readonly mode: PracticeMode;
}

export const phraseStore = createStore<PhraseUiState>({ query: '', filter: 'all', selected: [], mode: 'written' });

export function isDraftPhrase(phrase: Phrase): boolean {
  return phrase.state !== 'ready' && phrase.state !== 'reviewed';
}

export function isPracticeReady(phrase: Phrase): boolean {
  return phrase.practiceReady && !phrase.archived && !isDraftPhrase(phrase);
}

export function filterPhrases(phrases: readonly Phrase[], query: string, filter: Filter): Phrase[] {
  const needle = foldForSearch(query);
  return phrases.filter((phrase) => {
    // Archived phrases appear only in the Archive filter; every other filter excludes them.
    if (filter === 'archived' ? !phrase.archived : phrase.archived) return false;
    if (filter === 'ready' && !isPracticeReady(phrase)) return false;
    if (filter === 'drafts' && !isDraftPhrase(phrase)) return false;
    if (!needle) return true;
    return foldForSearch(`${phrase.spanish} ${phrase.ukrainian}`).includes(needle);
  });
}

/**
 * TODO(contract): practice.create requires targets (≥1) but PhraseLibraryView rows carry no target.
 * Until the view exposes each phrase's target, the exact-recall target is derived from the phrase's
 * stable logical id with the `phrase-recall` modality; the service validates it.
 */
export function phraseRecallTarget(phrase: Phrase): Target {
  return { skillId: phrase.logicalId, modality: 'phrase-recall' };
}

function useLibrary(): Resource<PhraseLibraryView> {
  const { api } = useApp();
  return useResource('phrases', (signal) => api.get<PhraseLibraryView>('/views/phrases', signal).then((envelope) => envelope.data));
}

interface UndoState {
  readonly message: string;
  readonly undo: () => Promise<void>;
}

/** collection.patch helper returning the new collection revision (for undo). */
function useCollectionPatch(onDone: () => void) {
  const { api } = useApp();
  const runner = useCommandRunner();
  const patch = async (collection: { readonly id: string; readonly revision: number }, add: readonly string[], remove: readonly string[], name?: string) => {
    const receipt = await runner.run(
      makeCommand('collection.patch', api.profileEpoch, {
        subjectId: collection.id,
        expectedRevision: collection.revision,
        payload: name === undefined ? { add: [...add], remove: [...remove] } : { add: [...add], remove: [...remove], name },
      }),
    );
    if (!receipt) return null;
    onDone();
    return receiptEntity(receipt, 'collection')?.revision ?? collection.revision + 1;
  };
  return { patch, runner };
}

export function PhrasesScreen({ phraseId }: { readonly phraseId?: string }) {
  const { t } = useTranslation();
  const wide = useWideLayout();
  const library = useLibrary();
  const view = library.state.status === 'ready' ? library.state.data : null;
  const selectedPhrase = view && phraseId ? view.phrases.find((phrase) => phrase.id === phraseId) : undefined;

  return (
    <div className="page">
      {!wide && phraseId ? null : <PageHeader title={t('phrases.title')} lead={t('phrases.lead')} help="phrases.library" />}
      {library.state.status === 'loading' ? <LoadingState /> : null}
      {library.state.status === 'error' ? <ErrorState error={library.state.error} onRetry={library.reload} /> : null}
      {view ? (
        <div className={`split ${phraseId ? 'has-detail' : ''}`}>
          <div className="split-list">
            <CollectionsOverview view={view} onChanged={library.reload} />
            <PhraseLibrary view={view} selectedId={phraseId} onChanged={library.reload} />
          </div>
          <div className="split-detail">
            {phraseId ? (
              selectedPhrase ? (
                <PhraseDetail phrase={selectedPhrase} view={view} onChanged={library.reload} />
              ) : (
                <section className="card">
                  <EmptyState title={t('phrases.notFound')} />
                </section>
              )
            ) : (
              <section className="card">
                <p className="muted">{t('phrases.pick')}</p>
              </section>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CollectionsOverview({ view, onChanged }: { readonly view: PhraseLibraryView; readonly onChanged: () => void }) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const readyById = new Map(view.phrases.map((phrase) => [phrase.id, isPracticeReady(phrase)]));
  const mine = view.collections.filter((collection) => collection.origin === 'personal');
  const course = view.collections.filter((collection) => collection.origin === 'course');
  const row = (collection: Collection) => (
    <li key={collection.id}>
      <Link to={paths.collection(collection.id)} className="result-item" data-testid="collection-item">
        <span className="result-title">{collection.name}</span>
        <span className="result-meta">
          {t('phrases.collections.counts', {
            ready: collection.phraseIds.filter((id) => readyById.get(id)).length,
            total: collection.phraseIds.length,
          })}
        </span>
      </Link>
    </li>
  );
  return (
    <section className="card" aria-labelledby="collections-title">
      <div className="page-title-row">
        <h2 id="collections-title">{t('phrases.collections.title')}</h2>
        <HelpButton topic="phrases.collections" />
      </div>
      <h3 className="group-heading">{t('phrases.collections.mine')}</h3>
      {mine.length === 0 ? <p className="muted">{t('phrases.collections.noneMine')}</p> : <ul className="result-list">{mine.map(row)}</ul>}
      <button type="button" className="btn btn-secondary btn-small" onClick={() => setCreating(true)}>
        {t('phrases.collections.create')}
      </button>
      <h3 className="group-heading">{t('phrases.collections.course')}</h3>
      {course.length === 0 ? <p className="muted">{t('phrases.collections.noneCourse')}</p> : <ul className="result-list">{course.map(row)}</ul>}
      <CreateCollectionDialog open={creating} onClose={() => setCreating(false)} onCreated={onChanged} />
    </section>
  );
}

function PhraseLibrary({ view, selectedId, onChanged }: { readonly view: PhraseLibraryView; readonly selectedId?: string; readonly onChanged: () => void }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const ui = useStore(phraseStore);
  const runner = useCommandRunner();
  const [adding, setAdding] = useState(false);
  const searchId = useId();
  const visible = useMemo(() => filterPhrases(view.phrases, ui.query, ui.filter), [view.phrases, ui.query, ui.filter]);
  const byId = new Map(view.phrases.map((phrase) => [phrase.id, phrase]));
  const selected = ui.selected.map((id) => byId.get(id)).filter((phrase): phrase is Phrase => Boolean(phrase && isPracticeReady(phrase)));

  const toggle = (phrase: Phrase, on: boolean) =>
    phraseStore.set((previous) => ({
      ...previous,
      selected: on ? [...new Set([...previous.selected, phrase.id])].slice(0, MAX_PRACTICE_PHRASES) : previous.selected.filter((id) => id !== phrase.id),
    }));

  const practice = async () => {
    const receipt = await runner.run(
      practiceCreateCommand(
        api.profileEpoch,
        selected.map(phraseRecallTarget),
        ui.mode,
        Math.min(30, Math.max(1, selected.length * 2)),
        selected.map((phrase) => phrase.id),
      ),
    );
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  return (
    <section className="card" aria-labelledby="library-title">
      <div className="page-title-row">
        <h2 id="library-title">{t('phrases.library.title')}</h2>
        <button type="button" className="btn btn-primary btn-small" onClick={() => setAdding(true)} data-testid="add-phrase">
          {t('phrases.add.open')}
        </button>
        <HelpButton topic="phrases.add" />
      </div>
      <div className="field">
        <label htmlFor={searchId}>{t('phrases.library.search')}</label>
        <input id={searchId} type="search" value={ui.query} maxLength={100} onChange={(event) => phraseStore.set({ query: event.target.value })} />
      </div>
      <div className="tabs" role="group" aria-label={t('phrases.library.filterLabel')}>
        {(['all', 'ready', 'drafts', 'archived'] as const).map((value) => (
          <button key={value} type="button" className="btn btn-secondary tab" aria-pressed={ui.filter === value} onClick={() => phraseStore.set({ filter: value })}>
            {t(`phrases.library.filters.${value}`)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title={view.phrases.length === 0 ? t('phrases.library.empty.title') : t('phrases.library.noResults.title')}
          body={view.phrases.length === 0 ? t('phrases.library.empty.body') : t('phrases.library.noResults.body')}
          action={
            view.phrases.length === 0 ? (
              <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
                {t('phrases.add.open')}
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => phraseStore.set({ query: '', filter: 'all' })}>
                {t('phrases.library.noResults.reset')}
              </button>
            )
          }
        />
      ) : (
        <ul className="result-list">
          {visible.map((phrase) => {
            const ready = isPracticeReady(phrase);
            return (
              <li key={phrase.id} className="row" data-testid="phrase-row" data-state={phrase.state}>
                <input
                  type="checkbox"
                  aria-label={t('phrases.library.select', { phrase: phrase.spanish })}
                  checked={ui.selected.includes(phrase.id)}
                  disabled={!ready || (!ui.selected.includes(phrase.id) && ui.selected.length >= MAX_PRACTICE_PHRASES)}
                  onChange={(event) => toggle(phrase, event.target.checked)}
                />
                <Link to={paths.phrases(phrase.id)} keepScroll className="result-item" aria-current={phrase.id === selectedId ? 'true' : undefined}>
                  <span className="result-title">
                    <Es>{phrase.spanish}</Es>
                  </span>
                  <span className="result-meta">{phrase.ukrainian}</span>
                  <span className="result-meta">
                    {isDraftPhrase(phrase) ? t('phrases.draftLabel') : t(`contentStates.${phrase.state}`)}
                    {phrase.archived ? ` · ${t('phrases.archived')}` : ''}
                    {phrase.collectionIds.length > 0 ? ` · ${t('phrases.inCollections', { count: phrase.collectionIds.length })}` : ''}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <fieldset>
        <legend>
          {t('phrases.practice.title')} <HelpButton topic="phrases.practice" />
        </legend>
        <p className="small">{t('phrases.practice.selected', { count: selected.length, max: MAX_PRACTICE_PHRASES })}</p>
        <div className="row">
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => phraseStore.set({ selected: visible.filter(isPracticeReady).map((phrase) => phrase.id).slice(0, MAX_PRACTICE_PHRASES) })}
          >
            {t('phrases.practice.selectReady')}
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => phraseStore.set({ selected: [] })}>
            {t('phrases.practice.clear')}
          </button>
        </div>
        <div className="segmented">
          {(['written', 'listening', 'mixed'] as const).map((mode) => (
            <label key={mode} className="choice">
              <input type="radio" name="phrase-practice-mode" checked={ui.mode === mode} onChange={() => phraseStore.set({ mode })} />
              {t(`modes.${mode}`)}
            </label>
          ))}
        </div>
        {ui.mode !== 'written' ? <p className="field-hint">{t('phrases.practice.audioNote')}</p> : null}
        <button type="button" className="btn btn-primary" disabled={selected.length === 0 || runner.status === 'pending'} onClick={() => void practice()} data-testid="practice-phrases">
          {t('phrases.practice.start', { count: selected.length })}
        </button>
        {selected.length === 0 ? <p className="muted small">{t('phrases.practice.emptySelection')}</p> : null}
        <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
      </fieldset>
      <AddPhraseDialog open={adding} view={view} onClose={() => setAdding(false)} onAdded={onChanged} />
    </section>
  );
}

function PhraseDetail({ phrase, view, onChanged }: { readonly phrase: Phrase; readonly view: PhraseLibraryView; readonly onChanged: () => void }) {
  const { t } = useTranslation();
  const wide = useWideLayout();
  const { patch, runner } = useCollectionPatch(onChanged);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const personal = view.collections.filter((collection) => collection.origin === 'personal');
  const courseMemberships = view.collections.filter((collection) => collection.origin === 'course' && collection.phraseIds.includes(phrase.id));

  const toggleMembership = async (collection: Collection, member: boolean) => {
    setUndo(null);
    const revision = await patch(collection, member ? [phrase.id] : [], member ? [] : [phrase.id]);
    if (revision !== null && !member) {
      setUndo({
        message: t('phrases.membership.removed', { name: collection.name }),
        undo: async () => {
          await patch({ id: collection.id, revision }, [phrase.id], []);
          setUndo(null);
        },
      });
    }
  };

  return (
    <article className="card" aria-labelledby="phrase-title" data-testid="phrase-detail">
      {!wide ? (
        <button type="button" className="btn btn-ghost back-link" onClick={() => goBack(paths.phrases())}>
          ← {t('phrases.backToLibrary')}
        </button>
      ) : null}
      <h2 id="phrase-title">
        <Es>{phrase.spanish}</Es>
      </h2>
      <p>{phrase.ukrainian}</p>
      <p className="row">
        <StateBadge state={phrase.state} />
        <span className="muted small">{t(`phrases.origin.${phrase.origin}`)}</span>
      </p>
      {isDraftPhrase(phrase) ? <p className="notice notice-warning">{t('phrases.draftNote')}</p> : null}
      {phrase.archived ? <p className="notice notice-info">{t('phrases.archivedNote')}</p> : null}
      <p className="small">{isPracticeReady(phrase) ? t('phrases.readyNote') : t('phrases.notReadyNote')}</p>

      <fieldset>
        <legend>
          {t('phrases.membership.title')} <HelpButton topic="phrases.membership" />
        </legend>
        {personal.length === 0 ? <p className="muted">{t('phrases.collections.noneMine')}</p> : null}
        {personal.map((collection) => (
          <label key={collection.id} className="choice">
            <input
              type="checkbox"
              checked={collection.phraseIds.includes(phrase.id)}
              disabled={runner.status === 'pending'}
              onChange={(event) => void toggleMembership(collection, event.target.checked)}
            />
            {collection.name}
          </label>
        ))}
        {courseMemberships.length > 0 ? (
          <p className="small muted">
            {t('phrases.membership.course')}: {courseMemberships.map((collection) => collection.name).join(', ')}
          </p>
        ) : null}
        <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
      </fieldset>

      <div className="stack">
        <button type="button" className="btn btn-secondary" disabled aria-describedby="archive-unavailable">
          {t('phrases.archive.action')}
        </button>
        {/* TODO(contract): no phrase archive command exists (Command kinds have no phrase.archive), so the
            confirm + undo archive flow cannot be persisted. The control stays disabled with an explanation. */}
        <p id="archive-unavailable" className="muted small">
          {t('phrases.archive.unavailable')}
        </p>
      </div>
      {undo ? <UndoBar message={undo.message} onUndo={() => void undo.undo()} onDismiss={() => setUndo(null)} /> : null}
    </article>
  );
}

function AddPhraseDialog({ open, view, onClose, onAdded }: { readonly open: boolean; readonly view: PhraseLibraryView; readonly onClose: () => void; readonly onAdded: () => void }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const runner = useCommandRunner();
  const [path, setPath] = useState<'course' | 'spanish' | 'uk-intent'>('course');
  const [text, setText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const formId = useId();
  const courseOptions = useMemo(() => {
    const needle = foldForSearch(courseQuery);
    return view.phrases
      .filter((phrase) => phrase.origin === 'course' && !isDraftPhrase(phrase))
      .filter((phrase) => !needle || foldForSearch(`${phrase.spanish} ${phrase.ukrainian}`).includes(needle))
      .slice(0, 50);
  }, [view.phrases, courseQuery]);

  const reset = () => {
    setText('');
    setMeaning('');
    setCourseId(null);
    runner.reset();
  };

  const submit = async () => {
    setAdded(null);
    const payload =
      path === 'course'
        ? courseId
          ? ({ source: 'course', sourceRevisionId: courseId } as const)
          : null
        : text.trim()
          ? ({ source: path, text: text.trim(), meaning: meaning.trim() } as const)
          : null;
    if (!payload) return;
    const receipt = await runner.run(makeCommand('phrase.capture', api.profileEpoch, { subjectId: newId(), expectedRevision: 0, payload }));
    if (!receipt) return;
    setAdded(receiptEntity(receipt, 'phrase')?.id ?? null);
    reset();
    onAdded();
  };

  const canSubmit = path === 'course' ? courseId !== null : text.trim().length > 0;
  return (
    <Modal
      open={open}
      title={t('phrases.add.title')}
      onClose={() => {
        setAdded(null);
        reset();
        onClose();
      }}
      footer={
        <button type="submit" form={formId} className="btn btn-primary" disabled={!canSubmit || runner.status === 'pending'}>
          {t('phrases.add.submit')}
        </button>
      }
    >
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <fieldset>
          <legend>{t('phrases.add.pathLegend')}</legend>
          {(['course', 'spanish', 'uk-intent'] as const).map((value) => (
            <label key={value} className="choice">
              <input type="radio" name={`${formId}-path`} checked={path === value} onChange={() => setPath(value)} />
              <span>
                <strong>{t(`phrases.add.paths.${value}.label`)}</strong>
                <br />
                <span className="muted small">{t(`phrases.add.paths.${value}.hint`)}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {path === 'course' ? (
          <div>
            <div className="field">
              <label htmlFor={`${formId}-course-search`}>{t('phrases.add.courseSearch')}</label>
              <input id={`${formId}-course-search`} type="search" value={courseQuery} maxLength={100} onChange={(event) => setCourseQuery(event.target.value)} />
            </div>
            {courseOptions.length === 0 ? <p className="muted">{t('phrases.add.courseEmpty')}</p> : null}
            <div className="stack">
              {courseOptions.map((phrase) => (
                <label key={phrase.id} className="choice">
                  <input type="radio" name={`${formId}-course`} checked={courseId === phrase.id} onChange={() => setCourseId(phrase.id)} />
                  <span>
                    <Es>{phrase.spanish}</Es> — {phrase.ukrainian}
                  </span>
                </label>
              ))}
            </div>
            <p className="small muted">{t('phrases.add.courseNote')}</p>
          </div>
        ) : (
          <div>
            <div className="field">
              <label htmlFor={`${formId}-text`}>{path === 'spanish' ? t('phrases.add.spanishText') : t('phrases.add.intentText')}</label>
              <input
                id={`${formId}-text`}
                type="text"
                value={text}
                maxLength={2000}
                lang={path === 'spanish' ? 'es-ES' : 'uk'}
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setText(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`${formId}-meaning`}>{path === 'spanish' ? t('phrases.add.meaning') : t('phrases.add.context')}</label>
              <input id={`${formId}-meaning`} type="text" value={meaning} maxLength={2000} onChange={(event) => setMeaning(event.target.value)} />
            </div>
            <p className="notice notice-info">{t('phrases.add.draftNote')}</p>
          </div>
        )}
      </form>
      <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
      {added ? (
        <p className="notice notice-success" role="status">
          {t('phrases.add.added')} <Link to={paths.phrases(added)}>{t('phrases.add.openAdded')}</Link>
        </p>
      ) : null}
    </Modal>
  );
}

function CreateCollectionDialog({
  open,
  onClose,
  onCreated,
  initialPhraseIds = [],
  initialName = '',
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (collectionId: string | null) => void;
  readonly initialPhraseIds?: readonly string[];
  readonly initialName?: string;
}) {
  const { t } = useTranslation();
  const { api } = useApp();
  const runner = useCommandRunner();
  const [name, setName] = useState(initialName);
  const formId = useId();
  const submit = async () => {
    if (!name.trim()) return;
    const receipt = await runner.run(
      makeCommand('collection.create', api.profileEpoch, { subjectId: newId(), expectedRevision: 0, payload: { name: name.trim().slice(0, 120), phraseIds: [...initialPhraseIds] } }),
    );
    if (!receipt) return;
    setName('');
    onCreated(receiptEntity(receipt, 'collection')?.id ?? null);
    onClose();
  };
  return (
    <Modal
      open={open}
      title={t('phrases.collections.createTitle')}
      onClose={onClose}
      footer={
        <button type="submit" form={formId} className="btn btn-primary" disabled={!name.trim() || runner.status === 'pending'}>
          {t('phrases.collections.createSubmit')}
        </button>
      }
    >
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="field">
          <label htmlFor={`${formId}-name`}>{t('phrases.collections.name')}</label>
          <input id={`${formId}-name`} type="text" value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
          <span className="field-hint">{t('phrases.collections.nameHint')}</span>
        </div>
      </form>
      <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
    </Modal>
  );
}

export function CollectionScreen({ collectionId }: { readonly collectionId: string }) {
  const { t } = useTranslation();
  const { api } = useApp();
  const library = useLibrary();
  const view = library.state.status === 'ready' ? library.state.data : null;
  const collection = view?.collections.find((candidate) => candidate.id === collectionId);
  const { patch, runner } = useCollectionPatch(library.reload);
  const practiceRunner = useCommandRunner();
  const copyRunner = useCommandRunner();
  const [confirmRemove, setConfirmRemove] = useState<Phrase | null>(null);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [mode, setMode] = useState<PracticeMode>('written');

  if (library.state.status === 'loading') return <div className="page"><LoadingState /></div>;
  if (library.state.status === 'error') return <div className="page"><ErrorState error={library.state.error} onRetry={library.reload} /></div>;
  if (!view || !collection) {
    return (
      <div className="page">
        <PageHeader title={t('phrases.collections.notFound')} />
        <Link to={paths.phrases()}>{t('phrases.backToLibrary')}</Link>
      </div>
    );
  }

  const byId = new Map(view.phrases.map((phrase) => [phrase.id, phrase]));
  const members = collection.phraseIds.map((id) => byId.get(id)).filter((phrase): phrase is Phrase => Boolean(phrase));
  const readyMembers = members.filter(isPracticeReady);
  const selectedPhrases = readyMembers.filter((phrase) => selected.includes(phrase.id)).slice(0, MAX_PRACTICE_PHRASES);
  const personal = collection.origin === 'personal';

  const remove = async (phrase: Phrase) => {
    setConfirmRemove(null);
    const revision = await patch(collection, [], [phrase.id]);
    if (revision !== null) {
      setUndo({
        message: t('phrases.membership.removed', { name: collection.name }),
        undo: async () => {
          await patch({ id: collection.id, revision }, [phrase.id], []);
          setUndo(null);
        },
      });
    }
  };

  const copy = async () => {
    const receipt = await copyRunner.run(
      makeCommand('collection.create', api.profileEpoch, {
        subjectId: newId(),
        expectedRevision: 0,
        payload: { name: t('phrases.collections.copyName', { name: collection.name }).slice(0, 120), phraseIds: [...collection.phraseIds] },
      }),
    );
    const created = receipt ? receiptEntity(receipt, 'collection') : undefined;
    if (created) navigate(paths.collection(created.id));
    else if (receipt) library.reload();
  };

  const practice = async () => {
    const receipt = await practiceRunner.run(
      practiceCreateCommand(
        api.profileEpoch,
        selectedPhrases.map(phraseRecallTarget),
        mode,
        Math.min(30, Math.max(1, selectedPhrases.length * 2)),
        selectedPhrases.map((phrase) => phrase.id),
      ),
    );
    const route = receipt ? practiceRouteFromReceipt(receipt) : null;
    if (route) navigate(route);
  };

  return (
    <div className="page">
      <Link className="btn btn-ghost back-link" to={paths.phrases()}>
        ← {t('phrases.backToLibrary')}
      </Link>
      <PageHeader
        title={collection.name}
        help="phrases.collections"
        lead={
          <p>
            {t(`phrases.collections.origin.${collection.origin}`)} ·{' '}
            {t('phrases.collections.counts', { ready: readyMembers.length, total: members.length })}
          </p>
        }
      />
      {!personal ? (
        <section className="card">
          <p>{t('phrases.collections.courseNote')}</p>
          <button type="button" className="btn btn-secondary" disabled={copyRunner.status === 'pending'} onClick={() => void copy()} data-testid="copy-collection">
            {t('phrases.collections.copy')}
          </button>
          <ActionError error={copyRunner.status === 'failed' ? copyRunner.error : null} onRetry={copyRunner.canRetry ? () => void copyRunner.retry() : undefined} />
        </section>
      ) : (
        <section className="card">
          <div className="row">
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                setNewName(collection.name);
                setRenaming(true);
              }}
            >
              {t('phrases.collections.rename')}
            </button>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setAdding(true)}>
              {t('phrases.collections.addPhrases')}
            </button>
          </div>
          {renaming ? (
            <form
              className="row"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newName.trim()) return;
                void patch(collection, [], [], newName.trim().slice(0, 120)).then(() => setRenaming(false));
              }}
            >
              <div className="field">
                <label htmlFor="collection-rename">{t('phrases.collections.name')}</label>
                <input id="collection-rename" type="text" value={newName} maxLength={120} onChange={(event) => setNewName(event.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-small">
                {t('common.save')}
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setRenaming(false)}>
                {t('common.cancel')}
              </button>
            </form>
          ) : null}
          <ActionError error={runner.status === 'failed' ? runner.error : null} onRetry={runner.canRetry ? () => void runner.retry() : undefined} />
        </section>
      )}

      {members.length === 0 ? (
        <EmptyState
          title={t('phrases.collections.empty.title')}
          body={t('phrases.collections.empty.body')}
          action={
            personal ? (
              <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
                {t('phrases.collections.addPhrases')}
              </button>
            ) : undefined
          }
        />
      ) : (
        <section className="card">
          <ul className="result-list">
            {members.map((phrase) => (
              <li key={phrase.id} className="row">
                <input
                  type="checkbox"
                  aria-label={t('phrases.library.select', { phrase: phrase.spanish })}
                  disabled={!isPracticeReady(phrase)}
                  checked={selected.includes(phrase.id)}
                  onChange={(event) =>
                    setSelected((previous) => (event.target.checked ? [...previous, phrase.id] : previous.filter((id) => id !== phrase.id)))
                  }
                />
                <Link to={paths.phrases(phrase.id)} className="result-item">
                  <span className="result-title">
                    <Es>{phrase.spanish}</Es>
                  </span>
                  <span className="result-meta">
                    {phrase.ukrainian} · {isDraftPhrase(phrase) ? t('phrases.draftLabel') : t(`contentStates.${phrase.state}`)}
                  </span>
                </Link>
                {personal ? (
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmRemove(phrase)}>
                    {t('phrases.collections.remove')}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <fieldset>
            <legend>{t('phrases.practice.title')}</legend>
            <div className="row">
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setSelected(readyMembers.map((phrase) => phrase.id).slice(0, MAX_PRACTICE_PHRASES))}>
                {t('phrases.practice.selectReady')}
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setSelected([])}>
                {t('phrases.practice.clear')}
              </button>
            </div>
            <div className="segmented">
              {(['written', 'listening', 'mixed'] as const).map((value) => (
                <label key={value} className="choice">
                  <input type="radio" name="collection-practice-mode" checked={mode === value} onChange={() => setMode(value)} />
                  {t(`modes.${value}`)}
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-primary" disabled={selectedPhrases.length === 0 || practiceRunner.status === 'pending'} onClick={() => void practice()}>
              {t('phrases.practice.start', { count: selectedPhrases.length })}
            </button>
            <ActionError error={practiceRunner.status === 'failed' ? practiceRunner.error : null} onRetry={practiceRunner.canRetry ? () => void practiceRunner.retry() : undefined} />
          </fieldset>
        </section>
      )}

      <ConfirmDialog
        open={confirmRemove !== null}
        title={t('phrases.collections.removeTitle')}
        body={<p>{t('phrases.collections.removeBody')}</p>}
        confirmLabel={t('phrases.collections.remove')}
        onConfirm={() => confirmRemove && void remove(confirmRemove)}
        onCancel={() => setConfirmRemove(null)}
      />
      <AddToCollectionDialog
        open={adding}
        phrases={view.phrases.filter((phrase) => !collection.phraseIds.includes(phrase.id) && !phrase.archived)}
        onClose={() => setAdding(false)}
        onAdd={async (ids) => {
          const revision = await patch(collection, ids, []);
          if (revision !== null) setAdding(false);
        }}
      />
      {undo ? <UndoBar message={undo.message} onUndo={() => void undo.undo()} onDismiss={() => setUndo(null)} /> : null}
    </div>
  );
}

function AddToCollectionDialog({
  open,
  phrases,
  onClose,
  onAdd,
}: {
  readonly open: boolean;
  readonly phrases: readonly Phrase[];
  readonly onClose: () => void;
  readonly onAdd: (ids: readonly string[]) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<readonly string[]>([]);
  const visible = filterPhrases(phrases, query, 'all');
  return (
    <Modal
      open={open}
      title={t('phrases.collections.addTitle')}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary"
          disabled={chosen.length === 0}
          onClick={() =>
            void onAdd(chosen).then(() => {
              setChosen([]);
            })
          }
        >
          {t('phrases.collections.addSubmit', { count: chosen.length })}
        </button>
      }
    >
      <div className="field">
        <label htmlFor="add-to-collection-search">{t('phrases.library.search')}</label>
        <input id="add-to-collection-search" type="search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} />
      </div>
      {visible.length === 0 ? <p className="muted">{t('phrases.library.noResults.title')}</p> : null}
      {visible.slice(0, 100).map((phrase) => (
        <label key={phrase.id} className="choice">
          <input
            type="checkbox"
            checked={chosen.includes(phrase.id)}
            onChange={(event) => setChosen((previous) => (event.target.checked ? [...previous, phrase.id] : previous.filter((id) => id !== phrase.id)))}
          />
          <span>
            <Es>{phrase.spanish}</Es> — {phrase.ukrainian} {isDraftPhrase(phrase) ? `(${t('phrases.draftLabel')})` : ''}
          </span>
        </label>
      ))}
      <p className="small muted">{t('phrases.collections.addNote')}</p>
    </Modal>
  );
}
