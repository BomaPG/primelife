import { describe, expect, it } from "vitest";
import { getDayIndex, pickAffirmation, pickDailyTip } from "@/lib/daily/dailyContent";
import type { Affirmation, DailyTip } from "@/lib/content/types";

describe("getDayIndex", () => {
  it("is deterministic for the same date", () => {
    expect(getDayIndex("2026-07-18")).toBe(getDayIndex("2026-07-18"));
  });

  it("increases by exactly 1 for the next calendar day", () => {
    expect(getDayIndex("2026-07-19")).toBe(getDayIndex("2026-07-18") + 1);
  });
});

describe("pickDailyTip / pickAffirmation", () => {
  const tips: DailyTip[] = [
    { id: "t1", text: "Tip one" },
    { id: "t2", text: "Tip two" },
    { id: "t3", text: "Tip three" },
  ];
  const affirmations: Affirmation[] = [
    { id: "a1", text: "Affirmation one" },
    { id: "a2", text: "Affirmation two" },
  ];

  it("wraps around with modulo so it never goes out of bounds", () => {
    const dayIndex = getDayIndex("2026-07-18");
    const picked = pickDailyTip(tips, dayIndex);
    expect(picked).toBe(tips[dayIndex % tips.length]);
  });

  it("picks the same tip and affirmation for the same date, every time", () => {
    const dayIndex = getDayIndex("2026-07-18");
    expect(pickDailyTip(tips, dayIndex)).toBe(pickDailyTip(tips, dayIndex));
    expect(pickAffirmation(affirmations, dayIndex)).toBe(pickAffirmation(affirmations, dayIndex));
  });

  it("returns undefined instead of throwing on an empty list", () => {
    expect(pickDailyTip([], 42)).toBeUndefined();
    expect(pickAffirmation([], 42)).toBeUndefined();
  });
});
