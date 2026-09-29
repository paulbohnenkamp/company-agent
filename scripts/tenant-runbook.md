# Tenant Runbook

This runbook separates repeatable Azure deployment from tenant-owned Copilot
Studio configuration. It contains no credentials, tokens, or connection
strings.

## Customer MCP Azure boundary

Preview the existing foundation and app deployment:

```bash
scripts/deploy-customer-mcp.sh --what-if \
  --api-image acrnorthstarcust.azurecr.io/customer-api:20260929 \
  --mcp-image acrnorthstarcust.azurecr.io/customer-mcp:20260929-3
```

Deploy immutable images:

```bash
scripts/deploy-customer-mcp.sh --image-tag 20260929-4
```

Verify the hosted endpoint:

```bash
scripts/verify-customer-mcp.sh
```

The script prints the actual MCP URL for Copilot Studio. Record the observed
URL and verification output in `docs/deployment-log.md`, excluding secrets.

## Copilot Studio

1. Open **Customer Agent**, not IT Request Agent.
2. Under **Build -> Tools**, find the existing `Customer MCP` server.
3. Create or reuse its connection. Leave the optional display name blank.
4. Add the connection to Customer Agent.
5. Publish Customer Agent.
6. Preview Company Agent with `Look up customer CUST-1001`.
7. Approve the read-only tool permission when prompted.
8. Confirm the activity trace shows `Company Agent -> Customer Agent -> Customer MCP` and the returned account values.
9. Test a missing ID such as `CUST-9999` and confirm no record is invented.
10. Test a mutation request and confirm the agent refuses it.

If the Add MCP dialog reports a conflict, inspect existing tools and custom
connectors before creating another one. A failed-looking first attempt can
still create the `Customer MCP` connector.

## Other tenant work

- Keep the existing Forms-triggered IT workflow unchanged.
- Configure the separate IT Agent flow with the four contract inputs and the
  existing SharePoint list and Teams destination.
- Add the approved HR SharePoint source separately and test grounded and
  out-of-scope questions.
- Record Preview or controlled Teams evidence; local tests do not prove tenant
  success.
