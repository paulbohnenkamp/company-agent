---
id: 051-documentation-teams-first-cleanup
title: Teams-first documentation cleanup
status: completed
spec: specs/051-documentation-teams-first-cleanup.md
completed: 2026-09-09
---

## What changed

- Added `docs/history.md` as the index for preserved historical, product
  direction, research, deployment-proposal, and TypeScript reference material.
- Reduced `docs/README.md` to current Teams/.NET onboarding, development,
  deployment, naming, activation, and execution-record entry points.
- Updated `docs/deployment.md` to describe the current three-service Azure
  shape and link to the canonical Azure and Teams guides.
- Labeled the TypeScript quickstart and runtime documents as reference
  material, and labeled the minimal Azure Demo A proposal as historical.
- Corrected current-facing Business Agent terminology in `dotnet/README.md`.
- Labeled the existing `.azure/deployment-plan.md` as a historical deployment
  record while preserving its contents.
- Added reference notices to the older architecture, data model, flow runtime,
  evaluation, and implementation documents.
- Preserved all historical documents, specs, results, screenshots, and
  compatibility identifiers. Nothing was deleted by this cleanup.

## Files changed

Documentation and execution records only. Existing implementation, test,
configuration, and infrastructure changes in the worktree were not altered.

## Checks run and results

- `npm run validate:records`: passed.
- `git diff --check`: passed.
- Scoped local Markdown link check: passed.
- Installed runtime observed: Node.js `v24.14.1`, .NET SDK `10.0.400`.

## Deviations from the spec

Older documents were not moved into new directories because the worktree
already contains an in-progress naming migration with path changes. They remain
in place and are now classified through the history index and source-level
reference notices.

## Important decisions

- Teams plus the C#/.NET API is the current product path.
- Historical and reference content is preserved and indexed instead of
  deleted.
- Physical archive moves are deferred until the existing naming migration is
  committed, to avoid additional path churn.

## Remaining follow-ups

- Create the matching result for spec 050 when its approved implementation is
  complete.
- Reconcile `PROJECT_STATE.md` after the next Teams activation/evidence slice.
- Consider a future physical archive-directory move when the naming migration
  is committed and path churn is safe.
