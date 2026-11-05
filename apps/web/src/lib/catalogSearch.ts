// Catalog SEARCH matching only. Accent/diacritic folding lives here and is used exclusively to find
// topics by familiar names or forms (C-050/C-080). It is never applied to learner answers or drafts:
// answer checking preserves accents, ñ, ¿¡ and case rules (DOMAIN-SPEC § Checking).

export interface SearchTarget {
  readonly skillId: string;
  readonly modality: string;
}

export interface SearchableEntry {
  readonly id: string;
  readonly titleUk: string;
  readonly termEs: string;
  readonly blockId: string;
  readonly situationIds: readonly string[];
  readonly targets: readonly SearchTarget[];
}

/**
 * Optional explicit aliases keyed by entry id or skill id (e.g. data supplied by content), merged
 * with aliases derived from skill-id slugs (`participle.hecho` -> "participle", "hecho").
 */
export type AliasTable = Readonly<Record<string, readonly string[]>>;

const APOSTROPHES = /[’ʼ‘`´]/g;
const COMBINING_MARKS = /\p{M}+/gu;
const NON_WORD = /[^\p{L}\p{N}']+/gu;

/** Accent-insensitive, case-insensitive search key. SEARCH ONLY. */
export function foldForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(APOSTROPHES, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchTokens(text: string): string[] {
  return foldForSearch(text)
    .split(NON_WORD)
    .map((token) => token.replace(/^'+|'+$/g, ''))
    .filter((token) => token.length > 0);
}

/** Splits a skill id slug into searchable alias words: `participle.ido-accent` -> participle, ido, accent. */
export function skillAliasTokens(skillId: string): string[] {
  return skillId
    .split(/[._-]+/)
    .map((part) => foldForSearch(part))
    .filter((part) => part.length > 0);
}

interface IndexedEntry<T extends SearchableEntry> {
  readonly entry: T;
  readonly order: number;
  readonly titleText: string;
  readonly termText: string;
  readonly titleTokens: readonly string[];
  readonly termTokens: readonly string[];
  readonly aliasTokens: readonly string[];
  readonly metaTokens: readonly string[];
}

export function indexEntries<T extends SearchableEntry>(entries: readonly T[], aliases: AliasTable = {}): IndexedEntry<T>[] {
  return entries.map((entry, order) => {
    const alias = new Set<string>();
    for (const target of entry.targets) {
      for (const token of skillAliasTokens(target.skillId)) alias.add(token);
      for (const extra of aliases[target.skillId] ?? []) for (const token of searchTokens(extra)) alias.add(token);
    }
    for (const extra of aliases[entry.id] ?? []) for (const token of searchTokens(extra)) alias.add(token);
    const meta = new Set<string>([...searchTokens(entry.id), ...searchTokens(entry.blockId)]);
    for (const situation of entry.situationIds) for (const token of skillAliasTokens(situation)) meta.add(token);
    return {
      entry,
      order,
      titleText: foldForSearch(entry.titleUk),
      termText: foldForSearch(entry.termEs),
      titleTokens: searchTokens(entry.titleUk),
      termTokens: searchTokens(entry.termEs),
      aliasTokens: [...alias],
      metaTokens: [...meta],
    };
  });
}

function bestTokenScore(query: string, tokens: readonly string[], exact: number, prefix: number): number {
  let score = 0;
  for (const token of tokens) {
    if (token === query) return exact;
    if (token.startsWith(query)) score = Math.max(score, prefix);
  }
  return score;
}

/**
 * Returns the entries matching every word of the query (AND), ranked: exact title/term words,
 * then prefixes, then explicit/derived aliases, then ids/situations. Stable for equal scores.
 * An empty query returns all entries in their original order.
 */
export function searchCatalog<T extends SearchableEntry>(
  entries: readonly T[],
  query: string,
  aliases: AliasTable = {},
): T[] {
  const words = searchTokens(query);
  if (words.length === 0) return [...entries];
  const phrase = foldForSearch(query);
  const scored: { entry: T; score: number; order: number }[] = [];
  for (const item of indexEntries(entries, aliases)) {
    let total = 0;
    let matchedAll = true;
    for (const word of words) {
      const score = Math.max(
        bestTokenScore(word, item.termTokens, 100, 60),
        bestTokenScore(word, item.titleTokens, 90, 55),
        bestTokenScore(word, item.aliasTokens, 80, 40),
        bestTokenScore(word, item.metaTokens, 30, 20),
      );
      if (score === 0) {
        matchedAll = false;
        break;
      }
      total += score;
    }
    if (!matchedAll) continue;
    if (phrase.length > 2 && (item.titleText.includes(phrase) || item.termText.includes(phrase))) total += 50;
    scored.push({ entry: item.entry, score: total, order: item.order });
  }
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.map((item) => item.entry);
}
