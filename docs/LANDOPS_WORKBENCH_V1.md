---
title: LandOps Workbench V1 implementation spec
status: in-progress
created: 2026-09-04
updated: 2026-09-04
---

# LandOps Workbench V1

## Goal

Turn the current Business Agent prototype into a portfolio-quality, case-centered
oil-and-gas land operations application. The first vertical slice is the existing
synthetic Braxton County, West Virginia land/well reconciliation case. It must be
runnable locally, evidence-grounded, reviewable by a human, and ready for a later
Azure deployment.

The TypeScript implementation remains the behavioral reference and is not deleted
or rewritten until its replacement slice exists and passes equivalent checks.

## Product and boundaries

The primary user is a land analyst reviewing a submitted land or lease package
against public well and production records. The V1 path is:

`case intake → reconciliation → evidence/provenance → conflicts/unknowns → synthesis → Ask Business Agent → human review`

V1 does not determine mineral title, ownership, recording priority, payment
entitlement, or legal effect. WVDEP and WVGES records are public regulatory and
geological evidence, not proof of mineral title. `No matching production evidence`
and `reported zero production` are distinct outcomes. Ohio, Pennsylvania, a
50-state abstraction, consequential external actions, and microservices are
explicitly out of scope.

## Target stack

- .NET 10 LTS and C# 14, with an exact SDK version pinned in `global.json` once
  Step A installs and verifies the SDK. ASP.NET Core and EF Core use the same
  major version. .NET 10 is the active LTS release at the time of this spec and
  is supported through November 2028: [Microsoft .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).
- ASP.NET Core Web API using minimal APIs or thin controllers; choose one style
  consistently in Step A.
- EF Core with SQL Server for relational application data and migrations.
- React for the UI. Keep the successful existing Next.js/React case workspace as
  the transitional presentation; replace its demo route handlers with calls to
  ASP.NET as the corresponding endpoints become available. Do not change the UI
  framework for aesthetic reasons.
- Azure App Service or an equivalent single deployable Azure web application is
  the initial deployment direction. Azure SQL, Blob Storage, Entra ID, and
  Application Insights are the corresponding managed services; exact SKU choice
  belongs to deployment preparation.
- Microsoft Foundry/Azure AI is an explicit adapter for model-backed judgment and
  conversation. It is not required for deterministic local tests or the first
  offline checkpoints.

No additional broker, vector database, microservice, or agent framework earns a
place in V1 without a demonstrated requirement.

## .NET solution shape

Place the new application under `dotnet/` so the TypeScript reference remains
obvious and runnable:

```text
dotnet/
  LandOps.sln
  LandOps.Api/
  LandOps.Application/
  LandOps.Domain/
  LandOps.Infrastructure/
  LandOps.Domain.Tests/
  LandOps.Application.Tests/
  LandOps.Api.Tests/
```

`Domain` contains business records, invariants, and pure reconciliation concepts.
`Application` owns use cases, ports, orchestration, review transitions, and DTO
mapping. `Infrastructure` owns EF Core/SQL Server, source adapters, snapshot
storage, and external AI implementations. `Api` owns HTTP contracts, identity
boundary, and composition. Dependencies point inward; Domain references no
database, web framework, or model provider. Focused test projects are sufficient;
do not add a project for every layer or agent.

## Minimum domain and application model

The first slice needs typed C# records/entities for:

- `LandCase` and `Well`, including case isolation and submitted clues;
- submitted land/lease evidence, with an explicit synthetic/private-data marker;
- `SourceIdentity`, immutable `SourceSnapshot`, and normalized `PublicEvidence`
  for WVDEP, WVGES, and production;
- `Finding`, `Conflict`, and `Unknown`, each linked to case, run, producer, and
  evidence IDs;
- `ProductionResult`, whose status distinguishes `matched`, `reported-zero`,
  `no-match`, and `unavailable`;
- `ReconciliationRun` and ordered agent-step results;
- `Synthesis` and `ReviewDecision`.

Every judgment carries provenance: source snapshot/evidence references where
applicable, producer/step version, and creation time. Raw snapshots are immutable
and identified by content hash. Publisher-specific normalized facts may remain a
validated JSON payload inside `PublicEvidence` when forcing them into columns
would lose source shape; identity, links, status, dates, hashes, case ownership,
and review state stay relational. A missing source is a failure, not an empty
successful result.

## Bounded Business Agent seam

The three existing conceptual agents become application services behind one
validated execution boundary:

