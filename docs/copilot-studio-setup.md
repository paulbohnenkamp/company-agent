# Copilot Studio Setup

This guide configures the four-agent composition described by the repository.
The files under `agents/` are the source of truth for agent names, instructions,
delegation descriptions, and boundaries. They do not create or configure tenant
resources by themselves.

## Architecture

```text
Company Agent
  -> HR Agent -> Copilot Studio knowledge source backed by approved HR SharePoint content
  -> Customer Agent -> Customer MCP -> existing customer API
  -> IT Request Agent -> Copilot Studio Agent flow
```

Company Agent is the employee-facing front door. Copilot Studio owns agent
discovery and delegation. Do not add a repository-side router or connect the
Customer MCP server directly to Company Agent.

## Before You Start

Have these pieces ready:

- Access to the target Copilot Studio environment.
- The four agent contracts under `agents/`.
- A deployed Customer MCP server with its `/mcp` URL. The deployment script
  prints the current URL after a successful deployment.
- The IT Agent flow contract at
  `it-request-workflow/agent-flow.contract.json`.
- Approved HR policy content for HR Agent.
- The existing SharePoint list, Teams destination, and connections used by the
  Northstar IT request process.

Keep tenant IDs, connection references, credentials, and deployment transcripts
in local configuration. Do not add them to this guide.

## 1. Create the Agents

Create these four agents in Copilot Studio, using the matching YAML file as the
source for the name, description, model, instructions, and delegation
metadata:

| Agent | Source contract | Responsibility |
| --- | --- | --- |
| Company Agent | `agents/company-agent/agent.yaml` | Employee-facing front door |
| Customer Agent | `agents/customer-agent/agent.yaml` | Read-only customer lookup |
| HR Agent | `agents/hr-agent/agent.yaml` | Approved HR policy guidance |
| IT Request Agent | `agents/it-request-agent/agent.yaml` | IT request capture and workflow call |

Apply the instructions exactly. The YAML files define behavior and boundaries;
the Copilot Studio agents still need tenant-side connections and configuration.

## 2. Configure Specialist Agents

### HR Agent

Add the approved Northstar HR policy knowledge source. Confirm that the agent
can answer general policy questions but does not access employee records, make
employment decisions, or invent policy details.

### Customer Agent

Add the deployed Customer MCP server as the agent's MCP tool connection. Use
the server's HTTPS `/mcp` endpoint and the authentication required by the
target environment. Verify that the available tools include:

- `find_customer`
- `get_customer_summary`

Customer Agent must remain read-only. It should report only facts returned by
the MCP server and existing customer API.

### IT Request Agent

Create or configure the Copilot Studio Agent flow described by
`it-request-workflow/agent-flow.contract.json`. The flow must accept:

```text
employeeName: string
requestType: Hardware | Software | Access | Other
description: string
isUrgent: boolean
```

The flow must reuse the existing Northstar process:

```text
Normalize request
  -> SharePoint Create item in IT Service Requests
  -> SharePoint Update item with the Service Request ID
  -> Teams Post card in the existing request destination
```

Do not create a replacement Forms flow, SharePoint list, Teams team, or
business process. The Agent flow is an additional callable entry point.

The flow should return an observed `serviceRequestId`, `status`, and `result`.
IT Request Agent must not claim success without those returned values.

## 3. Configure Company Agent Delegation

Configure Company Agent as the front door and add these connected agents:

- HR Agent for general HR policy and process questions.
- Customer Agent for customer and account questions requiring read-only lookup.
- IT Request Agent for hardware, software, access, and other IT service requests.

Use the delegation descriptions in the specialist YAML files. Let Copilot
Studio's generative orchestration select the specialist. Company Agent should
not duplicate specialist instructions, call the MCP server directly, or make
business decisions owned by a human.

Test that Company Agent can identify each route:

- "What's our vacation policy?" -> HR Agent
- "Look up customer CUST-1001." -> Customer Agent
- "I need access to the reporting portal." -> IT Request Agent

## 4. Validate in Copilot Studio Preview

Run these checks before publishing:

### Customer lookup

```text
Look up customer CUST-1001.
```

Expected result: verified customer data returned by Customer Agent and the MCP
server. The response must not invent fields or suggest an unsupported action.

### Missing customer

```text
Look up customer CUST-9999.
```

Expected result: a clear no-match response based on the connected system.

### Customer mutation boundary

```text
Update customer CUST-1001.
```

Expected result: the request is refused or routed to an authorized human. No
customer state may change.

### HR policy

```text
What's our vacation policy?
```

Expected result: an answer from the approved HR knowledge source. If the source
has no answer, the response must be:

```text
I don't have approved Northstar HR policy content for that question. Please consult HR.
```

### IT request

```text
Create an IT access request for Alex Morgan. I need portal access. This is not urgent.
```

Expected flow inputs:

```text
employeeName: Alex Morgan
requestType: Access
description: Need portal access.
isUrgent: false
```

Expected result: the Agent flow returns an observed `SR-###` ID and status, and
the matching SharePoint item, Teams card, and flow activity are visible.

## 5. Publish to Teams

1. Publish Company Agent to **Microsoft 365 and Microsoft Teams**.
2. Use **View in Teams** to install it for the signed-in user.
3. Set the published agent name to `Northstar` from **Edit** next to
   **Details** on the agent's Overview page before publishing if the desired
   channel mention is `@Northstar`.
4. In Teams, select the published agent from the mention picker.
5. Run the mention tests below in a controlled chat or channel.

The repository and architecture name remains **Company Agent**. `Northstar` is
the published Teams-facing name.

## Teams Validation Prompts

```text
@Northstar What's our vacation policy?
```

```text
@Northstar Look up customer CUST-1001.
```

Also validate an IT request and a missing customer in Teams. Capture evidence
of the delegated agent, MCP or Agent flow activity, returned values, and any
downstream SharePoint or Teams activity.

## What Counts as Complete

The setup is complete only when:

- All four agents exist in the target Copilot Studio environment.
- Company Agent delegates to each specialist correctly.
- Customer Agent calls the deployed MCP server successfully.
- HR Agent answers only from approved knowledge.
- IT Request Agent calls the existing business process and returns its ID and
  status.
- Company Agent is published to Teams and mention tests pass.

Local tests validate repository contracts. Copilot Studio Preview or controlled
Teams evidence is required to verify the tenant-owned composition.
