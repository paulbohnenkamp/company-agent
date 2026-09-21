# Company Agent product configuration strategy

Status: proposed

## Goal

Define the simplest durable authoring and deployment model for building a
company AI workflow from this repository. Company Agent is the first example,
not the framework's hard-coded product identity. A product author should be
able to describe agents, capabilities, API resources, and their bindings in
reviewable YAML, then use one CLI workflow to validate, provision, synchronize,
publish, and verify the result.

## Why this plan exists

The current Copilot Studio source mixes several different concerns:

- `copilot-studio/company-agent/agents/` contains provider-specific agent and
  action files;
- `copilot-studio/company-agent/connectors/` contains exported connector
  artifacts with tenant-generated identities;
- `copilot-studio/company-agent/connectionreferences.mcs.yml` contains
  environment/solution bindings;
- `departments/*/catalog.yaml` contains reusable business capabilities; and
- `azure.yaml` describes Azure infrastructure rather than the agent product.

The bootstrap script currently infers deployment identity from `--dep hr`,
hard-codes one HR-shaped connector, and rewrites provider identifiers while
building a workspace. That can work for a trial but is not an understandable
authoring model for a customer building a larger workflow with multiple APIs.

## Design principles

- A department is a capability package, not an API connection.
- An operation/tool declares the API resource it requires.
- A product can use many API resources, and multiple departments can share one.
- Logical resource keys are stable repository identities; display names and
  Power Platform IDs are separate bindings.
- Provider workspaces are deployment projections, not the primary product
  authoring surface.
- Environment overlays provide endpoints, tenant IDs, solution names, and
  other deployment bindings; they do not redefine product topology.
- Validation must complete before tenant mutation.
- Resource lifecycle is independent of department lifecycle.
- Generated artifacts must identify their source manifest and resource key.
- The normal path remains one guarded CLI command with resumable, idempotent
  phases.
- Microsoft solution artifacts remain the canonical Power Platform source;
  product configuration orchestrates them but does not replace them.

## Proposed repository model

Use a small product manifest within the Copilot Studio product source rather
than a second root deployment manifest. This manifest is an orchestration and
dependency declaration. It is not a second agent format and does not replace
the Microsoft solution source files:

```text
copilot-studio/
  company-agent/
    catalog.yaml                 # product/agent/resource topology
    agents/                      # cloned, source-controlled agent components
    connectors/                  # versioned custom-connector source
    solution/                    # unpacked Microsoft solution source
    connectionreferences.mcs.yml # provider artifact mapped by the catalog

departments/
  hr/catalog.yaml                # reusable HR capabilities and operations
  land/catalog.yaml              # reusable Land capabilities and operations

azure.yaml                       # Azure infrastructure only
.azure/<environment>/.env        # environment bindings only
```

The product catalog should express the logical graph, for example:

```yaml
schemaVersion: 1
product:
  key: company-agent
  displayName: Company Agent

resources:
  companyAgentApi:
    kind: rest-api
    displayName: Company Agent API
    connectorContract: connectors/company-agent-api-v1

agents:
  root:
    displayName: Company Agent
    children:
      - hr
      - land
  hr:
    package: ../../departments/hr
  land:
    package: ../../departments/land

operations:
  vacationPolicy:
    package: ../../departments/hr
    resource: companyAgentApi
  landCaseDataRoom:
    package: ../../departments/land
    resource: companyAgentApi
```

The exact filename and schema remain subject to the approved spec. The
important boundary is that product topology, department packages, resource
contracts, and environment bindings are distinct and explicit.

The catalog must not duplicate instructions, topics, action definitions, or
connector OpenAPI. Those remain in the Microsoft-compatible agent and
solution/connector source. A catalog entry points to those artifacts and
declares how they depend on logical resources.

## Microsoft ALM alignment

The deployment design must follow Power Platform solution ALM rather than
relying on direct mutation of a live Copilot Studio agent:

