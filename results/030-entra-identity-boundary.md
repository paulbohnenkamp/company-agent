---
id: 030-entra-identity-boundary
title: Result: Checkpoint 030 — Entra identity boundary
status: completed
completed: 2026-09-07
spec: specs/030-entra-identity-boundary.md
---


# Result: Checkpoint 030 — Entra identity boundary

Status: completed with local verification; .NET execution is environment-blocked

## Implemented

- Added `dotnet/LandOps.Api/Identity.cs` with a small HTTP-boundary identity
  resolver.
- Added explicit `LandOps:IdentityMode` configuration. Local development uses
  `local`; Azure is expected to use `entra`.
- Local mode preserves the existing demo request shape and behavior.
- Entra mode reads `oid` (or a standard name identifier), `roles`, and `groups`
  from the authenticated ASP.NET Core principal.
- Workroom creation now rejects an anonymous Entra principal with `401`, checks
  resolved roles and groups for authorization, and stores the resolved subject
  and role on the thread.
- Added tests for authenticated claim resolution and anonymous Entra mode.
- Documented the identity boundary in `docs/landops-architecture.md` and
  `docs/landops-development-workflow.md`.

## Verification

- `npx tsc --noEmit --incremental false` — passed.
- `npm test -- --runInBand` — passed, 122 tests.
- `git diff --check` — passed.
- `dotnet test dotnet/LandOps.sln --no-restore` — could not execute because the
  current shell has no discoverable .NET SDK (`dotnet: command not found`). The
  C# tests and build remain configured in CI and must be run in a .NET 10
  environment before merging this checkpoint.

## Remaining production boundary

This checkpoint does not register an Entra application or add JWT middleware.
An Azure host still needs to validate Entra access tokens and populate
`HttpContext.User`; the API adapter is now prepared to consume those validated
claims without trusting browser-supplied identity fields.

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
