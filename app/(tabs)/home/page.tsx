"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckInModal } from "@/components/CheckInModal";
import { MealsQuickLog } from "@/components/quickLogs/MealsQuickLog";
import { SleepQuickLog } from "@/components/quickLogs/SleepQuickLog";
import { WaterQuickLog } from "@/components/quickLogs/WaterQuickLog";
import { ReminderBanner } from "@/components/ReminderBanner";
import { isDismissedToday, setDismissedDate } from "@/lib/checkInDismissal";
import { getTodaysContent } from "@/lib/daily/dailyContent";
import {
  addWaterGlass,
  getCheckIn,
  getCheckInsInRange,
  getMealLogs,
  getMealLogsInRange,
  getSleepLog,
  getSleepLogsInRange,
  getWalks,
  getWalksInRange,
  getWaterLog,
  getWaterLogsInRange,
  lastNDates,
  removeWaterGlass,
  todayISO,
  upsertMealLog,
  upsertSleepLog,
} from "@/lib/db/dataAccess";
import type {
  CheckIn,
  MealLog,
  MealType,
  SleepLog,
  SleepQuality,
  Walk,
  WaterLog,
} from "@/lib/db/schema";
import { useRequireOnboardedProfile } from "@/lib/hooks/useRequireOnboardedProfile";
import { getReminders, getTodaysGoals, getWeeklySummary, type WeeklySummary } from "@/lib/insights/derived";
import {
  CHECK_IN_NOTIFICATION_BODY,
  CHECK_IN_NOTIFICATION_TITLE,
  CHECK_IN_REMINDER_BANNER,
  HYDRATION_NOTIFICATION_BODY,
  HYDRATION_NOTIFICATION_TITLE,
  HYDRATION_REMINDER_BANNER,
} from "@/lib/reminders/copy";
import { hasNotifiedToday, markNotifiedToday } from "@/lib/reminders/notifiedToday";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showReminderNotification,
} from "@/lib/reminders/notifications";

interface TodayState {
  waterLog?: WaterLog;
  mealLogs: MealLog[];
  sleepLog?: SleepLog;
  walks: Walk[];
  checkIn?: CheckIn;
}

/**
 * F3: the daily loop hub. Owns all of today's + this week's data and the
 * handlers that write through the data-access layer, then reload —
 * quick-log subcomponents are presentational only (F3-AC3: writes reflect
 * immediately, no page reload).
 */
