# Business Agent project state

**Last reconciled:** 2026-09-08

**First read for a new Codex or VS Code session**

**Latest approved slice:** [spec 050](../specs/050-evidence-grounded-teams-review.md). Spec 049 is completed in [its result](../results/049-remove-legacy-landops-naming.md).

**External activation work:** [spec 044](../specs/044-teams-live-activation.md) and [tenant naming adoption](tenant-naming-adoption.md)

## What this project is

Business Agent supports people across departments through Microsoft Teams.
Sample Energy Company supplies fictional people and records. Land is a department,
alongside Legal, Compliance, Accounting, and Operations. The current implementation
covers specific case-based reviews; it does not yet support arbitrary workflows.

Teams is the collaboration environment. Next.js provides focused review and local
examples. ASP.NET Core/.NET owns authorization, evidence, persistence, agent
execution, and human decisions. See [product naming](product-naming.md).

`Workroom` and selected `LandOps` values remain legacy configuration, storage,
route, database, and permission identifiers for compatibility. Business Agent
is used for current internal namespaces, modules, settings, and product copy.

## Current architecture

- **Application:** C#/.NET 10, ASP.NET Core minimal API, EF Core, SQL Server or
  Azure SQL.
- **Web:** Next.js with React. The web surface is for focused case review,
  administration, and local demonstration.
- **Agents:** Microsoft AgentSchema-compatible `agent.yaml` artifacts; the
  TypeScript loader projects them into a runtime contract.
- **Skills:** `SKILL.md` bundles with YAML front matter.
- **AI:** deterministic local providers by default; opt-in Microsoft Foundry
  provider behind the C# boundary.
- **Identity:** local synthetic personas for repeatable development; Entra roles
  and groups in production.
- **Evidence:** immutable source snapshots, provenance, findings, conflicts, and
  explicit unknowns. Public WVDEP/WVGES data is never proof of mineral title.
- **Teams:** `src/teams/` owns activity parsing, idempotency, channel mapping,
  and transport. It calls the same ASP.NET Core API as the web app.

## Verified implementation inventory

| Area | Current state | Evidence |
| --- | --- | --- |
| WV source fixtures and adapters | Verified local reference | `results/005–010`, TypeScript test suite |
| C#/.NET foundation and API | Verified | `results/013-landops-checkpoint-a.md` |
| C# WV workflow and persistence | Implemented and tested | `results/014–017` |
| C# Foundry/provider boundaries | Implemented; provider smoke is opt-in | `results/019`, `results/033` |
| Local/Azure runtime configuration | Implemented | `results/018`, `results/021`, `results/036–037` |
| Sample Energy Company/data room | Verified local seed/read paths | `results/022`, `results/028-fictional-company-data-room.md`, `results/048-business-agent-naming.md` |
| Role scenarios and delegation plans | Verified local contracts | `results/024–027`, `results/035` |
| Durable agent request threads | Implemented and SQL-tested; legacy Workroom identifiers retained for compatibility | `results/032`, `results/049-remove-legacy-landops-naming.md` |
| Entra identity boundary | Implemented; tenant activation remains external | `results/030`, `results/034` |
| AgentSchema YAML artifacts | Validated locally | `results/039`, `npm run validate:agent-artifacts` |
| Synthetic identity catalog | Validated locally | `results/040`, `npm run validate:identity-personas` |
| Azure/AZD infrastructure | Deployed evidence recorded; repeatable activation requires credentials | `results/041`, `docs/azure-deployment.md` |
| Teams adapter and human actions | Verified local vertical slice; activation readiness verified locally, tenant activation externally blocked | `specs/028-teams-first-vertical-slice.md`, `results/028-teams-first-vertical-slice.md`, `specs/043-teams-activation-readiness.md`, `results/048-business-agent-naming.md` |
| Teams adapter deployment foundation | Completed and healthy; package installed in the test Team; live evidence-backed mention verified; human-action and duplicate-activity checks remain separate follow-ups | `specs/047-teams-bot-activation.md`, `results/047-teams-bot-activation.md`, `docs/teams-live-activation.md` |
| Teams app package contract | Verified local manifest and ZIP builder; version 1.0.1 uploaded and installed in the test Team; read-only mention smoke test passed | `specs/045-teams-app-package.md`, `results/045-teams-app-package.md`, `results/047-teams-bot-activation.md` |
| Role playbook end-to-end tests | Verified three canonical agent request playbooks through the ASP.NET Core HTTP boundary; live Teams delivery remains external | `specs/046-playbook-e2e-tests.md`, `results/046-playbook-e2e-tests.md` |

