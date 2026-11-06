// Ukrainian titles for blocks and targets, taken from the progress read model (content data).
// TODO(contract): CatalogEntry/ExerciseTask/Verdict carry only skill ids; the reviewed target title
// is exposed only by ProgressView.targets (and possibly only for introduced targets). Until a view
// carries titles directly, unknown targets fall back to their stable skill id.
import { useEffect, useState } from 'react';
import type { ApiClient } from '../api/client.ts';
import type { ProgressView } from '../api/types.ts';
import { useApp } from './context.tsx';

export interface Titles {
  readonly blocks: ReadonlyMap<string, string>;
  readonly targets: ReadonlyMap<string, string>;
}

const EMPTY: Titles = { blocks: new Map(), targets: new Map() };
let cache: Promise<Titles> | null = null;

function loadTitles(api: ApiClient): Promise<Titles> {
  if (!cache) {
    cache = api
      .get<ProgressView>('/views/progress')
      .then((envelope) => {
        const blocks = new Map<string, string>();
        const targets = new Map<string, string>();
        for (const block of envelope.data.blocks) blocks.set(block.blockId, block.titleUk);
        for (const row of envelope.data.targets) targets.set(`${row.target.skillId}/${row.target.modality}`, row.titleUk);
        return { blocks, targets };
      })
      .catch(() => {
        cache = null;
        return EMPTY;
      });
  }
  return cache;
}

/** Drops cached titles (e.g. after a content or profile change). */
export function invalidateTitles(): void {
  cache = null;
}

export function useTitles(): Titles {
  const { api } = useApp();
  const [titles, setTitles] = useState<Titles>(EMPTY);
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
