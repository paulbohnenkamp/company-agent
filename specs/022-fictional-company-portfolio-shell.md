---
id: 022-fictional-company-portfolio-shell
title: Fictional company portfolio shell
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/022-fictional-company-portfolio-shell.md
---



## Goal

Begin consolidation with a small, typed fictional-company portfolio contract
and a rich-workspace shell. Preserve the existing WV reconciliation workflow,
but give it a believable company, department, agent-team, group, and case
context that can grow into the seeded LandOps product.

## Product decision

The fictional company is **Blue Ridge Energy Resources**. Its data is clearly
synthetic. Public WV evidence remains separately attributed and is never
represented as title proof.

This checkpoint adds the company shell only. It does not implement full Entra
authentication, database-backed organization management, document ingestion,
or additional agent workflows yet.

## Scope

### C# API contract

Add a read-only `/api/v1/company` endpoint returning:

- company identity and synthetic-data notice;
- departments;
- fictional cross-functional groups;
- canonical agent roster and department ownership;
- the initial workflow list;
- seeded case summaries.

The contract must be application-owned and independent of the eventual Entra
token shape. Future Entra app roles can map onto the department and role IDs.

### Next.js workspace

Add a same-origin `/api/landops/company` proxy and display the company context
in the existing workspace:

- company name and synthetic portfolio label;
- department navigation chips;
- active case context;
- visible agent team and workflow count;
- a compact portfolio summary before the existing evidence workflow.

Keep the current run, evidence, human-review, and grounded-chat interactions
working unchanged.

### Verification

- Add an API test for the company contract and synthetic boundary.
- Keep existing C# and TypeScript tests passing.
- Build the Next.js application.
- Start the local app/API path and use browser UI inspection to confirm the
  company shell and the existing reconciliation workflow render together.
- Run `git diff --check`.

## Acceptance criteria

- The company endpoint is typed, deterministic, and read-only.
- The response includes departments for Land, Land Administration, Legal,
  Compliance, Accounting, Operations, and IT/platform.
- The response includes Lease Analyst, Division Order Analyst, Title and
  Curative Analyst, Well and Regulatory Reconciler, Case Synthesizer, and
  Land Operations Coordinator.
- Every seeded item is visibly synthetic or a public-evidence reference.
- The browser still supports run, evidence review, grounded case chat, and
  human review after the shell is added.
- No external cloud resource or unrelated repository is modified.

## Completion notes

Completed with a typed C# company portfolio contract, same-origin Next proxy,
Fluent UI shell, and a browser-verified local rendering path. The portfolio
context was subsequently made compact in checkpoint 023.

## Non-goals

See the existing scope and deferred work described in this record.

## Current-state findings

This section was added during the 2026-09-07 project-state reconciliation. Existing record content remains below and is the source material for this slice.

## Chosen approach

The existing implementation approach remains the source of truth for this completed slice; future changes must use a new approved spec.

## Alternatives considered

The alternatives and trade-offs are preserved in the existing record content. No alternative is implied by this normalization.

## Affected files or modules

See the implementation files named in this record and the canonical inventory in docs/PROJECT_STATE.md.

## Milestones

The slice milestones are represented by the implementation and verification notes in this record.

## Verification commands

See the matching result and docs/PROJECT_STATE.md for the commands used and the limits of the evidence.

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Progress log

2026-09-07: Record metadata and required structure normalized; original content preserved.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
