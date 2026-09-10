---
id: 055-land-agent-architecture
title: Land agent architecture
status: completed
created: 2026-09-09
updated: 2026-09-09
result: results/055-land-agent-architecture.md
---

## Goal

Document an understandable and defensible architecture for the Teams-facing
Mountaineer agent, Land subagent routing, the Business Agent API, an abstract
land-system port, a mock Enertia integration, a future Enertia adapter, MCP,
evidence, title opinions, and human review.

## Non-goals

- Real Enertia connectivity.
- A production MCP server.
- Copilot Studio or Teams publication.
- Automated title certification or consequential actions.

## Current-state findings

- `Mountaineer` is the current user-facing Copilot Studio/Teams agent.
- The C# API is the application boundary for authorization, persistence,
  deterministic mechanics, and human actions.
- The Land catalog contains bounded prompt agents, skills, and flows.
- The deployed OpenAPI contract exposes six read-only operations and is not a
  complete routing contract.
- Enertia publicly describes API and import/export capabilities, but no public
  schema or data dictionary was found.

## Chosen approach

- Keep `Mountaineer` as the front door.
- Route Land requests through a Land specialist boundary and the Business Agent
  API.
- Keep subagents behind a typed workflow/orchestration boundary.
- Put the Enertia implementation behind `LandSystemPort`.
- Use a deterministic mock adapter before the real Enertia adapter.
- Use MCP only where a real process boundary and shared tool discovery justify
  it; do not bypass the Business Agent API's authority boundary.

## Affected files or modules

- `docs/land-agent-architecture.md`
- `docs/README.md`
- `plans/land-agent-architecture.md`
- `domains/land-administration/catalog.yaml` and existing Land agent/skill
  definitions, as architectural inputs only
- `dotnet/LandOps.Api` and `dotnet/LandOps.Application`, as current API and
  workflow boundaries

## Milestones

1. Inspect existing repository boundaries and current deployment state.
2. Research Microsoft, MCP, Teams, Azure, and Enertia integration guidance.
3. Write and map the architecture document.
4. Validate records, artifacts, naming, and Markdown whitespace.

## Risks and open questions

- Enertia’s public materials do not establish a public schema, API contract,
  title-opinion record type, or document-storage model.
- The deployed read-only API contract is not yet the authenticated routing
  contract required for production.
- Copilot Studio and Teams tenant settings remain external configuration and
  publication gates.

## Alternatives considered

- Attach raw Enertia tools directly to Copilot Studio: rejected because it
  bypasses application authorization, evidence rules, and human approval.
- Make `Land Packet` the primary entity: rejected because the domain is better
  represented by tract, lease, evidence, title opinion, research request, and
  review records.
- Treat the current six GET operations as complete: rejected because they lack
  typed responses and routing/execution semantics.

## Acceptance criteria

- See `plans/land-agent-architecture.md`.

## Verification commands

- `npm run validate:records`
- `npm run validate:agent-artifacts`
- `npm run validate:naming`
- `git diff --check`

## Progress log

- 2026-09-09: Inspected repository architecture and agent catalog.
- 2026-09-09: Researched Microsoft, MCP, Teams, Azure, and Enertia sources.
- 2026-09-09: Wrote architecture document and diagrams.
- 2026-09-09: Added documentation map entry and verification record.

## Decision log

- 2026-09-09: Keep `Mountaineer` as the Teams-facing front door; use Land as a
  specialist capability rather than renaming the front door prematurely.
- 2026-09-09: Treat Enertia as an external system of record and isolate it
  behind a port and adapter.
- 2026-09-09: Treat title opinions as human/legal work products linked to land
  records, not as evidence or automated findings.
