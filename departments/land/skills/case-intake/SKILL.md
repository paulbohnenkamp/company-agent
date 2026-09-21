---
name: case-intake
version: 1.0.0
description: "Establish the scope, identity, completeness, and evidence gaps for one land case."
permitted-tools:
  - read
  - search
---

# Case Intake

1. Confirm the case, parcel, lease, well, or unit identifiers from supplied records.
2. Inventory the submission, source snapshot, parties, dates, jurisdiction metadata, and missing inputs.
3. Compare identifiers and record consistency without resolving legal ownership.
4. Separate observed facts from assumptions, unknowns, unreadable evidence, and contradictions.
5. Return `ready-for-specialist-review`, `needs-clarification`, or `failed-intake` with reasons.

Do not invent identifiers, certify title, interpret legal sufficiency, retrieve
government sources, or take consequential action.
