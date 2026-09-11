---
id: 057-prune-legacy-typescript-runtime
title: Prune the legacy TypeScript runtime
status: completed
completed: 2026-09-11
spec: specs/057-prune-legacy-typescript-runtime.md
---

## What changed

- Created an exact backup at
  `/Users/paul/code/company-agent-legacy-typescript` before pruning.
- Removed the duplicate TypeScript application runtime under `src/`.
- Removed the TypeScript test suite under `tests/`.
- Removed `scripts/run-evals.ts`, which depended on the removed runtime.
- Removed obsolete npm commands and unused TypeScript runtime dependencies.
- Kept the TypeScript repository tools for agent artifacts, personas, naming,
  execution records, and Entra provisioning.
- Updated TypeScript configuration, CI, development documentation, and current
  architecture notes to reflect the C# application boundary.

## Files changed

- `src/` and `tests/`
- `scripts/run-evals.ts`
- `package.json`, `package-lock.json`, and `tsconfig.json`
- `.github/workflows/verify.yml`
- `.env.example`
- Current documentation and validation scripts
- `plans/`, `specs/`, and `results/` execution records

## Checks run and results

- Backup verification — passed; backup size 1.7 GB.
- `node --version` — passed, v24.14.1.
- `npm run typecheck` — passed.
- `npm run validate:agent-artifacts` — passed, 13 agents.
- `npm run validate:identity-personas` — passed, 14 personas.
- `npm run validate:naming` — passed.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false` — passed, 39 tests.
- `az bicep build --file infra/main.bicep --stdout` — passed.
- `git diff --check` — passed.

## Deviations from the spec

None. The C# application/API, Azure infrastructure, Teams agent, and
compatibility identifiers were preserved.

## Important decisions

- The C# solution is the sole active application boundary.
- TypeScript remains only where it provides small repository-validation or
  identity-provisioning utilities.
- The old runtime is recoverable from the explicit pre-prune backup.

## Remaining follow-ups

- Decide later whether the remaining TypeScript repository tools should also be
  migrated to C#.
- Replace the legacy WV-specific demo with a first-class land-administration
  demo in a separate approved spec.
