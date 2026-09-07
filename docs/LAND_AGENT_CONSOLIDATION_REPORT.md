# Land Agent Consolidation Report

**Date:** 2026-09-05  
**Scope:** Land and land-administration repositories under `/Users/paul/code`,
plus `decisionforge` and `ms-teams-agent`  
**Purpose:** Identify overlap, preserve the strongest work, and define a
low-risk consolidation path for LandOps Workbench.

## Executive recommendation

Use `/Users/paul/code/business-agent` as the canonical LandOps product
repository, while carrying forward the rich DecisionForge UI experience and
the most useful Microsoft/Azure engineering lessons.

Keep its C#/.NET application path and Next.js interface as the product center
of gravity. Consolidate selected domain definitions and platform ideas into it
through explicit mappings and small vertical checkpoints. Do not merge the
other repositories wholesale and do not make any repository a permanent
architectural constraint merely because it contains useful earlier work.

The product is not a generic configurable agent platform. It is an opinionated
one-click LandOps application that turns ingested documents and connected
records into a reviewable case workspace, coordinates a small set of capable
land agents, preserves evidence and uncertainty, and lets people collaborate in
the browser or Microsoft Teams.

The recommended ownership model is:

| Concern | Canonical home | Reuse from |
| --- | --- | --- |
| Evidence-bounded land workflow and WV flagship | `business-agent` | `land-ai-engineering`, demos |
| C#/.NET application, persistence, API, and Azure path | `business-agent` | — |
| Agent/skill catalog ideas and pack metadata | `business-agent`, informed by `decisionforge` | `decisionforge`, `role-forge` |
| Project/workspace collaboration model | `business-agent` product design, selectively informed by `agent-workspace` | `agent-workspace` |
| Teams channel adapter | Separate integration package or service | `ms-teams-agent` |
| Foundry/MCP/Search learning experiments | Reference material only | `land-ai-engineering` |

## Revised product north star

### One-click experience

The user should be able to start the product locally or in Azure, upload or
connect a land package, and land in a useful workspace without assembling an
agent graph or configuring dozens of YAML packages.

The core journey is:

```text
Create case
  -> ingest leases, amendments, assignments, title records, maps, and production data
  -> extract and index documents with provenance
  -> run bounded land-agent workflow
  -> review findings, conflicts, evidence, and unknowns
  -> ask follow-up questions in grounded case chat
  -> assign or discuss work in Teams
  -> record human decisions and next actions
```

### Rich UI direction

DecisionForge's UI is the strongest existing starting point for the visual
product. Its panels, conversation history, approval actions, evidence view,
conflict view, timeline, agent runner, and responsive Fluent/Tailwind treatment
are directly relevant. The LandOps UI should become a richer, domain-specific
version of that experience rather than a generic admin console.

The first-class screens should be:

- **Portfolio dashboard:** cases, risk, review queue, deadlines, and recent
  agent activity.
- **Case workspace:** case header, status, participants, matter metadata, and
  a clear review state.
- **Document and evidence viewer:** source document, extracted fields,
  highlighted citations, hashes, publisher, dates, and evidence lineage.
- **Agent workbench:** visible intake, specialist findings, conflicts,
  unknowns, handoffs, and synthesis progress.
- **Evidence graph/timeline:** relationships among parcels, leases, wells,
  parties, interests, documents, and production observations.
- **Human review panel:** approve, reject, request evidence, assign work, or
  record an interpretation without hiding unresolved disagreement.
- **Grounded case chat:** conversational questions constrained to the current
  case and cited evidence.
- **Collaboration panel:** comments, mentions, assignments, and Teams handoff.

Configuration should support these workflows, not replace them with a blank
canvas or a large general-purpose package editor.

### Combined agent experience

The best concepts across the repositories form a coherent bounded team:

1. **Case intake and triage** — understands the submitted package and identifies
   missing or ambiguous clues.
