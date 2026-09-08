# Business Agent

Business Agent is a full-stack, evidence-focused agent platform for teams that review records and make human decisions. It gives people one Business Agent entry point in Microsoft Teams, routes requests through bounded specialist agents, and returns findings with provenance, uncertainty, and a clear human-review boundary.

The application is centered on C#/.NET, ASP.NET Core, EF Core, SQL Server, React, Next.js, Microsoft Entra ID, Azure, and Microsoft Foundry. The older TypeScript Business Agent runtime remains a temporary behavioral reference and offline fallback; it is not the product’s long-term application boundary.

Sample Energy Company provides the fictional people, departments, cases, and records. The examples cover leases, title, ownership, division orders, and regulatory evidence. The product name is intentionally independent of any one department or industry.

## Portfolio summary

This project demonstrates a .NET-centered agent application with a Teams
integration, a Next.js review surface, deterministic evidence workflows, and
explicit boundaries around identity, providers, persistence, and human action.
The design keeps business rules in the C# application while Teams and the web
application act as presentation and transport surfaces.

### What is implemented

- C#/.NET application boundary with ASP.NET Core, EF Core, and SQL Server support.
- Bounded specialist-agent flows with explicit delegation, evidence, conflicts, and human review.
- Synthetic case data with immutable source snapshots and provenance.
- Microsoft Teams channel adapter for personal chat, group chat, and channel messages.
- Next.js and React review surfaces for focused case work and local demonstration.
- Microsoft Entra ID, Azure, and Microsoft Foundry integration boundaries.
- Deterministic local execution with automated API, adapter, identity, artifact, and end-to-end tests.

### Current status

The local application and the core Teams read-only review path are verified. A
test tenant has the Teams package installed and can receive a Business Agent
mention. The current demo uses a bounded fictional review flow rather than a
general-purpose autonomous agent system. Naming cleanup and evidence-grounded
review improvements are the next approved work. See [project state](docs/PROJECT_STATE.md)
for verified work, limits, and the active specs.

## Technology used

This project uses the parts of the Antero role’s stack that it demonstrates:

- **.NET 10 and C#** for the domain, application, infrastructure, and API layers.
- **ASP.NET Core and Entity Framework Core** for HTTP boundaries, authorization, persistence, and migrations.
- **SQL Server and Azure SQL** for local and deployed durable state.
- **React, TypeScript, and Next.js** for the web surface and Teams transport adapter.
- **Microsoft Teams and Bot Framework** for channel, group-chat, and personal-chat integration.
- **Microsoft Entra ID** for application identity, roles, groups, and workload boundaries.
- **Azure App Service, Azure Bot Service, Azure Container Registry, Azure SQL, Blob Storage, Key Vault, Application Insights, and Log Analytics** for the deployed PaaS foundation.
- **Microsoft Foundry** as the replaceable provider boundary for model-backed agent execution.
- **Bicep, Azure Developer CLI, Azure CLI, and Docker** for infrastructure, packaging, and deployment.
- **Automated testing** across .NET unit and API tests, TypeScript tests, adapter contracts, artifact validation, and playbook flows.

For continuation in a new Codex or VS Code session, read [the canonical project state](docs/PROJECT_STATE.md) first. It separates verified work from unfinished slices and identifies the next approved spec.

## See the product

Read the [approved naming and information architecture](docs/product-naming.md).
Microsoft Teams is the collaboration environment. The web application provides
focused review, administration, and local examples.

