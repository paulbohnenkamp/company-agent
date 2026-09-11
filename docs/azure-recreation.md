# Azure deployment

Azure hosts the Company Agent API and its data/provider dependencies.
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

The isolated `mountaineer-dev` resource group uses generated names with the
`mountaineer` prefix. The current resource layout is:

| Resource | Mountaineer deployment purpose |
| --- | --- |
| `mountaineer-<suffix>-api` | Authenticated ASP.NET Core API used by Copilot Studio tools |
| `mountaineer-<suffix>-api-id` | User-assigned API workload identity for ACR, SQL, Storage, Key Vault, and Foundry |
| `mountaineer-<suffix>-plan` | Linux App Service plan hosting the API |
| `mountaineer<suffix>cr` | Private ACR repository for immutable API images |
| `mountaineer-<suffix>-sql` / `Mountaineer` | Entra-only Azure SQL server and application database |
| `mountaineer<suffix>stg` | Private Blob-capable storage for evidence and source snapshots |
| `mountaineer-<suffix>-kv` | Key Vault for runtime secrets and references |
| `mountaineer-<suffix>-insights` | Application Insights request and dependency telemetry |
| `mountaineer-<suffix>-logs` | Log Analytics workspace for centralized diagnostics |

The `master` entry displayed beneath the SQL server is Azure SQL's system
database, not a second application database. The application database is
`Mountaineer`.

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

The isolated stack was provisioned and deployed once successfully during the
initial naming pass, then intentionally removed because its generated names
used the legacy `landops` prefix and database name. The corrected stack uses
the Mountaineer names above. Its fresh database will be initialized with the
same six EF migrations before final health verification. Runtime migrations
remain disabled.

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
