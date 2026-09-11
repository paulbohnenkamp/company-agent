---
id: 056-company-agent-repository-rename
title: Rename the repository and current product language to Company Agent
status: completed
completed: 2026-09-11
spec: specs/056-company-agent-repository-rename.md
---

## What changed

- Renamed the GitHub repository to `paulbohnenkamp/company-agent`.
- Renamed the local checkout to `/Users/paul/code/company-agent`.
- Renamed the npm package and lockfile root package to `company-agent`.
- Updated current product-facing documentation, configuration, tests, and
  repository-specific paths to use Company Agent or `company-agent`.
- Renamed the current glossary file to `docs/company-agent-glossary.md`.
- Preserved historical specs/results and compatibility identifiers.

## Files changed

- `README.md`
- `AGENTS.md`
- `package.json`, `package-lock.json`, and `.env.example`
- Current documentation and glossary path
- Repository-specific source paths and tests
- `plans/`, `specs/`, and `results/` execution records
- GitHub remote and local checkout path

## Checks run and results

- `node --version` — passed, v24.14.1.
- `npm run typecheck` — passed.
- `npm test` — passed, 121 tests.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false` — passed, 39 tests.
- `npm run validate:records` — passed.
- `npm run validate:agent-artifacts` — passed, 13 agents.
- `npm run validate:identity-personas` — passed, 14 personas.
- `npm run validate:naming` — passed.
- `az bicep build --file infra/main.bicep --stdout` — passed.
- `git diff --check` — passed.
- Active-file search found no remaining `business-agent`, `Business Agent`, or
  `BUSINESS_AGENT` references outside historical records.
- Git remote points to `https://github.com/paulbohnenkamp/company-agent.git`.

## Deviations from the spec

None. The Microsoft Teams/Copilot Studio agent remains Mountaineer, and Azure
resources, API routes, database schemas, and historical records retain their
compatibility names as approved.

## Important decisions

- Company Agent is the current repository and product-facing name.
- `company-agent` is the repository/package/path identifier.
- Historical records remain unchanged so the execution history remains
  trustworthy.
- Existing infrastructure identifiers were not renamed as part of this
  repository change.

## Remaining follow-ups

- Rename the Teams/Copilot Studio agent separately if that product decision is
  approved.
- Migrate Azure resource and environment identifiers only through a separate
  deployment plan if needed.
