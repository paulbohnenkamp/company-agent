# Business Agent development workflow

Use this guide when you change the C# application or its React integration.

## Choose the owning project

Start with the [Business Agent code tour](business-agent-code-tour.md). Put the change in the layer that owns the behavior. Keep the public API and database concerns at their boundaries.

## Local identity and Azure identity

The local app uses `LandOps:IdentityMode=local`. In this mode, the demo UI
sends a clearly labeled local user, role, and group so the agent request can be
tested without a tenant or sign-in account.

The Azure deployment uses `LandOps:IdentityMode=entra`. The hosting layer must
validate the Entra access token and populate `HttpContext.User`. The API then
reads these claims:

- `oid` (or the standard name identifier claim) for the user subject;
- `roles` for application roles such as `lease-analyst`; and
- `groups` for collaboration groups such as `lease-compliance-review`.

The browser request may still contain the local fields because the JSON shape
is shared, but Entra mode ignores them. This is important: a browser is not an
authority for identity. The API checks the resolved role and required group
before it creates an agent request thread.

This repository does not register an Entra app or create tenant role
assignments. In `entra` mode, however, the API now validates JWT bearer tokens
with ASP.NET Core. Set `Entra:TenantId` (or a complete `Entra:Authority`) and
`Entra:Audience`; startup fails fast if either authority or audience is absent.
The validated principal then reaches the existing identity resolver.

The Next.js proxy forwards the caller's `Authorization: Bearer ...` header on
write-capable API calls. The browser still talks only to the same-origin Next.js
routes, while the API remains the authority for authentication and role/group
authorization.

## agent request storage modes

Use the default `LandOps:WorkroomPersistence=memory` while learning or running
offline tests. It keeps the demo independent of SQL Server. Use
`LandOps:WorkroomPersistence=sql` when the API runs with SQL Server or Azure
SQL and migrations have been applied. The SQL adapter stores only the bounded
agent request contract; it does not turn the product into an unbounded chat archive.

## agent request execution modes

`LandOps:WorkroomExecutionProvider=deterministic` is the local default. It is
fast, offline, and useful for learning the UI. Set it to `foundry` only in an
environment with `Foundry:Endpoint`, `Foundry:Model`, and either an API key or
managed identity. The Foundry response is parsed and checked at the API
boundary; malformed output, cross-case record IDs, and non-human routes fail
closed.

## Run the local checks

Run the existing TypeScript checks from the repository root:

```sh
npm test
npm run typecheck
npm run build
git diff --check
```

Run the .NET checks with the pinned SDK:

```sh
dotnet build dotnet/LandOps.sln
dotnet test dotnet/LandOps.sln
```

GitHub Actions runs the same stack checks. The Next.js job builds before the
standalone TypeScript check because Next.js generates route types during the
build. The .NET job installs the .NET 10 SDK and runs the full solution without
requiring SQL Server or Foundry credentials.

If the local environment has restricted MSBuild process or file permissions, use the repository's supported environment rather than treating the infrastructure error as a product failure. Record the exact command and error in the result record.

## Change a persisted object

If a change adds or renames a database field, update the code and schema together.

1. Update the domain class in `dotnet/LandOps.Domain`.
2. Update the mapping in `dotnet/LandOps.Infrastructure/LandOpsDbContext.cs`.
3. Create a migration from the `dotnet` directory:

```sh
dotnet ef migrations add DescribeTheChange \
  --project LandOps.Infrastructure/LandOps.Infrastructure.csproj \
  --startup-project LandOps.Api/LandOps.Api.csproj
```

4. Build and test the solution.
5. Start the API against local SQL Server so development startup applies the migration.
6. Update the learner docs if the change alters the request flow or data model.

## Add a new endpoint

Add the application behavior before adding the HTTP route:

1. Define or reuse a domain contract.
2. Add an application service that accepts explicit inputs and returns a typed result.
3. Add a route in `dotnet/LandOps.Api/Program.cs`.
4. Add an API test in `dotnet/LandOps.Api.Tests`.
5. Add a same-origin Next.js route only when the browser needs the endpoint.
6. Add the response mapping in `src/business-agent/adapter.ts`.

## Keep deterministic tests

Use the frozen Braxton fixture for local reconciliation tests. Do not call a live government endpoint from a unit test. Add a fake provider or a stored snapshot when a new external boundary needs coverage.

The C# Foundry provider uses a fake `HttpMessageHandler` in tests. This proves
the request shape and failure mapping without sending a request to Azure. Keep
the deterministic provider as the default until a deployment supplies a real
endpoint, model, identity, and secret source.

## Keep the TypeScript reference useful

The TypeScript implementation remains a behavioral reference. When the C# path changes product behavior, compare the two paths and update the C# tests and learner docs. Do not add permanent compatibility layers only to preserve an old internal shape.

## Record the work

For a multi-step change, create an approved spec in `specs/` and a matching completed result in `results/`. Include the commands you ran and any environment limitation that affected verification. Keep the implementation small enough that a beginner can follow the call path.
