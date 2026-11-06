// uk.json completeness for the web UI: every literal locale key used in apps/web/src exists, every
// dynamic key family is complete for its contract enum, every `?` help topic has title + what, and
// no Ukrainian interface text is hard-coded in components.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../apps/web/src/', import.meta.url));
const uk = JSON.parse(readFileSync(join(root, 'locales/uk.json'), 'utf8')) as Record<string, unknown>;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === 'locales' || name === 'dev') continue;
      out.push(...sourceFiles(path));
    } else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts')) {
      out.push(path);
    }
  }
  return out;
}

function lookup(key: string): unknown {
  let node: unknown = uk;
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

const UK_PLURALS = ['one', 'few', 'many', 'other'] as const;

/** A key exists as a string, or as a complete set of Ukrainian plural forms. */
function hasKey(key: string): boolean {
  if (typeof lookup(key) === 'string' && (lookup(key) as string).length > 0) return true;
  return UK_PLURALS.every((form) => typeof lookup(`${key}_${form}`) === 'string');
}

const files = sourceFiles(root);
const sources = new Map(files.map((file) => [relative(root, file), readFileSync(file, 'utf8')]));

// Command kinds and other dotted identifiers that are not locale keys.
const NOT_LOCALE_KEYS = new Set([
  'session.start',
  'session.finish',
  'lesson.progress',
  'context.open',
  'context.activity',
  'context.close',
  'draft.save',
  'attempt.submit',
  'support.observe',
  'support.prepare',
  'support.request',
  'support.confirm',
  'support.cancel',
  'practice.create',
  'phrase.capture',
  'material.draft',
  'collection.create',
  'collection.patch',
  'preference.set',
  'review.submit',
  'review.validate',
  'content.promote',
  'profile.timezone-preview',
  'profile.settings',
  'audio.replay',
]);

const TOP_LEVEL = new Set(Object.keys(uk));

function literalKeys(): Map<string, string> {
  const found = new Map<string, string>();
  // Strings passed as `topic="…"` / `help="…"` are help topics, checked separately under `help.`.
  const pattern = /(?<!(?:topic|help)=)['"]([a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9_-]+)+)['"]/g;
  for (const [file, text] of sources) {
    for (const match of text.matchAll(pattern)) {
      const key = match[1] as string;
      const top = key.split('.')[0] as string;
      if (!TOP_LEVEL.has(top) || NOT_LOCALE_KEYS.has(key) || key.endsWith('.ts') || key.endsWith('.tsx') || key.endsWith('.json')) continue;
      found.set(key, file);
    }
  }
  return found;
}

function helpTopics(): Map<string, string> {
  const found = new Map<string, string>();
  for (const [file, text] of sources) {
    for (const match of text.matchAll(/(?:topic|help)="([^"]+)"/g)) found.set(match[1] as string, file);
  }
  return found;
}

describe('uk.json completeness', () => {
  it('every literal locale key used in apps/web/src exists', () => {
    const missing = [...literalKeys()].filter(([key]) => !hasKey(key)).map(([key, file]) => `${key} (${file})`);
    expect(missing).toEqual([]);
  });

  it('every `?` help topic has a title and an explanation', () => {
    const topics = [...helpTopics().keys(), 'exercise.input.short', 'exercise.input.multiline', 'exercise.input.options'];
    const missing = topics.filter((topic) => !hasKey(`help.${topic}.title`) || !hasKey(`help.${topic}.what`));
    expect(missing).toEqual([]);
  });

  it('dynamic key families cover every contract value', () => {
    const families: Record<string, readonly string[]> = {
      modes: ['written', 'listening', 'mixed'],
      modalities: ['written-form', 'context-choice', 'reading-meaning', 'listening-meaning', 'dictation', 'phrase-recall', 'construction-use'],
      contentStates: ['draft', 'needs-review', 'reviewed', 'ready', 'retired', 'quarantined'],
      'lesson.kinds': ['explanation', 'examples', 'supported-practice', 'independent-practice', 'reading', 'listening', 'writing', 'summary', 'self-check'],
      'lesson.roles': ['supported', 'independent', 'delayed', 'transfer'],
      'lesson.inputs': ['options', 'short', 'multiline'],
      'lesson.status': ['not-started', 'visited', 'completed'],
      'result.correctness': ['correct', 'incorrect', 'unresolved', 'invalid-item'],
      'result.independence': ['independent', 'supported', 'unknown', 'not-assessed'],
      'result.supportKinds': ['rule', 'targeted-clue', 'translation', 'transcript', 'reveal', 'external-help', 'delivery-unknown'],
      'exercise.hints': ['rule', 'targeted-clue', 'translation', 'transcript', 'reveal'],
      'exercise.hintEffect': ['rule', 'targeted-clue', 'translation', 'transcript', 'reveal'],
      'listening.player.state': ['idle', 'playing', 'paused', 'ended', 'error'],
      'listeningList.levels': ['phrase', 'sentence', 'text'],
      'progress.labels': ['stable', 'independent', 'supported', 'uncertain', 'introduced'],
      'progress.groups': ['all', 'stable', 'independent', 'supported', 'uncertain', 'introduced', 'listening'],
      'progress.frequency': ['repeat-more', 'known'],
      'materials.filters': ['ready', 'pending', 'all'],
      'materials.origin': ['course', 'personal'],
      'phrases.library.filters': ['all', 'ready', 'drafts', 'archived'],
      'phrases.origin': ['course', 'spanish', 'uk-intent'],
      'phrases.collections.origin': ['course', 'personal'],
      'settings.theme': ['system', 'light', 'dark'],
      'agents.scopes': ['context:read', 'course:read', 'draft:write', 'help:write', 'practice:write', 'preference:write'],
      'agents.status': ['active', 'revoked', 'expired'],
      'recovery.local.states': ['pending', 'failed', 'conflict'],
      'home.evidence': ['introduced', 'independent', 'supported', 'uncertain', 'listening', 'stable'],
      'home.pack': ['preview', 'missing'],
    };
    const missing: string[] = [];
    for (const [prefix, values] of Object.entries(families)) {
      for (const value of values) {
        const key = `${prefix}.${value}`;
        // agents.scopes values contain ':' — stored as nested keys under the literal scope name.
        const exists = prefix === 'agents.scopes' ? typeof (lookup('agents.scopes') as Record<string, unknown>)?.[value] === 'string' : hasKey(key);
        if (!exists) missing.push(key);
      }
      if (prefix.startsWith('progress.labels')) {
        for (const value of values) if (!hasKey(`progress.labels.${value}Reason`)) missing.push(`progress.labels.${value}Reason`);
      }
    }
    for (const path of ['course', 'spanish', 'uk-intent']) {
      if (!hasKey(`phrases.add.paths.${path}.label`)) missing.push(`phrases.add.paths.${path}.label`);
      if (!hasKey(`phrases.add.paths.${path}.hint`)) missing.push(`phrases.add.paths.${path}.hint`);
    }
    expect(missing).toEqual([]);
  });

  it('no Ukrainian interface text is hard-coded in components (all visible strings are keys)', () => {
    const offenders: string[] = [];
    for (const [file, text] of sources) {
      const code = text
        .split('\n')
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .join('\n');
      if (/[Ѐ-ӿ]/.test(code)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('the locale registry exposes Ukrainian as the only selectable interface locale', async () => {
    const { selectableLocales, nativeName } = await import('../../apps/web/src/i18n/registry.ts');
    const locales = selectableLocales();
    expect(locales.map((locale) => locale.code)).toEqual(['uk']);
    expect(nativeName(locales[0] as (typeof locales)[number])).toBe('Українська');
  });
});
