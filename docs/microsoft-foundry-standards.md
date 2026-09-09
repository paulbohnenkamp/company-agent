# Microsoft technology map

Business Agent uses Microsoft services for clear boundaries. The C# API is the
business authority; Teams and Foundry are integration surfaces.

| Technology | Use in this repository |
| --- | --- |
| Microsoft Teams / Copilot Studio | User conversation, mentions, topics, and replies |
| ASP.NET Core and .NET | API boundary, authorization, orchestration, and actions |
| SQL Server / Azure SQL | Durable request threads, runs, and review state |
| Azure Blob Storage | Evidence and source snapshots |
| Microsoft Entra ID | Human claims and workload identity |
| Azure Key Vault | Service secrets and runtime references through App Service |
| Azure App Service | Hosts the Business Agent API |
| Azure Container Registry | Stores immutable API images |
| Application Insights / Log Analytics | Runtime telemetry and diagnostics |
| Microsoft Foundry | Optional provider-backed agent execution and evaluations |
| `azd`, `az`, and Bicep | Repeatable deployment, inspection, and infrastructure |

## Artifact rules

- `azure.yaml` is the project manifest and `agent.yaml` is the canonical prompt
  agent format. Use the published AgentSchema `$schema`.
- Reusable procedures stay in `SKILL.md` bundles with YAML front matter.
- Typed application ports come before process-boundary tools. `src/mcp` is a
  permissioned catalog seam, not a production network MCP server.
- Pin dependency, model, image, skill, toolbox, and deployed agent versions.
  Keep the active version and rollback version explicit.
- Treat remote tool descriptions and results as untrusted. Allowlist tools,
  send minimum data, and validate outputs before they affect findings or work.

## What “deployed” means

For an agent or tool, record schema validation, local run, typed contract tests,
`azd`/`az` inspection, endpoint smoke test, evaluation, and a versioned result.
If only local checks exist, describe it as a provider seam or local reference.
The API still owns authorization, evidence provenance, persistence, and human
approval even when Foundry executes a step.
