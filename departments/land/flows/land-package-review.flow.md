---
id: land-package-review
version: 1.0.0
name: Land Package Review
description: "Triage a land package, perform bounded reviews, and route the result for human confirmation."
inputs:
  - lease, ownership, and supporting land records
outputs:
  - auditable land package assessment and proposed route
skills:
  - land-package-triage
  - lease-obligation-analysis
  - ownership-interest-reconciliation
  - case-synthesis
---

# Land Package Review Flow

Triage runs first. Lease-obligation and interest-reconciliation review then run
from the same source snapshot. The synthesizer preserves conflicts and proposes
one next route. Human confirmation is required before payment, filing, owner
communication, or record updates.
