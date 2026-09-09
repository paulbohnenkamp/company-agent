# Business Agent Teams app

Business Agent is a Microsoft Teams bot for bounded, evidence-grounded review.
Teams is the product surface. The bot adapter receives a Teams activity, calls
the ASP.NET Core API, and returns one concise review with findings, uncertainty,
provenance, and a human decision boundary.

The repository does not include a web or administration application. The API
owns authorization, evidence rules, persistence, agent execution, and human
actions. The Teams adapter owns transport, mention parsing, idempotency, and
response formatting.

## Current scope

- Personal chat, group chat, and channel activity handling.
- Deterministic local review of the synthetic Sample Energy Company case.
- Optional Entra workload authentication from adapter to API.
- Append-only human review actions through the API boundary.
- Versioned Teams app package generation.
- Azure App Service deployment for the API and Teams adapter.

Foundry execution is an explicit provider path. Deterministic mode remains the
default for local verification. Public WVDEP/WVGES evidence is not proof of
title, and consequential actions remain human-controlled.

## Run locally

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
DANGEROUSLY_ALLOW_UNAUTHENTICATED_REQUESTS=true \
BUSINESS_AGENT_API_URL=http://127.0.0.1:5006 \
npm run teams:dev
```

The adapter listens on port `3978`. Local unauthenticated mode is for local
testing only. Deployed mode requires the Bot Framework credentials and the
configured API workload token settings.

## Teams flow

1. One Business Agent Teams app receives the message.
2. The API can plan bounded specialist steps and connected agents for a case.
3. Today, routing is bounded by the configured scenario and API plan; natural
   language selects the request text, not an arbitrary agent by description.
4. Teams packages publish the app to a tenant, where an administrator can
   share it through the app catalog and Teams.
5. Predictable requests are represented by API scenarios; Teams topics are a
   possible future presentation of those scenarios.
6. Teams membership and Microsoft 365 groups help share the app, while Entra
   claims and API authorization decide what a person or trusted adapter can do.
7. Keeping routing and business rules in the API leaves the Teams adapter small
   and reduces custom transport routing, but does not remove it entirely.

## Verify

```sh
node --version
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
az bicep build --file infra/main.bicep --stdout
git diff --check
```

## Build the Teams package

The canonical manifest template is
`teams-app/manifest.template.json`.

```sh
npm run teams:package -- \
  --app-id <teams-app-guid> \
  --bot-app-id <bot-app-guid> \
  --endpoint https://<adapter-host>/api/messages \
  --info-url https://<public-information-url> \
  --color-icon path/to/color.png \
  --outline-icon path/to/outline.png
```

See [the Teams package guide](teams-app/README.md) for package and installation
rules.

## Documentation

Start with [project state](docs/PROJECT_STATE.md), then read the
[Teams architecture](docs/teams-architecture.md),
[Teams development guide](docs/teams-development.md),
[Azure recreation guide](docs/azure-recreation.md), and
[Teams activation runbook](docs/teams-live-activation.md).

The [documentation map](docs/README.md) identifies current guides. Older
runtime, product-design, and domain-planning material remains preserved in
Git history and is classified in [documentation history](docs/history.md).

## Repository map

- `dotnet/LandOps.*` — API, domain, application, infrastructure, and tests.
- `src/teams/` — Microsoft Teams transport adapter and API client.
- `teams-app/` — Teams manifest template and package documentation.
- `domains/`, `fixtures/`, and `evaluations/` — bounded review behavior and
  deterministic evidence fixtures.
- `infra/` and `teams.Dockerfile` — Azure deployment and adapter packaging.
- `specs/` and `results/` — approved work and verification history.