| Agent | Bounded judgment |
| --- | --- |
| Case Intake | Establish case scope, extract supplied clues, and identify missing evidence or candidate queries. |
| Land-Well Reconciler | Compare submitted claims with independent normalized evidence and classify supported, contradicted, inconclusive, or unknown claims. |
| Case Synthesizer | Preserve findings, conflicts, unknowns, and failures; explain the evidence-bounded result and propose a human route. |

Agents receive typed, case-scoped context and return typed output validated before
the next step. Deterministic C# services/tools perform normalization, identifiers,
parsing, dates, distance, hashing, arithmetic, aggregation, and exact source
transforms. Those operations are never delegated to an AI model. The application
must prevent synthesis when required upstream acquisition or execution failed.

The Foundry adapter implements the same seam. Model output is schema-validated,
all cited evidence IDs must resolve to evidence in the current case/run, and the
model has no unrestricted database or filesystem access. Human review is the
authoritative transition for any consequential route.

## V1 persistence

Use real relational application data, not SQL Server as a checkbox. The initial
tables are `LandCases`, `Wells`, `SubmittedEvidence`, `SourceIdentities`,
`SourceSnapshots`, `PublicEvidence`, `ReconciliationRuns`, `AgentSteps`,
`Findings`, `Conflicts`, `Unknowns`, `Syntheses`, `ReviewDecisions`, and
`ConversationTurns`.

Relationships are case → wells/submitted evidence/runs; run → steps/findings/
conflicts/unknowns/synthesis/conversation; public evidence → source identity and
snapshot; findings/conflict claims/unknowns → evidence references. Use join tables
or owned collections for many-to-many evidence links. Keep source-specific facts,
agent request/response envelopes, and submitted clue bags as JSON only where their
shape is genuinely publisher/provider-specific. Keep review decisions and all
searchable business state as columns. Save raw snapshots through a storage port;
local V1 may use a repository fixture directory, while Azure uses Blob Storage.

## Small REST API

The first API contract is case-scoped and versionable under `/api/v1`:

- `GET /cases/{caseId}` — case summary, wells, submitted evidence, and boundary labels.
- `POST /cases/{caseId}/runs` — start a reconciliation run; local V1 may execute
  synchronously, while the response includes run status.
- `GET /cases/{caseId}/runs/{runId}` — ordered steps and structured results.
- `GET /cases/{caseId}/evidence` — evidence, snapshots, hashes, URLs, and warnings.
- `POST /cases/{caseId}/runs/{runId}/review` — record approve, reject, or revision
  requested with reviewer and reason; it performs no external action.
- `POST /cases/{caseId}/runs/{runId}/conversation` — ask a question with bounded
  typed history; return answer, grounding classification, and resolved evidence,
  finding, conflict, and unknown references.

Invalid IDs, malformed payloads, cross-case references, unresolved citations, and
unsupported actions are rejected at the HTTP/application boundaries.

## React experience

Reuse the current case workspace information architecture and interaction model.
The UI should load a case, start a run, show the three steps, expose independent
WVDEP/WVGES evidence and immutable provenance, preserve conflicts and unknowns,
show the synthesis route, support case-scoped questions, and record human review.
The existing offline demo can remain a fallback/reference while each screen moves
to the ASP.NET API. No broad visual rewrite is part of V1.

## Testing migration

The existing TypeScript tests and fixtures are the reference specification. Carry
forward tests for evidence grounding, independent WVDEP/WVGES conflict
preservation, unknown preservation, no-match versus zero, provenance, case
isolation, consequential-action boundaries, the mineral-title boundary,
deterministic operations, human review, and the seven-question Ask Business Agent
scenario.

- C# unit tests: value objects, normalization, production classification,
  reconciliation, provenance validation, title/action guards, and agent output
  validation.
- ASP.NET integration tests: route contracts, case scoping, review transitions,
  conversation grounding, and error mapping using deterministic fakes.
- EF Core/SQL integration tests: migrations, relationships, uniqueness, snapshot
  immutability, and persistence/reload of a complete run. Use a real SQL Server
  test instance/container; do not make SQLite the compatibility proof.
- AI behavioral/evaluation tests: run against recorded model fixtures or a fake
  provider by default; separately evaluate Foundry prompt/model behavior for
  grounding, citation resolution, refusal boundaries, and stable structured output.

Before adding a cloud or external dependency, add a deterministic fake or contract
test for its port.

## Vertical implementation checkpoints

Each checkpoint leaves a runnable, verifiable slice:

