import { lastNDates, todayISO } from "@/lib/dates";
import { getDB } from "./schema";
import type {
  CheckIn,
  Feeling,
  MealLog,
  MealType,
  Profile,
  SleepLog,
  SleepQuality,
  Walk,
  WaterLog,
} from "./schema";

/**
 * The single data-access seam (constraint C6). No feature code may import
 * `lib/db/schema` directly or touch Dexie tables itself — every local read
 * or write goes through an intent-named method here. This is also the seam
 * a future sync adapter would hook into.
 */

const DEFAULT_WATER_TARGET_GLASSES = 8;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<Profile | undefined> {
  return getDB().profile.get("singleton");
}

export async function createProfile(
  input: Partial<Pick<Profile, "name" | "waterTargetGlasses" | "remindersEnabled" | "interestedTopics">>,
): Promise<Profile> {
  const profile: Profile = {
    id: "singleton",
    name: input.name,
    createdAt: Date.now(),
    waterTargetGlasses: input.waterTargetGlasses ?? DEFAULT_WATER_TARGET_GLASSES,
    remindersEnabled: input.remindersEnabled ?? false,
    interestedTopics: input.interestedTopics ?? [],
  };
  await getDB().profile.put(profile);
  return profile;
}

export async function updateProfile(
  changes: Partial<Omit<Profile, "id" | "createdAt">>,
): Promise<void> {
  await getDB().profile.update("singleton", changes);
}

export async function markOnboarded(): Promise<void> {
  await getDB().profile.update("singleton", { onboardedAt: Date.now() });
}

export async function acceptDisclaimer(): Promise<void> {
  await getDB().profile.update("singleton", { disclaimerAcceptedAt: Date.now() });
}

/** Wipes every local table and returns the app to first-run state (F11-AC2). */
export async function clearAllLocalData(): Promise<void> {
  const db = getDB();
  await db.transaction(
    "rw",
    [db.profile, db.checkins, db.waterLogs, db.mealLogs, db.sleepLogs, db.walks],
    async () => {
      await Promise.all([
        db.profile.clear(),
        db.checkins.clear(),
        db.waterLogs.clear(),
        db.mealLogs.clear(),
        db.sleepLogs.clear(),
        db.walks.clear(),
      ]);
    },
  );
}

// ---------------------------------------------------------------------------
// Daily Check-In (F2)
// ---------------------------------------------------------------------------

export async function getCheckIn(date: string): Promise<CheckIn | undefined> {
  return getDB().checkins.where("date").equals(date).first();
}

/**
 * Completing the check-in writes/updates today's checkins row, upserts
 * today's sleepLogs.quality, and records the "moved yesterday" answer on the
 * check-in row itself (F2-AC2).
 */
