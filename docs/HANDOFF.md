# Session handoff

## Current takeover state — 2026-09-21

### Immediate instruction

Stop tenant deployment work. Do not rename, delete, reauthorize, create, or
update connectors, connections, solutions, or agents until the connector
contract, authentication model, and source-to-tenant binding are corrected in
the repository and reviewed.

The previous deployment attempt demonstrated that the current path does not
converge the checked-in Company Agent source into the published tenant agent.
Treat the current tenant as diagnostic evidence, not as a successful product
deployment.

### Product and tenant URLs

- Copilot Studio agent list:
  https://copilotstudio.microsoft.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/agents
- Company Agent A → Agents:
  https://copilotstudio.microsoft.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/bots/3b46c4bb-196d-437c-8b08-236e3860e1ea/agents
- Failing HR action:
  https://copilotstudio.microsoft.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/bots/3b46c4bb-196d-437c-8b08-236e3860e1ea/actions-adaptive/799342f9-d45d-415f-bd2a-05b948a15ed8/details
- Power Platform connections:
  https://make.powerapps.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/connections
- Entra app registrations:
  https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

Environment: DecisionForge, `ec4b8411-d158-44e0-a8cf-6f71e2d8b96b`.
Published parent: Company Agent A, Copilot ID
`3b46c4bb-196d-437c-8b08-236e3860e1ea`.

### Critical naming failure

Two names are wrong and must not become canonical:

1. `Company Agent API v1 Land HR` incorrectly couples an API resource to its
   current consumers. It prevents later APIs and departments from fitting the
   product model cleanly.
2. `Company Agent A HR v1` is an accidental HR-specific connector created by
   the bootstrap path. It is a separate connector, not the shared API
   resource.

The neutral target name should be selected in the next approved spec, for
example `Company Agent API v1` or `Company Agent Read API v1`. The connector
name must describe the API contract/version, not departments or agents.

### Actual published binding

A read-only PAC clone of the published agent showed:

```text
HR action: CompanyAgentApi-GetVacationPolicy
connection reference:
  ca_CompanyAgentA.shared_new-...company-agent-a-hr-v1....hr
connector:
  Company Agent A HR v1
  connector ID: e47de663-3db2-f111-aaac-7ced8d05c994
  provider: shared_new-...company-agent-a-hr-v1...
```

The intended shared connector is a different tenant resource:

```text
Company Agent API v1 Land HR
connector ID: fa1afb56-dbb2-f111-aaac-7ced8d05c994
provider: shared_new-...company-agent-api-v1-land-hr...
connection ID observed by PAC: b1e12a4d4ec446078c1717ec85bd8014
```

The source-controlled HR action and the published HR action do not have the
same connection reference. The deployment command reported “No local changes
detected” even though the published binding was not the intended source
binding. That idempotence signal is therefore not sufficient evidence of
convergence.

### Why the HR call returns HTTP 401

The Power Apps connection page shows `Company Agent A HR v1` as Connected, but
that only proves a connection object exists. The connector's checked-in/live
`connectionparameters.json` is `{}`: it has no OAuth/API-key configuration.
The deployed API is Entra-protected and rejects the unauthenticated request.

Observed error:

```text
The connector 'Company Agent A HR v1' returned an authorization error (HTTP 401).
```

This is not primarily a reauthorization problem. It is both:

- the wrong connector binding; and
- an unauthenticated connector calling an authenticated API.

The repository itself documents the API as Entra-protected and the connector
OpenAPI description says it is preview-only until Entra authentication is
configured. Configure authentication only after the product owner approves
the exact connector auth contract.

Microsoft references:

- [Custom connector OAuth/OBO authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-custom-connector-on-behalf-of)
- [Copilot Studio connections](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-connections)
- [Use connectors in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/microsoft-copilot-extend-action-connector)

### Authentication decision still required

Do not assume OAuth is already approved. The real choices are:

