---
id: 059-source-controlled-company-agent-deployment
title: Move Company Agent and Land Agent into source-controlled deployment
status: in-progress
created: 2026-09-11
updated: 2026-09-16
result: results/059-source-controlled-company-agent-deployment.md
---

## Goal

Establish a clean, duplicatable repository state for the generic Company Agent
product and its Copilot Studio child agents. Capture the working tenant agents
from the existing deployment without changing that deployment, keep the
Copilot Studio configuration on disk, and make a future `example` deployment
repeatable from local environment configuration.

The target product vocabulary is:

```text
Company Agent
  └── Land Agent
  └── HR Agent
        └── governed tools
              └── Company Agent API
```

- **Company Agent** is the primary Copilot Studio agent and overall product.
- **Land Agent** and **HR Agent** are specialized child agents.
- **Company Agent API** is the .NET backend and application boundary.
- Internal domain specialists are capabilities, not fake employees, Teams bots,
  or independent backend services.

## Non-goals

- Do not rename, delete, redeploy, or otherwise mutate `rg-mountaineer-dev`.
- Do not restore the removed Bot Framework adapter, Teams bot package, Next.js
  surface, or legacy TypeScript application runtime.
- Do not commit secrets, tokens, passwords, connection values, or tenant
  credentials.
- Do not treat a PAC CLI parameter named `--bot` as the product architecture;
  it is Microsoft CLI/Dataverse terminology for an agent identifier.
- Do not claim that a terminal test captures hidden model reasoning. Capture
  only observable responses, routing/tool events where available, correlation
  identifiers, and API telemetry.
- Do not retire Mountaineer Azure resources until a separately verified
  replacement deployment has passed all acceptance checks.

## Current-state findings

- `azure.yaml` and `infra/` deploy the .NET API and Azure resources, not the
  Copilot Studio agents.
- The current Azure development resource group is `rg-mountaineer-dev` and
  contains Mountaineer-prefixed API, SQL, identity, and storage resources.
- Copilot Studio currently contains the working primary/child agent setup and a
  Land Agent REST tool connected to the API.
- The repository's current documentation calls the live primary agent
  Mountaineer and the backend Company Agent. This spec establishes Company
  Agent as the generic product/source name; Mountaineer is legacy deployment
  naming only.
- Microsoft Power Platform CLI (`pac`) is installed locally as version 2.12.2
  on .NET 10. The DecisionForge environment ID is
  `ec4b8411-d158-44e0-a8cf-6f71e2d8b96b` and the successful PAC profile uses
  `paulbohnenkamp@landopsdemo.onmicrosoft.com` against the DecisionForge
  default environment.
- This tenant's Security Defaults blocked PAC's device-code flow with sign-in
  error 530035. PAC's normal browser-based `pac auth create` flow succeeded
  after the existing Entra/Microsoft Authenticator session was used. Future
  setup instructions must prefer browser authentication and must not disable
  Security Defaults merely to enable device-code authentication.
- `departments/land/` is the canonical Land department package. The former
  `domains/land-administration/` path is retained only as a deprecation
  pointer during migration.
- The current API has Land/case/data-room/evidence operations but no HR policy
  operation. A real HR end-to-end test therefore needs a small authenticated,
  read-only synthetic HR policy contract.

## Chosen approach

### Reset and versioning decision

The tenant reset will preserve the existing **Business Agent Teams Bot** Entra
application and Teams integration until their current usage is explicitly
verified. It will remove stale Company Agent, Land Agent, and HR Agent tool
attachments, duplicate Company/Land connectors, and their obsolete connection
references, without deleting the Mountaineer Azure resource group or API.

The replacement connector and tools use versioned, role-qualified names so a
stale artifact cannot be mistaken for the active deployment:

```text
Company Agent API v1 - Land + HR
  Land Agent · Get Case Data Room
  Land Agent · Get Case Evidence
  HR Agent · Get Vacation Policy
```

The deployment must validate the live connector's display name, description,
operation IDs, agent attachments, and connection provider after every update.
PAC success output alone is not deployment evidence.

### 1. Capture the existing Copilot Studio agents safely

- Authenticate PAC against the existing Power Platform/Dataverse environment
  with the normal browser-based flow. A browser session signed into the
  correct Entra tenant may be required so MFA and Security Defaults can be
  satisfied. Use device-code authentication only if the tenant explicitly
  permits it.
