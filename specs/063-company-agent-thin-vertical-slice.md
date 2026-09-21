---
id: 063-company-agent-thin-vertical-slice
title: Company Agent thin vertical deployment slice
status: in-progress
created: 2026-09-20
updated: 2026-09-20
result: results/063-company-agent-thin-vertical-slice.md
---

## Goal

Prove that Company Agent delivers one useful end-to-end deployment outcome
before expanding the reusable configuration framework: one Company Agent,
one existing Company Agent API connector, one development environment, one
guarded deployment command, and one observable API-backed smoke test.

The slice is deliberately narrower than the current generalized catalog,
dependency, rollback, and cleanup framework. Existing framework commits are
frozen and remain available for later extraction or removal after this slice
produces evidence.

## Non-goals

- Do not add new generic catalog concepts, providers, solution topologies, or
  lifecycle abstractions.
- Do not support customer-specific connector substitutions, multiple
  environments, arbitrary child-agent graphs, or production release policy.
- Do not delete existing framework code or rewrite the existing deployment
  scripts during this proof.
- Do not mutate a tenant during local validation or dry-run planning.
- Do not claim deployment success without inspecting the resulting agent and
  running the smoke test against the selected development environment.

## Current-state findings

- The repository already has a working deployment boundary in
  `scripts/deploy-copilot-studio.ts`.
- That command validates the Copilot Studio workspace, verifies the existing
  connector metadata and live connector shape, requires
  `COPILOT_PUSH_APPROVED=true` for mutation, pushes through PAC, can publish,
  and can run `test:copilot-e2e`.
- The generalized configuration and Power Platform adapter slices are
  complete as local planning code, but no verified unpacked solution source or
  complete live solution import path has been established.
- The worktree contains unrelated user changes. They must remain unstaged and
  unchanged while this slice is developed.

## Chosen approach

Reuse the existing Company Agent Copilot Studio deployment path and prove it
with a single development target. Add only the smallest wrapper, fixture, or
verification needed to make the path repeatable and obvious. Prefer improving
the existing command and its documentation over introducing a parallel CLI.

The first successful run must have this shape:

```text
canonical Company Agent workspace
  -> deterministic local validation and preview
  -> explicit target and approval check
  -> existing connector verification
  -> PAC push to companyagent-dev
  -> optional publish
  -> one read-only API-backed conversation smoke test
  -> saved deployment evidence
```

The default command remains plan-only. Tenant mutation requires an explicit
`--apply` flag and `COPILOT_PUSH_APPROVED=true`. A target environment, API
endpoint, connector identity, and smoke-test configuration must be resolved
before mutation is allowed.

## Alternatives considered

- Continue building the generalized product framework first: rejected because
  it increases design surface without proving customer value.
- Replace the current deployment scripts with a new provider-neutral CLI:
  rejected because the existing script already owns the useful PAC boundary.
- Delete the configuration and adapter work immediately: rejected because it
  would discard reversible local work before the thin slice provides evidence.
- Attempt a live deployment as part of this repository change: rejected
  because tenant mutation requires a separately selected target and explicit
  operational approval.

## Affected files or modules

- `scripts/deploy-copilot-studio.ts` only if a focused reliability or
  observability correction is required;
- `scripts/test-copilot-deployment.ts` only if the existing read-only smoke
  test cannot provide a stable pass/fail result;
- `docs/company-agent-deployment.md` for the one-path quickstart and evidence
  requirements;
- `package.json` only for a clearly named existing-path command if needed;
- `specs/063-company-agent-thin-vertical-slice.md`;
- `results/063-company-agent-thin-vertical-slice.md` after all acceptance
  criteria pass.

Do not stage or modify unrelated dirty-worktree files.

## Milestones

1. Establish the local preview command and verify the selected development
   target is explicit and tenant-free.
2. Run the existing workspace and connector validation against the canonical
   Company Agent source.
