import { lastNDates, shiftDate } from "@/lib/dates";
import type {
  CheckIn,
  Feeling,
  MealLog,
  SleepLog,
  SleepQuality,
  Walk,
  WaterLog,
} from "@/lib/db/schema";

/**
 * Pure derived-logic functions per PRD Section 11. Every function here takes
 * already-fetched rows in and returns a computed value out — none of them
 * import Dexie or the data-access module, so they stay unit-testable in
 * isolation (Section 11's explicit requirement) and safe to run on the
 * server, in a web worker, or in a test file with hand-built fixtures.
 *
 * Only types are imported from `lib/db/schema` (erased at compile time), so
 * this module still never touches Dexie at runtime.
 */

// ---------------------------------------------------------------------------
// Today's goals (F3-AC2)
// ---------------------------------------------------------------------------

export interface TodaysGoals {
  hydration: { met: boolean; glasses: number; target: number };
  meals: { loggedCount: number; total: 3 };
  sleep: { met: boolean };
  movement: { met: boolean };
}

export function getTodaysGoals(input: {
  waterTargetGlasses: number;
  todayWaterLog?: WaterLog;
  todayMealLogs: MealLog[];
  todaySleepLog?: SleepLog;
  todayWalks: Walk[];
}): TodaysGoals {
  const glasses = input.todayWaterLog?.glasses ?? 0;
  const loggedCount = input.todayMealLogs.filter((m) => m.done).length;
  return {
    hydration: {
      met: glasses >= input.waterTargetGlasses,
      glasses,
      target: input.waterTargetGlasses,
    },
    meals: { loggedCount, total: 3 },
    sleep: { met: Boolean(input.todaySleepLog?.hours != null || input.todaySleepLog?.quality != null) },
    movement: { met: input.todayWalks.length > 0 },
  };
}

// ---------------------------------------------------------------------------
// Streaks (F6-AC2)
// ---------------------------------------------------------------------------

/**
 * Consecutive days (ending today or yesterday) with a check-in. Preserved
 * if today has no check-in yet but yesterday had one — it only breaks once
 * a full day passes with no check-in. This grace rule is specific to the
 * check-in streak per PRD Section 11; hydration and movement streaks below
 * do not get it, since the spec states it only for check-ins.
 */
export function checkInStreak(checkins: CheckIn[], today: string): number {
  const dates = new Set(checkins.map((c) => c.date));
  const yesterday = shiftDate(today, -1);
  let anchor: string;
  if (dates.has(today)) {
    anchor = today;
  } else if (dates.has(yesterday)) {
    anchor = yesterday;
  } else {
    return 0;
  }
  let count = 0;
  let cursor = anchor;
  while (dates.has(cursor)) {
    count++;
    cursor = shiftDate(cursor, -1);
  }
  return count;
}

/** Consecutive days ending today meeting the hydration goal. */
export function hydrationStreak(
  waterLogs: WaterLog[],
  waterTargetGlasses: number,
  today: string,
): number {
  const glassesByDate = new Map(waterLogs.map((w) => [w.date, w.glasses]));
  let count = 0;
  let cursor = today;
  while ((glassesByDate.get(cursor) ?? 0) >= waterTargetGlasses) {
    count++;
    cursor = shiftDate(cursor, -1);
  }
  return count;
}

/** Consecutive days ending today with at least one walk logged. */
export function movementStreak(walks: Walk[], today: string): number {
  const datesWithWalk = new Set(walks.map((w) => w.date));
  let count = 0;
  let cursor = today;
  while (datesWithWalk.has(cursor)) {
    count++;
    cursor = shiftDate(cursor, -1);
  }
  return count;
}

// ---------------------------------------------------------------------------
// Weekly summary (F3-AC4, F6-AC3) — last 7 local days including today
// ---------------------------------------------------------------------------

export interface WeeklySummary {
  avgWaterGlasses: number;
  nightsWithSleepLog: number;
  totalWalkMinutes: number;
  totalWalks: number;
  totalWalkDistanceKm: number;
  mealsLoggedCount: number;
  checkInsCompleted: number;
  mostCommonFeeling: Feeling | undefined;
}

