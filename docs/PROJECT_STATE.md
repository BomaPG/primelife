# PrimeLife: project state

Tracks what exists, what's been verified, and what's next. Updated at the end of each prompt-pack step. See `PrimeLife-MVP-PRD.md` for the full spec and `SCOPE.md` for the binding scope summary.

## What's built

**Step 3 — Home, Daily Check-In, quick logs** (this step):

- Home (`app/(tabs)/home/page.tsx`, `F3`) — replaces the Step 2 placeholder with the real dashboard. Owns all of today's + this week's data in one `reload()` that every write handler calls after its write, so quick-log changes reflect immediately with no page reload (F3-AC3). Renders: today's tip (`F3-AC1`), a check-in launcher or "Checked in today ✓", today's goals with live progress (`F3-AC2`, via `getTodaysGoals`), the three quick-log controls, a weekly summary (`F3-AC4`, via `getWeeklySummary`), and the daily affirmation (`F3-AC5`) — each read from local Dexie state only, no network call (`F3-AC6`).
- Daily Check-In (`components/CheckInModal.tsx`, `F2`) — one question at a time; tapping an answer immediately advances and auto-submits after the third, so completing it is exactly three taps with no separate submit tap (F2-AC5). Auto-launches from Home the first time a given local day is opened, unless already checked in or already dismissed that day (`F2-AC1`); dismissing doesn't relaunch it again the same day but leaves it reachable via a "Daily check-in" button (`F2-AC3`). Writes through the existing `completeCheckIn` (`F2-AC2`, `F2-AC4` — the streak itself is unchanged, already tested in Step 1).
- `lib/checkInDismissal.ts` (+ test) — small localStorage helper backing the "dismissed today" state. Deliberately outside Dexie/the data-access layer: it's UI session state, not app data, and the PRD fixes the Dexie schema exactly with no new fields allowed.
- Quick-log components (`components/quickLogs/{Water,Meals,Sleep}QuickLog.tsx`, `F4`) — presentational only; Home owns the data-access calls. Water is tap-to-increment/decrement (`F4-AC1`). Meals mark breakfast/lunch/dinner done with an optional note (`F4-AC2`). Sleep sets optional hours (on blur) and quality (on tap) via the same `upsertSleepLog` the check-in uses for quality — both key off `sleepLogs`' `date` primary key, so there is structurally one row per day regardless of which path writes to it (`F4-AC3`, and this step's explicit no-duplicate-rows constraint). No calorie/macro/weight field exists anywhere (`F4-AC4`).

## What's verified

- `npx tsc --noEmit`, `npx eslint .` — zero errors.
- `npm run test` (Vitest) — 49/49 tests pass (45 from Steps 1–2 plus 4 new ones for `checkInDismissal`).
- `npm run build` (`next build --webpack`) — succeeds, same six static routes as Step 2.
- Full flow driven live via gstack's `/browse` skill against the production build:
  - Fresh onboarding → check-in auto-launches on first Home visit (F2-AC1); three taps (one per question, no submit tap) completes it and closes the modal (F2-AC5).
  - **Check-in-to-logs, verified by reading IndexedDB directly, not just the UI**: completing the check-in with sleep quality "Good" immediately showed "Good" pressed in the Sleep quick-log; then setting hours via the quick-log and reading `sleepLogs` straight from IndexedDB showed exactly one row — `{date, hours: 7.5, quality: "good", ...}` — confirming the check-in and the quick-log wrote through the same seam into the same row, not two.
  - Dismiss flow (`F2-AC3`) tested end to end on a separate fresh profile: "Not now" closes the modal; reloading Home afterward does **not** relaunch it; the manual "Daily check-in" button reopens it; completing it from there writes exactly one `checkins` row (verified via IndexedDB — `getAll()` returned a single entry).
  - Water quick-log: four taps of "+" against a water target of 4 showed live "4 / 4 glasses — goal reached" with no reload; "−" is disabled at zero.
  - Meals quick-log: marking breakfast done and setting a note, then reading `mealLogs` from IndexedDB directly, showed exactly one row (`{mealType: "breakfast", done: true, note: "Akara and pap"}`) and Home's goal counter read "1 / 3 logged".
  - Weekly summary numbers (`nightsWithSleepLog`, `checkInsCompleted`, `totalWalks`, etc.) matched the day's activity in the rendered text.
  - **Offline (`C1`), explicit per this step's instructions**: loaded Home once to let the service worker precache, confirmed `navigator.serviceWorker.ready` reports `"activated"`, then killed the origin server outright (not just simulated) and reloaded — Home rendered full state (goals, weekly summary, check-in status) with zero console errors, entirely from precache + local IndexedDB. Then, still with the server down, tapped "+" on the water quick-log twice — the write succeeded and the UI updated live, confirming IndexedDB reads *and writes* work with zero network, not just cached reads.
- Accessibility spot-check on the rebuilt Home: computed `font-size` on the `h1` is 33.75px (`text-3xl` × the root bump), computed `min-height` on buttons is 49.5px — both comfortably clear the `C4` floors. Reviewed a mobile (375×812) screenshot: legible, well-spaced, the selected sleep-quality button is visually distinct by fill/weight, not color alone.

One QA-tooling note, not an app bug: `/browse`'s `click @ref` occasionally failed with "Selector matched multiple elements" on repeated snapshots of the check-in modal; worked around with a direct `document.querySelectorAll(...)[i].click()`. Didn't affect what was being verified (the app's own behavior), just how the click was dispatched.

Not yet verified: `content/tips/index.ts` and `content/affirmations/index.ts` are still empty (per PRD Section 0 rule 4 — placeholder content must be left as a placeholder, not authored by an implementing agent), so the tip/affirmation sections never actually render during this QA pass; they're conditionally hidden when empty rather than showing fabricated copy. The deterministic-selection mechanism itself (`getDayIndex`/`pickDailyTip`/`pickAffirmation`) is unit-tested and wired into Home correctly, but F3-AC1 and F3-AC5 can't be visually confirmed until that content is authored.

## What's next

**Step 4 — Walking Journal (`F5`):**

- Log a walk (required duration, optional distance, optional note) via the already-built `logWalk`, on the Move tab (new — first screen outside the `home` route group).
- Weekly walking summary (total walks, minutes, distance) — `getWeeklySummary`'s `totalWalks`/`totalWalkMinutes` already compute this; the Move tab needs a distance equivalent, and `getTrends`' `walkMinutesPerDay` is already available for a future Track step.
- Once a walk is logged, Home's "Movement" goal (`goals.movement.met`) and the "This week" walk stats should start reflecting real data instead of the permanent zero/false they've shown since Step 3, since `getWalks`/`getWalksInRange` are already wired into Home's `reload()`.