- Treat authentication as an explicit human-in-the-loop gate: start the
  browser-based PAC login, stop, ask the user to complete Entra sign-in/MFA,
  and continue only after the user confirms that login is complete. Verify
  the resulting profile with `pac auth list` and `pac auth who` before any
  capture or synchronization command.
- Inventory the actual primary and child agent IDs/schema names and the source
  solution before changing any configuration.
- Use `pac copilot clone` to capture the existing primary and Land Agent into a
  temporary directory first.
- Review the captured files for secrets, environment-specific values, tool
  references, topics, and missing resources before adding them to Git.
- Do not run `pac copilot push` against the existing environment during the
  initial capture.

Microsoft documents `clone`, `pull`, `push`, and `pack` as the local workspace
workflow for Copilot Studio agents. The workspace created by `clone` contains
the synchronization metadata required by later `pull` and `push` operations.

### 2. Establish the repository layout

Use separate directories for provider-specific agent workspaces and reusable
domain artifacts:

```text
copilot-studio/
  company-agent/
  land-agent/
  hr-agent/

departments/
  land/
    catalog.yaml
    flows/
    skills/
  hr/
    catalog.yaml
    flows/
    skills/

dotnet/
  Company Agent API

infra/
  shared Azure/API deployment
```

- Rename references from `domains/land-administration` to `departments/land` in
  current artifacts and validators while preserving IDs that are
  compatibility-sensitive.
- Keep Copilot Studio workspace files separate from department skills and flow
  artifacts. The former captures provider configuration; the latter describes
  reusable business capabilities, workflows, and contracts.
- Do not create per-domain Azure or .NET deployment directories. The Company
  Agent API and Azure infrastructure remain centralized.
- Add HR domain artifacts only to the extent required for the sample HR route;
  do not invent a large HR product surface.

### 3. Make configuration explicit and safe

Expand `.env.example` and the documented setup workflow with non-secret values
for the generic deployment, including:

```dotenv
AZURE_ENV_NAME=example
AZURE_RESOURCE_GROUP=rg-example-dev
AZURE_LOCATION=westus2
AZURE_SUBSCRIPTION_ID=

COPILOT_ENVIRONMENT_ID=
COMPANY_AGENT_ID=
COMPANY_AGENT_SCHEMA_NAME=
LAND_AGENT_ID=
LAND_AGENT_SCHEMA_NAME=
HR_AGENT_ID=
HR_AGENT_SCHEMA_NAME=
COPILOT_SOLUTION_NAME=

COMPANY_AGENT_API_URL=
FOUNDRY_ENDPOINT=
FOUNDRY_MODEL=
```

- Keep `.env` ignored and never generate it with committed secrets.
- Use clear `*_ID` names in repository configuration; only translate to PAC's
  `--bot` argument at the command boundary.
- Validate required values before any provisioning, import, pull, push, or
  smoke-test command.
- Keep PAC authentication profiles in PAC's local credential store, not in
  `.env` or Git.

### 4. Make the deployment reproducible

The normal future workflow should be:

```text
.env
  → azd provision/deploy
      → rg-example-dev and Company Agent API resources
  → pac solution import / agent synchronization
      → Company Agent
          → Land Agent
          → HR Agent
```

- Update `azure.yaml`, Bicep, and deployment documentation to use generic
  Company Agent naming for new environments.
- Do not attempt in-place renames of the existing Mountaineer resources.
  Azure resource groups and most resource names are not renameable; a future
  cutover must create a parallel `rg-example-dev`-style environment, validate
  it, reconnect agent tools, and only then consider retirement of old dev
  resources.
- Treat `pac copilot pack` output as a generated deployment artifact, not a
  secret-bearing checked-in file unless the repository explicitly adopts an
  unpacked solution source format.
- Keep Teams publication, connection consent, and other tenant-only settings
  as explicit post-deployment steps or versioned deployment evidence.

### 5. Add local and deployed command-line verification

Local verification must exercise the deterministic Company Agent API and
produce an observable route trace, for example:

```text
Company Agent
→ Land Agent
→ land cases tool
→ Company Agent API
→ synthetic cases returned
```

The deployed smoke test must call the published primary agent through a
secured Direct Line REST conversation from the terminal. It must:

- obtain a short-lived token using a local secret;
- submit a question and poll for the response;
- print the transcript and conversation ID;
- verify expected response landmarks;
- correlate the request to the Company Agent API through a correlation ID or
  Application Insights query; and
- report observable child-agent/tool/API evidence when available.

The minimum end-to-end questions are:

