# Company Agent

Company Agent is a deliberately small reference solution for composing
bounded Copilot Studio agents around existing applications and deterministic
business workflows.

It demonstrates a Teams-oriented employee front door, specialist-agent
delegation, MCP integrations, and agent-callable workflows. Copilot Studio
owns discovery and delegation; this repository does not implement a second
router or a central orchestration service.

For Teams presentation, use the reusable [Adaptive Cards for Agent Responses](docs/adaptive-cards.md)
pattern: specialist tools return structured data, and Copilot Studio renders it
with a Send a message node.

Use [Test the HR Agent with approved SharePoint knowledge](docs/hr-agent-testing.md)
to configure and test the HR policy knowledge source.

## Architecture

```text
Teams
  -> Company Agent
  -> HR Agent -> Copilot Studio knowledge source backed by approved HR SharePoint content
  -> Customer Agent -> Customer MCP -> existing customer C# API
  -> Pipeline Integrity Agent -> Pipeline Historian MCP -> telemetry.csv
  -> Land Administration Cluster -> Lease Analyst / Title Curative / Division Order -> Land Admin MCP
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
- **Pipeline Integrity Agent** handles read-only station telemetry and runs a
  sequential pressure-anomaly screening check through the Pipeline Historian
  MCP server.
- **Land Administration Cluster** coordinates Lease Analyst, Title Curative,
  and Division Order specialists through the Land Admin MCP server. It reports
  only extracted lease facts, observed title records, calculated values, and
  confirmed ledger transactions.

## Repository layout

```text
agents/                       Copilot Studio agent contracts and specialists
customer-app/                 Synthetic read-only customer API
customer-mcp/                 Customer MCP container definition
customer_mcp/                 Customer MCP Python package
pipeline-historian-mcp/       Pipeline MCP container and telemetry data
pipeline_historian_mcp/       Pipeline MCP Python package
land_admin_mcp/               Land Administration MCP Python package
it-request-workflow/          IT workflow contract and normalization
scripts/                      Local launcher, harness, and PAC helpers
docs/                         Local development and Copilot Studio guides
infra/                        Azure deployment infrastructure
tests/                        Offline contract and grounding tests
```

PAC workspaces, solution ZIPs, tenant synchronization metadata, and local
deployment transcripts are intentionally excluded from the public repository.
They can be regenerated or kept in a local working copy when deploying to a
tenant.

## Quick start

See [Local Development](docs/local-development.md) for one-time setup,
aggregate startup, service-specific commands, the external LLM harness, and
local scope.

## Agent and Teams setup

The repository contracts describe the six capabilities, including the nested
Land Administration specialists, but the tenant still needs
agent creation, specialist connections, Company Agent delegation, validation,
and Teams publishing. Follow the complete [Copilot Studio setup guide](docs/copilot-studio-setup.md).

After publishing Company Agent to Teams as `Northstar`, validate the front door
with prompts such as:

### Baseline Enterprise Prompts

```text
@Northstar What's our vacation policy?
@Northstar Look up customer CUST-1001.
```

### 🛢️ New Field Operations & Pipeline Prompt

```text
@Northstar Station 4 is reporting low delivery pressure but the compressor speed is at 100%. What's going on?
```

### 📄 New Land & Administration Prompt

```text
@Northstar Run a title audit on Tract TX-HOU-04 and check if there are any missing records.
```
