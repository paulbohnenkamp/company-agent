# Customer MCP Azure deployment

This directory defines the Azure hosting boundary for the synthetic Customer
MCP integration. It does not create or modify Copilot Studio agents,
connections, or tools.

```text
Container Apps environment
  -> private customer API   internal boundary, port 8080
  -> customer MCP          external HTTPS MCP endpoint, port 3000
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

Deployment values are local configuration. Copy `.env.example` to `.env`, set
the Azure resource names, image references, and MCP URL locally, and keep the
`.env` file out of source control. The wrapper script reads those values and
passes them to Bicep; no tenant-specific parameter file is committed.

```bash
scripts/deploy-customer-mcp.sh --what-if
```

Deploy images and apps after reviewing the what-if output:

```bash
scripts/deploy-customer-mcp.sh --image-tag YYYYMMDDHHMMSS
```

Verify the endpoint:

```bash
scripts/verify-customer-mcp.sh
```

The verification script reads `CUSTOMER_MCP_URL` from the local `.env` file or
accepts the URL as an argument. The tenant step remains manual: reuse or
create the Customer MCP connection, attach it to Customer Agent, approve the
read-only permission in Preview, publish, and verify the activity trace.
