---
id: 040-fictional-identity-catalog
title: Checkpoint 040 result: fictional identity catalog
status: completed
completed: 2026-09-07
spec: specs/040-fictional-identity-catalog.md
---


# Checkpoint 040 result: fictional identity catalog

## Outcome

Implemented a single synthetic employee catalog at
`config/identity/personas.json`. The local LandOps UI loads it through
`/api/landops/personas` and renders the People and access groups panel.

The catalog contains 14 fictional Blue Ridge Energy Resources employees across
legal, land, land administration, compliance, accounting, operations, and
platform administration. Each persona references the existing application role
and review-group identifiers.

## Provisioning boundary

`npm run provision:entra-personas` is dry-run by default and prints the Azure
CLI commands it would execute. Real provisioning requires all of the following:

- `--apply`
- `--tenant-id` or `LANDOPS_ENTRA_TENANT_ID`
- `--upn-domain` set to a verified domain in the target tenant
- `LANDOPS_TEMP_PASSWORD`

The script verifies the current Azure CLI tenant before creating anything. It
rejects the catalog's reserved `.example` domain in apply mode. No Azure users,
groups, app registrations, role assignments, or resource permissions were
created during this checkpoint.

## Verification

- `npm run validate:identity-personas`
- TypeScript compilation with incremental state disabled
- Next.js production build
- Full automated test suite

The catalog closes the missing-user-definition gap. Cloud RBAC and production
identity lifecycle remain a separate Azure infrastructure checkpoint.

## What changed

The implementation claims in the original result content are preserved below.

## Files changed

See the original result content and the canonical inventory in docs/PROJECT_STATE.md.

## Checks run and results

Verification evidence is preserved in the original result content; unresolved limits are called out in docs/PROJECT_STATE.md.

## Deviations from the spec

No deviation is inferred by this metadata normalization. Review the original result content for slice-specific deviations.

## Important decisions

This slice remains first-class project history. The current product direction is recorded in docs/PROJECT_STATE.md.

## Remaining follow-ups

See docs/PROJECT_STATE.md and the matching spec for current follow-ups.
