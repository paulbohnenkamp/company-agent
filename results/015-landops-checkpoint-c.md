---
id: 015-landops-checkpoint-c
title: LandOps Workbench checkpoint C typed agent workflow
status: completed
completed: 2026-09-04
spec: specs/015-landops-checkpoint-c.md
---



## What changed

- Added typed `AgentStep` and `Synthesis` persistence records.
- Added deterministic ordered intake, land-well reconciler, and case synthesizer
  workflow services.
- Added the agent-workflow migration and API response fields for ordered steps
  and proposed human review.
- Preserved evidence, conflict, unknown, and production semantics from checkpoint B.

## Files changed

- `dotnet/LandOps.Domain/WorkflowContracts.cs`;
- `dotnet/LandOps.Application/AgentWorkflow.cs`;
- `dotnet/LandOps.Infrastructure/LandOpsDbContext.cs`;
- `dotnet/LandOps.Infrastructure/ReconciliationPersistence.cs`;
- `dotnet/LandOps.Infrastructure/Migrations/**`;
- `dotnet/LandOps.Api/Program.cs`;
- `dotnet/LandOps.Application.Tests/ReconciliationTests.cs`;
- `specs/015-landops-checkpoint-c.md`.

## Checks run and results

- `dotnet build dotnet/LandOps.sln`: passed;
- `dotnet test dotnet/LandOps.sln`: passed, 8 tests;
- real SQL Server verification: agent migration applied and live run response
  returned intake, reconciler, synthesizer in order, plus human-review routing;
- `npm test`: passed, 120 tests;
- `npm run typecheck`: passed;
- `npm run build`: passed with the existing package-lock tracing warning;
- `git diff --check`: passed.

## Deviations from the spec

None.

## Important decisions

- Keep step artifacts as typed JSON envelopes with relational run/order/status
  fields so provider implementations can evolve without losing auditability.
- Keep synthesis deterministic and offline until checkpoint F; the output seam is
  ready for a validated Foundry adapter later.

## Remaining follow-ups

Checkpoint D should connect the existing React workspace to these ASP.NET APIs
without a broad visual rewrite.
