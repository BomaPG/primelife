/**
 * Thin wrapper over the Web Notifications API (F9-AC2). Deliberately does
 * NOT touch `PushManager`/push subscriptions — reliable notifications while
 * the app is closed need a push server, which is explicitly out of scope
 * (F9-AC4, C2/SCOPE.md: no backend of any kind). Everything here only ever
 * fires while the app (or its service worker) is already running, as a
 * best-effort in-page nudge.
 *
 * Every function is safe to call unconditionally and never throws or
 * rejects — unsupported, undecided, or denied permission, and any runtime
 * error, all degrade silently to "do nothing" (F9-AC2/AC3), and none of
 * them are ever awaited before rendering (F9-AC3).
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** Fire-and-forget: safe to call without awaiting, never throws. */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

const SERVICE_WORKER_READY_TIMEOUT_MS = 2000;

/**
 * `"serviceWorker" in navigator` only detects API *support*, not that a
 * worker is actually registered and active — `navigator.serviceWorker.ready`
 * resolves once one activates, but never resolves or rejects at all if none
 * ever does (registration disabled in dev, a one-time install hiccup, a
 * browser edge case). Races it against a short timeout instead of awaiting
 * it unconditionally, so a stuck/absent registration falls through to the
 * plain-constructor path below rather than silently stranding every future
 * reminder for the rest of the session.
 */
async function getReadyServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), SERVICE_WORKER_READY_TIMEOUT_MS)),
    ]);
  } catch {
    return null;
  }
}

/**
 * Best-effort: shows a notification only if supported and already granted.
 * Prefers `ServiceWorkerRegistration.showNotification` — on Android Chrome
 * (this app's primary target platform, per PRD Section 5's `P1` persona),
 * the plain `Notification` constructor throws and callers are required to
 * go through an active service worker registration instead. Falls back to
 * the plain constructor when no service worker becomes ready in time (see
 * `getReadyServiceWorkerRegistration` above). Fire-and-forget: safe to call
 * without awaiting, never throws or rejects.
 */
export async function showReminderNotification(title: string, body: string): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    const registration = await getReadyServiceWorkerRegistration();
    if (registration) {
      await registration.showNotification(title, { body });
      return;
    }
    new Notification(title, { body });
  } catch {
    // Best-effort only — in-app banners (F9-AC1) are the reminder path
    // this feature never depends on succeeding.
  }
}
