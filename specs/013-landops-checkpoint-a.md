---
id: 013-landops-checkpoint-a
title: LandOps Workbench checkpoint A foundation
status: completed
created: 2026-09-04
updated: 2026-09-07
result: results/013-landops-checkpoint-a.md
---



## Goal

Create the smallest runnable C#/.NET foundation for LandOps Workbench: a pinned
.NET 10 solution, typed case foundation, EF Core SQL Server persistence and
migrations, deterministic Braxton case seed data, and a case-scoped API.

## Non-goals

- Porting WV evidence acquisition, reconciliation, agents, conversation, or Foundry.
- Rewriting or deleting the TypeScript reference application.
- Azure resources, authentication, background jobs, or consequential actions.
- A generalized jurisdiction model beyond the case boundary needed by this slice.

## Current-state findings

- The TypeScript application already contains the synthetic Braxton case, frozen
  evidence, typed flow, local persistence, review lifecycle, and browser workspace.
- The repository has no .NET solution or SDK pin.
- The .NET 10.0.400 SDK is available in a user-local temporary installation.
- Docker is installed, but no running SQL Server-compatible daemon is currently available.

## Chosen approach

Add a small seven-project solution under `dotnet/`. Use minimal APIs, EF Core 10
with the SQL Server provider, and inward-facing project dependencies. Keep the
checkpoint model intentionally small: `LandCase`, `Well`, and synthetic submitted
evidence. Seed the existing Braxton case deterministically and expose it through
`GET /api/v1/cases/{caseId}`.

## Alternatives considered

- Keeping the first slice in TypeScript was rejected because the product direction
  requires C#/.NET as the application center of gravity.
- SQLite was rejected because SQL Server compatibility is part of the portfolio
  target and must be proved with the intended provider.
- A broader domain model was deferred because it would slow the first runnable slice.

## Acceptance criteria

- `dotnet/global.json` pins the verified .NET 10 SDK.
- The solution builds with .NET 10 and uses C# 14 defaults.
- EF Core SQL Server migrations exist and model the checkpoint-A tables.
- The seeded Braxton case reloads through the persistence boundary when a real
  SQL Server instance is available.
- The API returns the case, wells, submitted evidence, synthetic marker, and
  authority boundary labels; unknown cases return 404.
- Tests cover domain invariants, persistence mapping, API behavior, and case isolation.
- Existing TypeScript tests, typecheck, and build remain passing.

## Verification commands

```sh
DOTNET_ROOT=/private/tmp/business-agent-dotnet /private/tmp/business-agent-dotnet/dotnet build dotnet/LandOps.sln
DOTNET_ROOT=/private/tmp/business-agent-dotnet /private/tmp/business-agent-dotnet/dotnet test dotnet/LandOps.sln
npm run typecheck
npm test
npm run build
git diff --check
```

Real SQL Server integration tests require a running SQL Server-compatible instance.

## Affected files or modules

- `dotnet/**`
- `specs/013-landops-checkpoint-a.md`
- `results/013-landops-checkpoint-a.md`

## Milestones

1. Pin SDK and scaffold the solution/projects.
2. Implement domain model, EF persistence, migrations, and deterministic seed.
3. Implement the case API and focused tests.
4. Run all available verification and record any external SQL Server gap.

## Progress log

- 2026-09-04: Approved checkpoint A scope from the LandOps V1 implementation spec.
- 2026-09-04: Installed .NET SDK 10.0.400 in a user-local temporary directory.
- 2026-09-04: Scaffolded the seven-project solution, added the checkpoint model,
  SQL Server persistence, API, tests, and migration.
- 2026-09-04: Real SQL Server verification found and fixed an explicit foreign-key
  length mismatch before the migration and seeded API path passed.

## Decision log

- 2026-09-04: Use minimal APIs consistently for the first slice.
- 2026-09-04: Keep SQL Server as the only relational provider; do not substitute SQLite.
- 2026-09-04: Preserve TypeScript as the behavioral reference until equivalent .NET slices exist.

## Risks and open questions

- Local SQL Server verification uses the disposable `landops-sqlserver` Docker
  container; Azure SQL remains outside this checkpoint.
