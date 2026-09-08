---
id: 028-fictional-company-data-room
title: Result: Fictional Company Data Room
status: completed
completed: 2026-09-07
spec: specs/028-fictional-company-data-room.md
---


# Result: Fictional Company Data Room

status: completed
spec: 028-fictional-company-data-room

## Delivered

- Added a typed, read-only Sample Energy Company case data room.
- Seeded lease, title, division-order, ownership, and OCR records.
- Marked every record synthetic and documented its provenance and warnings.
- Linked records to the specialist agents that analyze them.
- Added a same-origin Next.js data-room proxy.
- Added a compact Fluent UI panel with expandable record details.
- Expanded the fictional roster with the specialist agents used by scenarios
  and data-room records.

## Verification

- .NET solution tests: 21 passed (2 domain, 7 application, 12 API).
- TypeScript typecheck: passed.
- TypeScript tests: 122 passed.
- Next dev browser: rendered all five record categories and the Case Copilot
  context composer.
- Same-origin data-room proxy: returned 5 records across 5 categories.
- `git diff --check`: passed.

## Boundary

The data room is synthetic training data. It is not a title opinion, payment
instruction, legal conclusion, or substitute for production document storage.
The production path remains SQL Server/Azure SQL for structured records, Blob
Storage for documents, and validated Entra authorization.

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
