# Copilot Studio Setup

This guide configures the six-capability composition described by the repository.
The files under `agents/` are the source of truth for agent names, instructions,
delegation descriptions, and boundaries. They do not create or configure tenant
resources by themselves.

## Architecture

```text
Company Agent
  -> HR Agent -> Copilot Studio knowledge source backed by approved HR SharePoint content
  -> Customer Agent -> Customer MCP -> existing customer API
  -> Pipeline Integrity Agent -> Pipeline Historian MCP -> telemetry.csv
  -> Land Administration Cluster -> Lease Analyst / Title Curative / Division Order -> Land Admin MCP
  -> IT Request Agent -> Copilot Studio Agent flow
```

Company Agent is the employee-facing front door. Copilot Studio owns agent
discovery and delegation. Do not add a repository-side router or connect the
Customer MCP server directly to Company Agent.

For the common structured-result-to-Teams-card pattern, see [Adaptive Cards for
Agent Responses](adaptive-cards.md). Use a Copilot Studio Send a message node
for presentation; use an Agent flow only when the interaction performs an
action or calls an existing business process.

## Before You Start

Have these pieces ready:

- Access to the target Copilot Studio environment.
- The six capability contracts under `agents/`, including the three nested Land
  Administration specialist contracts.
- A deployed Customer MCP server with its `/mcp` URL.
- The Pipeline Historian and Land Admin MCP capabilities for local or tenant
  validation.
- The IT Agent flow contract at `it-request-workflow/agent-flow.contract.json`.
- Approved HR policy content for HR Agent.
- The existing SharePoint list, Teams destination, and connections used by the
  Northstar IT request process.

Keep tenant IDs, connection references, credentials, and deployment transcripts
in local configuration. Do not add them to this guide.

## 1. Create the Agents

Create these six capabilities in Copilot Studio, using the matching YAML file as
the source for the name, description, model, instructions, and delegation
metadata:

| Agent | Source contract | Responsibility |
| --- | --- | --- |
| Company Agent | `agents/company-agent/agent.yaml` | Employee-facing front door |
| Customer Agent | `agents/customer-agent/agent.yaml` | Read-only customer lookup |
| HR Agent | `agents/hr-agent/agent.yaml` | Approved HR policy guidance |
| IT Request Agent | `agents/it-request-agent/agent.yaml` | IT request capture and workflow call |
| Pipeline Integrity Agent | `agents/pipeline-integrity/agent.yaml` | Read-only telemetry and anomaly screening |
| Land Administration Cluster | `agents/land-admin/agent.yaml` | Ordered land workflow coordinator |

Apply the instructions exactly. The YAML files define behavior and boundaries;
the Copilot Studio agents still need tenant-side connections and configuration.

## 2. Configure Specialist Agents

### HR Agent

Add the approved Northstar HR policy knowledge source. Confirm that the agent
does not access employee records, make employment decisions, or invent policy
details.

### Customer Agent

Add the deployed Customer MCP server as the agent's MCP tool connection. Verify
that the available tools include `find_customer` and `get_customer_summary`.
Customer Agent must remain read-only and report only connected-system facts.

### IT Request Agent

Configure the Agent flow described by `it-request-workflow/agent-flow.contract.json`.
It must reuse the existing process:

```text
Normalize request
  -> SharePoint Create item in IT Service Requests
  -> SharePoint Update item with the Service Request ID
  -> Teams Post card in the existing request destination
```

Do not create a replacement Forms flow, SharePoint list, Teams team, or
business process. The flow must return an observed `serviceRequestId`, `status`,
and `result`; the agent must not claim success without them.

### Pipeline Integrity Agent

Connect the Pipeline Historian MCP capability. Keep the tool order explicit:
`get_scada_tags` must run before `check_phmsa_guidelines`. The result is a
read-only operational screening alert for qualified human review, not legal
advice or a final regulatory finding. Configure the response as an Adaptive
Card message after the structured screening result is available. Do not expose
the planner output or evidence ledger in Teams.

### Land Administration Cluster

Configure the Land Admin MCP capability and expose its nested specialists:

