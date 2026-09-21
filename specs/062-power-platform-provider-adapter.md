---
id: 062-power-platform-provider-adapter
title: Company Agent Power Platform provider adapter
status: completed
created: 2026-09-20
updated: 2026-09-20
result: results/062-power-platform-provider-adapter.md
---

## Goal

Add the first Power Platform provider adapter around the existing deterministic
Company Agent lifecycle model. The adapter must expose PAC solution commands as
typed, testable operations and must keep planning separate from execution.

The first provider slice supports local solution packaging, read-only
inspection, settings-file planning, and an explicit apply gate for future
imports. It does not perform a live tenant deployment in this slice.

## Non-goals

- Do not authenticate, import, publish, create connections, or mutate a tenant.
- Do not delete connectors, connections, agents, or solutions.
- Do not invent an unpacked Power Platform solution source tree from the current
  Copilot workspace export.
- Do not claim that PAC command construction proves a successful deployment.
- Do not bypass the existing `--apply` safety boundary.

## Current-state findings

- PAC CLI 2.12.2 is installed and exposes `solution pack`, `import`, `create-settings`,
  `check`, `list`, `publish`, `upgrade`, and `unpack` commands.
- The repository contains Copilot Studio workspace artifacts and connector
  exports but no verified unpacked solution source under version control.
- The local lifecycle plan already models resource and agent solution order,
  environment references, rollback, and cleanup candidates.
- Existing deployment scripts invoke PAC directly and must not be silently
  replaced by this provider-neutral adapter.

## Chosen approach

- Add `PowerPlatformCommand` as a discriminated union for `pack`, `check`,
  `create-settings`, `import`, `list`, `publish`, and `upgrade`.
- Add a `PacRunner` port with a local process implementation and a deterministic
  fake used by tests.
- Build commands from a validated lifecycle plan. Command construction has no
  side effects.
- Mark `pack`, `check`, `create-settings`, and `list` as read-only/local-safe;
  mark `import`, `publish`, and `upgrade` as mutation-capable and require an
  explicit `apply` option.
- Reject mutation-capable commands when `apply` is false.
- Require a solution source directory and explicit target environment for any
  future apply operation.
- Keep connection-reference and environment-variable settings as generated
  deployment inputs; never place credentials in command arguments or files.

## Alternatives considered

- Call PAC directly from the product planner: rejected because planning must
  remain deterministic and testable without provider execution.
- Treat `--apply` as a planner option with no command-level guard: rejected
  because a mutation command must be unable to reach a runner accidentally.
- Replace the existing deployment scripts immediately: rejected because their
  current tenant behavior requires a separate migration and live verification.
- Generate a solution source tree from the current workspace export: rejected
  because the export is not yet verified as complete Power Platform solution
  source.

## Affected files or modules

- `scripts/power-platform-adapter.ts` — typed PAC command model, command
  builder, runner port, and apply guard;
- `scripts/company-agent-config-cli.ts` — provider inspection/command-plan
  subcommands;
- `tests/company-agent-config.test.ts` — fake runner and command safety tests;
- `specs/062-power-platform-provider-adapter.md`;
- `results/062-power-platform-provider-adapter.md`.

## Milestones

1. Define PAC command types and mutation classification.
2. Implement deterministic command construction.
3. Implement local runner with captured result shape.
4. Add fake-runner contract tests and apply-gate tests.
5. Add CLI command-plan/inspect entry points without tenant mutation.
6. Run all repository verification commands.

## Acceptance criteria

- PAC command plans are deterministic and include explicit working directory,
  environment, solution, and settings inputs.
- Mutation-capable commands cannot run without `apply: true`.
- Fake-runner tests prove command order and that no mutation command runs in
  planning mode.
- Local-safe commands can be executed only against local inputs in tests.
- Missing solution source and settings inputs fail before runner invocation.
- The adapter emits no secrets in command arguments, output, or errors.
- Existing foundation and lifecycle tests continue to pass.

## Verification commands

```sh
node --version
pac solution --help
npm run validate:records
npm run typecheck
npm test
npm run validate:company-agent-config
git diff --check
```

## Risks and open questions

- The current workspace export may require a separate capture/solution-source
  migration before `pac solution pack` can build the intended agent solution.
- PAC command behavior can vary by CLI version; the adapter must record the
  installed version in future deployment evidence.
- Live import requires an explicit target environment, connection-reference
  mapping, and deployment approval in a later slice.

## Progress log

- 2026-09-20: Started after the local lifecycle completed. PAC capability
  inspection was read-only; no tenant command was executed.
- 2026-09-20: Implemented the typed PAC command model, local runner port,
  deterministic release command plan, integrated `pac-plan` CLI command, and
  apply-gate tests. No provider mutation was executed.

## Decision log

- 2026-09-20: Provider commands are modeled behind a typed runner port before
  any live adapter is allowed to mutate Power Platform.
- 2026-09-20: The existing direct deployment scripts remain separate until a
  provider adapter proves equivalent behavior.

## Completion notes

The provider adapter boundary is complete for this slice. PAC commands can be
planned and tested through a fake runner, while mutation-capable commands are
blocked unless an explicit apply flag is passed. A verified unpacked solution
source and a separately authorized target-environment deployment are still
required before live import.
