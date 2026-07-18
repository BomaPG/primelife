import { getAllAffirmations, getAllDailyTips } from "@/lib/content/loaders";
import type { Affirmation, DailyTip } from "@/lib/content/types";
import type { ISODate } from "@/lib/db/schema";

/**
 * Deterministic daily-content selection (PRD Section 10, constraint C7).
 * The same `dayIndex` is used everywhere the daily tip or affirmation is
 * shown, so Home and Learn always agree, online or offline.
 */

const MS_PER_DAY = 86_400_000;

/** floor(localMidnightEpochMs / 86400000) for the given ISO calendar date. */
export function getDayIndex(date: ISODate): number {
  const [y, m, d] = date.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / MS_PER_DAY);
}

export function pickDailyTip(tips: DailyTip[], dayIndex: number): DailyTip | undefined {
  if (tips.length === 0) return undefined;
  return tips[dayIndex % tips.length];
}

export function pickAffirmation(
  affirmations: Affirmation[],
  dayIndex: number,
): Affirmation | undefined {
  if (affirmations.length === 0) return undefined;
  return affirmations[dayIndex % affirmations.length];
}

/** Convenience wrapper over the two pickers above, for a given date. */
export function getTodaysContent(date: ISODate): {
  dayIndex: number;
  tip: DailyTip | undefined;
  affirmation: Affirmation | undefined;
} {
  const dayIndex = getDayIndex(date);
  return {
    dayIndex,
    tip: pickDailyTip(getAllDailyTips(), dayIndex),
    affirmation: pickAffirmation(getAllAffirmations(), dayIndex),
  };
}
