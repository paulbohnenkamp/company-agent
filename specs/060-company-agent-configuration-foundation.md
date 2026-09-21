---
id: 060-company-agent-configuration-foundation
title: Company Agent configuration foundation
status: completed
created: 2026-09-20
updated: 2026-09-20
result: results/060-company-agent-configuration-foundation.md
---

## Goal

Create the first implementation slice for the reusable Company Agent product
configuration system. The slice defines and proves a deterministic local
model for product topology, department packages, operation contracts, API
resources, solution dependencies, and deployment state without mutating a
tenant, connector, connection, solution, agent, or Azure resource.

This spec implements only:

1. catalog schema and loader;
2. deterministic validation;
3. dry-run deployment planning;
4. solution/dependency graph construction; and
5. a no-mutation deployment state model.

The output is a reviewable plan and typed domain model that later deployment
slices can consume.

## Non-goals

- Do not authenticate to Power Platform, Azure, Dataverse, or Copilot Studio.
- Do not call PAC, `az`, `azd`, Microsoft Graph, connector APIs, or tenant APIs.
- Do not create, update, import, export, publish, delete, or connect anything.
- Do not generate or rewrite Copilot Studio agent, topic, action, OpenAPI, or
  solution source files.
- Do not implement connector provisioning, connection consent, secret
  management, solution import, managed-solution release, or cleanup.
- Do not decide the final customer connector adapter strategy beyond modeling
  an explicit implementation binding and compatibility result.
- Do not change the existing tenant deployment or remediate existing stale
  artifacts.
- Do not change the current product strategy plan except for references needed
  to link this approved implementation slice.

## Current-state findings

- `plans/company-agent-config-strategy.md` defines the intended product
  catalog, reusable department packages, logical API resources, and solution
  ALM direction, but remains a strategy document.
- `departments/hr/catalog.yaml` currently declares HR skills but no operation
  contract or API-resource dependency.
- `departments/land/catalog.yaml` declares skills and flows but no explicit
  operation-to-resource bindings.
- `copilot-studio/company-agent/` contains Copilot Studio workspace artifacts,
  connector exports, and connection-reference metadata. It is not yet a
  complete, verified unpacked solution source tree.
- `azure.yaml` describes the Azure API service and is not the product catalog.
- `scripts/company-agent.ts` currently has department-specific deployment
  routing and lifecycle logging. This slice must not expand its tenant-mutating
  behavior.
- The repository uses strict TypeScript with `yaml` for local YAML parsing and
  has deterministic artifact-validation scripts that can be extended or
  composed.

## Chosen approach

### 1. Canonical domain model

Implement a functional core that transforms explicit files into a validated
desired-state model and then into a deterministic deployment plan.

The core concepts are:

- `Product`: stable product key, version, display name, root agent, packages,
  resources, contracts, and solution declarations.
- `Agent`: stable agent key, source path, optional parent, and child-agent
  references.
- `DepartmentPackage`: package root, catalog identity, capabilities, skills,
  flows, and operations.
- `Capability`: stable package-owned grouping for operations.
- `Operation`: stable semantic operation key, owning capability, required
  resource, and selected contract operation.
- `ApiResource`: stable logical dependency independent of display names or
  tenant IDs.
- `ConnectorContract`: repository-owned versioned operation surface expected
  by the product.
- `ConnectorImplementation`: provider-specific implementation binding that may
  be product-managed, customer-supplied, or pre-existing.
- `Solution`: logical package boundary with component categories and explicit
  dependencies.
- `EnvironmentBinding`: non-secret target names and references used by the
  plan; it contains no credentials.
- `DeploymentState`: local desired/observed execution state for resumability;
  it records intent and completed plan phases, not tokens or secrets.

The model must distinguish semantic keys from display names and provider
identifiers. Provider IDs are observed metadata and are not required in the
catalog.

### 2. Minimal product catalog schema

The first schema is intentionally narrow:

```yaml
schemaVersion: 1
product:
  key: company-agent
  version: 1.0.0
  displayName: Company Agent
  rootAgent: root

packages:
  hr:
    path: ../../departments/hr
  land:
    path: ../../departments/land

agents:
  root:
    source: agents/root
    children: [hr, land]
  hr:
    package: hr
    source: agents/hr
  land:
    package: land
    source: agents/land

contracts:
  company-agent-api:
    version: 1.0.0
    source: ../../contracts/company-agent-api/v1.yaml

resources:
  companyAgentApi:
    contract: company-agent-api
    implementation:
      kind: product-managed
      source: ../../connectors/company-agent-api-v1

operations:
  vacationPolicy:
    package: hr
    capability: vacation-policy
    resource: companyAgentApi
    contractOperation: getVacationPolicy
  landCaseDataRoom:
    package: land
    capability: case-intake
    resource: companyAgentApi
    contractOperation: getCaseDataRoom

solutions:
  resources:
    key: company-agent-resources
    kind: resource
  agents:
    key: company-agent-agents
    kind: agent
    dependsOn: [resources]
```