export async function completeCheckIn(input: {
  date: string;
  sleepQuality: SleepQuality;
  feeling: Feeling;
  movedYesterday: boolean;
}): Promise<void> {
  const db = getDB();
  await db.transaction("rw", [db.checkins, db.sleepLogs], async () => {
    const existing = await db.checkins.where("date").equals(input.date).first();
    const checkIn: CheckIn = {
      id: existing?.id,
      date: input.date,
      sleepQuality: input.sleepQuality,
      feeling: input.feeling,
      movedYesterday: input.movedYesterday,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    await db.checkins.put(checkIn);
    await upsertSleepLogQuality(input.date, input.sleepQuality);
  });
}

// ---------------------------------------------------------------------------
// Water (F4-AC1)
// ---------------------------------------------------------------------------

export async function getWaterLog(date: string): Promise<WaterLog | undefined> {
  return getDB().waterLogs.get(date);
}

export async function addWaterGlass(date: string): Promise<WaterLog> {
  const db = getDB();
  return db.transaction("rw", db.waterLogs, async () => {
    const existing = await db.waterLogs.get(date);
    const next: WaterLog = {
      date,
      glasses: (existing?.glasses ?? 0) + 1,
      updatedAt: Date.now(),
    };
    await db.waterLogs.put(next);
    return next;
  });
}

export async function removeWaterGlass(date: string): Promise<WaterLog> {
  const db = getDB();
  return db.transaction("rw", db.waterLogs, async () => {
    const existing = await db.waterLogs.get(date);
    const next: WaterLog = {
      date,
      glasses: Math.max(0, (existing?.glasses ?? 0) - 1),
      updatedAt: Date.now(),
    };
    await db.waterLogs.put(next);
    return next;
  });
}

// ---------------------------------------------------------------------------
// Meals (F4-AC2)
// ---------------------------------------------------------------------------

export async function getMealLogs(date: string): Promise<MealLog[]> {
  return getDB().mealLogs.where("date").equals(date).toArray();
}

export async function upsertMealLog(input: {
  date: string;
  mealType: MealType;
  done: boolean;
  note?: string;
  recommendedMealId?: string;
}): Promise<MealLog> {
  const db = getDB();
  return db.transaction("rw", db.mealLogs, async () => {
    const existing = await db.mealLogs
      .where("[date+mealType]")
      .equals([input.date, input.mealType])
      .first();
    const mealLog: MealLog = {
      id: existing?.id,
      date: input.date,
      mealType: input.mealType,
      done: input.done,
      note: input.note ?? existing?.note,
      recommendedMealId: input.recommendedMealId ?? existing?.recommendedMealId,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    const id = await db.mealLogs.put(mealLog);
    return { ...mealLog, id };
  });
}

// ---------------------------------------------------------------------------
// Sleep (F4-AC3)
// ---------------------------------------------------------------------------

export async function getSleepLog(date: string): Promise<SleepLog | undefined> {
  return getDB().sleepLogs.get(date);
}

export async function upsertSleepLog(input: {
  date: string;
  hours?: number;
  quality?: SleepQuality;
}): Promise<SleepLog> {
  const db = getDB();
  return db.transaction("rw", db.sleepLogs, async () => {
    const existing = await db.sleepLogs.get(input.date);
    const next: SleepLog = {
      date: input.date,
      hours: input.hours ?? existing?.hours,
      quality: input.quality ?? existing?.quality,
      updatedAt: Date.now(),
    };
    await db.sleepLogs.put(next);
    return next;
  });
}

/** Sets only the quality field without clobbering an hours value set separately (F4-AC3). */
async function upsertSleepLogQuality(date: string, quality: SleepQuality): Promise<void> {
  const db = getDB();
  const existing = await db.sleepLogs.get(date);
  await db.sleepLogs.put({
    date,
    hours: existing?.hours,
    quality,
    updatedAt: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Walks (F5)
// ---------------------------------------------------------------------------

export async function getWalks(date: string): Promise<Walk[]> {
  return getDB().walks.where("date").equals(date).toArray();
}

export async function logWalk(input: {
  date: string;
  durationMins: number;
  distanceKm?: number;
  note?: string;
}): Promise<Walk> {
  const walk: Walk = {
    date: input.date,
    durationMins: input.durationMins,
    distanceKm: input.distanceKm,
    note: input.note,
    createdAt: Date.now(),
  };
  const id = await getDB().walks.add(walk);
  return { ...walk, id };
}

// ---------------------------------------------------------------------------
// Range reads for Insights (F6) — return raw rows; derived-logic in
// lib/insights computes goals/streaks/summaries/trends from them.
// ---------------------------------------------------------------------------

export async function getCheckInsInRange(dates: string[]): Promise<CheckIn[]> {
  return getDB().checkins.where("date").anyOf(dates).toArray();
}

export async function getWaterLogsInRange(dates: string[]): Promise<WaterLog[]> {
  return getDB().waterLogs.where("date").anyOf(dates).toArray();
}

export async function getMealLogsInRange(dates: string[]): Promise<MealLog[]> {
  return getDB().mealLogs.where("date").anyOf(dates).toArray();
}

export async function getSleepLogsInRange(dates: string[]): Promise<SleepLog[]> {
  return getDB().sleepLogs.where("date").anyOf(dates).toArray();
}

export async function getWalksInRange(dates: string[]): Promise<Walk[]> {
  return getDB().walks.where("date").anyOf(dates).toArray();
}

export { lastNDates, todayISO };
