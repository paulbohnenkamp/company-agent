# LandOps documentation and implementation gap report

> Historical record. Current product names and information architecture are
> defined in [product naming](product-naming.md). The terms and screenshots
> below describe the earlier implementation, not current branding or live status.

Reviewed: 2026-09-06

## Completed in this review

- Reframed the top-level README around LandOps Workbench and the C#/.NET-centered architecture.
- Added beginner-oriented links for architecture, data, code tour, workflow, glossary, product specification, and gaps.
- Documented the distinction between the web Workroom and the real Microsoft Teams channel adapter.
- Added `src/teams/landops-adapter.ts` with typed activity mapping, mention parsing, channel mapping, idempotency, and safe reply formatting.
- Added `src/teams/server.ts` as a separate Microsoft Teams SDK entrypoint that calls the ASP.NET Core Workroom API.
- Added a Teams collaboration view showing a human request, three explicit agent handoffs, and the human decision boundary.
- Added pure tests for the adapter contract, including duplicate activity suppression and channel mapping.
- Added a focused `/teams` preview and a third README screenshot for the Teams SDK → ASP.NET Core integration boundary.
- Added a checked-in synthetic employee catalog and People directory so local users, departments, roles, and review groups have one visible source of truth.
- Added a dry-run-first Entra provisioning script with tenant verification and an explicit verified-domain requirement for apply mode.

## Remaining genuine gaps

These are real deployment or product gaps, not missing polish:

- Production Teams registration still needs an Azure Bot, Teams app manifest/sideload process, Entra app credentials, and a public hosted endpoint.
- The installed desktop Teams application is present on the host, but it is not exposed as an automatable app surface in this Codex session. The real SDK adapter was started successfully on port 3978; authenticated tenant message delivery remains a deployment test.
- Idempotency is process-local. Use SQL Server/Azure SQL or another shared store before multi-replica deployment.
- The local Teams adapter forwards to the deterministic Workroom path. Selecting Microsoft Foundry requires configured endpoint, deployment, authentication, and structured-output validation.
- The identity catalog closes the local/demo user-definition gap. Production still needs Entra app registration, app roles/groups, resource role assignments, lifecycle ownership, and a deployment-specific provisioning review.
- OCR extraction and ingestion of private lease/title/division-order documents are represented by synthetic seed records, not a production document pipeline.
- Live source ingestion, Azure Blob snapshots, Azure SQL, Key Vault, Application Insights, and cost/networking decisions require a deployment plan.
- Azure infrastructure is provisioned and both images deploy successfully in
  `landops-dev`. The first EF Core schema migration and fictional case seed
  completed under the configured Entra SQL administrator. The API is restored
  to reader/writer-only runtime access, and the temporary operator firewall
  rule was removed.
- Consequential actions remain intentionally human-controlled: title conclusions, filing, payment changes, owner contact, and registry updates.

## Documentation quality note

The new LandOps boundaries and public entrypoints include beginner-oriented
module comments and XML documentation in the C# application. The older
jurisdiction-neutral TypeScript reference runtime contains many small internal
helpers without line-by-line comments; documenting every private helper would
increase reader load without improving the product boundary. Its public
contracts and learner docs are the appropriate maintenance target.

## Verification status

- TypeScript tests: passed, including Teams adapter tests.
- TypeScript typecheck: passed with incremental output disabled because the existing `tsconfig.tsbuildinfo` file is not writable in this checkout.
- Next production build: passed when run in the permitted build environment.
- .NET solution tests and live local stack verification: previously passed at checkpoint 037; no C# source changed in this deployment wave.
- Azure validation: Bicep build, deployment validation, lint, `azd provision`,
  and `azd deploy` passed. Live API health, database-backed case retrieval, and
  web endpoint checks passed after migration and seed.
