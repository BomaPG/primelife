# PrimeLife: MVP Product Requirements Document

**Version:** 1.0
**Status:** Approved for build
**Document type:** AI-optimised PRD (written for ingestion by a coding agent)

## 0. How to use this document

This PRD is written to be handed to a coding agent (for example Claude Code, Antigravity, or Codex) one section at a time via a sequential prompt pack. Every feature, user story, and acceptance criterion carries a stable ID (`F1`, `F1-S1`, `F1-AC1`) so that prompts can reference a spec precisely without re-describing it.

Rules for any agent implementing this document:

1. Treat Section 3 (Scope) as binding. Do not build anything marked OUT OF SCOPE.
2. Treat Section 4 (Non-negotiable constraints) as always-on. Every feature must satisfy them.
3. Treat Section 8 (Data model) and Section 9 (Content schema) as the single source of truth for shapes and types. Do not invent fields.
4. When a value is genuinely unknown it is wrapped as `[PLACEHOLDER: insert - X]`. Leave the placeholder in place; do not guess.
5. Acceptance criteria are testable. A feature is done only when every AC under it passes.

## 1. Product overview

PrimeLife helps women aged 45 to 65 build healthier daily habits through simple guidance, localised nutrition, and light habit tracking. The MVP focuses on education and habit formation, not medical diagnosis or advanced fitness tracking.

The product is two things sharing one shell: a habit engine (daily check-in, logs, streaks, insights, walking journal) that gives a daily reason to open the app, and a localised content library (meal recommendations and education) that draws users in and builds trust. The habit engine is dynamic and local; the content library is static and cached. This split is the central architectural decision and everything below respects it.

## 2. Goals and non-goals

Goals for the MVP:

- Give the user one simple daily loop: check in, see today's guidance, log a few habits, watch progress build.
- Provide trustworthy, culturally familiar meal recommendations for common midlife health categories.
- Provide plain-language education on menopause, high blood pressure, and blood sugar.
- Work fully offline and cost almost no mobile data.
- Require no account and no login.

Non-goals for the MVP:

- No diagnosis, no symptom-to-cause guidance, no personalised medical advice.
- No calorie counting or weight targets.
- No cloud sync, no cross-device continuity, no user accounts.
- No exercise video library.
- No recipes with ingredients and cooking steps.

## 3. Scope

### 3.1 In scope (MVP)

Habit engine:

- Daily Check-In (three questions), launched once per day from Home.
- Home dashboard: daily health tip, today's goals with progress, quick-log shortcuts, weekly progress summary, daily affirmation.
- Quick logs: water, meals, sleep.
- Walking Journal: log a walk with duration, optional distance, optional note, plus a weekly walking summary.
- Track: daily logs view plus Insights (weekly summary, habit streaks, simple trends).

Content library:

- Meal recommendations (no recipes) for four health categories: High blood pressure, Blood sugar, Heart health, Weight management. Each category lists recommended meals split across breakfast, lunch, and dinner, with a short "why this works" line per meal.
- Education articles for three topics: Menopause and healthy ageing, Understanding high blood pressure, Understanding blood sugar.
- Cross-linking: the high blood pressure and blood sugar topics each have both an education article and a meal set, and link to each other.
- Daily wellness tips and daily affirmations (the Thrive content), surfaced on Home and in Learn.

Platform:

- Installable, offline-first Progressive Web App.
- Local-first storage as the source of truth.
- First-run onboarding and disclaimer acceptance.
- In-app reminders, with opt-in notification permission where supported.

### 3.2 Out of scope (deferred to phase 2 or later)

- Full Exercise Library and condition-specific exercise collections.
- Symptom Guide (what a symptom might indicate, common causes, when to seek care).
- Cloud sync, accounts, authentication, cross-device continuity.
- Recipes with ingredients and steps.
- Bone health and other health categories beyond the four listed.
- Reliable scheduled push notifications that fire while the app is closed (requires the cloud layer; see F8).