## Record quality

The numbered records were created across more than one convention. The
reconciliation pass preserved their prose and normalized their metadata,
required sections, and spec/result links. A record’s completion still depends
on its recorded verification evidence; this document provides the cross-record
view so a new session does not have to infer status from prose alone.

`npm run validate:records` is now the machine-checked guard against new
unpaired or malformed execution records.

## Unfinished work and continuation backlog

### External Teams activation

Spec 048 completed the approved repository naming. The Microsoft 365 trial
tenant, licensed sample users, Team/channel, app catalog upload, and package
installation are now verified externally.

The local readiness slice is complete in [spec 043](../specs/043-teams-activation-readiness.md).
The active minimal demo plan is [spec 044](../specs/044-teams-live-activation.md)
with the operational checklist in [docs/teams-live-activation.md](teams-live-activation.md).
The browser-assisted tenant naming prompt is [docs/chatgpt-work-teams-handoff.md](chatgpt-work-teams-handoff.md).
Teams is enabled and the tenant has licensed sample users and a test Team/channel.
Microsoft's unified app-management provisioning has completed and custom app
upload is available. The deployed adapter is healthy at its Azure HTTPS
endpoint. The `business-agent-bot` resource and Teams channel now use the
Microsoft 365 tenant app identity, while the existing API workload identity
remains in the deployment tenant. The version 1.0.1 package is uploaded and
installed. The first post-install mention reached the API but returned HTTP
403 because the app-only adapter token did not carry a human role claim. A
narrow trusted-adapter API boundary was implemented, tested, deployed, and
both service health checks pass. A later post-deploy mention completed
successfully, returning five evidence findings from five sources with the
human-review boundary. The adapter deployment foundation is recorded in
[result 047](../results/047-teams-bot-activation.md).

The compatibility-aware naming and documentation cleanup in [spec 049](../specs/049-remove-legacy-landops-naming.md) is complete. The next approved work is to make the Teams review evidence-grounded and finish activation follow-ups in [spec 050](../specs/050-evidence-grounded-teams-review.md).

Local evidence includes the adapter receive-path smoke test, all four
append-only action contracts, an Entra-style wrong-role denial, a trusted
adapter allow/deny regression pair, and a typed Teams actor contract. The
playbook end-to-end suite proves three representative role journeys through
the same API boundary. Live reply delivery is verified for the read-only
evidence review path. Live human-action authorization and duplicate-activity
suppression remain external verification gates.

### Product-name compatibility migration

`Business Agent` is the product name. `LandOps` remains only where it is an
operational compatibility identifier: Azure resource names, legacy environment
aliases, routes, tables, migration metadata, and application-role values. The
new internal callers and canonical settings use Business Agent names. A future
wire or storage migration still requires a separate approved plan.

### After Teams activation: product workflow depth

- Implement the highest-value Legal ↔ Land/Title readiness scenario end to end.
- Add lease analyst and division-order analyst workflows using the shared case,
  document, evidence, and human-review contracts.
- Add bounded agent-to-agent questions only where the originating agent names
  the needed evidence and the human boundary remains explicit.

### Deliberately deferred

- Broad UI redesign until the information architecture is approved from role
  workflows rather than from the current showcase page.
- Generic agent-builder/configuration UI.
- Autonomous title certification, payment changes, filings, or external owner
  communication.
- Treating a local adapter or provider seam as a hosted Foundry agent or network
  MCP server.

## How a new Codex session should continue

1. Read `AGENTS.md`.
2. Read this file.
3. Read specs 049 and 050 and the activation records before starting a
   follow-up.
4. Inspect `git status --short` and do not overwrite unrelated user work.
5. Work only the next approved slice.
6. Run the verification commands in that spec.
7. Create/update the matching result and update this document’s inventory.

Do not use the old chat transcript as the source of truth. If the repository and
the transcript disagree, trust verified repository evidence and record the
disagreement in the active spec.

## Important external gates

- A real Teams bot requires tenant registration, credentials, consent, and
  channel configuration.
- Azure SQL data-plane migration requires the configured Entra SQL administrator;
  ARM RBAC alone is not database access.
- Foundry activation requires a pinned model deployment, supported protocol,
  endpoint smoke test, evaluation, and rollback record.
