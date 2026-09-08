---
id: 029-fictional-agent-review-packet
title: Fictional-company seeded agent review packet
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/029-fictional-agent-review-packet.md
---



## Goal

Turn an authorized Workroom plan into a deterministic, evidence-linked review
packet using the fictional Sample Energy Company data room.

## Scope

- Add a typed C# review-packet contract and deterministic seed evaluator.
- Select records by role/scenario without allowing cross-case data.
- Expose a read-only scenario-run endpoint and same-origin Next proxy.
- Let the Workroom UI run the seeded review and show findings, unknowns, agent
  steps, and the human decision boundary.
- Keep real agent execution, Foundry calls, durable run persistence, and
  consequential actions as later production boundaries.

## Acceptance criteria

- Lease, legal, division-order, and compliance scenarios select relevant seeded
  records and produce record-linked findings.
- Unknowns and warnings remain explicit; no title or payment decision is made.
- Unknown case/scenario requests return a safe error.
- Browser can create a Workroom and run the seeded review packet.
- .NET, TypeScript, build, browser, and diff verification pass.

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

## Progress log

2026-09-07: Record metadata and required structure normalized; original content preserved.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
