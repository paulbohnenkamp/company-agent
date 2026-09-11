---
id: 056-company-agent-repository-rename
title: Rename the repository and current product language to Company Agent
status: completed
created: 2026-09-11
updated: 2026-09-11
result: results/056-company-agent-repository-rename.md
---

## Goal

Rename the repository from `business-agent` to `company-agent` and align
current product-facing repository language with Company Agent.

## Scope

- Rename the GitHub repository and local checkout.
- Rename the npm package and repository-specific workspace paths.
- Update current product-facing documentation and configuration from Business
  Agent to Company Agent where that wording names the product.
- Preserve historical specs and results as historical records.
- Preserve compatibility identifiers such as `LandOps`, `Workroom`, existing
  Azure resource names, deployment paths, and API contracts unless separately
  approved.

## Non-goals

- Rename the Microsoft Teams/Copilot Studio agent from Mountaineer.
- Rename Azure resources, deployment environments, API routes, or database
  schemas.
- Rewrite historical specs, results, or audit records.
- Change the domain model or implement a new land-administration demo.

## Current-state findings

- The GitHub repository is `paulbohnenkamp/business-agent`.
- The local checkout directory is `business-agent`.
- The npm package is named `business-agent`.
- Current documentation uses Business Agent as the product name, while the
  README now presents Company Agent.
- Historical records contain the old name and must remain readable.

## Chosen approach

- Rename the GitHub repository and local checkout to `company-agent`.
- Use `Company Agent` in current product-facing documentation and configuration.
- Use `company-agent` for repository and package identifiers.
- Keep Mountaineer as the current Teams/Copilot Studio agent name.
- Keep compatibility identifiers and historical records unchanged.

## Alternatives considered

- Rename only the GitHub repository: rejected because local package, paths, and
  current documentation would remain inconsistent.
- Rename every historical record: rejected because historical execution records
  should preserve the names used when they were created.
- Rename Azure and API compatibility identifiers: rejected because that would
  expand a repository rename into an infrastructure migration.

## Affected files or modules

- `README.md`
- `docs/`
- `package.json`, `package-lock.json`, and `.env.example`
- repository-specific TypeScript paths and tests
- `plans/`, `specs/`, and `results/` execution records
- GitHub repository metadata and local checkout path

## Milestones

1. Record the approved rename scope.
2. Rename current package, path, and product-facing references.
3. Rename the GitHub repository and local checkout.
4. Run repository verification.
5. Commit and push the completed rename.

## Risks and open questions

- External links to the old GitHub URL may rely on GitHub redirects; the local
  remote must be updated explicitly.
- Existing Azure resources and tenant configuration intentionally keep legacy
  names and may still display `LandOps` or `business-agent` identifiers.
- A future product simplification may change the Teams agent name separately.

## Acceptance criteria

- GitHub repository URL is `https://github.com/paulbohnenkamp/company-agent`.
- The local checkout directory is `company-agent`.
- `package.json` and `package-lock.json` use `company-agent` as the package name.
- Current README and documentation describe Company Agent consistently.
- Historical records remain intact.
- Required verification commands pass.
- Changes are committed and pushed to `main`.

## Verification

```sh
node --version
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
az bicep build --file infra/main.bicep --stdout
git diff --check
```

## Verification commands

The commands above are the authoritative verification commands for this spec.

## Progress log

- 2026-09-11: Approved scope confirmed with the repository owner.
- 2026-09-11: Renamed the GitHub repository, local checkout, package, current
  documentation, environment variables, and repository-specific paths.
- 2026-09-11: Verification passed and the completed change was pushed to
  `main`.

## Decision log

- 2026-09-11: Company Agent replaces Business Agent as the current repository
  and product-facing name.
- 2026-09-11: Historical records and compatibility identifiers remain
  unchanged.

## Completion notes

The repository is now `paulbohnenkamp/company-agent`, the local checkout is
`/Users/paul/code/company-agent`, and the npm package is `company-agent`.
Current product-facing language uses Company Agent. Mountaineer remains the
Teams/Copilot Studio agent name, and legacy identifiers remain unchanged.