## 4. Non-negotiable constraints

These apply to every feature. An agent must not ship a feature that violates any of them.

- `C1 Offline-first`: the full app (all logs, all content, all insights) must work with no network connection after first load. Local storage is the source of truth.
- `C2 No account`: no login, no sign-up, no email or phone capture as a gate. The app is usable within seconds of first open.
- `C3 Data thrift`: no autoplaying video, no large media downloads on load, images optimised and lazy-loaded. Assume expensive, intermittent mobile data.
- `C4 Accessibility`: WCAG 2.1 AA. Base body text at least 18px and scalable. Minimum tap target 44 by 44 CSS pixels. High contrast. No meaning conveyed by colour alone. Plain language at roughly a lower-secondary reading level.
- `C5 Safety framing`: every health content surface (meals and education) shows a persistent, plain "this is general guidance, not medical advice" disclaimer. No content personalises to imply diagnosis. Emergency framing uses "if you feel very unwell, go to the nearest clinic or hospital" rather than assuming an emergency phone system.
- `C6 Sync seam`: all writes to local storage go through a single data-access layer so that a future sync adapter can be added without touching feature code. No feature reads or writes IndexedDB directly.
- `C7 Deterministic daily content`: the daily tip and daily affirmation are selected by date, computed on-device, so they are stable and identical offline and online for a given day.

## 5. Personas

- `P1 Primary`: a woman aged 45 to 65 in Nigeria, on a mid-range Android phone, on costly and intermittent data, comfortable with WhatsApp but not a heavy app user. Wants simple, trustworthy guidance and a gentle sense of progress.
- `P2 Secondary`: an adult daughter or relative who installs the app for P1 and may help set it up once.

## 6. Information architecture and navigation

Five bottom-tab surfaces:

1. `Home`: daily loop hub. Hosts the Daily Check-In launcher, daily tip, today's goals, quick-log shortcuts, weekly progress, daily affirmation.
2. `Nourish`: meal recommendations by health category.
3. `Move`: Walking Journal (log a walk, weekly walking summary). Exercise Library is deferred; the tab may show a single "coming soon" note beneath the journal.
4. `Track`: daily logs plus Insights (weekly summary, streaks, trends).
5. `Learn`: education articles, wellness tips, affirmations.

The Daily Check-In is a modal flow launched from Home the first time the app is opened each day. It is not a tab.

## 7. Features

Format: each feature has a description, user stories (`Fn-Sn`), and acceptance criteria (`Fn-ACn`). Acceptance criteria are testable pass or fail statements.

### F1: First-run onboarding and disclaimer

Description: a short, skippable-where-safe first-run flow that requires no account and captures a few local preferences.

Stories:

- `F1-S1`: As P1, I want to start using the app immediately without creating an account, so that there is no barrier.
- `F1-S2`: As P1, I want to set a water goal and choose the health topics I care about, so that the app feels relevant.
- `F1-S3`: As P1, I want to see and accept a plain-language disclaimer once, so that I understand what the app is and is not.

Acceptance criteria:

- `F1-AC1`: On first open, the user reaches a usable Home within three taps or fewer.
- `F1-AC2`: Onboarding captures optional first name, water target (default 8 glasses), reminder opt-in, and interested topics; all are editable later in settings.
- `F1-AC3`: The disclaimer (`C5`) must be acknowledged once before health content is shown; acknowledgement timestamp is stored locally in `profile.disclaimerAcceptedAt`.
- `F1-AC4`: No network request is required to complete onboarding.
- `F1-AC5`: Re-opening the app after onboarding never shows onboarding again unless local data is cleared.

### F2: Daily Check-In

Description: a once-per-day, three-question flow that is the friendly front door to logging. Its answers write into the same logs the Track surface reads, so nothing is captured twice.

The three questions:

1. How did you sleep? (good, okay, poor)
2. How are you feeling today? (great, okay, low)
3. Did you move yesterday? (yes, no)

