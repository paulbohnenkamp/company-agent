---
id: 047-teams-bot-activation
title: Teams adapter deployment foundation
status: completed
created: 2026-09-07
updated: 2026-09-08
result: results/047-teams-bot-activation.md
---

# Spec 047: Teams bot activation and Azure deployment

Status: completed
Owner: LandOps
Version: 1.0.0
Approved: 2026-09-07
Result: `results/047-teams-bot-activation.md`

## Goal

Deploy and verify the smallest real Teams transport foundation for the LandOps
demo. The transport must receive Teams activities over HTTPS, have the
authenticated API contract wired, and be documented for the remaining tenant
Bot Service activation.

## Non-goals

- Redesign the Next.js information architecture or user interface.
- Move authorization, evidence rules, persistence, or approval into Teams,
  Next.js, or a provider adapter.
- Add directory-wide Graph permissions or extra agent accounts.
- Deploy Foundry changes or alter land-domain semantics.
- Claim production Teams readiness when tenant upload, consent, endpoint, or
  live mention verification is incomplete.

## Current-state findings

- The repository already has a local Teams adapter and deterministic playbook
  HTTP end-to-end tests.
- The Teams tenant has `LandOps Demo`, `landops-demo`, and two licensed sample
  users. Custom app upload is now available.
- The Azure subscription tenant and Microsoft 365 tenant are separate; their
  IDs are deployment inputs and are not required in the source repository.
- The API is already hosted in `rg-landops-dev` and uses the existing B1
  App Service plan, SQL, Key Vault, ACR, and managed identity resources.
- The existing adapter currently uses local-only identity headers and has no
  deployed health endpoint. Production mode must replace that with a bearer
  workload token while retaining the API as the authorization boundary.

## Chosen approach

Use a separate Teams adapter App Service on the existing B1 plan. Register a
single-tenant bot app in the Microsoft 365 tenant that owns the Teams demo,
configure an Azure Bot resource for the adapter HTTPS endpoint, store its
client secret through the existing Key Vault, and grant the bot app only the
API application role needed to invoke Workroom operations. Install the
resulting package in that tenant after the endpoint and package are verified.

The two tenants are deliberately represented as separate trust domains. The
adapter maps Teams activity identity to the API request context; it never
authorizes a request from unsigned tenant or user headers.

## Alternatives considered

1. Register the bot in the Azure subscription tenant. Rejected for this slice:
   it would make a single-tenant bot unsuitable for installation in the
   separate Microsoft 365 tenant used by the demo.
2. Run the adapter locally with a tunnel. Rejected as the completion path:
   it is useful for debugging but not durable for a shared tenant demo or
   recreation guide.
3. Add Teams logic to the Next.js app. Rejected because Teams transport and
   API authorization are separate boundaries in the project architecture.

## Affected files or modules

- `infra/main.bicep`, `azure.yaml`, and adapter container files.
- `src/teams/server.ts` and its typed API client boundary.
- `teams-app/manifest.template.json` and package builder inputs.
- `docs/azure-recreation.md`, `docs/teams-live-activation.md`, and
  `docs/PROJECT_STATE.md`.
- Azure resources and Entra application metadata recorded in the result; no
  credentials are committed.

## Milestones

1. Implement and locally verify the authenticated adapter and health route.
2. Add and validate Bicep/AZD service wiring and Key Vault references.
3. Validate the Azure project and provision the adapter resources.
4. Register/configure the bot app and API application role.
5. Build, upload, and smoke-test the Teams package.
6. Record verification, remaining external blockers, and recreation steps.

## Acceptance criteria

- `/health` returns a successful readiness response from the deployed adapter.
- `/api/messages` is exposed over HTTPS and configured as the bot endpoint.
- Adapter-to-API calls use a bearer token in deployed mode; unsigned headers
  are not an authorization path.
- Bicep and AZD metadata are validated and documented sufficiently to recreate
  the deployment without relying on chat history.
- The deployment foundation is complete even though tenant Bot Service
  registration, package upload, and live mention testing remain a follow-up.
- All required local and Azure verification commands pass.

## Verification commands

```sh
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
azd config list
azd provision --preview
bash /Users/paul/.agents/skills/azure-validate/references/scripts/workflow.sh --workspace-path /Users/paul/code/business-agent
git diff --check
```

## Risks and open questions

- Teams tenant consent and app upload remain external UI operations.
- Azure Bot resource/provider behavior can vary by subscription and may require
  a portal step not expressible in the current Bicep API version.
- The Business Basic trial must be canceled before 2026-10-06 if the demo is
  not retained.
- No production secret rotation is included; the recreation guide must state
  how to replace the first credential safely.

## Progress log

- 2026-09-07: Deployment plan approved; cross-tenant bot-home approach chosen.
- 2026-09-07: Implementation begins from approved scope.
- 2026-09-08: Teams App Service deployed and `/health` verified over HTTPS.
- 2026-09-08: Azure Bot creation blocked because `MultiTenant` is deprecated;
  a single-tenant bot app must be created in the Microsoft 365 tenant. The
  remaining live gate is recorded as a follow-up rather than hidden in a
  completed deployment claim.

## Decision log

- 2026-09-07: Reuse the existing B1 plan to minimize cost and resource churn.
- 2026-09-07: Use a single-tenant bot app in the Microsoft 365 demo tenant;
  keep the Azure workload and API in the subscription tenant.
- 2026-09-07: Preserve API-owned authorization; adapter identity headers remain
  diagnostic context only and cannot satisfy deployed authentication.
