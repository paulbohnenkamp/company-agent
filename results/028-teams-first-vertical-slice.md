---
id: 028-teams-first-vertical-slice
title: Result 028 — Teams-first vertical slice
status: completed
completed: 2026-09-07
spec: specs/028-teams-first-vertical-slice.md
---

# Result 028 — Teams-first vertical slice

**Date:** 2026-09-06  
**Status:** Implemented and verified locally  
**Direction:** Teams-first LandOps collaboration

## Scope

Defined the Teams-first product direction in `docs/LANDOPS_TEAMS_FIRST_DIRECTION.md` and implemented the first adapter behavior needed to support it.

## Implemented

- Teams messages still map into the existing case-scoped Workroom contract.
- The adapter now runs the bounded Workroom review after creating the thread.
- Teams replies include:
  - participating agent path;
  - finding count;
  - source-record count;
  - unknown count;
  - top evidence-linked findings;
  - open questions;
  - proposed route;
  - human decision boundary;
  - optional browser review link.
- The adapter exposes a separate `runWorkroom` client operation so transport and application concerns remain separate.
- Tests cover the evidence-linked Teams reply format.
- Explicit Teams commands record append-only human actions: approve, reject,
  request evidence, and assign task.
- The SQL-backed `WorkroomActions` table has a generated EF Core migration and
  API coverage.
- Teams review links open a focused Workroom context panel at `/teams?threadId=...`.

## Verification

- TypeScript test suite: 131 passing.
- Teams adapter tests: 6 passing.
- Next.js production build: passed, including the focused Teams route.
- .NET solution tests: 30 passing (2 Domain, 7 Application, 21 API).
- SQL-backed human-action integration test: passed.
- Build/test runs used shared-compilation disabled because the local sandbox
  cannot create the .NET IPC endpoint; this is an environment limitation, not
  an application failure.

## Remaining work

- Run a live local Teams adapter request against the local ASP.NET Core API.
- Add end-to-end authorization coverage for every Teams action command.
- Connect the adapter to a real Microsoft Teams app after tenant registration,
  bot credentials, and channel configuration are available.

## Review conclusion

**PASS for the local portfolio vertical slice.** The architecture now has the
correct separation: Teams is the conversational front end, the focused web
route is the review front end, and ASP.NET Core owns the durable Workroom,
authorization, agent execution, and SQL persistence contracts. The remaining
real-tenant work is deployment activation, not a reason to redesign the
product around a second business-logic stack.

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
