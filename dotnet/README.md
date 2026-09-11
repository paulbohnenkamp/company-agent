# Company Agent .NET foundation

Company Agent is a .NET 10/C# 14 ASP.NET Core application with EF Core
10 and SQL Server persistence. Checkpoints A through E now cover the case
foundation, evidence reconciliation, ordered workflow, API tools, case-scoped
conversation, and append-only human review.

Start with the [Mountaineer development guide](../docs/teams-development.md)
for current local run instructions. Use this file as a short .NET-specific
reference.

## Local run

Start SQL Server 2022:

```sh
docker run --detach --name landops-sqlserver \
  --env ACCEPT_EULA=Y \
  --env MSSQL_SA_PASSWORD='LandOps_dev_2026!' \
  --publish 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

Then run the API from the repository root. The development launch profile uses
port 5006:

```sh
dotnet run --project dotnet/LandOps.Api/LandOps.Api.csproj
```

Development startup applies migrations and seeds the synthetic case. The case
endpoint is `GET /api/v1/cases/synthetic-wv-case-braxton-001`.

The deterministic offline run path exposes:

- `POST /api/v1/cases/{caseId}/runs` creates a fixture-backed reconciliation run.
- `GET /api/v1/cases/{caseId}/runs/{runId}` reloads its findings, conflicts,
  unknowns, evidence references, and provenance.
- `POST /api/v1/cases/{caseId}/runs/{runId}/conversation` answers bounded
  questions from the saved run.
- `POST /api/v1/cases/{caseId}/runs/{runId}/review` records an append-only
  approval or revision request.

The submitted package is synthetic. Public WVDEP and WVGES records are bounded
to identity comparison and are not proof of mineral title.

The C# Foundry provider is an opt-in infrastructure boundary. It does not run
during the local deterministic workflow and does not require an Azure account
for the test suite. Configure it only after an approved deployment plan supplies
the endpoint, model deployment, identity, and secret source.

To use the provider for live case conversation, set
`LandOps:ConversationProvider` to `foundry` and provide `Foundry:Endpoint`,
`Foundry:Model`, and `Foundry:ApiKey` through environment configuration or a
managed secret source. For Azure managed identity, set
`Foundry:UseManagedIdentity` to `true` and omit the API key. The provider uses
the `https://ai.azure.com/.default` token scope. The reconciliation workflow
remains deterministic so exact evidence transforms and status semantics do not
depend on model behavior.

Workroom threads use `LandOps:WorkroomPersistence=memory` by default so the
learner demo runs without SQL Server. Set it to `sql` in an Azure SQL or SQL
Server deployment after applying migrations; the durable adapter stores the
bounded context, participants, route, identity, status, and human boundary.
