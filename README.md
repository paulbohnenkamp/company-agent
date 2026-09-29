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
       -> HR Agent
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
- A synthetic C# customer API behind a TypeScript MCP adapter.
- A deterministic IT request normalization contract.
- Reuse of an existing Forms -> Power Automate -> SharePoint -> Teams
  business process without replacing the Forms-triggered flow.
- Explicit no-invention, authorization, and human-review boundaries.

## Repository layout

```text
agents/                       Local agent contracts
customer-app/                 Synthetic read-only C# customer API
customer-mcp/                 MCP adapter for the customer API
it-request-workflow/          IT Agent flow contract and normalization
scripts/                      PAC generation and bootstrap helpers
infra/customer-mcp/           Bicep for the Azure customer API and MCP boundary
tests/                        Local contract tests
results/                      Reference implementation result
```

PAC workspaces, solution ZIPs, tenant synchronization metadata, and local
deployment transcripts are intentionally excluded from the public repository.
They can be regenerated or kept in a local working copy when deploying to a
tenant.

## Quick start

Install dependencies and run the local checks:

```bash
npm install
npm run build
npm test
dotnet build customer-app/CustomerApp.csproj --no-restore
git diff --check
```

Start the synthetic customer API:

```bash
dotnet run --project customer-app/CustomerApp.csproj --urls http://localhost:5080
```

In another terminal, start the MCP adapter:

```bash
CUSTOMER_API_URL=http://localhost:5080 npm run mcp
```

The MCP adapter defaults to `http://localhost:5080` when
`CUSTOMER_API_URL` is not set.

Run the workflow contract directly with:

```bash
npm run workflow
```

## Teams usage

In Teams, employees invoke the agent with its configurable mention tag,
followed by the request. The default Teams mention tag is `@Northstar`.
The repository and architecture name for this front door remains **Company
Agent**.

For example:

```text
@Northstar Look up customer CUST-1001
```

## Example prompts

These are the example prompts used to verify the composition and its
boundaries in Copilot Studio Preview:

Customer lookup:

```text
Look up customer CUST-1001.
```

Missing-record handling:

```text
Look up customer CUST-9999.
```

Mutation boundary:

```text
Update customer CUST-1001.
```

The expected behavior is to report verified customer data for the known ID,
report that no matching record was found for the missing ID, and refuse or
route the mutation request to an authorized human. The agent must not invent
records or claim that customer state changed.

IT request flow:

```text
Create an IT access request for Alex Morgan. I need portal access. This is not urgent.
```

The corresponding Agent flow values are:

```text
employeeName: Alex Morgan
requestType: Access
description: Need portal access.
isUrgent: false
```

The IT flow is successful only when it returns an observed `SR-###` Service
Request ID and status, and the matching SharePoint item, Teams card, and Agent
flow activity are visible.

HR policy:

```text
What's our vacation policy?
```

The expected behavior is to answer from approved Northstar HR policy
knowledge. For questions outside the approved source, the agent should say:

```text
I don't have approved Northstar HR policy content for that question. Please consult HR.
```

## Tenant boundary

The repository describes and validates the contracts. Copilot Studio and
Power Automate remain the tenant-owned runtime:

- Connected agents are configured on Company Agent in Copilot Studio.
- Customer Agent connects to the MCP server through the tenant's supported
  tool configuration.
- IT Request Agent calls a separate Agent flow with
  `employeeName`, `requestType`, `description`, and `isUrgent`.
- The existing Forms-triggered flow remains unchanged.

Tenant success requires Copilot Studio Preview or controlled Teams evidence,
including the observed child-agent delegation, MCP/API or Agent flow activity,
returned values, and downstream SharePoint/Teams activity where applicable.
Local tests alone are not tenant verification.

## Scope and safety

The customer API and data are synthetic and read-only. A production MCP
deployment would require HTTPS, identity, authorization, rate limiting,
telemetry, and validated external results. No credentials, tokens, keys, or
connection strings belong in this repository. Azure deployment details and
tenant-specific endpoints are intentionally kept out of this public README.
