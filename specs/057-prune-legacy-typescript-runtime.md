---
id: 057-prune-legacy-typescript-runtime
title: Prune the legacy TypeScript runtime
status: completed
created: 2026-09-11
updated: 2026-09-11
result: results/057-prune-legacy-typescript-runtime.md
---

## Goal

Keep Company Agent as a simple Microsoft Teams company assistant with the C#
application/API boundary. Remove the duplicate legacy TypeScript application
runtime and its tests after preserving an exact backup.

## Non-goals

- Do not remove TypeScript repository validation utilities.
- Do not change the C# API, domain model, Azure infrastructure, or Teams agent.
- Do not rewrite historical specs or results.
- Do not delete the backup created at `/Users/paul/code/company-agent-legacy-typescript`.

## Current-state findings

- The repository has a substantial TypeScript runtime under `src/` and a
  matching TypeScript test suite under `tests/`.
- The C# solution already owns the application boundary, persistence,
  authorization, and API workflow.
- `scripts/validate-*.ts`, `scripts/provision-entra-personas.ts`, and
  `scripts/validate-records.ts` remain useful repository tooling.
- `scripts/run-evals.ts` depends on the legacy TypeScript runtime and cannot
  remain after that runtime is removed.

## Chosen approach

- Create an exact backup of the current checkout before pruning.
- Remove the active `src/` and TypeScript `tests/` runtime/test surface.
- Remove the legacy TypeScript evaluation runner and obsolete npm commands.
- Keep TypeScript tooling needed to validate canonical repository artifacts.
- Update CI and current development documentation to use the C# verification
  path.

## Alternatives considered

- Keep both runtimes: rejected because two application centers make the system
  harder to explain and maintain.
- Rewrite all repository tooling in C# first: deferred because it expands the
  cleanup and is not needed to establish one application boundary.
- Delete TypeScript without a backup: rejected because the old runtime contains
  useful historical implementation material.

## Affected files or modules

- `src/`
- TypeScript `tests/`
- `scripts/run-evals.ts`
- `package.json`, `package-lock.json`, and `tsconfig.json`
- `.github/workflows/verify.yml`
- Current development documentation
- `plans/`, `specs/`, and `results/` execution records

## Milestones

1. Create and verify the legacy TypeScript backup.
2. Remove the duplicate runtime and tests.
3. Remove obsolete commands and dependencies.
4. Update current verification guidance and CI.
5. Run the C# and repository-tooling verification.
6. Record, commit, and push the result.

## Acceptance criteria

- The backup exists and contains the pre-prune checkout.
- The active repository has no `src/` directory or legacy TypeScript test suite.
- The active runtime boundary is the C# solution and API.
- Canonical agent, skill, persona, naming, and execution-record validation still
  works.
- C# tests and build validation pass.
- Current documentation does not instruct users to run removed TypeScript tests
  or evaluation commands.

## Verification commands

```sh
test -d /Users/paul/code/company-agent-legacy-typescript
node --version
npm run typecheck
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
az bicep build --file infra/main.bicep --stdout
git diff --check
```

## Risks and open questions

- Historical records will still describe the removed TypeScript runtime; they
  remain historical evidence rather than current instructions.
- The TypeScript validation utilities remain a small Node.js toolchain and may
  be migrated later if maintaining two languages for tooling is still costly.

## Progress log

- 2026-09-11: Scope approved. Exact backup creation started.
- 2026-09-11: Exact pre-prune checkout backed up to
  `/Users/paul/code/company-agent-legacy-typescript`.
- 2026-09-11: Removed the duplicate TypeScript runtime, tests, and evaluator;
  retained repository validation and identity scripts.
- 2026-09-11: Reduced verification passed and the change is ready to commit.

## Decision log

- 2026-09-11: C# remains the sole application/API boundary.
- 2026-09-11: Preserve repository validation utilities while removing the
  duplicate application runtime and its tests.

## Completion notes

The active repository now has one application boundary: the C# solution under
`dotnet/`. The former TypeScript application and tests remain available in the
exact backup directory. Node.js remains only for repository tooling that
validates canonical artifacts and configuration.