Stories:

- `F2-S1`: As P1, I want a quick morning check-in, so that logging feels light and I build a daily habit.
- `F2-S2`: As P1, I want my check-in answers to feed my logs and streaks, so that I never enter the same thing twice.

Acceptance criteria:

- `F2-AC1`: The check-in launches automatically from Home the first time the app is opened on a given local calendar day, and can be dismissed.
- `F2-AC2`: Completing the check-in writes one `checkins` row for today and upserts `sleepLogs.quality` for today and records the "moved yesterday" answer.
- `F2-AC3`: If the check-in is dismissed, it can be reopened from Home the same day; it does not relaunch automatically again that day.
- `F2-AC4`: Completing the check-in increments the check-in streak per the rules in Section 11.
- `F2-AC5`: The flow works fully offline and takes no more than three taps to complete.

### F3: Home dashboard

Description: the daily loop hub.

Stories:

- `F3-S1`: As P1, I want one screen that shows today's tip, my goals, quick logging, my weekly progress, and an affirmation, so that I know what to do at a glance.

Acceptance criteria:

- `F3-AC1`: Shows the daily health tip selected deterministically by date (`C7`).
- `F3-AC2`: Shows "today's goals" with live progress: hydration (glasses versus target), meals (count of breakfast, lunch, dinner logged out of 3), sleep (logged yes or no), movement (a walk logged today yes or no).
- `F3-AC3`: Shows quick-log shortcuts for water, meals, and sleep that write immediately and update goal progress without a page reload.
- `F3-AC4`: Shows a weekly progress summary derived from the last 7 local days per Section 11.
- `F3-AC5`: Shows the daily affirmation selected deterministically by date (`C7`).
- `F3-AC6`: All values render from local storage with no network call.

### F4: Quick logs (water, meals, sleep)

Description: fast, low-friction logging primitives used from Home and Track.

Stories:

- `F4-S1`: As P1, I want to add a glass of water with one tap, so that tracking hydration is effortless.
- `F4-S2`: As P1, I want to mark a meal as eaten and optionally note it, so that I keep a simple food rhythm.
- `F4-S3`: As P1, I want to record my sleep hours and quality, so that I can see my rest over time.

Acceptance criteria:

- `F4-AC1 Water`: one tap increments today's water count by one glass; a second control decrements; the day total is stored as a single `waterLogs` row per date.
- `F4-AC2 Meals`: the user can mark breakfast, lunch, and dinner as done for today, each with an optional short note and an optional link to a recommended meal (`Meal.id`); stored as one `mealLogs` row per date and meal type.
- `F4-AC3 Sleep`: the user can record optional hours (number) and quality (good, okay, poor) for today, stored as one `sleepLogs` row per date; quality set here or by the check-in must not create duplicate rows.
- `F4-AC4`: No calorie, macro, or weight entry appears anywhere.
- `F4-AC5`: All logs write offline and are immediately reflected in goals and insights.

### F5: Walking Journal (Move)

Description: log walks and see a weekly walking summary. This is the only Move feature in the MVP.

Stories:

- `F5-S1`: As P1, I want to log a walk with its duration, so that I can stay motivated to move.
- `F5-S2`: As P1, I want an optional distance and a note, so that I can capture a little more when I want to.
- `F5-S3`: As P1, I want a weekly walking summary, so that I can see my effort add up.

Acceptance criteria:

- `F5-AC1`: The user can log a walk with required duration in minutes, optional distance in kilometres, and an optional note; stored as one `walks` row (multiple walks per day allowed).
- `F5-AC2`: A weekly walking summary shows total walks, total minutes, and total distance for the last 7 local days.
- `F5-AC3`: Logging a walk today counts toward the movement goal on Home for today.
- `F5-AC4`: Works fully offline.

### F6: Track and Insights

Description: a review surface for daily logs plus light insight (streaks, weekly summary, simple trends).

Stories:

