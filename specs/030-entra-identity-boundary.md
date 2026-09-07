---
id: 030-entra-identity-boundary
title: Checkpoint 030: Entra identity boundary
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/030-entra-identity-boundary.md
---


# Checkpoint 030: Entra identity boundary

## Objective

Make the Teams-style Workroom authorization boundary explicit. Local development
must remain runnable without a sign-in provider, while the production path must
derive the user, application roles, and group membership from Microsoft Entra
claims instead of trusting browser-supplied identity fields.

## Scope

- Add a small API identity adapter that understands local and Entra modes.
- In local mode, preserve the current demo request fields for repeatable browser
  and automated tests.
- In Entra mode, read `oid`/name identifier, `roles`, and `groups` claims from
  the authenticated ASP.NET Core principal.
- Return `401` when Entra mode has no authenticated principal.
- Continue returning `403` when an authenticated user lacks the scenario role
  or required collaboration group.
- Use the resolved identity when creating a Workroom thread.
- Document how the local mode maps to an Azure deployment with JWT validation.

## Non-goals

- Registering an Entra application or changing a tenant.
- Adding a fake JWT validator to local development.
- Building a full Teams bot or replacing the Workroom with a chat transport.

## Acceptance criteria

1. Existing local Workroom tests and browser flow continue to pass.
2. Entra-mode claim resolution is covered by automated tests.
3. The API does not use request `requestedBy`, `roleId`, or `groups` values in
   Entra mode.
4. The identity mode and claim expectations are documented for beginners.
5. The result records exact verification and any remaining production boundary.

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
