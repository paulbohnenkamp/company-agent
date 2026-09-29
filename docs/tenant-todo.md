# Tenant follow-up checklist

This tracks tenant configuration and verification that cannot be inferred from
local TypeScript tests. Do not record credentials, tokens, or connection
strings here.

## HR Agent

- [ ] Add the approved Northstar HR policy SharePoint source under **Knowledge**.
- [ ] Confirm the source is permission-trimmed and returns the intended policy
      content for the signed-in user.
- [x] Update HR Agent instructions with the repository's no-invention guard.
- [ ] Republish HR Agent after the approved source is attached.
- [ ] Preview-test a policy question and confirm the activity trace and source
      grounding.

## Company Agent composition

- [x] Connect HR Agent, Customer Agent, and IT Request Agent to Company Agent.
- [x] Verify Company Agent -> HR Agent delegation in Preview activity.
- [x] Preview-test Customer Agent delegation, including a successful MCP lookup.
- [ ] Preview-test IT Request Agent delegation.
- [ ] Publish the final composition after specialist verification.

## Customer Agent

- [x] Attach the customer MCP server as a tool.
- [x] Verify a read-only lookup reaches the existing synthetic C# API.
- [x] Confirm missing records are reported without invention and customer
      changes are not claimed.

The deployed endpoint and verification evidence are recorded in
`docs/deployment-log.md`. The current Copilot Studio tool is the existing
`Customer MCP` connector; do not create a duplicate connector.

## IT Request Agent

- [ ] Create a separate Copilot Studio Agent flow with the four request inputs.
- [ ] Reuse the existing Northstar SharePoint list and Teams destination.
- [ ] Return the observed Service Request ID and status.
- [ ] Test the flow in Copilot Studio Preview with activity evidence.
- [ ] Confirm the SharePoint item and Teams card were created by the flow.

First controlled test:

- `employeeName`: `Alex Morgan`
- `requestType`: `Access`
- `description`: `Need portal access.`
- `isUrgent`: `false`

## Reusable skills

- [ ] Revisit reusable Copilot Studio skills only if a repeated multi-step
      behavior emerges.
- [ ] Do not assume `pac copilot pack` includes uploaded skills until the tenant
      representation and export/import behavior are verified.

## Local repository checks

- [ ] Add contract checks for every agent's description, instructions,
      no-invention boundary, success criterion, and failure behavior.
- [ ] Run the required build, test, C# build, and diff checks after the tenant
      work is complete.
