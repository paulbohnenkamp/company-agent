---
id: 052-teams-app-core
title: Reduce Business Agent to the Teams app core
status: completed
created: 2026-09-09
updated: 2026-09-09
result: results/052-teams-app-core.md
---

## Goal

Create a focused feature branch whose supported product surface is the
Microsoft Teams app backed by the ASP.NET Core API.

## Non-goals

- Do not remove the API, Teams adapter, Teams package, evidence fixtures, or
  bounded review behavior.
- Do not delete historical execution records or compatibility identifiers.
- Do not delete deployed Azure resources or mutate tenant state.
- Do not introduce a replacement web or administration application.

## Current-state findings

- The repository contained a large Next.js/React review and administration
  surface that is no longer part of the product direction.
- Azure and package configuration still treated the web app as a deployment
  service and Teams manifest URL source.
- Tests and validators included web-only imports and assumptions.

## Chosen approach

- Remove the Next.js app, React components, web Dockerfile, web-only tests,
  Next dependencies, and web Azure service from this branch.
- Keep TypeScript only for the Teams adapter, package builder, provider-neutral
  mechanics, fixtures, and tests that still support the Teams/API product.
- Use a generic public information URL for required Teams manifest metadata.
- Replace current navigation with concise Teams architecture and development
  guides while retaining historical material in Git history and the history
  index.

## Alternatives considered

- Keep the web app dormant: rejected because it continues to imply a supported
  product surface and preserves unnecessary dependencies.
- Delete the entire TypeScript runtime: rejected because the Teams adapter,
  package tooling, fixtures, and deterministic tests still use it.
- Delete the deployed web resource: rejected because branch work must not mutate
  external Azure state without a separate deployment approval.

## Affected files or modules

Next.js/React app files, web-only tests, Node package dependencies and scripts,
`azure.yaml`, `infra/main.bicep`, Teams package metadata, current README/docs,
CI workflow, and naming/documentation validators.

## Milestones

1. Checkpoint the naming/documentation work and create the feature branch.
2. Remove the web surface and its dependency/configuration edges.
3. Establish Teams-only documentation and package metadata.
4. Run TypeScript, .NET, artifact, naming, record, and Bicep verification.

## Acceptance criteria

- The branch contains no Next.js or React application surface.
- `azure.yaml` and Bicep define API and Teams services only.
- Teams package generation no longer requires a web application URL.
- Typechecking, TypeScript tests, validators, .NET build, and Bicep compilation
  pass. .NET API integration tests remain SQL Server-gated.
- Current README/docs describe the Teams app as the supported product.
- Existing historical material remains recoverable from the checkpoint commit.

## Verification commands

```sh
npm run typecheck
npm test
dotnet build dotnet/LandOps.sln
dotnet test dotnet/LandOps.sln
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
az bicep build --file infra/main.bicep --stdout
git diff --check
```

## Risks and open questions

- Existing Azure web resources may remain until a separately approved cleanup
  deployment; this branch no longer manages them.
- The Teams manifest still requires public metadata URLs even though the repo
  has no web app; deployment must provide an appropriate URL.
- Older tests still exercise the provider-neutral runtime because it supports
  deterministic review behavior and is not the user-facing surface.

## Progress log

- 2026-09-09: Approved after the Teams-first product decision.

## Decision log

- 2026-09-09: The supported product surface is Microsoft Teams plus the
  ASP.NET Core API.
- 2026-09-09: The Next.js/React web and administration surface is removed from
  this feature branch.
