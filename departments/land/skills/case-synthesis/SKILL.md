---
name: case-synthesis
version: 1.0.0
description: "Combine completed land skill results into an evidence-preserving review packet and proposed human route."
permitted-tools:
  - read
---

# Case Synthesis

1. Confirm every result belongs to the same case and source snapshot.
2. Preserve each material finding, source, uncertainty, conflict, and execution failure.
3. Resolve only duplicate wording or clearly supported terminology.
4. Select exactly one proposed route: `continue`, `request-records`, or `human-review`.
5. Return a structured review packet for human confirmation.

Never certify title, approve a transfer, change records, issue payment
instructions, contact parties, or convert an execution failure into an unknown.
