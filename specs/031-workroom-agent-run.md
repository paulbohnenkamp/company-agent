---
id: 031-workroom-agent-run
title: Checkpoint 031: Workroom agent run
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/031-workroom-agent-run.md
---


# Checkpoint 031: Workroom agent run

## Objective

Make the Teams-style Workroom action execute from the created thread. A user
should be able to ask a role, let the planned specialist route work against the
thread's case, and receive a review packet with the same human boundary.

## Scope

- Add a Workroom thread run endpoint.
- Resolve the thread from the in-memory local store.
- Run the existing deterministic fictional review packet for that thread's
  case and scenario.
- Preserve the actual Workroom question in the returned packet.
- Update the Next.js proxy and button so the UI invokes the Workroom run.
- Keep the direct case scenario endpoint for diagnostics and simple demos.

## Non-goals

- Durable Workroom execution history.
- Parallel agent execution or arbitrary agent-to-agent delegation.
- Model calls or consequential business actions.

## Acceptance criteria

1. A created Workroom thread can be run using its thread ID.
2. Unknown threads return `404` and do not create a packet.
3. The packet is still deterministic, case-scoped, source-linked, and human
   review only.
4. The browser flow uses the Workroom endpoint and continues to show findings,
   unknowns, and the human boundary.

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