**A. .NET foundation, SQL persistence, and one case API.** Install/pin the
verified .NET SDK, create the small solution, add EF Core SQL Server migrations,
persist/load one seeded case, and expose `GET /cases/{caseId}`. Keep the existing
TypeScript app passing.

**B. WV evidence and deterministic reconciliation.** Port the frozen WV fixtures,
source/snapshot/evidence model, production semantics, and deterministic tools;
persist a run with findings, conflicts, unknowns, and provenance. No live endpoint
is required for tests.

**C. Three-agent workflow and structured results.** Implement the intake,
reconciler, and synthesizer services against the typed seam, with a deterministic
executor and equivalent behavior checks.

**D. React case workspace against ASP.NET.** Repoint the existing workspace to the
new API, preserving its evidence, conflict, unknown, synthesis, and review flows.

**E. Ask Business Agent.** Add the case-scoped conversation endpoint and UI using
the deterministic/fake provider first, with citation and boundary tests.

**F. Azure and Foundry.** Add Entra-protected deployment, Azure SQL/Blob
configuration, Application Insights, and the Foundry adapter only after A–E are
working locally. Deploy only under an approved deployment plan.

## Definition of done

V1 is complete when a user can operate the Braxton WV case through:

`React → ASP.NET Core/C# → EF Core/SQL Server → WV evidence/reconciliation → three bounded agents → evidence/provenance/conflicts/unknowns → Ask Business Agent → human review`

The equivalent reference behaviors pass, structured citations resolve within the
case, no title or consequential-action claim is made, raw evidence remains
immutable, and the Azure/Foundry path is implemented and verified without making
live cloud access necessary for deterministic tests.

## Self-review and decisions

This spec was reviewed against the target Microsoft stack, the current TypeScript
behavior, complexity of each proposed component, and speed to runnable software.
It deliberately keeps one deployable application, one relational database, a
small project count, deterministic local execution, and the current React
interaction design. It does not repeat the portability architecture exercise or
design future jurisdictions.

The only architecture-owner decision needed before checkpoint F is the Azure
deployment/identity choice (App Service versus another approved single-app host,
and the Foundry project/model deployment). It does not block A–E. No decision is
required to begin the first coding checkpoint beyond installing and pinning the
approved .NET 10 SDK.

## Progress and decision log

- 2026-09-04 — Proposed after inspecting the repository, clean working tree,
  recent history through `d818728`, current TypeScript WV workflow/UI, and the
  existing architecture and implementation plans.
- 2026-09-04 — Chose .NET 10 LTS as the target; local SDK installation is still a
  prerequisite because this environment currently reports Node 24.14.1 and no
  `dotnet` executable.
- 2026-09-04 — Deferred implementation, deployment, Ohio/Pennsylvania, generic
  multi-jurisdiction abstractions, microservices, and deletion of TypeScript.
- 2026-09-04 — Completed checkpoint A with a pinned .NET 10 solution, EF Core SQL
  Server migration, seeded Braxton case, and `/api/v1/cases/{caseId}` endpoint.
- 2026-09-04 — Completed checkpoint B with frozen WV evidence, no-match
  production semantics, deterministic reconciliation, and persisted run reload.
- 2026-09-04 — Completed checkpoint C with ordered typed intake, reconciler, and
  synthesizer steps plus persisted synthesis and human-review routing.
- 2026-09-04 — Completed checkpoint D with an optional ASP.NET transport adapter
  and same-origin Next.js proxy while preserving the TypeScript fallback.
- 2026-09-04 — Completed checkpoint E with C# grounded conversation, persisted
  review decisions, and React proxy integration.
- 2026-09-05 — Completed local hardening and added the C# Foundry provider port
  with a fake HTTP verification path. Azure identity and deployment remain
  external preparation work.
- 2026-09-05 — Completed live provider-mode wiring: deterministic local mode
  remains the default, while Foundry mode supports API-key authentication for
  local runs and managed identity for Azure runs. The provider validates
  structured answers and current-run evidence citations before persistence.
- 2026-09-05 — Verified the full C# solution, 13 C# tests, 122 TypeScript tests,
  TypeScript compilation, and a clean Next.js production build. The Azure
  deployment plan is intentionally still a draft because subscription, tenant,
  region, model deployment, host topology, and cost ceiling are owner inputs.

## Verification for this specification

The repository remains unchanged except for this document. Before declaring the
spec ready, run:

```text
npm run validate:records
npm run typecheck
npm test
npm run build
```

These verify that the reference implementation remains healthy; Step A will add
the corresponding `dotnet build` and test commands.