2. **Lease and obligation analyst** — extracts and tracks lease terms,
   deadlines, rentals, amendments, and obligations.
3. **Ownership and title analyst** — compares ownership, parcel, assignment,
   and title-chain evidence; routes legal or title conclusions to a human.
4. **Well and regulatory reconciler** — compares independent public and
   technical records with submitted claims.
5. **Division-order and interest analyst** — calculates and explains interest
   relationships, NRI, and division-order readiness without initiating payment.
6. **Compliance analyst** — reviews JIB, statutory, lease, or records
   requirements when the jurisdictional evidence contract is present.
7. **Case synthesizer** — preserves conflicts and unknowns, cites the evidence,
   and proposes the next human-controlled route.
8. **Collaboration coordinator** — packages findings for a person or Teams
   conversation; it does not invent a new domain decision.

The first release should make the first four plus synthesis feel excellent.
Royalty, division-order, compliance, and collaboration capabilities can be
added behind the same contracts as evidence and jurisdiction support mature.

### Microsoft-first implementation

The target stack remains deliberately Microsoft-oriented:

- Next.js and React for the rich web experience;
- ASP.NET Core and C# for the application/API center of gravity;
- EF Core and SQL Server locally, Azure SQL in deployment;
- Azure Blob Storage for immutable source files;
- Microsoft Foundry for the opt-in model provider;
- Azure AI Search for hybrid document retrieval;
- Azure Document Intelligence for complex/scanned documents;
- Microsoft Entra ID, managed identity, and Key Vault for identity and secrets;
- Application Insights and OpenTelemetry for operations;
- Microsoft Teams and Microsoft Graph for collaboration;
- Azure App Service or Container Apps selected per approved deployment plan;
- `azd` for one-click environment provisioning and deployment after approval.

The local mode must remain deterministic and useful without cloud credentials.
The Azure mode should activate the same application contracts with managed
identity and Azure services rather than becoming a separate product.

### Organization, departments, roles, and groups

This is the area where DecisionForge already has the clearest working model.
Its RBAC types distinguish departments, users, direct roles, groups, resource
ownership, permissions, and execution-time audit context. Its demo
authorization data already includes Land, Legal, Finance, Operations,
Midstream, and IT departments, plus cross-functional groups such as
`compliance_team`, `audit_board`, and `land_compliance`.

Agent Workspace should inform the work model around those identities:
projects, matters, queues, artifacts, schedules, handoffs, and threads. It
should not replace the organization RBAC model.

For the fictional company seed, start with five business departments plus a
small platform-admin boundary:

| Department | Two example human roles |
| --- | --- |
| Land | Land Analyst; Land Manager |
| Land Administration | Lease Administration Specialist; Land Records Manager |
| Legal | Title/Curative Reviewer; Senior Legal Reviewer |
| Compliance | Compliance Analyst; Compliance Manager |
| Accounting | Revenue Accounting Analyst; Accounting Manager |
| Operations | Development Coordinator; Operations Manager |
| IT/platform | Platform Administrator; Security/Audit Administrator |

Use two fictional people per business role or department in the seed data, but
keep the permission model smaller than the user list:

- `land_contributor` — create and review land cases, documents, and evidence;
- `land_admin_reviewer` — manage lease, obligation, records, and deadline work;
- `legal_reviewer` — review title, curative, legal-boundary, and escalation
  outputs;
- `compliance_reviewer` — review control exceptions, audit evidence, and
  statutory/lease checks;
- `accounting_reviewer` — review division-order math, royalty context, and
  suspense-related cases without releasing payment;
- `operations_reviewer` — consume readiness and development handoffs;
- `case_manager` — coordinate cross-department assignments and workflow
  transitions;
- `platform_admin` — manage users, groups, configuration, and audit access.

Then create cross-functional groups that make the product demo meaningful:

