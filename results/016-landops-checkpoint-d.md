---
id: 016-landops-checkpoint-d
title: LandOps Workbench checkpoint D React workspace adapter
status: completed
completed: 2026-09-04
spec: specs/016-landops-checkpoint-d.md
---



## What changed

- Added the `LANDOPS_API_URL` server-side adapter and `NEXT_PUBLIC_LANDOPS_MODE`
  transport switch.
- Added same-origin Next.js routes for the C# case and deterministic run.
- Added the C# evidence read endpoint and mapped persisted findings, conflicts,
  unknowns, provenance, steps, and synthesis into the existing workspace shape.
- Kept `/api/demo` as the default TypeScript reference path.

## Files changed

- `src/landops/adapter.ts`;
- `app/api/landops/case/route.ts`;
- `app/api/landops/run/route.ts`;
- `dotnet/LandOps.Api/Program.cs`;
- `app/page.tsx`;
- `specs/016-landops-checkpoint-d.md`.

## Checks run and results

- `dotnet build dotnet/LandOps.sln`: passed;
- `npm run typecheck`: passed;
- `npm run build`: passed with the existing package-lock tracing warning;
- `npm test`: passed, 120 tests;
- live end-to-end verification: Next.js same-origin `/api/landops/run` returned
  a C# persisted run with ordered three-step workflow, source conflict, unknowns,
  synthesis, and evidence payloads.
- `git diff --check`: passed.

## Deviations from the spec

- Review actions and conversation remain on the existing TypeScript routes in
  C# mode until checkpoints E and the C# review/conversation contracts are added.
  The UI reports that boundary rather than silently sending C# run IDs to the
  TypeScript services.

## Important decisions

- Keep the React information architecture unchanged and migrate transport first.
- Use same-origin proxying so the browser does not need CORS configuration or a
  hard-coded deployment topology.

## Remaining follow-ups

Checkpoint E should add the C# case-scoped conversation and human-review API
contracts, then connect the remaining workspace actions.