1. Develop in an isolated Power Platform development environment using an
   unmanaged solution.
2. Clone/synchronize agent components locally and review them in Git.
3. Keep custom connectors solution-aware and versioned in source control.
4. Build an unmanaged solution artifact, run validation/checker steps, and
   export a managed solution for test, UAT, and production environments.
5. Import the connector/resource solution before the agent solution when the
   agent depends on custom connectors.
6. Provide connection-reference and environment-variable deployment settings
   for the target environment.
7. Publish and smoke-test only after import and binding succeed.

This preserves the distinction Microsoft makes between unmanaged development
source and managed downstream deployment artifacts. The direct `pac copilot
push/publish/pull` path remains useful for the isolated development loop, but
the product's durable release path should be solution-based.

### Critical review corrections (2026-09-17)

The following constraints correct earlier over-generalizations:

- A checked-in Copilot Studio workspace and an unpacked Dataverse solution are
  related but distinct source artifacts. `pac copilot clone/pull/push` supports
  the agent authoring loop; `pac copilot pack` produces a solution package for
  import. A release cannot claim solution ALM unless the required solution
  components, dependencies, publisher, and settings are present and verified.
- Custom connectors must be solution-aware and, because Microsoft documents
  registration-order limitations, must be imported before connection
  references and dependent agent/flow components. The default release shape is
  therefore a connector/resource solution followed by an agent solution, even
  if a small product later proves that a single package is safe for a specific
  provider scenario.
- "One connector per resource" and "one connection reference per resource"
  are not platform invariants. A logical API resource has one selected
  implementation binding per environment, but a solution may contain multiple
  connection references for distinct security/ownership contexts, and a
  connector may be customer-owned, pre-existing, or delivered by a resource
  solution. The catalog must model the binding, not manufacture a provider
  object from a department name.
- Import settings are deployment inputs, not product topology. Connection
  references map to target-environment connections; environment-variable
  values map to target-environment configuration. Custom connector fields that
  use environment variables are evaluated when the connector is saved or
  updated, so the release plan must include a refresh/update check when those
  values change.
- The product catalog is an orchestration manifest, not a replacement for
  Microsoft solution source or a second Copilot Studio agent format. It owns
  logical graph, contract selection, implementation binding, solution
  membership, and environment references. It must not own prompt/topic/action
  bodies, OpenAPI definitions, connection secrets, or tenant-generated IDs.
- A customer API substitution is valid only when its connector implementation
  satisfies the selected versioned operation contract. If provider operation
  names or schemas differ, the CLI must generate a provider projection or use
  an adapter connector; it must not silently point unchanged actions at an
  incompatible connector.
- Managed solutions are release artifacts in downstream environments; rollback
  means selecting/importing a previously built version or applying a managed
  upgrade path. Unmanaged edits in a target environment create an unmanaged
  layer and are deployment drift, not a supported customization mechanism.

The likely solution boundaries are:

```text
<product>-resources       custom connectors and their environment variables
<product>-agents          root/child agents, topics, tools, and references
```

Keep the number of solutions small. Split them only where resource lifecycle
or ownership requires independent deployment. A customer with several APIs
should not receive a separate solution merely because it has several
departments; it should receive resource packages that the agent solution
depends on.

## Resource and connection rules

For every logical resource:

- one connector contract is versioned in source control;
- one implementation binding is resolved per target environment;
- zero or more provider connectors are used according to whether the
  implementation is pre-existing, managed, or customer-supplied;
- one connection reference is required for each distinct solution/security
  binding, not necessarily each logical resource; and
- one or more user/service-principal connections may exist according to the
  selected authentication mode.

API host, base URL, OAuth endpoints, client IDs, and other environment-specific
connector settings should use Power Platform environment variables in the
solution where supported. Microsoft documents that custom connector fields can
reference environment variables, and that values are resolved when the
connector is saved or updated. The deployment tool must therefore treat
connector resave/update as an explicit phase when a target environment changes
the connector host; changing a local `.env` file alone is not enough.