- **Acquisition Review:** Land + Legal + Compliance;
- **Title and Curative Board:** Land Administration + Legal;
- **Division Order Review:** Land Administration + Legal + Accounting;
- **Lease Compliance Review:** Land Administration + Compliance + Operations;
- **Development Readiness:** Land + Operations + Legal + Accounting;
- **Audit Board:** Compliance + Legal + Accounting.

Agents should have service identities and capability permissions, but they
should not be treated as employees or given unrestricted department access. A
human role authorizes the review or consequential action; the agent produces a
bounded artifact, finding, calculation, recommendation, or handoff.

This gives the seed company a believable organization without reproducing
DecisionForge's entire generic role-management surface.

## Repository inventory

### 1. `business-agent` — canonical product candidate

Path: `/Users/paul/code/business-agent`

This is the most complete product-shaped land application. It has:

- Next.js and React user interface;
- C#/.NET 10 API and EF Core persistence path;
- SQL Server local runtime;
- evidence-bounded West Virginia well and production reconciliation;
- structured findings, conflicts, unknowns, provenance, and human review;
- deterministic local execution;
- a tested C# Foundry provider boundary;
- a draft Azure deployment plan;
- domain Markdown/YAML for agents, skills, and flows.

The active catalog currently declares three agents, four skills, and one flow:

Agents:

- `land-case-intake`
- `land-well-reconciler`
- `case-synthesizer`

Active skills:

- `lease-obligation-analysis`
- `lease-lifecycle-review`
- `ownership-verification`
- `assignment-transfer-review`

The repository also contains additional historical or inactive definitions.
The catalog, not the complete filesystem, is the source of truth for active
behavior. This distinction should remain explicit during consolidation.

### 2. `decisionforge` — reusable orchestration and governance platform

Path: `/Users/paul/code/decisionforge`

DecisionForge contains two layers in one TypeScript/Express repository:

- a reusable platform with authentication, RBAC, audit logging, admin tooling,
  loaders, versioning, prompt/conversation stores, and pluggable model clients;
- an Oil & Gas Agent Pack with land, title, royalty, division-order, and
  compliance content.

Oil & Gas agents:

| Agent | Skills |
| --- | --- |
| `division-order` | `wv-cotenancy-audit`, `calculate-nri` |
| `compliance-auditor` | `wv-cotenancy-audit`, `audit-lease-terms` |
| `royalty-analyst` | `calculate-nri`, `royalty-payment-calculator`, `suspense-account-manager` |
| `title-examiner` | `wv-cotenancy-audit`, `title-curative-workflow`, `wv-statute-reference` |

The pack also defines these additional skills:

- `jib-charge-classifier`
- `marketing-cap-enforcer`
- `pay-status-determination`

Most valuable assets to reuse:

- versioned agent and skill metadata;
- pack manifest and pack resolver concepts;
- provider factory pattern for Mock, OpenAI, Anthropic, and Azure;
- RBAC and authorization layering;
- audit and decision records;
- evaluation fixtures;
- admin lifecycle concepts for creating, versioning, deprecating, and loading
  agents and skills.

What should not be copied directly:

- the Express runtime as the LandOps backend;
- duplicate land agents that bypass the active `business-agent` catalog;
- unqualified title or statutory conclusions;
- filesystem stores as the permanent enterprise persistence model.

### 3. `agent-workspace` — collaboration and workspace model

Path: `/Users/paul/code/agent-workspace`

This repository has the strongest conceptual model for long-running human-agent
work. Its core concepts are projects, agents, skills, tools, connectors,
channels, schedules, artifacts, threads, runs, resources, events, and
projected state. It also has a metadata-driven Next.js workspace renderer and a
large land-project example.

Land-project agents:

- `division-order-analyst`
- `land-acquisition-coordinator`
- `land-operations-coordinator`
- `land-records-compliance-coordinator`
- `lease-rights-administrator`
- `royalty-owner-relations-analyst`
- `surface-rights-coordinator`
- `title-ownership-analyst`

Its 21 land skills cover:

