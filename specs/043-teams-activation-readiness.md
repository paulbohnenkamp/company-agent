---
id: 043-teams-activation-readiness
title: Teams activation readiness and authorization coverage
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/043-teams-activation-readiness.md
---

## Goal

Advance the next Teams activation backlog item as far as a clean local
checkout can prove: verify the adapter-to-ASP.NET Core request path and close
authorization coverage for every explicit human action exposed through Teams.

Production Microsoft Teams activation remains an external deployment gate and
must not be represented as complete by this slice.

## Non-goals

- Registering an Azure Bot, Teams app, or tenant.
- Creating or assuming Entra credentials, consent, or channel permissions.
- Redesigning the Next.js information architecture or Teams review UI.
- Moving authorization, evidence rules, or Workroom behavior into `src/teams/`.
- Adding distributed idempotency or autonomous consequential actions.

## Current-state findings

- `src/teams/server.ts` forwards message and explicit action commands to the
  existing Workroom API, but only pure adapter tests are currently automated.
- The API authorizes Workroom creation and action recording at its boundary;
  the existing integration test covers one action in local identity mode.
- The project state explicitly lists live local Teams smoke, all-action
  authorization coverage, and real tenant activation as remaining work.

## Chosen approach

Keep the Teams adapter transport-only. Add deterministic integration coverage
at the C# API boundary for all four allowed action kinds and for a role
mismatch. Add a local adapter smoke path that exercises the real HTTP contract
against the local API without Teams credentials. Document exact local smoke
commands and the remaining tenant activation checklist.

## Alternatives considered

- Connecting to a real tenant now was rejected because registration,
  credentials, consent, and channel configuration are not available in a clean
  repository checkout.
- Adding action authorization to the TypeScript adapter was rejected because
  ASP.NET Core is the application boundary and must remain the authority.
- Redesigning the web or Teams preview was rejected because the approved
  product direction keeps the browser as a focused review surface and the
  activation gap is operational, not an information-architecture decision.

## Affected files or modules

- `dotnet/LandOps.Api.Tests/ApiTests.cs`
- `src/teams/server.ts` and/or a local smoke harness, if required by the
  existing HTTP contract
- `tests/teams-adapter.test.ts`, if the smoke harness needs a focused contract
  test
- `README.md`
- `docs/PROJECT_STATE.md`
- `results/043-teams-activation-readiness.md`

## Milestones

1. Add API coverage for each allowed human action and reject unauthorized
   role access.
2. Exercise the local Teams HTTP contract with deterministic local services.
3. Run the complete verification suite and record any environment limits.
4. Update the project state with verified readiness and the external blocker.

## Acceptance criteria

- Every allowed action (`approve-next-step`, `request-evidence`,
  `reject-recommendation`, and `assign-task`) has an API integration test.
- A valid authenticated identity with the wrong role cannot record an action.
- A local smoke command or test exercises the adapter’s HTTP request contract
  without requiring Teams or Azure credentials.
- The README and project state distinguish local activation readiness from real
  tenant activation.
- No land business logic or authorization is duplicated in the Teams adapter.

## Verification commands

```sh
node --import tsx --test tests/teams-adapter.test.ts
npm run typecheck
npm test
npm run build
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
git diff --check
```

For the local live-path check, start the API with the documented local
settings, run the Teams adapter, and send one deterministic activity through
the adapter. Record the exact result; do not call this a Teams tenant smoke
test.

## Risks and open questions

- The local adapter currently has process-local idempotency; distributed
  idempotency remains required before multi-replica production hosting.
- A real tenant still requires an externally provisioned bot endpoint,
  credentials, consent, Teams app configuration, and channel permissions.
- Adaptive-card actions remain a later transport enhancement over the same
  append-only API.

## Progress log

- 2026-09-07: Selected as the smallest locally verifiable slice from the
  continuation backlog after reconciliation.
- 2026-09-07: Approved for implementation; external Teams activation remains
  explicitly out of scope.
- 2026-09-07: Local API action coverage, Entra-style role denial, and the
  adapter receive-path smoke test passed.

## Decision log

- 2026-09-07: Treat local adapter-to-API readiness and API authorization
  coverage as the next implementation slice; do not claim tenant activation.
- 2026-09-07: Preserve the existing Teams/web/API information architecture.
- 2026-09-07: Production tenant activation remains incomplete and externally
  blocked; local readiness is the only completed outcome of this slice.
