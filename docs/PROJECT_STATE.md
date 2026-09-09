# Business Agent project state

**Last reconciled:** 2026-09-09

This branch is the Teams app core. Business Agent is one Microsoft Teams app
backed by an ASP.NET Core API. There is no web or administration surface.

## Current shape

- `src/teams/` receives Teams activities, handles mentions and idempotency, and
  formats replies.
- `dotnet/LandOps.*` owns authorization, case scope, evidence, persistence,
  agent plans, and human actions.
- `domains/`, `fixtures/`, and `evaluations/` define bounded deterministic
  behavior and evidence fixtures.
- `agent.yaml` and `SKILL.md` are the canonical agent and skill artifacts.
- `infra/`, `azure.yaml`, and the two App Services deploy the API and adapter.

The local baseline is deterministic. Microsoft Foundry is an opt-in provider
behind the API boundary. WVDEP and WVGES are independent evidence sources;
public evidence is not proof of title, and consequential actions require a
human.

## Teams flow

Teams sends one activity to the Business Agent app. The adapter normalizes the
actor and conversation, then calls the API. The API authorizes the request,
creates a durable thread, runs a bounded scenario and specialist plan, stores
the structured result, and returns a concise reply. Explicit human actions go
back through the API.

The current implementation uses configured scenarios and delegation plans. It
does not claim automatic routing across arbitrary agents, Teams topics, or
Microsoft 365 group-based business authorization.

## Records and continuation

Read [AGENTS.md](../AGENTS.md), this page, and the relevant current guide before
making changes. Every multi-step change needs an approved spec in `specs/` and
a matching result in `results/`; [execution-records.md](execution-records.md)
defines the format. The latest completed slice is
[spec 052](../specs/052-teams-app-core.md) with
[result 052](../results/052-teams-app-core.md). The documentation minimum is
tracked by [spec 053](../specs/053-teams-documentation-minimum.md).

Compatibility identifiers such as `LandOps` and `Workroom` may remain in
storage, routes, permissions, or deployment settings; they are not product or
collaboration-space names.

## Known verification boundary

TypeScript and .NET builds are repeatable locally. API integration tests need a
reachable SQL Server; unit and application tests do not require live Teams,
Foundry, or government endpoints.
