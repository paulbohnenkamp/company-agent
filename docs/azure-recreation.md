# Azure deployment

Azure hosts the Business Agent API and its data/provider dependencies.
Mountaineer is published from Copilot Studio to Teams; it is not a custom
Teams container in this deployment.

## Resource responsibilities

| Resource | Purpose |
| --- | --- |
| App Service | Hosts the authenticated ASP.NET Core API |
| Azure SQL | Durable cases, runs, findings, and review actions |
| Blob Storage | Evidence and source snapshots |
| Key Vault | Runtime secrets and references |
| Application Insights / Log Analytics | Telemetry and diagnostics |
| Container Registry | Immutable API images |
| Microsoft Foundry | Optional provider-backed API execution |
| Entra ID | Human and workload identity |

The C# API remains the authorization, evidence, persistence, and human-action
boundary. Do not put credentials in source, Bicep, or agent instructions.

## AZD workflow

```sh
azd auth login
azd env new mountaineer-dev --no-prompt
azd env select mountaineer-dev
azd env set AZURE_SUBSCRIPTION_ID <subscription-id>
azd env set AZURE_RESOURCE_GROUP rg-mountaineer-dev
azd env set AZURE_LOCATION westus2
azd env set SQL_ADMIN_OBJECT_ID <entra-sql-admin-object-id>
azd env set ENTRA_AUDIENCE <api-app-client-id>
azd provision --preview --no-prompt
azd provision
azd deploy
```

Inspect the preview and `azd config` before provisioning. Production API
configuration uses the Foundry/provider path and Entra identity; Development
alone may use deterministic fakes.

## Current deployment status

On 2026-09-09, the API-only Bicep and AZD preview passed for the isolated
`mountaineer-dev` environment. It will create only the API stack in
`rg-mountaineer-dev`; it does not create Teams, web, or Bot resources. The
existing `landops-dev` API health endpoint responded with `{"status":"ok"}`.

The isolated stack was provisioned and deployed successfully to
`https://landops-7pxfuiyt-api.azurewebsites.net`. The fresh database was
initialized with all six EF migrations (18 application tables), and the API
health endpoint returned `{"status":"ok"}`. Runtime migrations remain
disabled.

The active deployment plan is local at `.azure/deployment-plan.md`. The local
SQL-backed API suite now passes with the existing `landops-sqlserver`
container. Provisioning and deployment of `mountaineer-dev` are complete; the
AZD deployment used a remote ACR build.

## Verification and rollback

Verify API health, Entra authentication, SQL connectivity, provider health,
API tool contracts, and Application Insights telemetry. Then complete the
Copilot Studio Preview/activity-map check and `@Mountaineer` Teams smoke test
from [the activation runbook](teams-live-activation.md).

Deploy a new immutable API image/version, smoke-test it, and retain the prior
version as rollback target. Disable or unpublish the Copilot Studio version if
the agent path fails; do not mutate a live version in place.
