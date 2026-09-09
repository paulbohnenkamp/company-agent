# Teams app architecture

Business Agent has one user-facing surface: Microsoft Teams. The adapter is a
transport boundary, not a second business application.

```text
Microsoft Teams activity
        ↓
src/teams/server.ts
  mention parsing · identity context · idempotency
        ↓ HTTPS JSON + optional Entra workload token
ASP.NET Core API
  authorization · case scope · evidence · persistence · agent execution
        ↓
bounded deterministic or Foundry review
        ↓
Teams response with findings, provenance, uncertainty, and human boundary
```

## Boundaries

- `src/teams/teams-adapter.ts` maps Teams activities and formats replies.
- `src/teams/business-agent-client.ts` calls the typed API contract.
- `dotnet/LandOps.Api` is the HTTP and authentication boundary.
- `dotnet/LandOps.Application` owns review orchestration and actions.
- `dotnet/LandOps.Domain` owns business contracts and invariants.
- `dotnet/LandOps.Infrastructure` owns SQL Server, fixtures, and Foundry
  provider integration.
- `teams-app/` creates the installable manifest and icon package.

The adapter never decides authorization, title, ownership, payment, filing, or
other consequential business outcomes. The API validates all returned evidence
references and keeps human approval explicit.

## Request lifecycle

1. Teams sends a personal, group-chat, or channel activity.
2. The adapter strips only the bot mention and normalizes the actor/context.
3. The adapter suppresses duplicate activity IDs for the lifetime of its
   process.
4. The API creates an agent-request thread and applies authorization.
5. The API runs the bounded review and persists the structured packet.
6. The adapter formats the packet for Teams.
7. Explicit action commands are sent back through the API and recorded there.

Local deterministic mode is the repeatable baseline. Foundry is opt-in and
must remain behind the same API validation and human-review boundary.
