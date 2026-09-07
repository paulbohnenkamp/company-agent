---
id: 003-service-boundaries
title: Establish cohesive runtime service boundaries
status: completed
created: 2026-08-26
updated: 2026-09-07
result: results/003-service-boundaries.md
---



## Goal

Prevent functional modules from becoming unstructured by introducing explicit
services for stateful run lifecycle and Microsoft provider concerns, while
keeping transformations functional.

## Acceptance criteria

- `RunService` owns execution, handoffs, persistence, and review transitions.
- `FoundryClient` owns Responses API request/response behavior.
- Safe ports exist for retrieval, telemetry, and consequential actions.
- Tests cover the new boundaries and all existing behavior remains green.
- Documentation and contributor conventions explain when to use functions or
  classes.

## Non-goals

No live cloud calls, external side effects, or broad class hierarchy.

## Verification commands

```sh
npm run typecheck
npm test
npm run build
```

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

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Progress log

2026-09-07: Record metadata and required structure normalized; original content preserved.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
