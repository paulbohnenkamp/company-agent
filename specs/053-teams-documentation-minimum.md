---
id: 053-teams-documentation-minimum
title: Teams documentation minimum
status: completed
created: 2026-09-09
updated: 2026-09-09
result: results/053-teams-documentation-minimum.md
---

## Goal

Reduce active documentation to the minimum needed to understand, develop,
deploy, and operate the Microsoft Teams Business Agent.

## Non-goals

- Do not change implementation code or cloud resources.
- Do not rewrite numbered historical specs or results.
- Do not remove the C# API, Teams adapter, evidence rules, or deployment files.

## Current-state findings

The active set still contains obsolete web/admin architecture, browser handoff
instructions, tenant naming adoption material, duplicate deployment guidance,
and stale links. The Teams adapter currently sends a bounded scenario to the
API; it does not perform arbitrary natural-language routing among independent
Teams bots.

## Chosen approach

Keep concise current guides for Teams flow, development, Azure deployment,
tenant activation, safety, Microsoft technology choices, naming, evidence, and
execution records. Remove obsolete active guides and images. Preserve their
content in Git history and retain all numbered specs/results.

## Alternatives considered

- Keep every document and mark it historical: rejected because stale guidance
  remains easy to follow accidentally.
- Rewrite all historical records: rejected because it would damage the audit
  trail.
- Delete all domain and operational guidance: rejected because the API,
  evidence, and Teams deployment still need bounded instructions.

## Affected files or modules

Active Markdown under `README.md`, `docs/`, and `teams-app/README.md`; new
spec/result records only. No implementation module is in scope.

## Milestones

1. Remove obsolete active documents and assets.
2. Rewrite the active index, project state, architecture, naming, technology,
   evidence, and operations pages.
3. Correct local and cross-document links and record the verified result.

## Acceptance criteria

- Active docs contain no web/admin or browser-handoff instructions.
- README and Teams architecture explain the actual flow and its boundaries.
- Microsoft technology responsibilities and Azure deployment are documented.
- `specs/` and `results/` remain available and validation passes.
- No implementation code changes are introduced.

## Risks and open questions

The tenant may change independently of repository documentation. Foundry
routing and live tenant authorization remain bounded or externally verified;
the docs must not describe them as automatic capabilities.

## Verification commands

```sh
npm run typecheck
npm test
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
git diff --check
```

## Progress log

- 2026-09-09: Approved and implemented the Teams-only documentation sweep.

## Decision log

- 2026-09-09: Keep history in Git and numbered records; make active docs
  current-state-only.
- 2026-09-09: Describe routing, topics, sharing, and child agents with clear
  implemented-versus-target qualifiers.
