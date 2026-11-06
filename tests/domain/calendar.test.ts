import { describe, expect, it } from 'vitest';
import {
  addDays,
  compareDates,
  dayNumber,
  diffDays,
  fromDayNumber,
  isCalendarDate,
  isValidTimeZone,
  isoWeekId,
  localDate,
  manualClock,
  maxDate,
  minDate,
  parseInstant,
} from '@sll/domain';

describe('calendar', () => {
  it('derives local dates in an explicit IANA zone across the Madrid DST change (25 h day)', () => {
    expect(localDate('2026-10-24T21:59:59Z', 'Europe/Madrid')).toBe('2026-10-24');
    expect(localDate('2026-10-24T22:00:00Z', 'Europe/Madrid')).toBe('2026-10-25'); // 00:00 CEST
    expect(localDate('2026-10-25T22:59:59Z', 'Europe/Madrid')).toBe('2026-10-25'); // 23:59:59 CET
    expect(localDate('2026-10-25T23:00:00Z', 'Europe/Madrid')).toBe('2026-10-26');
    expect(localDate('2026-03-29T00:30:00Z', 'Europe/Madrid')).toBe('2026-03-29'); // 23 h spring day
    expect(localDate('2026-10-01T08:00:00+02:00', 'Europe/Madrid')).toBe('2026-10-01');
    expect(localDate('2026-10-01T23:30:00Z', 'America/New_York')).toBe('2026-10-01');
  });

  it('does calendar arithmetic, not 86,400-second arithmetic', () => {
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2027-01-10', 30)).toBe('2027-02-09');
    expect(addDays('2026-10-05', -5)).toBe('2026-09-30');
    expect(diffDays('2026-10-02', '2026-10-12')).toBe(10);
    expect(diffDays('2026-10-12', '2026-10-02')).toBe(-10);
    expect(dayNumber('1970-01-01')).toBe(0);
    expect(fromDayNumber(dayNumber('2026-10-25'))).toBe('2026-10-25');
    expect(compareDates('2026-10-02', '2026-10-12')).toBe(-1);
    expect(minDate('2026-10-02', '2026-10-12')).toBe('2026-10-02');
    expect(maxDate('2026-10-02', '2026-10-12')).toBe('2026-10-12');
    expect(() => addDays('2026-10-02', 1.5)).toThrow(/integer/);
  });

  it('validates dates, instants and zones', () => {
    expect(isCalendarDate('2026-02-28')).toBe(true);
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('2026-2-3')).toBe(false);
    expect(() => parseInstant('2026-10-01 08:00')).toThrow(/instant/);
    expect(() => parseInstant('2026-10-01T08:00:00')).toThrow(/instant/); // no offset: ambiguous
    expect(isValidTimeZone('Europe/Madrid')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(() => localDate('2026-10-01T08:00:00Z', 'Mars/Olympus')).toThrow(/timezone/);
  });

  it('computes ISO week ids', () => {
    expect(isoWeekId('2026-10-01')).toBe('2026-W40');
    expect(isoWeekId('2026-01-01')).toBe('2026-W01');
    expect(isoWeekId('2027-01-01')).toBe('2026-W53');
    expect(isoWeekId('2024-12-30')).toBe('2025-W01');
    expect(isoWeekId('2021-01-03')).toBe('2020-W53');
  });

  it('provides an injected manual clock', () => {
    const clock = manualClock('2026-10-01T08:00:00Z');
    expect(clock.now()).toBe('2026-10-01T08:00:00Z');
    clock.set('2026-10-02T08:00:00Z');
    expect(clock.now()).toBe('2026-10-02T08:00:00Z');
    expect(() => clock.set('tomorrow')).toThrow();
  });
});
