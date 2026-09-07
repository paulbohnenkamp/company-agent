---
id: 015-landops-checkpoint-c
title: LandOps Workbench checkpoint C typed agent workflow
status: completed
created: 2026-09-04
updated: 2026-09-07
result: results/015-landops-checkpoint-c.md
---



## Goal

Implement the three bounded Business Agent steps in C#: case intake, land-well
reconciliation, and case synthesis. Each step must return a typed, case-scoped
artifact and the workflow must refuse synthesis after required upstream failure.

## Non-goals

- Model-backed execution, Foundry, live sources, React integration, or Azure.
- General DAG scheduling, parallelism, or a separate agent framework.
- Human review persistence or consequential actions beyond a proposed route.

## Current-state findings

- Checkpoint B persists deterministic evidence and reconciliation judgments.
- The TypeScript reference already defines the three-step order and safety boundaries.

## Chosen approach

Add a small application workflow over the existing deterministic reconciliation
service. Persist ordered `AgentStep` records and one `Synthesis` record. Keep
the provider seam implicit and replaceable; no model provider is required.

## Alternatives considered

- A generic workflow engine was rejected because the first three-step path is
  fixed and must remain easy to inspect.
- Calling synthesis directly from the API was rejected because the workflow
  boundary must own ordering and failure propagation.

## Acceptance criteria

- Intake, reconciler, and synthesizer run in order with typed artifacts.
- Step records retain status, order, producer version, and case/run scope.
- Synthesis preserves findings, conflicts, unknowns, evidence references, and
  proposes human review.
- A required step failure prevents synthesis.
- The persisted API run includes the ordered steps and synthesis.
- Existing .NET and TypeScript checks remain passing.

## Verification commands

```sh
DOTNET_ROOT=/private/tmp/business-agent-dotnet /private/tmp/business-agent-dotnet/dotnet build dotnet/LandOps.sln
DOTNET_ROOT=/private/tmp/business-agent-dotnet /private/tmp/business-agent-dotnet/dotnet test dotnet/LandOps.sln
npm test
npm run typecheck
npm run build
git diff --check
```

## Affected files or modules

- `dotnet/LandOps.Domain/**`
- `dotnet/LandOps.Application/**`
- `dotnet/LandOps.Infrastructure/**`
- `dotnet/LandOps.Api/**`
- focused tests and execution records.

## Milestones

1. Add typed step and synthesis records.
2. Implement ordered deterministic workflow and failure guard.
3. Persist and expose workflow artifacts.
4. Verify and record the result.

## Risks and open questions

- Keep this workflow small so checkpoint D can connect the existing React workspace
  without another API redesign.

## Progress log

- 2026-09-04: Began after checkpoint B passed its acceptance criteria.
- 2026-09-04: Added typed intake, reconciler, and synthesizer steps, persisted
  agent artifacts and synthesis, and exposed them through the run API.
- 2026-09-04: Verified the new migration and live SQL Server-backed three-step
  workflow response.

## Decision log

- 2026-09-04: Keep the deterministic executor as the default and preserve the
  same typed output seam for a later Foundry adapter.
