export type ReminderKind = "checkin" | "hydration";

const STORAGE_KEY_PREFIX = "primelife:notified:";

/**
 * Tracks whether a Web Notification has already been shown for a given
 * reminder kind on a given local day, so a reminder that stays true across
 * several `reload()`s (e.g. hydration still unmet an hour later) doesn't
 * re-fire a fresh OS notification every time. Same rationale as
 * `lib/checkInDismissal.ts`: this is disposable UI session state, not app
 * data, so it deliberately lives in localStorage, outside the Dexie schema
 * and the data-access layer's C6 seam.
 */

export function hasNotifiedToday(kind: ReminderKind, today: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${kind}`) === today;
}

export function markNotifiedToday(kind: ReminderKind, today: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${kind}`, today);
}
