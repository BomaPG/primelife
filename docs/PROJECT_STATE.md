# PrimeLife: project state

Tracks what exists, what's been verified, and what's next. Updated at the end of each prompt-pack step. See `PrimeLife-MVP-PRD.md` for the full spec and `SCOPE.md` for the binding scope summary.

## What's built

**Step 2 — Onboarding and Settings** (this step):

- Root gate (`app/page.tsx`) — renders nothing, reads the profile via `getProfile()`, and redirects to `/onboarding` or `/home` depending on whether onboarding is complete. Re-run on every load of `/`, which is what makes F1-AC5 hold.
- Onboarding (`app/onboarding/page.tsx`, `F1`) — a single-screen form (not a multi-step wizard, to keep taps low for F1-AC1): optional name, water target (default 8), reminder opt-in, interested-topics checkboxes, and a required disclaimer-acknowledgement checkbox that gates the "Get started" button. Submits via `createProfile` → `acceptDisclaimer` → `markOnboarded`, then routes to `/home`.
- Settings (`app/settings/page.tsx`, `F11`) — same preference fields prefilled from the stored profile, a "Save changes" button (`updateProfile`) with an inline `aria-live` confirmation, an explicit "data lives only on this device" statement (F11-AC3), and a "Clear my data" control that reveals an in-page confirm/cancel step before calling `clearAllLocalData()` and redirecting to `/` (F11-AC2). Split into an outer guard component and an inner `SettingsForm` that seeds its local edit state from a lazy `useState` initializer — avoids the `react-hooks/set-state-in-effect` anti-pattern that a naive "fetch then setState in an effect" version would hit.
- Minimal Home placeholder (`app/(tabs)/home/page.tsx`, satisfies F1-AC1 only) — greets by name if given, links to Settings. The real F3 dashboard (tip, goals, quick logs, weekly summary, affirmation) is Step 3.
- Shared UI: `components/PreferencesFields.tsx` (the name/water/reminders/topics fields, used by both onboarding and Settings — factored out after the first draft duplicated them), `lib/content/topicOptions.ts` (display labels for the five health topics, separate from the still-empty `HealthTopic` content collection), `lib/hooks/useRequireOnboardedProfile.ts` (the "load profile, bounce to `/onboarding` if incomplete" guard shared by Home and Settings).
- `C4` baseline: `app/globals.css` sets the root font-size to 112.5% (16px → 18px) so every rem-based Tailwind text utility scales up; interactive elements use `min-h-11` (44px, comfortably exceeded once the root bump applies to `h`/`min-h` rem values too).

## What's verified

- `npx tsc --noEmit` — zero errors.
- `npx eslint .` — zero errors, zero warnings (the `react-hooks/set-state-in-effect` rule caught a real bug in an early draft of the Settings page — see "What's built").
- `npm run test` (Vitest) — 45/45 tests pass, unchanged from Step 1 (this step didn't touch `lib/db`, `lib/insights`, `lib/daily`, or `lib/content` logic).
- `npm run build` (`next build --webpack`) — succeeds; six static routes generated (`/`, `/home`, `/onboarding`, `/settings`, `/manifest.webmanifest`, `/_not-found`).
- Full flow driven live via gstack's `/browse` skill against the production build:
  - Fresh profile → `/` redirects to `/onboarding`; "Get started" starts disabled and enables only once the disclaimer checkbox is checked (F1-AC3).
  - Filling name + two topics + disclaimer and submitting lands on `/home` with the name reflected ("Welcome back, Amaka") and zero console errors (F1-AC1, F1-AC2).
  - Reloading `/` afterward goes straight to `/home`, not `/onboarding` again (F1-AC5).
  - Direct navigation to `/home` or `/settings` before onboarding is complete bounces to `/onboarding` (guard behavior beyond the letter of the ACs, but necessary for F1-AC5 to actually hold against arbitrary entry points).
  - Settings loads prefilled with the saved values; editing the water target and saving shows "Saved.", and the change survives a full page reload (F11-AC1).
  - "Clear my data" reveals a confirm/cancel step; Cancel leaves data untouched; confirming wipes local data, redirects to `/onboarding`, and the form reflects true defaults (water target back to 8, no topics checked, disclaimer unchecked) — not just a redirect with stale state (F11-AC2).
- Accessibility spot-check: computed `font-size` on the name input is 20.25px (`text-lg` × the 112.5% root bump), well above the 18px floor; computed `min-height` on the submit button is 49.5px, above the 44px floor. Mobile (375×812) screenshot of onboarding reviewed — legible, adequately spaced, disabled-state visually distinct.

Not yet verified: screen-reader pass (only computed CSS and DOM structure checked, not actual AT output); tablet/desktop screenshots were captured but not manually reviewed pixel-by-pixel.

## What's next

**Step 3 — Home, Daily Check-In, quick logs (`F2`, `F3`, `F4`):**

- Replace the Home placeholder with the real dashboard: daily tip, today's goals (hydration/meals/sleep/movement), quick-log shortcuts, weekly summary, daily affirmation — wired to `lib/insights/derived.ts` and `lib/daily/dailyContent.ts`, which already exist and are tested.
- Daily Check-In modal (three questions), auto-launched once per local day from Home, writing through `completeCheckIn`.
- Quick-log controls for water, meals, sleep on Home (and eventually Track) via `addWaterGlass`/`removeWaterGlass`, `upsertMealLog`, `upsertSleepLog`.
- This is also where `content/tips/index.ts` and `content/affirmations/index.ts` need at least placeholder entries — `getTodaysContent` degrades to `undefined` on empty lists today, which Home will need to handle or content will need to gain a first real entry.
