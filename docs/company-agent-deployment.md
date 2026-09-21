# Company Agent deployment

New environments use the generic Company Agent deployment shape. The existing
`rg-mountaineer-dev` environment is retained and must not be renamed, deleted,
or mutated by this workflow.

## Local configuration

`.env.example` is the tracked template. The active, ignored configuration is
`.azure/companyagent-dev/.env`, created by `azd env new` and updated by `azd env
set`. Copy the template there when you need to add the Copilot identifiers or
other values that `azd` does not generate:

```sh
azd env new companyagent-dev --no-prompt
cp .env.example .azure/companyagent-dev/.env
azd env select companyagent-dev
```

Do not put credentials, connection strings, tokens, or passwords in Git. The
root `.env` file is ignored but is not the configuration file used by the
Company Agent deployment scripts.

The target development values are:

```text
AZURE_ENV_NAME=companyagent-dev
AZURE_RESOURCE_GROUP=rg-companyagent-dev
```

### Configuration sources

The scripts do not invent tenant or agent identifiers. Set those values in the
ignored AZD environment file or provide them as shell overrides.

| Value | Used by | Resolution order | Created by |
| --- | --- | --- | --- |
| `AZURE_ENV_NAME` | All deployment helpers | Shell, then `companyagent-dev` | You or `azd` selection |
| `COPILOT_ENVIRONMENT_ID` | Connector update, PAC push, deployment verification | Shell, then `.azure/<env>/.env` | Copilot Studio/PAC inventory |
| `COMPANY_AGENT_CONNECTOR_ID` | Existing connector update and verification | Shell, then `.azure/<env>/.env` | Connector inventory for the selected environment; omit only when source metadata is current |
| `COMPANY_AGENT_SOLUTION_NAME` | Connector solution binding | Shell, then `.azure/<env>/.env` | Existing unmanaged solution unique name in the selected environment |
| `COMPANY_AGENT_API_URL` | Workspace preparation, connector host, deployment verification | Shell, then `.azure/<env>/.env` | Azure deployment output |

Before any mutating CLI command, authenticate the operator session with `az login` and select a tenant account that has Dataverse access. The CLI reuses that Azure CLI token when it provisions connection references; it does not silently open a browser login.
| `COMPANY_AGENT_APP_INSIGHTS_NAME` | E2E API-correlation query | Shell, then `.azure/<env>/.env` or `applicationInsightsName` | Azure deployment output |
| `COMPANY_AGENT_ID` | Deployment verification and publish | Shell, then `.azure/<env>/.env` | Copilot Studio/PAC inventory |
| `COPILOT_DIRECT_LINE_TOKEN_ENDPOINT` | E2E conversation token | Shell, then `.azure/<env>/.env` | Published agent's Direct Line token endpoint; current Web app/Native app panels show only the Agents SDK URL |
| `COPILOT_DIRECT_LINE_SECRET` | Alternative E2E token exchange | Shell, then `.azure/<env>/.env` | Copilot Studio Web channel security |
| `COPILOT_AGENTS_SDK_CONNECTION_STRING` | Preferred authenticated E2E conversation | Shell, then `.azure/<env>/.env` | Copilot Studio Channels → Native app/Web app |
| `COPILOT_E2E_CLIENT_ID` | Authenticated E2E caller | Shell, then `.azure/<env>/.env` | Dedicated **Company Agent Client** Entra app registration with `CopilotStudio.Copilots.Invoke` |
| `COPILOT_TENANT_ID` | Tenant containing Company Agent | Shell, then `.azure/<env>/.env` | Target tenant's Directory (tenant) ID; not the Teams bot's client ID |
| `COPILOT_E2E_REDIRECT_URI` | Local interactive sign-in callback | Shell, then `.azure/<env>/.env` | Company Agent Client registration; defaults to `http://localhost` |
| `COPILOT_PUSH_APPROVED` | Live push authorization | Shell only; must equal `true` | You explicitly set it |

The deployment script validates the workspace, updates the connector and icon,
checks the connection, and pushes only when `COPILOT_PUSH_APPROVED=true`. The
Azure provisioning and deployment commands set Azure outputs; they do not
create Copilot Studio agent IDs or grant connector consent. The standalone
workspace-preparation and verification scripts also read the same AZD
environment file, so shell exports are optional.

## Post-deployment conversation E2E test

After the Company Agent is pushed and published, run the true conversation
smoke test:

```sh
npm run test:copilot-e2e
```

The test prefers the authenticated Microsoft 365 Agents SDK connection when
`COPILOT_AGENTS_SDK_CONNECTION_STRING` is present. It obtains a delegated
Power Platform token using `COPILOT_E2E_CLIENT_ID`, starts one conversation per
scenario, sends the Land and HR questions, checks response landmarks, and
queries Application Insights for the expected API request in the same time
window. It writes transcripts and telemetry evidence under the ignored
`.azure/<env>/copilot-e2e/` directory. Direct Line remains supported when the
SDK connection value is absent.

