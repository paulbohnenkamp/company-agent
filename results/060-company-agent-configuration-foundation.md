---
id: 060-company-agent-configuration-foundation
title: Company Agent configuration foundation
status: completed
spec: specs/060-company-agent-configuration-foundation.md
completed: 2026-09-20
---

## What changed

- Added a typed offline product catalog loader and normalized configuration
  model.
- Added deterministic validation for keys, versions, references, paths,
  contract operations, agent cycles, solution cycles, secret-shaped fields, and
  resource bindings.
- Added a typed dependency graph with shared-resource reference counts and
  deterministic solution ordering.
- Added a dry-run deployment planner and local `planned` state model with
  canonical desired-state and plan hashes.
- Added the Company Agent product catalog and a versioned API operation-contract
  fixture for HR and Land operations.
- Added eight focused tests covering shared resources, multiple resources per
  department, cycles, path escapes, contract mismatches, secret-shaped input,
  duplicate YAML keys, stable hashes, and no-mutation planning.

## Files changed

- `scripts/company-agent-config.ts`
- `scripts/validate-company-agent-config.ts`
- `scripts/plan-company-agent.ts`
- `contracts/company-agent-api/v1.yaml`
- `copilot-studio/company-agent/catalog.yaml`
- `tests/company-agent-config.test.ts`
- `package.json`

## Checks run and results

- `node --version` — passed; Node `v24.14.1`.
- `npm run validate:records` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed; 8 tests.
- `npm run validate:company-agent-config` — passed; 29 graph nodes and 26
  graph edges.
- `npm run plan:company-agent -- --product company-agent --env companyagent-dev`
  — passed; generated a provider-free plan with 5 `mutation: none` actions and
  state phase `planned`.
- `npm run validate:department-artifacts` — passed.
- `npm run validate:agent-artifacts` — passed.
- `git diff --check` — passed.

## Deviations from the spec

- The first slice uses the existing `tsx`/Node test tooling and does not add a
  separate test framework.
- Local plan and state output is written under the existing ignored `.azure/`
  directory. No provider IDs, credentials, or observed tenant state are
  written.

## Important decisions

- Product topology is loaded from
  `copilot-studio/company-agent/catalog.yaml`, independently of `azure.yaml`.
- Logical resources are represented once even when HR and Land operations share
  the same API resource.
- Resource and agent solutions are separate graph nodes, with the agent
  solution depending on the resource solution.
- The first planner cannot authenticate or mutate external state; all plan
  actions are explicitly `mutation: none`.

## Remaining follow-ups

- Review and approve the operation-contract compatibility rules for customer
  connector substitutions.
- Add provider adapters for PAC/Power Platform solution import and connection
  reference settings in a separate spec.
- Add managed-solution build, import, publish, verification, rollback, and
  dependency-safe cleanup in later approved slices.
