---
id: 054-microsoft-native-agent-routing
title: Adopt Microsoft-native Business Agent routing
status: in-progress
created: 2026-09-09
updated: 2026-09-09
result: results/054-microsoft-native-agent-routing.md
supersedes: specs/050-evidence-grounded-teams-review.md
---

## Goal

Replace the current custom scenario-selected, canned Teams conversation with a
Microsoft-native **Mountaineer** experience: one primary agent displayed as
Mountaineer in Teams, with generative orchestration using native
description-based selection, child or connected specialist agents where they
provide independent value, and topics for predictable conversational flows.

The production path must use configured Microsoft agent orchestration and
governed API tools. It must not return canned seeded review packets or choose a
scenario from a Teams environment-variable default. The C# API may continue to
perform deterministic evidence and business mechanics; deterministic
computation is not the same as a canned conversation.

## Non-goals

- Do not make the agent autonomous for title certification, payment changes,
  filings, external communication, or other consequential actions.
- Do not move authorization, evidence validation, persistence, or human
  approval out of the C# API.
- Do not delete deterministic fixtures, fake tools, contract tests, or
  evaluation datasets; they remain required for repeatable verification.
- Do not remove deterministic backend mechanics such as parsing, source
  snapshot hashing, evidence normalization, arithmetic, Finding validation,
  persistence, or evaluation.
- Do not create one Teams bot per specialist.
- Do not mix Copilot Studio child/connected-agent routing and Foundry Agent
  Service workflows, endpoints, or APIs without an explicit provider decision
  and compatibility test.

## Current-state findings

- `src/teams/server.ts` selects a fixed scenario, role, group, and case from
  configuration and sends the message as a question.
- `RoleScenarioSeed` maps an exact scenario ID to a fixed ordered list of agent
  IDs. Agent descriptions are not used for routing.
- `FictionalReviewPacketSeed` and related deterministic paths can produce
  canned review content for the user-facing flow.
- The Teams adapter contains custom action parsing and API transport logic,
  but it is not a Microsoft primary-agent orchestration surface.
- The repository already contains AgentSchema YAML agents, skills, typed API
  boundaries, Foundry provider seams, evidence contracts, and evaluations that
  can support the new shape.
- Microsoft Copilot Studio uses an agent’s name and description, the user’s
  message and conversation context, and the primary agent’s instructions when
  determining whether to delegate to a child or connected agent. Descriptions
  are routing inputs, not security controls. The description-based selection
  belongs in the primary-agent orchestration layer, not in the Teams transport.
  “Route to the agent when…” may be informal authoring guidance but is not a
  Microsoft configuration primitive.

## Chosen approach

1. Select Copilot Studio as the primary conversational orchestration and Teams
   publishing target. Enable generative orchestration for the primary agent.
   Use current Microsoft Foundry Agent Service workflows, agent endpoints, or
   APIs only where Foundry-specific backend orchestration or model capabilities
   are required. Do not treat Copilot Studio child/connected agents and
   Foundry Agent Service workflows as interchangeable.
2. Define one primary Business Agent with purpose, scope, refusal rules,
   escalation behavior, and response requirements.
   Its user-facing Teams display name is Mountaineer and users address it as
   `@Mountaineer`; Business Agent remains the application/API boundary.
3. Add child agents or connected agents through the supported Copilot Studio
   authoring experience only for capabilities that need independent
   specialization, ownership, or reuse. Configure each native description
   field with its purpose, domain, supported requests, exclusions, required
   inputs, output contract, and human boundary. Keep the existing WV evidence
   workflow as an API workflow unless agent separation proves useful.
4. Use topics to model bounded multi-turn conversational flows such as intake,
   clarification, evidence requests, approval preparation, and handoff. Use
   the native “The agent chooses” trigger when generative orchestration should
   discover the topic from its description. Use an explicit topic redirect or
   deterministic topic path when the application requires a mandatory sequence.
5. Expose the C# API capabilities as authenticated, allowlisted tools/actions.
   Keep evidence retrieval, parsing, normalization, hashing, calculations,
   Finding validation, persistence, and human actions in the API. The API
   remains authoritative for identity, groups/roles, case scope, evidence,
   persistence, and consequential actions.
6. Remove fixed Teams-side scenario selection and canned production response
   generation. Retain deterministic domain workflows and scenario definitions
   where they implement business mechanics, API tool contracts, topic behavior,
   or evaluations; do not use them as the conversational router.
7. Add routing telemetry and evaluations for correct delegation, ambiguity,
   refusal, unauthorized access, evidence grounding, and human escalation.
8. Before implementation, check whether the target tenant and selected
   Copilot Studio authoring experience is available in the target tenant.
   Standard Copilot Studio child agents and the newer connected-agent
   experience have different availability and configuration models. Use only
   the native mechanism supported by the selected experience.
9. Publish the primary agent to Teams, validate tenant sharing, and record the
   active agent/topic/tool versions and rollback procedure.

## Alternatives considered

- Implement a custom natural-language router in `src/teams`: rejected because
  it recreates orchestration that Microsoft’s primary agent is intended to own.
- Keep the fixed scenario router and only improve its descriptions: rejected
  because descriptions would remain documentation rather than routing inputs.
- Use Foundry Agent Service workflows, agent endpoints, or APIs as the primary
  Teams model: possible for Foundry-specific backend orchestration, but not
  selected for the Teams-facing conversational orchestrator because the
  requested authoring concept and publishing flow are Copilot Studio concepts.
