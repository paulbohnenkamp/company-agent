---
id: 055-land-agent-architecture
title: Land agent architecture
status: completed
spec: specs/055-land-agent-architecture.md
completed: 2026-09-09
---

## Files changed

- `docs/land-agent-architecture.md`
- `docs/README.md`
- `plans/land-agent-architecture.md`
- `plans/README.md`
- `plans/index.md`
- `specs/055-land-agent-architecture.md`

## What changed

- Added `docs/land-agent-architecture.md`.
- Added an overall component diagram and a Teams `@Mountaineer` mention
  sequence diagram.
- Documented the responsibilities and boundaries of Teams, Copilot Studio,
  Land specialists, the Business Agent API, the workflow orchestrator, Land
  subagents, `LandSystemPort`, mock and Enertia adapters, MCP, identity,
  evidence, title opinions, and human review.
- Added the document to `docs/README.md`.
- Recorded current-state limits so the six-operation REST contract is not
  mistaken for the finished Land routing API.

## Checks run and results

- `npm run validate:records` — passed.
- `npm run validate:agent-artifacts` — passed.
- `npm run validate:naming` — passed.
- `git diff --check` — passed.

## Deviations from the spec

- No deviations. The work remained documentation-only; no Enertia connector,
  MCP server, API routing endpoint, or Copilot Studio publication was added.

## Important decisions

- Keep `Mountaineer` as the Teams-facing entry point.
- Keep Business Agent as the application and authorization boundary.
- Put Enertia behind a typed port and adapter.
- Start with a deterministic mock adapter; add MCP only when a real process
  boundary or shared tool lifecycle justifies it.
- Treat title opinions as human/legal work products, not AI-generated findings.

## Remaining follow-ups

- Implement the typed `LandSystemPort` and deterministic mock.
- Implement and secure the versioned Land research-routing endpoint.
- Obtain Enertia API/export and document-management details.
- Add the real Enertia adapter and MCP transport only after the contract is
  available.
- Configure, evaluate, and publish the Copilot Studio agent to a controlled
  Teams scope.
