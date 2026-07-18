const STORAGE_KEY = "primelife:checkin-dismissed-date";

/**
 * Tracks whether today's Daily Check-In has been dismissed (F2-AC3): once
 * dismissed, it must not auto-relaunch again the same local day, but stays
 * reachable via a manual "Check in" control on Home. This is UI session
 * state, not app data, so it deliberately lives in localStorage rather than
 * the Dexie schema (which PRD Section 8 fixes exactly, with no new fields)
 * and outside the data-access layer's C6 seam (which governs IndexedDB
 * writes, not this).
 */

export function getDismissedDate(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setDismissedDate(date: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, date);
}

export function isDismissedToday(today: string): boolean {
  return getDismissedDate() === today;
}
