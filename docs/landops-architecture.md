# LandOps architecture

LandOps Workbench is a browser application for evidence-bounded oil-and-gas land operations. The current application uses C# and .NET as the application center of gravity. Next.js App Router hosts the React user interface and same-origin routes. SQL Server stores the durable case and run history.

## The system at a glance

```text
React page
    │
    ▼
Next.js same-origin proxy routes
    │
    ▼
ASP.NET Core minimal API
    │
    ├── Application services
    │       ├── case query
    │       ├── deterministic reconciliation
    │       ├── workflow and synthesis
    │       └── bounded conversation
    │
    ├── Domain contracts and business rules
    │
    └── Infrastructure
            ├── EF Core DbContext
            ├── SQL Server migrations
            ├── repositories
            └── frozen Braxton fixture
```

The TypeScript implementation remains available as a behavioral reference and a default fallback. It is not the long-term boundary for the product architecture.

## What each layer owns

### React and Next.js

The React page displays the case workspace and collects user actions. The Next.js routes keep browser requests same-origin and hide the C# API URL from browser code. `src/landops/adapter.ts` translates C# responses into the existing page view model.

The React layer does not decide whether a finding is supported or whether a conflict is real. It renders the structured result that the API returns.

### ASP.NET Core API

`dotnet/LandOps.Api/Program.cs` registers services, configures the database, applies development migrations, seeds the case, and defines HTTP endpoints.

The API is an adapter between HTTP and application services. It should validate request shape at the boundary, call an application service, and translate the result to JSON.

### Application layer

`dotnet/LandOps.Application` coordinates use cases:

- `CaseQuery` loads a case-shaped response;
- `DeterministicReconciliationService` compares the fixture evidence and creates findings, conflicts, and unknowns;
- `DeterministicAgentWorkflow` orders intake, reconciliation, and synthesis steps; and
- `DeterministicCaseConversation` answers a small, case-scoped set of questions.

Application services know what the product does. They do not know how SQL Server stores rows.

### Domain layer

`dotnet/LandOps.Domain` contains the business objects and contracts that must remain true regardless of the web framework or database. Examples include `LandCase`, `Well`, `PublicEvidence`, `Finding`, `Conflict`, `Unknown`, and `ReviewDecision`.

Constructors enforce basic invariants such as required identifiers. This keeps invalid objects from entering the rest of the application.

### Infrastructure layer

`dotnet/LandOps.Infrastructure` connects the application to SQL Server. `LandOpsDbContext` maps domain objects to tables. EF Core migrations describe schema changes. `ReconciliationPersistence` loads the fixture, runs the workflow, and stores the complete result.

Infrastructure can change without changing the meaning of a `Finding` or `Conflict`.

The C# Foundry integration follows the same boundary. `IAgentProvider` lives in
the application layer, while `FoundryAgentProvider` lives in infrastructure and
owns HTTP, authentication headers, timeouts, and provider response parsing. The
deterministic workflow does not depend on this provider, so local tests remain
offline. API-key mode supports a local live Foundry run. Managed-identity mode
supports an Azure deployment without putting an API key in application settings.

## Case Copilot and Teams Workroom

These are two connected but different user experiences:

- **Case Copilot** is private and case-scoped. It helps one person ask a
  question and understand the evidence.
- **Workroom** is collaborative. An authorized user can mention a role, pass a
  bounded Teams-style thread excerpt, and create a reviewable task for an
  ordered group of agents.

The Workroom contract carries the original question, captured context,
participants, required Entra group, delegated steps, and human decision
boundary. Each delegated step names the preceding agent in `delegatedFrom`, so
the handoff is visible rather than hidden inside a model prompt. Local development supplies a role and group so the flow can run
without sign-in. `LandOps:IdentityMode=local` makes that fallback explicit.
Production uses `LandOps:IdentityMode=entra`; the API then reads the subject,
application roles, and group claims from the authenticated ASP.NET Core
principal. ASP.NET Core JWT bearer middleware validates the token when Entra
mode is enabled. The deployment still owns Entra app registration and role/group
assignments; this API adapter consumes only validated claims. Production must
also persist threads in SQL Server/Azure SQL. Workroom does not approve title,
change payment status, or perform another consequential action.

Thread storage follows the same local/cloud split. `LandOps:WorkroomPersistence`
defaults to `memory` for a quick learner workflow and deterministic tests. Set it
to `sql` in an Azure or SQL Server deployment; the EF Core adapter stores the
bounded context, route, identity, status, and timestamps in `WorkroomThreads`.
The application API depends on the store interface, so the browser contract does
not change when the persistence adapter changes.

Workroom execution is also a replaceable boundary. The default
`LandOps:WorkroomExecutionProvider=deterministic` mode is offline and repeatable.
Azure can select `foundry`; that mode sends the bounded thread context and
selected fictional records through `IAgentProvider`, validates the JSON result,
and fails closed unless every cited record belongs to the case and the proposed
route remains `human-review`.

## Why the workflow is ordered

The workflow has three steps:

1. `land-case-intake` establishes the case scope and supplied clues.
2. `land-well-reconciler` compares independent evidence and creates structured results.
3. `case-synthesizer` turns those results into a proposed route for human review.

Each step produces a durable `AgentStep` with an order, status, artifact, and producer version. The order makes the run auditable. The artifact keeps the structured handoff visible instead of hiding it inside a prompt or a log message.

## Why the API uses SQL Server now

The project requirements call for enterprise Microsoft technologies. SQL Server and EF Core make the persistence boundary visible while keeping local development repeatable through Docker. The code still uses deterministic fixtures, so a learner can run it without government endpoints or a language-model account.

## The Azure direction

The local seams map to a future Azure shape:

| Local seam | Azure direction | Why it exists |
| --- | --- | --- |
| ASP.NET Core API | Azure App Service or Azure Container Apps | Host the web API |
| SQL Server container | Azure SQL Database | Store durable case and run state |
| Raw snapshot reference | Azure Blob Storage | Store immutable source snapshots |
| Local configuration | Microsoft Entra ID and Key Vault | Authenticate users and protect secrets |
| Deterministic provider boundary | Microsoft Foundry | Add a validated model-backed provider |
| Local health and logs | Application Insights | Observe requests and failures |

The cloud layer is intentionally deferred until identity, cost, networking, and deployment choices have an approved plan.

## Microsoft Teams channel boundary

The Workroom screen and the Microsoft Teams channel are separate surfaces over
the same application contract. The Workroom screen is useful for local
learning and portfolio review. The Teams adapter is the real channel shell.

`src/teams/server.ts` uses the Microsoft Teams SDK to receive Bot Framework
message activities. It removes the LandOps bot mention, maps the conversation
to `personal`, `groupChat`, or `channel`, preserves tenant and user identity,
and calls `POST /api/v1/workroom/threads`. It does not contain land rules or
make title, payment, filing, or owner-contact decisions.

The adapter keeps a process-local activity-ID store for the prototype. A
production deployment must replace it with shared durable storage before
running multiple replicas or enabling side effects. The production channel
also needs an Azure Bot/Teams registration, Entra credentials, permissions,
and a hosted endpoint. Those are deployment requirements, not reasons to hide
the channel boundary behind a browser mock.
