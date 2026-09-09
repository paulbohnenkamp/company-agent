# Mountaineer Teams activation

This runbook publishes the Mountaineer Copilot Studio agent to Microsoft Teams.
Teams is the channel; Copilot Studio owns conversation and orchestration.

## Prerequisites

- A target Microsoft 365 tenant with Copilot Studio access.
- A primary Copilot Studio agent named **Mountaineer**.
- Generative orchestration enabled where supported.
- Native child/connected-agent and topic capability verified for the selected
  Copilot Studio experience.
- Authenticated Business Agent API tools configured and tested.
- Microsoft 365 administrator consent and an approved sharing scope.

## Verification sequence

```text
tenant capability check
→ configure Mountaineer instructions and native descriptions
→ configure bounded topics with “The agent chooses” where supported
→ connect authenticated Business Agent API tools
→ test in Copilot Studio Preview and activity map
→ publish Mountaineer to Teams
→ mention @Mountaineer in a controlled Team
→ verify authorization, evidence, human approval, and errors
→ record versions, telemetry, and rollback
```

The activity map is evidence of observable orchestration behavior. It is not a
claim about hidden model reasoning.

## Safety checks

Keep the Team private for controlled testing. Do not treat membership or a
Microsoft 365 group as sufficient business authorization. The C# API must
validate the caller, case scope, evidence references, and every consequential
action.

Do not publish a production agent until the API tool contract, refusal behavior,
evidence grounding, approval gate, and rollback version have been verified.

## Current status

Repository-side API and backend verification are available. Live Copilot Studio
authoring, tenant capability validation, publication, and an `@Mountaineer`
smoke test are blocked until the target tenant and credentials are available.

## ChatGPT Desktop handoff

Use the following prompt in an authenticated Microsoft 365/Copilot Studio
session. Do not paste secrets into the conversation.

```text
Continue the Mountaineer Copilot Studio/Teams activation for the Business Agent
project.

Deployed API:
https://landops-7pxfuiyt-api.azurewebsites.net

Target outcome:
- One primary Copilot Studio agent named Mountaineer.
- Enable generative orchestration where the tenant supports it.
- Use native agent descriptions and topic descriptions; do not invent a custom
  “Route to the agent when…” configuration field.
- Use “The agent chooses” for bounded topics where supported.
- Connect the authenticated C# API tools documented in
  docs/copilot-studio-integration.md.
- Publish Mountaineer to Microsoft Teams and test @Mountaineer.

First inspect and report:
1. Which Copilot Studio authoring experience this tenant supports: standard
   child agents, connected agents, or both.
2. Whether generative orchestration and “The agent chooses” are available.
3. Whether the API tool authentication can issue a token accepted by the API.
   The API currently validates the Azure subscription tenant and audience; do
   not weaken that boundary or use unsigned headers. Resolve any cross-tenant
   Entra configuration explicitly.

Configure only the native Copilot Studio resources. Keep authorization,
evidence, persistence, provider calls, and human approval in the C# API.
Before publishing, test these conversations in Preview and inspect the
activity map: start reconciliation, explain a finding, clarify an ambiguous
request, refuse title certification/filing, require human approval, and answer
the general process question. Then publish to a private controlled Team,
verify @Mountaineer, and record agent/topic/tool versions, sharing scope,
telemetry, failures, and rollback steps.

Do not delete existing Teams, channels, users, or the old landops-dev Azure
resources. Do not claim completion until the real Teams smoke test succeeds.
Return a concise activation report listing what was configured, what passed,
what remains blocked, and the exact rollback version.
```
