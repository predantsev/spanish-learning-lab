// Local calendar dates in the profile's IANA timezone (DOMAIN-SPEC: calendar days, not 86 400 s multiples).
export const DEFAULT_TIMEZONE = 'Europe/Madrid';

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
    formatters.set(timeZone, f);
  }
  return f;
}

/** YYYY-MM-DD of `at` in `timeZone`; an invalid zone falls back to Europe/Madrid. */
export function localDate(at: Date, timeZone: string): string {
  let f: Intl.DateTimeFormat;
  try {
    f = formatterFor(timeZone);
  } catch {
    f = formatterFor(DEFAULT_TIMEZONE);
  }
  const parts = f.formatToParts(at);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** ISO-8601 week label (e.g. 2026-W45) of a local calendar date. */
export function isoWeek(date: string): string {
  const [y, m, d] = date.split('-').map((v) => Number(v));
  if (!y || !m || !d) throw new Error(`invalid local date ${date}`);
  const day = Date.UTC(y, m - 1, d);
  const dow = (new Date(day).getUTCDay() + 6) % 7; // Monday = 0
  const thursday = new Date(day + (3 - dow) * 86_400_000);
  const isoYear = thursday.getUTCFullYear();
  const week = 1 + Math.floor((thursday.getTime() - Date.UTC(isoYear, 0, 1)) / (7 * 86_400_000));
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}
