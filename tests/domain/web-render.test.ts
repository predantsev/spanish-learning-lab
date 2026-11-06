// Server-side render smoke tests of every web screen/state with synthetic fixtures (not reviewed
// course content, not learner records). Effects do not run under renderToString, so data screens
// are rendered through their content components; route screens render their loading state.
import { createElement, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import type { i18n as I18n } from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import { ApiClient } from '../../apps/web/src/api/client.ts';
import { ApiRequestError } from '../../apps/web/src/api/errors.ts';
import type {
  Attempt,
  CatalogEntry,
  Context,
  ExerciseView,
  HomeView,
  LessonView,
  MaterialsView,
  OwnerProfile,
  PhraseLibraryView,
  ProgressView,
  Session,
} from '../../apps/web/src/api/types.ts';
import { AuthRequiredScreen, CheckingScreen, ServiceDownScreen } from '../../apps/web/src/app/BootScreens.tsx';
import { AppContext, type AppServices } from '../../apps/web/src/app/context.tsx';
import { Shell } from '../../apps/web/src/app/Shell.tsx';
import { Blocks } from '../../apps/web/src/components/Blocks.tsx';
import { HelpButton } from '../../apps/web/src/components/HelpButton.tsx';
import { EmptyState, ErrorState, LoadingState } from '../../apps/web/src/components/States.tsx';
import { createI18n } from '../../apps/web/src/i18n/index.ts';
import { OutboxStore } from '../../apps/web/src/outbox/store.ts';
import { CatalogDetail, CatalogList, CatalogScreen } from '../../apps/web/src/screens/Catalog.tsx';
import { ExerciseWorkspace, UnavailableTask } from '../../apps/web/src/screens/exercise/ExerciseScreen.tsx';
import { ListeningPlayer } from '../../apps/web/src/screens/exercise/ListeningPlayer.tsx';
import { ResultPanel } from '../../apps/web/src/screens/exercise/ResultPanel.tsx';
import { HomeContent, HomeScreen } from '../../apps/web/src/screens/Home.tsx';
import { LessonContent } from '../../apps/web/src/screens/Lesson.tsx';
import { ListeningScreen } from '../../apps/web/src/screens/Listening.tsx';
import { MaterialReader, MaterialsScreen } from '../../apps/web/src/screens/Materials.tsx';
import { CollectionsOverview, PhraseDetail, PhraseLibrary } from '../../apps/web/src/screens/Phrases.tsx';
import { ReviewScreen } from '../../apps/web/src/screens/Practice.tsx';
import { ProgressContent } from '../../apps/web/src/screens/Progress.tsx';
import { AgentsScreen, RecoveryScreen, SettingsContent } from '../../apps/web/src/screens/Settings.tsx';

const ID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const HASH = 'a'.repeat(64);
const SESSION: Session = {
  csrfToken: 'synthetic',
  profileEpoch: 1,
  profileId: ID(1),
  profileRevision: 3,
  revision: 1,
  expiresAt: '2026-10-01T16:00:00Z',
};

let i18n: I18n;
beforeAll(async () => {
  i18n = await createI18n('uk');
});

function services(overrides: Partial<AppServices> = {}): AppServices {
  return {
    api: new ApiClient({ transport: async () => new Response('{}', { status: 503 }) }),
    outbox: new OutboxStore(false),
    session: SESSION,
    platform: 'mac',
    demo: false,
    profile: null,
    setProfile: () => undefined,
    connection: 'ok',
    checkConnection: async () => true,
    epochChanged: false,
    authLost: false,
    locale: 'uk',
    ...overrides,
  };
}

function render(element: ReactElement, overrides: Partial<AppServices> = {}): string {
  return renderToString(
    createElement(I18nextProvider, { i18n }, createElement(AppContext.Provider, { value: services(overrides) }, element)),
  );
}

/** Visible text of the rendered markup (tags removed, entities decoded for the few used). */
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ');
}

