---
id: 023-focus-first-landops-workspace
title: Focus-first LandOps workspace
status: completed
completed: 2026-09-05
spec: specs/023-focus-first-landops-workspace.md
---



## What changed

- Reduced the portfolio shell to a compact current-portfolio context bar.
- Kept the active matter, synthetic-data status, departments, and summary
  counts visible without competing with the flagship workflow.
- Moved the full agent roster and data notice behind an accessible expandable
  details control.

## Verification

- TypeScript compiler check: passed.
- TypeScript tests: 122 passed, 0 failed.
- Next production build in an isolated writable checkout: passed.
- Browser inspection: compact context and primary `Run Land-Well
  Reconciliation` control rendered together; expanding portfolio context
  revealed all six seeded agents and the synthetic-data notice.
- `git diff --check`: passed.

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
