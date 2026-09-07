---
id: 034-entra-jwt-proxy-boundary
title: Result 034: Entra JWT and proxy boundary
status: completed
completed: 2026-09-07
spec: specs/034-entra-jwt-proxy-boundary.md
---


# Result 034: Entra JWT and proxy boundary

Status: completed

## Delivered

- Added conditional ASP.NET Core JWT bearer authentication for
  `LandOps:IdentityMode=entra`.
- Added fail-fast validation for the Entra authority/tenant and API audience.
- Preserved the local deterministic mode without Entra configuration.
- Added a small Next.js proxy helper that forwards only the caller's
  `Authorization` header and the required JSON content type.
- Applied the helper to Workroom, run, review, conversation, and scenario
  write routes.
- Documented the local-versus-Azure token flow in the beginner workflow,
  architecture guide, and Azure deployment plan.
- Added TypeScript regression tests for bearer-token forwarding and no invented
  identity headers.

## Verification

- `npx tsc --noEmit --incremental false` — passed.
- `npm test -- --runInBand` — passed, 124 tests.
- `npm run build` — passed with Next.js 16.3.3 and all LandOps routes present.
- Isolated .NET restore — passed after downloading
  `Microsoft.AspNetCore.Authentication.JwtBearer` from NuGet.
- Isolated `dotnet build dotnet/LandOps.sln --no-restore` — passed with 0
  warnings and 0 errors.
- Isolated `dotnet test dotnet/LandOps.sln --no-build` — passed: 29 tests.
- `git diff --check` — passed.

## Boundary

This checkpoint does not create Azure resources, register Entra applications,
assign roles/groups, or acquire browser tokens. Those remain deployment tasks.
The code path is ready for a deployment that supplies a real authority,
audience, and bearer token.

## What changed

The implementation claims in the original result content are preserved below.

## Files changed

See the original result content and the canonical inventory in docs/PROJECT_STATE.md.

## Checks run and results

Verification evidence is preserved in the original result content; unresolved limits are called out in docs/PROJECT_STATE.md.

## Deviations from the spec

No deviation is inferred by this metadata normalization. Review the original result content for slice-specific deviations.

## Important decisions

This slice remains first-class project history. The current product direction is recorded in docs/PROJECT_STATE.md.

## Remaining follow-ups

See docs/PROJECT_STATE.md and the matching spec for current follow-ups.
