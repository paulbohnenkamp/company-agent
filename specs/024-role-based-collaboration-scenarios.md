---
id: 024-role-based-collaboration-scenarios
title: Role-based LandOps collaboration scenarios
status: completed
created: 2026-09-05
updated: 2026-09-07
result: results/024-role-based-collaboration-scenarios.md
---



## Goal

Give each Sample Energy Company role a small set of realistic questions
that become evidence-grounded agent workflows and, when needed, a human review
task.

## Product problem

The current workspace proves that bounded agents can reconcile one case, but it
does not yet show how a real land, legal, accounting, or operations user would
start work. A Teams-like experience needs recognizable questions, visible
delegation, shared case context, and a clear handoff boundary.

## Product decision

LandOps has two connected surfaces with different jobs:

1. **Case Copilot** — a private, case-scoped conversational surface for one
   analyst to ask questions, inspect evidence, and understand what the system
   knows or does not know.
2. **Collaboration Workroom** — a shared work surface for cross-functional
   threads, agent delegation, assignments, approvals, and Teams notifications.

The Copilot may answer directly when the question is informational. The
Workroom is created when the question needs multiple specialists, another
department, a durable assignment, or a human decision. Both surfaces use the
same case scope, evidence contracts, authorization, and audit trail.

In either surface, a Land Operations Coordinator classifies the request and
selects only permitted specialists. Specialists return structured findings
with evidence and uncertainty. The coordinator synthesizes the answer and
identifies the next human owner. Agents do not silently approve title,
payment, legal, or regulatory actions.

## Role question catalog

| Role | Example question | Agent collaboration | Human outcome |
| --- | --- | --- | --- |
| Land Analyst | “What ownership interests do we currently have for the Braxton tract, and what is still unverified?” | Ownership Reviewer → Title Chain Reviewer → Case Synthesizer | Ownership-gap review |
| Lease Analyst | “What lease obligations could affect the next development decision?” | Lease Analyst → Lease Obligation Reviewer → Compliance Reviewer | Lease-obligation checklist |
| Division Order Analyst | “Can we prepare a division order from the current ownership evidence?” | Division Order Analyst → Ownership Reviewer → Title Curative Analyst | Division-order preparation review |
| Legal Reviewer | “What title or curative issues must legal resolve before we rely on this chain?” | Title Curative Analyst → Title Chain Reviewer → Heirship/exception review | Legal curative packet |
| Compliance Reviewer | “Are the lease, well, and public regulatory records consistent enough for compliance review?” | Land-Well Reconciler → Lease Obligation Reviewer → Compliance Reviewer | Compliance exception list |
| Accounting Reviewer | “Why is this interest in suspense, and what evidence would clear it?” | Division Order Analyst → Ownership Reviewer → Payment-status review | Suspense resolution task |
| Operations Reviewer | “Is this tract ready for the next development gate?” | Lease Analyst + Title Curative Analyst + Compliance Reviewer → Case Synthesizer | Development-readiness gate |
| Case Manager | “What is blocking this matter, who owns the next step, and what should I do today?” | Coordinator → relevant specialists based on open unknowns/conflicts | Assigned work thread |

## Canonical collaboration examples

### Example A — Legal asks Lease Analyst

1. Legal asks: “Before we send this tract to title review, what lease terms
   could create a development or notice issue?”
2. The coordinator scopes the request to the selected Sample Energy Company matter.
3. Lease Analyst extracts term, expiration, notice, depth, pooling, and
   continuous-development obligations from the lease/OCR evidence.
4. Compliance Reviewer checks which obligations have corroborating operational
   or regulatory evidence.
5. The answer shows citations, extracted terms, missing documents, and a
   proposed human review owner. It does not state that the lease is legally
   enforceable.

### Example B — Land asks Division Order Analyst

1. Land asks: “Can we prepare the division order for the current ownership
   packet?”
2. Division Order Analyst requests current ownership, title-chain, curative,
   and payee evidence through bounded tools.
3. Ownership Reviewer reconciles interests and preserves competing claims.
4. Title Curative Analyst lists exceptions that prevent a confident payee
   recommendation.
5. The result is either a draft preparation packet or an explicit blocked
   state with the evidence needed to proceed. No payment or owner contact is
   performed automatically.

### Example C — Operations asks for readiness

1. Operations asks: “What is blocking the development-readiness gate for this
   tract?”
2. The coordinator fans out to lease, title/curative, and compliance agents.
3. Each specialist returns findings, conflicts, unknowns, and provenance.
4. The coordinator produces a single readiness board grouped by `ready`,
   `blocked`, and `needs human decision`.
