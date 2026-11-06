// Reviewed Ukrainian names of blocks, everyday situations and skills from GET /views/catalog-meta
// (content data, read once per tab). They label catalog groups, situation filters and targets, and
// feed catalog search as explicit aliases. When the read fails, ids are shown instead (honest
// fallback; nothing is invented).
import { useEffect, useState } from 'react';
import type { ApiClient } from '../api/client.ts';
import type { CatalogMetaView, Target } from '../api/types.ts';
import type { AliasTable, SearchableEntry } from '../lib/catalogSearch.ts';
import { useApp } from './context.tsx';

export interface Titles {
  readonly blocks: ReadonlyMap<string, string>;
  readonly blockTerms: ReadonlyMap<string, string>;
  readonly situations: ReadonlyMap<string, string>;
  readonly skills: ReadonlyMap<string, { readonly titleUk: string; readonly termEs: string }>;
}

export const EMPTY_TITLES: Titles = { blocks: new Map(), blockTerms: new Map(), situations: new Map(), skills: new Map() };

export function titlesFromMeta(meta: CatalogMetaView): Titles {
  return {
    blocks: new Map(meta.blocks.map((block) => [block.blockId, block.titleUk])),
    blockTerms: new Map(meta.blocks.map((block) => [block.blockId, block.termEs])),
    situations: new Map(meta.situations.map((situation) => [situation.id, situation.titleUk])),
    skills: new Map(meta.skills.map((skill) => [skill.skillId, { titleUk: skill.titleUk, termEs: skill.termEs }])),
  };
}

/** Ukrainian title of a target's skill (the modality is labelled separately). */
export function targetTitle(titles: Titles, target: Target): string | undefined {
  return titles.skills.get(target.skillId)?.titleUk;
}

/**
 * Explicit search aliases from content data: every skill's Ukrainian title and Spanish term (keyed by
 * skill id), plus each entry's situation and block names (keyed by entry id).
 */
export function catalogAliases(entries: readonly SearchableEntry[], titles: Titles): AliasTable {
  const table: Record<string, string[]> = {};
  for (const [skillId, skill] of titles.skills) table[skillId] = [skill.titleUk, skill.termEs].filter((value) => value.length > 0);
  for (const entry of entries) {
    const words: string[] = [];
    for (const situationId of entry.situationIds) {
      const name = titles.situations.get(situationId);
      if (name) words.push(name);
    }
    const block = titles.blocks.get(entry.blockId);
    if (block) words.push(block);
    const blockTerm = titles.blockTerms.get(entry.blockId);
    if (blockTerm) words.push(blockTerm);
    if (words.length > 0) table[entry.id] = words;
  }
  return table;
}

let cache: Promise<Titles> | null = null;

function loadTitles(api: ApiClient): Promise<Titles> {
  if (!cache) {
    cache = api
      .get<CatalogMetaView>('/views/catalog-meta')
      .then((envelope) => titlesFromMeta(envelope.data))
      .catch(() => {
        cache = null;
        return EMPTY_TITLES;
      });
  }
  return cache;
}

export function useTitles(): Titles {
  const { api } = useApp();
  const [titles, setTitles] = useState<Titles>(EMPTY_TITLES);
  useEffect(() => {
    let active = true;
    void loadTitles(api).then((value) => {
      if (active) setTitles(value);
    });
    return () => {
      active = false;
    };
  }, [api]);
  return titles;
}
