# Teams app development

## Local services

Start SQL Server and the API using the commands in the root README. Then run:

```sh
DANGEROUSLY_ALLOW_UNAUTHENTICATED_REQUESTS=true \
BUSINESS_AGENT_API_URL=http://127.0.0.1:5006 \
npm run teams:dev
```

The adapter uses port `3978`. The API uses port `5006` in the development
profile. Local unauthenticated mode must never be used for deployment.

## Checks

```sh
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
```

Use deterministic fixtures and fake providers in tests. Do not require live
Teams, Foundry, or government endpoints for unit and contract tests.
The API integration tests require a reachable local SQL Server instance.

## Change ownership

- Teams activity mapping and formatting belong in `src/teams/`.
- Authorization, evidence, persistence, and actions belong in the C# API.
- Manifest and package behavior belongs in `teams-app/` and the package script.
- Azure resource changes belong in `infra/` and `azure.yaml`.

For multi-step work, create an approved spec and matching result. Read
`AGENTS.md`, `docs/PROJECT_STATE.md`, and the relevant Teams or WV architecture
guide before editing.