The loader must accept the product catalog and existing department catalogs
without requiring those department catalogs to be rewritten in this slice.
Missing operation declarations in an existing department are valid only when
that department is not referenced by a product operation. The sample fixture
used by tests may add minimal operation declarations in a separate fixture
directory rather than changing production catalogs.

### 3. Loader behavior

The loader must:

1. resolve the product catalog from an explicit repository root and path;
2. parse YAML without network access;
3. resolve relative paths against the file that declares them;
4. load referenced department catalogs and contract files;
5. preserve source locations for diagnostics;
6. produce typed intermediate input before semantic validation; and
7. return stable, sorted collections for downstream planning.

The loader must reject unknown schema versions, duplicate keys, malformed
SemVer values, absolute paths outside the repository root, and references that
escape the allowed product/package roots.

### 4. Deterministic validation

Validation is a pure function over loaded files and explicit options. It must
not inspect a tenant or current cloud state.

Required validation rules:

- product, package, agent, capability, operation, resource, contract, and
  solution keys are unique within their namespaces;
- all keys use lowercase kebab-case or lower camel case consistently according
  to their declared namespace;
- all versions use SemVer;
- the root agent exists and the agent graph is acyclic;
- every child agent exists and has at most one parent;
- every package path and referenced source file exists;
- every operation references an existing package, capability, resource, and
  contract operation;
- every resource references an existing connector contract;
- every implementation declares a supported kind and source/reference;
- every contract operation is unique and has a stable request/response shape;
- operation resource dependencies are explicit, never inferred from package or
  department names;
- solution dependency references exist and the solution graph is acyclic;
- resource solutions precede agent solutions when agent components depend on
  connector contracts or connection references;
- no catalog field contains a secret-shaped value or credential material;
- environment bindings are references only and do not contain secret values;
- all diagnostics are sorted by file, path, and error code.

Validation should report all independent errors in one run. It should not stop
after the first malformed entry unless the document cannot be parsed.

### 5. Solution and dependency graph

Construct a directed graph with typed nodes and edges. At minimum, support:

```text
package ─owns→ capability
capability ─exposes→ operation
operation ─requires→ api-resource
api-resource ─selects→ connector-contract
api-resource ─binds→ connector-implementation
agent ─exposes→ package/capability
solution ─contains→ resource or agent component
agent-solution ─dependsOn→ resource-solution
```

The graph builder must produce:

- all nodes with stable logical keys;
- all edges with source locations;
- reverse dependency indexes;
- a deterministic topological solution order;
- a cycle diagnostic with the participating keys; and
- a plan-facing resource ownership/reference count.

The graph must represent shared resources once. Two departments referencing the
same resource create two operation edges, not two connector resources.

The first release graph must produce `resources` before `agents` for the
two-solution model. The graph must also support a single solution declaration
for future local-development scenarios without hard-coding that as the only
valid shape.

### 6. Dry-run deployment plan

The planner consumes only the validated desired-state model and explicit
environment binding metadata. It produces a deterministic JSON or YAML plan
under an ignored local state directory, with a human-readable summary.

Each action includes:

- stable action ID;
- action kind;
- logical resource/solution key;
- dependency action IDs;
- desired contract and implementation versions;
- target environment key;
- mutation classification: `none`, `future-create`, `future-update`, or
  `future-delete`; and
- a reason and source location.

This slice may describe future mutations, but every executable command in this
slice must have mutation classification `none` and must not call a provider.

The plan must include:

- resolved product and package graph;
- solution import order;
- connector implementation bindings;
- connection-reference placeholders by logical key;
- environment-variable placeholders by logical key;
- shared-resource reference counts;
- unresolved or unsupported actions;
- plan schema version; and
- a content hash over canonicalized desired state.

The same inputs, repository contents, and environment-binding metadata must
produce byte-for-byte equivalent canonical plan output regardless of filesystem
enumeration order.

### 7. No-mutation state model

Define a local state document with this shape:

```yaml
schemaVersion: 1
productKey: company-agent
environmentKey: companyagent-dev
desiredStateHash: sha256:...
planHash: sha256:...
phase: planned
actions: {}
observed: {}
```

Allowed first-slice phases are:

```text
loaded → validated → planned
                 ↘ blocked
```

The model may define later phases such as `applied`, `verified`, and
`rolled-back`, but this slice must never transition into them.

State rules:

- state is keyed by product and environment, never by department alone;
- desired state is immutable for a given plan hash;
- action completion records are append-only within the plan model;
- retries reuse the same action IDs and plan hash when inputs are unchanged;
- state contains no access tokens, client secrets, connection values, or
  credential payloads;
- observed provider IDs may be added only by a later provider adapter;
- a changed desired-state hash invalidates the old plan rather than mutating it.

## Alternatives considered

- Put the schema in `azure.yaml`: rejected because `azure.yaml` is the Azure
  Developer CLI infrastructure manifest, not the product graph.
- Infer resources from department catalogs: rejected because shared resources,
  customer substitutions, and cross-department agents become ambiguous.
- Make the catalog the Copilot Studio source format: rejected because it cannot
  represent all provider-specific agent and solution components.
- Query Power Platform during validation: rejected because validation must be
  deterministic, offline-capable, and safe before mutation.