5. A case manager assigns the next work item; the system records the decision
   and keeps the evidence packet immutable.

## Case Copilot interaction

The Copilot should feel like a focused analyst assistant embedded in the case:

- natural-language question composer;
- role-aware suggested questions;
- concise answer first, with expandable evidence and reasoning context;
- citations to the current case’s documents, public records, findings,
  conflicts, and unknowns;
- “turn this into a workroom thread” when the answer needs collaboration;
- no cross-case retrieval and no unapproved external action.

## Intended Collaboration Workroom / Teams interaction

The first collaboration surface should support:

- a durable case-scoped thread created from a Copilot escalation or directly
  from a Teams channel;
- a question composer with role/team context;
- suggested questions based on the current case and role;
- a visible “agents working” trace showing delegation and progress;
- evidence cards that link every material answer to a source or document;
- explicit `unknown`, `conflict`, and `human decision` states;
- assignments, mentions, due dates, and department handoffs;
- a shareable review thread that preserves participants, agent versions, and
  citations;
- confirmation before any consequential action.

The initial implementation can provide both surfaces in the web workspace. The
Teams adapter should later call the same collaboration-thread contract and
preserve the same thread, case, authorization, and evidence semantics.

## Teams agent-enabled channel model

The Teams experience is a shared channel with an available agent roster, much
like a Slack workspace where people can address specialized bots. It is not a
single general-purpose bot:

- a user may mention an agent only when their Entra role or group grants access
  to that agent and its tools;
- the channel establishes tenant, department, case, and conversation scope;
- `@Lease Analyst`, `@Title Curative Analyst`, and `@Division Order Analyst`
  are distinct capabilities with distinct evidence permissions;
- an agent may delegate to another agent only through an allowlisted route,
  preserving the initiating user, case ID, purpose, and audit correlation ID;
- the channel shows which agent answered, which agents were consulted, and
  which human team owns the next step;
- Teams transport concerns such as mention parsing, retries, idempotency, and
  reply formatting stay in the adapter from `ms-teams-agent`; land rules stay
  in the LandOps application.

For example, a Legal user can ask `@Lease Analyst` to look up lease owners and
obligations. Lease Analyst may consult Ownership Reviewer when permitted, but
it cannot expose unrelated cases, bypass title-curative controls, or perform a
payment or legal action. The same request can be promoted from a Copilot
answer into a durable Workroom thread when another department must act.

## Inputs and outputs

Inputs are the current user identity and role, case ID, natural-language
question, optional selected documents, and the permitted agent/skill catalog.

Copilot outputs are a typed answer containing the normalized question, answer,
citations, conflicts, unknowns, and an optional escalation suggestion.

Workroom outputs are a typed collaboration thread containing the normalized
question, delegated steps, agent findings, citations, conflicts, unknowns,
assignments, suggested next owner, and review state.

## Constraints and exclusions

- SQL Server/Azure SQL remains the private operational source of truth.
- Documents and OCR remain immutable evidence in document storage; search is
  an index, not the system of record.
- MCP exposes bounded tools only after the underlying application contracts
  exist and are authorized.
- Do not implement autonomous title conclusions, payment changes, owner
  contact, regulatory filings, or lease amendments.
- Do not add every historical agent from the source repositories to the first
  release; promote scenarios in verifiable slices.

## Acceptance criteria for the next implementation slice

- The canonical scenario catalog is typed and read-only.
- Each active role has at least two suggested questions and a declared
  specialist route.
- A scenario identifies its required evidence types, expected output, and
  human-control boundary.
- The UI can show a selected role, suggested question, and expected agent team
  before execution.
- The existing WV reconciliation flow remains available as the first runnable
  workflow.

## Completion notes

Implemented the first scenario slice. The C# API now exposes the role-aware
catalog, the Next.js Case Copilot filters prompts by selected role, and a
selected prompt is visibly queued for the current case. Durable Workroom
threads, Entra-backed agent access checks, and Teams transport remain the next
implementation slice; this spec defines their boundary without pretending they
are complete.

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

## Acceptance criteria

The original acceptance claims are preserved in this record. Verification evidence is recorded in the matching result where available.

## Verification commands

See the matching result and docs/PROJECT_STATE.md for the commands used and the limits of the evidence.

## Risks and open questions

Remaining risks and open questions are tracked in the matching result and docs/PROJECT_STATE.md.

## Progress log

2026-09-07: Record metadata and required structure normalized; original content preserved.

## Decision log

2026-09-07: This slice remains first-class project history; normalization does not change its product meaning.
