---
id: 033-workroom-foundry-execution
title: Result: Checkpoint 033 — Workroom Foundry execution
status: completed
completed: 2026-09-07
spec: specs/033-workroom-foundry-execution.md
---


# Result: Checkpoint 033 — Workroom Foundry execution

Status: completed and verified in an isolated .NET 10 snapshot

## Implemented

- Added `IWorkroomRunService` with deterministic and Foundry implementations.
- Kept deterministic execution as the local default.
- Added `LandOps:WorkroomExecutionProvider=foundry` as the Azure selection path.
- Foundry execution receives the bounded Workroom context, planned route, and
  selected fictional records through the existing `IAgentProvider`.
- Added fail-closed validation for malformed JSON, foreign record IDs, findings
  without returned records, and non-human routes.
- The API converts provider/application failures to `502` rather than returning
  an invented review packet.
- Added contract tests for valid model output and cross-case record rejection.

## Verification

- Fresh isolated .NET 10 source build passed for all seven solution projects.
- VSTest passed with 29 tests: Domain (2), Application (7), and API (20).
- The deterministic browser workflow from Checkpoint 032 remains the local
  default and remains verified.
- `git diff --check` passed.

## Azure setup boundary

Configure `WorkroomExecutionProvider=foundry` only after setting the existing
Foundry endpoint/model and API-key or managed-identity settings. The model is
still prevented from issuing title, payment, development, or filing decisions.

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
