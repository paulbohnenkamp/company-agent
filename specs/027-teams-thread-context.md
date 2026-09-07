---
id: 027-teams-thread-context
title: Teams-style thread context for Workroom tasks
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/027-teams-thread-context.md
---



## Goal

Make a LandOps Workroom task behave like an agent mention in Teams: retain the
relevant thread messages, identify the requesting context, and show the user
what context will be handed to the authorized agent route.

## Scope

- Add typed thread-message and context-summary fields to the Workroom contract.
- Add a deterministic context analyzer with bounded message and character limits.
- Require context to remain case-scoped and read-only in this checkpoint.
- Add a small Case Copilot context composer for the local demo.
- Display the captured context summary in the Workroom preview.
- Keep future Teams transport, Entra claims, agent execution, and durable SQL
  persistence as explicit production boundaries.

## Acceptance criteria

- A Workroom request with thread messages stores and returns the messages and a
  deterministic summary.
- Oversized or empty context is handled safely without allowing an unbounded
  payload.
- Existing role/group authorization still applies.
- The browser shows the context composer and the resulting Workroom context.
- TypeScript tests, .NET tests, Next build, and `git diff --check` pass.

## Progress log

- Added the bounded context contract and analyzer.
- Added authorized API tests for context retention and truncation.
- Added the Next.js context composer and Workroom context display.
- Typecheck passed; TypeScript tests passed 122/122; .NET tests passed 19/19.
- Browser rendered the composer and successfully posted a Workroom handoff.
- The first build attempt hung after the compiler worker completed while a dev
  server was active. After stopping the dev server, the isolated application
  build completed successfully; the repository-wide TypeScript check remains a
  separate passing gate.

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

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
