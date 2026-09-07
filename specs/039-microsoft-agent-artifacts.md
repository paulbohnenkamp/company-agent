---
id: 039-microsoft-agent-artifacts
title: Checkpoint 039: Microsoft-compatible agent artifacts
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/039-microsoft-agent-artifacts.md
---


# Checkpoint 039: Microsoft-compatible agent artifacts

## Objective

Make Microsoft AgentSchema YAML the canonical source for land agents and
prevent future work from creating another custom agent definition format.

## Acceptance criteria

- Every land agent is an `agent.yaml`-compatible file with the published
  AgentSchema schema, `kind`, `name`, `description`, `model`, and
  `instructions` fields.
- Repository-specific version, role, skill, input, output, and permitted-tool
  metadata is nested under `metadata.businessAgent`.
- The TypeScript runtime loads YAML agents, and `catalog.yaml` points to YAML.
- Skills remain `SKILL.md` bundles with YAML front matter because that is the
  Microsoft Agent Skills format.
- A validator checks schema identity, required fields, and SemVer metadata.
- `AGENTS.md` requires `azure.yaml`, `azd`, `az`, schema validation, version
  pinning, MCP allowlists, and Foundry smoke/evaluation checks for deployable
  components.
- Documentation clearly separates local artifacts from deployed Foundry assets.

## Deferred deployment work

The root `azure.yaml`, Bicep, Foundry project, model deployment, hosted-agent
protocol, and Azure resource validation remain part of the approved Azure
deployment plan. This checkpoint makes the agent definitions compatible and
keeps that deployment work from being built on a custom file format.

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

## Goal

The goal stated by the original record is preserved in its Objective or equivalent section below.
