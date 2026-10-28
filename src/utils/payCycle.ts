// Pay-cycle date helpers.
//
// A pay cycle starts on your payday and runs until the day before your next payday.
// All dates are plain 'YYYY-MM-DD' text (calendar dates, no time zones), so a cycle
// can never shift by a day because of time-zone maths.

const pad = (n: number) => String(n).padStart(2, '0');

const toKey = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

const parseKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
};

// month is 1-12
const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

// A payday of 31 becomes the 30th (or 28th/29th) in shorter months.
const effectivePayday = (year: number, month: number, payday: number) =>
  Math.min(payday, daysInMonth(year, month));

/** Today's date (local time) as 'YYYY-MM-DD'. */
export const todayKey = (): string => {
  const now = new Date();
  return toKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

/** The date before `key`. */
export const getDayBefore = (key: string): string => {
  const { year, month, day } = parseKey(key);
  const d = new Date(Date.UTC(year, month - 1, day - 1));
  return toKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
};

/** Start date of the pay cycle that `dateKey` falls in. */
export const getCycleStart = (dateKey: string, payday: number): string => {
  const { year, month, day } = parseKey(dateKey);
  const thisMonthsPayday = effectivePayday(year, month, payday);
  if (day >= thisMonthsPayday) {
    return toKey(year, month, thisMonthsPayday);
  }
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  return toKey(prevYear, prevMonth, effectivePayday(prevYear, prevMonth, payday));
};

/** Start date of the cycle that follows the one starting on `startKey`. */
export const getNextCycleStart = (startKey: string, payday: number): string => {
  const { year, month } = parseKey(startKey);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return toKey(nextYear, nextMonth, effectivePayday(nextYear, nextMonth, payday));
};

/** Last day of the cycle that starts on `startKey` (the day before the next payday). */
export const getCycleEnd = (startKey: string, payday: number): string =>
  getDayBefore(getNextCycleStart(startKey, payday));

/** Whole days from one date to another (negative if `toKeyStr` is earlier). */
export const daysBetween = (fromKey: string, toKeyStr: string): number => {
  const a = parseKey(fromKey);
  const b = parseKey(toKeyStr);
  const ms = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.round(ms / 86400000);
};

/** Days left in a cycle, counting today (on the last day this is 1). */
export const daysLeftInCycle = (today: string, cycleEnd: string): number =>
  Math.max(0, daysBetween(today, cycleEnd) + 1);

/** '2026-10-25' -> '25 Oct' (or '25 Oct 2026'). */
export const formatShortDate = (key: string, withYear = false): string => {
  const { year, month, day } = parseKey(key);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
};

/** '25 Oct – 24 Nov' */
export const formatCycleRange = (startKey: string, endKey: string, withYear = false): string =>
  `${formatShortDate(startKey, withYear)} – ${formatShortDate(endKey, withYear)}`;

/** 1 -> '1st', 22 -> '22nd', 25 -> '25th' */
export const ordinal = (n: number): string => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};
