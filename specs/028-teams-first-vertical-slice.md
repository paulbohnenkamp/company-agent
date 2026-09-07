---
id: 028-teams-first-vertical-slice
title: Teams-first LandOps vertical slice
status: completed
created: 2026-09-06
updated: 2026-09-07
result: results/028-teams-first-vertical-slice.md
---


## Goal

Make Microsoft Teams the conversational entry point to the shared LandOps
Workroom while keeping the focused web review route and ASP.NET Core workflow
boundary reusable by every front end.

## Non-goals

- Registering a production Microsoft Teams bot or tenant application.
- Moving authorization, evidence rules, or agent orchestration into the Teams
  transport adapter.
- Replacing the focused review surface with a second giant dashboard.
- Autonomous title, payment, filing, or owner-contact decisions.

## Current-state findings

- The C# API already creates and runs case-scoped Workrooms.
- The TypeScript Teams adapter can translate channel activities into Workroom
  requests but previously returned only a basic status response.
- Human actions needed an append-only persistence boundary.
- Teams responses needed evidence counts, unknowns, human boundaries, and a
  focused browser review link.

## Chosen approach

Keep Teams transport concerns in `src/teams/`. Use the existing ASP.NET Core
Workroom API for authorization, deterministic or Foundry-backed execution,
SQL persistence, and human action recording. Use `/teams?threadId=...` as a
focused web review destination without duplicating the business workflow.

## Alternatives considered

- A Teams-like React-only shell was rejected as the primary architecture;
  Microsoft Teams must remain a real integration boundary.
- A separate Teams business-logic implementation was rejected because it would
  drift from the C# application boundary.
- Unstructured natural-language approval commands were rejected in favor of
  explicit, auditable action command forms.

## Affected files or modules

- `src/teams/landops-adapter.ts`
- `src/teams/server.ts`
- `tests/teams-adapter.test.ts`
- `dotnet/LandOps.Domain/WorkroomAction.cs`
- `dotnet/LandOps.Infrastructure/LandOpsDbContext.cs`
- `dotnet/LandOps.Infrastructure/Migrations/*WorkroomActionsGenerated*`
- `dotnet/LandOps.Api/Program.cs`
- `dotnet/LandOps.Api.Tests/ApiTests.cs`
- `app/teams/page.tsx`
- `app/api/landops/workroom/[threadId]/route.ts`
- `src/landops/WorkroomReviewView.tsx`

## Milestones

1. Format evidence-linked Workroom results for Teams.
2. Add explicit human action parsing and API persistence.
3. Add focused browser deep-link retrieval.
4. Run adapter, .NET, Next.js, and runtime route checks.

## Acceptance criteria

- A Teams activity creates and runs a case-scoped Workroom through the C# API.
- The response includes the participating agent path, findings, source counts,
  unknowns, recommendation, human boundary, and focused review link.
- Explicit human actions are persisted append-only and returned through the API.
- The focused review route loads one Workroom by thread ID and does not claim to
  be the Microsoft Teams client.
- Local deterministic behavior remains the default and all existing tests pass.

## Verification commands

```sh
node --import tsx --test tests/teams-adapter.test.ts
npm run typecheck
npm test
npm run build
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
```

## Risks and open questions

- Real tenant integration still requires bot registration, credentials,
  permissions, and a configured Teams channel.
- The adapter currently supports explicit text commands; adaptive-card action
  support is a later transport enhancement over the same API.

## Progress log

- 2026-09-06: Defined the Teams-first boundary and implemented the local
  adapter, action API, migration, and focused review route.
- 2026-09-06: Repaired EF migration metadata and verified the SQL-backed action
  integration test.
- 2026-09-06: Verified TypeScript, .NET, Next.js build, validators, and runtime
  deep-link response.

## Decision log

- 2026-09-06: Teams is the primary conversation surface; React is a focused
  review and administration surface.
- 2026-09-06: ASP.NET Core remains the durable application boundary.
- 2026-09-06: Human actions are append-only records and never implicit model
  side effects.
