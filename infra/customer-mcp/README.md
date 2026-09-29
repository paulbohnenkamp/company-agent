# Customer MCP Azure deployment

This directory defines the Azure hosting boundary for the synthetic Customer
MCP integration. It does not create or modify Copilot Studio agents,
connections, or tools.

```text
Container Apps environment
  -> ca-northstar-customer-api   internal boundary, port 8080
  -> ca-northstar-customer-mcp   external HTTPS MCP endpoint, port 3000
```

The API and MCP apps use system-assigned managed identities to pull from ACR;
the registry admin account remains disabled. The MCP app calls the API through
the environment's internal FQDN. The public MCP URL is emitted as a Bicep
deployment output.

`foundation.bicep` creates a new demo registry, Log Analytics workspace, and
Container Apps environment. `main.bicep` manages the two apps against an
existing foundation and creates deterministic `AcrPull` assignments only for a
new foundation. When adopting an existing environment, Azure's previously
created pull assignments are preserved. Images are built outside Bicep with
ACR Tasks and passed as immutable tags.

Preview the current deployment:

```bash
scripts/deploy-customer-mcp.sh --what-if \
  --api-image acrnorthstarcust.azurecr.io/customer-api:20260929 \
  --mcp-image acrnorthstarcust.azurecr.io/customer-mcp:20260929-3
```

Deploy images and apps:

```bash
scripts/deploy-customer-mcp.sh --image-tag 20260929-4
```

Verify the endpoint:

```bash
scripts/verify-customer-mcp.sh
```

The script prints the exact values for Copilot Studio. The tenant step remains
manual: reuse or create the Customer MCP connection, attach it to Customer
Agent, approve the read-only permission in Preview, publish, and verify the
activity trace.
