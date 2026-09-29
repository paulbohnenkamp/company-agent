# Result 001: Copilot Studio specialist-agent reference slice

Implemented the small reference solution described in the approved spec.

- Added clean reference descriptions for Company Agent, HR Agent, Customer
  Agent, and IT Request Agent. Company Agent and HR Agent behavior is based on
  the existing Copilot Studio artifacts in the companion `company-agent`
  repository; those artifacts remain the tenant-facing source to project into.
- Added a synthetic C# customer API with a health endpoint and customer lookup.
- Added a TypeScript MCP adapter exposing `find_customer` and
  `get_customer_summary`.
- Added a deterministic IT request normalization reference based on the
  cookbook's verified Forms -> Power Automate -> SharePoint -> Teams arc.
- Added local contract tests for the workflow and MCP tool definitions.

Verification:

```text
npm run build — passed
npm test — passed
dotnet build customer-app/CustomerApp.csproj — passed
```
