---
id: 036-local-runtime-alignment
title: Result 036: Local runtime alignment
status: completed
completed: 2026-09-07
spec: specs/036-local-runtime-alignment.md
---


# Result 036: Local runtime alignment

Status: completed

## Delivered

- Aligned the Workroom run proxy fallback with the ASP.NET Core development
  launch profile at `http://127.0.0.1:5006`.
- Preserved `LANDOPS_API_URL` as the explicit override for every environment.
- Updated the beginner learning path and .NET quick reference to use port
  5006.
- Added a route-boundary regression test so a future port change cannot make
  thread creation and thread execution disagree silently.
- Extended the browser-side delegation-plan type with `delegatedFrom`.

## Verification

- `npx tsc --noEmit --incremental false` — passed.
- `npm test -- --runInBand` — passed, 125 tests.
- `npm run build` — passed; the generated route table includes
  `/api/landops/workroom/run`.
- `git diff --check` — passed.

## Boundary

The local API still needs SQL Server for the durable case/reconciliation path;
the deterministic Workroom path can use memory storage. Azure and Foundry use
the same explicit `LANDOPS_API_URL` override and provider settings described in
the learner path.

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
