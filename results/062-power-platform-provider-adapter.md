---
id: 062-power-platform-provider-adapter
title: Company Agent Power Platform provider adapter
status: completed
spec: specs/062-power-platform-provider-adapter.md
completed: 2026-09-20
---

## What changed

- Added typed PAC command and result models with mutation classification.
- Added a local `PacRunner` port and process implementation.
- Added deterministic resource-pack, settings, checker, ordered import, and
  publish command planning.
- Added an explicit `--apply` gate preventing mutation commands from reaching
  the runner.
- Added the integrated `pac-plan` command.
- Added fake-runner tests for command order and mutation safety.

## Files changed

- `scripts/power-platform-adapter.ts`
- `scripts/company-agent-config-cli.ts`
- `tests/company-agent-config.test.ts`
- `package.json`
- `specs/062-power-platform-provider-adapter.md`
- `results/062-power-platform-provider-adapter.md`

## Checks run and results

- `pac solution --help` — passed; PAC 2.12.2 exposes the required solution
  commands.
- `npm run validate:records` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed; 12 tests.
- Integrated `pac-plan` — passed; resource import precedes agent import and
  mutation commands are marked `requires-apply`.
- `git diff --check` — passed.

## Deviations from the spec

- No actual solution package was built because the repository does not yet
  contain a verified unpacked Power Platform solution source tree.
- No live PAC runner command was executed; the runner was exercised only with a
  deterministic fake.

## Important decisions

- PAC command construction is separated from execution.
- `pack`, `create-settings`, and `check` are local-safe command plans;
  `import` and `publish` require explicit apply authorization.
- Existing direct deployment scripts remain unchanged.

## Remaining follow-ups

- Capture or establish the canonical unpacked resource and agent solutions.
- Generate and review real deployment settings for the target environment.
- Perform a separately authorized dev-environment import and smoke test.
- Add managed release, rollback verification, and cleanup execution only after
  the dev deployment is proven.
