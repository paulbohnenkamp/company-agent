---
id: 024-role-based-collaboration-scenarios
title: Role-based LandOps collaboration scenarios
status: completed
completed: 2026-09-05
spec: specs/024-role-based-collaboration-scenarios.md
---



## What changed

- Added 16 typed role scenarios covering Land, Lease, Division Order, Legal,
  Compliance, Accounting, Operations, and Case Manager questions.
- Each scenario declares its specialist route, evidence types, workroom
  escalation flag, and human outcome.
- Added read-only C# `/api/v1/scenarios` and same-origin Next
  `/api/landops/scenarios` endpoints.
- Added the Fluent UI Case Copilot surface with role selection and
  role-specific suggested questions.
- Added visible prompt queuing so a user can choose a question before opening
  the grounded conversation panel.
- Documented the distinction between individual Case Copilot and shared
  Workroom/Teams collaboration, including controlled agent-to-agent
  delegation.

## Verification

- Isolated C# test suite: 15 passed, 0 failed, including 6 API tests.
- TypeScript compiler check: passed.
- TypeScript tests: 122 passed, 0 failed.
- Next production build in an isolated writable checkout: passed, including
  `/api/landops/scenarios`.
- Browser inspection: role selector changed from Lease Analyst to Legal
  Reviewer, the prompt list changed accordingly, and selecting a prompt changed
  the button state to `Queued`.
- `git diff --check`: passed.

## Deliberate boundary

This checkpoint does not claim that Teams transport, Entra authorization, or
durable Workroom threads are implemented. It establishes the scenario IDs and
contracts those future surfaces will share.

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
