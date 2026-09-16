# Company Agent tenant reset and deployment prompt

You are operating from the local repository `/Users/paul/code/company-agent`
with an interactive browser signed in to the Microsoft tenant used by PAC.
Perform the approved tenant cleanup and deployment. Use the repository as the
source of truth; do not infer names from the Copilot Studio UI.

Read these files first:

- `AGENTS.md`
- `specs/059-source-controlled-company-agent-deployment.md`
- `docs/company-agent-deployment.md`
- `docs/product-naming.md`
- `copilot-studio/company-agent/`
- `.env.example`

## Target state

There is one active Company Agent deployment:

```text
Company Agent
  ├── Land Agent
  └── HR Agent
        └── Company Agent API v1 - Land + HR
```

The connector and tools must have these names:

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

The OpenAPI title is intentionally shorter for PAC compatibility:
`Company Agent API v1 Land HR`. The HR operation ID is `getVacationPolicy`.

## Preserve these resources

Do not delete, rename, deactivate, or mutate:

- `rg-mountaineer-dev`
- the Mountaineer API or its Azure resources
- the existing **Business Agent Teams Bot** Entra application or its Teams
  integration

That bot is a Teams integration identity, not the Company Agent E2E client.
Do not use its client ID for the E2E test.

The old Land tools and connector attachments installed on Mountaineer are
stale and must be removed before the Company Agent deployment. Preserve the
Mountaineer host/API and Teams identity, but remove only the obsolete
Copilot/Power Platform tool attachments and duplicate connector records after
checking their **Installed on** associations. If a connector is still needed
by the Teams bot, remove the bot's old attachment first or stop and report the
association rather than deleting the shared connector blindly.

## Procedure

1. Open the browser to [Entra app registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
   for **Entra app registrations**. Confirm the active directory is the
   DecisionForge tenant
   `ec4b8411-d158-44e0-a8cf-6f71e2d8b96b` and the signed-in user is
   `PaulBohnenkamp@landopsdemo.onmicrosoft.com`. Create or verify a separate
   app registration named
   **Company Agent Client**. Add the delegated Power Platform permission
   `CopilotStudio.Copilots.Invoke`, grant admin consent, and add
   `http://localhost` under **Authentication → Mobile and desktop
   applications**. Record its Application (client) ID as
   `COPILOT_E2E_CLIENT_ID`. Record the directory ID as `COPILOT_TENANT_ID`.
3. Open the browser to [Power Automate connections](https://make.powerautomate.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/connections)
   for **Power Automate connections**. In the DecisionForge environment,
   authorize exactly one connection for the provider in the source connector
   metadata:
   `shared_new-5Fland-20read-20api-20preview-20v5`.
4. Open the browser to [Copilot Studio agents](https://copilotstudio.microsoft.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/bots)
   for **Copilot Studio agents**. Inspect Mountaineer, Company Agent, Land
   Agent, and HR Agent. Remove stale tool attachments that point to the old
   Mountaineer/Land connector, duplicate `Land Read API Preview` tools, or
   obsolete Company/Land/HR connection references. Do not remove the Company
   Agent child agents. This cleanup must happen before the Company Agent push.
5. Open the browser to [Power Automate custom connectors](https://make.powerautomate.com/environments/Default-ec4b8411-d158-44e0-a8cf-6f71e2d8b96b/connections/custom)
   for **Power Automate custom connectors**. Remove duplicate obsolete custom
   connectors only when their descriptions, operations, or installed-on
   associations identify them as old Mountaineer/Land artifacts. Keep the
   connector whose source ID is
   `6f9cfa63-1bb1-f111-aaac-7ced8d05c994`; it is updated by the deployment
   script. PAC has no connector-delete command, so use the portal UI for this
   step.
6. Run local validation:

   ```sh
   npm run typecheck
   npm run validate:copilot-workspace
   npm run validate:naming
   npm run validate:department-artifacts
   dotnet test dotnet/LandOps.sln --no-restore
   ```

7. Put the Company Agent SDK connection string from Copilot Studio **Channels
   → Native app** or **Web app** into the ignored
   `.azure/companyagent-dev/.env` as
   `COPILOT_AGENTS_SDK_CONNECTION_STRING`. Never commit it.
8. Run the guarded deployment:

   ```sh
   COPILOT_PUSH_APPROVED=true npm run deploy:copilot-studio -- \
     .azure/companyagent-dev/copilot-workspace \
     --apply --publish
   ```

   The script synchronizes canonical source, updates and downloads the live
   connector, refuses stale definitions, checks the new connection, pushes,
   publishes, and reports publish status.
9. Run `npm run verify:copilot-deployment`. It must confirm the published
   Company Agent contains Land Agent, HR Agent, `getVacationPolicy`, the
   expected API host, and no Mountaineer connector identity.
10. Use Copilot Studio **Test** and **Activity** to verify both questions:

    - `List the available land cases.`
    - `What is our vacation policy, and how do I request time off?`

    Confirm that the first routes to Land Agent and the second routes to HR
    Agent and invokes the corresponding Company Agent API operation.

## Stop conditions

Stop and report the exact screen or command output if:

- the directory or signed-in account is wrong;
- a deletion target is ambiguous;
- a connector is installed on Mountaineer and cannot be identified as stale or
  safely detached from the Teams bot;
- PAC reports success but the downloaded live connector lacks the expected
  title or `getVacationPolicy`;
- the new connection provider is absent; or
- a deployment would mutate Mountaineer or the Business Agent Teams Bot.

Do not report success based on PAC exit code alone. Record the actual connector
name, provider, installed-on associations, published agent ID, and verification
output in the active spec's progress log.
