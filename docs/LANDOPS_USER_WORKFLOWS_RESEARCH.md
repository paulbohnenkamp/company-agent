# LandOps User Workflows and Information Architecture Research

**Status:** Product discovery and UX foundation; no UI implementation approval  
**Date:** 2026-09-06  
**Audience:** Product owner, domain reviewers, application developers, agent designers, and portfolio reviewers  
**Scope:** Fictional oil-and-gas operator workflow using synthetic private records, public West Virginia and BLM evidence, Microsoft Entra-style roles, browser workspaces, agent conversations, and Microsoft Teams collaboration

## Executive conclusion

LandOps should be organized around work that people need to complete, not around the number of agents or data sets available.

The users share a connected record system, but they have different questions, decisions, evidence standards, and handoffs:

- A Land Analyst asks whether a matter is sufficiently understood to move forward.
- A Lease Analyst asks what rights and obligations exist, what dates matter, and what action preserves the asset.
- A Title or Curative Reviewer asks whether the ownership chain is supported and what defects remain.
- A Division Order Analyst asks whether interests and payees reconcile and whether revenue can be distributed safely.
- A Compliance Reviewer asks whether permits, filings, inspections, and conditions are satisfied.
- An Accounting Reviewer asks what financial or payment impact follows from an unresolved land or ownership issue.
- A Legal Reviewer decides what requires legal judgment and what can be routed back to the business.
- An Operations or Development user asks whether the property is ready for the next operational gate.

The product therefore needs three distinct experiences:

1. **My Work:** role-specific queue, deadlines, exceptions, and requests.
2. **Case Workspace:** shared evidence, documents, relationships, agent analysis, tasks, and decisions for one matter.
3. **Conversation and Workroom:** private grounded questions for one user, plus a shared Teams-like or real Teams collaboration thread when multiple people or agents need to act.

The current one-page UI should not be expanded further. It should be reorganized around these jobs and the transitions between them.

## Research method and confidence

This brief was refined through several passes:

1. Existing repository and product review: current LandOps components, role scenarios, seed records, agent catalog, Teams view, and UI issue report.
2. Professional role definitions: American Association of Professional Landmen (AAPL) and National Association of Division Order Analysts (NADOA).
3. Representative lease/title analyst, division-order analyst, and land administration role descriptions.
4. Government and regulatory sources: WVDEP, BLM, and ONRR materials describing records, permits, lease administration, royalty, and production reporting.
5. Education and reference materials: University of Texas PETEX curriculum, AAPL books and model forms, and title/land reference material.

The strongest conclusions are supported by multiple sources. Exact job boundaries vary by operator size, basin, jurisdiction, and whether a company combines Land, Legal, Land Administration, Revenue, and Compliance functions. The product should model responsibilities as configurable permissions and work types, while keeping the initial experience opinionated and simple.

This is product research, not legal, accounting, title, or regulatory advice. Agents must surface evidence and route judgment; they must not certify title, approve payment, file instruments, or contact owners without an authorized human workflow.

## What the work actually consists of

### Shared business objects

Most of the work revolves around a common set of objects:

- **Matter or case:** the question, property, well, transaction, deadline, or exception being worked.
- **Property:** tract, parcel, section, township/range or other legal description, county, state, and surface/mineral relationship.
- **Well:** API number, well name/number, operator, status, permit, production, location, and regulatory history.
- **Lease:** lessor, lessee, acreage, effective date, primary term, extension or renewal, royalty, rental, development, pooling, unitization, depth, Pugh, shut-in, and other provisions.
- **Title evidence:** deeds, assignments, probate documents, affidavits, title opinions, curative instruments, recorded instruments, and exceptions.
- **Ownership and interest:** mineral, working, royalty, overriding royalty, net revenue, nonparticipating royalty, burden, payee, and effective date.
- **Division order:** the distribution instruction and associated owner, interest, product, property, and payment context.
- **Obligation:** a lease, regulatory, contractual, payment, filing, or operational requirement with a due date and evidence.
- **Regulatory record:** permit, inspection, enforcement action, production report, completion report, plugging record, water or air requirement, or other agency record.
- **Document:** source file, scan, email, spreadsheet, map, public record, OCR output, extracted field set, or generated review packet.
- **Finding:** an evidence-linked assertion with status, confidence, producer, and supporting records.
- **Conflict:** two or more claims that cannot be treated as one fact without human judgment.
- **Unknown:** an explicit unanswered question and the evidence needed to answer it.
- **Task or handoff:** an assigned request from one person or agent to another, with status and due date.
- **Decision:** a human-controlled approval, hold, request for evidence, interpretation, or route to another team.

The UI should show these relationships in context. A user should not have to remember which agent owns which record type.

### The common lifecycle

```text
Question or trigger
  -> identify matter and scope
  -> gather private and public records
  -> extract structured facts with provenance
  -> compare claims and calculate where appropriate
  -> identify findings, conflicts, and unknowns
  -> assign specialists and people
  -> review evidence and implications
  -> record human decision or next request
  -> monitor obligations, deadlines, and follow-up
```

The important design implication is that analysis is not the end of the workflow. A useful result tells the user what is known, what is not known, who needs to act, and what evidence or approval is needed next.

## Role profiles

### Land Analyst / Company Landman

#### Mission

Manage mineral and land rights through acquisition, ownership research, negotiation, agreements, due diligence, and coordination with Legal, Land Administration, Operations, and Accounting.

AAPL describes company landmen as handling negotiations, drafting and administering agreements, acquiring leases, clearing title, preparing land for operations, and ensuring regulatory compliance. AAPL also describes field landmen as researching courthouse records, determining ownership, preparing reports, locating owners, negotiating leases, obtaining curative documents, and conducting surface inspections. These are broad functions, so LandOps should distinguish the specific assignment rather than use “landman” as one generic permission.