const home = (overrides: Partial<HomeView>): HomeView => ({
  viewsVersion: 1,
  firstUse: false,
  review: { dueTargets: 0, supportPending: 0, estimatedMinutes: 0 },
  evidence: { introduced: 12, independent: 5, supported: 3, uncertain: 1, listening: 2, stable: 1 },
  pack: { state: 'ready', version: 'synthetic-1', hash: HASH.slice(0, 16) },
  ...overrides,
});

describe('boot and shell states', () => {
  it('service unavailable screen is honest and keeps local drafts copyable', async () => {
    const outbox = new OutboxStore(false);
    await outbox.put({
      operationId: ID(90),
      epoch: 1,
      contextId: ID(91),
      draftId: ID(92),
      taskRevisionId: ID(93),
      baseRevision: 2,
      text: 'He hecho la tarea.',
      cursor: 18,
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:01Z',
      title: 'Synthetic lesson',
      state: 'failed',
    });
    const html = render(createElement(ServiceDownScreen, { outbox, onRetry: () => undefined }));
    expect(text(html)).toContain('Локальний сервіс не запущено — запустіть Start.command.');
    expect(text(html)).toContain('He hecho la tarea.');
    expect(text(html)).toContain('Копіювати все');
  });

  it('auth-required and checking screens', () => {
    expect(text(render(createElement(AuthRequiredScreen, { outbox: new OutboxStore(false), onRetry: () => undefined })))).toContain(
      'Відкрийте застосунок через запуск',
    );
    expect(render(createElement(CheckingScreen))).toContain('role="status"');
  });

  it('shell renders both navigations, skip link and every global banner', async () => {
    const outbox = new OutboxStore(false);
    await outbox.put({
      operationId: ID(94),
      epoch: 1,
      contextId: ID(95),
      draftId: ID(96),
      taskRevisionId: ID(97),
      baseRevision: 1,
      text: 'x',
      cursor: 1,
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z',
      title: 'T',
      state: 'pending',
    });
    const html = render(createElement(Shell, { route: { name: 'home' }, children: createElement('p', null, 'content') }), {
      demo: true,
      connection: 'unreachable',
      epochChanged: true,
      authLost: true,
      outbox,
    });
    const visible = text(html);
    expect(html).toContain('class="skip-link"');
    expect(html.match(/aria-label="Основна навігація"/g)).toHaveLength(2);
    expect(visible).toContain('Демо-дані.');
    expect(visible).toContain('Немає зв\'язку з локальним сервісом');
    expect(visible).toContain('Профіль замінено');
    expect(visible).toContain('Сеанс завершився');
    expect(visible).toContain('1 чернетка ще не збережена в сервісі.');
    expect(html).toContain('aria-current="page"');
  });

  it('loading, error (404) and empty states', () => {
    expect(render(createElement(LoadingState))).toContain('Завантаження…');
    expect(text(render(createElement(ErrorState, { error: new ApiRequestError('http', 404) })))).toContain('Не знайдено');
    expect(text(render(createElement(ErrorState, { error: new ApiRequestError('network', 0) })))).toContain('Немає зв\'язку з локальним сервісом');
    expect(text(render(createElement(EmptyState, { title: 'Порожньо' })))).toContain('Порожньо');
  });

  it('route screens start in an accessible loading state', () => {
    for (const element of [
      createElement(HomeScreen),
      createElement(CatalogScreen, {}),
      createElement(ReviewScreen),
      createElement(ListeningScreen),
      createElement(MaterialsScreen, { topicId: 'A2-03' }),
      createElement(AgentsScreen),
    ]) {
      expect(render(element)).toContain('Завантаження…');
    }
  });
});

