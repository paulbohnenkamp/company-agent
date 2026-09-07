---
id: 019-landops-csharp-foundry-boundary
title: LandOps C# Foundry provider boundary
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/019-landops-csharp-foundry-boundary.md
---



## Goal

Add the C# provider seam needed for Microsoft Foundry without making model
access a requirement for local workflows. The provider must send a bounded
request, parse the Responses API output, and return an auditable failure for
transport, HTTP, timeout, or malformed-output errors.

## Non-goals

- Creating Azure resources.
- Entra authentication or production secret storage.
- Replacing the deterministic workflow as the local default.
- Allowing the model unrestricted database, filesystem, or network access.

## Acceptance criteria

- `IAgentProvider` is defined in the application layer.
- The Infrastructure provider sends `model`, `instructions`, and `input` to
  the configured `/openai/v1/responses` endpoint.
- The provider never logs or includes the API key in a result.
- Non-success HTTP responses, request exceptions, timeouts, and missing output
  text return typed failure results.
- A fake HTTP handler proves request shape and success/failure mapping without a
  network call.
- Existing deterministic runs remain unchanged and local tests remain offline.

## Verification commands

```sh
npm test
npx tsc --noEmit --incremental false
npm run build
dotnet build dotnet/LandOps.sln
dotnet test dotnet/LandOps.sln
git diff --check
```

## Progress log

- 2026-09-05: Started after local hardening completed.
- 2026-09-05: Added `IAgentProvider`, `FoundryAgentProvider`, bounded request
  handling, timeout and failure mapping, and fake HTTP tests.

## Completion notes

- The provider sends only the configured model, instructions, and input.
- API keys are used only in the authorization header and never returned in a
  provider result.
- The deterministic workflow remains the local default.
- TypeScript verification remains green after checkpoint 018.
- Infrastructure compilation passed through a temporary generated-artifact path.
- Full C# test execution remains blocked because the normal repository `bin` and
  `obj` directories reject replacement writes in this environment.

## Current-state findings

This section was added during the 2026-09-07 project-state reconciliation. Existing record content remains below and is the source material for this slice.

## Chosen approach

The existing implementation approach remains the source of truth for this completed slice; future changes must use a new approved spec.

## Alternatives considered

The alternatives and trade-offs are preserved in the existing record content. No alternative is implied by this normalization.

## Affected files or modules

See the implementation files named in this record and the canonical inventory in docs/PROJECT_STATE.md.

## Milestones

The slice milestones are represented by the implementation and verification notes in this record.

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
