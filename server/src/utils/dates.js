/**
 * Date helpers. All expense dates are stored as UTC midnight of the
 * calendar day the user picked, so month/day boundaries are computed in UTC.
 */

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentMonth(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Returns `[start, end)` for a `YYYY-MM` string. */
export function monthRange(month) {
  const [year, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1));
  const end = new Date(Date.UTC(year, m, 1));
  return { start, end };
}

/** Start of the given `YYYY-MM-DD` day in UTC. */
export function startOfDay(value) {
  const d = new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Start of the day *after* the given `YYYY-MM-DD` (exclusive upper bound). */
export function endOfDayExclusive(value) {
  const start = startOfDay(value);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}
