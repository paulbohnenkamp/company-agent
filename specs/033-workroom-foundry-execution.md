---
id: 033-workroom-foundry-execution
title: Checkpoint 033: Workroom Foundry execution
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/033-workroom-foundry-execution.md
---


# Checkpoint 033: Workroom Foundry execution

## Objective

Let the Workroom run use the existing Microsoft Foundry provider in an explicit
Azure mode while keeping the deterministic fictional evaluator as the local
default.

## Scope

- Add an application-level Workroom run service boundary.
- Keep deterministic packet generation as the default.
- Add a Foundry implementation that receives only the selected fictional case
  records and bounded thread context.
- Validate model output before returning it: valid JSON, same-case record IDs,
  findings tied to returned records, and `human-review` route.
- Return a safe provider error instead of inventing a packet.
- Select the implementation with `LandOps:WorkroomExecutionProvider`.
- Add provider-mode documentation and contract tests.

## Non-goals

- Autonomous approvals, payments, title opinions, or filings.
- A generic multi-agent workflow engine.
- Making live Foundry calls part of local tests or browser fixtures.

## Acceptance criteria

1. Local mode remains deterministic and offline.
2. Foundry mode uses the existing `IAgentProvider` boundary.
3. Invalid or unsafe model output fails closed with a typed application error.
4. The Workroom API returns `502` for provider failures.
5. The Azure configuration path is documented for a beginner.

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
