# PrimeLife: project state

Tracks what exists, what's been verified, and what's next. Updated at the end of each prompt-pack step. See `PrimeLife-MVP-PRD.md` for the full spec and `SCOPE.md` for the binding scope summary.

## What's built

**Step 1 — Infrastructure scaffold** (this step, no feature screens):

- Next.js App Router + TypeScript (strict) + Tailwind CSS, scaffolded via `create-next-app`.
- Dexie/IndexedDB schema (`lib/db/schema.ts`) exactly per PRD Section 8: `Profile`, `CheckIn`, `WaterLog`, `MealLog`, `SleepLog`, `Walk`, version-1 stores declaration with `checkins`'s unique `&date` index and `mealLogs`'s compound `[date+mealType]` index.
- Data-access module (`lib/db/dataAccess.ts`) — the single seam constraint `C6` requires. Every local read/write is an intent-named method (`addWaterGlass`, `removeWaterGlass`, `upsertMealLog`, `upsertSleepLog`, `logWalk`, `completeCheckIn`, `createProfile`/`updateProfile`/`markOnboarded`/`acceptDisclaimer`, `clearAllLocalData`, plus range reads for Insights). No other module touches Dexie directly — verified by grep, see "What's verified."
- Derived-logic module (`lib/insights/derived.ts`) — pure functions per PRD Section 11: `getTodaysGoals`, `checkInStreak` (with the "preserved if today's check-in is missing but yesterday's isn't" grace rule), `hydrationStreak`, `movementStreak`, `getWeeklySummary`, `getTrends`. Takes rows in, returns computed values out; never imports Dexie.
- Shared date-arithmetic module (`lib/dates.ts`) — `shiftDate`, `lastNDates`, `todayISO`, UTC-internal so calendar-day shifts don't get perturbed by DST. Used by both the data-access layer and the derived-logic layer instead of duplicating date math in each.
- Content schema and typed loaders per PRD Section 9 (`lib/content/types.ts`, `lib/content/loaders.ts`) — `HealthTopic`, `EducationArticle`, `MealSet`, `Meal`, `DailyTip`, `Affirmation` types, plus synchronous loaders over `/content/{topics,articles,meals,tips,affirmations}`. Collections are empty arrays — content authoring is a separate step (PRD Section 16 placeholders).
- Deterministic daily-content selection (`lib/daily/dailyContent.ts`) per PRD Section 10 / constraint `C7` — `getDayIndex`, `pickDailyTip`, `pickAffirmation`, `getTodaysContent`.
- PWA shell per `F10`: `app/manifest.ts` (installable manifest, placeholder icons at `public/icons/icon-{192,512}.png`), `app/sw.ts` (Serwist service worker, precaches the app shell via `self.__SW_MANIFEST`, uses `@serwist/next`'s `defaultCache` runtime strategies — network-first for pages with a cache fallback).
- `docs/PROJECT_STATE.md` (this file).

No feature screens, meal/article content, or business logic beyond data-access and derived-logic exist yet — `app/page.tsx` is still the default `create-next-app` scaffold, on purpose.

## What's verified

- `npx tsc --noEmit` — zero errors (TypeScript strict mode).
- `npx eslint .` — zero errors, zero warnings (generated `public/sw.js` excluded from linting — it's build output, not source).
- `npm run test` (Vitest) — 45/45 tests pass across 4 files:
  - `lib/dates.test.ts` — date-shift edge cases (month/year/leap-day boundaries).
  - `lib/insights/derived.test.ts` — today's goals, all three streak rules (including the check-in grace-day case and the "breaks after a full day" case), weekly summary, trends.
  - `lib/daily/dailyContent.test.ts` — day-index determinism, modulo wraparound, empty-list safety.
  - `lib/db/dataAccess.test.ts` — Dexie integration tests against `fake-indexeddb`: profile CRUD, `completeCheckIn` upserting `sleepLogs.quality` without a duplicate row or clobbering a separately-set `hours` value, the `[date+mealType]` compound-index dedup in `upsertMealLog`, water glass floor-at-zero, multi-walk-per-day, range reads, and `clearAllLocalData` (F11-AC2).
- `npm run build` (`next build --webpack`) — succeeds. Turbopack is Next 16's default but `@serwist/next`'s `InjectManifest` plugin requires webpack, so both `dev` and `build` scripts pin `--webpack` explicitly; `next.config.ts` disables Serwist for `NODE_ENV=development` so `next dev`'s lack of Turbopack support there doesn't matter.
- Offline path (`F10-AC3`, constraint `C1`): built the app, served it with `next start`, loaded it once via gstack's `/browse` skill to let the service worker install (confirmed `navigator.serviceWorker.ready` reports `"activated"`), then killed the origin server entirely and reloaded — the page still rendered full content with zero console errors, served from the precache.
- Architectural boundary (`C6`): grepped `lib/insights`, `lib/daily`, `lib/content` for `dexie`/`getDB`/`dataAccess` — no matches. The only references to `lib/db/schema` from outside `lib/db` are `import type`, which erases at compile time, so the pure layers never touch Dexie at runtime.

Not yet verified: PWA installability on an actual Android Chrome device (only confirmed manifest + service worker + offline-reload programmatically); first-load transfer size against a KB budget (PRD Section 16 leaves the budget itself as an open placeholder).

## What's next

**Step 2 — Onboarding and Settings (`F1`, `F11`):**

- First-run onboarding flow: name (optional), water target, reminder opt-in, interested topics, ending in `createProfile` + `markOnboarded`.
- Disclaimer screen gating health content, wired to `acceptDisclaimer` (`F1-AC3`, constraint `C5`).
- Settings screen: edit the same preferences post-onboarding (`updateProfile`), plus the "clear my data" confirm-and-wipe flow (`clearAllLocalData`, `F11-AC2`) that returns the app to first-run state.
- First real UI screens — this is where `C4` (18px+ body text, 44px+ tap targets, high contrast) starts actually applying to markup, not just being a stated constraint.
