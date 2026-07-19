// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  showReminderNotification,
} from "@/lib/reminders/notifications";

// jsdom (this project's test environment) doesn't implement the
// Notification API, so it's a real "unsupported" environment rather than a
// hand-built double — exactly the degrade-silently path F9-AC2 requires.
// The permission-granted/service-worker branches are covered live via
// Playwright in a real browser instead of mocked here, since faking
// read-only DOM globals (`Notification`, `navigator.serviceWorker`) would
// test the mock more than the code.
describe("notifications, unsupported environment", () => {
  it("reports no support", () => {
    expect(isNotificationSupported()).toBe(false);
  });

  it("reports permission as 'unsupported'", () => {
    expect(getNotificationPermission()).toBe("unsupported");
  });

  it("resolves 'unsupported' instead of throwing when permission is requested", async () => {
    await expect(requestNotificationPermission()).resolves.toBe("unsupported");
  });

  it("resolves without throwing when asked to show a notification", async () => {
    await expect(showReminderNotification("Title", "Body")).resolves.toBeUndefined();
  });
});
