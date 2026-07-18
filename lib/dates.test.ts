import { describe, expect, it } from "vitest";
import { lastNDates, shiftDate, todayISO } from "@/lib/dates";

describe("shiftDate", () => {
  it("shifts forward across a month boundary", () => {
    expect(shiftDate("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("shifts backward across a year boundary", () => {
    expect(shiftDate("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("shifts backward across a leap day", () => {
    expect(shiftDate("2028-03-01", -1)).toBe("2028-02-29");
  });

  it("is a no-op for delta 0", () => {
    expect(shiftDate("2026-07-18", 0)).toBe("2026-07-18");
  });
});

describe("lastNDates", () => {
  it("returns N dates ending with endDate, oldest first", () => {
    expect(lastNDates("2026-07-18", 7)).toEqual([
      "2026-07-12",
      "2026-07-13",
      "2026-07-14",
      "2026-07-15",
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
    ]);
  });

  it("returns just [endDate] for days=1", () => {
    expect(lastNDates("2026-07-18", 1)).toEqual(["2026-07-18"]);
  });
});

describe("todayISO", () => {
  it("returns a well-formed ISO calendar date", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
