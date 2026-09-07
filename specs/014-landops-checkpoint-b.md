---
id: 014-landops-checkpoint-b
title: LandOps Workbench checkpoint B WV evidence and reconciliation
status: completed
created: 2026-09-04
updated: 2026-09-07
result: results/014-landops-checkpoint-b.md
---



## Goal

Port the frozen Braxton WVDEP/WVGES well evidence and production no-match
semantics into the C# application, then persist one deterministic reconciliation
run containing independent evidence, findings, conflicts, unknowns, and
provenance.

## Non-goals

- Live WVDEP/WVGES requests or source refresh.
- Model-backed agents, Foundry, Azure, React integration, or conversation.
- Mineral title, ownership, payment entitlement, or consequential actions.
- General multi-jurisdiction abstractions.

## Current-state findings

- The TypeScript reference contains hash-verified Braxton snapshots, normalized
  WVDEP/WVGES records, a production no-match fixture, deterministic tools, and
  the typed three-step flow.
- Checkpoint A has a SQL Server-backed case foundation and case API.

## Chosen approach

Add a narrow C# evidence model and deterministic reconciliation service. Keep
publisher-specific normalized facts as validated JSON payloads while relationally
tracking source identity, immutable snapshot metadata, case/run ownership, and
judgment references. Use the checked-in fixture as the only source input.

## Alternatives considered

- Live source adapters were deferred because deterministic tests must not depend
  on government availability.
- A generic agent framework was deferred because this checkpoint proves exact
  evidence and business semantics first.
- Flattening every publisher field into columns was rejected because it would
  destroy source shape and add migration noise before the evidence model is stable.

## Acceptance criteria

- Typed C# records represent source identities, immutable snapshots, public
  evidence, production result states, findings, conflicts, unknowns, and a run.
- Frozen Braxton evidence is loaded from repository fixtures and remains
  independently attributed to WVDEP and WVGES.
- Production distinguishes `no-match` from `reported-zero`.
- Deterministic reconciliation preserves the operator conflict, production
  unknown, mineral-title boundary, and evidence references.
- The complete run is persisted and reloadable through EF Core SQL Server.
- Tests prove hash/reference/case/run boundaries and deterministic outputs.
- Checkpoint A and the TypeScript reference checks remain passing.

## Verification commands

```sh
DOTNET_ROOT=/private/tmp/business-agent-dotnet /private/tmp/business-agent-dotnet/dotnet build dotnet/LandOps.sln
DOTNET_ROOT=/private/tmp/business-agent-dotnet /private/tmp/business-agent-dotnet/dotnet test dotnet/LandOps.sln
npm run typecheck
npm test
npm run build
git diff --check
```

## Affected files or modules

- `dotnet/LandOps.Domain/**`
- `dotnet/LandOps.Application/**`
- `dotnet/LandOps.Infrastructure/**`
- `dotnet/LandOps.Domain.Tests/**`
- `dotnet/LandOps.Application.Tests/**`
- `dotnet/LandOps.Api.Tests/**`
- `specs/014-landops-checkpoint-b.md`
- `results/014-landops-checkpoint-b.md`

## Milestones

1. Define evidence, production, judgment, and run contracts.
2. Load and validate frozen Braxton fixture data.
3. Implement deterministic reconciliation and persistence.
4. Run SQL Server and reference-suite verification; record the result.

## Risks and open questions

- The initial C# model must preserve evidence provenance without copying the
  entire TypeScript implementation prematurely.

## Progress log

- 2026-09-04: Began after checkpoint A passed its acceptance criteria.
- 2026-09-04: Added C# evidence, production, judgment, deterministic
  reconciliation, SQL persistence, migrations, and run read/write endpoints.
- 2026-09-04: Verified migration application, seeded evidence, run persistence,
  and reload through a live SQL Server-backed API.

## Decision log

- 2026-09-04: Keep source-specific facts in JSON with relational identity and
  reference columns, matching the approved V1 architecture.
