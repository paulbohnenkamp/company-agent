# Land Read API tool

The canonical contract is [copilot-studio-openapi.json](../../dotnet/LandOps.Api/Resources/copilot-studio-openapi.json).
The deployed read-only contract is available at:

`https://mountaineer-7pxfuiyt-api.azurewebsites.net/openapi.json`

## Current tool configuration

- Copilot Studio tool: `Land Read API Preview v5`
- Tool type: REST API
- Owner: Land Agent
- Connection: six tenant-side connection rows, one for each configured v5
  operation
- Current authentication: none, controlled Preview only
- Current verified operations: all six read operations, including the Teams
  smoke test

The tool may appear in Mountaineer's environment tool list because the child
agent is part of Mountaineer's configuration. The live connection belongs to
Land Agent. Do not attach a second direct API connection to Mountaineer.

## Operations

The OpenAPI file defines these read-only operations:

| Operation | Input | Use |
| --- | --- | --- |
| `getCompanyPortfolio` | none | Fictional company departments, roles, workflows, agents, and cases |
| `listRoleScenarios` | none | Supported land-operation scenarios |
| `getScenarioPlan` | `scenarioId` | Ordered specialist plan and human boundary |
| `getLandCase` | `caseId` | Case summary, wells, and submitted evidence references |
| `getCaseDataRoom` | `caseId` | Read-only synthetic case records and warnings |
| `getCaseEvidence` | `caseId` | Evidence records and source provenance |

Attach the case, data-room, and evidence operations before testing a complete
evidence-grounded review. In the current tenant, Copilot Studio exposes a
separate user connection row for each configured operation. Connect all six
rows for Preview and Teams tests. Keep write and approval operations out of
this tool.

## Copilot Studio authoring notes

Use the existing REST API tool from **Land Agent → Tools** when possible. If a
new tool must be imported, upload the canonical JSON file and use a unique tool
name. The JSON uses OpenAPI 2.0 because the current Copilot Studio REST API
tool flow processes OpenAPI 2.0 directly and translates OpenAPI 3 documents.

Do not create a new connector for every test. The environment can retain tool
and connector records even after a solution is removed. Removing a tool from
an agent is different from deleting the environment connector. The current
tenant still needs a follow-up cleanup to determine whether the six connection
rows can share one connection without breaking operation routing.

## Security boundary

The current contract is suitable for controlled Preview testing only. It does
not establish production authorization. Before Teams publication, configure
the approved Entra authentication and API authorization contract. Do not send
unsigned user or role headers as a substitute for authentication.
