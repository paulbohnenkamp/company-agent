---
id: 044-teams-live-activation
title: Minimal tenant-backed Teams demo plan and actor contract
status: completed
completed: 2026-09-07
spec: specs/044-teams-live-activation.md
---

## What changed

- Reduced the next Teams milestone to a small tenant-backed interview/demo
  slice: one bot, one channel, two or three real test users, and one fixed
  deterministic Workroom scenario.
- Added the typed Teams actor contract, including tenant ID, Teams user ID, and
  optional Entra object ID, without moving authorization into the adapter.
- Added `docs/teams-live-activation.md` with tenant setup, bot, endpoint,
  channel, verification, and production-boundary guidance.
- Added `docs/chatgpt-work-teams-handoff.md` with a bounded browser setup
  prompt and non-secret return contract.
- Updated `docs/PROJECT_STATE.md` to distinguish demo preparation from the
  later production identity bridge.

## Files changed

- `src/teams/landops-adapter.ts`
- `tests/teams-adapter.test.ts`
- `specs/044-teams-live-activation.md`
- `results/044-teams-live-activation.md`
- `docs/teams-live-activation.md`
- `docs/chatgpt-work-teams-handoff.md`
- `docs/PROJECT_STATE.md`

## Checks run and results

- `node --import tsx --test tests/teams-adapter.test.ts`: passed, 6 tests.
- `npm run build`: passed.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed, 34 tests.
- `git diff --check`: passed.

The first concurrent `npm run typecheck` attempt raced with Next.js rebuilding
`.next/types`; it reported missing generated route types. The subsequent build
completed successfully. A clean serial typecheck and the remaining full suite
are required before this result is considered committed.

## Deviations from the spec

The real tenant smoke was not run because the Microsoft 365 Developer Program
did not grant sandbox eligibility. A Business Basic trial tenant now exists,
but this result still covers preparation and tenant prerequisites only. It does
not claim live Teams delivery.

## External activation checkpoint

The DecisionForge Microsoft 365 Business Basic trial tenant is
`landopsdemo.onmicrosoft.com` with Entra tenant ID
`ec4b8411-d158-44e0-a8cf-6f71e2d8b96b`. Microsoft Teams is enabled. The tenant
has licensed users `legal.demo@landopsdemo.onmicrosoft.com` and
`land.demo@landopsdemo.onmicrosoft.com`, the `LandOps Demo` Team, and the
`landops-demo` standard channel. Custom app upload remains unverified because
Teams app management was still provisioning.

Bot registration, a public endpoint, consent, identity mapping, and a real
Teams mention smoke test remain incomplete.

## Important decisions

- Real Teams users are needed for the human side of the demo; agents remain
  Workroom participants, not separate fake Teams accounts.
- The first demo may use the deterministic local API mode, but it must be
  labeled as a demo and must not be confused with production Entra
  authorization.
- The API remains the sole authorization and human-action boundary.

## Remaining follow-ups

- Verify custom app upload or sideloading after Teams app management finishes
  provisioning.
- Register the bot, expose the adapter over HTTPS, and run the tenant smoke.
- Implement the production workload-token and directory-backed identity bridge
  before calling the integration production-ready.
