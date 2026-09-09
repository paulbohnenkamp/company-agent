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
