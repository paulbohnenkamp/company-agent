---
id: 028-fictional-company-data-room
title: Fictional company case data room
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/028-fictional-company-data-room.md
---



## Goal

Give the Blue Ridge Energy Resources workbench a coherent, case-scoped
fictional data room containing the lease, title, division-order, ownership, and
OCR-derived records that its role agents are meant to analyze.

## Scope

- Add typed C# seed records with explicit synthetic-data and provenance labels.
- Expose a read-only case data-room endpoint.
- Add a same-origin Next proxy and Fluent UI data-room panel.
- Link each record to relevant agent IDs and role evidence types.
- Preserve the boundary that synthetic company records are not real title,
  payment, or legal determinations.

## Acceptance criteria

- The seeded Blue Ridge case returns at least one record for lease, title,
  division order, ownership, and OCR categories.
- Every record is marked synthetic and has a source/provenance description.
- Unknown case IDs return 404 and records cannot cross case boundaries.
- The browser shows the data room without overwhelming the focus-first shell.
- API, TypeScript, build, browser, and diff verification pass.

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