- `F6-S1`: As P1, I want to see what I logged each day, so that I have a simple record.
- `F6-S2`: As P1, I want to see my streaks and weekly summary, so that I feel encouraged.
- `F6-S3`: As P1, I want to see simple trends, so that I can notice patterns without complexity.

Acceptance criteria:

- `F6-AC1`: A daily logs view shows, per day, water glasses, meals logged, sleep hours and quality, and walks.
- `F6-AC2`: Insights show the check-in streak, the hydration streak, and the movement streak per Section 11.
- `F6-AC3`: Insights show a weekly summary per Section 11.
- `F6-AC4`: Insights show simple 7-day trends for water glasses and walk minutes, and a 7-day sleep-quality distribution. Trends are rendered as lightweight visuals with no heavy charting dependency where avoidable.
- `F6-AC5`: All computed offline from local storage.

### F7: Nourish (meal recommendations)

Description: recommended Nigerian meals for four health categories, no recipes.

Stories:

- `F7-S1`: As P1, I want to see meals that are good for my health condition, so that I can eat with confidence.
- `F7-S2`: As P1, I want the meals split into breakfast, lunch, and dinner with a short reason each, so that it is easy to plan my day.
- `F7-S3`: As P1, I want to jump from a meal category to the matching education article, so that I understand the "why".

Acceptance criteria:

- `F7-AC1`: Nourish lists four categories: High blood pressure, Blood sugar, Heart health, Weight management.
- `F7-AC2`: Each category shows recommended meals grouped under breakfast, lunch, and dinner, each meal with a name and a short "why this works" line, sourced from `MealSet` content (Section 9).
- `F7-AC3`: The High blood pressure and Blood sugar categories show a link to their matching education article.
- `F7-AC4`: A persistent disclaimer (`C5`) is visible on every Nourish screen.
- `F7-AC5`: All content is bundled and served offline; no network call to view meals.
- `F7-AC6`: The user can optionally attach a shown meal to a meal log for today (writes `mealLogs.recommendedMealId`).

### F8: Learn (education, wellness tips, affirmations)

Description: plain-language education plus the daily wellbeing content.

Stories:

- `F8-S1`: As P1, I want to read simple articles on menopause, blood pressure, and blood sugar, so that I feel informed.
- `F8-S2`: As P1, I want daily wellness tips and affirmations, so that I feel supported.
- `F8-S3`: As P1, I want to move from a health article to matching meals, so that knowledge connects to action.

Acceptance criteria:

- `F8-AC1`: Learn lists three education articles: Menopause and healthy ageing, Understanding high blood pressure, Understanding blood sugar.
- `F8-AC2`: Each article renders from `EducationArticle` content (Section 9) with a visible last-reviewed date and disclaimer (`C5`).
- `F8-AC3`: The blood pressure and blood sugar articles link to their matching meal set.
- `F8-AC4`: Learn surfaces wellness tips and affirmations; the same daily affirmation shown on Home appears here.
- `F8-AC5`: All content offline.

### F9: Reminders and notifications

Description: gentle nudges for the morning check-in and hydration.

Stories:

- `F9-S1`: As P1, I want a gentle reminder to check in and to drink water, so that I keep my habits.

Acceptance criteria:

- `F9-AC1`: In-app reminders (banners or cards shown while the app is open) prompt the morning check-in if not yet done today, and hydration if below target later in the day.
- `F9-AC2`: If the user opts in and the device supports it, the app requests notification permission and may use the Web Notifications API; if unsupported or declined, the app degrades silently to in-app reminders only.
- `F9-AC3`: The app never blocks core use on notification permission.
- `F9-AC4`: Reliable scheduled push while the app is closed is explicitly deferred; this feature must not depend on a server. `[PLACEHOLDER: insert - final reminder copy]`.

### F10: PWA shell and offline

Description: installable, offline-capable container.

Stories:

- `F10-S1`: As P1, I want to install the app to my home screen and use it without data, so that it is always available.

Acceptance criteria:

