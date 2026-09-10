## Goal

Produce a durable, evidence-backed architecture document for the Teams,
Copilot Studio, Business Agent API, Land subagent, workflow, Enertia adapter,
MCP, identity, evidence, title-opinion, and human-review boundaries.

## Related roadmap item

- `ROADMAP.md` item: no dedicated item; this document records architecture
  needed before the next Land routing implementation.

## Context

- The current Copilot Studio agent is `Mountaineer` in the `DecisionForge`
  environment.
- The repository already contains a Land administration catalog, prompt agents,
  skills, flows, a C# API, deterministic evidence services, and an Azure API
  deployment.
- The current OpenAPI file is a thin read-only smoke-test contract. It does not
  yet expose the complete Land routing workflow or a real Enertia integration.
- The document must be understandable to technical, business, and legal
  readers and must distinguish verified facts, architectural recommendations,
  and unresolved external dependencies.

## Scope

### In scope

- Overall architecture and ownership boundaries.
- Teams mention flow through Copilot Studio and the Business Agent API.
- Land subagent routing and workflow orchestration.
- `LandSystemPort`, mock adapter, Enertia adapter, and MCP placement.
- Land records, evidence, title opinions, curative requirements, and human
  approval boundaries.
- Entra, Azure, deployment, testing, observability, versioning, and rollback.
- Current state, target state, decisions, risks, and implementation phases.

### Out of scope

- Implementing the real Enertia connector or MCP server.
- Publishing the Copilot Studio agent to Teams.
- Issuing legal title opinions or changing Enertia records.
- Changing the existing product naming or Land domain contracts.

## Implementation steps

1. Inspect repository architecture, agent catalog, API routes, deployment
   records, naming rules, and evidence constraints.
2. Research current Microsoft Teams, Copilot Studio, MCP, Entra, Azure App
   Service, and Enertia integration guidance.
3. Write the architecture document with two diagrams and explicit current and
   target states.
4. Add the document to the documentation map and create the matching result
   record.
5. Run documentation and repository verification.

## Acceptance criteria

- The document explains every named component and its owner.
- The document includes an overall architecture diagram.
- The document includes a Teams `@Mountaineer` mention sequence diagram.
- The document explains why MCP is behind the Business Agent boundary.
- The document explains how all existing Land subagents participate.
- The document places title opinions and human approval correctly.
- The document identifies Enertia schema/API uncertainty and the mock-first
  approach.
- Microsoft and Enertia claims have linked citations and limitations.
- The documentation map links the new document.

## Verification

- `npm run validate:records`
- `npm run validate:agent-artifacts`
- `npm run validate:naming`
- `git diff --check`

## Status

done

## Completion notes

- Created `docs/land-agent-architecture.md`.
- Added the document to `docs/README.md`.
- Recorded Microsoft and Enertia source limitations and the proposed adapter
  boundary.

## Outcome summary

- The architecture now has one durable explanation for Teams, Copilot Studio,
  Land routing, subagents, the Business Agent API, Enertia, MCP, evidence, and
  human review.

## Tooling / verification notes

- Markdown was edited with `apply_patch`.
- Verification uses the repository's record, artifact, naming, and whitespace
  checks.
