# Adaptive Cards for Agent Responses

This repository uses a consistent response pattern for Teams-facing agents:

```text
Teams user
  -> Company Agent
  -> specialist agent
  -> MCP tools or approved knowledge/workflow
  -> structured result
  -> Copilot Studio Send a message node
  -> Adaptive Card in Teams
```

The card is a presentation layer. It must not become a second router, a source
of business logic, or a place to invent values that were not returned by the
specialist or its tools.

## Which Copilot Studio Feature?

Use a **Send a message** node with an Adaptive Card when the agent already has
the result and you want to present it clearly in Teams. Bind card fields to
variables returned by the specialist or topic.

Use an **Agent flow** when the agent must perform an action or call a business
process, such as creating a SharePoint item, posting to an existing Teams
destination, requesting approval, or returning a service-request ID. The flow
returns structured outputs. A following message node can render those outputs
as an Adaptive Card.

Do not use an Agent flow only because the response needs a card. Do not post a
second Teams message from a flow when the desired experience is the agent's
conversation response.

## Pipeline Example

Configure the Pipeline Integrity Agent to run these tools in order:

```text
get_scada_tags
  -> check_phmsa_guidelines
  -> structured telemetry and screening result
  -> Send a message with Adaptive Card
```

The card should expose only returned values:

```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "Pipeline Integrity Alert",
      "weight": "Bolder",
      "size": "Medium",
      "color": "Attention"
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Station", "value": "${station_id}" },
        { "title": "Status", "value": "${screening_status}" },
        { "title": "Suction pressure", "value": "${suction_pressure_psi} PSI" },
        { "title": "Delivery pressure", "value": "${discharge_pressure_psi} PSI" },
        { "title": "Differential", "value": "${pressure_gradient_psi} PSI" },
        { "title": "Compressor speed", "value": "${compressor_speed_rpm} RPM" },
        { "title": "Flow", "value": "${flow_rate_mmcfd} MMcfd" }
      ]
    },
    {
      "type": "TextBlock",
      "text": "${screening_message}",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "Operational screening only. Qualified operator review required.",
      "isSubtle": true,
      "wrap": true
    }
  ]
}
```

`${...}` values are illustrative bindings. In Copilot Studio, insert the
actual topic or agent variables through the message node's variable picker.
Do not expose the planner output, evidence IDs, raw error objects, or internal
routing metadata to the Teams user.

If a tool returns missing or invalid data, render a review-required card with
the observed limitation. Do not render a normal-status card and do not infer a
root cause.

## Other Agent Patterns

The same pattern applies to every specialist:

- **Customer Agent:** show only fields returned by the read-only customer lookup.
- **Land Administration:** show extracted lease facts, observed title gaps, or a
  confirmed ledger transaction. Mark title and legal findings for human review.
- **IT Request Agent:** use an Agent flow for the existing process, then show the
  returned service-request ID and status. Do not claim completion without them.
- **HR Agent:** show approved policy content or the defined missing-policy result.

## Validation

Validate the card in Copilot Studio Preview and in the published Teams channel.
Check that long values wrap, missing fields remain visible as review items, and
no card claims a workflow completed without an observed result.

For an offline design check, render the real local Pipeline result:

```bash
.venv/bin/python scripts/render_pipeline_card.py "Station 4"
```

The renderer calls the local MCP functions and emits a Teams-shaped version 1.5
payload. It is not a local Copilot Studio emulator and does not replace tenant
Preview or published Teams validation.

## Microsoft Learn

- [Send a message in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-send-message)
- [Adaptive Cards overview in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/adaptive-cards-overview)
- [Adaptive Cards documentation](https://adaptivecards.io/documentation/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Use agent flows in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview)
