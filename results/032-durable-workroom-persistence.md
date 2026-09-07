---
id: 032-durable-workroom-persistence
title: Result: Checkpoint 032 — Durable Workroom persistence
status: completed
completed: 2026-09-07
spec: specs/032-durable-workroom-persistence.md
---


# Result: Checkpoint 032 — Durable Workroom persistence

Status: implemented; source build verified in an isolated .NET 10 snapshot

## Implemented

- Added `IWorkroomThreadStore` to the application boundary.
- Kept the existing in-memory store for local development and tests.
- Added `SqlWorkroomThreadStore` and `WorkroomThreadRow` in Infrastructure.
- Added EF mapping for `WorkroomThreads` and an EF-generated migration plus
  model snapshot for the table and `(CaseId, CreatedAt)` index.
- Updated create, get, and run endpoints to depend on the interface and use
  asynchronous persistence methods.
- Added `LandOps:WorkroomPersistence` configuration, defaulting to `memory`.

## Verification

- A fresh copy of the current repository restored and built with the .NET
  10.0.400 SDK into `/private/tmp/business-agent-compile`.
- All seven solution projects compiled successfully after the generated
  migration and snapshot were added.
- The browser flow was re-run against a disposable local API fixture: the page
  loaded the fictional data room, created a Workroom thread, invoked the new
  thread-backed run route, and rendered the human-review packet with two source
  records and one explicit unknown.
- Next.js logs confirmed `POST /api/landops/workroom 201` followed by
  `POST /api/landops/workroom/run 200`.
- TypeScript and Next.js verification from the previous checkpoint remains
  valid; the UI contract did not change in this checkpoint.
- VSTest passed in the isolated snapshot with local socket access: 27 tests
  passed across Domain (2), Application (7), and API (18).

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
