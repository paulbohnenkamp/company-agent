---
id: 019-landops-csharp-foundry-boundary
title: LandOps C# Foundry provider boundary
status: completed
completed: 2026-09-05
spec: specs/019-landops-csharp-foundry-boundary.md
---



## What changed

- Added the application-level `IAgentProvider` port and typed request/response
  contracts.
- Added the infrastructure-level `FoundryAgentProvider` for the Responses API.
- Added timeout, HTTP failure, exception, missing-output, and malformed-JSON
  result handling.
- Added fake HTTP verification for request shape, output parsing, and secret-safe
  error results.
- Documented the opt-in provider boundary and kept deterministic local behavior
  as the default.

## Verification

- TypeScript tests: 122 passing.
- TypeScript compiler check with incremental output disabled: passed.
- Next.js production build: passed.
- `git diff --check`: passed.
- `dotnet build dotnet/LandOps.Infrastructure/LandOps.Infrastructure.csproj`
  passed using temporary output paths, including the new provider implementation.
- Full C# test execution remains blocked by replacement-write permissions on the
  repository's normal generated output files.

## Remaining boundary

Live Foundry calls, Entra identity, secret management, and Azure deployment still
require an approved cloud deployment plan.

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