export function getWeeklySummary(input: {
  today: string;
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  walks: Walk[];
  mealLogs: MealLog[];
  checkins: CheckIn[];
}): WeeklySummary {
  const weekDates = new Set(lastNDates(input.today, 7));
  const inWeek = <T extends { date: string }>(rows: T[]) => rows.filter((r) => weekDates.has(r.date));

  const weekWater = inWeek(input.waterLogs);
  const weekSleep = inWeek(input.sleepLogs);
  const weekWalks = inWeek(input.walks);
  const weekMeals = inWeek(input.mealLogs);
  const weekCheckins = inWeek(input.checkins);

  const avgWaterGlasses =
    weekWater.length === 0 ? 0 : weekWater.reduce((sum, w) => sum + w.glasses, 0) / 7;

  const feelingCounts = new Map<Feeling, number>();
  for (const c of weekCheckins) {
    feelingCounts.set(c.feeling, (feelingCounts.get(c.feeling) ?? 0) + 1);
  }
  let mostCommonFeeling: Feeling | undefined;
  let maxCount = 0;
  for (const [feeling, count] of feelingCounts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonFeeling = feeling;
    }
  }

  return {
    avgWaterGlasses,
    nightsWithSleepLog: weekSleep.filter((s) => s.hours != null || s.quality != null).length,
    totalWalkMinutes: weekWalks.reduce((sum, w) => sum + w.durationMins, 0),
    totalWalks: weekWalks.length,
    totalWalkDistanceKm: weekWalks.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0),
    mealsLoggedCount: weekMeals.filter((m) => m.done).length,
    checkInsCompleted: weekCheckins.length,
    mostCommonFeeling,
  };
}

// ---------------------------------------------------------------------------
// Trends (F6-AC4) — last 7 days
// ---------------------------------------------------------------------------

export interface Trends {
  dates: string[]; // chronological, oldest first, length 7
  waterGlassesPerDay: number[]; // aligned with `dates`
  walkMinutesPerDay: number[]; // aligned with `dates`
  sleepQualityDistribution: Record<SleepQuality, number>;
}

export function getTrends(input: {
  today: string;
  waterLogs: WaterLog[];
  walks: Walk[];
  sleepLogs: SleepLog[];
}): Trends {
  const dates = lastNDates(input.today, 7);

  const glassesByDate = new Map(input.waterLogs.map((w) => [w.date, w.glasses]));
  const minutesByDate = new Map<string, number>();
  for (const walk of input.walks) {
    minutesByDate.set(walk.date, (minutesByDate.get(walk.date) ?? 0) + walk.durationMins);
  }

  const sleepQualityDistribution: Record<SleepQuality, number> = { good: 0, okay: 0, poor: 0 };
  const weekDates = new Set(dates);
  for (const log of input.sleepLogs) {
    if (log.quality && weekDates.has(log.date)) {
      sleepQualityDistribution[log.quality]++;
    }
  }

  return {
    dates,
    waterGlassesPerDay: dates.map((d) => glassesByDate.get(d) ?? 0),
    walkMinutesPerDay: dates.map((d) => minutesByDate.get(d) ?? 0),
    sleepQualityDistribution,
  };
}

// ---------------------------------------------------------------------------
// Reminders (F9-AC1) — no Section 11 spec exists for this yet, so the rule
// below is this step's own: check-in is nudged any time it's still undone
// today (the existing auto-launch/dismiss flow already governs the modal
// itself; this only adds a passive banner), hydration is nudged only once
// it's "later in the day" per F9-AC1's wording, not from first thing in the
// morning when falling short of a whole day's target is expected.
// ---------------------------------------------------------------------------

/** Local hour (0-23) from which an unmet hydration goal is nudged. */
export const HYDRATION_REMINDER_HOUR = 15;

export interface ReminderState {
  showCheckInReminder: boolean;
  showHydrationReminder: boolean;
}

export function getReminders(input: {
  hasCheckedInToday: boolean;
  hydrationMet: boolean;
  nowHour: number; // 0-23, local time — passed in so this stays a pure, unit-testable function
}): ReminderState {
  return {
    showCheckInReminder: !input.hasCheckedInToday,
    showHydrationReminder: !input.hydrationMet && input.nowHour >= HYDRATION_REMINDER_HOUR,
  };
}
