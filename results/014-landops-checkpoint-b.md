---
id: 014-landops-checkpoint-b
title: LandOps Workbench checkpoint B WV evidence and reconciliation
status: completed
completed: 2026-09-04
spec: specs/014-landops-checkpoint-b.md
---



## What changed

- Added C# source identity, immutable snapshot, public evidence, production
  result, reconciliation run, finding, conflict, and unknown models.
- Added frozen Braxton WVDEP/WVGES fixture data and a deterministic reconciliation
  service.
- Added EF Core persistence and migration for evidence and reconciliation tables.
- Added `POST /api/v1/cases/{caseId}/runs` and
  `GET /api/v1/cases/{caseId}/runs/{runId}`.
- Preserved independent operator claims, mineral-title uncertainty, provenance,
  and no-match versus reported-zero semantics.
- Added focused deterministic and API coverage.

## Files changed

- `dotnet/LandOps.Domain/EvidenceContracts.cs`;
- `dotnet/LandOps.Application/Reconciliation.cs`;
- `dotnet/LandOps.Infrastructure/BraxtonFixture.cs`;
- `dotnet/LandOps.Infrastructure/ReconciliationPersistence.cs`;
- `dotnet/LandOps.Infrastructure/LandOpsDbContext.cs`;
- `dotnet/LandOps.Infrastructure/Migrations/**`;
- `dotnet/LandOps.Api/Program.cs`;
- `dotnet/LandOps.Application.Tests/ReconciliationTests.cs`;
- `dotnet/README.md`;
- `specs/014-landops-checkpoint-b.md`.

## Checks run and results

- `dotnet build dotnet/LandOps.sln`: passed;
- `dotnet test dotnet/LandOps.sln`: passed, 7 tests;
- real SQL Server 2022 verification: migration applied, deterministic run saved,
  run reloaded with 3 findings, 1 conflict, 2 unknowns, and two evidence IDs;
- live API unknown-case path: returned 404;
- `npm test`: passed, 120 tests;
- `npm run typecheck`: passed;
- `npm run build`: passed with the existing package-lock tracing warning;
- `git diff --check`: passed.

## Deviations from the spec

None. The fixture is intentionally compact and preserves the source-specific
facts as JSON while keeping identity, snapshot, case, run, and judgment state
relational.

## Important decisions

- Keep the production result explicit as an enum so `NoMatch` cannot collapse
  into `ReportedZero`.
- Keep the deterministic run endpoint separate from agent execution; checkpoint
  C will add the typed three-agent workflow.
- Make fixture persistence idempotent for source identities, snapshots, and
  evidence while creating a new run for each execution.

## Remaining follow-ups

Checkpoint C should port the ordered intake, reconciler, and synthesizer seam and
prevent synthesis when required upstream execution fails.
