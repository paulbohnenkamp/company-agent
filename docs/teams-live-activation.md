# Publish Mountaineer to Teams

This is the tenant-side runbook for publishing the Mountaineer Copilot Studio
agent to Microsoft Teams. The API deploys with `azd`; Teams publication happens
in Copilot Studio. There is no `azd deploy teams` step and no repository-owned
Teams bot package in the current design.

## What is already in place

- The live API is `https://mountaineer-7pxfuiyt-api.azurewebsites.net/`.
- The API serves the company, scenario, case, data-room, and evidence routes.
- Copilot Studio contains the Mountaineer agent and the Land Agent child agent.
- The Land Agent owns the `Land Read API Preview v5` REST API tool.
- The v5 tool contains the six read operations. The current tenant exposes six
  user connection rows, one for each operation. Connect all six rows before a
  Preview or Teams test.
- The prepared Teams icon is
  [`mountaineer-icon-64.png`](copilot-studio/assets/mountaineer-icon-64.png).

The API, Preview path, and Teams channel are ready for controlled read-only
testing. The current activation has passed that smoke test after all six
connection rows were connected.

## 1. Check the Land Agent

Open Mountaineer in Copilot Studio, open **Agents**, and select **Land Agent**.

Confirm the following:

- The agent is enabled.
- The **Tools** section contains `Land Read API Preview v5`.
- All six connection rows show as connected in the user connection manager.
- The selected operations include:
  - Get the Sample Energy Company portfolio context
  - List supported land-operation scenarios
  - Get the plan for a supported land-operation scenario
  - Get a case research summary
  - Get read-only data-room context for a case
  - Get evidence records and provenance for a case

Save the tool if Copilot Studio shows a draft. The operation picker may show
the first operation as selected by default. That check mark means the
operation is included in the tool configuration. It does not mean that the
operation will run on every request.

Keep the REST API tool on Land Agent. Mountaineer should delegate land work to
Land Agent. Do not attach another copy directly to Mountaineer.

## 2. Test in Copilot Studio Preview

Click **Test** and then **New test session** before each test. Reusing an old
session can make earlier activity look like a duplicate tool call.

First test the normal user experience without naming a tool:

```text
What departments and synthetic land cases are available in Sample Energy Company?
```

The activity map should show Mountaineer delegating to Land Agent, followed by
one relevant connector action. The response should identify the fictional
company and label the data as synthetic.

Then test the case path:

```text
For case synthetic-wv-case-braxton-001, a West Virginia well-reconciliation case, review the available land-read records, including WVDEP and WVGES evidence where available. Summarize what the records support, identify conflicts or unknowns, and explain what cannot be concluded about title or ownership.
```

The response should preserve WVDEP and WVGES as separate evidence sources. It
must not turn public records into proof of title or ownership. The activity map
should show Land Agent using the case, data-room, or evidence operations as
needed. It should not show Mountaineer and Land Agent each owning a separate
copy of the API tool.

If the connector returns HTTP 500, stop the Teams rollout. Check the live API
directly and refresh the Copilot Studio connection or tool configuration. Do
not import six additional connectors. The current tenant workaround is six
connections under the one logical v5 tool.

## 3. Set the agent and Teams branding

In Mountaineer, open the agent details or branding controls and upload:

[`docs/copilot-studio/assets/mountaineer-icon-64.png`](copilot-studio/assets/mountaineer-icon-64.png)

Use **Mountaineer** as the agent name. Save the change. After adding the Teams
channel, update the Teams channel details with the same icon and name. Teams
can cache app branding. An existing installation may need to be removed and
added again before the new icon appears.

## 4. Add the Microsoft Teams channel

In the Mountaineer agent:

1. Open **Channels**.
2. Choose **Microsoft Teams and Microsoft 365 Copilot**.
3. Add or turn on the Microsoft Teams channel.
4. If Copilot Studio offers **Edit details**, set the Mountaineer name,
   description, and icon there.
