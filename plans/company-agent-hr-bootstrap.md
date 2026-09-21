# Company Agent shared API bootstrap

Status: in-progress

## Goal

Provide a guided bootstrap path for a new tenant that deploys the HR slice
against the shared Company Agent REST API. PAC performs the agent, connector,
child, tool, push, publish, and pull operations. The CLI also provisions the
Dataverse connection-reference row and the one user-consented API connection
shared by HR and Land.

## Command

```sh
npm run company-agent -- env init --agent-name "Company Agent A" --env companyagent-dev --apply
npm run company-agent -- deploy --dep hr --agent-name "Company Agent A" --env companyagent-dev --apply
npm run company-agent -- status --env companyagent-dev
```

Each checkpoint persists a phase and exits cleanly. Resume with `retry`; the
CLI must never recreate an already-bound connector or agent.

## Scope

- Create or reuse the shared `Company Agent API v1 Land HR` connector.
- Initialize the named Company Agent and solution as a separate lifecycle step.
- Create HR Agent as a child and attach the HR tool through a fresh workspace push.
- Create and add one solution-scoped `.api` connection reference used by HR and
  Land tools.
- Pause only for browser sign-in or connector consent when the Power Apps CLI
  cannot complete those interactive steps; deployment verification is terminal-driven.
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

The first HR trial will use this sequence:

1. Run `env init`; verify the parent agent and solution in the UI.
2. Run `deploy --dep hr`; authorize the connector connection if requested.
3. Run the deployment verifier and inspect the pulled workspace for the HR
   child and vacation-policy operation.
4. Run `status` and inspect the JSONL lifecycle log.

No automated test suite is required for this bootstrap experiment.

## Remaining implementation

- Wire `verify --dep` and `pull --dep` to persisted department bindings and
  verification commands.
- Implement dependency-safe `undeploy --dep hr` and explicit full teardown
  with `--dep all --confirm-all`.
- Add per-step structured events and triage hints to the PAC adapters rather
  than only logging the outer command.
- Add Land as a second department adapter after HR is proven.

## Progress log

- 2026-09-16: Agreed to discard the contaminated Land/PAC deployment path for
  the first bootstrap experiment and prove an HR-only flow with checkpoints.
- 2026-09-16: Corrected bootstrap semantics: PAC `copilot init` creates the
  parent agent and solution, then the script creates the connector, pushes the
  HR child/tool, publishes, pulls the clean result, and records bindings.
- 2026-09-16: Added the first `company-agent` CLI control-plane slice with
  explicit department selection, JSONL lifecycle logging, and guarded
  undeploy semantics. Existing PAC operations remain behind adapters while
  department-specific verify/pull/undeploy operations are implemented.
- 2026-09-16: PAC 2.12.2 proved unable to materialize a connection-reference
  Dataverse row from `connectionreferences.mcs.yml`; added an idempotent
  Dataverse Web API adapter and solution-component registration before push.
- 2026-09-16: The first trial showed that a child agent must receive the new
  solution schema prefix on a clean tenant; retaining the old
  `ca_CompanyAgent.agent.*` schema produced `InvalidManifestSettings` at
  runtime. The bootstrap now rewrites that child identity for fresh init.
- 2026-09-17: Fixed retry state handling. The bootstrap now persists the
  connector ID/name/provider, checks `pac connection list` before push or
  publish, pauses with the exact provider when the user-consented connection
  is absent, and skips the incompatible PAC `copilot list` call. The current
  retry safely stops before mutation because
  `shared_new_company-20agent-20a-20hr-20v1` is not yet connected.
- 2026-09-17: Corrected the Power Automate checkpoint URL to include the
  environment route prefix (`Default-<environment-id>`); the GUID-only route
  returned a portal network error before showing Connections.
- 2026-09-17: Added the Microsoft Power Apps CLI `@microsoft/power-apps-cli`
  1.0.2 as an exact dev dependency. The retry path now signs into `pa` when
  needed, creates the custom-connector connection, verifies it, and falls back
  to the corrected maker-portal URL only when CLI creation cannot complete.
- 2026-09-17: Removed the post-push and post-publish human checkpoints from
  the apply path. A single retry command now creates/verifies the connection,
  pushes, publishes, pulls, and records the completed phase; only interactive
  authentication or connection consent can pause it.
- 2026-09-17: Corrected the resource boundary: the REST connector and
  user-consented connection are shared by Land and HR. The bootstrap now uses
  `Company Agent API v1 Land HR`, creates the connection as `Company Agent API
  v1 - Land + HR`, and writes one stable `.api` connection reference instead
  of an HR-specific connection.
