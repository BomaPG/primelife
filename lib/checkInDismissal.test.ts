// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { getDismissedDate, isDismissedToday, setDismissedDate } from "@/lib/checkInDismissal";

beforeEach(() => {
  window.localStorage.clear();
});

describe("checkInDismissal", () => {
  it("has no dismissed date by default", () => {
    expect(getDismissedDate()).toBeNull();
    expect(isDismissedToday("2026-07-18")).toBe(false);
  });

  it("remembers the dismissed date across reads", () => {
    setDismissedDate("2026-07-18");
    expect(getDismissedDate()).toBe("2026-07-18");
    expect(isDismissedToday("2026-07-18")).toBe(true);
  });

  it("does not consider a different day dismissed", () => {
    setDismissedDate("2026-07-17");
    expect(isDismissedToday("2026-07-18")).toBe(false);
  });

  it("overwrites the previous dismissed date rather than accumulating", () => {
    setDismissedDate("2026-07-17");
    setDismissedDate("2026-07-18");
    expect(getDismissedDate()).toBe("2026-07-18");
  });
});
