# Learn the LandOps Workbench

This tutorial builds a mental model of the current LandOps Workbench and then runs one complete case through it. The web application uses Next.js App Router with React. You do not need prior knowledge of ASP.NET Core or Entity Framework Core.

## What you will build

You will run a local oil-and-gas land operations application that:

- loads a synthetic Braxton County, West Virginia case;
- stores the case in SQL Server;
- compares the case with frozen WVDEP and WVGES evidence;
- preserves disagreements instead of choosing a source silently;
- records structured findings, unknowns, and a proposed human-review route;
- answers bounded questions about the completed run; and
- records an append-only review decision.

The application does not make a title determination or take a consequential business action.

## Read these pages in order

1. Read [LandOps architecture](landops-architecture.md) to see how the browser, API, application services, domain model, and database fit together.
2. Read [LandOps data and evidence](landops-data-and-evidence.md) to understand why the application stores source identity, snapshots, evidence, findings, conflicts, and unknowns separately.
3. Follow [LandOps development workflow](landops-development-workflow.md) to start the application and run its checks.
4. Use [LandOps code tour](landops-code-tour.md) when you want to connect a screen or API request to the code that handles it.
5. Keep [LandOps glossary](landops-glossary.md) open when a product term is new.

## Prerequisites

Install these tools before you start:

- .NET SDK 10.0.400 or a compatible .NET 10 SDK;
- Node.js and npm versions accepted by the repository;
- Docker Desktop, for local SQL Server; and
- a terminal opened at the repository root.

The repository pins the .NET SDK in `dotnet/global.json`. The local SQL Server password in the examples is for the disposable development container only.

## Start the database

If the `landops-sqlserver` container does not exist, create it:

```sh
docker run --detach --name landops-sqlserver \
  --env ACCEPT_EULA=Y \
  --env MSSQL_SA_PASSWORD='LandOps_dev_2026!' \
  --publish 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

If the container already exists but is stopped, start it:

```sh
docker start landops-sqlserver
```

## Start the .NET API

Run the API from the repository root:

```sh
dotnet run --project dotnet/LandOps.Api/LandOps.Api.csproj
```

Development configuration applies EF Core migrations and seeds the synthetic case. Leave this terminal running.

Check the API:

```sh
curl http://localhost:5006/health
curl http://localhost:5006/api/v1/cases/synthetic-wv-case-braxton-001
```

The first request returns a health response. The second request returns the case and its submitted evidence.

## Start the React workspace

Open a second terminal and run:

```sh
npm install
LANDOPS_API_URL=http://localhost:5006 \
NEXT_PUBLIC_LANDOPS_MODE=true \
npm run dev
```

Open the local URL printed by Next.js. Select **Run Land-Well Reconciliation**. The page should show three completed workflow steps, two independent source panels, one preserved operator conflict, two open unknowns, and a human-review packet.

## Follow one request

The browser does not call SQL Server. It calls a Next.js same-origin route:

```text
Browser → Next.js /api/landops/run → ASP.NET Core /api/v1/cases/{caseId}/runs → SQL Server
```

The API loads the frozen fixture, executes the deterministic application workflow, saves the result, and returns an API response. The Next.js adapter converts that response to the existing React view model.

## Try the review boundary

After the run completes, ask:

```text
Do WVDEP and WVGES agree on the operator?
```

The answer should say that the values differ and cite both evidence records. Choose **Approve review packet**. The API writes a review decision. It does not change a registry, file a document, contact an owner, or determine title.

## Run with a live Foundry provider

The local application supports two conversation modes:

- `deterministic` uses the bounded offline responder and needs no model credentials.
- `foundry` calls the configured Microsoft Foundry Responses endpoint and validates the returned JSON and evidence references before saving the answer.

To use a local Foundry endpoint with an API key, start the API with these environment variables:

```sh
LandOps__ConversationProvider=foundry \
Foundry__Endpoint=https://<resource>.openai.azure.com \
Foundry__Model=<model-deployment> \
Foundry__ApiKey=<api-key> \
dotnet run --project dotnet/LandOps.Api/LandOps.Api.csproj
```

Keep the key out of source files and shell history when you use a real account. The API key travels in the `api-key` request header.

## Run in Azure with managed identity

In Azure, set `Foundry__UseManagedIdentity=true` and omit `Foundry__ApiKey`. The API uses its managed identity to request a token for `https://ai.azure.com/.default`. Grant that identity the required Foundry model permission, then set `LANDOPS_API_URL` on the Next.js app to the deployed ASP.NET Core API URL.

The browser still uses the same Next.js routes in both modes:

```text
Browser → Next.js proxy → ASP.NET Core API → deterministic provider or Foundry → SQL Server
```

### Apply the first Azure SQL schema

Azure SQL is Entra-only. The configured Entra SQL administrator applies the
initial EF Core schema; the running API does not receive permanent schema
modification permissions. Install the EF tool, sign in, temporarily allow
your client IP in Azure SQL Networking, and run:

```sh
dotnet tool install --global dotnet-ef --version 10.0.11
export PATH="$PATH:$HOME/.dotnet/tools"
az login
dotnet ef database update \
  --project dotnet/LandOps.Infrastructure \
  --startup-project dotnet/LandOps.Api \
  --connection "Server=tcp:<sql-server>.database.windows.net,1433;Initial Catalog=LandOps;Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;"
```

Remove the temporary firewall rule afterward. Never use a shared demo password
for Entra accounts or place SQL secrets in `.env` files.

## What to learn next

Read the [LandOps development workflow](landops-development-workflow.md) before changing code. It explains which project owns each kind of change and which checks prove the change works.
