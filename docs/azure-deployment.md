# Business Agent Azure deployment

This repository uses Azure Developer CLI (`azd`) as the deployment entrypoint
and Bicep as the infrastructure source of truth.

## What is provisioned

`infra/main.bicep` provisions:

- three Linux App Service container apps: Next.js, ASP.NET Core, and the Teams
  adapter, sharing the existing App Service plan;
- Azure Container Registry with managed-identity pull assignments;
- Azure SQL Database with Entra-only authentication;
- Blob Storage and Key Vault with API managed-identity permissions;
- Application Insights and Log Analytics;
- a managed-identity permission on the existing Azure AI Services/Foundry
  account and `land-model` deployment from the shared Foundry resource group;
- a managed-identity `Cognitive Services OpenAI User` assignment for the API;
- an optional single-tenant Azure Bot resource and Teams channel, configured
  only when bot app and tenant inputs are supplied.

The web and API are separate services because they have different runtimes and
deployment lifecycles. `azure.yaml` maps those services to their Dockerfiles.
This is the AZD-supported Docker/App Service shape described in the [AZD
schema](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/azd-schema).

## Deployment flow

```bash
azd env new landops-dev --no-prompt
azd env set AZURE_SUBSCRIPTION_ID "<subscription-id>"
azd env set AZURE_LOCATION "westus2"
azd env set SQL_ADMIN_OBJECT_ID "<signed-in-entra-object-id>"
azd env set ENTRA_AUDIENCE "api://<api-app-registration-client-id>"
AZURE_DEV_USER_AGENT=microsoft_foundry_skill azd provision --no-prompt
AZURE_DEV_USER_AGENT=microsoft_foundry_skill azd deploy --no-prompt
```

The default cloud model is the existing `land-model` deployment. This avoids
creating a duplicate model resource and was selected after verifying that the
current subscription lacks access to the initially proposed `gpt-4o-mini`
deployment but already has an active Foundry model.

## SQL data-plane bootstrap

Azure resource RBAC is not database data access, and SQL network access is
restricted to the API App Service's published outbound IPs. After provisioning,
run:

```bash
scripts/configure-azure-sql-firewall.sh <resource-group> <sql-server> <api-app-service>
```

Then obtain the
API managed-identity principal ID from `azd env get-values`, install `sqlcmd`
with Entra access-token support, and run:

```bash
scripts/bootstrap-azure-sql-identity.sh <resource-group> <sql-server> LandOps <api-principal-id> <api-identity-name>
```

That creates the contained Entra user and grants only `db_datareader` and
`db_datawriter`. The API explicitly selects the user-assigned identity client
ID for SQL, ACR, and Foundry token acquisition. Production keeps
`LandOps:ApplyMigrations=false`: schema changes must be applied by a separate,
privileged deployment migration step, never by the long-running API identity.

The `landops-dev` environment completed its one-time migration and seed step
using the configured Entra SQL administrator. The temporary operator firewall
rule was removed afterward. The API remains least-privileged with
`LandOps__ApplyMigrations=false`.

## One-time EF Core migration

The .NET SDK must be installed, and the EF Core CLI tool must be available:

```bash
dotnet tool install --global dotnet-ef --version 10.0.11
export PATH="$PATH:$HOME/.dotnet/tools"
az login
```

Temporarily allow the operator's client IP in the Azure SQL firewall. Then run
the migration as the configured Entra SQL administrator:

```bash
dotnet ef database update \
  --project dotnet/LandOps.Infrastructure \
  --startup-project dotnet/LandOps.Api \
  --connection "Server=tcp:<sql-server>.database.windows.net,1433;Initial Catalog=LandOps;Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;"
```

Remove the temporary firewall rule after the command succeeds. Do not put a
SQL password in `.env`, `.env.example`, source code, or Azure App Service
settings. The deployed API keeps `LandOps__ApplyMigrations=false` and uses its
managed identity for normal reader/writer access.

## Verification

Run the Azure validation workflow after preparation and before deployment. Then
verify `/health`, a database-backed case URL, the web URL, the API
managed-identity role assignments, the Foundry model deployment, and one
bounded agent invocation. The `landops-dev` deployment has passed the health,
database-backed case, and web checks.

The local deterministic mode remains the fast inner loop. Cloud mode is
explicitly selected by the App Service settings and is never silently enabled
by local development.
