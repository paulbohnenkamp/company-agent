---
id: 021-landops-live-provider-modes
title: LandOps live local and Foundry provider modes
status: completed
completed: 2026-09-05
spec: specs/021-landops-live-provider-modes.md
---



## What changed

- Added `ICaseConversation` with deterministic and Foundry implementations.
- Added the `LandOps:ConversationProvider` runtime switch.
- Added structured Foundry conversation output validation.
- Rejected model citations that do not resolve to the current run.
- Added API-key authentication for local Foundry use.
- Added Azure managed-identity authentication with the Foundry token scope.
- Added provider failure mapping to HTTP 502 at the API boundary.
- Added live-mode configuration and beginner documentation.

## Verification

- Clean full-solution build: passed.
- Clean C# tests: 13 passed, 0 failed.
- Live local API health check: passed.
- Live local SQL-backed reconciliation: completed with 3 findings, 1 conflict,
  and 2 unknowns.
- Live local case conversation: returned a grounded answer with both WVDEP and
  WVGES evidence references.
- Live Foundry-mode API path through a disposable fake Responses endpoint:
  completed a SQL-backed run, sent the conversation request to
  `/openai/v1/responses`, validated the structured response, and persisted the
  grounded answer.
- TypeScript tests: 122 passed.
- TypeScript compiler check: passed.
- Next.js production build: passed.
- `git diff --check`: passed.

## Cloud boundary

The Azure managed-identity path is implemented and tested at the provider
boundary. A real Azure run still requires an approved deployment plan, a Foundry
model deployment, managed-identity role assignment, and Azure resource access.

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
