---
id: 040-fictional-identity-catalog
title: Checkpoint 040: fictional identity catalog
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/040-fictional-identity-catalog.md
---


# Checkpoint 040: fictional identity catalog

## Objective

Create one checked-in, synthetic employee catalog that drives local personas,
role/group authorization scenarios, Teams examples, and future Entra
provisioning.

## Acceptance criteria

- The catalog defines fictional employees, departments, application roles, and
  review groups without real tenant object IDs or secrets.
- Every persona references existing portfolio role/group identifiers.
- A validator rejects duplicate IDs, unknown departments/roles/groups, real
  object IDs, and non-synthetic email domains.
- A provisioning script reads the catalog and defaults to a dry-run that prints
  Azure CLI commands; real creation requires an explicit apply flag, tenant,
  verified UPN domain, and temporary password.
- Documentation explains that local persona IDs are not Entra object IDs.

## Safety boundary

This checkpoint does not create users, groups, app registrations, or role
assignments in any Azure tenant. It prepares a reviewable input and an
explicitly gated provisioning path.

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