- Lease Analyst extracts obligations from supplied contract text.
- Title Curative reports observed title gaps for a tract.
- Division Order calculates and posts only when required inputs are present and
  the MCP tool returns a committed ledger transaction.

Keep the sequence ordered: Lease Analyst, Title Curative, then Division Order
when the request requires all stages. Never infer ownership, legal conclusions,
or a successful post from missing or partial evidence.

## 3. Configure Company Agent Delegation

Configure Company Agent as the front door and add these connected agents:

- HR Agent for general HR policy and process questions.
- Customer Agent for customer and account questions requiring read-only lookup.
- IT Request Agent for hardware, software, access, and other IT service requests.
- Pipeline Integrity Agent for pipeline pressure, compressor telemetry, and
  PHMSA framework screening.
- Land Administration Cluster for lease, title, and confirmed division-order
  workflows. The cluster delegates to its three nested specialists.

Use the delegation descriptions in the specialist YAML files. Let Copilot
Studio's generative orchestration select the specialist. Company Agent should
not duplicate specialist instructions, call the MCP server directly, or make
business decisions owned by a human.

Test these routes:

- "What's our vacation policy?" -> HR Agent
- "Look up customer CUST-1001." -> Customer Agent
- "I need access to the reporting portal." -> IT Request Agent
- "Station 4 has low delivery pressure." -> Pipeline Integrity Agent
- "Run a title audit on Tract TX-HOU-04." -> Land Administration Cluster

## 4. Validate in Copilot Studio Preview

Run these checks before publishing:

### Pipeline screening

```text
Station 4 is reporting low delivery pressure but compressor speed is at 100%. What is going on?
```

Expected result: both Pipeline tools run in order, and the response reports only
returned telemetry and screening results. In Teams, present those values with
the [Pipeline Adaptive Card pattern](adaptive-cards.md#pipeline-example).
Missing telemetry remains an error or review item; never render a normal-status
card from missing evidence.

### Land administration

```text
Run a title audit on Tract TX-HOU-04 and check for missing records.
```

Expected result: Title Curative reports observed missing or unresolved records
without inventing a legal conclusion.

```text
Parse the lease for TX-HOU-04 and post the confirmed division order.
```

Expected result: the ordered workflow returns calculated NRI only when the MCP
returns a `status: posted` transaction payload.

### Customer lookup

```text
Look up customer CUST-1001.
```

Expected result: verified customer data returned by Customer Agent and the MCP
server. The response must not invent fields or suggest an unsupported action.

### HR policy

```text
What's our vacation policy?
```

If approved knowledge has no answer, the response must be:

```text
I don't have approved Northstar HR policy content for that question. Please consult HR.
```

### IT request

```text
Create an IT access request for Alex Morgan. I need portal access. This is not urgent.
```

Expected flow inputs are `employeeName: Alex Morgan`, `requestType: Access`,
`description: Need portal access.`, and `isUrgent: false`. The flow must return
an observed request ID and status.

## 5. Publish to Teams

1. Publish Company Agent to **Microsoft 365 and Microsoft Teams**.
2. Use **View in Teams** to install it for the signed-in user.
3. Set the published agent name to `Northstar` if the desired mention is
   `@Northstar`.
4. Run the mention tests in a controlled chat or channel.

Capture evidence of delegated agent activity, MCP or Agent flow activity,
returned values, and downstream SharePoint or Teams activity.

## What Counts as Complete

The setup is complete only when:

- All six capabilities exist in the target Copilot Studio environment,
  including the three nested Land Administration specialists.
- Company Agent delegates to each specialist correctly.
- Customer Agent calls the deployed MCP server successfully.
- HR Agent answers only from approved knowledge.
- IT Request Agent calls the existing process and returns its ID and status.
- Pipeline Integrity performs its ordered read-only tool call.
- Land Administration preserves review-required results and confirms ledger
  writes only from returned transaction evidence.
- Company Agent is published to Teams and mention tests pass.

Local tests validate repository contracts. Copilot Studio Preview or controlled
Teams evidence is required to verify the tenant-owned composition.
