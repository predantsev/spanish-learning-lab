// Locale registry. Adding an interface locale is data-only: add `locales/<code>.json` with the same
// keys and one entry below. A locale stays `draft` (not selectable) until completeness and
// linguistic review gates pass (IMPLEMENTATION-PLAN D-027). Course text never lives here: lessons,
// hints and feedback come from content data with their own language fields.
import uk from '../locales/uk.json' with { type: 'json' };

export type LocaleStatus = 'complete' | 'draft';

export interface LocaleDefinition {
  /** BCP 47 tag used for <html lang> and Intl formatting. */
  readonly code: string;
  readonly dir: 'ltr' | 'rtl';
  readonly status: LocaleStatus;
  /** i18next resource tree; its `meta.nativeName` is the name shown in Settings. */
  readonly resources: Readonly<Record<string, unknown>>;
}

export const LOCALES: Readonly<Record<string, LocaleDefinition>> = {
  uk: { code: 'uk', dir: 'ltr', status: 'complete', resources: uk },
};

export const DEFAULT_LOCALE = 'uk';

/** Spanish learning content is always Spain Spanish (C-030/C-031). */
export const TARGET_LANGUAGE = 'es-ES';

export function selectableLocales(): LocaleDefinition[] {
  return Object.values(LOCALES).filter((locale) => locale.status === 'complete');
}

export function getLocale(code: string): LocaleDefinition {
  const locale = LOCALES[code] ?? LOCALES[DEFAULT_LOCALE];
  if (!locale) throw new Error('No default locale registered');
  return locale;
}

export function nativeName(locale: LocaleDefinition): string {
  const meta = locale.resources['meta'];
  if (meta && typeof meta === 'object' && 'nativeName' in meta) {
    const value = (meta as { nativeName?: unknown }).nativeName;
    if (typeof value === 'string') return value;
  }
  return locale.code;
}
