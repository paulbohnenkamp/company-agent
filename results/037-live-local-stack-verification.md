---
id: 037-live-local-stack-verification
title: Result 037: Live local stack verification
status: completed
completed: 2026-09-07
spec: specs/037-live-local-stack-verification.md
---


# Result 037: Live local stack verification

Status: completed

## Environment

- Existing `landops-sqlserver` SQL Server 2022 container: running on port 1433.
- ASP.NET Core API: .NET 10, Development profile on port 5006.
- Next.js App Router UI/proxy: port 3001.
- Identity: explicit local demo identity.
- Providers: deterministic C# workflow and Workroom execution.

## Verified in the real browser

- Portfolio displayed 15 agent roles, 5 workflows, and 4 review groups across
  Land, Land Administration, Legal, Compliance, and Accounting.
- Fictional Blue Ridge data room displayed lease, title, division-order,
  ownership, and OCR records.
- Workroom displayed a three-agent ownership chain: requested by the user,
  delegated by Ownership Reviewer, then delegated by Title Chain Reviewer.
- Live Workroom run produced 5 findings, 5 source records, 5 explicit unknowns,
  and a HUMAN-REVIEW route.
- Flagship WV workflow completed Case Intake, Land-Well Reconciler, and Case
  Synthesizer with structured output validated.
- Live evidence view displayed 5 normalized records, 3 immutable snapshots,
  the WVDEP/WVGES operator conflict, and two open unknowns.
- Live case chat answered the operator question with “No,” preserved the
  inconclusive conclusion, and cited both WVDEP and WVGES evidence IDs.

## Cleanup and verification

- Temporary ASP.NET Core and Next.js processes were stopped after the run.
- The existing SQL Server container was left unchanged.
- `git diff --check` passed.

This is the strongest local proof that the primary seeded workbench is usable
through the intended C#/.NET, SQL Server, Next.js, and browser boundaries.

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
