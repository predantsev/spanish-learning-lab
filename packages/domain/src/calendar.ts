// Calendar-date arithmetic in the profile review timezone (DOMAIN-SPEC §Scheduler).
// Intervals are counted in local calendar days, never as multiples of 86,400 seconds:
// a 25-hour DST day (Europe/Madrid, 2026-10-25) is still exactly one calendar day.
import { DomainError } from './types.ts';
import type { CalendarDate } from './types.ts';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

/** Injected clock: the domain never reads the system time itself. */
export interface Clock {
  /** Current instant as an ISO-8601 UTC timestamp. */
  now(): string;
}

/** A clock fixed at `instant` that tests (or a replay) can move explicitly. */
export interface ManualClock extends Clock {
  set(instant: string): void;
}

export function manualClock(instant: string): ManualClock {
  parseInstant(instant);
  let current = instant;
  return {
    now: () => current,
    set(next) {
      parseInstant(next);
      current = next;
    },
  };
}

/** Milliseconds since the epoch for an ISO-8601 instant with an explicit offset (`Z` or `±hh:mm`). */
export function parseInstant(instant: string): number {
  const ms = INSTANT_RE.test(instant) ? Date.parse(instant) : Number.NaN;
  if (!Number.isFinite(ms)) throw new DomainError('invalid-instant', `invalid instant ${JSON.stringify(instant)}`);
  return ms;
}

// Days-from-civil / civil-from-days (proleptic Gregorian), so date arithmetic is pure integer math.
function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = (month + 9) % 12;
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(days: number): { year: number; month: number; day: number } {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

function formatDate(year: number, month: number, day: number): CalendarDate {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

export function isCalendarDate(value: unknown): value is CalendarDate {
  if (typeof value !== 'string') return false;
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const back = civilFromDays(daysFromCivil(y, mo, d));
  return back.year === y && back.month === mo && back.day === d;
}

/** Day number (days since 1970-01-01) of a calendar date. */
export function dayNumber(date: CalendarDate): number {
  if (!isCalendarDate(date)) throw new DomainError('invalid-date', `invalid calendar date ${JSON.stringify(date)}`);
  const m = DATE_RE.exec(date)!;
  return daysFromCivil(Number(m[1]), Number(m[2]), Number(m[3]));
}

export function fromDayNumber(days: number): CalendarDate {
  if (!Number.isSafeInteger(days)) throw new DomainError('invalid-date', `invalid day number ${days}`);
  const { year, month, day } = civilFromDays(days);
  return formatDate(year, month, day);
}

/** Calendar arithmetic: `date + n` local days. */
export function addDays(date: CalendarDate, n: number): CalendarDate {
  if (!Number.isSafeInteger(n)) throw new DomainError('invalid-days', `day offset must be an integer, got ${n}`);
  return fromDayNumber(dayNumber(date) + n);
}

/** Signed number of calendar days from `from` to `to`. */
export function diffDays(from: CalendarDate, to: CalendarDate): number {
  return dayNumber(to) - dayNumber(from);
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return Math.sign(dayNumber(a) - dayNumber(b));
}

export function minDate(a: CalendarDate, b: CalendarDate): CalendarDate {
  return compareDates(a, b) <= 0 ? a : b;
}

export function maxDate(a: CalendarDate, b: CalendarDate): CalendarDate {
  return compareDates(a, b) >= 0 ? a : b;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(zone: string): Intl.DateTimeFormat {
  let f = formatters.get(zone);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        calendar: 'iso8601',
        numberingSystem: 'latn',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      throw new DomainError('invalid-timezone', `invalid IANA timezone ${JSON.stringify(zone)}`);
    }
    formatters.set(zone, f);
  }
  return f;
}

export function isValidTimeZone(zone: unknown): zone is string {
  if (typeof zone !== 'string' || zone.length === 0) return false;
  try {
    formatterFor(zone);
    return true;
  } catch {
    return false;
  }
}

/** Local calendar date of a UTC instant in an explicit IANA zone (never the OS zone). */
export function localDate(instant: string, zone: string): CalendarDate {
  const ms = parseInstant(instant);
  let year = 0;
  let month = 0;
  let day = 0;
  for (const part of formatterFor(zone).formatToParts(ms)) {
    if (part.type === 'year') year = Number(part.value);
    else if (part.type === 'month') month = Number(part.value);
    else if (part.type === 'day') day = Number(part.value);
  }
  const date = formatDate(year, month, day);
  if (!isCalendarDate(date)) throw new DomainError('invalid-date', `cannot format ${instant} in ${zone}`);
  return date;
}

/** ISO-8601 week id, e.g. `2026-W40` (weeks start on Monday; week 1 contains the first Thursday). */
export function isoWeekId(date: CalendarDate): string {
  const n = dayNumber(date);
  const isoWeekday = ((((n + 3) % 7) + 7) % 7) + 1; // 1970-01-01 was a Thursday (4)
  const thursday = n - (isoWeekday - 1) + 3;
  const isoYear = civilFromDays(thursday).year;
  const week = Math.floor((thursday - daysFromCivil(isoYear, 1, 1)) / 7) + 1;
  return `${pad(isoYear, 4)}-W${pad(week, 2)}`;
}
