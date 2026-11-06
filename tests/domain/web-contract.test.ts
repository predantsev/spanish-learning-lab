// Pure helpers added for the #111 contract follow-up: catalog-meta titles and search aliases,
// phrase practice targets, lesson-progress identity, content state tones, unresolved results.
import { describe, expect, it } from 'vitest';
import type { AttemptResultView, CatalogEntry, CatalogMetaView, LessonView, PhraseLibraryView } from '../../apps/web/src/api/types.ts';
import { catalogAliases, EMPTY_TITLES, targetTitle, titlesFromMeta } from '../../apps/web/src/app/titles.ts';
import { stateTone } from '../../apps/web/src/components/Common.tsx';
import { searchCatalog } from '../../apps/web/src/lib/catalogSearch.ts';
import { isUnresolved } from '../../apps/web/src/screens/exercise/ResultPanel.tsx';
import { progressRefOf } from '../../apps/web/src/screens/Lesson.tsx';
import { isPracticeReady, practiceTargetsOf } from '../../apps/web/src/screens/Phrases.tsx';

type Phrase = PhraseLibraryView['phrases'][number];

// Synthetic data (not reviewed course content).
const meta: CatalogMetaView = {
  viewsVersion: 1,
  blocks: [{ blockId: 'A2-03', titleUk: 'Минулий час', termEs: 'pretérito perfecto' }],
  situations: [{ id: 'home', titleUk: 'Вдома' }, { id: 'shop', titleUk: 'У магазині' }],
  skills: [
    { skillId: 'participle.dicho', titleUk: 'Дієприкметник від decir', termEs: 'dicho' },
    { skillId: 'ortho.accent', titleUk: 'Наголос', termEs: 'tilde' },
  ],
};

const entries: CatalogEntry[] = [
  { id: 'A2-03-L2', titleUk: 'Неправильні дієприкметники', termEs: 'participios irregulares', blockId: 'A2-03', situationIds: ['home'], targets: [{ skillId: 'participle.dicho', modality: 'written-form' }], state: 'ready' },
  { id: 'A1-02-L1', titleUk: 'Звуки', termEs: 'sonidos', blockId: 'A1-02', situationIds: ['shop'], targets: [{ skillId: 'ortho.accent', modality: 'written-form' }], state: 'ready' },
];

const phrase = (overrides: Partial<Phrase>): Phrase => ({
  id: '00000000-0000-4000-8000-000000000001',
  revision: 1,
  logicalId: 'phrase.synthetic',
  spanish: 'Hola',
  ukrainian: 'Привіт',
  state: 'ready',
  origin: 'course',
  collectionIds: [],
  targets: [{ skillId: 'phrase.synthetic', modality: 'phrase-recall' }],
  practiceReady: true,
  archived: false,
  ...overrides,
});

describe('catalog-meta titles', () => {
  it('maps blocks, situations and skills; unknown skills have no title (id shown instead)', () => {
    const titles = titlesFromMeta(meta);
    expect(titles.blocks.get('A2-03')).toBe('Минулий час');
    expect(titles.situations.get('shop')).toBe('У магазині');
    expect(targetTitle(titles, { skillId: 'participle.dicho', modality: 'written-form' })).toBe('Дієприкметник від decir');
    expect(targetTitle(titles, { skillId: 'unknown', modality: 'written-form' })).toBeUndefined();
    expect(targetTitle(EMPTY_TITLES, { skillId: 'participle.dicho', modality: 'written-form' })).toBeUndefined();
  });

  it('feeds search with explicit aliases: situation names, skill titles/terms and block terms', () => {
    const aliases = catalogAliases(entries, titlesFromMeta(meta));
    expect(searchCatalog(entries, 'вдома', aliases).map((entry) => entry.id)).toEqual(['A2-03-L2']);
    expect(searchCatalog(entries, 'магазин', aliases).map((entry) => entry.id)).toEqual(['A1-02-L1']);
    expect(searchCatalog(entries, 'tilde', aliases).map((entry) => entry.id)).toEqual(['A1-02-L1']);
    expect(searchCatalog(entries, 'decir', aliases).map((entry) => entry.id)).toEqual(['A2-03-L2']);
    expect(searchCatalog(entries, 'perfecto', aliases).map((entry) => entry.id)).toEqual(['A2-03-L2']);
    // Without catalog-meta, skill-id slugs still work as aliases.
    expect(searchCatalog(entries, 'dicho').map((entry) => entry.id)).toEqual(['A2-03-L2']);
  });
});

