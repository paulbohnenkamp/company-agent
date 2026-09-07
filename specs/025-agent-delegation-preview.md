---
id: 025-agent-delegation-preview
title: Agent delegation preview
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/025-agent-delegation-preview.md
---



## Goal

Make the authorized specialist route visible before a role question becomes a
shared Workroom thread.

## Scope

- Add a read-only C# plan contract derived from a scenario ID.
- Identify the initiating specialist, delegated specialists, required review
  group, surface (`copilot` or `workroom`), and human boundary.
- Show the delegation route in each Case Copilot prompt.
- Preserve the rule that a future runtime must enforce the route against Entra
  identity and agent permissions before execution.

## Exclusions

This slice does not execute agents, create durable threads, call Teams, or
replace the existing C# reconciliation flow.

## Verification

- API contract test for a workroom-escalating scenario.
- TypeScript compiler and tests.
- Next production build.
- Browser inspection of a visible delegation route.
- `git diff --check`.

## Completion notes

Implemented the preview contract and exposed the authorized specialist route in
the Case Copilot. Durable authorization and execution remain the next boundary.

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
