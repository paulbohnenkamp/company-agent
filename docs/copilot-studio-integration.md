# Copilot Studio integration

Mountaineer is the user-facing Copilot Studio agent published to Microsoft
Teams. Business Agent is the C# application/API boundary behind it.

## Responsibilities

Copilot Studio owns the employee conversation, generative orchestration,
native topic selection, and child/connected-agent delegation supported by the
selected tenant authoring experience. Teams is only the channel.

The C# API owns identity and tenant validation, authorization, case scope,
source retrieval policy, evidence provenance, deterministic parsing and
normalization, hashing, calculations, Finding validation, persistence, audit,
evaluations, human approval, and consequential actions.

Do not create a custom natural-language router in the repository. Do not treat
agent or topic descriptions as authorization controls.

## Native authoring boundary

Configure the primary agent with generative orchestration enabled. Add child or
connected agents only when independent specialization, ownership, or reuse
justifies them. Use each native description field to state purpose, domain,
supported requests, exclusions, required inputs, outputs, and human boundary.

Use topics for bounded conversation flows. Use **The agent chooses** when
generative orchestration should discover a topic from its description. Use an
explicit redirect or deterministic topic path when a mandatory sequence is
required.

Before authoring, verify which Copilot Studio experience the target tenant
supports. Standard child agents and newer connected agents have different
availability and configuration models. Record the selected experience and
published versions in the result record.

## API tools

The current application boundary includes a narrow read-only Copilot Studio
contract at:

`GET https://mountaineer-7pxfuiyt-api.azurewebsites.net/openapi.json`

The contract currently exposes these read-oriented operations:

| Operation | Purpose |
| --- | --- |
| `GET /api/v1/cases/{caseId}` | Read a case within the API boundary |
| `GET /api/v1/company` | Read fictional company and department context |
| `GET /api/v1/scenarios` | Read supported land-operation scenarios |
| `GET /api/v1/scenarios/{scenarioId}/plan` | Read a scenario plan |
| `GET /api/v1/cases/{caseId}/data-room` | Read case data-room context |
| `GET /api/v1/cases/{caseId}/evidence` | Read case evidence and provenance |

Write and approval operations remain outside the initial Copilot Studio tool
allowlist until their authenticated contract and human-approval flow are
verified.

Expose these operations to Copilot Studio through the selected authenticated
connector or API tool mechanism. The connector must pass the minimum required
case and conversation context. The API must validate the caller, scenario,
case, evidence references, and action permissions independently.

The existing WV workflow remains an internal deterministic backend workflow.
It is available to governed tools and evaluations; it is not a conversational
router and its fixtures are not production canned responses.

## Local and live verification

Local verification uses the Development environment and deterministic fakes.
That proves API contracts and evidence mechanics, not Copilot Studio routing.
Live verification requires tenant access and must include:

```text
tenant capability check
→ native agent/topic configuration validation
→ authenticated API tool call
→ Copilot Studio Preview/activity map inspection
→ Teams @Mountaineer smoke test
→ routing/evidence evaluation
→ published version and rollback record
```

No live Copilot Studio or Teams publication is claimed until those checks are
performed with the target tenant.