- `F10-AC1`: A valid web app manifest and icons make the app installable on Android Chrome. `[PLACEHOLDER: insert - app icon and splash assets]`.
- `F10-AC2`: A service worker precaches the app shell and all bundled content collections on first load.
- `F10-AC3`: After first load, every route in Section 6 opens offline.
- `F10-AC4`: The app clearly indicates offline status where a user might expect network behaviour, but never breaks.
- `F10-AC5`: Total first-load transfer stays within a strict budget. `[PLACEHOLDER: insert - first-load KB budget]`.

### F11: Settings and data control

Description: local preferences and honest data control.

Stories:

- `F11-S1`: As P1, I want to change my water target, reminders, and topics, so that the app stays useful.
- `F11-S2`: As P1, I want to clear my data, so that I stay in control.

Acceptance criteria:

- `F11-AC1`: Settings can edit name, water target, reminder opt-in, and interested topics; changes persist locally.
- `F11-AC2`: A "clear my data" action wipes all local user data after a confirm step and returns the app to first-run state.
- `F11-AC3`: Settings states plainly that data lives only on this device in the MVP.

## 8. Data model (local, source of truth)

Storage: IndexedDB via Dexie. All access goes through a single data-access module (`C6`). No feature touches Dexie directly.

TypeScript shapes:

```ts
type ISODate = string; // "YYYY-MM-DD", local calendar day
type SleepQuality = "good" | "okay" | "poor";
type Feeling = "great" | "okay" | "low";
type MealType = "breakfast" | "lunch" | "dinner";

interface Profile {
  id: "singleton";
  name?: string;
  createdAt: number;              // epoch ms
  onboardedAt?: number;
  disclaimerAcceptedAt?: number;
  waterTargetGlasses: number;     // default 8
  remindersEnabled: boolean;      // default false
  interestedTopics: string[];     // HealthTopic ids
}

interface CheckIn {
  id?: number;                    // auto
  date: ISODate;                  // unique
  sleepQuality: SleepQuality;
  feeling: Feeling;
  movedYesterday: boolean;
  createdAt: number;
}

interface WaterLog {
  date: ISODate;                  // primary key, one row per day
  glasses: number;                // running count for the day
  updatedAt: number;
}

interface MealLog {
  id?: number;                    // auto
  date: ISODate;
  mealType: MealType;             // unique together with date
  done: boolean;
  note?: string;
  recommendedMealId?: string;     // Meal.id from content
  createdAt: number;
}

interface SleepLog {
  date: ISODate;                  // primary key, one row per day
  hours?: number;
  quality?: SleepQuality;         // may be set by check-in
  updatedAt: number;
}

interface Walk {
  id?: number;                    // auto
  date: ISODate;
  durationMins: number;           // required
  distanceKm?: number;            // optional
  note?: string;
  createdAt: number;
}
```

Dexie version 1 stores declaration:

```ts
db.version(1).stores({
  profile: "id",
  checkins: "++id, &date",
  waterLogs: "date",
  mealLogs: "++id, date, [date+mealType]",
  sleepLogs: "date",
  walks: "++id, date"
});
```

Notes for the agent:

- `checkins.date` is unique (`&date`); a second check-in on the same day updates the existing row.
- `mealLogs` uses a compound index `[date+mealType]` to enforce one row per meal slot per day at the data-access layer.
- Date fields are indexed to support 7-day range queries for insights.
- The data-access module exposes intent-named methods (for example `addWaterGlass(date)`, `upsertMealLog(...)`, `logWalk(...)`, `completeCheckIn(...)`), not raw table access. The future sync adapter subscribes here.

## 9. Content schema (static, content-as-code)

Content ships in the repo as versioned, git-reviewable data (TypeScript modules or MDX plus typed frontmatter), statically built and precached. No CMS in the MVP.