Sources: [AAPL Landman Toolkit](https://www.landman.org/resources/landman-toolkit.html), [AAPL landwork definitions](https://www.landman.org/join-engage/membership-types/active-members.html).

#### Typical work

- Open or triage a new property, well, acquisition, or lease matter.
- Research public and private records to identify ownership and related interests.
- Coordinate title, lease, surface, regulatory, and operational evidence.
- Prepare reports, runsheets, due-diligence packages, and requests for curative documents.
- Negotiate or administer land agreements where authorized.
- Prepare a tract or well for drilling, development, acquisition, divestiture, or operations.
- Track unresolved issues and coordinate specialists.

#### Questions the Land Analyst asks of the data

- What properties, wells, leases, owners, and agreements are connected to this matter?
- What is the current ownership claim, and which records support it?
- Which ownership or identifier conflicts exist across company, county, state, and federal sources?
- What acreage, depth, unit, and interest scope appears to be covered?
- What documents are missing before the matter can move to title, leasing, operations, or payment review?
- What deadlines, options, rentals, development obligations, or regulatory gates are approaching?
- What changed since the last review or acquisition close?

#### Questions asked of other people

- To Legal: “Is this chain or instrument sufficient for the intended business action?”
- To Lease Administration: “Which lease provisions and dates control this property?”
- To Division Order: “Does the proposed ownership or interest match the pay deck?”
- To Compliance: “Is the permit or filing package complete for the next gate?”
- To Operations: “What activity, location, or schedule should this land package support?”

#### Useful agent support

- Case intake and entity resolution.
- Property/well/lease relationship discovery.
- Evidence comparison and conflict detection.
- Document checklist generation.
- Due-diligence summary and next-request drafting.
- Deadline and obligation monitoring.

#### Human decisions and boundaries

The Land Analyst may coordinate and recommend. Negotiation, acceptance of legal terms, title certification, owner contact, acquisition approval, and recording decisions remain human-controlled.

#### Primary workspace needs

- Matter queue and intake form.
- Property/well/lease relationship view.
- Evidence and missing-document checklist.
- Exception and deadline queue.
- Assignment and handoff panel.
- Grounded case conversation.

---

### Lease Analyst / Lease Administration Specialist

#### Mission

Interpret, abstract, maintain, audit, and administer lease and contract terms so the company preserves rights, satisfies obligations, and acts before important dates expire.

Representative employer descriptions emphasize analyzing leases, amendments, ratifications, assignments, title instruments, royalty and pooling terms, depth and Pugh restrictions, continuous development, nonparticipating interests, record maintenance, data audits, obligation reports, rental reports, and expiration reports. ExxonMobil also describes maintaining relationships among wells, leases, contracts, acreage, ownership, GIS, title opinions, deeds, and state/federal sources.

Sources: [Texas Pacific Land Lease Analyst description](https://recruiting.paylocity.com/recruiting/jobs/Details/4024174/Texas-Pacific-Land-Corporation/Lease-Analyst), [ExxonMobil Lease & Title Analyst description](https://jobs.exxonmobil.com/job/Spring-2026USH-Lease-%26-Title-Analyst-TX-77389/1426970300/), [Harvest Midstream Lease Analyst description](https://hec.wd5.myworkdayjobs.com/en-US/Harvest_Midstream/job/Houston-TX/Lease-Analyst_R006245), [Ring Energy Lease Records Analyst description](https://www.ringenergy.com/careers/job/7811/senior-lease-records-analyst).

#### Typical work

- Set up and maintain lease, easement, contract, assignment, and amendment records.
- Abstract economic, legal, operational, and timing terms.
- Monitor primary term, extensions, renewals, delay rentals, shut-in payments, continuous development, and expiration.
- Track rental, royalty, development, reporting, and notice obligations.
- Relate leases to tracts, wells, units, owners, interests, and operators.
- Audit data and resolve discrepancies between documents and land systems.
- Produce obligation, expiration, rental, and ownership reports.
- Support acquisitions, divestitures, data cleanup, and post-closing integration.

#### Questions asked of the data

- What is the current term and status of this lease?
- What dates can cause loss of rights or require action?
- What payments, notices, operations, or filings preserve the lease?
- Does the lease cover this tract, depth, unit, well, or operation?
- What do the amendment, ratification, assignment, and original lease say together?
- Which terms differ between the document and the land system?
- Are the royalty, working interest, NRI, NPRI, or burdens represented correctly?
- What needs Legal interpretation?

#### Questions asked of other people

- To Land: “Which tract and development plan should this lease support?”
- To Legal: “How should this clause or amendment be interpreted?”
- To Compliance: “What regulatory event satisfies or affects the obligation?”
- To Accounting: “Has the required payment been made or scheduled?”

#### Useful agent support

- Lease and amendment extraction with clause citations.
- Obligation and deadline calendar generation.
- Lease-to-well and lease-to-tract relationship checks.
- Expiration and renewal risk detection.
- Difference comparison between source documents and system records.
- Report drafting with source clauses and confidence.

#### Human decisions and boundaries

Agents may extract and compare terms. A person must decide legal meaning, whether an obligation is satisfied, whether to pay or extend, and whether the company should accept a lease position.

#### Primary workspace needs

- Lease portfolio queue sorted by risk and date.
- Lease abstract with clause-level evidence.
- Obligation calendar and reminders.
- Document comparison view.
- Change history and data-quality exceptions.
- Ask-and-handoff conversation.

---

### Title Analyst / Curative Reviewer / Title Counsel

#### Mission

Determine whether ownership and title claims are supported by the available chain of title, identify defects and exceptions, obtain or recommend curative documents, and preserve the boundary between evidence comparison and legal determination.

AAPL defines landwork as determining ownership through public and private records, reviewing title status, curing title defects, and performing title due diligence. Title-oriented role descriptions emphasize deeds, assignments, probate documents, title opinions, affidavits, conveyances, owner communications, curative tracking, and coordination with Legal, Land, Accounting, and operators.

Sources: [AAPL landwork definitions](https://www.landman.org/join-engage/membership-types/active-members.html) and the [EOG Staff Title Analyst description](https://www.indeed.com/viewjob?jk=3f93ac27322aa92d).

#### Typical work

- Review title opinions, deeds, assignments, leases, probate, affidavits, court orders, and other instruments.
- Build a chain-of-title timeline.
- Identify gaps, name variations, unreleased liens, probate issues, missing signatures, conflicting conveyances, and other defects.
- Determine what evidence is required to cure or explain an exception.
- Coordinate with owners, attorneys, operators, land, and division-order teams.
- Track curative items from request through receipt, review, recording, and system update.
- Respond to ownership and royalty inquiries.

#### Questions asked of the data

- Who appears to own the relevant mineral, leasehold, or revenue interest?
- What instrument transferred or reserved the interest?
- Is the chain complete for the relevant time and interest type?
- Which claims conflict, and can the conflict be explained by scope or effective date?
- What does the title opinion require or except?
- Is the document recorded, effective, signed, acknowledged, and within the relevant jurisdiction?
- What curative instrument or external evidence is needed?
- What conclusion is supported, and what must remain unknown?

#### Questions asked of other people

- To Land: “What business action depends on this title question?”
- To Legal: “Does this defect require an attorney’s interpretation or opinion?”
- To Division Order: “Which payee, interest, or suspense record is affected?”
- To Accounting: “What payment or reporting consequence follows?”

#### Useful agent support

- Document classification and OCR quality review.
- Party and instrument extraction.
- Chain-of-title timeline construction.
- Conflict and missing-link detection.
- Curative checklist generation.
- Evidence-linked questions for human review.

#### Human decisions and boundaries

An agent must never state that it has certified title. It may say that a claim is supported, unsupported, conflicting, or unknown based on cited records. Title opinions, legal interpretations, acceptance of curative documents, owner contact, and recording remain human actions.

#### Primary workspace needs

- Chain-of-title timeline.
- Document viewer with highlighted citations.
- Ownership graph or table by effective date.
- Exceptions and curative checklist.
- Legal review and escalation panel.
- Decision record with reviewer identity and evidence.

---

### Division Order Analyst

#### Mission

Maintain mineral ownership and interest records and ensure that oil, gas, or mineral revenue is distributed to the correct parties based on supported title, lease, agreement, and interest calculations.

NADOA describes the Division Order Analyst as responsible in some manner for proper distribution of mineral revenues and ongoing maintenance of mineral ownership for wells. Current role descriptions emphasize title opinions, leases, curative requirements, suspense, conveyances, address changes, division-of-interest decks, pay decks, working interest, royalty, ORRI, NRI, apportionment, and owner relations.

Sources: [NADOA definition](https://nadoa.org/about/), [Repsol Division Order Analyst description](https://repsol.wd3.myworkdayjobs.com/en-US/Repsol/job/Division-Order-Analyst_81807-2), [PETEX Division Order Certificate curriculum](https://petex.utexas.edu/e-learning/ecourses/division-order), [Senior Division Order Analyst role description](https://host.pcrecruiter.net/pcrbin/jobboard/job/Senior-Division-Order-Analyst/b/LTTAMXQB6POIGOC5D4SZMSADPP25ZR7JUHMDK3WFPIW2JYA2KEVBENQGKZU3VHFPRGYIPXGWVGULPKCQYY53I3JYGAITDUFS44WOOY).

#### Typical work

- Review title opinions, leases, agreements, conveyances, and curative records.
- Calculate and maintain division-of-interest and revenue/pay decks.
- Validate working interest, royalty, ORRI, NRI, DOI, and apportionment values.
- Process ownership transfers and address changes.
- Maintain suspense files while title or owner issues are unresolved.
- Coordinate with Revenue Accounting, Land, Legal, owners, operators, and purchasers.
- Verify updates for infill wells, unit reformations, and post-acquisition records.

#### Questions asked of the data

- Do the interests reconcile to the unit, tract, lease, and title evidence?
- Do the working, royalty, overriding, and net revenue interests total correctly?
- Which owner or payee is supported for this product and property?
- What changed since the last approved division order?
- Why is revenue in suspense?
- Which records are needed to release or keep funds in suspense?
- Does this transfer affect the current pay deck or only a future effective date?
- Is the result within the authority of this analyst, or does it require Legal or management approval?

#### Questions asked of other people

- To Title: “Which ownership claim should control, and what remains unresolved?”
- To Lease: “Which lease royalty and burden provisions apply?”
- To Accounting: “What payment period and ledger records are affected?”
- To Legal: “Is this transfer or curative document legally sufficient?”

#### Useful agent support

- Interest calculation with visible inputs and formulas.
- Cross-record reconciliation.
- Payee and ownership change comparison.
- Suspense reason classification and evidence checklist.
- Outlier and total-of-interest detection.
- Draft owner or internal questions without sending them.

#### Human decisions and boundaries

Agents may calculate, reconcile, explain, and route. They must not release funds, change a production pay deck, approve a payee change, or contact an owner without an authorized human approval step.

#### Primary workspace needs

- Interest table with formula inputs and results.
- Before/after ownership comparison.
- Suspense queue and reason codes.
- Linked title, lease, and division-order evidence.
- Payment-impact summary.
- Approval and audit trail.

---

### Compliance Reviewer

#### Mission

Verify that permits, inspections, filings, operating conditions, reporting obligations, and corrective actions are complete and traceable for the relevant jurisdiction and asset.

For West Virginia, the WVDEP Office of Oil and Gas oversees permitting, inspection, enforcement, drilling, production, storage, plugging, and related mine-safety issues. WVDEP publishes permit, enforcement, well, production, and operator data, while also warning that reported public data may not be complete or error-free. This matters directly to the application: public regulatory data is valuable evidence, but it is not automatically a final determination.

Sources: [WVDEP Office of Oil and Gas](https://dep.wv.gov/Permits/Pages/default.aspx), [WVDEP Oil and Gas database](https://dep.wv.gov/oil-and-gas/databaseinfo/pages/ogd.aspx), [WVDEP Data Center](https://dep.wv.gov/Data/Pages/default.aspx), [WVDEP forms and reporting](https://dep-auth.wv.gov/oil-and-gas/GI/Forms/Pages/default.aspx).

#### Typical work

- Review permits, applications, conditions, inspections, violations, completions, production reports, plugging, reclamation, and related filings.
- Confirm that the correct jurisdiction, operator, well, permit, and reporting period are being reviewed.
- Track compliance requirements and deadlines.
- Identify missing or inconsistent records.
- Coordinate remediation with Operations, Land, Legal, and external specialists.
- Prepare evidence for internal gates, audits, and management review.

#### Questions asked of the data

- Does the well or facility have the required permit for the planned activity?
- Are permit conditions, inspections, and required reports complete?
- Are there open violations, complaints, enforcement actions, or corrective items?
- Do public records agree with company records on operator, well status, location, or production?
- Which record is authoritative for this particular claim?
- What is the reporting period and what is the source freshness?
- What evidence is needed before a compliance gate can pass?

#### Questions asked of other people

- To Operations: “What activity is planned and when?”
- To Land: “Which rights and agreements support the site?”
- To Legal: “Does this exception require a legal response?”
- To Accounting: “Are fees, bonds, or financial assurance affected?”

#### Useful agent support

- Jurisdiction-aware record retrieval.
- Permit and filing checklist generation.
- Public/company record comparison.
- Deadline and exception monitoring.
- Evidence freshness and source-authority labeling.
- Audit packet preparation.

#### Human decisions and boundaries

Compliance agents can compare records and identify gaps. They cannot certify regulatory compliance, submit filings, represent the company to a regulator, or waive a condition.

#### Primary workspace needs

- Compliance checklist by jurisdiction and activity.
- Permit and filing timeline.
- Open issue and deadline queue.
- Source-authority and freshness display.
- Inspection/enforcement history.
- Responsible-person assignment and evidence request.

---

### Legal Reviewer / Energy Counsel

#### Mission

Apply legal judgment to title, contract, lease, curative, regulatory, transaction, and owner-related questions while controlling legal risk and preserving the line between analysis and advice.

#### Typical work

- Review title opinions, lease provisions, assignments, purchase and sale terms, curative documents, and regulatory matters.
- Determine whether evidence supports the intended business action.
- Identify issues requiring attorney interpretation.
- Approve or reject curative positions and legal language.
- Set the human decision boundary for high-consequence actions.
- Provide direction to Land, Lease Administration, Division Order, Compliance, Accounting, and Operations.

#### Questions asked of the data

- What exactly is the requested business action?
- What evidence supports each claim?
- Which records conflict or are incomplete?
- What is the relevant jurisdiction, effective date, instrument, and interest type?
- What assumptions did the analysis make?
- What should be requested, held, approved, or escalated?

#### Useful agent support

- Evidence packet assembly.
- Clause and instrument comparison.
- Timeline and relationship reconstruction.
- Issue spotting and question generation.
- Draft internal summaries that clearly separate fact, inference, and unresolved legal judgment.

#### Human decisions and boundaries

Legal remains the decision owner for legal interpretations, title conclusions, external communications, settlement, recording, and high-risk approvals.

#### Primary workspace needs

- Review queue prioritized by risk and deadline.
- Evidence packet with claim-to-source links.
- Conflict and unknown review.
- Comments and requests to other roles.
- Decision record and legal hold state.

---

### Revenue Accounting / Accounting Reviewer

#### Mission

Understand and control the financial consequences of land, title, ownership, production, and division-order changes, including revenue distribution, suspense, reporting, and audit evidence.

Division-order and revenue workflows intersect with accounting because ownership and interest errors can affect payment, revenue allocation, suspense, tax reporting, and audit controls. ONRR materials describe production reporting, financial accounting systems, error detection and correction, due dates, record retention, and reporting obligations for federal and Indian minerals. Public-company filings also show why revenue, ownership, production, and control evidence must remain traceable.

Sources: [ONRR Minerals Production Reporter Handbook](https://www.ntc.blm.gov/krc/uploads/812/Minerals%20Production%20Reporter%20Handbook%20Release%202.0%20%20Sept%2015%202014.pdf), [ONRR reporting overview](https://www.onrr.gov/), [SEC oil and gas revenue example](https://www.sec.gov/Archives/edgar/data/822746/000149315222028233/ex99-1.htm).

#### Typical work

- Review revenue, payment, suspense, ownership, and interest-impact information.
- Reconcile accounting records to division orders, production, contracts, and owner records.
- Track payment holds, unresolved ownership, returned mail, and unlocated owners.
- Validate changes before posting or releasing payment.
- Support audit, control, tax, and reporting requirements.
- Explain downstream financial impact to Land, Legal, and management.

#### Questions asked of the data

- Which wells, owners, products, periods, and payments are affected?
- Is the interest calculation supported and approved?
- Why is money in suspense, and what evidence clears it?
- What changed after the last close or payment run?
- Does the proposed correction affect historical periods or reporting?
- Is there an audit trail from source document to calculation to approval?

#### Useful agent support

- Payment-impact analysis.
- Reconciliation and outlier detection.
- Suspense categorization.
- Evidence and approval checklist.
- Audit packet and change explanation.

#### Human decisions and boundaries

Agents must not release funds, post financial adjustments, change payees, or approve accounting entries. They may prepare evidence and calculations for an authorized reviewer.

#### Primary workspace needs

- Payment-impact view.
- Suspense queue.
- Reconciliation table.
- Period and change history.
- Approval/control evidence.

---

### Operations / Development Readiness Coordinator

#### Mission

Determine whether the land, lease, title, regulatory, and accounting prerequisites for a planned operational activity are ready, blocked, or awaiting a named owner.

#### Typical work

- Define the operational gate and target date.
- Ask Land, Lease, Legal, Compliance, and Accounting for readiness evidence.
- Track missing permits, surface rights, lease obligations, title exceptions, and payment dependencies.
- Coordinate a go/no-go review without pretending the system owns the final decision.

#### Questions asked of the data

- Is the site or well correctly identified?
- Are the necessary rights, permits, and agreements in force?
- Are there unresolved title, lease, compliance, or payment blockers?
- Which tasks are late or unassigned?
- What evidence supports a ready, blocked, or conditional status?

#### Useful agent support

- Readiness checklist.
- Cross-functional blocker aggregation.
- Deadline and dependency tracking.
- Evidence-linked status summary.

#### Primary workspace needs

- Gate dashboard.
- Blocker list with owners.
- Deadline timeline.
- Cross-functional workroom.
- Decision record.

## Cross-role questions and handoffs

The most valuable product behavior is not a single agent answering a question. It is the system recognizing when another role owns the next answer.

| Starting question | First worker | Likely collaborators | Result |
|---|---|---|---|
| “Can this matter move forward?” | Land Analyst | Title, Lease, Compliance, Operations | Readiness packet with blockers |
| “What does this lease require before the gate?” | Lease Analyst | Legal, Compliance, Accounting | Obligation summary and due dates |
| “Who owns this interest?” | Title Analyst | Land, Legal, Division Order | Ownership chain and curative list |
| “Why does this division order not reconcile?” | Division Order Analyst | Title, Lease, Accounting | Calculation and exception packet |
| “Can we release this payment?” | Accounting Reviewer | Division Order, Legal, Title | Human approval or hold |
| “Are we compliant for this activity?” | Compliance Reviewer | Operations, Land, Legal | Compliance checklist and open issues |
| “What needs to happen before drilling?” | Operations Coordinator | Land, Lease, Legal, Compliance | Development-readiness review |
| “What should I ask the owner?” | Human role owner | Title, Legal, Division Order | Draft request for human approval |

### Example delegated conversation

```text
Legal: Can we move API 4700701733 forward?
  -> LandOps identifies the case and Legal's permissions.
  -> Ownership agent checks ownership records.
  -> Title agent reconstructs the relevant chain.
  -> Lease agent checks whether the lease scope applies.
  -> Compliance agent checks the relevant operational gate.
  -> Synthesizer returns supported facts, conflicts, unknowns, and next request.
  -> Legal decides: approve next step, request curative evidence, or hold.
```

The system should show this as a traceable workroom handoff. It should not make the user understand an internal agent graph before they can ask the question.

## Use-case catalog

### UC-01 — Open and triage a new matter

**Actor:** Land Analyst  
**Trigger:** A lease package, acquisition package, title question, well, or owner request arrives.  
**Needed information:** Matter purpose, property/well identifiers, jurisdiction, target date, source documents, requester, business action, related lease/owner/operator.  
**Agent work:** Extract identifiers, resolve likely entities, classify records, identify missing inputs, suggest initial specialists.  
**Human result:** Matter is accepted, returned for missing information, or routed to a named workgroup.  
**Screen:** Intake and triage workspace.

### UC-02 — Review lease obligations and critical dates

**Actor:** Lease Analyst  
**Trigger:** A lease is received, amended, approaching expiration, or connected to a planned operation.  
**Needed information:** Lease and amendments, legal description, parties, term, options, rentals, royalties, development and notice clauses, related wells/tracts, payment status.  
**Agent work:** Abstract clauses, build obligations, calculate date windows, compare source and system records, flag uncertainty.  
**Human result:** Obligation accepted, task assigned, payment/notice recommended, or Legal review requested.  
**Screen:** Lease detail with clause evidence and obligation calendar.

### UC-03 — Build and review a chain of title

**Actor:** Title Analyst or Legal Reviewer  
**Trigger:** Ownership is disputed, a transaction requires due diligence, or a division order needs support.  
**Needed information:** Deeds, assignments, leases, probate, affidavits, title opinions, recording details, legal descriptions, effective dates, parties, exceptions.  
**Agent work:** Extract instruments, order the chain, identify gaps and conflicting claims, generate curative checklist.  
**Human result:** Evidence is accepted as sufficient, a curative request is created, or the matter is held for legal judgment.  
**Screen:** Title timeline and evidence viewer.

### UC-04 — Reconcile a division order

**Actor:** Division Order Analyst  
**Trigger:** New well, ownership change, title update, unit reformation, acquisition close, or payment exception.  
**Needed information:** Title opinion, ownership schedule, lease, tract and unit acres, interest types, payee records, production/property scope, effective dates, prior deck.  
**Agent work:** Normalize parties, calculate visible formulas, compare totals, identify missing support and pay-status changes.  
**Human result:** Review packet approved, exception sent to Title/Legal, or funds remain in suspense.  
**Screen:** Interest reconciliation and payment-impact view.

### UC-05 — Review a regulatory or operational gate

**Actor:** Compliance Reviewer or Operations Coordinator  
**Trigger:** Permit, drilling, completion, production, plugging, reclamation, or development milestone.  
**Needed information:** Jurisdiction, operator, API, permit, conditions, filing, inspection, enforcement, production, target activity, deadline.  
**Agent work:** Retrieve jurisdictional records, compare company/public claims, flag freshness and missing filings.  
**Human result:** Gate is ready, conditionally ready, blocked, or assigned for remediation.  
**Screen:** Readiness checklist and regulatory timeline.

### UC-06 — Ask a private case question

**Actor:** Any authorized role  
**Trigger:** A user needs an answer without starting a shared workroom.  
**Needed information:** Current case, user role, question, conversation history, permitted evidence.  
**Agent work:** Answer only from scoped evidence, cite records, distinguish known/unknown/conflict, offer a next action.  
**Human result:** User accepts the answer, asks a follow-up, or shares the question with a workgroup.  
**Screen:** Case Copilot.

### UC-07 — Ask another role or agent to act

**Actor:** Human requester or orchestrating agent  
**Trigger:** The answer requires another specialty or a human decision.  
**Needed information:** Request, case scope, required group, priority, due date, context excerpt, evidence permissions.  
**Agent work:** Create bounded handoff, select permitted specialist, preserve context, return a packet.  
**Human result:** Recipient accepts, asks for clarification, completes work, or routes onward.  
**Screen:** Workroom thread.

### UC-08 — Record a human decision

**Actor:** Authorized reviewer  
**Trigger:** Findings and evidence are ready for a decision.  
**Needed information:** Findings, conflicts, unknowns, source records, reviewer identity, decision type, reason, follow-up owner.  
**Agent work:** Summarize decision context and check required evidence; never make the approval itself.  
**Human result:** Approve next step, request revision, place hold, request documents, or assign a task.  
**Screen:** Review and decision panel.

### UC-09 — Investigate a payment or suspense exception

**Actor:** Accounting or Division Order Analyst  
**Trigger:** Payment is held, owner disputes a payment, or interest totals do not reconcile.  
**Needed information:** Payment period, production, payee, interest deck, title support, suspense reason, prior approvals, change history.  
**Agent work:** Reconcile records, explain discrepancies, identify evidence needed to clear or maintain suspense.  
**Human result:** Hold maintained, correction prepared, Legal/Title requested, or payment released by an authorized person.  
**Screen:** Exception and payment-impact workspace.

### UC-10 — Prepare an acquisition or divestiture review

**Actor:** Land Manager, Legal, or due-diligence team  
**Trigger:** A transaction enters a defined review period.  
**Needed information:** Asset list, leases, title opinions, contracts, wells, ownership, production, obligations, litigation/encumbrances, data room documents, defect rules, deadlines.  
**Agent work:** Inventory records, identify missing documents, classify defects, compare seller data to public and internal data, build an issue list.  
**Human result:** Defect list, request list, negotiation position, or transaction approval recommendation.  
**Screen:** Transaction review workspace.

## Information architecture

### Primary navigation

The first version should have a small number of durable destinations:

```text
LandOps Workbench
├── My Work
│   ├── Assigned to me
│   ├── Waiting on others
│   ├── Deadlines
│   └── Exceptions
├── Cases
│   ├── Active cases
│   ├── Create case
│   └── Saved views
├── Workrooms
│   ├── Team conversations
│   ├── Agent handoffs
│   └── Decisions awaiting review
├── Data and evidence
│   ├── Documents
│   ├── Leases and obligations
│   ├── Ownership and title
│   ├── Wells and regulatory
│   └── Division orders and interests
└── Administration
    ├── People and Entra groups
    ├── Agent catalog
    ├── Skills and tools
    └── Audit and configuration
```

The synthetic identity catalog, agent inventory, and seed data room are valuable for the portfolio story, but they belong under Administration or a demo context. They should not be the first thing every business user sees.

### Screen model

#### Screen 1 — My Work

Purpose: answer “What needs my attention?”

Show:

- Current user, department, and active permissions.
- Assigned cases and tasks.
- Items waiting on the user.
- Items waiting on another role.
- Upcoming lease, compliance, and transaction deadlines.
- High-severity conflicts and payment-impact exceptions.
- Recent agent handoffs and decisions.

Do not show:

- Every agent definition.
- Every synthetic person.
- All source records without a work reason.

#### Screen 2 — Case Workspace

Purpose: answer “What is this matter, what do we know, and what should happen next?”

Top region:

- Matter title and purpose.
- Status: intake, analysis, blocked, awaiting human review, approved next step, closed.
- Property/well/lease identifiers.
- Requester, owner, participants, target date, and current decision.
- Synthetic/public/private data boundary.

Main regions:

- Facts and relationships.
- Evidence and documents.
- Findings, conflicts, and unknowns.
- Tasks and handoffs.
- Case Copilot.
- Decision history.

The next action should always be visible: request document, ask Legal, review lease obligation, reconcile interest, open workroom, or record decision.

#### Screen 3 — Record detail

Purpose: answer “What does this lease/title/interest/permit actually say?”

Use one record type per detail view, with shared evidence conventions:

- Source document and document metadata.
- Extracted fields.
- Clause or page citations.
- Related records.
- Effective dates.
- Source authority and freshness.
- Agent extraction versus human-verified values.
- Change history.

#### Screen 4 — Case Copilot

Purpose: answer “Can I ask a focused question privately?”

Show:

- Current case scope.
- Current user and role.
- Suggested questions relevant to that role.
- Answer with citations.
- Explicit conflict and unknown treatment.
- Follow-up question.
- “Share with Workroom” action.

Do not make the user select an agent graph. The system can show which specialists participated after the answer is produced.

#### Screen 5 — Workroom / Teams

Purpose: answer “Who is working on this, what has each person or agent contributed, and what remains?”

Show:

- Human participants and role.
- Agent participants and capability.
- Original question and context.
- Delegation sequence.
- Evidence-linked messages.
- Requests and replies.
- Human boundary.
- Decision, owner, and due date.

The browser implementation can be a Teams-style preview, but it must be clearly labeled unless it is connected to an actual Teams channel. The real Teams integration should reuse the same workroom contract.

#### Screen 6 — Review and decision

Purpose: answer “What am I approving, holding, or asking for?”

Show:

- Proposed route.
- Supporting findings.
- Conflicts and unknowns.
- Evidence coverage.
- Financial, legal, operational, or compliance impact.
- Required reviewer role.
- Decision controls and reason.
- Follow-up tasks.

## Agent responsibility model

Agents should be capabilities attached to business work, not characters in a decorative list.

| Agent capability | Reads | Produces | Must not do |
|---|---|---|---|
| Intake and triage | Submitted package, identifiers, case metadata | Case scope, missing inputs, specialist route | Decide title or legal sufficiency |
| Lease and obligation | Leases, amendments, contracts, calendars | Abstract, obligations, dates, exceptions | Interpret ambiguous law as final |
| Ownership and title | Deeds, assignments, title opinions, probate, public records | Chain, claims, conflicts, curative checklist | Certify title or record instruments |
| Well and regulatory | WVDEP/WVGES/BLM and company well records | Identity comparison, regulatory evidence, source freshness | Certify compliance or approve permits |
| Division order and interest | Title, leases, ownership, pay decks, production scope | Formula, reconciliation, suspense explanation | Release funds or change payees |
| Compliance | Permits, conditions, filings, inspection/enforcement records | Checklist, gaps, deadlines, remediation route | Waive conditions or file externally |
| Accounting impact | Interest results, production/payment context, suspense | Impact summary, exception explanation, audit packet | Post entries or release payment |
| Case synthesizer | All bounded outputs and provenance | Findings, conflicts, unknowns, proposed route | Hide uncertainty or make the human decision |
| Collaboration coordinator | Question, permissions, workroom context | Handoff, participants, task, response packet | Expand access or bypass RBAC |

Every output should include:

- Case and record scope.
- Agent and producer version.
- Source references.
- Facts versus inference.
- Conflicts.
- Unknowns.
- Confidence or evidence coverage.
- Recommended next action.
- Human approval requirement.

## Data and evidence requirements by task

| Task | Minimum useful data | High-value additional data | Critical caution |
|---|---|---|---|
| Lease obligation review | Lease, amendments, effective dates, legal description | Payment history, well status, operations reports | A clause extraction is not legal interpretation |
| Title chain | Instruments, parties, dates, recording details, legal descriptions | Title opinions, probate, affidavits, maps, prior exceptions | Public well identity does not prove mineral title |
| Division order | Ownership schedule, interest types, unit/tract acres, payee, effective date | Production, prior deck, suspense, correspondence | Calculation must expose inputs and preserve approval |
| Regulatory readiness | Jurisdiction, API, permit, condition, filing, inspection | Enforcement, production, air/water/waste, maps | Public data may be incomplete or stale |
| Payment exception | Period, payee, interest, production, suspense reason | Prior approvals, owner correspondence, tax context | No automated fund release |
| Development readiness | Target activity/date, property, rights, permits, obligations | Operations schedule, costs, surface agreements | Readiness is a human-controlled gate |

## Seed data implications

The fictional company should have a believable but bounded dataset that exercises the workflow rather than merely populating cards.

### Minimum fictional case set

1. **Braxton County well review**
   - Synthetic submitted package.
   - WVDEP and WVGES public evidence.
   - Conflicting operator or identifier claims.
   - Ownership schedule and division-order draft.
   - Lease, amendment, title abstract, and OCR extraction.
   - One unresolved title/curative issue.

2. **Lease obligation case**
   - Active lease with primary term, delay rental, notice, and development obligation.
   - Amendment that changes one important term.
   - Upcoming deadline and a missing payment or filing record.

3. **Division-order exception case**
   - Ownership change with conflicting effective dates.
   - Interest total that does not reconcile without an exception.
   - Suspense reason and a human approval requirement.

4. **Compliance/readiness case**
   - Permit and inspection records.
   - One missing or stale filing.
   - Development date that creates urgency.

5. **Acquisition due-diligence case**
   - Multiple leases and wells.
   - Missing title documents.
   - Data-quality mismatch between seller schedule and public records.

### Data quality patterns to include

- Alias and name variation.
- Same well represented by API, permit, operator name, and internal asset ID.
- Lease amendment that supersedes one original term but not others.
- Partial tract or unit participation.
- Conflicting public sources that must be preserved rather than averaged.
- Missing document, unreadable OCR, and low-confidence extraction.
- Ownership effective date different from document recording date.
- Interest total that is mathematically close but not exact.
- Payment in suspense because evidence is incomplete.
- Record reported as zero versus no record found.
- Source freshness and authority differences.

## Research-derived product principles

1. **Start with a work queue, not a catalog.** Users arrive with obligations, exceptions, requests, or deadlines.
2. **Make the case the organizing unit.** Documents, records, agents, conversations, and decisions should converge on a matter.
3. **Make role differences visible.** The same case should present different primary questions and actions to different roles.
4. **Treat agents as bounded collaborators.** Show their contribution, evidence, and limits; do not make the user configure an agent graph.
5. **Separate private help from shared action.** A Copilot answer is not automatically a workroom task.
6. **Preserve uncertainty.** Conflict and unknown are first-class outputs, not error messages to hide.
7. **Expose formulas and inputs.** Especially for division-order and payment-impact analysis.
8. **Keep human decisions explicit.** Approval, title judgment, filing, owner contact, payment, and external communication require an authorized person.
9. **Respect source authority.** Public regulatory and geological records support comparison and provenance; they do not automatically establish private title.
10. **Use progressive disclosure.** Give each role the minimum needed for the current task, with deeper evidence one click away.
11. **Design the handoff.** A successful analysis ends with an owner, an action, a due date, or an explicit hold.
12. **Keep the demo honest.** Synthetic data, preview transcripts, and live integrations must be visually distinct.

## Recommended product slice

The first polished end-to-end slice should be:

```text
Legal or Land user opens a case
  -> asks “Can we move this matter forward?”
  -> Case Copilot identifies the relevant evidence
  -> user shares the question to a Workroom
  -> Ownership, Title, and Lease agents produce bounded findings
  -> the case shows conflicts, unknowns, and evidence links
  -> Legal records “request curative evidence”
  -> Land receives the assigned next task and due date
```

That slice demonstrates the product thesis better than a page containing every role, every person, every data type, and every agent at once.

## Open questions for product discussion

These should be answered before the screen model is implemented:

1. Is the first user a Land Analyst, Legal Reviewer, or a manager viewing cross-functional readiness?
2. Is a case always the primary unit, or do lease portfolios and recurring obligations need a separate first-class workspace?
3. Should the browser experience simulate Teams, launch a real Teams conversation, or support both with an explicit preview label?
4. What is the first consequential decision we want to demonstrate: title/curative routing, lease obligation readiness, division-order exception, or development readiness?
5. Which actions may a human approve in V1, and which must remain recommendation-only?
6. Which source records are authoritative for the fictional company, and which are only comparison evidence?
7. What does “ready” mean for each role, and who owns the final decision?
8. Do we want one shared enterprise case model with role-specific views, or separate lease, title, division-order, and compliance workspaces linked by a common matter?

## Source notes and reading list

### Professional role and practice sources

- [AAPL Landman Toolkit](https://www.landman.org/resources/landman-toolkit.html) — company, field, and consulting landman responsibilities.
- [AAPL landwork definitions](https://www.landman.org/join-engage/membership-types/active-members.html) — ownership, title, curative, due diligence, obligations, and the boundary excluding administrative, division-order, and lease analyst functions.
- [NADOA: What is a Division Order Analyst?](https://nadoa.org/about/) — revenue distribution and ongoing mineral ownership maintenance.
- [AAPL model forms](https://www.landman.org/resources/model-forms.html) — title-curative, leasing, assignment, release, ratification, royalty, and surface-operation document patterns.
- [AAPL books and reference materials](https://www.landman.org/training-certification/training/training-materials/books-for-purchase.html) — due diligence, JOAs, working interest, NRI, oil and gas law, and land reference materials.

### Education and books

- [PETEX Land and Leasing](https://petex.utexas.edu/publications/books/general-industry/260-land-leasing-2nd) — introductory treatment of ownership, leasing, agreements, regulation, and interest calculations.
- [PETEX Division Order Certificate Program](https://petex.utexas.edu/e-learning/ecourses/division-order) — title opinions, curative, ownership changes, lease provisions, interest calculations, pooling, unitization, and contracts.
- [Oil and Gas Title Examination, George J. Morgenthaler](https://books.google.com/books/about/Oil_and_Gas_Title_Examination.html?id=qp88AQAAIAAJ) — reference topics including abstracting, grantor/grantee searches, title defects, federal title examination, curative forms, and division-order title opinions.
- [AAPL due-diligence course](https://learning.landman.org/products/let-the-buyer-beware-adventures-in-due-diligence-may-30-2024) — leases, title examination, contracts, liens, litigation, curative, closing, and post-closing considerations.

### Government and regulatory sources

- [WVDEP Office of Oil and Gas and permitting](https://dep.wv.gov/Permits/Pages/default.aspx) — permitting, inspections, enforcement, production, plugging, and related requirements.
- [WVDEP Oil and Gas database](https://dep.wv.gov/oil-and-gas/databaseinfo/pages/ogd.aspx) — well, permit, enforcement, operator, production, and injection searches.
- [WVDEP Data Center](https://dep.wv.gov/Data/Pages/default.aspx) — public records, data provenance, and the agency’s accuracy/completeness limitation.
- [WVDEP Oil and Gas forms](https://dep-auth.wv.gov/oil-and-gas/GI/Forms/Pages/default.aspx) — permit, completion, production, inspection, transfer, royalty, and plugging form families.
- [BLM General Leasing](https://www.blm.gov/programs/energy-and-minerals/oil-and-gas/leasing/general-leasing) — federal lease terms, rentals, royalties, and surface-disturbance approval.
- [BLM H-3100-1 Oil and Gas Leasing Handbook](https://www.blm.gov/sites/blm.gov/files/uploads/Media_Library_BLM_Policy_H-3100-1.pdf) — federal leasing administration reference.
- [BLM lease assignment handout](https://www.blm.gov/sites/blm.gov/files/Assignments%20Handout_6.pdf) — record title, operating rights, overriding royalty interest, and assignment concepts.
- [ONRR Minerals Production Reporter Handbook](https://www.ntc.blm.gov/krc/uploads/812/Minerals%20Production%20Reporter%20Handbook%20Release%202.0%20%20Sept%2015%202014.pdf) — production reporting, accounting systems, due dates, corrections, record retention, and federal/Indian mineral reporting.

### Representative employer descriptions

- [ExxonMobil Lease & Title Analyst](https://jobs.exxonmobil.com/job/Spring-2026USH-Lease-%26-Title-Analyst-TX-77389/1426970300/) — lease/title analysis, land-system relationships, GIS and public sources, ownership, acquisitions, and calendars.
- [Texas Pacific Land Lease Analyst](https://recruiting.paylocity.com/recruiting/jobs/Details/4024174/Texas-Pacific-Land-Corporation/Lease-Analyst) — lease terms, audits, obligations, expirations, economic summaries, and internal questions.
- [Harvest Midstream Lease Analyst](https://hec.wd5.myworkdayjobs.com/en-US/Harvest_Midstream/job/Houston-TX/Lease-Analyst_R006245) — lease administration, obligations, rental reports, expiration reports, and system maintenance.
- [Ring Energy Senior Lease Records Analyst](https://www.ringenergy.com/careers/job/7811/senior-lease-records-analyst) — lease records, title opinions, obligations, payments, quality control, owner relations, and cross-team work.
- [Repsol Division Order Analyst](https://repsol.wd3.myworkdayjobs.com/en-US/Repsol/job/Division-Order-Analyst_81807-2) — title, curative, suspense, conveyances, pay decks, and complex interest calculations.
- [EOG Staff Title Analyst](https://www.indeed.com/viewjob?jk=3f93ac27322aa92d) — title curative, owner communication, ownership structures, and collaboration with Land, Legal, and Accounting.

## Research conclusion

The product opportunity is real, but the interface must be built around role-specific work and cross-functional transitions. The first screen should help a person answer “what needs my attention?” The second should help them answer “what is true about this matter?” The conversation surface should help them ask “who or what can answer the next question?” The workroom should help them answer “who owns the next action?”

Only after those questions are settled should we design the visual layout.