describe('home — One focus', () => {
  it('first use: start course + manual choice, no invented activity', () => {
    const html = render(createElement(HomeContent, { view: home({ firstUse: true, nextLesson: { lessonId: 'A1-01-L1', titleUk: 'Перший урок', blockId: 'A1-01' } }) }));
    const visible = text(html);
    expect(html).toContain('data-focus="first-use"');
    expect(visible).toContain('Почати курс');
    expect(visible).toContain('Обрати тему вручну');
    expect(visible).not.toContain('Коротко про докази');
  });

  it('due review first, with an evidence-based reason, separate evidence counts and no percentage', () => {
    const html = render(createElement(HomeContent, { view: home({ review: { dueTargets: 3, supportPending: 1, estimatedMinutes: 6 } }) }));
    const visible = text(html);
    expect(html).toContain('data-focus="review"');
    expect(visible).toContain('3 навички чекають на відкладену перевірку.');
    expect(visible).toContain('Почати повторення');
    expect(visible).toContain('стабільні в пізніших перевірках');
    expect(visible).not.toMatch(/\d\s?%/);
    expect(html).toContain('lang="es-ES"');
  });

  it('nothing due: resume the saved activity, else continue the course, else choose', () => {
    const resume = render(
      createElement(HomeContent, {
        view: home({ resume: { contextId: ID(5), titleUk: 'Неправильні дієприкметники', lessonId: 'A2-03-L2', taskRevisionId: ID(6), lastActivityAt: '2026-10-01T08:00:00Z' } }),
      }),
    );
    expect(resume).toContain('data-focus="resume"');
    expect(resume).toContain(`/exercise/${ID(6)}?context=${ID(5)}`);
    const next = render(createElement(HomeContent, { view: home({ nextLesson: { lessonId: 'A1-02-L1', titleUk: 'Наступний', blockId: 'A1-02' } }) }));
    expect(next).toContain('data-focus="continue"');
    expect(text(next)).toContain('Продовжити курс');
    expect(render(createElement(HomeContent, { view: home({}) }))).toContain('data-focus="choose"');
  });

  it('incomplete pack is reported', () => {
    expect(text(render(createElement(HomeContent, { view: home({ pack: { state: 'missing', version: '', hash: '' } }) })))).toContain('Пакет курсу не встановлено');
  });
});

const catalogEntries: CatalogEntry[] = [
  {
    id: 'A2-03-L2',
    titleUk: 'Неправильні дієприкметники',
    termEs: 'participios irregulares',
    blockId: 'A2-03',
    situationIds: ['home'],
    targets: [
      { skillId: 'participle.hecho', modality: 'written-form' },
      { skillId: 'participle.dicho', modality: 'written-form' },
    ],
    state: 'ready',
  },
  { id: 'A2-03-C1', titleUk: 'Перевірка блоку', termEs: '', blockId: 'A2-03', situationIds: [], targets: [], state: 'draft' },
];
const noTitles = { blocks: new Map<string, string>(), targets: new Map<string, string>() };

describe('catalog — List and details', () => {
  it('list groups by block with search hint, filters and Spanish terms tagged', () => {
    const html = render(createElement(CatalogList, { entries: catalogEntries, titles: noTitles }));
    const visible = text(html);
    expect(visible).toContain('Пошук теми');
    expect(visible).toContain('«hecho»');
    expect(visible).toContain('Блок A2-03');
    expect(visible).toContain('необов\'язкова перевірка');
    expect(html).toContain('<span lang="es-ES">participios irregulares</span>');
    expect(visible).toContain('Тем у списку: 2');
  });

  it('detail offers Rule / Learn / Practice with explicit target and mode choice', () => {
    const html = render(createElement(CatalogDetail, { entry: catalogEntries[0] as CatalogEntry, titles: noTitles }));
    const visible = text(html);
    expect(visible).toContain('Правило');
    expect(visible).toContain('Вивчити тему');
    expect(visible).toContain('Практикувати вибране (2)');
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
    expect(visible).toContain('participle.hecho');
    expect(visible).toContain('Набір міститиме лише вибрані навички та формат.');
  });

  it('a not-ready entry cannot be practised', () => {
    const html = render(createElement(CatalogDetail, { entry: catalogEntries[1] as CatalogEntry, titles: noTitles }));
    expect(text(html)).toContain('Цей урок ще не перевірено');
    expect(html).toMatch(/data-testid="catalog-practice"[^>]*disabled=""|disabled=""[^>]*data-testid="catalog-practice"/);
  });
});

