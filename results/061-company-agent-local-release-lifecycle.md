---
id: 061-company-agent-local-release-lifecycle
title: Company Agent local release lifecycle
status: completed
spec: specs/061-company-agent-local-release-lifecycle.md
completed: 2026-09-20
---

## What changed

- Added provider-neutral environment binding and implementation models.
- Added bootstrap and release lifecycle plans with explicit authentication
  prerequisites, settings resolution, solution build/import ordering, and
  publication planning.
- Added rollback selection and dependency-safe cleanup candidate planning.
- Added the integrated `company-agent-config` CLI for validation, planning,
  status, rollback-plan, and cleanup-plan commands.
- Added lifecycle tests for mode separation, ordered solution imports,
  no-mutation actions, rollback selection, and shared-resource cleanup safety.

## Files changed

- `scripts/company-agent-config.ts`
- `scripts/company-agent-config-cli.ts`
- `tests/company-agent-config.test.ts`
- `package.json`
- `specs/061-company-agent-local-release-lifecycle.md`
- `results/061-company-agent-local-release-lifecycle.md`

## Checks run and results

- `npm run validate:records` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed; 10 tests.
- `npm run validate:company-agent-config` — passed.
- `npm run plan:company-agent -- --product company-agent --env companyagent-dev` —
  passed; all base actions were `mutation: none`.
- Integrated CLI validation — passed.
- Integrated lifecycle plan — passed; 7 actions, all `mutation: none`.
- Integrated cleanup plan — passed; no shared resource was incorrectly marked
  for cleanup.
- `npm run validate:department-artifacts` — passed.
- `npm run validate:agent-artifacts` — passed.
- `git diff --check` — passed.

## Deviations from the spec

- Provider integrations remain typed planning seams only. No PAC, Azure,
  Dataverse, connector, or tenant call was added.
- The integrated CLI prints lifecycle plans; it does not apply them or write
  provider settings.

## Important decisions

- Environment bindings contain references such as `COPILOT_ENVIRONMENT_ID`
  and `COMPANYAGENTAPI_ENDPOINT`, never secret values.
- Bootstrap and release differ only in their explicit prerequisite mode; both
  remain non-mutating.
- Rollback selects an immutable prior plan hash and never edits the current
  plan.
- Cleanup candidates require zero operation dependents and are emitted as
  plans only.

## Remaining follow-ups

- Implement a separately authorized Power Platform adapter for solution import,
  connection-reference binding, publish, and verification.
- Validate managed-solution rollback in a separate deployment environment.
- Define and authorize tenant-scoped cleanup execution.