Secrets must not be stored in the product catalog or checked-in deployment
settings. Use secret-type environment variables backed by the approved secret
store, or an equivalent customer-managed authentication mechanism.

The CLI must never derive a resource identity from a department name. It must
also avoid using a display name as the primary lookup key. Bindings should
persist the logical resource key, connector contract version, provider ID,
connection-reference logical name, and connection ID after successful
provisioning.

## CLI experience

The intended workflow is:

```text
company-agent validate --product company-agent --env companyagent-dev
company-agent deploy --product company-agent --env companyagent-dev --apply
company-agent retry --product company-agent --env companyagent-dev --apply
company-agent status --product company-agent --env companyagent-dev
```

`--dep` may remain as a scoped convenience selector, but it must resolve to
operations and resources from the catalog. It must not define connector
topology. A full product deployment and a department-scoped deployment should
share the same resolver and lifecycle engine.

The CLI should expose two connection modes:

- `bootstrap`/local development: browser-based user consent is allowed and
  the CLI records the resulting connection binding without recording tokens;
- `release`/CI: no interactive consent is attempted. The pipeline consumes
  target deployment settings and pre-provisioned service connections or
  approved connection-reference mappings.

The user-consent flow is therefore a supported bootstrap operation, not a
hidden prerequisite in the release pipeline.

The CLI phases should be:

1. Load and schema-validate the product catalog and department packages.
2. Resolve operation-to-resource bindings and detect missing/duplicate keys.
3. Load environment bindings without leaking secrets into source artifacts.
4. Plan connector, connection-reference, agent, and tool mutations.
5. Require `--apply` and the existing explicit push approval for mutation.
6. Provision or reuse resources by logical key and immutable contract version.
7. Generate a clean provider workspace from the resolved graph.
8. Push, publish, pull, and record bindings idempotently.
9. Run observable smoke tests and report resource/operation routing.

For solution releases, steps 6–8 become resource-solution build/export,
resource-solution import, settings application, agent-solution import, publish,
and verification. The CLI may retain direct synchronization as a local
development shortcut but must label which lifecycle path it is using.

## Migration boundaries

This plan does not immediately rewrite the existing tenant or delete the
currently created HR-labeled/shared connector artifacts. The first migration
slice should:

- stop the current bootstrap from creating another connector;
- add catalog loading and a dry-run plan;
- represent the existing Company Agent API connector as one logical resource;
- generate the HR action from that resource binding;
- preserve the existing provider workspace until the new projection is proven;
- explicitly report stale/orphaned tenant artifacts for separate cleanup.

Only after dry-run and local validation pass should the deploy phase be
repointed to the new catalog-driven resolver.

## Alternatives considered

- Put the topology in `azure.yaml`: rejected because `azure.yaml` is the
  canonical `azd` infrastructure manifest, not an agent/product graph.
- Put all topology in department catalogs: rejected because shared resources
  and cross-department agents would be duplicated or inferred indirectly.
- Make the product catalog replace Copilot Studio solution source: rejected
  because Microsoft treats unmanaged solution components as the Power Platform
  source and the catalog cannot faithfully represent every provider component.
- Keep a single hard-coded Company Agent API: rejected because customer
  products may have multiple APIs or replace the example API entirely.
- Generate a connector per department: rejected because it couples capability
  ownership to resource ownership and creates duplicate connections.

## Acceptance criteria

- A reviewer can understand the product topology from one catalog without
  reading the generated Copilot Studio workspace.
- A product can declare at least two API resources and bind one operation in
  multiple departments to the same resource.
- A department can consume multiple resources without duplicating connector
  definitions.
- Resource display names can change without changing logical resource identity.
- Breaking connector changes can be represented as a new contract version.
- `validate` performs no tenant mutation and catches unresolved resources,
  operations, packages, and environment bindings.
- `deploy` and `retry` converge after an interrupted connection-consent,
  push, publish, or pull phase.