- Entra OAuth with maker-provided credentials;
- Entra OAuth on behalf of the user;
- an explicitly anonymous, synthetic-data-only development endpoint; or
- another gateway/API-key design.

For the reusable product, Entra OAuth is the likely production choice, but the
next agent must write and get approval for the authentication contract before
implementing it. Microsoft documents the OBO setup, including the API app,
connector app, scope, and Azure API Connections service principal, in the link
above.

### Correct test sequence

Do not test through Copilot Studio first. Prove each boundary in order:

```text
Entra token
  -> direct GET /api/v1/hr/policies/vacation returns 200
  -> custom connector test returns 200
  -> neutral connector is bound to the HR operation
  -> Company Agent Preview delegates to HR Agent
  -> activity map and Application Insights show the API call
```

Per the current repository instruction, skip terminal Direct Line E2E. Use
Copilot Studio Preview or a controlled Teams channel for conversation
acceptance. The earlier terminal E2E attempts were not valid acceptance:

- stale Direct Line secret: HTTP 403 `Site missing`;
- stale environment token endpoint: HTTP 404 `RouteNotFound`;
- authenticated Agents SDK path was not configured.

### What actually happened in the tenant

- The existing `Company Agent API v1 Land HR` connector was updated.
- PAC reported the workspace already converged.
- Company Agent A was published successfully on 2026-09-21.
- PAC `copilot status --bot-id` was replaced locally with `copilot list`
  verification because PAC 2.12.2 requests a missing `componentstate_Property`
  attribute.
- Read-only clone verification passed: 16 unique actions, HR child present,
  vacation operation present, expected API host present, and no Mountaineer
  identity.
- The published HR action still points at `Company Agent A HR v1` and returns
  HTTP 401.
- No connector, connection, agent, or solution was deleted.

### Repository changes from the failed slice

Relevant current edits are uncommitted:

- `AGENTS.md` — requires direct URLs in UI instructions and defers terminal
  E2E in favor of Preview/Teams.
- `scripts/deploy-copilot-studio.ts` — added environment connector/solution
  overrides, connector metadata reporting, environment binding, and treatment
  of “No local changes detected” as idempotent. These changes are not yet
  trustworthy because convergence was falsely reported.
- `scripts/prepare-copilot-workspace.ts` — materializes an environment
  connector ID into the ignored PAC workspace.
- `docs/company-agent-deployment.md` — documents environment connector and
  solution overrides.
- `specs/063-company-agent-thin-vertical-slice.md` — remains `in-progress` and
  must be revised to make authentication and neutral resource naming explicit.

There are many unrelated pre-existing dirty-worktree changes. Do not stage
the whole repository. Inspect `git status --short`, isolate only approved
changes, and do not use destructive cleanup commands.

### Verification observed

Passed locally:

```text
npm run typecheck
npm run validate:records
npm test                         # 12 passing tests
npm run validate:company-agent-config
npm run validate:copilot-workspace -- .azure/companyagent-dev/copilot-workspace
git diff --check
```

Passed against the tenant:

```text
pac copilot list --environment ec4b8411-d158-44e0-a8cf-6f71e2d8b96b
COMPANY_AGENT_ID=3b46c4bb-196d-437c-8b08-236e3860e1ea npm run verify:copilot-deployment
```

The conversation/API smoke test did not pass and must not be reported as
complete.

### First task for the next coding agent

1. Read this section, `AGENTS.md`, and `specs/063-company-agent-thin-vertical-slice.md`.
2. Add an approved correction spec for neutral connector/resource naming and
   the selected Entra authentication contract.
3. Correct the repository source and deterministic validators before touching
   the tenant again.
4. Add a direct API auth test and a custom-connector contract test.
5. Only then repair the tenant binding so the HR action uses the neutral
   connector and test it in Copilot Studio Preview.

Do not begin by reauthorizing `Company Agent A HR v1`, creating another
connector, or retrying deployment.

## Goal

- Continue the top-down cleanup of Company Agent so the repository is simple,
  understandable, and grounded in the real-world oil-and-gas workflow.

