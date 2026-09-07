---
id: 017-landops-checkpoint-e
title: LandOps Workbench checkpoint E conversation and review
status: completed
created: 2026-09-04
updated: 2026-09-07
result: results/017-landops-checkpoint-e.md
---



## Goal

Add case-scoped, evidence-grounded conversation and human-review persistence to
the C# run boundary, then connect the remaining React workspace actions in C# mode.

## Non-goals

- Foundry/model execution, RAG, general memory, title conclusions, or external actions.
- Azure deployment or identity configuration.

## Current-state findings

- Checkpoint D adapts C# case/run/evidence/results into the existing workspace.
- Review and conversation still point to the TypeScript demo routes in C# mode.

## Chosen approach

Implement a deterministic C# conversation service over the current persisted run
projection. Validate every response reference against the current case/run. Add
append-only review decisions with no external action. Proxy both through same-origin
Next.js routes.

## Alternatives considered

- Reusing the TypeScript conversation service was rejected because C# run IDs and
  persisted state must remain inside the C# boundary.
- Adding an LLM now was rejected because the deterministic grounding contract must
  be proven before Foundry integration.

## Acceptance criteria

- Conversation answers the bounded operator, evidence, production, unknown, and
  mineral-title questions from current C# run state.
- Every response carries topic, grounding, and resolvable evidence references.
- Cross-case/run lookups return 404 and no data leaks.
- Review decisions persist with reviewer, reason, and timestamp.
- C# mode in the React workspace uses C# conversation and review routes.
- Existing .NET and TypeScript checks pass.

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
- `dotnet/LandOps.Api/Program.cs`
- `app/api/landops/**`
- `app/page.tsx`

## Milestones

1. Add conversation/review contracts and persistence.
2. Implement deterministic grounded responses and review transitions.
3. Connect Next.js proxies and workspace actions.
4. Verify and record the result.

## Risks and open questions

- Foundry remains a later adapter over the same structured conversation contract.

## Progress log

- 2026-09-04: Began after checkpoint D passed its acceptance criteria.
- 2026-09-04: Added deterministic case conversation, append-only review
  decisions, SQL migration, and same-origin React proxy routes.
- 2026-09-04: Verified grounded operator conversation and approved review through
  the built Next.js proxy against SQL Server.

## Decision log

- 2026-09-04: Keep review decisions append-only and conversation strictly case/run scoped.
