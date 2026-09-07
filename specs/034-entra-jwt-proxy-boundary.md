---
id: 034-entra-jwt-proxy-boundary
title: Checkpoint 034: Entra JWT and proxy boundary
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/034-entra-jwt-proxy-boundary.md
---


# Checkpoint 034: Entra JWT and proxy boundary

## Objective

Make the documented Entra production path executable: ASP.NET Core validates
Microsoft Entra bearer tokens when configured for Entra mode, and the Next.js
same-origin proxy forwards the caller's authorization header to the API.

## Scope

- Add the ASP.NET Core JWT bearer package and conditional middleware.
- Require tenant authority and audience configuration in `entra` mode.
- Keep local mode unauthenticated and deterministic.
- Forward the incoming `Authorization` header from write-capable Next.js proxy
  routes to the C# API.
- Document the settings and token flow for beginners.
- Add configuration-boundary tests where practical.

## Non-goals

- Creating an Entra tenant, app registration, or role assignment.
- Implementing a browser token-acquisition library.
- Making read-only fictional seed endpoints require sign-in in local mode.

## Acceptance criteria

1. The .NET solution builds with the JWT bearer package.
2. `IdentityMode=local` starts without Entra settings.
3. `IdentityMode=entra` fails fast when authority/audience is missing.
4. Entra mode validates tokens before the Workroom identity resolver runs.
5. Next.js Workroom, run, review, conversation, and scenario-write routes
   forward the caller's bearer token.
6. Documentation explains local versus Azure startup.

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
