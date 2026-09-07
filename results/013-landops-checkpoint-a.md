---
id: 013-landops-checkpoint-a
title: LandOps Workbench checkpoint A foundation
status: completed
completed: 2026-09-04
spec: specs/013-landops-checkpoint-a.md
---



## What changed

Implemented the first runnable C#/.NET LandOps slice under `dotnet/`:

- pinned .NET SDK 10.0.400 and C# 14;
- created the seven-project solution with inward project dependencies;
- added typed `LandCase`, `Well`, and synthetic submitted-evidence models;
- added EF Core 10 SQL Server persistence and the initial migration;
- seeded the synthetic Braxton County case;
- exposed `GET /api/v1/cases/{caseId}` and `/health`;
- added domain, application, and API tests;
- documented local SQL Server startup and API usage.

## Files changed

- `dotnet/global.json`, `dotnet/Directory.Build.props`, and `dotnet/LandOps.sln`;
- `dotnet/LandOps.Domain/**`;
- `dotnet/LandOps.Application/**`;
- `dotnet/LandOps.Infrastructure/**`;
- `dotnet/LandOps.Api/**`;
- `dotnet/LandOps.*.Tests/**`;
- `specs/013-landops-checkpoint-a.md`;
- `docs/LANDOPS_WORKBENCH_V1.md`;

## Checks run and results

- .NET SDK: 10.0.400; runtime: 10.0.11;
- `dotnet build dotnet/LandOps.sln`: passed, 0 warnings, 0 errors;
- `dotnet test dotnet/LandOps.sln`: passed, 5 tests;
- real SQL Server 2022 Docker verification: migration applied, database created,
  Braxton seed persisted, live API returned 200 with case data, unknown case
  returned 404;
- `npm test`: passed, 120 tests;
- `npm run typecheck`: passed;
- `npm run build`: passed with the existing package-lock tracing warning;
- `git diff --check`: passed.

## Deviations from the spec

None. The first real SQL Server run found a primary/foreign-key string-length
mismatch; the model and migration were corrected and rerun successfully.

## Important decisions

- Keep the API on minimal APIs and the solution as one deployable application.
- Use explicit 100-character case and child-record keys so SQL Server foreign keys
  have identical definitions.
- Keep startup migration/seed behavior opt-in through the Development configuration;
  API tests replace only the repository and disable startup migrations.

## Remaining follow-ups

Checkpoint B should port the frozen WV source snapshots and deterministic
reconciliation into the new typed application/persistence boundaries. The
TypeScript implementation remains the behavioral reference until that slice is
equivalent.