- acquisition intake, prioritization, acreage strategy, and landowner outreach;
- division-order preparation and interest validation;
- land portfolio handoff, work-queue management, and pooling/unitization;
- land-administration reconciliation and records-compliance audit;
- lease expiration, obligations, and surface-rights coordination;
- owner-relations casework and title-change coordination;
- right-of-way and surface-rights acquisition;
- Appalachian curative review, curative action planning, and title-ownership
  review.

Most valuable assets to reuse:

- project-centric work organization;
- durable artifacts, threads, and runs;
- event history plus projected current state;
- metadata-driven workspace composition;
- broader operational vocabulary beyond the current WV well workflow.

What should not be copied directly:

- a second Next.js application runtime;
- its example YAML packages as the immediate source of truth for the C# API;
- broad land concepts before their evidence, jurisdiction, and human-control
  boundaries are defined in LandOps.

The repository README itself describes the production runtime, persistence,
scheduling, and model-provider integrations as still under development. Treat
it as an architecture reference and source of bounded concepts, not as a
finished replacement backend.

### 4. `role-forge` — smaller land-administration role catalog

Path: `/Users/paul/code/role-forge`

Agents:

- `case-synthesizer`
- `compliance-reviewer`
- `intake-reviewer`
- `ownership-reviewer`

Skills:

- `ownership-verification`
- `parcel-record-analysis`

This overlaps directly with both `business-agent` and the land project in
`agent-workspace`. Its best use is as a historical role-design reference. It
should not become another canonical catalog.

### 5. `land-agent-demo-learning` — educational land agent

Path: `/Users/paul/code/land-agent-demo-learning`

Agent:

- `Company Agent`

Skills:

- `analyze-lease`
- `company-agent`
- `research-ownership`

This is a useful beginner-oriented example of lease and ownership analysis,
MCP tools, hybrid retrieval, Azure AI Search integration, work-item
resumption, and human approval. Preserve it as learning/reference material;
do not merge its TypeScript runtime into the C# product.

### 6. `old/land-agent-demo` — predecessor demo

Path: `/Users/paul/code/old/land-agent-demo`

Agent:

- `Land Agent`

Skills:

- `analyze-lease`
- `research-ownership`

This is an older predecessor of `land-agent-demo-learning`. It is redundant
for consolidation and should remain historical unless a specific missing
example is found there.

### 7. `land-ai-engineering` — Foundry/MCP/Search learning repository

Path: `/Users/paul/code/land-ai-engineering`

This is a Python learning-first repository, not a finished product. It
contains valuable, tested boundary examples for:

- direct Microsoft Foundry Responses calls;
- Entra authentication through `DefaultAzureCredential`;
- Pydantic structured-output validation;
- application-owned function tools;
- local MCP comparison;
- controlled lease, obligation, and ownership lookups;
- planned Azure AI Search and Document Intelligence work;
- evaluation, tracing, human review, and reliability lessons.

Use it to teach or validate Foundry concepts. Port only specific contract or
test ideas into LandOps after they fit the C#/.NET boundary.

### 7a. `energy-ai` — document intelligence and agent collaboration reference

Path: `/Users/paul/code/energy-ai`

This repository contributes the closest reference for the next LandOps agent
team shape. Its useful concepts are:

- `lease-analyst-agent`, `title-curative-agent`, and
  `division-order-assistant` as bounded specialists;
- shared document intake and citation-summary skills;
- exception detection, ownership review, royalty-clause review, and
  heirship-gap review;
- explicit delegation between a coordinator and specialist agents;
- a TypeScript API, Python document-intelligence service, MCP, and A2A
  boundaries.

LandOps should port these as C# application contracts and evidence-linked
workflow steps. It should not import the monorepo or create a second runtime.
The Python service is a useful future adapter for OCR/document extraction;
SQL Server remains the private operational system of record.

### 8. `land-ai-engineering-foundry` — deployment scaffold

