# Copilot Studio runbook

This directory contains the tenant-side configuration used by the Mountaineer
Copilot Studio agent and its Land Agent child agent.

## Files

- [Mountaineer instructions](mountaineer-instructions.md) — paste into the
  primary agent's Instructions field.
- [Land Agent instructions](land-agent-instructions.md) — paste into the child
  agent's Instructions field.
- [Land Read API tool](land-read-api.md) — REST tool setup, operation ownership,
  connection rules, and the current preview boundary.
- [Preview checklist](preview-checklist.md) — repeatable routing, tool,
  refusal, and evidence tests.

## Mountaineer icon

Use [mountaineer-icon-64.png](assets/mountaineer-icon-64.png) when updating the
Mountaineer agent icon in Copilot Studio. It is a transparent 64×64 PNG and is
small enough for the current Copilot Studio upload limit. The larger
[source-quality icon](assets/mountaineer-icon-source.png) is retained for
future branding workflows.

In Copilot Studio, open Mountaineer, select the agent icon in the Build or
Details view, choose the upload option, select the 64×64 PNG, and save. Then
open the Teams and Microsoft 365 Copilot channel configuration, select **Edit
details**, and save the same icon for the Teams-facing app details. Existing
installations may need to be reinstalled before the new Teams branding is
visible.

## Current configuration

Mountaineer is the Teams-facing agent. Land Agent is the native child agent.
The `Land Read API Preview v5` tool is connected to Land Agent. The current
tenant requires all six connection rows to be connected before Preview or
Teams can run the complete read-only flow.

The deployed API is live at
`https://mountaineer-7pxfuiyt-api.azurewebsites.net/`, and the case,
data-room, and evidence operations have passed direct HTTP verification. The
Copilot Studio connections remain a controlled preview configuration because
they currently use tenant-side connections without Entra authentication.
