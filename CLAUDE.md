# PrimeLife

@SCOPE.md

Full spec: `PrimeLife-MVP-PRD.md` at repo root. Every feature, story, and acceptance criterion has a stable ID (`F1`, `F1-S1`, `F1-AC1`). Reference the PRD by ID rather than re-describing a feature; read the specific section on demand when implementing that ID. SCOPE.md above is the binding summary; if the PRD and a request ever seem to conflict with SCOPE.md, SCOPE.md wins and the conflict gets flagged, not resolved silently.

# gstack

## Browsing

Use the `/browse` skill from gstack for all web browsing and QA. Never use `mcp__claude-in-chrome__*` tools directly.

## Skill routing

When a request matches a skill below, invoke it via the Skill tool. When in doubt, invoke the skill.

### Plan

- `/office-hours` — start here for any new feature: forces demand, wedge, and scope questions before code is written.
- `/plan-ceo-review` — finds the strongest version of a feature request before committing to scope.
- `/plan-eng-review` — locks architecture, data flow, edge cases, and test plan. Required gate before `/ship`.
- `/plan-design-review` — rates the plan's UI and UX completeness (empty states, loading states, mobile, AI-slop risk) before implementation. Relevant for every screen given the `C4` accessibility bar.

### Design

Optional. `/design-shotgun` and `/design-html`, and the mockup step inside `/design-consultation`, call out to the GPT Image API and GPT-4o vision, so they need an OpenAI key configured, not just Claude. Skip them if that is not set up.

- `/design-consultation` — builds the visual design system (DESIGN.md) from scratch. Run once, early, before Phase 3 implementation prompts start.
- `/design-review` — live-site visual and accessibility audit and fix loop; run after a UI feature ships.

### Build

- `/investigate` — systematic root-cause debugging. Use before patching anything broken; no fixes without investigation first.
- `/review` — staff-engineer bug hunt: race conditions, N+1s, trust boundaries, completeness gaps. Run before `/ship`.
- `/codex` — optional second opinion from OpenAI Codex CLI, if installed and authenticated.
- `/cso` — OWASP Top 10 and STRIDE security pass. Low priority for this project: no server, no auth, no database beyond local IndexedDB. Run once before first public deploy, not on every branch.

### QA and ship

- `/qa` — diff-aware browser QA. Reads the git diff, identifies affected routes, tests them. Always verify the offline path (`C1`) and the check-in-to-logs flow (`F2`) explicitly, since diff-aware mode may not surface these on its own.
- `/qa-only` — same methodology as `/qa`, report only, no auto-fixes. Use when you want a bug list without code changes.
- `/setup-deploy` — one-time Vercel deploy config. Run once.
- `/ship` — sync main, run tests, audit coverage, push, open PR.
- `/land-and-deploy` — merge, wait for CI and deploy, verify production health.

### Post-launch

Not needed until PrimeLife is live with real traffic.

- `/canary` — post-deploy monitoring loop.
- `/benchmark` — Core Web Vitals and load-time baselines. Especially relevant here given the `C3` data-thrift constraint; re-run after any change that adds a dependency.

### Safety

- `/careful` — warns before destructive commands (`rm -rf`, force-push, `DROP TABLE`).
- `/guard` — `/careful` plus `/freeze` combined. Use when touching anything close to shipped state.
- `/freeze` / `/unfreeze` — restrict edits to one directory while debugging a specific feature.

### Context and memory

- `/learn` — review what gstack has learned about this project across sessions: patterns, pitfalls, preferences.
- `/context-save` / `/context-restore` — save and resume working state (git state, decisions, remaining work) across sessions. Use at the end of any session that doesn't complete a full prompt-pack step.
- `/gstack-upgrade` — keep gstack current.

## Invocation order for a new feature

`/office-hours` -> `/plan-ceo-review` -> `/plan-eng-review` -> `/plan-design-review` -> implement -> `/review` -> `/qa` -> `/ship` -> `/land-and-deploy`

Not required every time: `/design-consultation` runs once, early, ahead of the first implementation prompt. `/codex` and `/cso` run when available or before a public deploy, not on every branch. `/canary` and `/benchmark` start after launch.

## Git workflow

At the end of every step, once /review and /qa (or their available equivalents) pass, merge your working branch into the default branch yourself, then push. Don't leave work sitting on an unmerged branch between steps. Confirm the merge explicitly in your step output.