Path: `/Users/paul/code/land-ai-engineering-foundry`

This contains `azure.yaml` and `infra/` scaffolding but no distinct land-agent
or skill catalog. It should not become a second deployment root. Extract only
deployment patterns that survive the approved LandOps Azure plan.

### 9. `ms-teams-agent` — channel adapter and Azure deployment reference

Path: `/Users/paul/code/ms-teams-agent`

This is not a land domain project. It is a Microsoft Teams instruction-agent
transport with a useful enterprise integration shape:

```text
Teams mention
  -> Bot /api/messages
  -> mention parsing and idempotency
  -> AgentInstruction
  -> AgentRuntime
  -> model or capability adapter
  -> Teams reply
```

Reusable ideas:

- stable transport-to-agent instruction contract;
- mention and conversation-scope parsing;
- duplicate activity suppression;
- safe model-failure fallback;
- confirmation-gated task creation;
- Azure Container Apps, ACR, managed identity, Key Vault, and Application
  Insights deployment pattern;
- Teams packaging and registration documentation.

Important limitations:

- the current model endpoint/deployment is not configured, so the deployed
  agent falls back to acknowledgement behavior;
- knowledge lookup is a placeholder;
- task creation is only a confirmation preview;
- idempotency is in-memory and not safe for multi-replica side effects;
- durable conversation state and external task systems are not implemented.

It should become a channel integration for LandOps later, not the LandOps
domain runtime.

## Overlap and conflict map

### Agent and skill duplication

- `role-forge` is a subset of the broader `business-agent`/`agent-workspace`
  land catalogs.
- The two lease/ownership demos repeat the same basic skills.
- `decisionforge` has a separate Oil & Gas vocabulary for title, royalty,
  cotenancy, JIB, and division orders.
- `business-agent` currently has historical definitions beyond its active
  three-agent catalog.

The first consolidation task should be a crosswalk, not a mass rename. Every
candidate definition needs an owner, jurisdiction, evidence source, human gate,
and status (`active`, `reference`, `planned`, or `retired`).

### Runtime duplication

There are currently several competing runtimes:

- C#/.NET plus Next.js in `business-agent`;
- TypeScript/Express in `decisionforge`;
- metadata-driven Next.js/TypeScript in `agent-workspace`;
- TypeScript demos;
- Python learning code;
- Teams-specific TypeScript transport.

Only one should own production LandOps execution: the C#/.NET path in
`business-agent`. The others should contribute contracts, adapters, examples,
or integration packages.

### Trust-boundary differences

`business-agent` explicitly treats public WVDEP/WVGES evidence as not being
proof of mineral title and routes consequential decisions to humans. Some
other repositories include title examination, statutory application, payment,
royalty, or division-order agents. Those capabilities may be valuable, but
they must enter LandOps only with explicit evidence contracts, jurisdiction
rules, structured uncertainty, and human-control gates.

## Recommended target architecture

```text
Next.js LandOps workspace
        |
        v
ASP.NET Core LandOps API
        |
  domain/application services
        |
  SQL Server / Azure SQL + Blob Storage for immutable evidence
        |
  provider ports
    |                 |
deterministic     Foundry provider
local mode        API / managed identity
        |
optional channel adapters
    |                 |
Teams adapter    future webhooks/connectors
```

Private company data belongs in SQL Server/Azure SQL: leases, title matters,
division orders, ownership, workflow state, permissions, approvals, and audit
history. Original documents and OCR outputs belong in Blob Storage. Azure AI
Search may index extracted content and citations, but it is not the source of
truth. A bounded MCP server can expose approved tools over these application
ports; it must not become a second database or bypass authorization, case
scope, provenance, or human review.

Platform capabilities from DecisionForge should be represented as explicit
C# application ports and persistence records rather than copied as a second
runtime:

- `IAgentCatalog` / versioned definitions;
- `ISkillCatalog` / versioned procedures;
- `IAuthorizationService`;
- `IAuditSink`;
- `IRunRepository` and `IConversationRepository`;
- `IProvider` boundary already started by the Foundry work;
- evaluation fixtures and contract tests.