```ts
interface HealthTopic {
  id: string;                     // "blood-pressure", "blood-sugar", "menopause", "heart-health", "weight-management"
  title: string;
  slug: string;
  summary: string;                // one or two plain sentences
  hasEducation: boolean;
  hasMeals: boolean;
  relatedTopicIds?: string[];     // for cross-linking
}

interface EducationArticle {
  id: string;
  topicId: string;                // HealthTopic.id
  title: string;
  slug: string;
  readingTimeMins: number;
  body: string;                   // markdown or MDX, plain language
  lastReviewed: ISODate;
  disclaimer: string;             // rendered per C5
  sources?: string[];             // plain references
}

interface MealSet {
  id: string;
  topicId: string;                // HealthTopic.id
  title: string;                  // e.g. "Meals for high blood pressure"
  disclaimer: string;             // rendered per C5
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
  };
}

interface Meal {
  id: string;
  name: string;                   // familiar Nigerian meal
  whyItWorks: string;             // one short line tied to the condition
}

interface DailyTip {
  id: string;
  text: string;
  topicId?: string;
}

interface Affirmation {
  id: string;
  text: string;
}
```

Required MVP content instances (bodies to be written and reviewed):

- Health topics: `blood-pressure`, `blood-sugar`, `menopause`, `heart-health`, `weight-management`.
- Education articles: one each for `menopause`, `blood-pressure`, `blood-sugar`. `[PLACEHOLDER: insert - reviewed article bodies and last-reviewed dates]`.
- Meal sets: one each for `blood-pressure`, `blood-sugar`, `heart-health`, `weight-management`, each with breakfast, lunch, and dinner meals and a "why this works" line per meal. `[PLACEHOLDER: insert - reviewed meal lists per category]`.
- Daily tips: a rotating list. `[PLACEHOLDER: insert - daily tips list]`.
- Affirmations: a rotating list. `[PLACEHOLDER: insert - affirmations list]`.

Cross-linking rule: `blood-pressure` and `blood-sugar` each set `hasEducation: true` and `hasMeals: true` and list the other in `relatedTopicIds`. `heart-health` and `weight-management` set `hasMeals: true`, `hasEducation: false`. `menopause` sets `hasEducation: true`, `hasMeals: false`.

## 10. Key data flows

Morning check-in to logs:

1. User completes the Daily Check-In (`F2`).
2. The data-access layer writes or updates today's `checkins` row.
3. It upserts today's `sleepLogs.quality` from the sleep answer (no duplicate row).
4. It records the "moved yesterday" answer on the check-in row; movement streak logic reads it per Section 11.
5. Home re-reads today's state and updates goals and streaks with no reload.

Quick log to goals and insights:

1. User taps a quick-log control (`F4`).
2. The data-access layer writes the appropriate row.
3. Home goal progress and Track insights recompute from local storage on next read; both are pure functions of the stored rows.

Content selection (deterministic, offline):

- Let `dayIndex = floor(localMidnightEpochMs / 86400000)`.
- Daily tip = `dailyTips[dayIndex % dailyTips.length]`.
- Daily affirmation = `affirmations[dayIndex % affirmations.length]`.
- The same `dayIndex` is used everywhere the daily tip or affirmation is shown, so Home and Learn agree.

## 11. Derived logic (specify exactly)

Today's goals (`F3-AC2`):

- Hydration: met when `waterLogs[today].glasses >= profile.waterTargetGlasses`.
- Meals: progress is the count of `mealLogs` rows for today where `done === true`, out of 3.
- Sleep: met when a `sleepLogs[today]` row exists with either hours or quality set.
- Movement: met when at least one `walks` row exists for today.

Streaks (`F6-AC2`), all computed as consecutive local days ending today:

- Check-in streak: consecutive days (ending today or yesterday) with a `checkins` row. The streak is preserved if today is not yet checked in but yesterday was; it breaks only when a full day passes with no check-in.
- Hydration streak: consecutive days meeting the hydration goal.
- Movement streak: consecutive days with at least one walk logged.

