# LandOps Teams-First Product Direction

> Historical record. Current product names and information architecture are
> defined in [product naming](product-naming.md). The terms and screenshots
> below describe the earlier implementation, not current branding or live status.

**Status:** Approved direction for implementation  
**Date:** 2026-09-06  
**Product:** LandOps Workbench  
**Primary interaction:** Microsoft Teams conversations and workrooms  
**Supporting application:** Focused web review, evidence, case, and administration surfaces

## Product thesis

LandOps should be a Teams-first, evidence-centered multi-agent collaboration system for oil-and-gas land operations.

The product should let a person ask a business question in a Teams channel or thread, allow authorized agents to gather and compare evidence, let agents ask other agents for bounded help, and return a reviewable response with citations, conflicts, unknowns, and a clear human next action.

Teams is the primary conversational entry point, not a visual imitation that
replaces Microsoft Teams. The React application is the focused case-review and
administration surface. Both front ends call the same ASP.NET Core Workroom
contracts; neither front end owns land rules, evidence decisions, or agent
orchestration.

The product is not primarily a configurable agent dashboard. It is not a generic chat window. It is not an autonomous title or payment system.

It is a collaboration layer over a durable case and evidence platform.

## Experience model

```text
Microsoft Teams
  people ask questions, mention LandOps, discuss findings,
  delegate work, approve or reject next steps
        |
        v
LandOps collaboration adapter
  authenticates identity, applies permissions, resolves case scope,
  creates workroom threads, routes bounded agent work
        |
        v
LandOps case and evidence platform
  stores cases, documents, extracted facts, findings, conflicts,
  unknowns, tasks, decisions, provenance, and audit history
        |
        v
Focused web review surfaces
  document review, title chain, lease obligations,
  interest calculations, compliance checklist, decisions, administration
```

## Product surfaces

### 1. Teams conversation

This is where work starts and where most lightweight work is completed.

People can:

- Ask a question about a case, well, tract, lease, owner, interest, or obligation.
- Mention LandOps in a channel or reply in a thread.
- Ask for a summary, comparison, reconciliation, or next-action recommendation.
- Ask LandOps to involve another specialist agent.
- Ask another human role for clarification.
- See which agents participated and what each contributed.
- Receive evidence-linked answers.
- Approve a bounded next step, request more evidence, reject a recommendation, or assign a task.

The message should remain understandable to a business user. Agent names, tool names, and internal execution details should be available as expandable provenance, not required vocabulary.

### 2. Workroom thread

A Workroom is the durable collaboration record behind a Teams thread.

It contains:

- Case and matter scope.
- Original question and conversation context.
- Human participants and Entra groups.
- Agent participants and capabilities.
- Delegation chain.
- Evidence references.
- Findings, conflicts, and unknowns.
- Tasks, owners, due dates, and status.
- Human decision boundary.
- Final decision and audit record.

The Teams adapter and browser preview must use the same Workroom contract. A local preview must be labeled as a preview; it must not imply that a real Microsoft 365 message was sent.

### 3. Focused web review

The browser is used when conversation is not enough:

- Read and compare long documents.
- Review OCR and citations.
- Inspect chain of title.
- Compare lease clauses and obligations.
- Inspect interest calculations and formulas.
- Review regulatory timelines.
- Approve or reject a review packet with full evidence.
- Manage queues, permissions, agent definitions, and audit history.

Each focused view should be reachable from a Teams message or adaptive card using a case/workroom deep link.

### 4. My Work

The first browser landing surface should answer “What needs my attention?” It should not show every person, agent, seed record, and workflow at once.

It should show:

- Assigned tasks.
- Questions waiting for the user.
- Workrooms waiting for response.
- Deadlines and expiring obligations.
- High-severity conflicts.
- Payment-impact or compliance exceptions.
- Recently completed agent work.

## Target first slice

The first complete product slice is Legal-to-Land/Title readiness review.

### User story

As a Legal Reviewer in a Teams channel, I want to ask whether a matter can move forward so that LandOps can gather the relevant evidence, ask the appropriate specialists, and give me a defensible next action without making a title or payment decision for me.

### Conversation

