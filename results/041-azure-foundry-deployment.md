---
id: 041-azure-foundry-deployment
title: Checkpoint 041 result: Azure and Foundry deployment
status: completed
completed: 2026-09-07
spec: specs/041-azure-foundry-deployment.md
---


# Checkpoint 041 result: Azure and Foundry deployment

## Implemented

- Added AZD project manifest: `azure.yaml`.
- Added Next.js and ASP.NET Core container build definitions.
- Added `infra/main.bicep` for App Service, ACR, SQL, Blob, Key Vault,
  Application Insights, Log Analytics, and the shared Azure AI Services/Foundry
  model deployment.
- Added explicit ACR pull, Blob reader, Key Vault secret reader, and Foundry
  model-user assignments for the API's stable user-assigned identity.
- Reused the existing `ai-account-7b7o3sct37fgg` Foundry account and its active
  `land-model` deployment after the subscription rejected creation of a new
  `gpt-4o-mini` deployment during preview.
- Configured SQL for Entra-only authentication and added the explicit
  contained-user bootstrap script.
- Added narrow App Service outbound-IP firewall configuration instead of the
  over-broad `0.0.0.0` Azure-services exception.
- Diagnosed the App Service startup log and fixed user-assigned identity
  selection by wiring `AZURE_CLIENT_ID`, the ACR client ID, and SQL's
  managed-identity `User Id`.
- Added deployment runbook and learner-facing documentation.

## Important correction

The first infrastructure draft attempted to treat Azure SQL management RBAC as
database data access. That was removed. Database permissions require a
contained Entra user inside the database. The identity now reaches SQL, but
the runtime identity correctly lacks `CREATE TABLE`; schema creation was
performed separately by the configured Entra SQL administrator.

## Verification state

The Bicep template compiles successfully. `azd provision --no-prompt` and
`azd deploy --no-prompt` both pass for the `landops-dev` environment. Startup
logs prove that ACR image pulls and SQL Entra login work. The deployed runtime
is intentionally configured with `LandOps__ApplyMigrations=false` and only
reader/writer SQL roles.

Live application verification is **PASS**. The configured Entra SQL
administrator applied EF migrations and the fictional case seed. The API was
then restored to `LandOps__ApplyMigrations=false`; no broad firewall rule or
permanent runtime DDL privilege was added.

## Evidence and remaining gate

- `az bicep build --file infra/main.bicep` passes.
- `azd provision --no-prompt` passes in `landops-dev`.
- `azd deploy --no-prompt` passes for both services.
- The deployed API uses the user-assigned identity for ACR, SQL, and Foundry.
- The migration action and live endpoint checks are complete. A bounded
  Foundry-backed request remains an optional product smoke test because the
  application’s provider path is opt-in and the existing Foundry deployment is
  shared infrastructure.

## Final live evidence

- API `/health` — HTTP 200.
- API `/api/v1/company` — HTTP 200.
- API `/api/v1/cases/synthetic-wv-case-braxton-001` — HTTP 200 with seeded
  synthetic case data.
- Web `/` — HTTP 200.
- `LandOps__ApplyMigrations` — `false` after seed completion.
- Temporary operator firewall rule — removed.

## Deployed endpoints

- API: https://landops-masoqbs4-api.azurewebsites.net/
- Web: https://landops-masoqbs4-web.azurewebsites.net/
- Azure Portal resource group: https://portal.azure.com/#@/resource/subscriptions/612f01c6-d9d8-4358-ad59-5b6f854dc50b/resourceGroups/rg-landops-dev/overview

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
