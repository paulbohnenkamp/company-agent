---
id: 052-teams-app-core
title: Reduce Business Agent to the Teams app core
status: completed
spec: specs/052-teams-app-core.md
completed: 2026-09-09
---

## What changed

- Created `feature/teams-app-core` from checkpoint commit `fc76ba7`.
- Removed the Next.js/React web and administration surface, including `app/`,
  `src/business-agent/`, Next configuration, web Dockerfile, and web-only tests.
- Removed Next/React/Fluent UI dependencies and web scripts from `package.json`.
- Reduced `azure.yaml` and `infra/main.bicep` to API and Teams services. Existing
  deployed web resources are not deleted or mutated by this branch.
- Updated the Teams manifest/package builder to use `--info-url` rather than a
  web application URL.
- Added concise Teams architecture and development guides and replaced the
  root README and documentation map with the Teams-first path.
- Removed non-Teams active documentation from the branch. The prior checkpoint
  commit preserves it for recovery and historical reference.
- Updated CI, naming validation, and documentation tests for the Teams-only
  surface.

## Files changed

The branch changes include product-surface deletions, package/configuration
updates, infrastructure composition, current documentation, tests, and
execution records. No external Azure resource or Teams tenant state was
changed.

## Checks run and results

- `npm run typecheck`: passed.
- `npm test`: passed, 128 tests.
- `dotnet build dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed.
- `dotnet test dotnet/LandOps.sln`: API integration tests could not connect to
  local SQL Server; domain and application tests passed. This is an environment
  prerequisite, not a web-removal failure.
- `npm run validate:records`: passed.
- `npm run validate:agent-artifacts`: passed, 13 agents.
- `npm run validate:identity-personas`: passed, 14 personas.
- `npm run validate:naming`: passed, 15 agent labels and 14 people.
- `az bicep build --file infra/main.bicep --stdout`: passed.
- `azd provision --preview --no-prompt`: passed; preview showed API and Teams
  services and skipped the existing web app without deleting it.
- `git diff --check`: passed.
- Local Markdown link check: passed.

## Deviations from the spec

The full .NET API test suite was not green because no SQL Server instance was
listening on the local test connection. The solution builds successfully and
all TypeScript tests and non-database checks pass.

## Important decisions

- Teams plus the ASP.NET Core API is the supported product surface on this
  branch.
- The old web app is removed from source and infrastructure composition, but
  existing deployed Azure resources are left untouched.
- The provider-neutral TypeScript runtime remains because the adapter,
  deterministic fixtures, and tests still depend on it.
- Historical product and domain documents are recoverable from `fc76ba7` and
  remain classified by `docs/history.md`.

## Remaining follow-ups

- Start the repository-supported SQL Server container and rerun the full .NET
  API test suite.
- Review and merge the branch when the Teams-only scope is accepted.
- Build future product documentation from the Teams architecture rather than
  restoring the removed web/admin surface.
