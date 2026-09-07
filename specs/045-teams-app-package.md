---
id: 045-teams-app-package
title: Minimal Teams app package contract
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/045-teams-app-package.md
---

## Goal

Define the smallest Microsoft Teams app package for the LandOps channel demo.
The package must connect one real Teams bot identity to the existing
`src/teams/server.ts` transport without moving business behavior into Teams.

## Non-goals

- Creating the Entra bot application or an Azure Bot resource.
- Deploying the adapter or changing the existing Azure web and API services.
- Adding Teams tabs, message extensions, Copilot agents, or Graph permissions.
- Uploading an app package to the tenant from the repository.
- Claiming live Teams delivery before a real mention smoke test passes.

## Current-state findings

- The tenant has custom app upload enabled.
- The repository has a Teams SDK transport entrypoint but no Teams app package.
- The bot application ID and public adapter endpoint do not exist in the
  repository configuration.
- Microsoft requires a package ZIP containing a manifest and color and outline
  PNG icons. The bot manifest must name the real bot application ID and scopes.

## Chosen approach

1. Add a checked-in manifest template with explicit substitution tokens.
2. Add a deterministic package builder that requires the bot app ID, app ID,
   HTTPS messaging endpoint, and icon paths.
3. Validate the rendered manifest and ZIP layout locally without contacting
   Microsoft Graph, Teams, or Azure.
4. Keep bot registration, endpoint deployment, consent, and tenant upload as
   external follow-up steps.

## Alternatives considered

- Uploading a hand-edited manifest was rejected because it would allow missing
  bot IDs, endpoints, or icons to reach the tenant.
- Putting package generation in the Teams adapter was rejected because the
  adapter owns activity transport, not deployment artifacts.
- Adding tabs or Graph permissions was deferred because the first demo needs
  only a channel bot.

## Affected files or modules

- `teams-app/manifest.template.json`
- `teams-app/README.md`
- `scripts/build-teams-app-package.ts`
- `package.json`
- `specs/045-teams-app-package.md`
- `results/045-teams-app-package.md`
- `docs/PROJECT_STATE.md`

## Milestones

1. Add the manifest template and package input contract.
2. Add local rendering and validation.
3. Build a ZIP proof artifact and verify its root layout.
4. Record the external bot, endpoint, icon, upload, and smoke-test gates.

## Acceptance criteria

- The template uses the Microsoft Teams manifest schema and contains no
  secrets or tenant-specific credentials.
- The builder refuses missing values, non-HTTPS endpoints, invalid GUIDs, and
  missing PNG icon files.
- The builder writes a ZIP whose root contains `manifest.json`, `color.png`,
  and `outline.png`.
- The rendered manifest includes personal, team, and group-chat bot scopes.
- The package builder does not implement Workroom behavior or authorization.
- Live bot registration, consent, endpoint, upload, and smoke testing remain
  explicitly incomplete.

## Verification commands

```sh
npm run teams:package -- --help
npm run teams:package -- --validate-only --bot-app-id 22222222-2222-4222-8222-222222222222 --app-id 11111111-1111-4111-8111-111111111111 --endpoint https://example.test/api/messages --web-url https://example.test --color-icon docs/images/landops-portfolio.png --outline-icon docs/images/landops-teams-integration.png
npm run typecheck
npm run validate:records
git diff --check
```

The validation command must not create or upload a package when
`--validate-only` is set.

## Risks and open questions

- The real bot application ID and endpoint are still external prerequisites.
- Teams may reject a package if tenant app policy or the selected manifest
  version changes before upload.
- Icon artwork is a package asset, not business logic, and must be supplied
  before the first upload.

## Progress log

- 2026-09-07: Approved after custom app upload became available in the
  DecisionForge tenant.

## Decision log

- 2026-09-07: Keep the app package separate from the ASP.NET Core API and the
  Teams transport implementation.
- 2026-09-07: Require real deployment values at build time instead of
  committing placeholders in an uploadable ZIP.
- 2026-09-07: Package builder, manifest rendering, input validation, and ZIP
  layout verification completed. Live bot values and final icon artwork remain
  external prerequisites.
