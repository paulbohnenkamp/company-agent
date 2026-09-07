---
id: 016-landops-checkpoint-d
title: LandOps Workbench checkpoint D React workspace adapter
status: completed
created: 2026-09-04
updated: 2026-09-07
result: results/016-landops-checkpoint-d.md
---



## Goal

Connect the existing React case workspace to the ASP.NET Core case and run APIs
through a small same-origin adapter, preserving the current information
architecture and offline TypeScript fallback.

## Non-goals

- Broad visual redesign.
- Replacing review/conversation before their C# endpoints exist.
- Azure hosting, authentication, or live source access.

## Current-state findings

- The current workspace is a successful Next.js/React presentation over the
  TypeScript demo routes.
- Checkpoint C exposes C# case, deterministic run, and persisted-run endpoints.

## Chosen approach

Add same-origin Next.js proxy routes and a response adapter selected by
`LANDOPS_API_URL`. Keep the current `/api/demo` behavior as the default fallback
when the ASP.NET URL is absent. The visual components and interaction model stay
unchanged; only the case/run transport changes in C# mode.

## Alternatives considered

- Direct browser calls to ASP.NET were rejected because they introduce CORS and
  deployment coupling before Azure hosting is selected.
- A second React workspace was rejected because the current workspace already
  demonstrates the target interaction model.

## Acceptance criteria

- With `LANDOPS_API_URL` set, the workspace loads the ASP.NET case and starts a
  C# deterministic run through same-origin Next.js routes.
- The existing UI renders the case boundary, ordered steps, findings, conflict,
  unknowns, synthesis, and evidence from the adapted C# response.
- Without `LANDOPS_API_URL`, the current TypeScript demo remains unchanged.
- Existing TypeScript tests, typecheck, and build pass.

## Verification commands

```sh
npm test
npm run typecheck
npm run build
git diff --check
```

## Affected files or modules

- `app/page.tsx`
- `app/api/landops/**`
- `src/landops/**`
- focused adapter tests and execution records.

## Milestones

1. Add C# evidence read contract and same-origin proxy routes.
2. Add typed client adapter and transport mode selection.
3. Verify both C# and TypeScript transport modes.

## Risks and open questions

- Review and conversation remain on the TypeScript route until checkpoints E and
  the C# review/conversation contracts are ready.

## Progress log

- 2026-09-04: Began after checkpoint C passed its acceptance criteria.
- 2026-09-04: Added same-origin Next.js proxy routes and an environment-selected
  C# response adapter while preserving the TypeScript fallback.
- 2026-09-04: Verified the built Next.js proxy against the SQL-backed ASP.NET API.

## Decision log

- 2026-09-04: Use an environment-selected transport adapter so the stable React
  surface can migrate incrementally without a parallel UI.
