---
id: 026-workroom-thread-preview
title: Result: Workroom Thread Preview
status: completed
completed: 2026-09-07
spec: specs/026-workroom-thread-preview.md
---


# Result: Workroom Thread Preview

status: completed
spec: 026-workroom-thread-preview

## Delivered

- Added a typed local Workroom thread contract and in-memory store.
- Added scenario-derived required Entra group metadata.
- Added an API handoff that creates an authorized, case-scoped planned thread.
- Added an explicit 403 response for unauthorized local requests.
- Added a same-origin Next.js proxy route.
- Added an `Open Workroom` action to escalated role scenarios.
- Added a visible thread preview showing the question, group, participants, ordered agent route, and human boundary.

## Production boundary

The local preview sends `roleId` and `groups` in the request body so it can be demonstrated without sign-in. Production must replace those fields with Microsoft Entra ID claims and persist threads in SQL Server/Azure SQL. The Workroom payload is intentionally read-only and planned; it does not perform consequential actions.

## Verification

- TypeScript typecheck: passed.
- TypeScript tests: 122 passed.
- .NET solution tests: 18 passed (2 domain, 7 application, 9 API).
- `git diff --check`: run after final edits.
- Browser acceptance: the follow-on Workroom context run rendered the handoff
  control and successfully posted through the same-origin proxy.

## What changed

The implementation claims in the original result content are preserved below.

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
