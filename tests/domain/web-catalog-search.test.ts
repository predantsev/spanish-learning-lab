import { describe, expect, it } from 'vitest';
import {
  foldForSearch,
  searchCatalog,
  skillAliasTokens,
  type SearchableEntry,
} from '../../apps/web/src/lib/catalogSearch.ts';

// Synthetic catalog rows (not reviewed course content).
const entries: SearchableEntry[] = [
  {
    id: 'A2-03-L1',
    titleUk: 'Минулий час: утворення',
    termEs: 'pretérito perfecto',
    blockId: 'A2-03',
    situationIds: ['past-accounts'],
    targets: [{ skillId: 'perfecto.haber-forms', modality: 'written-form' }],
  },
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
  },
  {
    id: 'A1-02-L1',
    titleUk: 'Звуки та наголос',
    termEs: 'acentuación',
    blockId: 'A1-02',
    situationIds: ['shop'],
    targets: [{ skillId: 'ortho.accent', modality: 'written-form' }],
  },
];

describe('catalog search (search-only accent folding)', () => {
  it('folds accents, ñ and case for search keys', () => {
    expect(foldForSearch('Acentuación')).toBe('acentuacion');
    expect(foldForSearch('niño')).toBe('nino');
    expect(foldForSearch('  Dieprikmetnyk ’x  ')).toBe("dieprikmetnyk 'x");
  });

  it('derives alias words from skill ids', () => {
    expect(skillAliasTokens('participle.ido-accent')).toEqual(['participle', 'ido', 'accent']);
  });

  it('typing "hecho" finds the participle lesson through its target alias', () => {
    const result = searchCatalog(entries, 'hecho');
    expect(result.map((entry) => entry.id)).toEqual(['A2-03-L2']);
  });

  it('matching is accent-insensitive in both directions', () => {
    expect(searchCatalog(entries, 'acentuacion').map((e) => e.id)).toEqual(['A1-02-L1']);
    expect(searchCatalog(entries, 'PRETERITO').map((e) => e.id)).toEqual(['A2-03-L1']);
    expect(searchCatalog(entries, 'héchó').map((e) => e.id)).toEqual(['A2-03-L2']);
  });

  it('matches Ukrainian titles by word prefix', () => {
    expect(searchCatalog(entries, 'дієприк').map((e) => e.id)).toEqual(['A2-03-L2']);
  });

  it('requires every query word (AND) and ranks title/term over aliases', () => {
    expect(searchCatalog(entries, 'participios hecho').map((e) => e.id)).toEqual(['A2-03-L2']);
    expect(searchCatalog(entries, 'participios zzz')).toEqual([]);
  });

  it('uses explicit aliases supplied as data', () => {
    const result = searchCatalog(entries, 'причастя', { 'participle.hecho': ['причастя'] });
    expect(result.map((e) => e.id)).toEqual(['A2-03-L2']);
  });

  it('empty query returns all entries in their original order', () => {
    expect(searchCatalog(entries, '   ').map((e) => e.id)).toEqual(['A2-03-L1', 'A2-03-L2', 'A1-02-L1']);
  });

  it('no results for unknown text', () => {
    expect(searchCatalog(entries, 'xyzzy')).toEqual([]);
  });
});
