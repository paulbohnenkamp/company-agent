---
id: 047-teams-bot-activation
title: Teams adapter deployment foundation
status: completed
spec: specs/047-teams-bot-activation.md
completed: 2026-09-08
---

## What changed

- Added a separately hosted Teams adapter App Service to the existing Linux B1
  plan.
- Added the `/health` readiness route and production credential guard.
- Added the Entra client-credential API boundary; deployed mode sends a bearer
  token and local mode remains explicitly opt-in and unauthenticated.
- Added Key Vault references, managed-identity ACR pull, and the Teams adapter
  container build.
- Added Azure recreation documentation and a controlled Teams tenant-settings
  guide.
- Removed personal project-context wording from repository-facing documentation
  and established the Teams package display name as `Business Agent`.
- Created the separate `business-agent-bot` Azure Bot resource with the
  Microsoft 365 tenant app ID and tenant ID because the original bot's app ID
  is immutable.
- Added the new bot credential to Key Vault without replacing the legacy API
  credential, updated the adapter App Service references, restarted it, and
  reverified `/health`.
- Built and manually uploaded Teams package version 1.0.1 with the verified app
  ID, bot ID, endpoint, web URLs, and icons. It is installed in `Sample Energy
  Company` → `Operations`.
- Added the trusted adapter invocation boundary and aligned the live Teams
  defaults to the seeded ownership playbook: case
  `synthetic-blue-ridge-lease-001`, scenario `land-ownership-gaps`, role
  `land-analyst`, and group `case-management`.
- Added a deterministic regression test for that exact Teams playbook and
  deployed the API after fixing the transient post-deployment SQL warm-up
  failure.

## Files changed

- `src/teams/server.ts`
- `src/teams/landops-client.ts`
- `teams.Dockerfile`
- `package.json`, `package-lock.json`
- `infra/main.bicep`, `azure.yaml`
- `.azure/deployment-plan.md`
- `docs/azure-recreation.md`
- `docs/teams-live-activation.md`
- `docs/teams-tenant-settings.md`
- `docs/PROJECT_STATE.md`
- `specs/047-teams-bot-activation.md`

## Checks run and results

- `npm run typecheck`: passed.
- `npm test`: passed, 136 tests.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed; 41 tests across the solution; existing IdentityModel version warnings remain.
- `npm run validate:records`: passed after this result was added.
- `az bicep build --file infra/main.bicep --stdout`: passed.
- `azd config list`: passed.
- `azd provision --preview --no-prompt`: passed; no deletes were shown.
- ARM deployment `landops-teams-activation`: created the adapter resources; its
  first Bot Service attempt correctly failed on deprecated `MultiTenant`.
- ARM deployment `landops-teams-bot-singletenant-fixed`: succeeded and created
  the provisional single-tenant Bot Service plus `MsTeamsChannel`.
- ACR remote build of the Teams image: succeeded with immutable tag
  `azd-deploy-1788834989`.
- Managed-identity ACR pull: initially failed because the Teams `AcrPull`
  assignment was missing; the assignment was added to Bicep and Azure.
- `GET https://landops-masoqbs4-teams.azurewebsites.net/health`: passed with
  `{"status":"ok","service":"landops-teams-adapter"}`.
- Existing resource inspection: passed; the legacy bot remains unchanged and
  the new `business-agent-bot` resource reports the Microsoft 365 app ID,
  Microsoft 365 `msaAppTenantId`, enabled Teams channel, and the adapter
  endpoint.
- Key Vault metadata inspection: passed; the new bot secret is enabled and
  its value was never emitted.
- Adapter rebind: passed; `CLIENT_ID` and `CLIENT_SECRET` now reference the
  new bot identity while `LANDOPS_API_*` continues to use the legacy API
  identity.
- Post-rebind health: passed with HTTP 200.
- Fixed the Teams App Service Key Vault reference identity to use its
  user-assigned managed identity in Bicep and Azure. Post-restart health then
  returned HTTP 200.
- Teams package build: passed; manifest version 1.0.1 has no placeholder IDs,
  `example.test` URLs, or old product/company branding. The generated Teams
  app ID is `ec935811-5929-4912-9b2c-6fb793737663`; its bot ID is
  `255d579b-5c6f-4e8c-b1c8-be090cfcbd2a`.
- `git diff --check`: passed.
- Repository content review for public-safe wording: passed with no
  job-specific or company-specific activation context.
- Live Teams mention: passed on attempt 17. The adapter received the activity,
  created and ran the ownership review thread, and returned five findings from
  five sources with the explicit human-review boundary. The reply packet linked
  to the review packet in the deployed web application.

The adapter now formats the same packet as one Teams reply containing the
ordered agent path, numbered specialist contributions, all findings, and all
open questions. The contribution data is structured in the API packet so each
summary can retain its supporting record IDs and unknowns.

After the first formatter deployment, the API image was found to be serving
the older packet shape without `contributions`. The API was rebuilt with an
explicit packet-shape regression test and redeployed. The live scenario-run
response now includes all three contributions and their supporting record IDs.

## Deviations from the spec

The first Bot Service attempt used the deprecated `MultiTenant` bot type and
was rejected. The original Bot Service app ID could not be changed in place.
The original resource was preserved, and a separate `business-agent-bot`
resource was created with the Microsoft 365 tenant app ID and tenant ID. The
package upload and read-only live mention are complete; the legacy bot remains
retained for compatibility and is not part of the active package path.

## Important decisions

- The Teams adapter remains separate from Next.js and ASP.NET Core.
- API authorization remains owned by ASP.NET Core; Teams headers are diagnostic
  context only.
- The existing web/API image tags were preserved during ARM deployment after
  the AZD preview exposed image drift.
- A missing ACR role was fixed at the Bicep source and Azure resource boundary,
  not by enabling registry admin credentials.
- The Team privacy recommendation is Private for controlled testing. Teams
  “Public” means discoverable/joinable inside the tenant, not internet-public.

## Remaining follow-ups

- Run the remaining live human-action authorization and duplicate-activity
  checks. The evidence-backed mention path is complete; these checks remain
  explicitly separate because they require additional Teams activity control.
- Review whether any additional admin consent is needed; the adapter keeps its
  API workload credential separate from the Teams bot identity and the bot app
  currently requests only delegated `User.Read`.
- Revoke unused bot credentials and cancel the paid trial before its renewal
  date if the environment is no longer needed.
