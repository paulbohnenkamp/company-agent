---
id: 022-fictional-company-portfolio-shell
title: Fictional company portfolio shell
status: completed
completed: 2026-09-05
spec: specs/022-fictional-company-portfolio-shell.md
---



## What changed

- Added the typed C# `/api/v1/company` contract for Sample Energy Company Energy
  Resources, including synthetic departments, roles, review groups, agent
  roster, workflows, and seeded case summaries.
- Added the same-origin Next proxy and browser adapter.
- Added Fluent UI to the portfolio surface for enterprise-oriented status and
  card primitives.
- Added local Next development origins for both `127.0.0.1` and `localhost`.
- Hardened the LandOps run proxy and browser action so malformed or incomplete
  backend responses produce a visible error and release the busy state.

## Verification

- C# solution build in an isolated writable checkout: passed, 0 warnings and
  0 errors.
- TypeScript compiler check with incremental output disabled: passed.
- TypeScript tests: 122 passed, 0 failed.
- Next production build in an isolated writable checkout: passed.
- Browser inspection: company name, synthetic label, departments, active
  matter, agent/workflow/group counts, flagship workflow, and run control
  rendered together at `127.0.0.1`.
- Browser failure-path check: missing run identifier rendered an error and the
  run button recovered from its busy state.
- `git diff --check`: passed.

## Boundary note

The disposable browser fixture used for this pass did not replace the real C#
workflow or create cloud resources. The existing SQL-backed C# workflow and
its prior live verification remain the authoritative execution path.

## Files changed

See the original result content and the canonical inventory in docs/PROJECT_STATE.md.

## Checks run and results

Verification evidence is preserved in the original result content; unresolved limits are called out in docs/PROJECT_STATE.md.

## Deviations from the spec

No deviation is inferred by this metadata normalization. Review the original result content for slice-specific deviations.

## Important decisions

This slice remains first-class project history. The current product direction is recorded in docs/PROJECT_STATE.md.

## Remaining follow-ups

See docs/PROJECT_STATE.md and the matching spec for current follow-ups.
