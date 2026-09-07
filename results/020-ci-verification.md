---
id: 020-ci-verification
title: LandOps CI verification for Next.js and .NET
status: completed
completed: 2026-09-05
spec: specs/020-ci-verification.md
---



## What changed

- Reorganized `.github/workflows/verify.yml` into separate `next` and `dotnet`
  jobs.
- Kept npm test and the Next.js production build in CI.
- Moved `npm run typecheck` after `npm run build` so generated Next.js route
  types exist before TypeScript checks them.
- Added .NET 10 SDK setup, restore, build, and test steps.

## Verification

- `npm test`: passed, 122 tests.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Workflow structure inspected locally. GitHub-hosted execution remains the
  final check after the branch is pushed.

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
