# Business Agent documentation map

## Start here

If you are learning the current application, start with the [LandOps Workbench learner path](landops-learning-path.md). The documents below describe the earlier TypeScript reference runtime and the wider domain research.

| Document | Purpose |
| --- | --- |
| [Project state](PROJECT_STATE.md) | First-read inventory of verified work, unfinished slices, decisions, and continuation instructions |
| [Quickstart](quickstart.md) | Install and run the offline example |
| [LandOps Workbench learner path](landops-learning-path.md) | Build and understand the current C#/.NET application from the first local run |
| [LandOps architecture](landops-architecture.md) | Explain the current .NET, SQL Server, React, and Azure seams |
| [LandOps code tour](landops-code-tour.md) | Map product behavior to the folders and files that implement it |
| [LandOps data and evidence](landops-data-and-evidence.md) | Explain cases, evidence, provenance, conflicts, unknowns, and review |
| [LandOps development workflow](landops-development-workflow.md) | Run, test, migrate, and extend the application safely |
| [LandOps glossary](landops-glossary.md) | Define the terms used by the product and code |
| [LandOps documentation gap report](landops-documentation-gap-report.md) | Record completed documentation work and genuine remaining product/deployment gaps |
| [Microsoft Foundry standards](microsoft-foundry-standards.md) | Define YAML, Markdown skill, MCP, versioning, VS Code, `azd`, and `az` interoperability rules |
| [Identity catalog](../config/identity/personas.json) | Synthetic local employees, departments, roles, and review groups used by the UI and gated Entra provisioning |
| [Architecture](architecture.md) | Explain domains, agents, skills, flows, and runtime |
| [Data model](data-model.md) | Explain cases, documents, leases, interests, and provenance |
| [Flow runtime](flow-runtime.md) | Explain handoffs, failures, audit records, and approval |
| [Evaluations](evaluations.md) | Explain test cases, graders, golden expectations, and adversarial tests |
| [Safety](safety.md) | Explain boundaries, permissions, prompt injection, and human control |
| [Deployment](deployment.md) | Map local seams to a Microsoft production shape |
| [Microsoft stack](MICROSOFT-STACK.md) | Map local seams to Azure/Microsoft services |
| [Domain catalog](land-administration-catalog.md) | Inventory the current generic `land-administration` pack |
| [Domain authoring](domain-authoring.md) | Add or extend a domain |
| [Implementation status](IMPLEMENTATION.md) | State what is local, tested, or cloud-dependent |
| [Research](LAND-ADMIN-RESEARCH.md) | Explain the research behind the domain recipes |
| [WV land architecture](WV_LAND_ARCHITECTURE.md) | Define the West Virginia oil-and-gas flagship architecture and source boundaries |
| [WV land implementation plan](WV_LAND_IMPLEMENTATION_PLAN.md) | Track the phased implementation and verification plan |
| [Multi-jurisdiction architecture](MULTI_JURISDICTION_ARCHITECTURE.md) | Define shared land, jurisdiction, publisher, evidence, evaluation, and review boundaries |
| [Multi-jurisdiction implementation plan](MULTI_JURISDICTION_IMPLEMENTATION_PLAN.md) | Track the incremental behavior-preserving extraction plan |
| [pstack prompts](prompts/README.md) | Reusable build/review prompts |

## Repository layers

1. `domains/` contains business behavior and configuration.
2. `examples/` contains fictional seed records.
3. `evaluations/` contains behavioral test cases.
4. `src/` contains provider-neutral runtime mechanics and adapters.
5. `tests/` proves contracts locally.
6. `specs/`, `results/`, and `.audit/` preserve engineering decisions.

## Important distinction

Seed records are fictional business inputs. `MockExecutor` is the deterministic
fake model/agent. Foundry tests use a fake HTTP provider. None of those are
production data or a live language model.

The active `land-administration` catalog exposes the
`wv-land-well-reconciliation` workflow and its three canonical agents. The
source adapters, deterministic tools, durable findings, behavioral evaluations,
and review lifecycle are implemented offline. Live provider integration and
additional jurisdictions remain deferred.
# Start here

For a new Codex or VS Code session, read [PROJECT_STATE.md](PROJECT_STATE.md)
first. It identifies what is verified, what is unfinished, and the next
approved slice. Then follow [execution-records.md](execution-records.md) and
the active spec in `specs/`.
