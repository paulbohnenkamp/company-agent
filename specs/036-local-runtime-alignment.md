---
id: 036-local-runtime-alignment
title: Checkpoint 036: Local runtime alignment
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/036-local-runtime-alignment.md
---


# Checkpoint 036: Local runtime alignment

## Objective

Make the documented local ASP.NET Core launch path and every Next.js LandOps
proxy route use the same API address by default.

## Scope

- Use the repository's ASP.NET Core HTTP launch port (`5006`) as the local
  Workroom run fallback.
- Keep `LANDOPS_API_URL` as the explicit override for local, Foundry, and Azure.
- Update beginner documentation and route-boundary tests.

## Acceptance criteria

1. A beginner following the documented `dotnet run` command can use the full
   Workroom flow without an additional port correction.
2. An explicitly configured `LANDOPS_API_URL` still wins in every proxy route.
3. The browser remains same-origin and no API URL is exposed to client code.

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