```text
Legal:
@LandOps can we move API 4700701733 forward?

LandOps:
I found the Braxton County case. I am asking Ownership and Title,
Lease, and Compliance to review the matter. I will return evidence,
conflicts, unknowns, and a proposed next step.

Ownership and Title Agent:
The ownership chain has a missing conveyance after the recorded
instrument dated 1987-06-14. The current records do not prove the
mineral interest for the requested action.

Lease Agent:
The lease appears active for the submitted tract, but the development
notice obligation needs confirmation against the amendment.

Compliance Agent:
The public records support the well identity. One related filing is
not present in the case package. Public records are comparison evidence,
not a title determination.

LandOps:
Recommendation: keep the matter in review and request the missing
conveyance, lease amendment confirmation, and regulatory filing.

Legal:
Request the documents and assign Land.

LandOps:
Done. Land owns the request and it is due Friday. Title, payment, and
external-contact actions remain blocked pending human review.
```

### Acceptance criteria

- A user can send a case-aware question through the Teams adapter or local Teams simulator.
- Identity and group permissions determine whether the user can access the case.
- LandOps resolves the case and selects only permitted agent capabilities.
- At least two agents can participate in one bounded workroom.
- An agent can request another agent’s help with an explicit reason and scoped inputs.
- Every material claim links to an evidence or record reference.
- Conflicting claims remain visible as conflicts.
- Missing information remains visible as unknowns.
- The response states a proposed next action and the human decision boundary.
- A human can approve, reject, request evidence, or assign a task.
- The decision and follow-up task are stored durably with actor, timestamp, reason, and source workroom.
- The Teams response includes a deep link to the focused web review surface.
- Local mode works without cloud credentials using deterministic fixtures.
- Azure mode uses the same contracts with Entra identity, SQL, Blob, Foundry, and Teams integration boundaries.

## Agent collaboration protocol

Agents are bounded workers, not unrestricted autonomous characters.

### Agent request

An agent-to-agent request must include:

- Parent workroom ID.
- Case ID and permitted record scope.
- Requesting agent ID and version.
- Target capability or agent ID and version.
- Specific question.
- Input evidence references.
- Expected output type.
- Deadline or execution budget.
- Human boundary.

### Agent response

An agent response must include:

- Request and response IDs.
- Agent ID and version.
- Status: completed, inconclusive, blocked, or failed.
- Findings.
- Evidence references.
- Conflicts.
- Unknowns.
- Calculations and visible inputs where relevant.
- Suggested next action.
- Human approval requirement.

### Collaboration rules

- An agent may ask another agent for analysis, extraction, comparison, or calculation.
- An agent may not silently expand its case or permission scope.
- An agent may not turn a missing record into a negative fact.
- An agent may not resolve a conflict by averaging or choosing a preferred source without a defined policy.
- An agent may not certify title, approve payment, file a document, contact an owner, or submit to a regulator.
- A human decision is always represented as a separate event from an agent recommendation.

## Role-to-agent routing

| Human request | Primary capability | Common collaborators | Human owner |
|---|---|---|---|
| Can this matter move forward? | Case intake and readiness | Title, Lease, Compliance, Operations | Requesting reviewer |
| What does this lease require? | Lease and obligation | Legal, Compliance, Accounting | Lease Analyst or Legal |
| Who owns this interest? | Ownership and title | Land, Legal, Division Order | Title/Curative Reviewer |
| Why does this division order not reconcile? | Division order and interest | Title, Lease, Accounting | Division Order Analyst |
| Are we ready for the development gate? | Compliance and readiness | Land, Lease, Legal, Operations | Operations/Compliance |
| What is the payment impact? | Accounting impact | Division Order, Title, Legal | Accounting Reviewer |
| What should we do next? | Case synthesis | All participating agents | Authorized human reviewer |

## Role responsibilities and question families

### Land Analyst

**Worker function:** Intake, identify, coordinate, research, and route land matters.

**Data questions:**

- Which properties, wells, leases, owners, and agreements are connected?
- What is known, conflicting, or missing?
- What business action and deadline define the matter?
- What evidence is needed before the next team can act?

**People questions:**

- Ask Legal whether a title or instrument issue requires legal judgment.
- Ask Lease Administration which terms and dates control.
- Ask Division Order whether the ownership schedule matches payment records.
- Ask Compliance whether the operational gate is supported.

**Outputs:** Case scope, relationship map, missing-document request, assignment, readiness summary.

### Lease Analyst

**Worker function:** Abstract, interpret for business administration, maintain, audit, and monitor lease and contract obligations.

