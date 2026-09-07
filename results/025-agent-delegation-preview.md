---
id: 025-agent-delegation-preview
title: Agent delegation preview
status: completed
completed: 2026-09-05
spec: specs/025-agent-delegation-preview.md
---



## What changed

- Added typed C# `CollaborationPlan` and `CollaborationStep` contracts.
- Added deterministic plans for each role scenario, including surface,
  required review group, requested/delegated agent steps, and human boundary.
- Added `GET /api/v1/scenarios/{scenarioId}/plan` and covered it with an API
  test.
- Made the Case Copilot show the specialist route as an explicit chain, such as
  `lease lifecycle reviewer → lease obligation reviewer → compliance reviewer`.
- Preserved the distinction between a Copilot answer and a Workroom handoff.

## Verification

- Isolated C# test suite: 16 passed, 0 failed, including 7 API tests.
- TypeScript compiler check: passed.
- TypeScript tests: 122 passed, 0 failed.
- Next production build in an isolated writable checkout: passed.
- Browser inspection: the Lease Analyst prompt displayed its requested agent,
  delegated specialists, Workroom handoff, and human outcome.
- `git diff --check`: passed.

## Deliberate boundary

The plan is currently a read-only preview. Entra permission enforcement,
durable Workroom threads, actual agent execution, and Teams transport remain
future slices and must consume this same plan contract.

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
