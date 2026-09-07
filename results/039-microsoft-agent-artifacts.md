---
id: 039-microsoft-agent-artifacts
title: Checkpoint 039 result: Microsoft-compatible agent artifacts
status: completed
completed: 2026-09-07
spec: specs/039-microsoft-agent-artifacts.md
---


# Checkpoint 039 result: Microsoft-compatible agent artifacts

## Status

Completed locally.

## Delivered

- Converted all 13 land agents to canonical `*.agent.yaml` AgentSchema files.
- Removed the obsolete `*.agent.md` source files after the YAML loader passed.
- Updated the TypeScript runtime to load and project AgentSchema YAML.
- Updated the active catalog, domain authoring docs, architecture docs, and
  flow references.
- Added `npm run validate:agent-artifacts` to check all 13 agents.
- Added durable rules to `AGENTS.md` for YAML schemas, Skills, MCP, versioning,
  `azure.yaml`, `azd`, `az`, VS Code discoverability, and deployment proof.

## Verification

- Agent artifact validator: 13 agents passed.
- TypeScript typecheck with incremental output disabled: passed.
- TypeScript tests: 129 passed.
- Next.js production build: passed, including the `/teams` route.
- `git diff --check`: passed.

## Remaining genuine gaps

- The approved Azure deployment plan still needs a root `azure.yaml`, Bicep,
  Foundry project/model configuration, identity/RBAC, and hosted deployment.
- `src/mcp` remains a local permissioned catalog seam, not a network MCP server.
- Foundry smoke tests and evaluations require an authenticated project and model
  deployment; local deterministic tests remain the default.

## What changed

The implementation claims in the original result content are preserved below.

## Files changed

See the original result content and the canonical inventory in docs/PROJECT_STATE.md.

## Checks run and results

Verification evidence is preserved in the original result content; unresolved limits are called out in docs/PROJECT_STATE.md.

## Deviations from the spec

No deviation is inferred by this metadata normalization. Review the original result content for slice-specific deviations.

## Important decisions

This slice remains first-class project history. The current product direction is recorded in docs/PROJECT_STATE.md.

## Remaining follow-ups

See docs/PROJECT_STATE.md and the matching spec for current follow-ups.