The Teams adapter should call the same application API or a dedicated bounded
application port. It must not contain land rules, title logic, or direct SQL
access.

## Consolidation sequence

### Phase 1 — freeze and crosswalk

Create a machine-readable inventory with one row per agent, skill, flow, tool,
and adapter. Record:

- canonical candidate;
- source repository and path;
- domain/jurisdiction;
- inputs and outputs;
- evidence requirements;
- human-control requirements;
- implementation maturity;
- duplicate or conflict relationships.

Do not delete source assets during this phase.

### Phase 2 — promote high-value domain capabilities

Prioritize the capabilities that extend the existing LandOps workflow without
changing its safety boundary:

1. lease obligation analysis;
2. lease lifecycle and deadline review;
3. assignment/transfer review;
4. ownership-interest reconciliation;
5. parcel-record analysis;
6. division-order preparation as a human-review output, not an automatic
   payment action.

Each promotion should have a spec, deterministic fixture, C# application
contract, evidence references, and a result record.

### Phase 3 — add platform governance

Bring over DecisionForge concepts in this order:

1. definition versioning;
2. audit events;
3. authorization and case-scoped access;
4. evaluation fixtures and regression reports;
5. administrative catalog inspection.

Avoid adding a generic admin UI or dynamic runtime loader until the domain
contracts are stable.

### Phase 4 — add collaboration surfaces

Use the Agent Workspace concepts to expand LandOps around cases, work queues,
artifacts, review threads, and durable run history. Keep the existing Next.js
application and C# API as the implementation boundary.

### Phase 5 — add Teams as an adapter

Adapt `ms-teams-agent` after the LandOps API has stable case and conversation
contracts. The adapter should:

- parse a Teams mention;
- establish user and case scope;
- call LandOps;
- preserve evidence citations and review status;
- require explicit confirmation for consequential actions;
- use durable idempotency before enabling multiple replicas.

### Phase 6 — retire or label duplicates

After promoted capabilities have matching tests and documentation, mark older
definitions as reference or deprecated. Do not remove the learning demos or
historical role catalogs until their unique educational value has been checked.

## Immediate next checkpoint

The next implementation checkpoint should combine the **fictional-company seed
data and role-scenario slice**: add coherent synthetic lease, title,
division-order, OCR, and ownership records behind one case boundary; expose
them through SQL-backed C# contracts; and let each role start from realistic
questions. The agent team should consume those records through bounded
application tools, with the MCP surface added only after the underlying
contracts are tested. See `specs/024-role-based-collaboration-scenarios.md`.

## Teams interaction model

The Teams experience should be a task surface, not a second private chatbot.
An authorized user should be able to mention an agent in an existing
conversation, let it read bounded thread context, create a reviewable task,
and receive evidence-linked work back in that conversation. For example:

`@Lease Analyst review the notice obligation before we advance this tract.`

The Workroom preview now carries thread messages, a deterministic context
summary, the required Entra group, the ordered agent route, and the human
decision boundary. The local composer is a development stand-in. A future
Teams adapter should obtain the thread from Microsoft Graph, validate Entra
claims, and call the same ASP.NET Core contract without creating a separate
agent policy or bypassing the case/evidence scope.

## Source references

- `business-agent/catalog.yaml` and `docs/land-administration-catalog.md`
- `business-agent/docs/landops-architecture.md`
- `decisionforge/README.md`, `AGENTS.md`, and `packs/oil-gas/MANIFEST.yml`
- `agent-workspace/README.md` and `AGENTS.md`
- `land-agent-demo-learning/README.md` and `docs/ARCHITECTURE.md`
- `land-ai-engineering/README.md` and `docs/MICROSOFT_AI_STACK.md`
- `ms-teams-agent/README.md` and `docs/architecture.md`