Open [the Teams example](http://localhost:3001/teams) after starting the local
application. It illustrates Sample Energy Company departments and contributions
from Business Agent. It is not a screenshot of an installed Teams app.

Earlier screenshots in `docs/images/landops-*.png` retain historical branding
and are not current product illustrations. Spec 048 records the naming change.

## Run the local application

Prerequisites: Node.js, the .NET SDK selected in `dotnet/global.json`, and Docker Desktop if you want SQL Server persistence.

```sh
npm install
docker compose up -d sqlserver
dotnet run --project dotnet/LandOps.Api --urls http://127.0.0.1:5006
LANDOPS_API_URL=http://127.0.0.1:5006 NEXT_PUBLIC_LANDOPS_MODE=true npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001). The seeded Braxton County case is synthetic. The frozen WVDEP/WVGES evidence is included for repeatable local review and does not require live government endpoints.

## What “Business Agent” means

Business Agent is the single user-facing application and Teams bot that people
mention. It is an entry point and orchestrator, not a separate Teams account for
every specialist. A request can be routed through a bounded flow such as:

```text
Intake Reviewer → Ownership Reviewer → Title Chain Reviewer
                → Compliance Reviewer → Case Synthesizer
```

Each specialist agent owns one responsibility and contributes findings to the
flow. The orchestrator controls sequencing, handoffs, persistence, conflicts,
and the human-review boundary. Teams receives one Business Agent reply that
shows the path and each specialist's contribution; the specialist names are
not separate Teams users or bots. The ASP.NET Core API remains authoritative for
authorization, evidence rules, durable requests, and actions; Teams and Next.js
are collaboration and presentation surfaces. The current live Teams slice uses
one configured review flow and sample case, while the repository models the
broader specialist-agent and flow structure. Agent names are application
contributions, not tenant user accounts.

To run the separate Teams channel adapter locally, keep the API running and start another terminal:

```sh
DANGEROUSLY_ALLOW_UNAUTHENTICATED_REQUESTS=true LANDOPS_API_URL=http://127.0.0.1:5006 npm run teams:dev
```

The adapter listens on port `3978` for the Microsoft Teams/Bot Framework endpoint. Real tenant registration, Bot configuration, Entra credentials, and Teams sideloading are deployment steps; the pure adapter tests run without those credentials.

For a local receive-path smoke test without a Teams tenant, run the API and
adapter with deterministic lease settings, then post a Bot Framework-shaped
activity to `/api/messages`. The activity must include a local `serviceUrl`
that accepts the adapter's typing and reply activities. A successful HTTP 200
proves local adapter-to-agent request wiring only; it is not a Teams tenant test.

## What the demo proves

- A fictional company portfolio with Land, Land Administration, Legal, Compliance, Accounting, Operations, and IT/Platform departments.
- Role-aware scenarios for land analysts, lease analysts, division-order analysts, legal reviewers, compliance reviewers, accounting reviewers, operations reviewers, and case managers.
- Case questions and agent requests with explicit delegation, evidence, and human review.
- Lease, title, division-order, ownership, and OCR sample records alongside frozen public WV evidence.
- Evidence-linked findings, preserved conflicts, explicit unknowns presented as evidence disclaimers, provenance, production no-match semantics, and a human review decision.
- Local deterministic execution and a replaceable Microsoft Foundry provider boundary.
- A real Teams channel adapter that accepts personal chat, group chat, and channel messages and forwards them to the bounded agent request API.

## Architecture in one picture

```text
Microsoft Teams channel / personal chat
          │  Teams SDK activity
          ▼
src/teams/server.ts
  mention parsing · identity context · idempotency
          │  Agent request HTTP contract
          ▼
Next.js web surface ──► ASP.NET Core API
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Application      Domain    Infrastructure
        workflows       contracts  EF Core + SQL Server
              │
              ▼
       deterministic or Foundry agents
              │
              ▼
       findings · conflicts · unknowns · human review
```

The Teams adapter owns transport concerns only. The C# application owns authorization, role scenarios, evidence, persistence, agent plans, and review boundaries. This prevents the Teams shell and the web shell from developing different business rules.

## Learn the codebase

Start with the [Business Agent learner path](docs/landops-learning-path.md), then read:

1. [Architecture](docs/landops-architecture.md)
2. [Data and evidence](docs/landops-data-and-evidence.md)
3. [Code tour](docs/landops-code-tour.md)
4. [Development workflow](docs/landops-development-workflow.md)
5. [Glossary](docs/landops-glossary.md)
6. [V1 product specification](docs/LANDOPS_WORKBENCH_V1.md)
7. [Documentation gap report](docs/landops-documentation-gap-report.md)
8. [Microsoft Foundry standards](docs/microsoft-foundry-standards.md)

The original reusable TypeScript runtime is documented in the [documentation map](docs/README.md). Read it as a behavioral reference while learning the newer .NET-centered application.

For the reference runtime’s deeper concepts, see [architecture](docs/architecture.md), [data model](docs/data-model.md), [flow runtime](docs/flow-runtime.md), [evaluations](docs/evaluations.md), and [safety](docs/safety.md). The original command-line example also remains available through `npm run eval` and the [quickstart](docs/quickstart.md).

## Verify changes

```sh
npm run typecheck
npm test
npm run build
npm run validate:naming
npm run validate:identity-personas
npm run validate:agent-artifacts
dotnet test dotnet/LandOps.sln
git diff --check
```

The default local mode is deterministic and offline. Foundry, Entra ID, Azure SQL, Blob Storage, Application Insights, and production Teams registration are explicit provider/deployment boundaries rather than hidden assumptions.

The local identity catalog is [`config/identity/personas.json`](config/identity/personas.json). It is synthetic demo data, not a list of real tenant users. The UI loads it through `/api/landops/personas`; `npm run validate:identity-personas` checks it, and `npm run provision:entra-personas` produces a dry-run Azure CLI plan. Real creation additionally requires `--apply`, a tenant ID, a verified `--upn-domain`, and `LANDOPS_TEMP_PASSWORD`.

## Repository map

- `dotnet/LandOps.Domain` — business contracts and invariants.
- `dotnet/LandOps.Application` — use cases, role scenarios, agent request, and execution boundaries.
- `dotnet/LandOps.Infrastructure` — EF Core, SQL Server, fixtures, and Foundry integration.
- `dotnet/LandOps.Api` — ASP.NET Core HTTP boundary.
- `app/` — Next.js App Router and same-origin browser routes.
- `src/landops/` — React view components and C# response adapters.
- `src/teams/` — Microsoft Teams SDK channel adapter.
- `src/` and `domains/` — older TypeScript reference runtime and WV source implementation.
- `specs/` and `results/` — checkpoint specifications and verification records.

## Current limits

The Teams adapter has a deployed Azure foundation recorded in result 047. The
Microsoft 365 bot identity, package installation, and read-only live mention
path are verified in the test tenant. Human-action authorization and duplicate
activity suppression remain separate live checks. See [project state](docs/PROJECT_STATE.md)
and [tenant naming adoption](docs/tenant-naming-adoption.md). OCR extraction,
live source ingestion, and consequential external actions remain outside the
current verified scope.