describe('phrase practice targets', () => {
  it('uses the phrase-recall targets carried by the view, de-duplicated', () => {
    const a = phrase({ id: 'a', targets: [{ skillId: 'phrase.a', modality: 'phrase-recall' }] });
    const b = phrase({ id: 'b', targets: [{ skillId: 'phrase.a', modality: 'phrase-recall' }, { skillId: 'phrase.b', modality: 'phrase-recall' }] });
    expect(practiceTargetsOf([a, b])).toEqual([
      { skillId: 'phrase.a', modality: 'phrase-recall' },
      { skillId: 'phrase.b', modality: 'phrase-recall' },
    ]);
  });

  it('caps the targets at the command limit of 30', () => {
    const many = Array.from({ length: 40 }, (_, index) => phrase({ id: String(index), targets: [{ skillId: `phrase.${index}`, modality: 'phrase-recall' }] }));
    expect(practiceTargetsOf(many)).toHaveLength(30);
  });

  it('a phrase is selectable only when ready, not archived, not a draft and with targets', () => {
    expect(isPracticeReady(phrase({}))).toBe(true);
    expect(isPracticeReady(phrase({ targets: [] }))).toBe(false);
    expect(isPracticeReady(phrase({ archived: true }))).toBe(false);
    expect(isPracticeReady(phrase({ state: 'draft', practiceReady: false }))).toBe(false);
    expect(isPracticeReady(phrase({ practiceReady: false }))).toBe(false);
  });
});

describe('lesson-progress identity', () => {
  it('uses the record id/revision from LessonView.progress, or none before the first write', () => {
    const progress: LessonView['progress'] = { status: 'visited', visitedStepIds: ['s1'], id: '00000000-0000-4000-8000-0000000000aa', revision: 3 };
    expect(progressRefOf(progress)).toEqual({ id: '00000000-0000-4000-8000-0000000000aa', revision: 3 });
    expect(progressRefOf({ status: 'not-started', visitedStepIds: [] })).toBeNull();
  });
});

describe('content state tones', () => {
  it('only ready is ready; reviewed is pending local validation', () => {
    expect(stateTone('ready')).toBe('ready');
    expect(stateTone('reviewed')).toBe('pending');
    expect(stateTone('draft')).toBe('draft');
    expect(stateTone('needs-review')).toBe('draft');
    expect(stateTone('quarantined')).toBe('blocked');
    expect(stateTone('retired')).toBe('blocked');
  });
});

describe('attempt result', () => {
  const base: AttemptResultView = {
    viewsVersion: 1,
    attemptId: '00000000-0000-4000-8000-0000000000bb',
    taskRevisionId: '00000000-0000-4000-8000-0000000000cc',
    status: 'checked',
    originalAnswer: 'x',
    verdicts: [{ target: { skillId: 's', modality: 'written-form' }, titleUk: 'S', correctness: 'correct', independence: 'independent', feedbackUk: '' }],
    feedbackUk: '',
    referenceAnswer: '',
    referenceIsExample: false,
    supportUsed: [],
    savedForReview: false,
  };

  it('is unresolved when the attempt or any target is unresolved', () => {
    expect(isUnresolved(base)).toBe(false);
    expect(isUnresolved({ ...base, status: 'unresolved' })).toBe(true);
    expect(isUnresolved({ ...base, verdicts: [{ ...(base.verdicts[0] as AttemptResultView['verdicts'][number]), correctness: 'unresolved' }] })).toBe(true);
  });
});