```text
List the available land cases.

What is our vacation policy, and how do I request time off?
```

The Land question must route through Land Agent and the Land read tool. The HR
question must route through HR Agent and a governed, authenticated,
read-only synthetic HR policy API operation. The HR operation must not expose
personal employee records.

Copilot Studio Preview/activity trace remains useful for inspecting routing,
tools, connectors, and responses. The terminal test must not claim to replace
that UI trace if the required routing details are not exposed through a
supported API. Microsoft also provides Power Platform evaluation REST APIs for
running stored test sets from CI/CD; use them where they provide stronger
repeatability than ad hoc single-question calls.

## Alternatives considered

- Rename `rg-mountaineer-dev` in place: rejected because Azure resource groups
  cannot be renamed and most resource names are immutable.
- Rebuild the agents manually in the Copilot Studio UI: rejected because it is
  error-prone and creates daily configuration drift.
- Treat the `.NET` API as the Company Agent itself: rejected because Copilot
  Studio owns the primary conversation and child-agent orchestration.
- Put `deploy/` under every domain: rejected because child agents are not
  independent Azure services; deployment remains centralized.
- Use only API tests: rejected because they do not prove Copilot Studio routing
  or child-agent/tool behavior.
- Use only Copilot Studio UI tests: rejected because they are difficult to
  reproduce and do not provide a terminal-friendly deployment gate.

## Affected files or modules

- `copilot-studio/` source-controlled agent workspaces and PAC setup scripts.
- `departments/land/`, `departments/hr/`, catalogs, flows, skills, and tests.
- `azure.yaml`, `infra/`, `.env.example`, deployment documentation, and the
  C# API/tool contracts.
- Local command-line verification and evaluation tooling.

## Milestones

1. Install/verify PAC CLI and inventory the existing Dataverse environment and
   live agents without mutating them.
2. Clone the existing primary and Land agents to a temporary workspace and
   establish the source-controlled `copilot-studio/` layout.
3. Establish `departments/land` as the canonical business package, move
   specialist definitions into skills, and reconcile catalogs without
   restoring legacy runtime or Bot Framework concepts.
4. Expand `.env.example` and add safe configuration validation/setup commands.
5. Add the minimal synthetic HR policy API/tool contract and HR domain package.
6. Add local deterministic route tracing and deployed Direct Line E2E testing
   with API/Application Insights correlation.
7. Update generic Azure deployment naming and validate a new `example` preview;
   do not retire `rg-mountaineer-dev` in this slice unless a separately
   approved cutover step authorizes it.
8. Run the full verification suite and record the deployment/source-capture
   result.

## Acceptance criteria

- The repository consistently uses Company Agent, Land Agent, and Company
  Agent API as the generic product vocabulary.
- The live existing deployment remains unchanged during capture and testing.
- Company Agent and Land Agent are represented by source-controlled PAC agent
  workspaces that can be pulled and packed from disk.
- The normal local workflow documents `pac copilot pull`, `push`, and `pack`,
  with push explicitly gated as a live mutation.
- `.env.example` contains the required non-secret Azure, Dataverse, agent, and
  deployment identifiers, and `.env` remains ignored.
- `departments/land` is canonical, with the old `domains/land-administration`
  path reduced to a deprecation pointer without breaking compatibility IDs or
  restoring removed runtime code.
- A future `example` configuration can preview/deploy a resource group named
  `rg-example-dev` without Mountaineer naming in new active resources.
- A local test produces an observable deterministic Company Agent route trace.
- A deployed terminal test sends both sample questions through the published
  Company Agent and verifies the response plus API correlation.
- The Land question routes to Land Agent and the Land API tool.
- The HR question routes to HR Agent and a governed synthetic HR policy API
  operation without exposing private employee data.
- Copilot Studio Preview/activity tracing can be used to inspect the same
  deployed routing and tool behavior.
- Local API tests, agent artifact validation, record validation, configuration
  validation, and deployment preview pass.

## Verification commands

```sh
node --version
pac
pac auth list
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
az bicep build --file infra/main.bicep --stdout
azd config list
azd provision --preview --no-prompt
git diff --check
```

The deployed smoke test must be runnable from a documented command-line
command and must fail safely when required agent IDs, tokens, API endpoints,
or connection configuration are missing.

After a live publish, run:

```sh
npm run test:copilot-e2e
```

## Risks and open questions

- PAC CLI availability and the supported source workspace format may differ by
  Copilot Studio agent experience; capture the actual tenant format before
  choosing wrappers or generated projections.
