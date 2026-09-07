---
id: 023-focus-first-landops-workspace
title: Focus-first LandOps workspace
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/023-focus-first-landops-workspace.md
---



## Goal

Keep the fictional-company context visible while making the active land
workflow the clear first task for an analyst.

## Scope

- Replace the large portfolio block with a compact Fluent UI context bar.
- Keep the company name, synthetic-data status, active matter, departments,
  agent count, workflow count, and review-group count visible at a glance.
- Put the full agent roster and data notice behind an expandable portfolio
  context section.
- Preserve the existing workflow, evidence, review, and grounded-chat paths.
- Verify the browser at the same-origin local URL and confirm the primary run
  control remains easy to find and usable.

## Product decision

The workbench is a task surface first and an organization directory second.
Rich context should be available without competing with the current matter.

## Verification

- TypeScript compiler check.
- TypeScript tests.
- Next production build in an isolated checkout.
- Live browser inspection at `127.0.0.1`.
- `git diff --check`.

## Completion notes

Completed after browser inspection showed that the first portfolio shell was
too dense. The company context is now compact by default, with the agent team
and synthetic-data notice available through an expandable section.

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
