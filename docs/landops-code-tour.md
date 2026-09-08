# Business Agent code tour

Use this page to find the code behind a product behavior. Start with the endpoint or screen, then follow the call into the application and infrastructure layers.

## Repository map

| Path | Responsibility |
| --- | --- |
| `dotnet/LandOps.Domain` | Business objects and persisted contracts |
| `dotnet/LandOps.Application` | Use cases and deterministic business behavior |
| `dotnet/LandOps.Infrastructure` | EF Core, SQL Server mapping, fixtures, and persistence |
| `dotnet/LandOps.Api` | HTTP endpoints and application startup |
| `dotnet/*Tests` | .NET unit and API tests |
| `app/page.tsx` | React case workspace |
| `app/api/landops` | Next.js same-origin routes for C# mode |
| `src/landops/adapter.ts` | C# response to React view-model mapping |
| `specs/013-017-*` | Approved checkpoint specifications |
| `results/013-017-*` | Verification records for completed checkpoints |

## Load the case workspace

The page chooses between the TypeScript demo and the C# transport with `NEXT_PUBLIC_LANDOPS_MODE`.

1. `app/page.tsx` requests `/api/landops/case` when C# mode is enabled.
2. `app/api/landops/case/route.ts` calls the ASP.NET Core case endpoint.
3. `CaseQuery` asks `ILandCaseRepository` for the case.
4. `LandCaseRepository` uses `LandOpsDbContext` to read SQL Server.
5. The response travels back through the same route to React.

## Run reconciliation

The run path follows the same boundary:

1. The page sends `POST /api/landops/run`.
2. The Next.js route sends `POST /api/v1/cases/{caseId}/runs` to the API.
3. `ReconciliationPersistence.CreateAsync` loads `BraxtonFixture`.
4. `DeterministicAgentWorkflow.Execute` creates the ordered steps.
5. `DeterministicReconciliationService.Execute` creates findings, conflicts, and unknowns.
6. The persistence service saves the run and its child records through EF Core.
7. The route maps the API result with `src/landops/adapter.ts`.

## Ask a case question

`app/api/landops/conversation/route.ts` forwards a question to the API. The API loads the run and its evidence, then `DeterministicCaseConversation` chooses a bounded topic such as `operator`, `evidence`, `production`, `unknowns`, or `mineral-title`.

The conversation service does not search the internet and does not invent new facts. It answers from the run supplied by the API.

## Record a review decision

`app/api/landops/review/route.ts` forwards an approval or revision request. The API verifies that the run exists, creates a `ReviewDecision`, and saves it. Review decisions are append-only records. A later decision does not erase an earlier decision.

## Follow a database change

When a persisted contract changes, update the domain object, update `LandOpsDbContext`, create an EF Core migration, and run the .NET tests. The migration files under `dotnet/LandOps.Infrastructure/Migrations` are the history of the SQL schema.

## Where to add a new feature

Choose the smallest layer that owns the behavior:

- Add a business invariant to `dotnet/LandOps.Domain`.
- Add a use case to `dotnet/LandOps.Application`.
- Add storage mapping or a provider to `dotnet/LandOps.Infrastructure`.
- Add an HTTP boundary to `dotnet/LandOps.Api`.
- Add a browser interaction to `app/page.tsx` and a same-origin route under `app/api/landops`.
- Add a response-shape conversion to `src/landops/adapter.ts`.

Do not put SQL queries in React. Do not put business judgment in a Next.js route. Do not make a cloud provider a requirement for deterministic tests.
