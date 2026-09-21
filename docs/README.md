# Company Agent Teams documentation

This is the current documentation surface for Company Agent, its Copilot Studio
agents, and its Company Agent API. Teams is the conversation channel; there is
no web or administration surface in this branch.

## Start here

1. [Session handoff](HANDOFF.md) — current cleanup state and next step.
2. [Project state](PROJECT_STATE.md) — verified status and next approved work.
3. [Company Agent deployment](company-agent-deployment.md) — PAC source,
   connector bootstrap, connection authorization, guarded push, and verification.
4. [Copilot Studio integration](copilot-studio-integration.md) — native agent,
   topic, tool, and Teams boundary.
5. [Copilot Studio runbook](copilot-studio/README.md) — tenant capture, Land Agent,
   REST tool setup, and Preview tests.
6. [Teams architecture](teams-architecture.md) — API and conversation boundaries.
7. [Teams development](teams-development.md) — local API run and checks.
8. [Azure recreation](azure-recreation.md) — current API deployment.
9. [Product naming](product-naming.md) — current names and compatibility terms.
10. [Land agent architecture](land-agent-architecture.md) — end-to-end Land,
   Teams, Copilot Studio, subagent, MCP, and Enertia boundaries.
11. [Repository guide](repository-guide.md) — local development, verification,
   repository structure, and implementation boundaries.

## Current guides

| Document | Purpose |
| --- | --- |
| [Microsoft Foundry standards](microsoft-foundry-standards.md) | Provider, artifact, MCP, and versioning rules |
| [Teams tenant settings](teams-tenant-settings.md) | Safe controlled-tenant configuration |
| [Teams live activation](teams-live-activation.md) | Mountaineer publication and tenant checks |
| [Execution records](execution-records.md) | Specs, results, approvals, and verification |
| [Safety](safety.md) | Evidence, identity, authorization, and human control |
| [Glossary](company-agent-glossary.md) | Product and evidence terminology |
| [WV land architecture](WV_LAND_ARCHITECTURE.md) | Historical flagship evidence and source boundaries |

## History

The [history index](history.md) explains where superseded material went. The
numbered files in `specs/` and `results/` are the durable execution record and
are intentionally retained.