- Copilot Studio solution export/source sync may omit icons, channel details,
  comments, or separately stored knowledge resources; record those gaps rather
  than silently claiming full export fidelity.
- Direct Line and Power Platform evaluation APIs may expose response and
  evaluation details without exposing every native routing event; use
  Application Insights and activity trace inspection for observable evidence.
- The HR API contract needs a deliberate privacy boundary before any live
  connection is enabled.
- Azure resource replacement changes endpoints, identities, SQL access, and
  Copilot Studio connections; cutover requires a separate approval and rollback
  procedure.

## Progress log

- 2026-09-11: Scope agreed to capture the existing agents without touching
  `rg-mountaineer-dev`, establish generic Company Agent naming, and make future
  deployments reproducible from repository configuration.
- 2026-09-11: Added PAC source-control, department layout, HR route, local trace,
  Direct Line E2E, and Azure migration requirements.
- 2026-09-14: Established `departments/land` as the canonical Land package,
  reclassified specialist definitions as skills, cloned the live Mountaineer
  configuration to a temporary workspace, and set generic deployment defaults
  for `rg-companyagent-dev`.
- 2026-09-14: Provisioned `rg-companyagent-dev` and deployed the Company Agent
  API. Azure resource provisioning succeeded; the deployed App Service still
  returns HTTP 503 and requires startup diagnosis before Copilot connections
  or endpoint smoke tests can proceed.
- 2026-09-15: Retried the deployed endpoint after the overnight interval. App
  Service logs identified the failure as `ImageNotFoundFailure` for the
  nonexistent `companyagent-api:0.1.0` image. The AZD-published immutable image
  `company-agent/api-companyagent-dev:azd-deploy-1789429286` was pinned to the
  App Service, after which `/health` and `/api/v1/company` returned HTTP 200.
  The protected HR endpoint returned the expected HTTP 401 without a bearer
  token. `azd provision --preview --no-state` still previews the empty-image
  fallback, so the AZD image handoff remains an infrastructure follow-up;
  this does not yet qualify the Copilot Studio end-to-end acceptance criteria.
- 2026-09-15: Added a local Copilot workspace validator and guarded PAC
  deployment command. Corrected the six captured Land API action display names
  so each operation has a distinct Copilot Studio label. The guarded command
  is plan-only by default and requires an explicit approval environment value
  before `pac copilot push` can mutate the tenant.
- 2026-09-15: Local `pac copilot pack` testing showed that the sanitized
  repository snapshot is not itself a valid PAC synchronization workspace.
  PAC requires `.mcs` metadata created by `pac copilot init` or `pac copilot
  clone`; the deployment path must initialize a new Company Agent workspace
  with a new publisher/schema identity before merging reviewed source files.
- 2026-09-15: Created Company Agent in the DecisionForge environment with
  schema `ca_CompanyAgent` (agent ID `e5284baa-37bd-40ab-8380-a8ff1d442a95`)
  without changing Mountaineer. The first guarded push landed the parent,
  Land Agent, and six actions, but exposed the captured duplicate tool labels.
  The source now uses six unique display names and the new API host.
- 2026-09-15: Created a separate Company Agent custom connector in solution
  `ca_CompanyAgent` (connector ID `6f9cfa63-1bb1-f111-aaac-7ced8d05c994`).
  PAC 2.12.2 still retained the old Mountaineer connection-reference binding
  after a content push. A clone-based deployment verifier now detects that
  false-success state; the remaining tenant-only step is to link the new REST
  connector in Copilot Studio so PAC has a real connection-reference record.
- 2026-09-15: PAC `copilot create` can create a standalone HR Agent schema but
  cannot make it a child of Company Agent. The temporary standalone HR record
  is not used by the parent; HR source artifacts remain in `departments/hr`
  until the supported child-agent creation/link step is completed. The
  temporary standalone record was deleted after verification.
- 2026-09-15: Full local validation passed: record/artifact/identity/naming/
  department checks, TypeScript typecheck, 40 .NET tests, Bicep compilation,
  `azd config list`, and whitespace checks. The deployed clone verifier
  intentionally fails because the live Company Agent still contains the old
  Mountaineer connector binding; no completion result is recorded.
- 2026-09-15: User created HR Agent from inside Company Agent using Copilot
  Studio's Add an agent flow. `pac copilot pull` captured the real child schema
  `ca_CompanyAgent.agent.Agent_pOL`; the reviewed HR child definition was added
  to source control and pushed. A fresh PAC clone verifies both HR Agent and
  Land Agent as children of Company Agent.
