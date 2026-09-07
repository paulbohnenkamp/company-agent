---
id: 035-explicit-agent-handoffs
title: Checkpoint 035: Explicit agent-to-agent handoffs
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/035-explicit-agent-handoffs.md
---


# Checkpoint 035: Explicit agent-to-agent handoffs

## Objective

Make the Teams-style Workroom collaboration contract show who asked for each
step. A user starts the task, the first agent is requested, and each later
agent is explicitly delegated by the preceding agent.

## Scope

- Add `delegatedFrom` to the shared collaboration-step contract.
- Populate the deterministic role plans with a sequential delegation chain.
- Include the chain in the Foundry execution input.
- Render the chain in the Next.js Workroom UI.
- Add API coverage for the first requested step and later delegated steps.
- Explain the concept in the learner documentation.

## Non-goals

- Unbounded agent spawning or arbitrary agent-to-agent messaging.
- Allowing an agent to bypass the user's Entra role/group permissions.
- Removing the human-review boundary.

## Acceptance criteria

1. The first step has no delegating agent and is marked `requested`.
2. Each later step is marked `delegated` and names the previous agent.
3. Foundry receives the bounded delegation chain as part of its input.
4. The browser shows the delegation relationship in the Workroom.
5. Existing local and Azure boundaries remain unchanged.

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
