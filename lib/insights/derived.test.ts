import { describe, expect, it } from "vitest";
import type { CheckIn, MealLog, SleepLog, Walk, WaterLog } from "@/lib/db/schema";
import {
  checkInStreak,
  getReminders,
  getTodaysGoals,
  getTrends,
  getWeeklySummary,
  HYDRATION_REMINDER_HOUR,
  hydrationStreak,
  movementStreak,
} from "@/lib/insights/derived";

const TODAY = "2026-07-18";

function checkIn(date: string, overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    date,
    sleepQuality: "okay",
    feeling: "okay",
    movedYesterday: false,
    createdAt: 0,
    ...overrides,
  };
}

describe("getTodaysGoals", () => {
  it("reports nothing met when no rows exist for today", () => {
    const goals = getTodaysGoals({
      waterTargetGlasses: 8,
      todayWaterLog: undefined,
      todayMealLogs: [],
      todaySleepLog: undefined,
      todayWalks: [],
    });
    expect(goals.hydration).toEqual({ met: false, glasses: 0, target: 8 });
    expect(goals.meals).toEqual({ loggedCount: 0, total: 3 });
    expect(goals.sleep.met).toBe(false);
    expect(goals.movement.met).toBe(false);
  });

  it("meets hydration exactly at target, not below it", () => {
    const below = getTodaysGoals({
      waterTargetGlasses: 8,
      todayWaterLog: { date: TODAY, glasses: 7, updatedAt: 0 },
      todayMealLogs: [],
      todaySleepLog: undefined,
      todayWalks: [],
    });
    expect(below.hydration.met).toBe(false);

    const atTarget = getTodaysGoals({
      waterTargetGlasses: 8,
      todayWaterLog: { date: TODAY, glasses: 8, updatedAt: 0 },
      todayMealLogs: [],
      todaySleepLog: undefined,
      todayWalks: [],
    });
    expect(atTarget.hydration.met).toBe(true);
  });

  it("counts only meals marked done", () => {
    const mealLogs: MealLog[] = [
      { date: TODAY, mealType: "breakfast", done: true, createdAt: 0 },
      { date: TODAY, mealType: "lunch", done: false, createdAt: 0 },
      { date: TODAY, mealType: "dinner", done: true, createdAt: 0 },
    ];
    const goals = getTodaysGoals({
      waterTargetGlasses: 8,
      todayWaterLog: undefined,
      todayMealLogs: mealLogs,
      todaySleepLog: undefined,
      todayWalks: [],
    });
    expect(goals.meals.loggedCount).toBe(2);
  });

  it("meets sleep goal when only quality is set (no hours)", () => {
    const sleepLog: SleepLog = { date: TODAY, quality: "good", updatedAt: 0 };
    const goals = getTodaysGoals({
      waterTargetGlasses: 8,
      todayWaterLog: undefined,
      todayMealLogs: [],
      todaySleepLog: sleepLog,
      todayWalks: [],
    });
    expect(goals.sleep.met).toBe(true);
  });

  it("meets movement goal with at least one walk", () => {
    const walk: Walk = { date: TODAY, durationMins: 10, createdAt: 0 };
    const goals = getTodaysGoals({
      waterTargetGlasses: 8,
      todayWaterLog: undefined,
      todayMealLogs: [],
      todaySleepLog: undefined,
      todayWalks: [walk],
    });
    expect(goals.movement.met).toBe(true);
  });
});

describe("checkInStreak", () => {
  it("is 0 with no check-ins at all", () => {
    expect(checkInStreak([], TODAY)).toBe(0);
  });

  it("counts a single check-in today as a streak of 1", () => {
    expect(checkInStreak([checkIn(TODAY)], TODAY)).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    const checkins = [
      checkIn("2026-07-16"),
      checkIn("2026-07-17"),
      checkIn("2026-07-18"),
    ];
    expect(checkInStreak(checkins, TODAY)).toBe(3);
  });

  it("is preserved when today has no check-in yet but yesterday did (grace rule)", () => {
    const checkins = [checkIn("2026-07-16"), checkIn("2026-07-17")];
    expect(checkInStreak(checkins, TODAY)).toBe(2);
  });

  it("breaks once a full day passes with no check-in", () => {
    // Neither today nor yesterday checked in — the day before that doesn't matter.
    const checkins = [checkIn("2026-07-15"), checkIn("2026-07-16")];
    expect(checkInStreak(checkins, TODAY)).toBe(0);
  });

  it("does not let a gap earlier in history inflate today's streak", () => {
    const checkins = [
      checkIn("2026-07-01"),
      // gap
      checkIn("2026-07-17"),
      checkIn("2026-07-18"),
    ];
    expect(checkInStreak(checkins, TODAY)).toBe(2);
  });

  it("anchors on yesterday without double counting today when today is also missing", () => {
    // yesterday + the day before, today missing
    const checkins = [checkIn("2026-07-16"), checkIn("2026-07-17")];
    expect(checkInStreak(checkins, TODAY)).toBe(2);
  });
});

describe("hydrationStreak", () => {
  const target = 8;

  it("is 0 when today's target is not met, even if prior days met it", () => {
    const logs: WaterLog[] = [
      { date: "2026-07-17", glasses: 8, updatedAt: 0 },
      { date: TODAY, glasses: 3, updatedAt: 0 },
    ];
    expect(hydrationStreak(logs, target, TODAY)).toBe(0);
  });

  it("counts consecutive met days ending today", () => {
    const logs: WaterLog[] = [
      { date: "2026-07-16", glasses: 8, updatedAt: 0 },
      { date: "2026-07-17", glasses: 9, updatedAt: 0 },
      { date: TODAY, glasses: 8, updatedAt: 0 },
    ];
    expect(hydrationStreak(logs, target, TODAY)).toBe(3);
  });
});

