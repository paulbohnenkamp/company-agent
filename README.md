# Company Agent

Company Agent is a deliberately small reference solution for composing
bounded Copilot Studio agents around existing applications and deterministic
business workflows.

It demonstrates a Teams-oriented employee front door, specialist-agent
delegation, a read-only MCP integration, and an agent-callable IT request
workflow. Copilot Studio owns discovery and delegation; this repository does
not implement a second router or a central orchestration service.

## Architecture

```text
Teams
  -> Company Agent
  -> HR Agent -> Copilot Studio knowledge source backed by approved HR SharePoint content
       -> Customer Agent -> Customer MCP -> existing customer C# API
       -> IT Request Agent -> Copilot Studio Agent flow
```

The specialists are bounded capabilities:

- **HR Agent** provides guidance from approved HR policy knowledge and does
  not make employee-specific decisions.
- **Customer Agent** performs authorized, read-only customer lookups through
  the Customer MCP server.
- **IT Request Agent** gathers request details and calls an approved workflow;
  it does not claim completion without a returned Service Request ID and
  status.

## What it demonstrates

- Native Copilot Studio agent composition using connected agents.
- Declarative agent contracts in `agents/*/agent.yaml`.
- A synthetic C# customer API behind a Python FastMCP adapter.
- A deterministic IT request normalization contract.
- Reuse of an existing Forms -> Power Automate -> SharePoint -> Teams
  business process without replacing the Forms-triggered flow.
- Explicit no-invention, authorization, and human-review boundaries.

## Repository layout

```text
agents/                       Local agent contracts
customer-app/                 Synthetic read-only C# customer API
customer-mcp/                 FastMCP service container definition
customer_mcp/                 FastMCP Python package
it-request-workflow/          IT Agent flow contract and normalization
scripts/                      PAC generation and bootstrap helpers
infra/customer-mcp/           Bicep for the Azure customer API and MCP boundary
tests/                        Local contract tests
```

PAC workspaces, solution ZIPs, tenant synchronization metadata, and local
deployment transcripts are intentionally excluded from the public repository.
They can be regenerated or kept in a local working copy when deploying to a
tenant.

## Quick start

Create a virtual environment, install dependencies, and run the local checks:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[test]'
.venv/bin/python -m pytest -q
dotnet build customer-app/CustomerApp.csproj --no-restore
git diff --check
```

Start the synthetic customer API:

```bash
dotnet run --project customer-app/CustomerApp.csproj --urls http://localhost:5080
```

In another terminal, start the MCP adapter:

```bash
CUSTOMER_API_URL=http://localhost:5080 MCP_TRANSPORT=http .venv/bin/customer-mcp
```

The MCP adapter defaults to `http://localhost:5080` when
`CUSTOMER_API_URL` is not set.

Run the workflow contract directly with:

```bash
.venv/bin/python -m it_request_workflow.normalize
```

## Agent and Teams setup

The repository contracts describe the four agents, but the tenant still needs
agent creation, specialist connections, Company Agent delegation, validation,
and Teams publishing. Follow the complete [Copilot Studio setup guide](docs/copilot-studio-setup.md).
