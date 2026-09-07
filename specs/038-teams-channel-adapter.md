---
id: 038-teams-channel-adapter
title: Checkpoint 038: Microsoft Teams channel adapter
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/038-teams-channel-adapter.md
---


# Checkpoint 038: Microsoft Teams channel adapter

## Objective

Add the missing Microsoft Teams channel layer to LandOps Workbench. A Teams message must be able to reach the same bounded Workroom capability used by the web application without moving business rules into the transport adapter.

## Product behavior

1. A user mentions the LandOps bot in a personal chat, group chat, or team channel.
2. The Teams adapter removes the bot mention and preserves tenant, user, conversation, and activity identifiers.
3. The adapter creates or resumes a LandOps Workroom thread through the ASP.NET Core API.
4. The Workroom plan can show a human request followed by explicit agent-to-agent delegation.
5. Duplicate activity IDs do not create duplicate work.
6. The adapter returns a concise Teams-safe reply with the thread identifier and human-review boundary.

## Boundaries

- `src/teams/` owns Teams SDK activity handling, mention parsing, channel mapping, idempotency, and API transport.
- `dotnet/` remains the source of truth for authorization, role scenarios, evidence, agent plans, persistence, and human review.
- The Next.js Workroom view is a web surface, not a substitute for the Teams adapter.
- The adapter must not perform filing, title decisions, owner contact, payment changes, or other consequential actions.

## Verification

- Pure tests cover mention removal, channel mapping, duplicate suppression, and reply formatting.
- A local adapter mode can run without Teams credentials using a fake activity and a fake LandOps API client.
- TypeScript typecheck and tests pass.
- The README and architecture docs show the web Workroom and the Teams channel boundary as separate surfaces.

## Deferred work

Production Teams registration, Azure Bot configuration, managed identity permissions, durable distributed idempotency, and multi-replica deployment remain deployment work. They are documented as explicit gaps rather than hidden behind a mock.

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

## Acceptance criteria

The original acceptance claims are preserved in this record. Verification evidence is recorded in the matching result where available.

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
