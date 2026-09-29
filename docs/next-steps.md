# Next steps

The four-agent composition is now established in Copilot Studio:

```text
Company Agent
  -> HR Agent
  -> Customer Agent -> Customer MCP -> existing Customer C# API
  -> IT Request Agent -> Copilot Studio Agent flow
```

Company Agent -> HR Agent delegation is proven in Preview, and the HR
no-invention behavior is working when approved policy knowledge is missing.
Customer MCP is deployed to Azure, attached to Customer Agent, and verified in
Company Agent Preview with a successful `CUST-1001` lookup. The current tenant
work starts with the IT Request Agent flow; the Azure MCP deployment is no
longer a pending prerequisite.
The repository remains the source of truth for the local agent contracts.

## 1. Build and verify the IT Agent flow

Create the separate Copilot Studio Agent flow with this contract:

```text
IT Request Agent
  -> employeeName
  -> requestType
  -> description
  -> isUrgent
  -> Agent flow
  -> existing SharePoint list
  -> existing Teams destination
  -> Service Request ID + status
```

Keep the existing Forms-triggered flow unchanged. Reuse its Northstar
SharePoint list, Teams destination, connections, normalized request shape,
SharePoint update behavior, Service Request ID convention, and Teams card
behavior. Test one controlled request and capture the returned ID, status,
SharePoint item, Teams activity, and Agent flow activity trace. Use Copilot
Studio Preview for the first controlled test:

```text
employeeName: Alex Morgan
requestType: Access
description: Need portal access.
isUrgent: false
```

Do not modify or replace the Forms-triggered flow.

## 2. Finish Company Agent verification

- Confirm the existing Customer Agent delegation remains usable after the
  Customer MCP connection is attached.
- Preview-test IT Request Agent delegation after the flow succeeds directly.
- Publish the final composition only after specialist verification.

## 3. Add HR SharePoint knowledge

After the guard behavior is stable:

- Attach the approved Northstar HR policy SharePoint source.
- Test a question that should be answered from policy.
- Test a question outside the policy.
- Confirm the agent distinguishes sourced policy from an HR decision.

## 4. Add repeatable local checks and documentation

Keep the small deployment surface focused on the existing scripts and
contracts. Add local checks that every agent has:

- a description;
- an instruction block;
- a no-invention boundary;
- a domain-specific success criterion;
- a domain-specific failure behavior.

After the tenant work, run:

```text
npm run build
npm test
dotnet build customer-app/CustomerApp.csproj --no-restore
git diff --check
```

Record tenant evidence in `docs/deployment-log.md` without credentials,
tokens, keys, or connection strings.

## Deliberate non-goals

- Do not add a custom agent router or registry.
- Do not add a central orchestration API.
- Do not replace or modify the Forms-triggered flow.
- Do not create a new SharePoint list, Teams team, or Forms flow.
- Do not add reusable Copilot Studio Skills until a repeated multi-step
  behavior genuinely needs one.
- Do not claim tenant success without Preview or controlled Teams evidence.