const task = (input: 'options' | 'short' | 'multiline', extra: Partial<ExerciseView['task']> = {}): ExerciseView['task'] => ({
  taskRevisionId: ID(20),
  logicalId: 'A2-03-L2-T01',
  lessonId: 'A2-03-L2',
  role: 'independent',
  mode: input === 'options' ? 'choice' : input === 'multiline' ? 'rubric-review' : 'exact-variants',
  input,
  targets: [{ skillId: 'participle.hecho', modality: 'written-form' }],
  prompt: [
    { type: 'paragraph', language: 'uk', text: 'Синтетичне завдання: напишіть форму.' },
    { type: 'example', spanish: 'Yo ___ (hacer) la cena.', ukrainian: 'Я приготував вечерю.' },
  ],
  options: input === 'options' ? [
    { id: 'a', label: 'hecho' },
    { id: 'b', label: 'hacido' },
  ] : [],
  audioHashes: [],
  hints: [
    { index: 0, kind: 'rule' },
    { index: 1, kind: 'targeted-clue' },
    { index: 2, kind: 'reveal' },
  ],
  state: 'ready',
  ...extra,
});

const context = (draftText = ''): Context => ({
  metadata: { id: ID(30), revision: 4, open: true, lastActivityAt: '2026-10-01T08:00:00Z', title: 'Synthetic', taskRevisionId: ID(20), mode: 'practice' },
  task: { id: ID(20), logicalId: 'A2-03-L2-T01', revision: 1, prompt: [], targets: [], mode: 'exact-variants', options: [], audioHashes: [] },
  draft: { id: ID(31), revision: 2, taskRevisionId: ID(20), text: draftText, cursor: draftText.length, savedAt: '2026-10-01T08:00:00Z' },
  supportState: 'none',
  resultIds: [],
  snapshotAt: '2026-10-01T08:00:00Z',
  snapshotToken: 's'.repeat(43),
});

function exercise(view: ExerciseView, draftText = '') {
  return createElement(ExerciseWorkspace, {
    setup: {
      view,
      context: context(draftText),
      session: { id: ID(40), revision: 1, mode: 'practice', taskRevisionIds: [ID(20), ID(21)], status: 'active' },
      lesson: null,
    },
  });
}

