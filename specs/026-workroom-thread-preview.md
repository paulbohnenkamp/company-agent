---
id: 026-workroom-thread-preview
title: Case-scoped Workroom thread preview
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/026-workroom-thread-preview.md
---



## Goal

Let an authorized role turn a collaboration scenario into a case-scoped
Workroom thread preview with a visible delegation plan.

## Scope

- Add a typed Workroom thread contract and local store for development.
- Require the scenario role and required review group in the local authorization
  boundary.
- Add a same-origin Next proxy and a Case Copilot handoff control.
- Keep the thread preview read-only: no agent execution, external message, or
  consequential action occurs.
- Preserve the same case, scenario, plan, and evidence boundaries that a future
  Teams adapter will use.

## Production boundary

The local store is intentionally disposable. Production will replace it with
SQL Server persistence and replace request role/group fields with validated
Entra claims. The contract and authorization decision remain stable.

## Verification

- Valid and unauthorized API tests.
- TypeScript compiler and tests.
- Next production build.
- Browser creation of a Workroom preview from a collaboration scenario.
- `git diff --check`.

## Completion notes

To be filled after implementation and direct verification.

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

## Acceptance criteria

The original acceptance claims are preserved in this record. Verification evidence is recorded in the matching result where available.

## Verification commands

See the matching result and docs/PROJECT_STATE.md for the commands used and the limits of the evidence.

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Progress log

2026-09-07: Record metadata and required structure normalized; original content preserved.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