- Make every existing application agent a connected agent: rejected because
  the WV evidence workflow is a cohesive backend process and does not need to
  become multiple conversational agents merely to satisfy the model.
- Treat Copilot Studio child/connected agents and Foundry Agent Service
  workflows as interchangeable: rejected because they have different artifact,
  availability, and runtime models.
- Delete all deterministic tests and fixtures: rejected because production
  nondeterminism still requires deterministic boundary and regression tests.

## Affected files or modules

Expected implementation scope includes the Teams publishing/orchestration
configuration, agent and skill artifacts, connected-agent/topic configuration,
API tool contracts and authorization, Teams transport retirement or reduction,
seeded production response paths, evaluations, deployment
configuration, Teams package/publishing instructions, and the matching result.
The exact provider-specific files are determined during the first milestone.

## Milestones

1. Confirm Copilot Studio/Foundry provider boundaries and inventory every
   current canned production path.
2. Author the primary Business Agent, native child/connected-agent description
   fields where justified, specialist instructions, and bounded topics using
   “The agent chooses” where generative orchestration supports it.
3. Expose and secure the required C# API tools/actions.
4. Remove fixed scenario selection and canned production responses while
   preserving deterministic backend mechanics, test doubles, and evaluation
   fixtures.
5. Add routing, ambiguity, authorization, grounding, refusal, and escalation
   tests/evaluations.
6. Publish to Teams, verify a representative request for each connected agent,
   inspect telemetry, and record version/rollback evidence.

## Acceptance criteria

- A single Business Agent is the Teams user-facing entry point.
- Each child or connected specialist has a tested Copilot Studio
  description-based selection configuration, and the spec records why any
  existing specialist remains an internal API workflow instead.
- The primary agent can route a natural-language request without a Teams-side
  fixed scenario default.
- Topics handle the explicitly defined bounded multi-turn flows.
- The user-facing production path does not call canned seeded review packet
  generation or deterministic response templates.
- Deterministic evidence and business mechanics remain behind governed API
  tools and continue to pass repeatable tests.
- API authorization, evidence provenance, persistence, and human approval remain
  enforced at the C# boundary.
- Ambiguous, unsupported, unauthorized, and high-consequence requests fail
  safely or ask for clarification.
- Routing and agent-output evaluations record the selected agent or topic when
  observable, correlation identifiers, relevant inputs, tool/API calls,
  outputs, errors, evidence references, component versions, and outcome.
  Evaluations must not claim to capture hidden model reasoning or
  chain-of-thought.
- The selected Copilot Studio experience and its supported child/connected
  agent and topic mechanisms are recorded before implementation.
- Teams publishing, sharing, local run/development instructions, smoke test,
  and rollback procedure are documented.
- Deterministic fixtures, fake providers, contract tests, and evaluations still
  pass without claiming to be the production orchestration.

## Verification commands

```sh
node --version
npm run typecheck
npm test
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
az bicep build --file infra/main.bicep --stdout
git diff --check
```

Also run provider-specific schema/configuration validation, a local primary
agent invocation, typed API tool contract tests, a Teams smoke test, routing
evaluations, Azure inspection, and a documented rollback/version check.

## Risks and open questions

- Copilot Studio child/connected agents and Foundry Agent Service workflows,
  agent endpoints, or APIs have different artifact and runtime models; provider
  ownership must be explicit.
- Standard Copilot Studio child agents and the newer connected-agent experience
  may have different availability and authoring behavior; tenant capability
  must be verified before the implementation shape is finalized.
- Removing seeded responses may expose missing real tools or knowledge sources.
- Natural-language routing can be ambiguous or over-delegate; clarification
  and no-match behavior must be tested.
- Teams sharing does not establish business authorization; Entra/API checks
  remain mandatory.
- The current custom Bot Framework adapter may become unnecessary if Copilot
  Studio owns Teams publishing; removal requires a verified replacement path.
- The application workflow may be split into more connected agents later, but
  that is a separate decision requiring evidence of user or ownership value.

## Progress log

- 2026-09-09: Approved as the replacement for the unimplemented deterministic
  review slice in spec 050.
- 2026-09-09: Retired the custom Teams adapter/package from the active
  repository deployment path and removed production deterministic provider
  defaults; Copilot Studio tenant verification remains external.
- 2026-09-09: Kept the spec in progress because Copilot Studio tenant
  capability, authoring, publication, Teams smoke testing, and rollback
  evidence remain unverified.
- 2026-09-09: Completed repository-side implementation and verification. Live
  Copilot Studio capability, publication, and routing checks remain blocked by
  unavailable tenant access.

## Decision log

- 2026-09-09: Preserve spec 050 as historical decision evidence; do not use it
  as the implementation target.
- 2026-09-09: Remove deterministic conversational scenario selection, fixed
  Teams-side scenario defaults, canned seeded production responses, and
  hard-coded production response templates from the Teams-facing path. Preserve
  deterministic backend execution, parsing, normalization, hashing,
  calculations, validation, persistence, fixtures, contract tests, and
  evaluation harnesses.
- 2026-09-09: Use Microsoft-native primary-agent routing and native
  description-based child/connected-agent selection; do not build a parallel
  custom router in Teams transport.
- 2026-09-09: Use “The agent chooses” for generatively selected topics where
  supported; do not treat “Route to the agent when…” as a Microsoft field or
  required format.
