# Microsoft Foundry interoperability standard

This document records the repository rules for Microsoft Foundry, Visual
Studio Code Foundry tooling, Azure Developer CLI (`azd`), Azure CLI (`az`),
agent skills, MCP servers, and deployment versioning.

## The short answer about file formats

The existing `*.agent.md` files were a temporary Business Agent convention.
They are being migrated out of the source-of-truth role. Canonical prompt
agents belong in `agent.yaml` files that use the Microsoft AgentSchema and can
be inspected by Foundry VS Code tooling. Any remaining Markdown copy must be
generated and clearly marked as compatibility output.

Microsoft’s current hosted-agent workflow uses `azure.yaml` as the unified
Azure Developer CLI project manifest. It can reference agent definitions and
declare Foundry projects, model deployments, connections, toolboxes, skills,
routines, and agent services. The older standalone `agent.yaml` and
`agent.manifest.yaml` shapes are retained for compatibility, but new work
should prefer `azure.yaml` and local YAML `$ref` files.

Skills are the exception that looks like the old convention: Microsoft Foundry
Skills follow the Agent Skills specification and intentionally use a `SKILL.md`
file with YAML front matter. The body is Markdown. Skills are versioned cloud
assets, so production toolbox references must pin an immutable version.

## Repository policy

| Concern | Repository source of truth | Microsoft-compatible projection |
| --- | --- | --- |
| Business role and evidence behavior | `domains/**/agents/**/agent.yaml` and C# application services | Foundry AgentSchema / `azure.yaml` service configuration |
| Reusable procedure | `domains/**/skills/**/SKILL.md` | Foundry Skill bundle or toolbox skill reference |
| Flow and deterministic ordering | `domains/**/flows/*.flow.md` and C# Workroom plans | Application orchestration or explicit Foundry agent/tool configuration |
| Agent/service deployment | C# API and Teams adapter | `azure.yaml`, `$ref` YAML, Dockerfile, Bicep, and `azd` service configuration |
| Tools | Typed application ports | OpenAPI/function/toolbox/MCP contract with allowlist and auth |
| MCP | `src/mcp` permissioned catalog seam | A real MCP endpoint with discovery, auth, health, and contract tests |
| Evaluation | `tests/`, `evaluations/`, and `eval.yaml` when added | Versioned Foundry evaluation dataset/suite and deployment record |

The C# API remains the authority for authorization, case scope, evidence
provenance, review state, and consequential-action boundaries. A Foundry
agent is an execution/provider surface over those rules, not a parallel source
of truth.

## Required deployable shape

A component is ready to call Microsoft-compatible only when a clean checkout
can do all of the following:

1. Open the repository root in VS Code with the Foundry tooling and discover
   the YAML schemas and `azure.yaml` services.
2. Validate the YAML and referenced paths.
3. Run the component locally using the documented startup command and protocol.
4. Run typed contract tests and a provider-independent deterministic test.
5. Inspect the target and environment with `azd` and `az`.
6. Invoke the deployed endpoint with an authenticated smoke test.
7. Run the evaluation set and record the agent/tool/skill/model versions.
8. Select the active version deliberately and retain a rollback target.

Do not claim Foundry deployment, live MCP, or Azure readiness when only a
local TypeScript adapter or fake provider exists.

## Versioning rules

- Use SemVer for repository-owned agent, skill, tool, flow, and contract
  packages where compatibility is under repository control.
- Treat Foundry agent versions and Skill versions as immutable snapshots.
- Pin production skill references, model deployment versions, container image
  digests, and remote tool versions. `latest` is acceptable only for an
  explicitly documented local experiment.
- Keep the active/default version separate from the newest uploaded version.
- Record version changes in `specs/`, `results/`, and deployment metadata. A
  prompt or tool change that can alter business output requires a new version
  and evaluation result.

## MCP rules

Use MCP only when a process boundary or standard discovery contract is useful.
Otherwise prefer a typed in-process port. Every MCP server must define:

- authentication and tenant authorization;
- discoverable object-shaped input schemas;
- an explicit tool allowlist per agent;
- bounded timeouts, size limits, and retry behavior;
- health/readiness behavior;
- audit-safe request/result logging without secrets;
- validation of tool results before they influence a finding or action; and
- contract tests against a fake server and a negative/unauthorized case.

Remote MCP descriptions and results are untrusted data. Do not place API keys
or tokens in prompts, tool descriptions, YAML committed to the repository, or
model-visible context.

## Deployment command policy

Use `azd` as the application/Foundry project workflow when `azure.yaml` is
present. Use `az` for resource inspection, identity, RBAC, provider health,
and targeted Azure operations. Keep infrastructure in reviewed Bicep or the
approved IaC format. Do not hand-edit cloud state and then describe the repo
as reproducible.

Before deployment, use the repository deployment plan and validate the target
environment. Deployment work must include identity, secrets, network,
observability, cost, rollback, and smoke-test decisions.

## Official references

- [Azure YAML reference for hosted agents](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/azure-yaml-reference)
- [Hosted agents and immutable versions](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)
- [Foundry agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle)
- [Foundry Skills format and versioning](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/skills)
- [MCP server connections and allowlists](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol)
- [Foundry tool best practices](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice)
- [Azure Developer CLI schema](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/azd-schema)
