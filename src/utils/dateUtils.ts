/**
 * Safe local calendar date and time utilities.
 * Ensures consistent local timezone semantics across the app,
 * preventing UTC date-boundary shifts around midnight.
 */

/**
 * Format a Date object to YYYY-MM-DD in local time.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's calendar date as YYYY-MM-DD in local time.
 */
export function getTodayDateString(): string {
  return formatLocalDate(new Date());
}

/**
 * Get tomorrow's calendar date as YYYY-MM-DD in local time.
 */
export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

/**
 * Get yesterday's calendar date as YYYY-MM-DD in local time.
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
}

/**
 * Parse a YYYY-MM-DD string into a local Date object (local midnight 00:00:00).
 * Avoids UTC parsing issues where new Date('YYYY-MM-DD') parses as UTC midnight.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 0, 0, 0, 0);
    }
  }
  return new Date(dateStr);
}

/**
 * Add or subtract days from a YYYY-MM-DD date string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/**
 * Check if a string is a valid YYYY-MM-DD date string.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const testDate = new Date(y, m - 1, d);
  return (
    testDate.getFullYear() === y &&
    testDate.getMonth() === m - 1 &&
    testDate.getDate() === d
  );
}

/**
 * Returns the day of week (0=Sunday, 1=Monday, ..., 6=Saturday) for a YYYY-MM-DD string in local time.
 */
export function getDayOfWeekFromDateString(dateStr: string): number {
  return parseLocalDate(dateStr).getDay();
}

/**
 * Generates an array of YYYY-MM-DD date strings for the past N days up to and including the reference date.
 */
export function getPastNDays(count: number, referenceDate: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    days.push(formatLocalDate(d));
  }
  return days;
}

/**
 * Safe ID generator resistant to millisecond collisions.
 */
export function generateSafeId(prefix: string = ''): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${time}_${random}` : `${time}_${random}`;
}