- Store deployment progress only in process logs: rejected because retries need
  a structured plan/state identity and logs are not a desired-state model.

## Affected files or modules

Expected implementation targets for the next slice, subject to review:

- `scripts/company-agent-config.ts` — typed domain model, loader, validation,
  canonicalization, and graph construction;
- `scripts/plan-company-agent.ts` — dry-run plan generation and state writing;
- `scripts/validate-company-agent-config.ts` — CLI validation entry point;
- `fixtures/company-agent-config/` — minimal valid and invalid catalog cases;
- `schemas/company-agent-catalog.schema.json` — machine-readable document
  shape if the implementation uses JSON Schema in addition to TypeScript;
- `package.json` — validation and plan scripts only;
- `.gitignore` — ignored local plan/state output if not already covered by
  `.azure/`.

No existing tenant deployment script should gain mutation behavior from this
slice.

## Milestones

1. Define typed input and normalized desired-state structures.
2. Add the minimal catalog and fixture schema.
3. Implement offline loader with path and source-location diagnostics.
4. Implement deterministic semantic validation.
5. Implement typed dependency graph and topological ordering.
6. Implement canonical desired-state hashing and dry-run plan output.
7. Implement no-mutation state transitions and retry identity checks.
8. Run all acceptance and repository verification commands.

## Acceptance criteria

- A valid fixture containing root, child, HR, Land, one shared API resource,
  two operations, one connector contract, and two solutions loads successfully.
- The same shared resource is represented once and reports two dependent
  operations.
- A department can reference multiple resources in a fixture without
  duplicating resource nodes.
- Invalid references, duplicate keys, cycles, version errors, path escapes,
  contract mismatches, and secret-shaped values produce deterministic,
  source-located diagnostics.
- Solution graph output orders resource solutions before dependent agent
  solutions.
- The planner produces stable output and a stable hash across repeated runs and
  filesystem ordering differences.
- The planner explicitly reports future connector, connection-reference,
  environment-variable, and solution actions without executing them.
- The state model reaches `planned` or `blocked`, never `applied` or
  `verified`.
- No test or command in this slice invokes PAC, `az`, `azd`, network access, or
  a tenant connector.
- A changed catalog or environment-binding input produces a different desired
  state hash and invalidates the prior plan.
- The catalog does not contain tenant-generated IDs or secrets.

## Verification commands

```sh
node --version
npm run validate:records
npm run typecheck
npm test
npm run validate:company-agent-config
npm run plan:company-agent -- --product company-agent --env companyagent-dev
git diff --check
```

The new validation and plan commands must be runnable offline from a clean
checkout. The plan command must not require an active PAC profile, Azure login,
Power Platform connection, or populated secret.

The verification must include deterministic fixture tests for:

- valid shared-resource graph;
- multiple resources consumed by one department;
- duplicate and unresolved keys;
- agent and solution dependency cycles;
- connector contract incompatibility;
- path traversal and secret-shaped input;
- stable canonical hashes;
- plan invalidation after desired-state changes; and
- no provider-command invocation.

## Risks and open questions

- The exact operation-contract schema may need to expand when the first
  provider adapter is designed. This slice should keep it structural and avoid
  pretending to validate full OpenAPI compatibility.
- Existing department catalogs may remain capability-only until a later
  approved migration adds operations and contracts.
- The final settings-file format for Power Platform connection references and
  environment variables is intentionally not implemented here.
- Customer-owned connectors may require an explicit compatibility adapter in a
  later slice.
- The current `scripts/company-agent.ts` lifecycle commands remain outside this
  slice; integrating them should require a separate approved change.

## Progress log

- 2026-09-20: Drafted as the first implementation slice after the configuration
  strategy review. Scope is limited to offline catalog resolution, validation,
  dependency planning, and no-mutation state.
- 2026-09-20: Implemented the offline catalog loader, deterministic validation,
  shared-resource dependency graph, dry-run plan, local state model, product
  catalog, contract fixture, and focused tests. Provider commands remain out of
  scope and were not invoked.
- 2026-09-20: Completed the required verification suite; all eight focused
  tests passed, the product catalog validated, and the generated plan/state
  remained provider-free with phase `planned`.

## Decision log

- 2026-09-20: Product topology is represented by a product catalog distinct
  from `azure.yaml`, department catalogs, Copilot Studio workspaces, and
  Microsoft solution source.
- 2026-09-20: Logical resources are shared graph nodes and are never inferred
  or duplicated from department ownership.
- 2026-09-20: The first implementation slice is provider-free and cannot
  authenticate or mutate external state.
- 2026-09-20: Resource solutions precede dependent agent solutions in the
  dependency graph, while the graph remains capable of representing a single
  solution for later local-development use.
- 2026-09-20: Deployment state is keyed by product and environment and is
  identified by canonical desired-state and plan hashes.

## Completion notes

The first configuration foundation slice is complete. It provides an offline
typed catalog loader, deterministic validation, shared-resource dependency
graph, dry-run plan, and no-mutation state artifact. Connector provisioning,
connection consent, solution import, and provider synchronization remain
future approved slices.
