---
id: 043-teams-activation-readiness
title: Teams activation readiness and authorization coverage
status: completed
completed: 2026-09-07
spec: specs/043-teams-activation-readiness.md
---

## What changed

- Expanded the C# API integration coverage to exercise all four allowed
  append-only Workroom actions.
- Added an Entra-style authenticated test host and proved that a valid user
  with the wrong Workroom role receives HTTP 403.
- Ran the real local Teams SDK receive path against the running deterministic
  ASP.NET Core API. A local Bot Framework service stub accepted typing and
  reply activities so the smoke test required no Teams tenant credentials.
- Documented the local receive-path smoke distinction in `README.md` and
  updated `docs/PROJECT_STATE.md` to make tenant activation the externally
  blocked continuation item.

## Files changed

- `dotnet/LandOps.Api.Tests/ApiTests.cs`
- `README.md`
- `docs/PROJECT_STATE.md`
- `specs/043-teams-activation-readiness.md`
- `results/043-teams-activation-readiness.md`

## Checks run and results

- `node --import tsx --test tests/teams-adapter.test.ts`: passed, 6 tests.
- `npm run typecheck`: passed.
- `npm test`: passed, 131 tests.
- `npm run build`: passed with Next.js 16.3.3.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed, 34 tests.
- Local adapter receive smoke: passed, HTTP 200 from `/api/messages` using a
  deterministic activity, local API, and local Bot Framework service stub.
- `git diff --check`: passed.
- `npm run validate:records`: passed after this paired result was added.

The .NET run emitted existing Microsoft.IdentityModel assembly-unification
warnings from the repository's mixed dependency graph; they did not fail the
build or tests.

## Deviations from the spec

The spec's production Teams activation remains incomplete because tenant
registration, bot credentials, consent, public endpoint hosting, and channel
configuration are external prerequisites. This result records local readiness
only and does not claim Microsoft 365 delivery.

## Important decisions

- ASP.NET Core remains the authorization and Workroom action boundary.
- The Teams adapter remains transport-only and contains no duplicated land
  business logic.
- The existing Teams/web information architecture was preserved; no UI
  redesign was needed for this activation-readiness slice.

## Remaining follow-ups

- Provision and register the real Azure Bot/Teams app and tenant.
- Validate real Entra claims, bot permissions, channel routing, and replies.
- Replace process-local idempotency with a durable distributed store before
  multi-replica hosting.
- Add adaptive-card review actions over the existing append-only API.
- Record endpoint smoke, evaluation, immutable version, rollback, and
  deployment evidence for the real tenant activation.
