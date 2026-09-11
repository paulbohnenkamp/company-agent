---
id: 054-microsoft-native-agent-routing
title: Adopt Microsoft-native Business Agent routing
status: completed
spec: specs/054-microsoft-native-agent-routing.md
completed: 2026-09-09
---

## What changed

- Retired the custom Bot Framework Teams adapter, Teams package, and Teams
  App Service from the active repository deployment path.
- Made Mountaineer the documented user-facing Copilot Studio/Teams agent name
  and kept Business Agent as the C# application/API boundary.
- Removed the canned scenario-run API endpoint from the active API surface.
- Prevented deterministic conversation and workroom providers from starting
  outside Development; production configuration uses the Foundry/provider
  path.
- Changed the Foundry workroom service so it no longer uses
  `FictionalReviewPacketSeed` as a production baseline. Model output is
  validated against records available for the requested case.
- Added the Copilot Studio integration boundary, native topic/agent wording,
  authenticated API-tool responsibilities, tenant capability check, Teams
  activation guidance, and rollback guidance.
- Preserved deterministic backend mechanics, fixtures, fake providers,
  contract tests, and evaluation datasets.

## Files changed

Implementation and configuration:

- `dotnet/LandOps.Api/Program.cs`
- `dotnet/LandOps.Api/appsettings.json`
- `dotnet/LandOps.Application/WorkroomExecution.cs`
- `dotnet/LandOps.Application/RoleScenarios.cs`
- `dotnet/LandOps.Api/Identity.cs`
- `dotnet/LandOps.Api.Tests/ApiTests.cs`
- `azure.yaml`, `infra/main.bicep`, `infra/main.parameters.json`
- `package.json`, `package-lock.json`
- `scripts/validate-naming.ts`
- `tests/documentation.test.ts`, `tests/product-naming.test.ts`

Retired custom surface:

- `src/teams/`
- `teams-app/`
- `teams.Dockerfile`
- `scripts/build-teams-app-package.ts`
- `tests/teams-adapter.test.ts`

Documentation and records:

- `README.md`, `docs/PROJECT_STATE.md`, `docs/README.md`
- `docs/copilot-studio-integration.md`, `docs/teams-architecture.md`
- `docs/teams-development.md`, `docs/teams-live-activation.md`
- `docs/azure-recreation.md`, `docs/microsoft-foundry-standards.md`
- `docs/product-naming.md`
- `specs/054-microsoft-native-agent-routing.md`

The existing Azure Bot and App Service resources were not changed directly.
They are no longer declared as active services in the repository deployment
manifest.

## Requirements checklist

- [x] Remove fixed Teams-side scenario selection from the active Teams path.
- [x] Remove canned production scenario-run responses.
- [x] Preserve deterministic backend mechanics and verification assets.
- [x] Define Copilot Studio native agent/topic/tool boundaries without invented
      routing syntax.
- [x] Keep C# authorization, evidence, persistence, and human approval as the
      application boundary.
- [x] Add ambiguity/refusal/authorization/grounding/approval guidance through
      the API and provider contracts already in the repository.
- [x] Document observable routing evaluation requirements without claiming
      hidden reasoning traces.
- [x] Document Teams publication, tenant sharing, local development, smoke
      testing, rollback, and provider limitations.
- [x] Preserve spec 050 as superseded historical evidence.
- [x] Live tenant capability check, Copilot Studio authoring, publication, and
      `@Mountaineer` smoke test: passed in a controlled Teams channel after
      connecting all six tenant-side v5 connection rows.

## Checks run and results

- `node --version` — passed, Node v24.14.1.
- `npm run typecheck` — passed.
- `npm test` — passed, 121/121 tests.
- `dotnet build dotnet/LandOps.sln --no-restore` — passed, 0 warnings/errors.
- `npm run validate:records` — passed.
- `npm run validate:agent-artifacts` — passed, 13 agents.
- `npm run validate:identity-personas` — passed, 14 personas.
- `npm run validate:naming` — passed.
- `az bicep build --file infra/main.bicep --stdout` — passed.
- `git diff --check` — passed.
- Full `dotnet test` — passed, 39/39 tests across Domain, Application, and API
  projects after restarting the existing local `landops-sqlserver` container.
- Active API deployment validation — passed; Azure provisioning and deployment
  completed for the isolated `mountaineer-dev` environment.
