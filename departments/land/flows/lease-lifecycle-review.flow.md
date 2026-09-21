---
id: lease-lifecycle-review
version: 1.0.0
name: Lease Lifecycle Review
description: "Extract lease obligations and route timing, evidence, and legal-risk exceptions."
inputs:
  - lease record and supporting instruments
outputs:
  - obligation register and human-review route
skills:
  - case-intake
  - lease-lifecycle-review
  - case-synthesis
---

# Lease Lifecycle Review Flow

Intake establishes the source snapshot. The lifecycle reviewer extracts events
and obligations. The synthesizer preserves evidence gaps and routes legal,
payment, deadline, or conflicting-record decisions to a human.

## Stage contract

1. `case-intake` records the case ID, lease ID, source snapshot, and missing inputs.
2. `lease-lifecycle-review` returns one evidence-backed row per obligation or event.
3. `case-synthesis` keeps the specialist output intact, labels conflicts, and selects `continue`, `request-records`, or `human-review`.

The flow may create reminders only after a human accepts the proposed event and
the configured jurisdictional calendar is available.
