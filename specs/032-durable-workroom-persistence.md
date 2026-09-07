---
id: 032-durable-workroom-persistence
title: Checkpoint 032: Durable Workroom persistence
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/032-durable-workroom-persistence.md
---


# Checkpoint 032: Durable Workroom persistence

## Objective

Keep shared Teams-style Workroom threads after an API restart when the product
is configured for SQL Server or Azure SQL, while preserving a fast offline local
mode for learners and deterministic tests.

## Scope

- Define an application store interface for Workroom threads.
- Preserve the current in-memory store as the default local/test adapter.
- Add an EF Core SQL adapter that stores bounded context, participants, ordered
  steps, identity, status, and timestamps.
- Add the `WorkroomThreads` migration and explicit `LandOps:WorkroomPersistence`
  configuration.
- Keep the existing API and browser contract unchanged.

## Non-goals

- Background job processing or distributed locks.
- Storing unbounded chat transcripts.
- Changing the human-review boundary or allowing consequential actions.

## Acceptance criteria

1. Existing local tests use the in-memory adapter without SQL Server.
2. SQL mode compiles and maps the full bounded Workroom contract.
3. A SQL migration creates the durable table and case/time index.
4. API endpoints depend on the store interface, not the in-memory class.
5. Beginner documentation explains when to use memory versus SQL mode.

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

## Progress log

2026-09-07: Record metadata and required structure normalized; original content preserved.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.

## Goal

The goal stated by the original record is preserved in its Objective or equivalent section below.
