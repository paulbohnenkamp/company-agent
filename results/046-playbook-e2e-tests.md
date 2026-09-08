---
id: 046-playbook-e2e-tests
title: Role playbook end-to-end tests
status: completed
completed: 2026-09-07
spec: specs/046-playbook-e2e-tests.md
---

## What changed

- Added `PlaybookEndToEndTests` to exercise three canonical Workroom playbooks
  through the ASP.NET Core HTTP API.
- Covered Legal curative blockers, lease development obligations, and
  division-order readiness.
- Verified plan lookup, thread creation, deterministic execution, delegated
  agent steps, human-review routing, action creation, and action readback.
- Kept the C# role-scenario catalog as the only production source of playbook
  behavior.

## Files changed

- `dotnet/LandOps.Api.Tests/PlaybookEndToEndTests.cs`
- `specs/046-playbook-e2e-tests.md`
- `results/046-playbook-e2e-tests.md`
- `docs/PROJECT_STATE.md`
- `docs/teams-live-activation.md`

## Checks run and results

- Focused `PlaybookEndToEndTests`: passed, 3 tests.
- Full `dotnet/LandOps.sln` test suite: passed, 37 tests.
- `npm test`: passed, 131 tests.
- `npm run validate:records`: passed.
- `git diff --check`: passed.

## Deviations from the spec

The tests run against the deterministic local API test host. They do not call
the Microsoft Teams tenant, Graph, Foundry, or Azure SQL deployment.

## Important decisions

- Use the public HTTP endpoints as the end-to-end boundary.
- Keep Teams activity translation in the existing adapter tests.
- Use the existing local identity mode for deterministic action attribution.

## Remaining follow-ups

- Complete the external bot registration, public endpoint, consent, package
  upload, and real Teams mention smoke test.
- Add a tenant smoke result after the bot returns a Workroom reply in
  `landops-demo`.
