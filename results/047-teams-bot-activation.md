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
  and changed the Teams package display name to `LandOps`.

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
- `npm test`: passed, 131 tests.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false`: passed; existing IdentityModel version warnings remain.
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
- `git diff --check`: passed.
- Repository content review for public-safe wording: passed with no
  job-specific or company-specific activation context.

## Deviations from the spec

The first Bot Service attempt used the deprecated `MultiTenant` bot type and
was rejected. The deployment was corrected to `SingleTenant` and the
provisional Azure Bot resource plus `MsTeamsChannel` were created successfully.
The bot app currently belongs to the Azure subscription tenant; this session
has no active authenticated Microsoft 365 tenant session for creating the
single-tenant app that the Teams installation tenant should own. No Teams
package upload or live mention is claimed as complete.

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

- Authenticate to the configured Microsoft 365 tenant and create the
  single-tenant bot application there, then replace the provisional Bot
  Service app ID/credential without committing secrets.
- Reconfigure the Bot Service resource and Teams channel using that app and the
  existing adapter endpoint.
- Resolve the cross-tenant API application-role consent for the adapter
  credential, without adding broad Graph permissions.
- Build the final-icon package, upload it in Teams, and run the mention,
  Workroom action, duplicate-activity, and rollback/version smoke tests.
- Revoke unused bot credentials and cancel the paid trial before its renewal
  date if the environment is no longer needed.
