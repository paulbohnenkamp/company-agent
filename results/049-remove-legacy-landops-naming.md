---
id: 049-remove-legacy-landops-naming
title: Remove legacy LandOps naming from active code and documentation
status: completed
spec: specs/049-remove-legacy-landops-naming.md
completed: 2026-09-08
---

## What changed

- Renamed active web modules from `src/landops` to `src/business-agent` and
  renamed the Teams adapter/client modules and their tests.
- Renamed C# internal namespaces and application-facing infrastructure types
  to `BusinessAgent`, including the API identity resolver and EF context.
- Added canonical Business Agent configuration settings and environment
  inputs, with explicit `LandOps` fallbacks for deployed clients and existing
  environments.
- Preserved `/api/landops`, Workroom routes and payloads, Azure resource names,
  database names, migration metadata, and the `LandOps.Workroom.Invoke` role as
  compatibility identifiers. Added a narrow EF context alias so existing
  migration snapshots continue to compile.
- Renamed current documentation paths and updated the documentation map and
  project state. Removed obsolete public portfolio/interview wording and
  stale active source paths from current guides.
- Extended the naming validator to prove the new active paths exist and the
  obsolete internal paths are absent.

## Files changed

The migration spans the web and Teams adapters, .NET namespaces and tests,
configuration examples, current documentation/navigation, naming validation,
and the project state. Historical execution records and persisted/schema
identifiers were not rewritten.

## Checks run and results

- `node --version`: passed, v24.14.1.
- `npm run typecheck`: passed.
- `npm test`: passed, 137 tests.
- `npm run build`: passed with Next.js 16.3.3.
- `npm run validate:agent-artifacts`: passed, 13 artifacts.
- `npm run validate:identity-personas`: passed, 14 personas.
- `npm run validate:naming`: passed, including active-path checks.
- `npm run validate:records`: passed.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed, 41 tests.
- `az bicep build --file infra/main.bicep --stdout`: passed.
- `azd provision --preview`: passed without applying changes; existing
  LandOps resources were preserved in the preview.
- `git diff --check`: passed.
- Scoped current-source/current-guide audit: passed; remaining legacy names
  are compatibility inputs, routes, resources, schema/migration identifiers,
  permission values, or explicit validator checks.

## Deviations from the spec

The C# project and directory names remain `LandOps.*` because the solution,
Docker publish paths, deployed assembly names, and Azure deployment inputs are
operational compatibility boundaries. Their namespaces and runtime types now
use Business Agent names. The Workroom-to-agent-request wire/storage migration
remains deferred as required by the non-goals.

## Important decisions

- Canonical internal code names may change independently of stable external
  identifiers.
- The EF context alias is retained only for migration snapshot compilation;
  new application code must use `BusinessAgentDbContext`.
- Current documentation points to Business Agent-named paths; historical
  records remain unchanged evidence of earlier naming.

## Remaining follow-ups

- Plan and execute any future API/SQL/resource identifier migration separately,
  including rollback and deployed-client compatibility verification.
- Continue with spec 050, the next approved slice.