- 2026-09-15: Confirmed the connector bootstrap omitted the icon file even
  though `docs/copilot-studio/assets/connector-icon.png` exists. The bootstrap
  now stages the icon, the deployment script updates the existing connector
  with it, and the deployed gate checks for the new provider connection before
  pushing. Added the governed `getVacationPolicy` operation to the shared
  Company Agent API connector and added the corresponding HR Agent action.
- 2026-09-15: PAC 2.12.2 exposes connector create/update but not creation of a
  user-consented custom-connector connection. The deployment gate therefore
  treats the connection as an explicit external prerequisite and fails closed;
  it no longer allows a successful content push to mask an unbound connector.
- 2026-09-15: Documented the current verification boundary. API tests,
  source validation, and published-agent clone verification cover both Land
  Agent and HR Agent artifacts, but no deployed Copilot Studio conversation
  E2E test currently proves natural-language routing, tool invocation, and API
  correlation for both sample questions. No completion result is recorded.
- 2026-09-15: Added `test:copilot-e2e`, which exercises the published Company
  Agent through Direct Line for the Land and HR questions, validates response
  landmarks, queries Application Insights for the expected API operation, and
  writes ignored transcript evidence. The command is ready for the first run
  after the Direct Line token endpoint/secret and deployed telemetry settings
  are present; no live E2E result is claimed yet.
- 2026-09-15: Added explicit `--publish` support to the PAC deployment gate.
  The deployment sequence can now push, publish, check publish status, and then
  run the Direct Line E2E command without treating a content push as a live
  published deployment.
- 2026-09-16: Deferred live conversation E2E. The Direct Line runner opened a
  conversation and sent the Land question after a conversation-creation fix,
  but no expected response arrived within 90 seconds. The authenticated Agents
  SDK path remains blocked by `AADSTS700016` for the existing Business Agent
  Teams Bot registration. Copilot Studio Preview confirmed that the HR question
  routes to HR Agent, but the live child has no connected HR API tool and
  returns generic HR guidance. The E2E runner remains documented for later
  repair; no live E2E acceptance result is claimed.
- 2026-09-16: Confirmed the stale deployment root cause. The canonical source
  lived under `copilot-studio/company-agent`, while the guarded push read the
  older ignored `.azure/companyagent-dev/copilot-workspace` snapshot. PAC
  reported a successful push even though the tenant retained the old
  Mountaineer description, duplicate Land labels, and six-operation connector.
  The deployment now synchronizes canonical source into the PAC workspace,
  quarantines extra nested files, and downloads the live connector after update
  to verify the versioned display name and `getVacationPolicy` operation before
  any push.
- 2026-09-16: Implemented the clean target naming contract: `Company Agent API
  v1 - Land + HR`, role-qualified Land and HR action names, and a fail-closed
  connection-provider check derived from connector metadata. Tenant deletion of
  stale Copilot Studio tools/connectors remains intentionally unexecuted until
  the new connector connection exists; PAC 2.12.2 has no connector-delete
  command, and the existing Business Agent Teams Bot/Teams integration remains
  preserved.
- 2026-09-16: Ran the guarded deployment against the explicit Company Agent
  connector. PAC first rejected the overlong OpenAPI title; the source now uses
  PAC-safe title `Company Agent API v1 Land HR`. PAC then updated and downloaded
  the live connector successfully, confirmed the HR operation and no legacy
  Mountaineer identity, and stopped before agent push because only the old
  `shared_cr42d-...` connection provider is authorized. No stale agent
  attachments were deleted and no Company Agent content push was claimed.

## Decision log

- 2026-09-11: Company Agent is the generic primary Copilot Studio agent;
  Mountaineer is legacy deployment naming only.
- 2026-09-11: The existing Mountaineer deployment is a read-only capture source
  for this work and will not be renamed or mutated.
- 2026-09-11: PAC CLI workspaces and central Azure/API deployment are separate
  concerns; domain packages do not receive independent `deploy/` directories.
- 2026-09-11: Local and deployed tests must verify observable behavior and API
  telemetry, not hidden model reasoning.
- 2026-09-14: Company Agent and department agents are the deployed Copilot
  Studio boundaries. Land specialists are skills coordinated by Land flows;
  the .NET API is not a second general-purpose agent router.

## Completion notes

This spec is approved for implementation. No repository or Azure resources are
changed by creating the spec.
