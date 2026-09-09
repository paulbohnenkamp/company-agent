# Deployment overview

The current deployment shape is a C#/.NET API, Next.js web surface, and
separate Microsoft Teams adapter deployed as Azure App Service containers. The
canonical recreation instructions are in [azure-recreation.md](azure-recreation.md);
the Teams-specific operational checklist is in
[teams-live-activation.md](teams-live-activation.md).

## Local verification

```sh
npm run typecheck
npm test
npm run build
dotnet test dotnet/LandOps.sln
```

## Microsoft target shape

| Concern | Target service | Current repository seam |
| --- | --- | --- |
| Model execution | Microsoft Foundry | `FoundryClient` |
| Grounding | Azure AI Search | `AzureSearchRetriever` |
| Source files | Azure Blob Storage | retrieval/provider boundary |
| Identity | Microsoft Entra ID | `Identity` and security helpers |
| Secrets | Azure Key Vault | environment configuration boundary |
| Telemetry | Application Insights/OpenTelemetry | `TelemetrySink` and `RunTelemetry` |
| Delivery | Teams/Copilot Studio/web app | Next.js surface and API boundary |
| Tools | MCP server or approved internal APIs | MCP handler and tool registry |

Local deterministic execution remains the fastest verification path. Cloud
deployment requires credentials, managed identities, tenant configuration,
network policy, secret rotation, data retention, backup, and an operational
owner. Do not treat a local provider seam as live Foundry or MCP integration.
