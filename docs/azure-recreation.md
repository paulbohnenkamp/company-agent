# Azure recreation guide

This document records the deployable shape of LandOps. It is intentionally
safe to commit: it contains resource names, parameter meanings, and commands,
but no passwords, client secrets, tokens, or exported credentials.

## Resource graph

`infra/main.bicep` is the resource-group deployment entry point. It creates or
references the following boundaries:

| Resource | Purpose | Identity boundary |
| --- | --- | --- |
| Linux B1 App Service plan | Hosts web, API, and Teams adapter | Shared compute only |
| `web` App Service | Next.js review surface | User-assigned web identity pulls its ACR image |
| `api` App Service | ASP.NET Core application boundary | API identity accesses SQL, Foundry, and storage |
| `teams` App Service | Teams protocol adapter | Teams identity reads one Key Vault secret and calls the API |
| Azure Container Registry | Stores the three container images | Web, API, and Teams identities each have `AcrPull` |
| Azure SQL | Durable Workroom persistence | API identity is the data-plane identity |
| Storage account | Evidence/blob storage | API identity has blob read access |
| Key Vault | Runtime secret references | API and Teams identities receive `Key Vault Secrets User` |
| Application Insights/Log Analytics | Runtime telemetry | Connection strings are injected as settings |
| Existing Foundry account | Optional provider-backed execution | API identity receives the narrow Foundry role |

The Bicep comments identify why the Teams service is separate, why SQL
credentials are not literals, and why the bot secret is a Key Vault reference.
Do not replace those references with plaintext settings.

## Required inputs

`sqlAdminObjectId` is the object ID of the Entra SQL administrator. The
following Teams values are added only after the external app registration and
API role exist:

- `teamsBotAppId`: multi-tenant bot application ID.
- `landOpsApiScope`: API application scope, normally
  `api://<api-app-id>/.default`.
- `teamsBotClientSecretName`: Key Vault secret name, defaulting to
  `teams-bot-client-secret`.
- `entraAudience`: the API JWT audience, normally the API identifier URI.

The bot secret itself is written to Key Vault outside source control:

```sh
az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name teams-bot-client-secret \
  --value "$TEAMS_BOT_CLIENT_SECRET" \
  --query id -o tsv
```

Do not echo the secret or put it in `.env`, `azure.yaml`, Bicep, or a result
record. App Service reads it through the `@Microsoft.KeyVault(SecretUri=...)`
settings emitted by `infra/main.bicep`.

## AZD workflow

From the repository root:

```sh
azd auth login
azd env select landops-dev
azd env set AZURE_SUBSCRIPTION_ID <subscription-id>
azd env set AZURE_RESOURCE_GROUP <resource-group>
azd env set AZURE_LOCATION westus2
azd env set SQL_ADMIN_OBJECT_ID <entra-sql-admin-object-id>
azd env set ENTRA_AUDIENCE api://<api-app-id>
azd env set TEAMS_BOT_APP_ID <bot-app-id>
azd env set LANDOPS_API_SCOPE api://<api-app-id>/.default
azd provision --preview
azd provision
azd deploy
```

The exact parameter-to-environment mapping is owned by the current AZD/Bicep
extension. Inspect it with `azd config list` and the generated preview before
provisioning. The preview must show the existing resource group and shared B1
plan as the deployment target.

## Entra and Bot Framework prerequisites

The deployer must create or identify:

1. The API application identifier URI and one application role for the Teams
   adapter workload.
2. A single-tenant bot application in the Microsoft 365 tenant used by the
   Teams demo.
3. A service principal and client secret for that bot, stored in Key Vault.
4. An Azure Bot resource whose messaging endpoint is
   `https://<teams-app-host>/api/messages` and whose Teams channel is enabled.
5. Administrator consent in the tenant where the Teams package is installed.

The bot application ID, API application ID, role ID, bot resource name, and
endpoint belong in the deployment result. Secrets do not.

If local Docker credential helpers or AZD remote packaging are unavailable,
build the adapter in ACR and point App Service at the immutable tag:

```sh
az acr build --registry <registry> \
  --image landops-workbench/teams-landops-dev:<immutable-tag> \
  --file teams.Dockerfile .
az webapp config set --resource-group <resource-group> \
  --name <teams-app> \
  --generic-configurations '{"acrUseManagedIdentityCreds":true,"acrUserManagedIdentityID":"<identity-client-id>"}'
az webapp config container set --resource-group <resource-group> \
  --name <teams-app> \
  --container-image-name <registry>.azurecr.io/landops-workbench/teams-landops-dev:<immutable-tag>
```

The Teams identity must have the `AcrPull` role on the registry. The role is
declared in `infra/main.bicep`; the explicit CLI setting above is a recovery
check for an already-created App Service.

## Verification and rollback

Run the commands in the active spec before declaring the deployment complete.
After deployment, verify `/health`, then `/api/messages`, then the Teams
package and human-action path. If activation fails, disable the Bot Framework
Teams channel, restore the prior adapter image, revoke the secret, and leave
the existing web/API services unchanged.