## Simple product model

- People have real oil-and-gas positions.
- Teams is where they work.
- Land Agent is one assistant.
- Sub-agents are internal capabilities, not fake employees.
- Skills are procedures, not products.
- Cases, documents, leases, parcels, title records, ownership interests, and
  obligations are business data.
- The C# API enforces scope, evidence, authorization, persistence, and human
  approval.

## Changes made

- Root README now explains the simple model: employees use Teams, mention a
  Company Agent, and get evidence-backed answers from the Land Agent.
- Repository renamed to `company-agent` on GitHub and locally.
- The legacy TypeScript application runtime and TypeScript tests were removed
  from the active repository.
- The exact pre-prune checkout is preserved at
  `/Users/paul/code/company-agent-legacy-typescript`.
- C# is now the sole active application/API boundary.
- Small TypeScript repository tools remain for validating agents, personas,
  naming, records, and Entra provisioning.
- The current WV well-reconciliation demo remains, but it is not the desired
  flagship land-administration demo. It uses WVDEP/WVGES public well evidence,
  not BLM data, and does not demonstrate title, lease, ownership, or
  division-order work well enough.

## Verification

- `npm run typecheck` passed.
- `npm run validate:records` passed.
- `npm run validate:agent-artifacts` passed for 13 agents.
- `npm run validate:identity-personas` passed for 14 personas.
- `npm run validate:naming` passed.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false` passed with 39 tests.
- `az bicep build --file infra/main.bicep --stdout` passed.
- `git diff --check` passed.
- Working tree is clean at commit `93d12ce` before this handoff note.

## Open items

- Replace the current WV well demo with a coherent land-administration case
  built around leases, tracts/parcels, ownership documents, assignments, title
  gaps, and possibly a division-order proposal.
- Separate real Microsoft 365 tenant users from application capabilities.
  Employees have real oil-and-gas positions; sub-agents are not fake employees.
- Remove invented workflow personas such as `case-manager`. Use assignee,
  department, reviewer, and review state for workflow ownership.
- Reconcile the fictional identity catalog with the three real tenant users:
  Taylor (Legal), Jordan (Land), and Paul (administrator). Tenant UPNs and
  passwords stay outside the repository.
- Decide whether remaining TypeScript validation tools should eventually move
  to C#. Do not restore the old runtime just to reduce short-term friction.
- GitHub language statistics may remain cached after the large deletion; the
  current tracked code is 5 TypeScript files and 47 C# files.

## Reset sequence

1. Write a one-page product truth defining the real-world nouns and verbs:
   employee, position, department, Teams user, Land Agent, specialist, skill,
   land matter, document, finding, and review decision. Use it as the language
   test for README, demos, APIs, and screens.
2. Separate tenant users, employee positions, access roles, and agent
   capabilities. Remove invented employee roles such as `case-manager`.
3. Choose one flagship land workflow. Retire the WV well-reconciliation case as
   the primary demo and build a coherent lease, tract/parcel, ownership,
   assignment, title-gap, and division-order matter.
4. Inventory the remaining architecture as essential, reusable, compatibility,
   demo-specific, or remove. Prune duplicate orchestration and stale
   presentation/deployment concepts.
5. Rebuild current documentation and demo instructions around the simple model.
6. Implement the smallest local vertical slice: one employee question, Land
   Agent routing, two or three specialist capabilities, evidence-backed output,
   unresolved issues, and human review.
7. Verify locally before changing tenant users, Teams, Azure, or Foundry.

## Next step

- Read `README.md`, `docs/repository-guide.md`, `specs/057-prune-legacy-typescript-runtime.md`,
  and `dotnet/README.md`.
- Define the first realistic land-administration demo and its employee roles
  before changing more architecture or Azure configuration.
- The next product decision is whether that demo centers on title/ownership-gap
  review or division-order preparation and payment-impacting discrepancies.
- Use a new approved spec before implementing that demo.
