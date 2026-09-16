# Company Agent HR bootstrap

Status: in-progress

## Goal

Provide a guided bootstrap path for a new tenant that creates only the HR
slice of a Company Agent deployment, with explicit checkpoints for operations
that require Copilot Studio or Power Automate UI interaction.

## Command

```sh
npm run deploy:copilot-studio -- --mode bootstrap --agent-name "Company Agent A" --apply
```

## Scope

- Create an HR-only connector from a clean generated OpenAPI definition.
- Create or identify the named Company Agent.
- Create HR Agent as a child.
- Create and attach the HR tool.
- Pause for connection and consent actions.
- Push, publish, pull the clean result, and save environment bindings.
- Do not read or reuse the Land/PAC pulled workspace.

## Non-goals

- Land Agent deployment.
- Mountaineer cleanup.
- E2E client registration or Direct Line testing.
- Existing-tenant update behavior.

## Checkpoints

Every tenant mutation must print the exact browser URL, requested action, and
the value or screenshot needed to continue. A checkpoint is not successful
because a command exits zero; the next step must inspect the returned tenant
artifact or ask for confirmation.

## Verification

The user will verify the HR agent and tool in Copilot Studio after bootstrap.
No automated test suite is required for this bootstrap experiment.

## Progress log

- 2026-09-16: Agreed to discard the contaminated Land/PAC deployment path for
  the first bootstrap experiment and prove an HR-only flow with checkpoints.
