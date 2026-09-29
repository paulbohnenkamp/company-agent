# IT Request Agent workflow

This agent plugs into the existing Northstar IT service-request workflow from
`microsoft-ai-cookbook`. It does not replace that workflow with a custom API.

The local [agent-flow.contract.json](agent-flow.contract.json) is the small,
solution-owned contract to use while configuring a Copilot Studio **Agent
flow**. It is not an exported tenant flow and does not contain connector
connections or credentials.

The cookbook's verified path is:

```text
Forms -> Power Automate -> normalized request -> SharePoint -> Teams
```

The local TypeScript functions in `src/normalize.ts` are deterministic contract
tests for the input boundary and the `SR-###` identifier convention. The
operational record, service-request ID, status, priority, and Teams card remain
owned by the Power Automate steps.

When configuring the Agent flow, use the four inputs and four downstream steps
from the JSON contract. Keep the existing Forms-triggered flow unchanged; the
Agent flow is a separate conversational trigger over the same SharePoint list
and Teams destination.
