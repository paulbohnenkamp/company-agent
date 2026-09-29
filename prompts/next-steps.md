# Prompt: continue Company Agent

Work in the repository root.

Continue the implementation from [docs/next-steps.md](../docs/next-steps.md)
and the tenant checklist in [docs/tenant-todo.md](../docs/tenant-todo.md).
First inspect the repository and current tenant artifacts. Preserve existing
user changes and record commands plus observed results in
`docs/deployment-log.md`. Never record credentials, tokens, keys, or connection
strings.

Use the authenticated Microsoft tenant context already documented in the
repository. Do not ask the user to log in again unless the session has
expired. Before creating or changing a tenant artifact, describe what will be
created or changed and why.

Complete the smallest useful next unit, in this order:

1. Create or configure the separate Copilot Studio Agent flow callable by IT
   Request Agent. It must accept `employeeName`, `requestType`, `description`,
   and `isUrgent`, reuse the existing Northstar SharePoint list and Teams
   destination, and return the observed Service Request ID and status.
   Use Copilot Studio Preview for the first controlled test:

   ```text
   employeeName: Alex Morgan
   requestType: Access
   description: Need portal access.
   isUrgent: false
   ```

   Require Agent flow activity, a returned `SR-###` ID and status, a
   SharePoint item, and a Teams card as evidence.
2. Keep the existing Forms-triggered flow unchanged. Do not create a new
   Forms flow, SharePoint list, Teams team, or replacement workflow.
3. Preview-test IT delegation through Company Agent after the flow succeeds,
   then publish the final composition after specialist verification.
4. Add the approved HR SharePoint knowledge source only as a separate,
   documented follow-up. Test both a grounded policy question and an
   out-of-scope question.
5. Add local contract checks for agent descriptions, instructions,
   no-invention boundaries, success criteria, and failure behavior.

The Customer MCP integration is already deployed and verified. Reuse the
existing `Customer MCP` connector and do not create a duplicate. Its Azure
deployment, endpoint, and Preview evidence are recorded in
`docs/deployment-log.md`.

Copilot Studio owns agent discovery, delegation, and orchestration. Do not add
a repository-side router, agent registry, central orchestration API, or
generalized platform framework. Keep the existing `agents/*/agent.yaml`
contracts as the source of truth and regenerate PAC workspace settings rather
than editing generated files by hand.

After each completed unit, run the relevant local checks. Before claiming the
overall feature is complete, run:

```text
npm run build
npm test
dotnet build customer-app/CustomerApp.csproj --no-restore
git diff --check
```

Do not claim Copilot Studio success from local tests or screenshots of setup
alone. Require Preview or controlled Teams activity evidence showing the
actual child agent, MCP/API or Agent flow execution, returned values, and
downstream SharePoint/Teams activity where applicable.
