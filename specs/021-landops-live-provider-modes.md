---
id: 021-landops-live-provider-modes
title: LandOps live local and Foundry provider modes
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/021-landops-live-provider-modes.md
---



## Goal

Make the application runnable in deterministic local mode and in live Foundry
mode without changing the case, persistence, or evidence boundaries.

## Acceptance criteria

- Deterministic conversation remains the default and requires no model account.
- `LandOps:ConversationProvider=foundry` routes case conversation through the
  C# provider.
- Foundry responses are JSON-validated and evidence references are restricted to
  the current case run.
- Local API-key authentication uses the Foundry `api-key` header.
- Azure managed-identity authentication uses the `https://ai.azure.com/.default`
  token scope and does not require an API key.
- A live local SQL-backed run and conversation complete successfully.
- Clean C# build and tests pass.

## Verification

```sh
npm test
npx tsc --noEmit --incremental false
npm run build
dotnet build dotnet/LandOps.sln
dotnet test dotnet/LandOps.sln
git diff --check
```

## Progress log

- 2026-09-05: Added the provider-selected conversation service, API-key and
  managed-identity authentication modes, and citation validation.
- 2026-09-05: Verified the live local API against SQL Server with a complete run
  and grounded conversation response.
- 2026-09-05: Verified a clean full-solution build and 13 passing C# tests.

## Non-goals

See the existing scope and deferred work described in this record.

## Current-state findings

This section was added during the 2026-09-07 project-state reconciliation. Existing record content remains below and is the source material for this slice.

## Chosen approach

The existing implementation approach remains the source of truth for this completed slice; future changes must use a new approved spec.

## Alternatives considered

The alternatives and trade-offs are preserved in the existing record content. No alternative is implied by this normalization.

## Affected files or modules

See the implementation files named in this record and the canonical inventory in docs/PROJECT_STATE.md.

## Milestones

The slice milestones are represented by the implementation and verification notes in this record.

## Verification commands

See the matching result and docs/PROJECT_STATE.md for the commands used and the limits of the evidence.

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
