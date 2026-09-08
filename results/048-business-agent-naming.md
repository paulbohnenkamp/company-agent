---
id: 048-business-agent-naming
title: Business Agent naming and information architecture
status: completed
spec: specs/048-business-agent-naming.md
completed: 2026-09-08
---

## What changed

- Established Business Agent as the application name and Sample Energy Company
  as the fictional organization context.
- Removed product-facing LandOps and Workroom wording from current web and Teams
  presentation. Kept those terms in routes, environment keys, storage names,
  and other compatibility identifiers.
- Changed the portfolio company and data-room display names, added named people
  with department labels, and changed the synthetic example domain to
  `sampleenergy.example`.
- Changed agent display names to short capability names ending in Agent. The
  C# company catalog now supplies the labels for UI and Teams responses.
- Updated the Teams package template to Business Agent and Sample Energy
  Company, and changed the illustrated Team to show General, Land, Legal,
  Accounting, Compliance, and Operations channels.
- Added the naming guide, tenant adoption guide, naming validator, and browser
  journey tests. The tenant guide records live changes without claiming that
  they have been applied.
- Fixed the Entra persona dry-run so an environment password is never printed.

## Files changed

The change spans the approved product presentation, synthetic identity catalog,
agent artifacts, Teams adapter formatting, Teams manifest, web example, Azure
recreation notes, and current documentation. New source records are:

- `docs/product-naming.md`
- `docs/tenant-naming-adoption.md`
- `scripts/validate-naming.ts`
- `tests/product-naming.test.ts`

No database migration, resource replacement, route rename, or Azure tenant
mutation was performed.

## Checks run and results

- `node --version`: passed, v24.14.1.
- `npm run typecheck`: passed.
- `npm test`: passed, 136 tests.
- `npm run build`: passed with Next.js 16.3.3.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed, 38 tests. Existing Microsoft.IdentityModel version warnings remain.
- `npm run validate:agent-artifacts`: passed, 13 artifacts.
- `npm run validate:identity-personas`: passed, 14 personas.
- `npm run validate:naming`: passed, 15 agent labels, 14 people, and Teams app naming.
- `npm run validate:records`: passed after this result was added.
- `npm run eval -- wv-land-well-reconciliation`: passed deterministic and harness checks; behavioral measurements were not collected because no external executor was supplied.
- `npm run provision:entra-personas`: passed in dry-run mode. It emitted dotted example aliases and no configured password.
- `az bicep build --file infra/main.bicep --stdout`: passed.
- `git diff --check`: passed.
- Browser smoke test against the built web app: passed company/persona load, agent-request creation, seeded review, Teams page copy, and no browser errors.
- Deployed Teams adapter health: passed with `{"status":"ok","service":"landops-teams-adapter"}`.

## Deviations from the spec

The live Microsoft 365 tenant was not renamed in this repository slice. Azure
CLI returned AADSTS50020 for the configured tenant, and no signed-in browser was
available. The tenant adoption guide records the target names and verification
steps as incomplete external work. The existing tenant domain remains unchanged.

The repository keeps `Workroom` in HTTP routes, EF Core table names, and related
configuration so stored records and deployed clients continue to work. Removing
those identifiers requires a separately approved API and database migration.

## Important decisions

- Teams is the collaboration environment. Business Agent is the application.
- Land is a department and current subject area. It is not the application name.
- Agent labels identify bounded capabilities. They do not represent separate
  Teams accounts or licensed bot identities.
- Stable IDs remain unchanged when a display name changes.
- Historical screenshots and records remain evidence of earlier states and are
  labeled as such.
- The current tenant is not replaced or given a new permanent fallback domain.

## Remaining follow-ups

- Apply the recorded user, Team, and channel display-name changes in Microsoft
  365 when an administrator session for that tenant is available.
- Complete the single-tenant bot app, consent, package installation, and live
  Teams mention/action smoke tests recorded in the activation guide.
- Plan any future Workroom-to-agent-request API and SQL migration separately.
- Replace the historical screenshots if a new approved visual capture is needed.