**Data questions:**

- What are the term, renewal, rental, royalty, development, notice, pooling, unitization, depth, and Pugh provisions?
- Which dates can cause a loss of rights or require action?
- Does the lease cover this tract, depth, unit, or well?
- Does the amendment change the original obligation?

**People questions:**

- Ask Legal for clause interpretation.
- Ask Accounting about required payment status.
- Ask Compliance what regulatory event satisfies the obligation.
- Ask Land whether the lease supports the planned activity.

**Outputs:** Lease abstract, obligation, deadline, exception, comparison, Legal question.

### Title and Curative Reviewer

**Worker function:** Reconstruct ownership evidence, identify defects, and manage curative requests.

**Data questions:**

- What instruments support each ownership claim?
- Is the chain complete for the required interest and period?
- What conflicts, gaps, probate, lien, name, recording, or effective-date issues exist?
- What curative evidence would resolve the issue?

**People questions:**

- Ask Legal whether the issue requires an opinion.
- Ask Land what action depends on the title answer.
- Ask Division Order which payee or interest is affected.

**Outputs:** Title timeline, ownership claim, defect, curative checklist, legal escalation, evidence request.

### Division Order Analyst

**Worker function:** Maintain ownership and revenue-distribution records and reconcile interest calculations.

**Data questions:**

- Do interest inputs reconcile to the unit, tract, lease, and title evidence?
- Are working, royalty, ORRI, NRI, and other interests represented correctly?
- Which payee and effective date are supported?
- Why is revenue in suspense?

**People questions:**

- Ask Title which ownership claim controls.
- Ask Lease which royalty and burden provisions apply.
- Ask Accounting which periods and payments are affected.
- Ask Legal whether a transfer is sufficient.

**Outputs:** Reconciliation, formula, exception, suspense explanation, payment-impact packet.

### Compliance Reviewer

**Worker function:** Verify permits, filings, inspections, conditions, enforcement, and reporting readiness.

**Data questions:**

- Is the correct permit present for the planned activity?
- Are conditions, inspections, reports, and corrective actions complete?
- Are public records fresh and authoritative for this question?
- Which filing or record is missing?

**People questions:**

- Ask Operations what activity and date are planned.
- Ask Land whether the rights and agreements are in place.
- Ask Legal whether an exception requires a response.

**Outputs:** Compliance checklist, missing filing, deadline, blocker, conditional readiness status.

### Legal Reviewer

**Worker function:** Apply legal judgment, control legal risk, and decide which recommendations can proceed.

**Data questions:**

- What action is being requested?
- What evidence supports each claim?
- Which facts conflict or remain unknown?
- What interpretation or approval is required?

**People questions:**

- Ask Land for business purpose and timing.
- Ask Lease, Title, Division Order, and Compliance for supporting analysis.

**Outputs:** Legal review, hold, curative direction, approval, rejection, or evidence request.

### Accounting Reviewer

**Worker function:** Evaluate financial impact, suspense, reporting, and control evidence.

**Data questions:**

- Which wells, payees, periods, products, and payments are affected?
- Is the interest result approved and supported?
- What evidence clears or maintains suspense?
- Does the correction affect prior reporting?

**People questions:**

- Ask Division Order for calculation status.
- Ask Title/Legal for ownership or legal holds.
- Ask Compliance or Operations for production and activity context.

**Outputs:** Payment-impact summary, suspense decision, audit packet, accounting escalation.

## Initial web deep links

Teams should link to narrow destinations, not to a giant page.

| Deep link | Purpose |
|---|---|
| `/cases/{caseId}` | Case summary and current next action |
| `/cases/{caseId}/evidence` | Evidence, citations, conflicts, and unknowns |
| `/cases/{caseId}/lease/{recordId}` | Lease terms and obligations |
| `/cases/{caseId}/title` | Ownership chain and curative work |
| `/cases/{caseId}/interests` | Division-order and interest reconciliation |
| `/cases/{caseId}/compliance` | Permits, filings, inspections, and readiness |
| `/workrooms/{threadId}` | Durable collaboration record |
| `/reviews/{packetId}` | Human decision and audit record |

The current single-page showcase may remain as a portfolio/demo route temporarily, but it should not define the production information architecture.

## Implementation sequence

### Phase A — Direction and contracts

