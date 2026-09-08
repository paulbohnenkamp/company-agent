---
id: 049-remove-legacy-landops-naming
title: Remove legacy LandOps naming from active code and documentation
status: approved
created: 2026-09-08
updated: 2026-09-08
result: results/049-remove-legacy-landops-naming.md
---

## Goal

Make Business Agent the short, consistent product name throughout active source
code and current documentation. Remove unnecessary LandOps naming and reduce
the documentation surface to the small set of accurate guides needed to run,
verify, deploy, and recreate the project.

## Non-goals

- Do not rename live Azure resources, existing database tables, persisted IDs,
  deployed app settings, or published routes without a migration plan.
- Do not rewrite historical execution records or screenshots.
- Do not change product architecture, evidence rules, authorization, or Teams
  identity as part of a naming cleanup.
- Do not remove compatibility aliases until callers and deployment inputs have
  migrated and a rollback path exists.
- Do not remove the Next.js/React web application. It is part of the target
  Business Agent application.
- Do not remove the TypeScript Teams transport solely because it is TypeScript;
  it may remain as a thin adapter while the ASP.NET Core API owns business
  behavior.

## Current-state findings

- LandOps remains in namespaces, class names, environment variables, routes,
  application-role values, Azure resource names, and documentation.
- Workroom remains as a separate legacy wire/storage identifier.
- The older TypeScript business/runtime implementation is a temporary behavioral
  reference and offline fallback. It is not the long-term application boundary.
- Next.js/React is the target web surface and must remain available while the
  C#/.NET application becomes the canonical business boundary.
- Current documentation repeats compatibility history and is larger than the
  current product needs.
- A global replacement would break deployed configuration, persisted records,
  migrations, and external URLs.

## Chosen approach

1. Inventory active-code, configuration, test, README, and documentation
   references and classify each as public text, active identifier,
   compatibility alias, immutable external name, or historical record.
2. Rename active internal namespaces, classes, configuration aliases, and
   application-facing labels where compatibility shims can preserve contracts.
3. Migrate callers first, then remove obsolete active names. Keep old inputs
   only as explicitly documented aliases during the migration window.
4. Treat the C#/.NET application and ASP.NET Core API as the canonical product
   boundary. Keep Next.js/React and the TypeScript Teams transport as supported
   presentation/transport layers, but plan the older TypeScript business/runtime
   modules for retirement after equivalent .NET behavior is verified.
5. Leave immutable Azure resource names, database schema identifiers, persisted
   IDs, and historical records unchanged unless a separate migration proves it
   is safe.
6. Consolidate current docs into a concise README, project state, local run
   guide, deployment/recreation guide, Teams activation guide, naming guide,
   and execution-record instructions. Clearly label superseded history.
7. Run a public-content sweep for interview, job-description, and obsolete
   branding language.

## Alternatives considered

- Global search-and-replace: rejected because it breaks compatibility contracts.
- Leave all legacy names in place: rejected because the product remains
  confusingly branded and the docs remain unnecessarily large.
- Rename Azure resources first: rejected because resource renames are not a
  safe cosmetic operation.

## Affected files or modules

Active C# namespaces and types, legacy TypeScript business/runtime modules,
TypeScript service/configuration names, Next.js/React references, environment-
variable documentation, tests, README, project state, deployment and
recreation guides, Teams documentation, and current naming records. Azure
resource names and database migrations require explicit compatibility review.

## Milestones

1. Complete the reference inventory and compatibility classification.
2. Define canonical Business Agent names and migration aliases.
3. Migrate active callers and tests, then remove obsolete active names.
4. Consolidate and shorten current documentation.
5. Run naming/content checks, tests, and deployment dry-run validation.
6. Update the result and project state; commit only verified migration work.

## Acceptance criteria

- Current product code and public documentation use Business Agent consistently.
- No unnecessary LandOps references remain in active code, current README, or
  current operational guides.
- Retained references are classified as immutable external names,
  compatibility aliases, migration notes, or historical records.
- Existing deployed routes, resource names, persisted records, and credentials
  continue to work during migration.
- The Next.js/React web surface remains runnable, and the TypeScript Teams
  transport remains a thin API adapter unless a separate approved migration
  replaces it.
- The older TypeScript business/runtime modules have either been retired after
  .NET parity verification or are explicitly marked as temporary fallback code.
- The current documentation set is materially smaller and has clear entry
  points for local execution, deployment, recreation, Teams activation, and
  execution records.
- Public-content review finds no interview, job-description, or obsolete
  company-branding language.
- All tests, validators, Bicep checks, and diff checks pass.

## Verification commands

```sh
node --version
npm run typecheck
npm test
npm run build
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
npm run validate:records
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
az bicep build --file infra/main.bicep --stdout
git diff --check
```

Also run a scoped `rg` audit over active source and current docs, inspect the
rendered README and Teams page, and run `azd provision --preview` before
changing deployment identifiers.

## Risks and open questions

- Namespace and configuration renames can break external deployments.
- Compatibility aliases need an explicit removal condition.
- Historical records may retain LandOps wording and must not be silently
  rewritten.
- The inventory must define which documents are current versus historical.

## Progress log

- 2026-09-08: Approved after concluding that LandOps is too narrow for the
  Business Agent product and the current documentation is too large.

## Decision log

- 2026-09-08: Treat this as a compatibility-aware migration, not a global text
  replacement.
- 2026-09-08: Preserve immutable external identifiers only when required for
  recreation, migration, or historical integrity.
