import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, getLocale } from './registry.ts';

/**
 * Creates the i18next instance for the interface locale. Every visible interface string is a key
 * in `locales/<code>.json`; missing keys are reported in development and never silently replaced by
 * component text.
 */
export async function createI18n(code: string = DEFAULT_LOCALE): Promise<I18n> {
  const locale = getLocale(code);
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: locale.code,
    fallbackLng: false,
    supportedLngs: [locale.code],
    resources: { [locale.code]: { translation: locale.resources } },
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    saveMissing: false,
    initAsync: false,
  });
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale.code;
    document.documentElement.dir = locale.dir;
  }
  return instance;
}