- Freeze this direction and acceptance criteria.
- Define the Workroom, agent request, agent response, decision, and task contracts.
- Define Teams message commands and response shapes.
- Define deep-link URL contracts.
- Preserve the existing TypeScript workflow as a behavioral reference.

### Phase B — Local Teams vertical slice

- Run the existing Teams adapter locally.
- Accept a natural-language question with case scope.
- Resolve synthetic Entra persona and allowed group.
- Create a durable Workroom.
- Run at least two bounded agents.
- Store evidence-linked findings, conflicts, and unknowns.
- Return a human-readable Teams response.
- Add a human decision command and task creation.

### Phase C — Focused web review

- Build only the deep-linked case/evidence/review screens needed by Phase B.
- Do not rebuild the all-in-one dashboard.
- Add keyboard/focus, loading, error, empty, and mobile states.
- Verify every screen from the Teams link.

### Phase D — Real Teams integration

- Connect the adapter to Microsoft Teams using the supported Microsoft Teams SDK and Graph boundaries.
- Use Entra identity and group authorization.
- Use adaptive cards or task modules for review actions and deep links.
- Keep local simulator mode deterministic and explicitly labeled.

### Phase E — Azure/Foundry activation

- Keep SQL, Blob, Search, Foundry, Key Vault, App Insights, and Teams contracts aligned with local mode.
- Run Foundry only through the provider boundary.
- Preserve evidence and audit behavior across local and Azure modes.
- Deploy after local tests and bounded integration tests pass.

## Verification plan

### Automated

- Existing TypeScript and .NET unit tests.
- Workroom contract tests.
- Permission and group tests.
- Agent delegation tests.
- Evidence-reference tests.
- Conflict/unknown preservation tests.
- Human-decision boundary tests.
- Deep-link route tests.
- Teams adapter tests.

### Local integration

- Start API, Next.js, and Teams adapter with bounded local processes.
- Send a Legal question for the synthetic Braxton case.
- Confirm the expected multi-agent workroom.
- Confirm response citations and unknowns.
- Approve, reject, and request evidence.
- Confirm a task is assigned to Land.
- Open every returned deep link.

### Microsoft/Azure integration

- Validate Entra identity and group mapping.
- Validate SQL-backed case and Workroom persistence.
- Validate managed identity access to storage and Foundry.
- Validate Teams webhook/bot response.
- Verify Application Insights traces contain correlation IDs without sensitive document contents.

## Non-goals for the first slice

- Autonomous title certification.
- Automatic payee or payment changes.
- External owner or regulator communication.
- Full generic agent-builder UI.
- A universal workflow designer.
- Every lease basin and jurisdiction.
- Replacing Microsoft Teams with a custom social network.
- Rebuilding every prior platform feature.

## Decision requested before broad UI work

The implementation can begin with the local Teams vertical slice, but broad web UI redesign should wait until the product owner confirms:

1. Teams is the primary interaction surface.
2. The first flagship scenario is the Legal-to-Land/Title readiness review.
3. The case/workroom/evidence contracts are the durable product core.
4. The web app is a focused review and administration surface.
5. The current one-page showcase is no longer the production information architecture.

## Source grounding

This direction builds on the role and operating research in [LANDOPS_USER_WORKFLOWS_RESEARCH.md](LANDOPS_USER_WORKFLOWS_RESEARCH.md), especially:

- [AAPL Landman Toolkit](https://www.landman.org/resources/landman-toolkit.html)
- [AAPL landwork definitions](https://www.landman.org/join-engage/membership-types/active-members.html)
- [NADOA](https://nadoa.org/about/)
- [PETEX Division Order Certificate Program](https://petex.utexas.edu/e-learning/ecourses/division-order)
- [WVDEP Oil and Gas responsibilities](https://dep.wv.gov/Permits/Pages/default.aspx)
- [BLM General Leasing](https://www.blm.gov/programs/energy-and-minerals/oil-and-gas/leasing/general-leasing)
- [ONRR Minerals Production Reporter Handbook](https://www.ntc.blm.gov/krc/uploads/812/Minerals%20Production%20Reporter%20Handbook%20Release%202.0%20%20Sept%2015%202014.pdf)

## Current status

The local Teams adapter, SQL-backed human action record, and focused Workroom
deep-link surface are implemented and verified. A real Microsoft 365 tenant
connection, bot registration, and production Teams channel deployment remain
activation work; they are intentionally separate from the local proof.
