/**
 * Pure ISO-calendar-date ("YYYY-MM-DD") arithmetic shared by the
 * data-access layer and the derived-logic layer. Kept dependency-free
 * (no Dexie import) so `lib/insights` stays importable without pulling in
 * IndexedDB.
 *
 * Internally uses UTC so that shifting a date by N days is never perturbed
 * by a DST transition in the host's local timezone.
 */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Today's local calendar date as "YYYY-MM-DD". */
export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** Shifts an ISO calendar date string by `deltaDays` (may be negative). */
export function shiftDate(date: string, deltaDays: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

/** Last `days` local calendar dates ending with `endDate`, oldest first. */
export function lastNDates(endDate: string, days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(shiftDate(endDate, -i));
  }
  return dates;
}
