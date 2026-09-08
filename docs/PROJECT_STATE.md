# LandOps project state

**Last reconciled:** 2026-09-07  
**First read for a new Codex or VS Code session**  
**Authoritative continuation record:** [specs/044-teams-live-activation.md](../specs/044-teams-live-activation.md)

## What this project is

LandOps is an evidence-centered oil-and-gas land-operations application. The
primary user conversation is intended to happen in Microsoft Teams. A focused
Next.js review surface lets a person inspect a case, evidence, findings,
unknowns, and human decisions. ASP.NET Core/.NET owns the application boundary.

The central flow is:

```text
Teams conversation → Workroom → bounded agent route → evidence-backed result
→ focused review → human action
```

Teams and the web app are front ends. They do not own land rules, evidence
interpretation, authorization, persistence, or agent orchestration.

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
  and transport. It calls the same Workroom API as the web app.

## Verified implementation inventory

| Area | Current state | Evidence |
| --- | --- | --- |
| WV source fixtures and adapters | Verified local reference | `results/005–010`, TypeScript test suite |
| C#/.NET foundation and API | Verified | `results/013-landops-checkpoint-a.md` |
| C# WV workflow and persistence | Implemented and tested | `results/014–017` |
| C# Foundry/provider boundaries | Implemented; provider smoke is opt-in | `results/019`, `results/033` |
| Local/Azure runtime configuration | Implemented | `results/018`, `results/021`, `results/036–037` |
| Fictional Blue Ridge company/data room | Verified local seed/read paths | `results/022`, `results/028-fictional-company-data-room.md` |
| Role scenarios and delegation plans | Verified local contracts | `results/024–027`, `results/035` |
| Durable Workroom threads | Implemented and SQL-tested | `results/032` |
| Entra identity boundary | Implemented; tenant activation remains external | `results/030`, `results/034` |
| AgentSchema YAML artifacts | Validated locally | `results/039`, `npm run validate:agent-artifacts` |
| Synthetic identity catalog | Validated locally | `results/040`, `npm run validate:identity-personas` |
| Azure/AZD infrastructure | Deployed evidence recorded; repeatable activation requires credentials | `results/041`, `docs/azure-deployment.md` |
| Teams adapter and human actions | Verified local vertical slice; activation readiness verified locally, tenant activation externally blocked | `specs/028-teams-first-vertical-slice.md`, `results/028-teams-first-vertical-slice.md`, `specs/043-teams-activation-readiness.md` |
| Teams adapter deployment foundation | Completed and healthy; Bot Service registration and tenant package activation remain externally blocked on single-tenant app setup | `specs/047-teams-bot-activation.md`, `results/047-teams-bot-activation.md`, `docs/teams-live-activation.md` |
| Teams app package contract | Verified local manifest and ZIP builder; real bot values, endpoint, icons, upload, and smoke test incomplete | `specs/045-teams-app-package.md`, `results/045-teams-app-package.md` |
| Role playbook end-to-end tests | Verified three canonical Workroom playbooks through the ASP.NET Core HTTP boundary; live Teams delivery remains external | `specs/046-playbook-e2e-tests.md`, `results/046-playbook-e2e-tests.md` |

## Record quality

The numbered records were created across more than one convention. The
reconciliation pass preserved their prose and normalized their metadata,
required sections, and spec/result links. A record’s completion still depends
on its recorded verification evidence; this document provides the cross-record
view so a new session does not have to infer status from prose alone.

`npm run validate:records` is now the machine-checked guard against new
unpaired or malformed execution records.

## Unfinished work and continuation backlog

### Active approved slice: Teams live activation

The local readiness slice is complete in [spec 043](../specs/043-teams-activation-readiness.md).
The active minimal demo plan is [spec 044](../specs/044-teams-live-activation.md)
with the operational checklist in [docs/teams-live-activation.md](teams-live-activation.md).
The browser-assisted tenant setup prompt is [docs/chatgpt-work-teams-handoff.md](chatgpt-work-teams-handoff.md).
Tenant bot registration, credentials, consent, and channel configuration remain
external prerequisites for the demo. Teams is enabled, two licensed sample
users exist, and the `LandOps Demo` Team with its `landops-demo` channel exists.
Microsoft's unified app-management provisioning has completed and custom app
upload is available. The deployed adapter is healthy at its Azure HTTPS
endpoint. Package upload and live smoke testing remain incomplete until the
single-tenant bot app is created in the Teams tenant. The adapter deployment
foundation is recorded in [result 047](../results/047-teams-bot-activation.md).

Local evidence includes the adapter receive-path smoke test, all four
append-only action contracts, an Entra-style wrong-role denial, and a typed
Teams actor contract. The playbook end-to-end suite now proves three
representative role journeys through the same API boundary. It does not prove
live Teams delivery; production workload authentication and directory-backed
authorization remain later work.

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
3. Read the active spec named above.
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