- Generated connection references and provider actions are traceable to their
  logical resource and contract version.
- The existing HR trial can be represented without an HR-specific connector.

## Verification

The implementation plan that follows this strategy must include:

```sh
npm run validate:records
npm run typecheck
npm test
npm run company-agent -- validate --product company-agent --env companyagent-dev
npm run company-agent -- deploy --product company-agent --env companyagent-dev
```

The deploy command must be run first without `--apply` and its plan reviewed
before any tenant mutation. Live deployment verification must inspect the
resolved connector provider, connection reference, published agent graph, and
pulled workspace—not only process exit codes.

## Open decisions for approval

- Final catalog filename and schema version.
- Whether provider workspace files remain checked in as source fragments or
  become generated artifacts under `.azure/<environment>/`.
- Whether a product can select multiple contract versions simultaneously.
- Authentication modes supported in the first implementation.
- The exact customer/environment overlay mechanism.
- Cleanup policy for the already-created HR-labeled and shared connectors.
- Whether the first release path uses one product solution or the two-solution
  resource/agent split described above.
- Whether the product contract is a repository-owned normalized operation
  contract with generated provider actions, or whether the first release
  permits only connector implementations whose operation IDs and schemas are
  already identical.

## Status

This is a strategy plan only. No implementation should continue against the
current HR-specific bootstrap until the open decisions are approved and an
implementation spec is created.

## Research basis

- Microsoft Copilot Studio, [Export and import agents using solutions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-solutions-import-export): agents move between environments through solutions; required objects, custom connectors, connection references, and environment variables must be included, and custom connectors must be imported before dependent connection references and agents.
- Microsoft Power Platform, [Solution concepts](https://learn.microsoft.com/en-us/power-platform/alm/solution-concepts-alm): unmanaged solutions are the development source; managed solutions are the downstream deployment artifact.
- Microsoft Power Platform, [Organize your solutions](https://learn.microsoft.com/en-us/power-platform/alm/organize-solutions): keep solution strategy simple for small/medium products and split into isolated modular solutions only when scale, ownership, or lifecycle requires it.
- Microsoft Power Platform, [Environment variables](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/environmentvariables): environment-specific values belong in solution environment variables and can be transported separately from consuming components.
- Microsoft Custom Connectors, [Environment variables in solution custom connectors](https://learn.microsoft.com/en-us/connectors/custom-connectors/environment-variables): connector host, base URL, OAuth settings, and related values can reference environment variables, but connector values are applied when the connector is saved or updated.
- Microsoft Power Platform CLI, [Solution command group](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/solution): solution settings files support connection-reference and environment-variable mappings during import.
- Microsoft Copilot Studio, [Visual Studio Code extension overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-overview): Microsoft recommends cloning agent definitions locally, managing them with Git, and using pull-request workflows for collaboration and auditability.
- Microsoft Power Platform CLI, [Copilot command group](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot): `clone`, `pull`, `push`, and `pack` support the local agent workspace loop, with `pack` producing a solution package for import.
- Microsoft Power Platform, [Create custom connectors in solutions](https://learn.microsoft.com/en-us/connectors/custom-connectors/customconnectorssolutions): custom connectors must be solution-aware, credentials must be re-entered and connections created in the target, and connector import precedes connection references/flows.
- Microsoft Power Platform, [Use a connection reference in a solution](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-connection-reference): a connection reference is a solution component that points to a connection; it is not the credential itself.
- Microsoft Power Platform, [Overview of pipelines](https://learn.microsoft.com/en-us/power-platform/alm/pipelines): platform pipelines provide governed deployments, approvals, history, and redeployment of previous solution versions; they complement rather than replace the product CLI's validation/planning layer.
- Microsoft Power Platform, [Solution layers](https://learn.microsoft.com/en-us/power-platform/alm/solution-layers-alm): managed and unmanaged layers are component-level and import order affects the effective layer.