3. Exercise the guarded deployment path in a selected development environment
   only when an operator explicitly supplies the target and approval flag.
4. Publish only after push success, then run one read-only API-backed smoke
   test and record the evidence.
5. Remove or defer any new abstraction that is not required by the proof.

## Acceptance criteria

- A clean checkout can identify the one supported development path from the
  deployment guide without reading the generalized framework first.
- Preview mode resolves the environment, endpoint, workspace, connector, and
  planned PAC command without tenant mutation.
- Mutation is impossible unless both the explicit apply flag and approval
  environment variable are present.
- The selected deployment uses the existing Company Agent API connector and
  does not create a second connector or connection.
- A successful push is followed by an observable read-only smoke test that
  exercises one API-backed Company Agent capability.
- Failure before or during push does not report success and leaves a clear
  resumable log/evidence record.
- No secrets or access tokens are written to source, command arguments, or
  deployment evidence.
- Existing repository verification remains green.
- No unrelated worktree changes are staged or modified.

## Verification commands

Local, non-mutating checks:

```sh
node --version
npm run validate:records
npm run typecheck
npm test
npm run validate:company-agent-config
npm run deploy:copilot-studio
git diff --check
```

The guarded apply and smoke-test commands are operator-run acceptance steps,
not automatic CI steps. They require a separately chosen development target
and must be recorded in the result with the environment name, timestamps,
commands, and observed outcome without recording credentials.

## Risks and open questions

- The current development environment or connector may no longer be available;
  that is an external deployment blocker, not a reason to add architecture.
- PAC workspace push is not equivalent to solution import/ALM. This slice proves
  the existing Copilot Studio path only; solution packaging remains a later,
  separately evidenced capability.
- The smoke test must remain read-only and must not silently depend on the
  retired Mountaineer path.
- Product-owner approval is still required before deciding whether the
  generalized catalog becomes a retained internal planner or is reduced after
  this proof.

## Progress log

- 2026-09-20: Pivot agreed after review that the repository architecture had
  outpaced demonstrated product value.
- 2026-09-20: Existing deployment script inspected. It already provides the
  required guarded push/publish/smoke-test boundary, so the slice will reuse it
  rather than add another deployment abstraction.
- 2026-09-20: No tenant resources, connectors, connections, or deployment state
  were modified while drafting this spec.
- 2026-09-20: Added preview-time connector resolution and identity reporting to
  the existing deployment command. Local workspace validation, configuration
  validation, typechecking, and tests pass; live push and smoke acceptance
  remain operator-run steps.
- 2026-09-20: Exercised `companyagent-dev`. The environment uses solution
  `ca_CompanyAgentA` and connector `fa1afb56-dbb2-f111-aaac-7ced8d05c994`,
  while checked-in metadata names a different environment identity. The
  deployment path now accepts explicit environment connector and solution
  bindings and materializes the selected connector ID into the ignored PAC
  workspace.
- 2026-09-20: Connector update completed, PAC reported the workspace already
  converged, publish completed, and the read-only deployment verifier passed.
  The conversation smoke test is blocked by the configured Direct Line secret
  returning HTTP 403 `Site missing`; no replacement channel credential was
  created.

## Decision log

- 2026-09-20: Freeze the existing generalized framework commits; do not delete
  them until a smaller vertical slice produces evidence.
- 2026-09-20: Treat one working Company Agent deployment as the next decision
  gate for future architecture investment.
- 2026-09-20: Keep live apply and smoke testing as explicit operator-run steps;
  local preview and validation remain the default automated checks.
- 2026-09-20: Treat PAC `No local changes detected` as an idempotent success
  state, not a failed deployment. Use `pac copilot list` for publish verification
  because PAC 2.12.2 `copilot status --bot-id` requests a missing Dataverse
  attribute in this environment.

## Completion notes

This spec records the approved thin-slice pivot. Implementation and any live
deployment evidence belong in the matching result after the acceptance and
verification criteria pass.
