"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WeekBarChart } from "@/components/insights/WeekBarChart";
import { MEAL_TYPE_OPTIONS } from "@/lib/content/mealTypeOptions";
import {
  getCheckInsInRange,
  getMealLogsInRange,
  getSleepLogsInRange,
  getWalksInRange,
  getWaterLogsInRange,
  lastNDates,
  todayISO,
} from "@/lib/db/dataAccess";
import type { CheckIn, MealLog, SleepLog, Walk, WaterLog } from "@/lib/db/schema";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";
import {
  checkInStreak,
  getTrends,
  getWeeklySummary,
  hydrationStreak,
  movementStreak,
  type Trends,
  type WeeklySummary,
} from "@/lib/insights/derived";

// Streaks have no fixed length, but the range-read seam needs a bounded
// window to query. 60 local days is far beyond any streak this MVP's daily
// habits would realistically sustain unbroken, and an IndexedDB range read
// over that many rows costs nothing offline — so streaks aren't silently
// capped at the 7 days the rest of this page uses for trends/summary.
const STREAK_LOOKBACK_DAYS = 60;

interface RangeData {
  checkins: CheckIn[];
  waterLogs: WaterLog[];
  mealLogs: MealLog[];
  sleepLogs: SleepLog[];
  walks: Walk[];
}

function formatDayLabel(date: string, today: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const label = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(dt);
  return date === today ? `${label} (Today)` : label;
}

/**
 * F6: a review surface for daily logs (F6-AC1) plus streaks, weekly summary,
 * and 7-day trends (F6-AC2 through AC4) — all read via the existing
 * data-access range functions and computed by the already-unit-tested pure
 * functions in `lib/insights/derived`. This page only fetches rows and
 * shapes them for display; it does not derive any new business logic.
 */
export default function TrackPage() {
  const profile = useRequireOnboardedProfile();
  const [today] = useState(() => todayISO());
  const [range, setRange] = useState<RangeData | null>(null);

  const reload = useCallback(async () => {
    const weekDates = lastNDates(today, 7);
    const streakDates = lastNDates(today, STREAK_LOOKBACK_DAYS);
    // Checkins/waterLogs/walks are fetched over the longer streak window;
    // getWeeklySummary and getTrends filter internally to their own 7-day
    // window, so passing the wider arrays into them is harmless and avoids
    // a second, narrower read of the same tables.
    const [checkins, waterLogs, walks, mealLogs, sleepLogs] = await Promise.all([
      getCheckInsInRange(streakDates),
      getWaterLogsInRange(streakDates),
      getWalksInRange(streakDates),
      getMealLogsInRange(weekDates),
      getSleepLogsInRange(weekDates),
    ]);
    setRange({ checkins, waterLogs, mealLogs, sleepLogs, walks });
  }, [today]);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [profile, reload]);

  if (!profile || !range) {
    return null;
  }

  const weeklySummary: WeeklySummary = getWeeklySummary({
    today,
    waterLogs: range.waterLogs,
    sleepLogs: range.sleepLogs,
    walks: range.walks,
    mealLogs: range.mealLogs,
    checkins: range.checkins,
  });
  const trends: Trends = getTrends({
    today,
    waterLogs: range.waterLogs,
    walks: range.walks,
    sleepLogs: range.sleepLogs,
  });
  const streaks = {
    checkIn: checkInStreak(range.checkins, today),
    hydration: hydrationStreak(range.waterLogs, profile.waterTargetGlasses, today),
    movement: movementStreak(range.walks, today),
  };

  const weekDates = lastNDates(today, 7);
  const dailyLogDates = [...weekDates].reverse(); // newest first, for a log-review feel

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">Track</h1>
        <Link href="/home" className="min-h-11 shrink-0 text-lg font-medium underline">
          Back to Home
        </Link>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Streaks</h2>
        <ul className="flex flex-col gap-2 text-lg">
          <li>Check-in streak: {streaks.checkIn} {streaks.checkIn === 1 ? "day" : "days"}</li>
          <li>Hydration streak: {streaks.hydration} {streaks.hydration === 1 ? "day" : "days"}</li>
          <li>Movement streak: {streaks.movement} {streaks.movement === 1 ? "day" : "days"}</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">This week</h2>
        <ul className="flex flex-col gap-2 text-lg">
          <li>Average water: {weeklySummary.avgWaterGlasses.toFixed(1)} glasses/day</li>
          <li>Nights with sleep logged: {weeklySummary.nightsWithSleepLog}</li>
          <li>
            Walks: {weeklySummary.totalWalks} ({weeklySummary.totalWalkMinutes} min,{" "}
            {weeklySummary.totalWalkDistanceKm.toFixed(1)} km)
          </li>
          <li>Meals logged: {weeklySummary.mealsLoggedCount}</li>
          <li>Check-ins: {weeklySummary.checkInsCompleted}</li>
          {weeklySummary.mostCommonFeeling && <li>Most common feeling: {weeklySummary.mostCommonFeeling}</li>}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Trends</h2>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Water (glasses/day)</p>
          <WeekBarChart
            data={trends.dates.map((date, i) => ({ date, value: trends.waterGlassesPerDay[i] }))}
            unit="glasses"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Walking (minutes/day)</p>
          <WeekBarChart
            data={trends.dates.map((date, i) => ({ date, value: trends.walkMinutesPerDay[i] }))}
            unit="min"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Sleep quality (last 7 days)</p>
          <ul className="flex flex-col gap-1 text-lg">
            <li>Good: {trends.sleepQualityDistribution.good}</li>
            <li>Okay: {trends.sleepQualityDistribution.okay}</li>
            <li>Poor: {trends.sleepQualityDistribution.poor}</li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Daily logs</h2>
        <ul className="flex flex-col gap-3">
          {dailyLogDates.map((date) => {
            const waterLog = range.waterLogs.find((w) => w.date === date);
            const dayMeals = range.mealLogs.filter((m) => m.date === date);
            const sleepLog = range.sleepLogs.find((s) => s.date === date);
            const dayWalks = range.walks.filter((w) => w.date === date);
            const walkMinutes = dayWalks.reduce((sum, w) => sum + w.durationMins, 0);

            return (
              <li key={date} className="flex flex-col gap-1 rounded-lg border border-black/20 p-4 text-lg dark:border-white/30">
                <p className="font-medium">{formatDayLabel(date, today)}</p>
                <p>
                  Water: {waterLog?.glasses ?? 0} / {profile.waterTargetGlasses} glasses
                </p>
                <p>
                  Meals:{" "}
                  {MEAL_TYPE_OPTIONS.map(({ type, label }) => {
                    const done = dayMeals.find((m) => m.mealType === type)?.done ?? false;
                    return done ? `${label} ✓` : label;
                  }).join(" · ")}
                </p>
                <p>
                  Sleep:{" "}
                  {sleepLog?.hours != null || sleepLog?.quality != null
                    ? [
                        sleepLog.hours != null ? `${sleepLog.hours} hrs` : null,
                        sleepLog.quality ?? null,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "Not logged"}
                </p>
                <p>
                  Walks:{" "}
                  {dayWalks.length === 0
                    ? "No walk logged"
                    : `${dayWalks.length} ${dayWalks.length === 1 ? "walk" : "walks"}, ${walkMinutes} min`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
