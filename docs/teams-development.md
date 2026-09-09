# Mountaineer development

The repository-side development target is the Business Agent C# API and its
authenticated tool boundary. Copilot Studio authoring and Teams publication
require a connected tenant and are not part of the local test loop.

## Local API

Start SQL Server and the API using the commands in the root README. Development
configuration may use deterministic fakes for repeatable backend verification;
production configuration requires the Foundry/provider path.

## Checks

```sh
node --version
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
```

Use deterministic fixtures and fake providers in tests. Do not require live
Teams, Copilot Studio, Foundry, or government endpoints for unit and contract
tests.

## Change ownership

- Copilot Studio agent/topic configuration belongs in the tenant authoring
  experience and its versioned deployment record.
- API tools, authorization, evidence, persistence, and actions belong in the
  C# API.
- Deterministic parsing, normalization, hashing, calculations, and evaluation
  mechanics remain in the backend.
- Azure resource changes belong in `infra/` and `azure.yaml`.

For multi-step work, create an approved spec and matching result. Read
`AGENTS.md`, `docs/PROJECT_STATE.md`, and
`docs/copilot-studio-integration.md` before editing.
