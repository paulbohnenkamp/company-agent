# Mountaineer Teams architecture

Mountaineer is the user-facing Copilot Studio agent. Users address it in
Teams as `@Mountaineer`; Teams does not select or orchestrate the business
workflow.

```text
Microsoft Teams
        ↓
Copilot Studio Mountaineer agent
  generative orchestration · topics · supported child/connected agents
        ↓ authenticated API tools
Business Agent ASP.NET Core API
  authorization · evidence · persistence · deterministic domain mechanics
        ↓
human-review result or approved action
```

## Boundaries

- Copilot Studio owns the employee conversation and native orchestration.
- Topics own bounded conversational flows and clarification.
- Child or connected agents are optional specialized conversation surfaces.
- API tools expose only governed operations.
- `dotnet/LandOps.Api` and `dotnet/LandOps.Application` own identity,
  authorization, case scope, evidence, persistence, agent workflows, and human
  actions.
- The WV workflow remains a deterministic backend process for exact evidence
  mechanics and repeatable evaluation. It is not the conversational router.

Agent and topic descriptions influence selection; they never grant access.
The API validates every caller, case, evidence reference, and consequential
action.

## Conversation lifecycle

1. A person mentions `@Mountaineer` in Teams.
2. Copilot Studio evaluates the message, context, primary-agent instructions,
   topic descriptions, tools, and supported child/connected-agent descriptions.
3. The selected topic or agent gathers required information and calls an
   authenticated API tool.
4. The API performs the exact business operation and returns structured output.
5. Copilot Studio presents findings, uncertainty, provenance, and the human
   decision boundary in Teams.
6. Any consequential action is sent back to the API and requires authorization
   and human approval.

The former custom Bot Framework adapter and Teams package are not the active
orchestration path. Live Copilot Studio tenant configuration is still an
external verification gate.
