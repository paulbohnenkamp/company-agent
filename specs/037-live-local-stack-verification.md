---
id: 037-live-local-stack-verification
title: Checkpoint 037: Live local stack verification
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/037-live-local-stack-verification.md
---


# Checkpoint 037: Live local stack verification

## Objective

Prove the primary LandOps workbench against the actual local Microsoft stack,
not only a disposable HTTP fixture.

## Scope

- Start the documented SQL Server development container.
- Run the real ASP.NET Core API with EF Core migrations and seeded data.
- Run the real Next.js proxy/UI against that API.
- Verify the portfolio, Workroom delegation, flagship WV workflow, and grounded
  case chat in one browser session.

## Acceptance criteria

1. The live browser displays the fictional company portfolio, departments,
   agents, workflows, groups, and data-room records.
2. A Workroom run shows requested/delegated agent handoffs and a human-review
   packet.
3. The flagship WV workflow completes all three C# steps and preserves source
   conflicts and unknowns.
4. Case chat answers from the completed run and cites evidence references.
5. Temporary API/UI processes are stopped after verification.

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

## Goal

The goal stated by the original record is preserved in its Objective or equivalent section below.