describe('exercise — focus with reference, input rules, no character strip', () => {
  it('short answer: Spanish input without autocorrect, Enter reminder, reference toggle collapsed, targets stated', () => {
    const html = render(exercise({ viewsVersion: 1, task: task('short'), lessonTitleUk: 'Урок', materials: [] }, 'he hecho'));
    const visible = text(html);
    expect(html).toMatch(/<input[^>]*lang="es-ES"[^>]*>/);
    expect(html).toMatch(/autoCorrect="off"|autocorrect="off"/i);
    expect(html).toContain('value="he hecho"');
    expect(visible).toContain('Enter — перевірити');
    expect(visible).toContain('Довідка');
    expect(html).toContain('aria-expanded="false"');
    expect(visible).toContain('Що перевіряється:');
    expect(visible).toContain('Завдання 1 з 2');
    expect(html).not.toMatch(/>\s*(á|é|í|ó|ú|ñ|¿|¡)\s*<\/button>/);
    expect(html).toContain('<p class="example-es" lang="es-ES">Yo ___ (hacer) la cena.</p>');
  });

  it('multiline answer shows the platform chord (Mac) and uses a textarea', () => {
    const html = render(exercise({ viewsVersion: 1, task: task('multiline'), lessonTitleUk: 'Урок', materials: [] }));
    expect(html).toContain('<textarea');
    expect(text(html)).toContain('⌘ Command + Enter — перевірити; Enter — новий рядок');
    const other = render(exercise({ viewsVersion: 1, task: task('multiline'), lessonTitleUk: 'Урок', materials: [] }), { platform: 'other' });
    expect(text(other)).toContain('Ctrl + Enter — перевірити; Enter — новий рядок');
  });

  it('choice task renders radio options and no keyboard reminder', () => {
    const html = render(exercise({ viewsVersion: 1, task: task('options'), lessonTitleUk: 'Урок', materials: [] }));
    expect(html.match(/type="radio"/g)).toHaveLength(2);
    expect(html).not.toContain('data-testid="shortcut-hint"');
  });

  it('listening task: explicit play button, no autoplay, preload none', () => {
    const html = render(
      exercise({
        viewsVersion: 1,
        task: task('options', { audioHashes: [HASH], targets: [{ skillId: 'shop.more', modality: 'listening-meaning' }], hints: [{ index: 0, kind: 'transcript' }] }),
        lessonTitleUk: 'Слухання',
        materials: [],
      }),
    );
    expect(text(html)).toContain('Відтворити');
    expect(html).toContain('preload="none"');
    expect(html).not.toMatch(/autoplay/i);
    expect(text(html)).toContain('Текст запису');
  });

  it('unready or quarantined task is explained, not offered', () => {
    const html = render(createElement(UnavailableTask, { view: { viewsVersion: 1, task: task('short', { state: 'quarantined' }), lessonTitleUk: 'Урок', materials: [] } }));
    expect(text(html)).toContain('тимчасово вилучено');
  });

  it('player alone renders accessible controls', () => {
    const html = render(
      createElement(ListeningPlayer, {
        src: '/api/v1/media/x',
        label: 'Аудіо',
        defaultSpeed: 1,
        onReplay: () => undefined,
        onSpeedChange: () => undefined,
        onError: () => undefined,
        onWrittenAlternative: () => undefined,
      }),
    );
    expect(text(html)).toContain('Повільніше (0,85×)');
    expect(html).toContain('aria-live="polite"');
  });
});

const checked: Attempt = {
  id: ID(50),
  revision: 1,
  taskRevisionId: ID(20),
  originalAnswer: 'he hecho',
  submittedAt: '2026-10-01T08:01:00Z',
  status: 'checked',
  verdicts: [
    { target: { skillId: 'participle.hecho', modality: 'written-form' }, correctness: 'correct', independence: 'independent', explanationKey: 'synthetic' },
    { target: { skillId: 'perfecto.haber', modality: 'written-form' }, correctness: 'incorrect', independence: 'supported', explanationKey: 'synthetic' },
  ],
  supportIds: [],
  adjudicationIds: [],
};
const unresolved: Attempt = {
  ...checked,
  id: ID(51),
  status: 'unresolved',
  verdicts: [{ target: { skillId: 'writing.free', modality: 'construction-use' }, correctness: 'unresolved', independence: 'independent', explanationKey: 'synthetic' }],
};
const actions = { onNext: () => undefined, nextLabel: 'Далі', onRetry: () => undefined, onShowReference: () => undefined, onOpenRule: () => undefined, referencePending: false };

describe('result — correctness and independence separately; unresolved in the exercise', () => {
  it('checked result shows icon + text for correctness and independence per target and an explicit Next', () => {
    const html = render(createElement(ResultPanel, { attempt: checked, titles: new Map(), actions }));
    const visible = text(html);
    expect(visible).toContain('Результат перевірки');
    expect(visible).toMatch(/✓\s*Правильно · самостійно/);
    expect(visible).toMatch(/✗\s*Неправильно · з підтримкою/);
    expect(visible).toContain('Далі');
    expect(html).toContain('data-unresolved="false"');
  });

  it('unresolved result: no pass/fail, answer kept, example/retry/review/skip actions', () => {
    const html = render(createElement(ResultPanel, { attempt: unresolved, titles: new Map(), actions }));
    const visible = text(html);
    expect(visible).toContain('Поки що не вдалося надійно оцінити');
    expect(visible).not.toContain('Неправильно');
    expect(visible).not.toContain('Правильно ·');
    expect(visible).toContain('Показати приклад відповіді');
    expect(visible).toContain('Редагувати й спробувати знову');
    expect(visible).toContain('Зберегти для перевірки');
    expect(visible).toContain('Відкрити правило');
  });
});

