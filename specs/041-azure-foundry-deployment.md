---
id: 041-azure-foundry-deployment
title: Checkpoint 041: Azure and Foundry deployment
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/041-azure-foundry-deployment.md
---


# Checkpoint 041: Azure and Foundry deployment

## Objective

Make LandOps deployable through `azd` with Azure-native infrastructure,
managed identities, Entra-only SQL, and an opt-in Foundry model provider.

## Acceptance criteria

- `azure.yaml` defines the web and API services using their Dockerfiles.
- Bicep provisions the services, data stores, observability, Foundry-compatible
  model resource, and explicit managed-identity permissions.
- No SQL password, model API key, or tenant secret is committed.
- SQL data-plane bootstrap is explicit and separate from ARM role assignment.
- Azure validation runs before deployment and live checks are recorded.
- Local deterministic tests continue to pass.

## Out of scope for this checkpoint

Creating production tenant users, Teams/Bot registration, or irreversible
business actions. Entra app registration/client sign-in is tracked as a
deployment configuration item because it depends on the target tenant's naming
and consent policy.

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
