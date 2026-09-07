---
id: 045-teams-app-package
title: Minimal Teams app package contract
status: completed
completed: 2026-09-07
spec: specs/045-teams-app-package.md
---

## What changed

- Added a Microsoft Teams 1.30 manifest template for the minimal LandOps bot.
- Added a package builder that renders real deployment values only at build
  time and refuses missing or unsafe inputs.
- Added validation for GUIDs, HTTPS URLs, PNG icons, bot scopes, and ZIP layout.
- Added package build instructions without moving Workroom behavior into the
  Teams package.

## Files changed

- `teams-app/manifest.template.json`
- `teams-app/README.md`
- `scripts/build-teams-app-package.ts`
- `package.json`
- `specs/045-teams-app-package.md`
- `results/045-teams-app-package.md`
- `docs/PROJECT_STATE.md`

## Checks run and results

- `npm run teams:package -- --help`: passed.
- `npm run teams:package -- --validate-only ...`: passed with valid test
  values and repository PNG inputs.
- `npm run teams:package -- ...`: passed and wrote a ZIP with `manifest.json`,
  `color.png`, and `outline.png` at its root.
- `unzip -l dist/landops-teams-app.zip`: passed.
- `npm run typecheck`: passed.
- `npm run validate:records`: passed.
- `git diff --check`: passed.

## Deviations from the spec

The generated ZIP was a local build proof only. It used existing repository
screenshots as test PNG inputs. It must not be uploaded as the interview demo
package. Final icon artwork, the real Teams app ID, the bot application ID,
and the public adapter endpoint are still required.

## Important decisions

- Require deployment values at build time instead of committing placeholders in
  an uploadable package.
- Keep the package free of Workroom behavior, authorization, and secrets.
- Treat the local ZIP proof as incomplete until real bot and endpoint values
  and final icons are supplied.

## Remaining follow-ups

- Register the bot application and determine the supported Azure Bot setup.
- Deploy or expose the adapter at a public HTTPS `/api/messages` endpoint.
- Supply final color and outline PNG icons, then build the real package.
- Upload the package in Teams and run the real mention smoke test.
- Implement workload authentication and directory-backed authorization before
  calling the integration production-ready.
