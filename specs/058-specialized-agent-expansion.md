---
id: 058-specialized-agent-expansion
title: Expand Company Agent through specialized capabilities
status: completed
created: 2026-09-11
updated: 2026-09-11
result: results/058-specialized-agent-expansion.md
---

## Goal

Document that Company Agent is an extensible Teams front door that can route
requests to bounded specialist agents beyond Land, while keeping Company Agent
as the shared application and authorization boundary.

## Non-goals

- Do not implement or publish the additional specialist agents in this slice.
- Do not create separate Teams bots or collaboration spaces for departments.
- Do not move authorization, privacy controls, persistence, or human approval
  into a specialist agent.
- Do not imply that every listed capability has a committed delivery date.

## Current-state findings

- The README currently explains Company Agent and gives a Land Agent example.
- The repository architecture already describes one front door with bounded
  specialist capabilities and a shared Company Agent API boundary.
- The product naming guidance defines specialist capabilities as capabilities,
  not separate products or collaboration spaces.

## Chosen approach

- Add a concise README example showing an HR question routed from Company Agent
  to an HR Agent.
- Record the following illustrative specialist capabilities in alphabetical
  order: Accounting Agent, Compliance Agent, Finance Agent, HR Agent, IT Agent,
  Land Agent, Legal Agent, and Operations Agent.
- Treat each specialist as a bounded capability with domain-specific knowledge
  and workflows, subject to the shared Company Agent boundary for identity,
  authorization, audit, evidence, and consequential-action approval.
- Evaluate and specify each future specialist separately before implementation.

## Alternatives considered

- Add all specialist agents now: rejected because the current request is to
  document extensibility, not expand the implemented product surface.
- Create one Teams bot per department: rejected because Company Agent should
  remain the understandable single entry point.
- Put department routing rules in the README: rejected because README content
  is explanatory; runtime routing belongs to the supported orchestration layer.

## Affected files or modules

- `README.md`
- `specs/058-specialized-agent-expansion.md`
- `results/058-specialized-agent-expansion.md`

## Milestones

1. Document the extensible specialist-agent model and its boundaries.
2. Add one representative HR routing example to the README.
3. Validate the execution records, documentation diff, and repository naming.

## Acceptance criteria

- The README contains a clear HR Agent example initiated through Company Agent.
- The spec lists Accounting Agent, Compliance Agent, Finance Agent, HR Agent, IT
  Agent, Land Agent, Legal Agent, and Operations Agent alphabetically.
- The documentation says or clearly implies that the additional capabilities
  are illustrative and not all implemented.
- Company Agent remains the shared front door and application boundary.
- No specialist agent, Teams bot, runtime route, or external integration is
  added by this slice.

## Verification commands

```sh
node --version
npm run validate:records
npm run validate:naming
git diff --check
```

## Risks and open questions

- Future specialist proposals will need their own scope, data-access, privacy,
  evaluation, and human-escalation decisions.
- The HR example is intentionally generic until approved HR policy sources and
  access controls are defined.

## Progress log

- 2026-09-11: Scope approved to document extensibility and add one HR example.
- 2026-09-11: Added the README HR routing example and this focused spec.
- 2026-09-11: Verification passed; recorded the completed documentation slice.

## Decision log

- 2026-09-11: Company Agent remains the single Teams entry point.
- 2026-09-11: Specialist capabilities are documented alphabetically as
  illustrative future expansion, not as implemented agents.

## Completion notes

The documentation now demonstrates how a non-Land request can be delegated to
an HR Agent while preserving the shared Company Agent boundary. Additional
specialist capabilities are named for future planning only.
