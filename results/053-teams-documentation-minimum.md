---
id: 053-teams-documentation-minimum
title: Teams documentation minimum
status: completed
spec: specs/053-teams-documentation-minimum.md
completed: 2026-09-09
---

## What changed

Reduced the active documentation to the Teams app, API boundary, Microsoft
technology map, Azure deployment, tenant operation, safety, evidence, naming,
and execution-record guides. Added the implemented-versus-target explanation
for routing, specialist agents, topics, sharing, and authorization.

## Files changed

- Rewrote the root README, active documentation index, project state, naming,
  technology map, history index, and Teams architecture guidance.
- Removed obsolete web/admin architecture, browser handoff, tenant naming,
  duplicate deployment guidance, and unused documentation images.
- Corrected local SQL startup and current Teams package/activation links.
- Removed the stale Next.js instruction block from `AGENTS.md`.
- Added `specs/053-teams-documentation-minimum.md`.

The removed documents remain recoverable in Git history and numbered specs and
results were not rewritten. No implementation code or Azure resource changed.

## Checks run and results

- `npm run typecheck` — passed.
- `npm test` — passed, 128/128 tests.
- `npm run validate:records` — passed.
- `npm run validate:agent-artifacts` — passed, 13 agents.
- `npm run validate:identity-personas` — passed, 14 personas.
- `npm run validate:naming` — passed.
- `dotnet build dotnet/LandOps.sln --no-restore` — passed, 0 warnings/errors.
- `git diff --check` — passed.
- No implementation files were changed by this documentation slice.

## Deviations from the spec

The existing long WV land architecture and operational safety guides were
kept because the API still implements those evidence boundaries and `AGENTS.md`
requires them for domain work. They remain supporting references, not product
surface documentation.

## Important decisions

- The seven-point Teams model is documented with current-state qualifiers.
- History is preserved through Git and numbered records instead of keeping
  stale active instructions.
- Microsoft 365 sharing is described as distribution; Entra/API policy remains
  the authorization boundary.

## Remaining follow-ups

- Live tenant human-action and duplicate-activity checks remain operational
  follow-ups recorded by the activation runbook.
- API integration tests require a reachable local SQL Server.
