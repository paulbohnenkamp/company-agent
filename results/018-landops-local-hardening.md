---
id: 018-landops-local-hardening
title: LandOps local hardening and boundary tests
status: completed
completed: 2026-09-05
spec: specs/018-landops-local-hardening.md
---



## What changed

- Replaced the C# run adapter's loose `any` mapping with explicit transport
  contracts and field-specific JSON parsing errors.
- Added malformed JSON handling to the Next.js conversation and review routes.
- Added adapter tests for valid and malformed structured run payloads.
- Added an application test for blank case questions.

## Verification

- `npm test`: passed, 122 tests.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Fresh .NET verification was blocked by write permissions on existing generated
  files under `dotnet/**/obj` and `dotnet/**/bin`, not by a source compiler error.

## Decisions

- Keep validation at the browser/API boundary and keep the internal adapter typed.
- Keep the deterministic C# provider as the local default.

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