export default function HomePage() {
  const profile = useRequireOnboardedProfile();
  const [today] = useState(() => todayISO());
  const [todayState, setTodayState] = useState<TodayState | null>(null);
  const [weekSummary, setWeekSummary] = useState<WeeklySummary | null>(null);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  // F9-AC1: "later in the day" (`getReminders`'s hydration rule) has to
  // become true purely from the clock passing `HYDRATION_REMINDER_HOUR`,
  // not only when a write triggers `reload()` — a user who opens the app
  // once in the morning and leaves the tab open, without tapping anything
  // else, would otherwise never see the nudge that day. This just forces a
  // periodic re-render; the render body recomputes `reminders` from a fresh
  // `new Date().getHours()` every time regardless of what changed.
  const [clockTick, setClockTick] = useState(0);

  const reload = useCallback(async () => {
    const [waterLog, mealLogs, sleepLog, walks, checkIn] = await Promise.all([
      getWaterLog(today),
      getMealLogs(today),
      getSleepLog(today),
      getWalks(today),
      getCheckIn(today),
    ]);
    setTodayState({ waterLog, mealLogs, sleepLog, walks, checkIn });

    const weekDates = lastNDates(today, 7);
    const [weekCheckins, weekWater, weekMeals, weekSleep, weekWalks] = await Promise.all([
      getCheckInsInRange(weekDates),
      getWaterLogsInRange(weekDates),
      getMealLogsInRange(weekDates),
      getSleepLogsInRange(weekDates),
      getWalksInRange(weekDates),
    ]);
    setWeekSummary(
      getWeeklySummary({
        today,
        waterLogs: weekWater,
        sleepLogs: weekSleep,
        walks: weekWalks,
        mealLogs: weekMeals,
        checkins: weekCheckins,
      }),
    );

    // F2-AC1/AC3: auto-launch once per day, unless already checked in or
    // already dismissed today (isDismissedToday persists across reloads).
    if (!checkIn && !isDismissedToday(today)) {
      setCheckInModalOpen(true);
    }
  }, [today]);

  useEffect(() => {
    if (!profile) return;
    // reload()'s setState calls all happen after `await Promise.all(...)`
    // resolves (a later microtask), never synchronously during this
    // effect's own execution, so there's no cascading-render risk the
    // set-state-in-effect rule exists to catch. The rule's static check
    // can't see past the extra indirection through the named `reload`
    // callback (unlike an inline `.then()`, which it does recognize), and
    // duplicating reload's fetch+setState body inline here just to satisfy
    // that pattern would leave two copies to keep in sync with the write
    // handlers below that also call `reload()`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [profile, reload]);

  // F9-AC2: request notification permission only if the user opted in
  // (`profile.remindersEnabled`) and only once — `profile`'s reference is
  // stable across `reload()`s (reload never refetches it), so this doesn't
  // re-fire on every water tap the way an effect keyed on `todayState`
  // would. `requestNotificationPermission` is fire-and-forget-safe: never
  // awaited, and degrades silently on any failure or lack of support
  // (F9-AC3).
  useEffect(() => {
    if (!profile?.remindersEnabled) return;
    if (getNotificationPermission() === "default") {
      requestNotificationPermission();
    }
  }, [profile]);

  // Periodic re-check so "later in the day" can become true purely from
  // the clock, without waiting for the user to trigger a `reload()` — see
  // the `clockTick` state declaration above for why. 15 minutes is coarse
  // on purpose: this is a gentle nudge, not a precise timer, and a longer
  // interval costs nothing while the app is backgrounded (browsers throttle
  // or suspend timers in inactive tabs anyway).
  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // F9-AC1/AC2: fire at most one Web Notification per reminder kind per
  // local day (`hasNotifiedToday`/`markNotifiedToday`) — the in-app banners
  // below re-render on every `reload()`/`clockTick` regardless, this only
  // throttles the OS-level nudge so it isn't repeated on every water tap
  // while still behind target. The mark is written synchronously, before
  // the fire-and-forget `showReminderNotification` call settles: marking
  // only after would leave a window (this effect can re-run — e.g. another
  // quick-log tap — before a prior, still-in-flight attempt resolves) where
  // `hasNotifiedToday` is still false and a second notification gets
  // queued, since neither `markNotifiedToday` nor `showReminderNotification`
  // wait on each other. `showReminderNotification` still degrades silently
  // on any failure (F9-AC2), so a mark that turns out not to have visibly
  // shown anything is an accepted, rare trade-off against duplicate spam.
  useEffect(() => {
    if (!profile?.remindersEnabled || !todayState) return;

    const todaysGoals = getTodaysGoals({
      waterTargetGlasses: profile.waterTargetGlasses,
      todayWaterLog: todayState.waterLog,
      todayMealLogs: todayState.mealLogs,
      todaySleepLog: todayState.sleepLog,
      todayWalks: todayState.walks,
    });
    const reminders = getReminders({
      hasCheckedInToday: !!todayState.checkIn,
      hydrationMet: todaysGoals.hydration.met,
      nowHour: new Date().getHours(),
    });

    if (reminders.showCheckInReminder && !hasNotifiedToday("checkin", today)) {
      markNotifiedToday("checkin", today);
      showReminderNotification(CHECK_IN_NOTIFICATION_TITLE, CHECK_IN_NOTIFICATION_BODY);
    }
    if (reminders.showHydrationReminder && !hasNotifiedToday("hydration", today)) {
      markNotifiedToday("hydration", today);
      showReminderNotification(HYDRATION_NOTIFICATION_TITLE, HYDRATION_NOTIFICATION_BODY);
    }
  }, [profile, todayState, today, clockTick]);

  if (!profile || !todayState || !weekSummary) {
    return null;
  }

  const goals = getTodaysGoals({
    waterTargetGlasses: profile.waterTargetGlasses,
    todayWaterLog: todayState.waterLog,
    todayMealLogs: todayState.mealLogs,
    todaySleepLog: todayState.sleepLog,
    todayWalks: todayState.walks,
  });

  const reminders = getReminders({
    hasCheckedInToday: !!todayState.checkIn,
    hydrationMet: goals.hydration.met,
    nowHour: new Date().getHours(),
  });

  const { tip, affirmation } = getTodaysContent(today);

  async function handleAddWater() {
    await addWaterGlass(today);
    await reload();
  }

  async function handleRemoveWater() {
    await removeWaterGlass(today);
    await reload();
  }

  async function handleToggleMeal(mealType: MealType, done: boolean) {
    await upsertMealLog({ date: today, mealType, done });
    await reload();
  }

  async function handleMealNoteChange(mealType: MealType, note: string) {
    const existing = todayState?.mealLogs.find((m) => m.mealType === mealType);
    await upsertMealLog({ date: today, mealType, done: existing?.done ?? false, note });
    await reload();
  }

  async function handleSleepHoursChange(hours: number) {
    await upsertSleepLog({ date: today, hours });
    await reload();
  }

  async function handleSleepQualityChange(quality: SleepQuality) {
    await upsertSleepLog({ date: today, quality });
    await reload();
  }

  async function handleCheckInComplete() {
    setCheckInModalOpen(false);
    await reload();
  }

  function handleCheckInDismiss() {
    setDismissedDate(today);
    setCheckInModalOpen(false);
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          {profile.name ? `Welcome back, ${profile.name}` : "Welcome back"}
        </h1>
        <Link href="/settings" className="min-h-11 shrink-0 text-lg font-medium underline">
          Settings
        </Link>
      </div>

      {profile.remindersEnabled && reminders.showCheckInReminder && (
        <ReminderBanner
          message={CHECK_IN_REMINDER_BANNER}
          actionLabel="Check in now"
          onAction={() => setCheckInModalOpen(true)}
        />
      )}
      {profile.remindersEnabled && reminders.showHydrationReminder && (
        <ReminderBanner message={HYDRATION_REMINDER_BANNER} actionLabel="Log water" href="#quick-log" />
      )}

      {tip && (
        <div className="rounded-lg border border-black/20 p-4 text-lg dark:border-white/30">
          <p className="font-medium">Today&apos;s tip</p>
          <p className="text-black/70 dark:text-white/70">{tip.text}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {todayState.checkIn ? (
          <p className="text-lg">Checked in today ✓</p>
        ) : (
          <button
            type="button"
            onClick={() => setCheckInModalOpen(true)}
            className="min-h-11 self-start rounded-full bg-foreground px-6 py-3 text-lg font-medium text-background"
          >
            Daily check-in
          </button>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Today&apos;s goals</h2>
        <ul className="flex flex-col gap-2 text-lg">
          <li>
            Hydration: {goals.hydration.glasses} / {goals.hydration.target} glasses
            {goals.hydration.met ? " — goal reached" : ""}
          </li>
          <li>
            Meals: {goals.meals.loggedCount} / {goals.meals.total} logged{" "}
            <Link href="/nourish" className="underline">
              See meal ideas
            </Link>
          </li>
          <li>Sleep: {goals.sleep.met ? "Logged" : "Not yet logged"}</li>
          <li>
            Movement: {goals.movement.met ? "Walk logged today" : "No walk yet"}{" "}
            <Link href="/move" className="underline">
              Log a walk
            </Link>
          </li>
        </ul>
      </section>

      <section id="quick-log" className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Quick log</h2>
        <WaterQuickLog
          glasses={goals.hydration.glasses}
          target={goals.hydration.target}
          onAdd={handleAddWater}
          onRemove={handleRemoveWater}
        />
        <MealsQuickLog
          mealLogs={todayState.mealLogs}
          onToggle={handleToggleMeal}
          onNoteChange={handleMealNoteChange}
        />
        <SleepQuickLog
          sleepLog={todayState.sleepLog}
          onChangeHours={handleSleepHoursChange}
          onChangeQuality={handleSleepQualityChange}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">This week</h2>
        <ul className="flex flex-col gap-2 text-lg">
          <li>Average water: {weekSummary.avgWaterGlasses.toFixed(1)} glasses/day</li>
          <li>Nights with sleep logged: {weekSummary.nightsWithSleepLog}</li>
          <li>
            Walks: {weekSummary.totalWalks} ({weekSummary.totalWalkMinutes} min,{" "}
            {weekSummary.totalWalkDistanceKm.toFixed(1)} km)
          </li>
          <li>Meals logged: {weekSummary.mealsLoggedCount}</li>
          <li>Check-ins: {weekSummary.checkInsCompleted}</li>
        </ul>
        <Link href="/track" className="self-start text-lg font-medium underline">
          See streaks and trends
        </Link>
      </section>

      {affirmation && (
        <div className="rounded-lg border border-black/20 p-4 text-lg italic dark:border-white/30">
          {affirmation.text}
        </div>
      )}

      {checkInModalOpen && (
        <CheckInModal date={today} onComplete={handleCheckInComplete} onDismiss={handleCheckInDismiss} />
      )}
    </main>
  );
}
