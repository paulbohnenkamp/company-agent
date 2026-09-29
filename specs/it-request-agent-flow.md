# IT Request Agent Flow Plan

## Summary

Build and verify the separate Copilot Studio Agent flow used by IT Request
Agent. The flow must reuse the existing Northstar business process and return
an observed Service Request ID and status.

## Tenant Changes

- Create or configure one Agent flow callable by IT Request Agent.
- Accept `employeeName`, `requestType`, `description`, and `isUrgent`.
- Normalize and validate those values according to
  `it-request-workflow/src/normalize.ts`.
- Create an item in the existing `Northstar / IT Service Requests` SharePoint
  list.
- Update the item with the existing `SR-###` convention.
- Post the existing request card to the existing `Northstar / IT Service
  Requests` Teams destination.
- Return `serviceRequestId`, `status`, and `result`.

## Constraints

- Leave the existing Forms-triggered flow unchanged.
- Do not create a new Forms flow, SharePoint list, Teams team, or replacement
  workflow.
- Keep Copilot Studio responsible for agent discovery, delegation, and
  orchestration.
- Do not record credentials, tokens, keys, or connection strings.

## Verification

Use Copilot Studio Preview for the first controlled request:

```text
employeeName: Alex Morgan
requestType: Access
description: Need portal access.
isUrgent: false
```

Record evidence of:

- Agent flow activity and successful completion;
- returned `SR-###` Service Request ID and status;
- the corresponding SharePoint item;
- the corresponding Teams card;
- Company Agent -> IT Request Agent delegation after direct flow testing.

The tenant work is complete only when the returned values and downstream
activity are observable. Record the evidence in `docs/deployment-log.md`.

## Follow-up

After tenant verification, add local contract checks for every agent's
description, instructions, no-invention boundary, success criterion, and
failure behavior. Run the repository build, tests, C# build, and diff check
before claiming the overall feature is complete.
