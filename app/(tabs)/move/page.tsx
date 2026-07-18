"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WalkLogForm } from "@/components/WalkLogForm";
import { getWalks, getWalksInRange, lastNDates, logWalk, todayISO } from "@/lib/db/dataAccess";
import type { Walk } from "@/lib/db/schema";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";
import { getWeeklySummary, type WeeklySummary } from "@/lib/insights/derived";

/**
 * F5: log a walk and see the last 7 local days add up. Multiple walks a day
 * are allowed (F5-AC1), so today's walks render as a list rather than a
 * single slot. Reuses `getWeeklySummary` (already the seam Home computes its
 * own weekly numbers through) for the walk totals rather than duplicating
 * that sum here — the other categories are passed empty since Move only
 * displays the walk fields.
 */
export default function MovePage() {
  const profile = useRequireOnboardedProfile();
  const [today] = useState(() => todayISO());
  const [todayWalks, setTodayWalks] = useState<Walk[] | null>(null);
  const [weekSummary, setWeekSummary] = useState<WeeklySummary | null>(null);

  const reload = useCallback(async () => {
    const [walks, weekWalks] = await Promise.all([
      getWalks(today),
      getWalksInRange(lastNDates(today, 7)),
    ]);
    setTodayWalks(walks);
    setWeekSummary(
      getWeeklySummary({
        today,
        waterLogs: [],
        sleepLogs: [],
        walks: weekWalks,
        mealLogs: [],
        checkins: [],
      }),
    );
  }, [today]);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [profile, reload]);

  if (!profile || !todayWalks || !weekSummary) {
    return null;
  }

  async function handleLogWalk(input: { durationMins: number; distanceKm?: number; note?: string }) {
    await logWalk({ date: today, ...input });
    await reload();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">Move</h1>
        <Link href="/home" className="min-h-11 shrink-0 text-lg font-medium underline">
          Back to Home
        </Link>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Log a walk</h2>
        <WalkLogForm onSubmit={handleLogWalk} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Today&apos;s walks</h2>
        {todayWalks.length === 0 ? (
          <p className="text-lg text-black/70 dark:text-white/70">No walks logged yet today.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-lg">
            {todayWalks.map((walk) => (
              <li key={walk.id} className="rounded-lg border border-black/20 p-4 dark:border-white/30">
                {walk.durationMins} min
                {walk.distanceKm != null ? ` · ${walk.distanceKm} km` : ""}
                {walk.note ? <p className="text-black/70 dark:text-white/70">{walk.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">This week</h2>
        <ul className="flex flex-col gap-2 text-lg">
          <li>Walks: {weekSummary.totalWalks}</li>
          <li>Minutes: {weekSummary.totalWalkMinutes}</li>
          <li>Distance: {weekSummary.totalWalkDistanceKm.toFixed(1)} km</li>
        </ul>
      </section>

      <p className="text-lg text-black/70 dark:text-white/70">
        Exercise library coming soon — for now, Move is your walking journal.
      </p>
    </main>
  );
}
