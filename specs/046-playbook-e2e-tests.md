---
id: 046-playbook-e2e-tests
title: Role playbook end-to-end tests
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/046-playbook-e2e-tests.md
---

## Goal

Exercise the existing role-scenario playbooks through the ASP.NET Core HTTP
boundary. Prove that a Teams-shaped request can use a canonical role scenario
to create a Workroom thread, run the deterministic review packet, and record a
human action.

## Non-goals

- Creating a generic playbook engine.
- Duplicating role scenarios or business rules in TypeScript or Teams.
- Calling Microsoft Teams, Graph, Foundry, or live government sources.
- Replacing the existing local adapter tests or Entra authorization tests.
- Claiming that a local API test proves live tenant delivery.

## Current-state findings

- `RoleScenarioSeed` is the canonical C# catalog for role playbooks and
  collaboration plans.
- Existing API tests cover individual Workroom operations but do not run a
  complete playbook matrix from plan lookup through human action.
- The local API test factory already supplies deterministic data, in-memory
  Workroom persistence, and a SQL-backed action path.
- The Teams adapter already maps channel activities to the Workroom request
  contract; its focused tests cover that mapping separately.

## Chosen approach

1. Add a small test matrix for three representative Workroom playbooks:
   Legal curative blockers, lease development obligations, and division-order
   readiness.
2. Resolve each plan through `GET /api/v1/scenarios/{id}/plan`.
3. Create and run each Workroom through the public HTTP endpoints.
4. Record `request-evidence` as the human action and read it back through the
   actions endpoint.
5. Assert the human-review route, delegation steps, case scope, and required
   group without copying the scenario catalog into production code.

## Alternatives considered

- Testing only `RoleScenarioSeed` was rejected because it would skip the HTTP,
  persistence, and Workroom execution boundaries.
- Calling a live Teams tenant was rejected for deterministic CI because it
  needs external credentials, policy, endpoint availability, and billing.
- Adding playbook rules to the test was rejected because the canonical C# role
  scenario must remain the source of business behavior.

## Affected files or modules

- `dotnet/LandOps.Api.Tests/PlaybookEndToEndTests.cs`
- `specs/046-playbook-e2e-tests.md`
- `results/046-playbook-e2e-tests.md`
- `docs/PROJECT_STATE.md`
- `docs/teams-live-activation.md`

## Milestones

1. Add the representative playbook matrix and HTTP journey.
2. Run the focused API tests and the full .NET suite.
3. Record the local proof and live-Teams limitation.

## Acceptance criteria

- Three canonical Workroom playbooks pass the same plan → thread → run → human
  action journey.
- Each test proves case scope, required group, delegation steps, human-review
  routing, and persisted action readback.
- No production scenario catalog or authorization logic is duplicated.
- The result and project state distinguish local end-to-end proof from the
  still-incomplete tenant smoke.

## Verification commands

```sh
dotnet test dotnet/LandOps.Api.Tests/LandOps.Api.Tests.csproj --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
git diff --check
```

## Risks and open questions

- The API test action path uses the repository's configured test database
  behavior and does not prove Azure SQL availability.
- Bot registration, public endpoint, consent, package upload, and the real
  Teams mention remain external activation gates.

## Progress log

- 2026-09-07: Approved to add a representative playbook HTTP journey without
  changing the canonical role-scenario catalog.
- 2026-09-07: Added and passed three HTTP playbook journeys covering Legal,
  Lease, and Division Order collaboration paths.

## Decision log

- 2026-09-07: Use the C# API integration-test boundary for playbook end-to-end
  proof. Keep Teams transport tests focused on activity translation.