const lesson: LessonView = {
  viewsVersion: 1,
  lessonId: 'A1-01-L1',
  revisionId: ID(60),
  kind: 'lesson',
  blockId: 'A1-01',
  titleUk: 'Звуки й літери',
  termEs: 'el alfabeto',
  summaryUk: 'Синтетичний урок.',
  estimatedMinutes: 10,
  skippableFoundation: true,
  state: 'ready',
  objectives: ['A1-01-O1'],
  steps: [
    { id: 's1', kind: 'explanation', titleUk: 'Пояснення', required: true, blocks: [{ type: 'paragraph', language: 'uk', text: 'Синтетичне правило.' }], tasks: [], audio: [] },
    { id: 's2', kind: 'supported-practice', titleUk: 'Практика з підтримкою', required: true, blocks: [], tasks: [task('short')], audio: [] },
    { id: 's3', kind: 'self-check', titleUk: 'Самоперевірка', required: false, blocks: [], tasks: [], audio: [] },
    { id: 's4', kind: 'summary', titleUk: 'Підсумок', required: true, blocks: [], tasks: [], audio: [] },
  ],
  progress: { status: 'visited', visitedStepIds: ['s1'] },
  materials: [{ materialId: 'material.synthetic', revisionId: ID(61), titleUk: 'Таблиця', state: 'ready' }],
  previousLessonId: '',
  nextLessonId: 'A1-01-L2',
};

