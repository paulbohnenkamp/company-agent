---
id: 050-evidence-grounded-teams-review
title: Evidence-grounded Teams review and activation completion
status: approved
created: 2026-09-08
updated: 2026-09-08
result: results/050-evidence-grounded-teams-review.md
---

## Goal

Make the live Business Agent review understandable, evidence-grounded, and
operationally complete. Each specialist contribution must explain what it
actually found in assigned records, the review must honor or clearly state its
scope, and the final Teams response must identify the decision a person is
being asked to make. Finish the remaining live activation checks and record
the verified result.

## Non-goals

- Do not represent deterministic seeded behavior as autonomous reasoning.
- Do not authorize title certification, payment changes, filings, or other
  consequential actions automatically.
- Do not create additional Teams bots, tenant users, or app identities.
- Do not require live government endpoints for deterministic tests.
- Do not re-upload the Teams package for response-only server changes.

## Current-state findings

- Teams transport, API boundary, package installation, and read-only mention
  delivery are verified.
- The live review uses a deterministic five-record fictional packet for the
  `land-ownership-gaps` scenario.
- Contribution text has been improved but still needs to be consistently
  derived from assigned records rather than templates.
- The response has exposed internal route labels such as `human-review`.
- A question mentioning the lease packet currently invokes a broader seeded
  ownership review; scope must be honored or stated clearly.
- Live human-action authorization, duplicate-activity suppression, admin
  consent, and directory-backed user authorization remain external gates.
- The Foundry provider boundary exists, but the live demo currently relies on
  deterministic behavior unless an explicitly configured provider is selected.

## Chosen approach

1. Define a structured contribution contract with agent identity, assigned
   record IDs, evidence-backed statements, unresolved facts, and failure state.
2. Generate deterministic contribution statements from selected records and
   validate cited record IDs. Do not claim competing claims unless present.
3. Make request scope visible in Teams. For the seeded case, identify Harrison
   South Unit / Tract 14 and distinguish lease, title, division-order,
   ownership, and OCR records.
4. Replace route labels with a specific recommendation and concise italic
   human-review boundary. Keep detailed disclaimers in the API packet.
5. Preserve deterministic mode for repeatable tests and add a clear provider
   mode indicator before calling a live path model-backed.
6. Add API, adapter, and playbook end-to-end tests for grounding, scope,
   failures, progress behavior, human-action denial, and duplicate activity.
7. Redeploy API and Teams, inspect live JSON and health endpoints, run a fresh
   Teams mention smoke test, update the result/project state, and record tenant
   gates without overstating completion.

## Alternatives considered

- Keep generic contribution prose: rejected because it hides evidence use.
- Show every disclaimer in Teams: rejected because it overwhelms the response.
- Switch immediately to a live model: rejected until deterministic contracts are
  correct and validated.
- Treat the read-only mention as complete activation: rejected because action
  authorization and duplicate suppression remain unverified.

## Affected files or modules

Fictional packet and data-room models, Workroom execution/provider boundary, API
tests, Teams formatter/server/client, adapter tests, provider configuration,
activation documentation, project state, and the matching result. No manifest
change is expected for response-only work.

## Milestones

1. Finalize the evidence-grounded packet and scope contract.
2. Implement contribution, recommendation, failure, and progress behavior.
3. Add deterministic contract and playbook end-to-end coverage.
4. Verify provider mode and live API/adapter health.
5. Run tenant read-only, human-action, and duplicate-activity checks where
   credentials and Teams controls permit.
6. Update documentation/result records and review the complete diff.

## Acceptance criteria

- Every displayed contribution cites assigned records and states a fact or
  uncertainty present in them.
- No displayed contribution claims a conclusion absent from the packet.
- The response names the matter and records reviewed.
- The recommendation explains what a human must decide, not just a route enum.
- Provider mode is visible and deterministic mode is not called autonomous.
- Failed specialist steps produce bounded failure contributions and no false
  successful synthesis.
- Local API, adapter, and playbook tests cover the new contracts.
- Live health, API packet shape, and Teams read-only smoke evidence are
  recorded; human-action and duplicate results are explicitly marked.
- Documentation states the verified response format without stale claims.

## Verification commands

```sh
node --version
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
az bicep build --file infra/main.bicep --stdout
git diff --check
```

Also verify the live API packet contains grounded contributions, both health
endpoints return 200, and a fresh Teams mention produces the documented
response. Use the tenant runbook for human-action and duplicate checks.

## Risks and open questions

- The fictional packet cannot prove a general-purpose agent system.
- A model provider can introduce unsupported claims without record validation.
- Teams progress rendering can vary by client and may require an Adaptive Card.
- Tenant consent and interactive identity checks may remain blocked.

## Progress log

- 2026-09-08: Approved after the live response review exposed generic,
  insufficiently grounded contribution and recommendation text.

## Decision log

- 2026-09-08: Treat evidence grounding and honest provider-mode labeling as a
  product slice, not merely a formatter change.
- 2026-09-08: Keep detailed disclaimers in the structured packet while making
  Teams concise and decision-specific.
