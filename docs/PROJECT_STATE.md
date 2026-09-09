# Business Agent project state

**Last reconciled:** 2026-09-09

This branch adopts Mountaineer as the user-facing Copilot Studio agent. Users
mention `@Mountaineer` in Teams. Business Agent is the C# application/API
boundary behind the agent. The custom Bot Framework adapter and Teams package
are no longer the active orchestration path.

## Current shape

- Copilot Studio owns conversation, generative orchestration, topics, and
  supported child/connected agents.
- `dotnet/LandOps.*` owns authorization, case scope, evidence, persistence,
  agent workflows, API tools, and human actions.
- `domains/`, `fixtures/`, and `evaluations/` define bounded behavior and
  deterministic backend verification.
- `agent.yaml` and `SKILL.md` remain the canonical repository artifacts.
- `infra/` and `azure.yaml` deploy the C# API and its supporting Azure
  resources.

The production conversation path must not use fixed Teams scenario defaults or
canned seeded responses. Deterministic parsing, normalization, hashing,
calculations, validation, persistence, fixtures, and evaluation remain backend
mechanics and test assets.

WVDEP and WVGES are independent evidence sources. Public evidence is not proof
of title, and consequential actions require a human.

## Records and continuation

Read [AGENTS.md](../AGENTS.md), this page, and the relevant current guide before
making changes. Every multi-step change needs an approved spec in `specs/` and
a matching result in `results/`; [execution-records.md](execution-records.md)
defines the format. Spec 050 is preserved as a superseded historical record.
The active implementation is [spec 054](../specs/054-microsoft-native-agent-routing.md).

Compatibility identifiers such as `LandOps` and `Workroom` may remain in
storage, routes, permissions, or deployment settings; they are not product or
collaboration-space names.

## Verification boundary

Local deterministic fakes verify backend contracts. Copilot Studio tenant
capability, native agent/topic configuration, Teams publication, routing
behavior, and activity-map inspection require external tenant access and are
not claimed until verified.
