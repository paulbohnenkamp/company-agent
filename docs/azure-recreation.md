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
azd env select landops-dev
azd env set AZURE_SUBSCRIPTION_ID <subscription-id>
azd env set AZURE_RESOURCE_GROUP <resource-group>
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

## Verification and rollback

Verify API health, Entra authentication, SQL connectivity, provider health,
API tool contracts, and Application Insights telemetry. Then complete the
Copilot Studio Preview/activity-map check and `@Mountaineer` Teams smoke test
from [the activation runbook](teams-live-activation.md).

Deploy a new immutable API image/version, smoke-test it, and retain the prior
version as rollback target. Disable or unpublish the Copilot Studio version if
the agent path fails; do not mutate a live version in place.
