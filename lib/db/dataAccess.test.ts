import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import * as dataAccess from "@/lib/db/dataAccess";

const TODAY = "2026-07-18";

// Fresh IndexedDB per test file via fake-indexeddb; clearAllLocalData
// resets tables between tests within this file (also exercises F11-AC2).
afterEach(async () => {
  await dataAccess.clearAllLocalData();
});

describe("Profile", () => {
  it("creates a profile with defaults and reads it back", async () => {
    const created = await dataAccess.createProfile({});
    expect(created.waterTargetGlasses).toBe(8);
    expect(created.remindersEnabled).toBe(false);

    const fetched = await dataAccess.getProfile();
    expect(fetched).toEqual(created);
  });

  it("updateProfile patches without clobbering unrelated fields", async () => {
    await dataAccess.createProfile({ name: "Amaka", waterTargetGlasses: 6 });
    await dataAccess.updateProfile({ waterTargetGlasses: 10 });

    const profile = await dataAccess.getProfile();
    expect(profile?.name).toBe("Amaka");
    expect(profile?.waterTargetGlasses).toBe(10);
  });

  it("markOnboarded and acceptDisclaimer set their own timestamps independently", async () => {
    await dataAccess.createProfile({});
    await dataAccess.markOnboarded();
    await dataAccess.acceptDisclaimer();

    const profile = await dataAccess.getProfile();
    expect(profile?.onboardedAt).toBeTypeOf("number");
    expect(profile?.disclaimerAcceptedAt).toBeTypeOf("number");
  });

  it("clearAllLocalData returns the app to first-run state (F11-AC2)", async () => {
    await dataAccess.createProfile({ name: "Amaka" });
    await dataAccess.addWaterGlass(TODAY);
    await dataAccess.clearAllLocalData();

    expect(await dataAccess.getProfile()).toBeUndefined();
    expect(await dataAccess.getWaterLog(TODAY)).toBeUndefined();
  });
});

describe("completeCheckIn (F2-AC2)", () => {
  it("writes a checkins row and upserts sleepLogs.quality from the same answer", async () => {
    await dataAccess.completeCheckIn({
      date: TODAY,
      sleepQuality: "good",
      feeling: "great",
      movedYesterday: true,
    });

    const checkIn = await dataAccess.getCheckIn(TODAY);
    expect(checkIn?.feeling).toBe("great");
    expect(checkIn?.movedYesterday).toBe(true);

    const sleepLog = await dataAccess.getSleepLog(TODAY);
    expect(sleepLog?.quality).toBe("good");
  });

  it("updates the same day's row instead of creating a duplicate", async () => {
    await dataAccess.completeCheckIn({
      date: TODAY,
      sleepQuality: "okay",
      feeling: "okay",
      movedYesterday: false,
    });
    await dataAccess.completeCheckIn({
      date: TODAY,
      sleepQuality: "poor",
      feeling: "low",
      movedYesterday: true,
    });

    const checkIn = await dataAccess.getCheckIn(TODAY);
    expect(checkIn?.feeling).toBe("low");

    const all = await dataAccess.getCheckInsInRange([TODAY]);
    expect(all).toHaveLength(1);
  });

  it("does not clobber an hours value set separately when only quality is upserted", async () => {
    await dataAccess.upsertSleepLog({ date: TODAY, hours: 7 });
    await dataAccess.completeCheckIn({
      date: TODAY,
      sleepQuality: "good",
      feeling: "great",
      movedYesterday: false,
    });

    const sleepLog = await dataAccess.getSleepLog(TODAY);
    expect(sleepLog?.hours).toBe(7);
    expect(sleepLog?.quality).toBe("good");
  });
});

describe("Water (F4-AC1)", () => {
  it("addWaterGlass increments from zero, removeWaterGlass never goes below zero", async () => {
    const first = await dataAccess.addWaterGlass(TODAY);
    expect(first.glasses).toBe(1);

    await dataAccess.addWaterGlass(TODAY);
    const removed = await dataAccess.removeWaterGlass(TODAY);
    expect(removed.glasses).toBe(1);

    await dataAccess.removeWaterGlass(TODAY);
    const flooredAtZero = await dataAccess.removeWaterGlass(TODAY);
    expect(flooredAtZero.glasses).toBe(0);
  });
});

describe("Meals (F4-AC2, compound [date+mealType] index)", () => {
  it("upsertMealLog updates the same date+mealType slot instead of duplicating", async () => {
    await dataAccess.upsertMealLog({ date: TODAY, mealType: "breakfast", done: true });
    await dataAccess.upsertMealLog({ date: TODAY, mealType: "breakfast", done: true, note: "eba" });

    const logs = await dataAccess.getMealLogs(TODAY);
    expect(logs).toHaveLength(1);
    expect(logs[0].note).toBe("eba");
  });

  it("keeps separate rows per meal type on the same date", async () => {
    await dataAccess.upsertMealLog({ date: TODAY, mealType: "breakfast", done: true });
    await dataAccess.upsertMealLog({ date: TODAY, mealType: "lunch", done: true });
    await dataAccess.upsertMealLog({ date: TODAY, mealType: "dinner", done: false });

    const logs = await dataAccess.getMealLogs(TODAY);
    expect(logs).toHaveLength(3);
  });

  it("preserves note and recommendedMealId across an upsert that omits them (F7-AC6)", async () => {
    await dataAccess.upsertMealLog({
      date: TODAY,
      mealType: "breakfast",
      done: false,
      note: "with extra pepper",
      recommendedMealId: "bp-b1",
    });

    // Toggling done from Home's quick-log doesn't pass note/recommendedMealId —
    // it must not silently clear a Nourish attachment or an existing note.
    await dataAccess.upsertMealLog({ date: TODAY, mealType: "breakfast", done: true });

    const logs = await dataAccess.getMealLogs(TODAY);
    expect(logs).toHaveLength(1);
    expect(logs[0].done).toBe(true);
    expect(logs[0].note).toBe("with extra pepper");
    expect(logs[0].recommendedMealId).toBe("bp-b1");
  });
});

describe("Sleep (F4-AC3)", () => {
  it("upsertSleepLog merges hours and quality set in separate calls", async () => {
    await dataAccess.upsertSleepLog({ date: TODAY, hours: 6.5 });
    await dataAccess.upsertSleepLog({ date: TODAY, quality: "okay" });

    const sleepLog = await dataAccess.getSleepLog(TODAY);
    expect(sleepLog?.hours).toBe(6.5);
    expect(sleepLog?.quality).toBe("okay");
  });
});

describe("Walks (F5)", () => {
  it("logWalk allows multiple walks on the same day", async () => {
    await dataAccess.logWalk({ date: TODAY, durationMins: 15 });
    await dataAccess.logWalk({ date: TODAY, durationMins: 20, distanceKm: 1.5 });

    const walks = await dataAccess.getWalks(TODAY);
    expect(walks).toHaveLength(2);
  });
});

describe("Range reads", () => {
  it("lastNDates + getWaterLogsInRange fetch exactly the rows in the window", async () => {
    await dataAccess.addWaterGlass("2026-07-11"); // outside a 7-day window ending today
    await dataAccess.addWaterGlass(TODAY);

    const dates = dataAccess.lastNDates(TODAY, 7);
    const logs = await dataAccess.getWaterLogsInRange(dates);

    expect(logs).toHaveLength(1);
    expect(logs[0].date).toBe(TODAY);
  });
});

describe("todayISO", () => {
  it("returns a well-formed ISO calendar date", () => {
    expect(dataAccess.todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

