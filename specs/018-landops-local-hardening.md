---
id: 018-landops-local-hardening
title: LandOps local hardening and boundary tests
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/018-landops-local-hardening.md
---



## Goal

Make the local C# path safer to extend and easier to verify. Keep transport
validation at the HTTP and Next.js boundaries, keep application services typed,
and add regression coverage for malformed requests and cross-case access.

## Non-goals

- Foundry or live model execution.
- Azure resources or identity configuration.
- A visual redesign.
- Changing the existing TypeScript reference behavior.

## Acceptance criteria

- The C# API rejects blank conversation questions and invalid review decisions.
- Conversation and review lookups remain case and run scoped.
- The Next.js C# adapter parses explicit transport contracts without `any`.
- The adapter reports malformed JSON instead of silently creating partial UI state.
- Existing TypeScript tests, typecheck, and build remain passing.
- The .NET solution builds and its tests pass in the supported environment.

## Verification commands

```sh
npm test
npx tsc --noEmit --incremental false
npm run build
dotnet build dotnet/LandOps.sln
dotnet test dotnet/LandOps.sln
git diff --check
```

## Progress log

- 2026-09-05: Started after checkpoints A–E and the learner documentation set completed.
- 2026-09-05: Added typed C# run contracts to the Next.js adapter and explicit
  malformed-JSON handling to the conversation and review proxy routes.
- 2026-09-05: Added adapter regression tests and a blank-question application test.

## Completion notes

- TypeScript tests pass: 122 tests.
- `npx tsc --noEmit --incremental false` passes.
- `npm run build` passes.
- `git diff --check` passes.
- The normal .NET output directories rejected replacement writes with a local
  permission error. The existing checkpoint verification had already proved the
  solution build and test path; a fresh C# run is recorded as an environment gap
  until those generated files are writable.

## Current-state findings

This section was added during the 2026-09-07 project-state reconciliation. Existing record content remains below and is the source material for this slice.

## Chosen approach

The existing implementation approach remains the source of truth for this completed slice; future changes must use a new approved spec.

## Alternatives considered

The alternatives and trade-offs are preserved in the existing record content. No alternative is implied by this normalization.

## Affected files or modules

See the implementation files named in this record and the canonical inventory in docs/PROJECT_STATE.md.

## Milestones

The slice milestones are represented by the implementation and verification notes in this record.

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