For local browser authentication, create or use the dedicated **Company Agent
Client** app registration and add the `http://localhost` redirect URI under
**Authentication → Mobile and desktop applications**. The script opens the browser and uses the delegated
`CopilotStudio.Copilots.Invoke` permission; no client secret is required.

For the preferred authenticated path, copy the complete connection string from
Copilot Studio **Channels → Native app** or **Web app** into
`COPILOT_AGENTS_SDK_CONNECTION_STRING`, and set `COPILOT_E2E_CLIENT_ID` to the
Company Agent Client registration that has the granted
`CopilotStudio.Copilots.Invoke` permission. Do not use the Business Agent Teams
Bot client ID for this test. The test uses an interactive browser sign-in for
that delegated permission.
Microsoft documents the connection URL and authenticated invocation flow in
the [Copilot Studio code app guide].

The older Direct Line path remains available: set
`COPILOT_DIRECT_LINE_TOKEN_ENDPOINT` to the published agent's Direct Line token
endpoint, or set `COPILOT_DIRECT_LINE_SECRET` from Web channel security. The
current Web app and Native app panels expose only the Agents SDK connection
string, so the Direct Line endpoint is not copied from those panels. Never
commit either credential.
The test fails when the response looks plausible but the expected API request
is absent from Application Insights. The test evidence is a transcript plus the
matching request rows; Direct Line does not expose Copilot Studio's private
planner trace, so child-agent/tool routing remains observable in Copilot
Studio Activity/Preview rather than being inferred from model text.

[Copilot Studio custom application channel]: https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application
[Copilot Studio code app guide]: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-copilot-studio
[Direct Line token generation]: https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security

## Azure workflow

```sh
azd env new companyagent-dev --no-prompt
azd env select companyagent-dev
azd env set AZURE_RESOURCE_GROUP rg-companyagent-dev
azd provision --preview --no-prompt
azd provision --no-prompt
azd deploy --no-prompt
```

Provisioning must pass preview and the local verification suite first. The
new API endpoint and identity must then be connected to the Company Agent
configuration; no cutover is implied by creating the parallel environment.

## PAC workflow

PAC authentication uses the normal browser-based flow when the tenant requires
MFA or Security Defaults. The source workflow is:

```text
pac copilot init/clone → review/sanitize → pac copilot pull → pac copilot push
                                                        ↘ pac copilot pack
```

`pac copilot push` requires a synchronization workspace created by `pac
copilot init` or `pac copilot clone`. A sanitized source snapshot without the
local `.mcs/` synchronization metadata is not pushable by itself. The new
Company Agent workspace must be initialized with its own publisher/schema
identity; do not reuse Mountaineer's synchronization metadata.

The captured workspace is validated locally before any tenant mutation:

```sh
npm run validate:copilot-workspace
npm run deploy:copilot-studio
```

The deployment command is plan-only by default. It reads the active
`.azure/<AZURE_ENV_NAME>/.env`, validates the Company Agent API target, and
records the planned PAC command under the ignored `.azure/` directory. After
reviewing the target and the tool names, an explicit push requires:

```sh
COPILOT_PUSH_APPROVED=true npm run deploy:copilot-studio -- --apply
```

For an interactive local deployment, add `--wait-for-connection`. The command
will pause with the exact provider name, let you complete the one-time
Power Platform consent step, and then continue after you press Enter. Without
that flag, missing connection authorization fails immediately for CI safety.

The complete interactive command is:

```sh
COPILOT_PUSH_APPROVED=true npm run deploy:copilot-studio -- \
  .azure/companyagent-dev/copilot-workspace \
  --apply \
  --wait-for-connection \
  --publish \
  --test-e2e
```

When `--apply` targets the ignored `.azure/<env>/copilot-workspace`, the
deployment command first merges the canonical `copilot-studio/company-agent`
source into that PAC synchronization workspace while preserving its `.mcs`
metadata. This prevents a stale local PAC snapshot from being pushed.

If the workspace path is not the default, replace it with the reviewed PAC
workspace directory. `COMPANY_AGENT_ID` must be the Company Agent ID or schema
name used by PAC; it is not the child-agent ID.

`--publish` is an explicit second tenant mutation after the push. It requires
`COMPANY_AGENT_ID` and runs `pac copilot publish` followed by
`pac copilot status`. `--test-e2e` then runs the Direct Line conversation gate
only after publish status succeeds. It requires the Direct Line and Application
Insights settings described above. Leave both flags off when reviewing or
pushing source without activating a new published version.

The push operates on the parent workspace, which contains the nested Land
Agent and its connector actions. Do not run it while the workspace still
points at Mountaineer identifiers or an unreviewed connection reference.
PAC workspace synchronization metadata remains local and is excluded from
source control.

### REST connector bootstrap and deployment gate