describe("movementStreak", () => {
  it("is 0 when no walk logged today", () => {
    const walks: Walk[] = [{ date: "2026-07-17", durationMins: 20, createdAt: 0 }];
    expect(movementStreak(walks, TODAY)).toBe(0);
  });

  it("counts consecutive days with a walk ending today", () => {
    const walks: Walk[] = [
      { date: "2026-07-17", durationMins: 20, createdAt: 0 },
      { date: TODAY, durationMins: 15, createdAt: 0 },
    ];
    expect(movementStreak(walks, TODAY)).toBe(2);
  });
});

describe("getWeeklySummary", () => {
  it("averages water over 7 days even with missing days, and picks the most common feeling", () => {
    const summary = getWeeklySummary({
      today: TODAY,
      waterLogs: [
        { date: "2026-07-17", glasses: 7, updatedAt: 0 },
        { date: TODAY, glasses: 7, updatedAt: 0 },
      ],
      sleepLogs: [{ date: TODAY, hours: 7, updatedAt: 0 }],
      walks: [
        { date: "2026-07-16", durationMins: 20, distanceKm: 1.5, createdAt: 0 },
        { date: TODAY, durationMins: 10, createdAt: 0 },
      ],
      mealLogs: [
        { date: TODAY, mealType: "breakfast", done: true, createdAt: 0 },
        { date: TODAY, mealType: "lunch", done: false, createdAt: 0 },
      ],
      checkins: [
        checkIn("2026-07-16", { feeling: "great" }),
        checkIn("2026-07-17", { feeling: "great" }),
        checkIn(TODAY, { feeling: "low" }),
      ],
    });

    expect(summary.avgWaterGlasses).toBeCloseTo(2, 5); // (7+7)/7
    expect(summary.nightsWithSleepLog).toBe(1);
    expect(summary.totalWalkMinutes).toBe(30);
    expect(summary.totalWalks).toBe(2);
    expect(summary.totalWalkDistanceKm).toBeCloseTo(1.5, 5); // second walk has no distance
    expect(summary.mealsLoggedCount).toBe(1);
    expect(summary.checkInsCompleted).toBe(3);
    expect(summary.mostCommonFeeling).toBe("great");
  });

  it("excludes rows outside the 7-day window", () => {
    const summary = getWeeklySummary({
      today: TODAY,
      waterLogs: [{ date: "2026-01-01", glasses: 20, updatedAt: 0 }],
      sleepLogs: [],
      walks: [],
      mealLogs: [],
      checkins: [],
    });
    expect(summary.avgWaterGlasses).toBe(0);
  });
});

describe("getTrends", () => {
  it("returns 7 chronological dates with per-day water and walk series", () => {
    const trends = getTrends({
      today: TODAY,
      waterLogs: [{ date: TODAY, glasses: 5, updatedAt: 0 }],
      walks: [{ date: TODAY, durationMins: 12, createdAt: 0 }],
      sleepLogs: [
        { date: "2026-07-17", quality: "good", updatedAt: 0 },
        { date: TODAY, quality: "poor", updatedAt: 0 },
      ],
    });

    expect(trends.dates).toHaveLength(7);
    expect(trends.dates[6]).toBe(TODAY);
    expect(trends.waterGlassesPerDay[6]).toBe(5);
    expect(trends.walkMinutesPerDay[6]).toBe(12);
    expect(trends.sleepQualityDistribution).toEqual({ good: 1, okay: 0, poor: 1 });
  });
});

describe("getReminders", () => {
  it("nudges check-in any time of day when not yet checked in", () => {
    expect(
      getReminders({ hasCheckedInToday: false, hydrationMet: true, nowHour: 6 }).showCheckInReminder,
    ).toBe(true);
    expect(
      getReminders({ hasCheckedInToday: false, hydrationMet: true, nowHour: 23 }).showCheckInReminder,
    ).toBe(true);
  });

  it("does not nudge check-in once it's done", () => {
    expect(
      getReminders({ hasCheckedInToday: true, hydrationMet: false, nowHour: 20 }).showCheckInReminder,
    ).toBe(false);
  });

  it("does not nudge hydration before the reminder hour, even if unmet", () => {
    expect(
      getReminders({
        hasCheckedInToday: true,
        hydrationMet: false,
        nowHour: HYDRATION_REMINDER_HOUR - 1,
      }).showHydrationReminder,
    ).toBe(false);
  });

  it("nudges hydration from the reminder hour onward when unmet", () => {
    expect(
      getReminders({
        hasCheckedInToday: true,
        hydrationMet: false,
        nowHour: HYDRATION_REMINDER_HOUR,
      }).showHydrationReminder,
    ).toBe(true);
    expect(
      getReminders({ hasCheckedInToday: true, hydrationMet: false, nowHour: 23 }).showHydrationReminder,
    ).toBe(true);
  });

  it("never nudges hydration once the goal is met, regardless of hour", () => {
    expect(
      getReminders({ hasCheckedInToday: true, hydrationMet: true, nowHour: 23 }).showHydrationReminder,
    ).toBe(false);
  });
});
