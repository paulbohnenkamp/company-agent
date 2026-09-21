---
id: 061-company-agent-local-release-lifecycle
title: Company Agent local release lifecycle
status: completed
created: 2026-09-20
updated: 2026-09-20
result: results/061-company-agent-local-release-lifecycle.md
---

## Goal

Continue the Company Agent configuration foundation through the remaining
provider-neutral lifecycle seams in one locally verifiable batch:

1. environment settings and connector implementation bindings;
2. solution packaging/import/rollback planning;
3. dependency-safe cleanup planning;
4. integrated CLI lifecycle commands; and
5. deterministic end-to-end local verification.

The batch must remain offline and non-destructive. It defines the interfaces
that a later Power Platform adapter can implement without changing product
catalog semantics.

## Non-goals

- Do not authenticate or call PAC, Azure, Dataverse, Copilot Studio, Graph, or
  connector APIs.
- Do not create, import, publish, update, or delete tenant resources.
- Do not create or consume secrets, tokens, or live connection values.
- Do not claim that a local plan is a deployed solution or provider smoke test.
- Do not delete or rewrite existing deployment scripts.
- Do not silently include unrelated worktree changes in this slice.

## Current-state findings

- Spec 060 provides the catalog loader, graph, dry-run plan, and planned state.
- The current plan has connector and connection-reference placeholders but no
  explicit environment-binding model, release mode, rollback target, or
  dependency-safe cleanup plan.
- `.azure/<environment>/` is already ignored and is suitable for local plan,
  state, and evidence artifacts.
- Provider integration must be represented by typed ports and a local adapter;
  provider mutation is a future slice.

## Chosen approach

### Environment and connector bindings

Add a provider-neutral environment document with non-secret references only:

```yaml
schemaVersion: 1
environmentKey: companyagent-dev
powerPlatform:
  environmentIdRef: COPILOT_ENVIRONMENT_ID
  solutionSettingsFile: .azure/companyagent-dev/company-agent/settings.json
resources:
  companyAgentApi:
    implementation: product-managed
    connectionReferenceKey: company-agent-api
    endpointRef: COMPANY_AGENT_API_URL
```

The loader resolves references to names, not secret values. It rejects inline
credentials and rejects unsupported environment keys. Connector bindings are
explicit and never derived from department names.

### Release plan

Extend the local plan with release modes:

- `bootstrap`: describes interactive prerequisites without attempting consent;
- `release`: describes non-interactive settings and service-principal
  prerequisites; and
- `rollback`: selects a prior immutable plan/build hash.

The plan must identify resource-solution and agent-solution artifacts,
connection-reference mappings, environment-variable mappings, import order,
rollback target, and unresolved provider actions.

### Cleanup plan

Cleanup is a graph operation, not a name-based delete. It may plan removal only
when an artifact has zero reverse dependents and is owned by the product and
environment. The first slice emits `cleanup-candidate` actions only; it never
executes them.

### Integrated CLI

Add provider-free commands:

```text
company-agent-config validate --catalog <path>
company-agent-config plan --catalog <path> --env <environment>
company-agent-config status --state <path>
company-agent-config rollback-plan --plan <path> --target <plan-hash>
company-agent-config cleanup-plan --plan <path>
```

Existing live deployment commands remain unchanged and are not routed through
these commands.

## Alternatives considered

- Extend the existing live deployment command immediately: rejected because it
  would mix provider mutation with unverified lifecycle planning.
- Store environment values directly in the product catalog: rejected because
  endpoints, credentials, and Power Platform bindings are environment state,
  not product topology.
- Delete obsolete resources during local cleanup planning: rejected because
  ownership and dependency checks require a provider-backed observation and an
  explicit destructive authorization.
- Create separate lifecycle implementations per department: rejected because
  resource and solution lifecycle is shared across departments.

## Affected files or modules

- `scripts/company-agent-config.ts` — settings, release, rollback, and cleanup
  plan types and pure functions;
- `scripts/company-agent-config-cli.ts` — provider-free integrated CLI;
- `scripts/validate-company-agent-config.ts` and
  `scripts/plan-company-agent.ts` — shared command behavior;
- `tests/company-agent-config.test.ts` — lifecycle and safety coverage;
- `.gitignore` — only if a new local output path is introduced;
- `specs/061-company-agent-local-release-lifecycle.md`;
- `results/061-company-agent-local-release-lifecycle.md`.

## Milestones

1. Add typed environment-binding and release-mode models.
2. Add pure release, rollback, and cleanup plan derivation.
3. Add integrated provider-free CLI commands.
4. Add deterministic tests for settings redaction, mode differences, rollback,
   cleanup reference counts, and command routing.
5. Run the complete repository verification suite.

## Acceptance criteria

- Environment bindings contain references, never secret values.
- Product-managed, customer-supplied, and pre-existing implementations remain
  distinct in the plan.
- Resource solution actions precede dependent agent solution actions.
- Bootstrap and release plans differ in prerequisites without contacting a
  provider.
- Rollback plans require an explicit existing plan hash and never mutate the
  current plan.
- Shared resources with remaining dependents are never cleanup candidates.
- Cleanup candidates require product/environment ownership and zero reverse
  dependents.
- CLI commands produce deterministic output and do not invoke provider tools.
- All previous spec 060 checks continue to pass.

## Verification commands

```sh
node --version
npm run validate:records
npm run typecheck
npm test
npm run validate:company-agent-config
npm run plan:company-agent -- --product company-agent --env companyagent-dev
npm run company-agent-config -- validate --catalog copilot-studio/company-agent/catalog.yaml
npm run company-agent-config -- plan --catalog copilot-studio/company-agent/catalog.yaml --env companyagent-dev
git diff --check
```

## Risks and open questions

- The real PAC adapter may require solution settings details that cannot be
  validated offline. Those remain explicit unresolved plan actions.
- Actual rollback semantics depend on managed-solution version behavior and
  require a separate deployment test environment.
- Cleanup execution requires an approved ownership and tenant-target policy.

## Progress log

- 2026-09-20: Expanded the local lifecycle after the foundation slice passed
  verification. Scope remains provider-free and non-destructive.
- 2026-09-20: Implemented environment bindings, bootstrap/release lifecycle
  plans, rollback selection, cleanup planning, and integrated provider-free CLI
  commands. Ten tests and the complete verification suite passed.

## Decision log

- 2026-09-20: The remaining lifecycle is implemented as provider-neutral pure
  planning seams before any live adapter is authorized.
- 2026-09-20: Rollback and cleanup are modeled as plans, never executed by
  local commands.

## Completion notes

The local release lifecycle is complete. The repository now has provider-neutral
settings and binding models, distinct bootstrap and release plans, ordered
solution build/import actions, rollback selection, cleanup candidates, and an
integrated CLI. Live provider adapters and destructive cleanup remain future
deployment-authorized work.