The deployment script prepares the connector icon, updates the versioned
**Company Agent API v1 - Land + HR** connector definition, and checks that an
active connection exists
for the new connector before it pushes the agent workspace. The connector
actions in the source-controlled workspace are the tool installation for
Company Agent, Land Agent, and HR Agent; no separate UI add step should be
needed once the connection reference resolves to the new connector.

```sh
npm run prepare:copilot-connector
pac connector create \
  --environment "$COPILOT_ENVIRONMENT_ID" \
  --api-definition-file .azure/companyagent-dev/copilot-workspace/connectors/new_land-20read-20api-20preview-20v5-6f9cfa63-1bb1-f111-aaac-7ced8d05c994/openapidefinition.json \
  --api-properties-file .azure/companyagent-dev/connector-create/apiProperties.json \
  --icon-file .azure/companyagent-dev/connector-create/connector-icon.png \
  --solution-unique-name ca_CompanyAgent
```

For an existing connector, `deploy:copilot-studio -- --apply` performs the
idempotent update instead of creating a duplicate. The active source uses
role-qualified action names such as `Land Agent · Get Case Data Room` and
`HR Agent · Get Vacation Policy`. It deliberately stops if
`pac connection list` does not show the new connector provider. PAC 2.12.2 does
not expose a command to create a user-consented custom-connector connection.
The HR bootstrap uses the separately versioned Microsoft Power Apps CLI
(`@microsoft/power-apps-cli`, command `pa connection create`) for this step and
falls back to the Power Platform UI if interactive browser creation cannot
complete. The script then performs the source-controlled binding and refuses to
push until the connection exists.

After the connection exists, verify the deployed binding rather than trusting a
successful PAC exit code:

```sh
COMPANY_AGENT_ID=<new-agent-id> npm run verify:copilot-deployment
```

The verifier clones the published agent and fails if the legacy Mountaineer
connector or host remains. This is required because the current PAC version
can report a successful content push while retaining an existing connection
reference.

### Tenant cleanup and stale-artifact reset

The clean target has one active Company Agent connector and one active
connection reference:

```text
Company Agent API v1 - Land + HR
  Land Agent · Get Company Portfolio
  Land Agent · List Role Scenarios
  Land Agent · Get Scenario Plan
  Land Agent · Get Land Case
  Land Agent · Get Case Data Room
  Land Agent · Get Case Evidence
  HR Agent · Get Vacation Policy
```

Before the first clean push, remove the old REST/custom-connector tool
attachments from Company Agent, Land Agent, and HR Agent, then remove duplicate
obsolete connectors and their unused connection references in the DecisionForge
environment. Do not delete or rename `rg-mountaineer-dev`, the Mountaineer API,
or the **Business Agent Teams Bot** Entra application while Teams usage is
being confirmed. Those are separate from the Company Agent API deployment.

PAC 2.12.2 can update or download a connector but does not provide a connector
delete command. Therefore connector deletion is a Power Platform/Copilot
Studio administrative step, not something the deployment script pretends to
perform. Delete only the stale records whose descriptions, operation lists,
or installed-on associations identify the old Mountaineer/Land artifacts.
After cleanup, create or authorize exactly one connection for the new provider
shown by `metadata.yml`, then run the guarded deployment. The deployment now
fails before push if the downloaded live connector is not versioned and does
not contain `getVacationPolicy`.

## Test coverage

The repository currently has three verification layers:

| Layer | Land Agent | HR Agent | What it proves |
| --- | --- | --- | --- |
| .NET API tests | Yes | Yes | The land read operations and synthetic vacation-policy contract return the expected bounded data. |
| PAC workspace validation | Yes | Yes | The child definitions, connector actions, operation names, OpenAPI paths, and connection references are structurally valid. |
| Published-agent clone verification | Yes | Yes | The published Company Agent contains both child agents, the new API host/provider, and the HR operation without legacy Mountaineer identity. |
| Copilot Studio conversation E2E | Deferred | Deferred | The runner is retained for later repair. Current interim verification is Copilot Studio Preview/Activity. |

The intended deployed E2E cases are deferred. The runner is not a release gate
until its transport and response polling behavior are repaired and a live run
produces saved transcript and telemetry evidence.

```text
List the available land cases.
→ Company Agent → Land Agent → Company Agent API → land response

What is our vacation policy, and how do I request time off?
→ Company Agent → HR Agent → Company Agent API → policy response
```

### Current Copilot Studio Preview check

Use **Company Agent → Test** for interim verification. The HR question routes to
**HR Agent** successfully, but the live child currently has no connected HR API
tool, so it returns generic HR guidance instead of the governed vacation-policy
result. That confirms routing only; it does not prove HR API invocation. Check
the Land question separately in Preview/Activity for Land Agent and connector
execution.

The API tests and PAC verifier must not be reported as substitutes for those
conversation tests. A live run is required before creating the completion
record in `results/`.
