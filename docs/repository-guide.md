# Repository guide

In this repository, Microsoft Copilot Studio and Microsoft Teams provide the user
experience. Company Agent is the application and API boundary behind it.

## Conversation flow

```text
Teams → Copilot Studio Mountaineer → native topics/tools/agents
      → authenticated Company Agent API → structured response → Teams
```

Topics gather information and guide bounded conversations. API tools perform
exact operations. Agent and topic descriptions influence selection but never
grant access. The API remains the security and evidence boundary.

## Local development

Prerequisites: Node.js, the pinned .NET SDK in `dotnet/global.json`, and Docker
for SQL Server persistence.

```sh
npm install
docker run --detach --name landops-sqlserver \
  --env ACCEPT_EULA=Y \
  --env MSSQL_SA_PASSWORD='LandOps_dev_2026!' \
  --publish 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
dotnet run --project dotnet/LandOps.Api --urls http://127.0.0.1:5006
```

Development may use deterministic fakes for backend verification. Production
requires the configured provider path and authenticated API access.

## Verify

```sh
node --version
npm run typecheck
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
az bicep build --file infra/main.bicep --stdout
git diff --check
```

## Documentation

Start with [project state](PROJECT_STATE.md), then read the
[Company Agent deployment guide](company-agent-deployment.md),
[Copilot Studio integration](copilot-studio-integration.md),
[Teams architecture](teams-architecture.md),
[Azure recreation](azure-recreation.md), and
[live activation](teams-live-activation.md) guides.

The [documentation map](README.md) identifies current guidance. Numbered
specs and results are the durable execution record.

## Repository map

- `dotnet/LandOps.*` — API, domain, application, infrastructure, and tests.
- `departments/`, `fixtures/`, and `evaluations/` — bounded behavior and evidence.
- `infra/` and `azure.yaml` — API deployment infrastructure.
- `specs/` and `results/` — approved work and verification history.