Weekly summary (`F3-AC4`, `F6-AC3`), over the last 7 local days including today:

- Average water glasses per day.
- Number of nights with a sleep log.
- Total walk minutes and total walks.
- Number of meals logged.
- Number of check-ins completed.
- A simple mood read from `checkins.feeling` (for example most common feeling this week).

Trends (`F6-AC4`), last 7 days:

- Water glasses per day (series of 7).
- Walk minutes per day (series of 7).
- Sleep quality distribution (counts of good, okay, poor).

All of the above are pure functions of stored rows and must be unit-testable in isolation.

## 12. Technical architecture

- Framework: Next.js (App Router), React, TypeScript.
- Styling: Tailwind CSS, tuned for large text, high contrast, and 44px tap targets (`C4`).
- Local storage: Dexie over IndexedDB, behind a single data-access module (`C6`).
- Content: static content collections (typed TS modules or MDX with typed frontmatter), statically generated at build time.
- Offline: a service worker (Serwist or Workbox) precaches the app shell and content; user-data views are client-rendered from Dexie.
- Rendering: content routes use static generation; user-data views are client components that read local storage, so the MVP needs no server runtime and no API routes.
- Charts: prefer lightweight, dependency-light visuals for trends to protect the data budget (`C3`); a small charting library is acceptable only if it does not materially grow first-load transfer.

Suggested structure (guide, not law):

```
/app
  /(tabs)/home
  /(tabs)/nourish
  /(tabs)/move
  /(tabs)/track
  /(tabs)/learn
  /onboarding
  /settings
/lib
  /db            // Dexie schema + data-access module (the sync seam)
  /insights      // pure derived-logic functions (Section 11)
  /content       // typed loaders for static content
  /daily         // deterministic daily-content selection (Section 10)
/content
  /topics
  /articles
  /meals
  /tips
  /affirmations
/components
/public          // manifest, icons
```

## 13. Deployment strategy

- Host: Vercel.
- Build: Next.js production build; content statically generated. No environment variables required for the MVP (no backend, no keys).
- PWA: manifest and icons in `/public`; service worker registered on load; verify installability on Android Chrome.
- Caching: precache app shell and content on install; serve offline from cache; use a network-first or stale-while-revalidate strategy only for any optional non-critical asset.
- Environments: a preview deployment per pull request (Vercel default) and a production deployment on merge to main.
- Verification gate before shipping any branch: run a code review pass, a browser QA pass against the preview URL exercising the offline path and the check-in-to-logs flow, then ship. (This maps onto the gstack sprint: review, then qa, then ship.)

## 14. Analytics and privacy

- The MVP stores all user data locally only; this is stated plainly in Settings (`F11-AC3`).
- Product analytics are optional and off by default to protect data cost and privacy. If added later, use a privacy-respecting, low-payload approach and never send health-log contents. `[PLACEHOLDER: insert - analytics decision]`.

## 15. Definition of done (MVP)

The MVP is done when:

- Every acceptance criterion under F1 to F11 passes.
- Every non-negotiable constraint C1 to C7 holds, verified including a full offline run.
- The four meal sets and three education articles render from reviewed content with disclaimers and last-reviewed dates.
- The app is installable on Android Chrome and opens every tab offline after first load.
- Derived-logic functions (Section 11) have unit tests.
- No out-of-scope feature has been built.

## 16. Open items (placeholders to resolve)

- `[PLACEHOLDER: insert - reviewed article bodies for menopause, blood pressure, blood sugar]`
- `[PLACEHOLDER: insert - reviewed meal lists for blood pressure, blood sugar, heart health, weight management]`
- `[PLACEHOLDER: insert - daily tips list and affirmations list]`
- `[PLACEHOLDER: insert - final reminder copy]`
- `[PLACEHOLDER: insert - app icon, splash, and brand colours]`
- `[PLACEHOLDER: insert - first-load KB budget]`
- `[PLACEHOLDER: insert - analytics decision]`

End of PRD v1.0.