describe('lesson flow', () => {
  it('opens the first unvisited step with manual navigation, foundation self-check/skip and tasks', () => {
    const html = render(createElement(LessonContent, { lesson, reload: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('Крок 2 з 4');
    expect(visible).toContain('Практика з підтримкою');
    expect(visible).toContain('Знайома тема?');
    expect(visible).toContain('Пройти самоперевірку');
    expect(visible).toContain('Пропустити урок');
    expect(visible).toContain('Почати');
    expect(html).toContain('aria-current="step"');
    expect(html.match(/class="step-link"/g)).toHaveLength(4);
    expect(html).toContain('<span lang="es-ES">el alfabeto</span>');
  });

  it('summary step offers finishing without perfect-score locks', () => {
    const html = render(createElement(LessonContent, { lesson, stepId: 's4', reload: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('Завершення уроку');
    expect(visible).toContain('Ще не переглянуто обов\'язкових кроків');
    expect(visible).toContain('Завершити урок');
  });
});

const progress: ProgressView = {
  viewsVersion: 1,
  blocks: [{ blockId: 'A2-03', titleUk: 'Минулий час', lessons: [
    { lessonId: 'A2-03-L1', titleUk: 'Утворення', kind: 'lesson', status: 'completed' },
    { lessonId: 'A2-03-L2', titleUk: 'Дієприкметники', kind: 'lesson', status: 'visited' },
  ] }],
  targets: [
    { target: { skillId: 'participle.hecho', modality: 'written-form' }, titleUk: 'hecho', label: 'supported', reasonKey: 'unknown.reason', lastEvidenceDate: '2026-10-03', dueDate: '2026-10-04', frequency: 'repeat-more', paused: false },
    { target: { skillId: 'shop.more', modality: 'listening-meaning' }, titleUk: 'У магазині', label: 'independent', reasonKey: 'x', lastEvidenceDate: '2026-10-02', dueDate: '2026-10-05', frequency: 'usual', paused: true },
  ],
  summary: { id: ID(70), revision: 1, visitedLessons: 2, completedLessons: 1, independentTargets: 1, supportedTargets: 1, unresolvedTargets: 0, recommendedTargetIds: [{ skillId: 'participle.hecho', modality: 'written-form' }] },
};

describe('progress', () => {
  it('coverage separate from evidence, reasons/dates per target, controls, no percentage', () => {
    const html = render(createElement(ProgressContent, { view: progress, reload: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('завершено 1, відкрито 1 з 2');
    expect(visible).toContain('Остання відповідь була з підказкою');
    expect(visible).toContain('Повторювати частіше');
    expect(visible).toContain('Звичайна частота');
    expect(visible).toContain('Я це знаю');
    expect(visible).toContain('Відновити повторення');
    expect(visible).toContain('Слухання (1)');
    expect(visible).toContain('Наступна перевірка');
    expect(visible).not.toMatch(/\d\s?%/);
  });
});

const phrases: PhraseLibraryView = {
  viewsVersion: 1,
  phrases: [
    { id: ID(80), revision: 1, logicalId: 'phrase.synthetic.uno', spanish: '¿Me pone un café?', ukrainian: 'Дайте мені каву.', state: 'ready', origin: 'course', collectionIds: [ID(85), ID(86)], targets: [], practiceReady: true, archived: false },
    { id: ID(81), revision: 1, logicalId: 'phrase.synthetic.dos', spanish: 'Synthetic borrador', ukrainian: 'чернетка', state: 'draft', origin: 'spanish', collectionIds: [], targets: [], practiceReady: false, archived: false },
  ],
  collections: [
    { id: ID(85), revision: 2, name: 'Перед поїздкою', origin: 'personal', phraseIds: [ID(80), ID(81)] },
    { id: ID(86), revision: 1, name: 'У кав\'ярні', origin: 'course', phraseIds: [ID(80)] },
  ],
};

describe('phrases — library and collections', () => {
  it('library labels drafts as non-models and only ready phrases are selectable', () => {
    const html = render(createElement(PhraseLibrary, { view: phrases, onChanged: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('чернетка — не використовується як зразок відповіді');
    expect(html).toContain('<span lang="es-ES">¿Me pone un café?</span>');
    const draftRow = html.slice(html.indexOf('data-state="draft"'));
    expect(draftRow.slice(0, draftRow.indexOf('</li>'))).toContain('disabled=""');
    expect(visible).toContain('Додати фразу');
    expect(visible).toContain('Практикувати вибрані (0)');
  });

  it('collections show ready/total counts for personal and course collections', () => {
    const visible = text(render(createElement(CollectionsOverview, { view: phrases, onChanged: () => undefined })));
    expect(visible).toContain('Мої добірки');
    expect(visible).toContain('Добірки курсу');
    expect(visible).toContain('готових: 1 з 2');
  });

  it('phrase detail: memberships, course membership note, honest disabled archive', () => {
    const html = render(createElement(PhraseDetail, { phrase: phrases.phrases[0] as PhraseLibraryView['phrases'][number], view: phrases, onChanged: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('Перед поїздкою');
    expect(visible).toContain('Також у добірках курсу');
    expect(visible).toContain('Архівування поки недоступне');
    expect(html).toMatch(/disabled=""[^>]*aria-describedby="archive-unavailable"|aria-describedby="archive-unavailable"[^>]*disabled=""/);
  });
});

const materials: MaterialsView['materials'] = [
  {
    materialId: 'material.synthetic',
    revisionId: ID(100),
    revision: 1,
    titleUk: 'Синтетична таблиця',
    state: 'ready',
    origin: 'course',
    blocks: [
      { type: 'table', language: 'es-ES', columns: ['infinitivo', 'participio'], rows: [['hacer', 'hecho'], ['decir']] },
      { type: 'practice-link', labelUk: 'Потренувати', targets: [{ skillId: 'participle.hecho', modality: 'written-form' }], mode: 'written', maxItems: 5 },
    ],
    linkedTargets: [],
  },
  {
    materialId: 'material.synthetic',
    revisionId: ID(101),
    revision: 2,
    titleUk: 'Синтетична таблиця (зміна)',
    state: 'draft',
    origin: 'personal',
    blocks: [{ type: 'paragraph', language: 'uk', text: '<img src=x onerror="window.__sllXss=1"><script>window.__sllXss=1</script>' }],
    linkedTargets: [],
  },
];

describe('materials and typed blocks', () => {
  it('reader shows the active reviewed revision by default with an explicit draft switch', () => {
    const html = render(createElement(MaterialReader, { revisions: materials, onBack: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('Синтетична таблиця');
    expect(visible).toContain('Переглянути чернетку зміни (версія 2)');
    expect(html).toContain('<table class="block-table" lang="es-ES">');
    expect(html.match(/<td>/g)).toHaveLength(4); // the short row is padded to the column count
  });

  it('a draft revision is labelled and its practice links are disabled', () => {
    const html = render(createElement(MaterialReader, { revisions: [materials[1] as MaterialsView['materials'][number]], onBack: () => undefined }));
    expect(text(html)).toContain('Чернетка: ще не перевірено');
  });

  it('markup inside content is escaped text, never elements', () => {
    const html = render(createElement(Blocks, { blocks: materials[1]?.blocks ?? [] }));
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;img src=x onerror=');
  });

  it('unknown block types render an unsupported notice instead of their data', () => {
    const html = render(createElement(Blocks, { blocks: [{ type: 'html', html: '<b>x</b>' } as never] }));
    expect(text(html)).toContain('Цей тип блоку не підтримується');
    expect(html).not.toContain('<b>');
  });
});

describe('settings, agents and recovery', () => {
  const profile: OwnerProfile = { id: ID(1), revision: 3, profileEpoch: 1, reviewTimezone: 'Europe/Madrid', audioSpeed: 0.85, theme: 'system' };

  it('settings: timezone preview flow entry, audio speed, theme and Ukrainian locale', () => {
    const html = render(createElement(SettingsContent, { profile, reload: () => undefined }));
    const visible = text(html);
    expect(visible).toContain('Зараз: Europe/Madrid');
    expect(visible).toContain('Переглянути зміну');
    expect(visible).toContain('Повільніша (0,85×)');
    expect(visible).toContain('Як у системі');
    expect(visible).toContain('Українська');
    expect(html.match(/type="radio"[^>]*checked=""|checked=""[^>]*type="radio"/g)).toHaveLength(2);
  });

  it('recovery lists unsaved local drafts with copy/export', async () => {
    const outbox = new OutboxStore(false);
    await outbox.put({
      operationId: ID(110),
      epoch: 1,
      contextId: ID(111),
      draftId: ID(112),
      taskRevisionId: ID(113),
      baseRevision: 1,
      text: 'Texto no guardado',
      cursor: 3,
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z',
      title: 'Synthetic task',
      state: 'conflict',
    });
    const html = render(createElement(RecoveryScreen), { outbox });
    const visible = text(html);
    expect(visible).toContain('Експорт даних');
    expect(visible).toContain('Відновлення з архіву');
    expect(html).toContain('<pre class="draft-text" lang="es-ES">Texto no guardado</pre>');
    expect(visible).toContain('конфлікт — збережена версія новіша');
    expect(visible).toContain('Копіювати все');
  });
});

describe('contextual help', () => {
  it('? is a labelled button with a hidden panel explaining what/how and support status', () => {
    const html = render(createElement(HelpButton, { topic: 'exercise.reference' }));
    expect(html).toContain('aria-label="Довідка: Довідка до завдання"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/<div[^>]*hidden=""/);
    expect(text(html)).toContain('Це мовна підтримка');
    const neutral = render(createElement(HelpButton, { topic: 'home.review' }));
    expect(text(neutral)).toContain('не вважається мовною підтримкою');
  });
});
