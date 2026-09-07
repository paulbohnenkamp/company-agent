---
id: 017-landops-checkpoint-e
title: LandOps Workbench checkpoint E conversation and review
status: completed
completed: 2026-09-04
spec: specs/017-landops-checkpoint-e.md
---



## What changed

- Added persisted conversation turns and append-only review decisions.
- Added deterministic C# case conversation with topic, grounding, and evidence
  references.
- Added C# conversation/review API endpoints and SQL migration.
- Connected C# mode in the React workspace to the new same-origin proxy routes.

## Files changed

- `dotnet/LandOps.Domain/ConversationContracts.cs`;
- `dotnet/LandOps.Application/Conversation.cs`;
- `dotnet/LandOps.Infrastructure/LandOpsDbContext.cs`;
- `dotnet/LandOps.Infrastructure/Migrations/**`;
- `dotnet/LandOps.Api/Program.cs`;
- `app/api/landops/conversation/route.ts`;
- `app/api/landops/review/route.ts`;
- `app/page.tsx`;
- `specs/017-landops-checkpoint-e.md`.

## Checks run and results

- `dotnet build dotnet/LandOps.sln`: passed;
- `dotnet test dotnet/LandOps.sln`: passed, 8 tests;
- `npm test`: passed, 120 tests;
- `npm run typecheck`: passed;
- `npm run build`: passed with the existing package-lock tracing warning;
- live SQL-backed proxy verification: operator question returned grounded
  WVDEP/WVGES evidence references; review approval persisted successfully;
- `git diff --check`: passed.

## Deviations from the spec

None.

## Important decisions

- Keep conversation deterministic and bounded until Foundry is added as a
  validated provider implementation.
- Preserve the existing TypeScript routes as the default fallback and use the
  C# routes only when C# transport mode is enabled.

## Remaining follow-ups

Checkpoint F is deployment preparation: Entra identity, Azure SQL/Blob,
Application Insights, and a Foundry adapter under an approved deployment plan.
