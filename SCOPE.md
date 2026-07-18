# PrimeLife: scope guardrail

Full detail lives in `PrimeLife-MVP-PRD.md`. This file is the short version every session must hold. If a request during implementation would add anything not listed under "in scope" below, stop and flag it as a scope question rather than building it. Do not reason your way into treating an out-of-scope item as a small addition.

## Product, one line
A local-first PWA helping women 45 to 65 build daily habits through simple guidance, localised meal recommendations, and light habit tracking. Education and habit formation, not diagnosis or advanced fitness tracking.

## In scope (MVP): build only these
- `F1` First-run onboarding and disclaimer, no account
- `F2` Daily Check-In (three questions), writes into logs
- `F3` Home dashboard: tip, goals, quick logs, weekly summary, affirmation
- `F4` Quick logs: water, meals, sleep
- `F5` Walking Journal: log walks, weekly summary
- `F6` Track and Insights: daily logs, streaks, weekly summary, 7-day trends
- `F7` Nourish: meal recommendations for 4 categories (blood pressure, blood sugar, heart health, weight management), no recipes
- `F8` Learn: 3 education articles (menopause and healthy ageing, blood pressure, blood sugar), wellness tips, affirmations
- `F9` Reminders: in-app only, opt-in Web Notifications where supported, no push server
- `F10` PWA shell: installable, offline after first load
- `F11` Settings: edit preferences, clear local data

## Explicitly out of scope: do not build
- Symptom Guide (what a symptom might indicate, causes, when to seek care)
- Full Exercise Library or condition-specific exercise collections
- Recipes with ingredients or cooking steps, of any kind
- Accounts, login, cloud sync, cross-device continuity of any kind
- Calorie counting, macro tracking, or weight targets
- Bone health or any health category beyond the four meal categories and three education topics listed above
- Reliable push notifications that fire while the app is closed (needs a server; deferred with the cloud layer)
- Any backend, API route, or server runtime. This is a static, client-only PWA.

## Non-negotiable constraints on everything built
- `C1` Offline-first: full app works with no network after first load
- `C2` No account, no login, no sign-up gate
- `C3` Data thrift: no autoplaying media, images optimised and lazy
- `C4` WCAG 2.1 AA: 18px+ body text, 44px+ tap targets, high contrast
- `C5` Safety framing: persistent "not medical advice" disclaimer on all health content
- `C6` All local writes go through the single data-access layer, never direct IndexedDB access from a feature
- `C7` Daily tip and affirmation are deterministic by date, computed on-device

## Definition of done
Every `F1` to `F11` acceptance criterion passes, every `C1` to `C7` constraint holds including a full offline run, and nothing above the "out of scope" line has been built. See PRD Section 15 for the full checklist.
