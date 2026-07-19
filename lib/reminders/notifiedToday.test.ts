// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { hasNotifiedToday, markNotifiedToday } from "@/lib/reminders/notifiedToday";

beforeEach(() => {
  window.localStorage.clear();
});

describe("notifiedToday", () => {
  it("has not notified by default", () => {
    expect(hasNotifiedToday("checkin", "2026-07-18")).toBe(false);
  });

  it("remembers a notification for the day it was marked", () => {
    markNotifiedToday("checkin", "2026-07-18");
    expect(hasNotifiedToday("checkin", "2026-07-18")).toBe(true);
  });

  it("does not consider a different day notified", () => {
    markNotifiedToday("checkin", "2026-07-17");
    expect(hasNotifiedToday("checkin", "2026-07-18")).toBe(false);
  });

  it("tracks each reminder kind independently", () => {
    markNotifiedToday("checkin", "2026-07-18");
    expect(hasNotifiedToday("hydration", "2026-07-18")).toBe(false);
  });
});
