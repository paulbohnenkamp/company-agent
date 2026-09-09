---
id: 051-documentation-teams-first-cleanup
title: Teams-first documentation cleanup
status: approved
created: 2026-09-09
updated: 2026-09-09
result: results/051-documentation-teams-first-cleanup.md
---

## Goal

Make the Microsoft Teams and C#/.NET application path the obvious current
documentation path while preserving useful TypeScript, domain, deployment,
research, and execution history.

## Non-goals

- Do not change implementation code, routes, configuration, deployment assets,
  or runtime behavior.
- Do not delete historical documentation, specs, results, screenshots, or
  deployment records.
- Do not rewrite historical execution records to match current terminology.
- Do not remove compatibility identifiers such as LandOps or Workroom.

## Scope

- Establish a concise current documentation map.
- Classify older TypeScript, domain-design, product-direction, and deployment
  documents as reference or historical material.
- Consolidate current local, Azure, Teams, naming, and development entry points.
- Correct stale current-facing terminology and status claims.
- Record the cleanup and verification in the execution-record system.

## Current-state findings

- Current documentation mixed the Teams/.NET product path with older
  TypeScript runtime guidance and earlier product-direction material.
- Deployment instructions described multiple incompatible target shapes.
- The repository already contains a naming migration in progress; this pass
  must preserve its unrelated implementation changes.

## Chosen approach

- Keep current product and operational guides in place and simplify their
  navigation.
- Add a history index instead of deleting older documents.
- Label reference runtime and alternate deployment material at its source.
- Make the current deployment overview point to Azure recreation and Teams
  activation guides.

## Alternatives considered

- Delete irrelevant documents: rejected because they preserve useful design and
  execution history.
- Move all older documents into a new directory: deferred because the worktree
  already contains an in-progress naming migration and path changes would add
  unnecessary rename churn.
- Keep every document in the main map: rejected because it obscures the agreed
  Teams-first path.

## Affected files or modules

Documentation and execution records only: `docs/README.md`, `docs/history.md`,
current deployment/reference guides, `dotnet/README.md`, and this spec/result.
No implementation source, tests, routes, configuration, or infrastructure
files are in scope.

## Milestones

1. Add the classification and history index.
2. Reduce current documentation navigation.
3. Label stale/reference guides and correct current status/branding.
4. Run record, link, whitespace, and scope verification.

## Acceptance criteria

- The current documentation map leads with Teams, .NET, project state, local
  execution, deployment, and activation.
- Historical/reference documents remain available and are explicitly labeled.
- The TypeScript quickstart and runtime guides no longer appear to be the
  primary product path.
- Current-facing deployment and product documents do not contradict the latest
  Teams activation state.
- No implementation code is changed.
- Local Markdown links and execution-record validation pass.

## Risks and open questions

- Historical material may still be opened directly, so its banners must remain
  clear.
- Existing worktree changes make it necessary to distinguish this pass from
  the prior naming migration when reviewing the diff.
- Future Teams product changes may require another status reconciliation in
  `PROJECT_STATE.md`.

## Verification commands

```sh
npm run validate:records
git diff --check
```

Also run a scoped documentation link check and inspect the changed-file list
to confirm that only documentation and execution records changed.

## Decision log

- 2026-09-09: Treat Teams plus the C#/.NET API as the current product path.
- 2026-09-09: Preserve older documents as indexed reference/history rather than
  deleting them.

## Progress log

- 2026-09-09: Approved as a single-pass cleanup following the Teams-first
  product decision.