5. Save the channel configuration.
6. If Copilot Studio displays a dialog saying the agent must be published
   before more channel settings are available, close that dialog. Do not use
   its disabled **Publish** button.

The exact button label varies by Copilot Studio experience. The important
point is that adding the channel and publishing the agent are separate actions.

## 5. Publish Mountaineer

After the Teams channel has been added, use **Go to publish** in the channel
panel, or open the agent's **Publish** page directly. The page may show
**Not published** while the channel panel is open.

Use the main **Publish** action on that page. Wait for Copilot Studio to report
that the agent was published successfully. The **Publish** button inside the
channel-settings dialog can remain disabled until this step is complete.

Publishing the agent does not install it in Teams. Teams is a separate channel
connection.

## 6. Install it in a private Team

For the first live test, install Mountaineer in a private test Team or use the
personal app view. Keep the audience small while connection, evidence, and
refusal behavior are being checked.

If Teams asks for consent, have the tenant administrator approve the channel
or app permission. A successful install is not proof that the API connection
is authorized for every user. The API remains responsible for authorization
and data boundaries.

## 7. Run the Teams smoke test

In a channel where Mountaineer is installed, mention it explicitly:

```text
@Mountaineer What departments and synthetic land cases are available in Sample Energy Company?
```

Then run the case test:

```text
@Mountaineer Review case synthetic-wv-case-braxton-001 using the available land-read records, including WVDEP and WVGES evidence where available. Summarize supported facts, conflicts, unknowns, and what cannot be concluded about title or ownership.
```

The smoke test passes when:

- Teams routes the message to Mountaineer.
- Mountaineer delegates land work to Land Agent.
- Land Agent uses the configured v5 tool connections.
- The answer cites or names the available evidence and keeps source conflicts
  visible.
- The agent refuses to certify title, establish ownership, file documents, or
  take another consequential action without human review.

## 8. Record the activation

Record these values in the activation note or release record:

- Copilot Studio agent name and published timestamp
- Land Agent name and enabled state
- REST API tool name and version, currently `Land Read API Preview v5`
- Connection display name
- Teams Team and channel used for the test
- Icon version
- Preview and Teams smoke-test results
- Any consent, caching, or authentication issue

To roll back, remove or disable the Teams channel, or return the agent to the
last known-good published version. Do not delete the API, connection, agent, or
Team while diagnosing a failed activation.

## If Publish reports a billing issue

If the Publish dialog says **There is a billing issue** and asks an admin to
confirm billing capability for the environment and agent, stop there. This is a
tenant licensing or Copilot Credits-capacity problem. It is not caused by the
REST API, the Teams channel, or the Mountaineer icon.

Ask a Power Platform administrator to check the `DecisionForge (default)`
environment in the Power Platform admin center:

1. Open **Licensing**.
2. Open **Copilot Studio**.
3. Check the **Summary** and **Environments** tabs.
4. Allocate Copilot Credits to the environment, or link the environment to an
   Azure subscription through a Copilot Studio pay-as-you-go billing policy.
5. Confirm that the maker has the required Copilot Studio author access or an
   applicable Microsoft 365/Copilot Studio license.

Then return to Copilot Studio and try the main **Publish** action again. A
Copilot Studio trial can create and test agents, but Microsoft documents that a
trial cannot publish an agent. Capacity or pay-as-you-go billing is required
for this step.

See Microsoft's [Copilot Studio licensing
guide](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing)
and [capacity management
guide](https://learn.microsoft.com/en-us/power-platform/admin/manage-copilot-studio-copilot-credits-capacity).

## Current status

The API deployment, case seed, data-room data, evidence data, Copilot Studio
agent structure, publication, Teams installation, and read-only smoke tests
are complete. The current tenant workaround connects all six v5 connection
rows. Consolidating those rows into one reusable connection and replacing the
controlled-preview authentication with the approved Entra contract remain
follow-up work.

For the Microsoft channel behavior, see the [Copilot Studio Teams publication
guide](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams).