- 2026-09-10 API rebuild and deployment — passed. The API seed now includes the
  synthetic Braxton data-room record and idempotent WVDEP/WVGES evidence seed.
  Image `api-mountaineer-dev:azd-deploy-1789074697` is live at
  `https://mountaineer-7pxfuiyt-api.azurewebsites.net/`.
- 2026-09-10 live case validation — passed: `/health`, the Braxton case,
  Braxton data-room, and Braxton evidence returned HTTP 200. The evidence
  response preserved separate WVDEP and WVGES publishers. Runtime migrations
  are disabled after the explicit SQL migration/seed step.
- 2026-09-10 Copilot Studio and Teams validation — passed. Mountaineer is
  published and installed in a controlled Teams channel. Preview and Teams
  read-only smoke tests completed after all six tenant-side v5 connection rows
  were connected. The six-row connection behavior remains a tenant cleanup
  item; it is not represented as one reusable connection.
- `azd provision --no-prompt` — passed; created the API-only stack in
  `rg-mountaineer-dev`.
- The initial API-only deployment at `https://landops-7pxfuiyt-api.azurewebsites.net`
  was intentionally removed because its generated names retained the legacy
  `landops` prefix.
- Corrected Mountaineer naming is now in `azure.yaml` and `infra/main.bicep`.
  The deployed resources use the `mountaineer` prefix and the application
  database is `Mountaineer`.
- `azd provision --no-prompt` — passed; created the API App Service and
  supporting resources in `rg-mountaineer-dev`.
- `azd deploy --no-prompt` — passed; deployed image
  `mountaineer-workbench/api-mountaineer-dev:azd-deploy-1788994995`.
- Live endpoint: `https://mountaineer-7pxfuiyt-api.azurewebsites.net/`.
- Live health check: `GET /health` returned HTTP 200 and `{"status":"ok"}`.
- Added and verified the read-only OpenAPI contract at
  `https://mountaineer-7pxfuiyt-api.azurewebsites.net/openapi.json`.
- Copilot Studio agent `Mountaineer` was created in `DecisionForge (default)`
  under the tenant-native account, with description and instructions saved.
- Copilot Studio tool import, Preview/activity-map, Teams publication, routing
  evaluation, and live rollback checks remain pending. The agent is intentionally
  unpublished until the authenticated API tool is configured and tested.
- On 2026-09-09, the Copilot Studio create screen returned HTTP 400 with
  `cdsBotId: The value 'new' is not valid.` and trace ID
  `0HNE08B3RK099N:00001249` when **Agent — Standard** was selected. The error
  occurred before agent creation and is recorded as a Copilot Studio authoring
  or tenant-service blocker, not an API or Azure application failure.

## Deviations from the spec

The live Copilot Studio and Teams acceptance criteria could not be executed
without tenant access. No provider success or live publication is claimed.
The repository provides the documented boundary and API contracts for the
external phase.

## Important decisions

- Copilot Studio owns conversational orchestration; the API owns serious
  business work and deterministic evidence mechanics.
- Native description-based selection and the native “The agent chooses” topic
  trigger are used in the documentation; “Route to the agent when…” is not
  treated as a Microsoft configuration field.
- Existing internal WV workflow stages remain an API workflow unless future
  evidence justifies separate child/connected agents.
- Existing Azure Bot resources were left in place to avoid changing live cloud
  state during this repository migration.
- The new API deployment uses a separate `mountaineer-dev` resource group;
  Microsoft 365 users, Teams, and channels were not recreated or changed.

## Provider and tenant verification status

Repository status: complete for the provider boundary, production safeguards,
API contract, documentation, and local verification.

Tenant status: not verified. A tenant administrator must confirm the selected
Copilot Studio authoring experience, configure Mountaineer, enable generative
orchestration, publish to Teams, and run the activation sequence.

## Rollback instructions

Do not deploy the new `azure.yaml` shape until the Copilot Studio API-tool path
is ready. The prior repository state is commit `9a65a7c`; the active cleanup and
implementation changes are inspectable before commit. Existing Azure resources
were not directly deleted. If the new path fails after publication, unpublish
or disable the Mountaineer version and restore the previously verified agent
version; keep the API unchanged while investigating.

## Remaining follow-ups

- Configure and verify the Copilot Studio tenant experience and native agent,
  topic, and tool definitions.
- Run Preview/activity-map checks and a real `@Mountaineer` Teams smoke test.
- Start SQL Server or use the approved integration-test environment to run the
  full API test suite.
- Review whether the legacy Azure Bot/App Service should be removed after the
  new path is verified; that is a separate authorized cloud operation.
