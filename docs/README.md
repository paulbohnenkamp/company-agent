# Business Agent documentation map

## Start here

Read [product naming and information architecture](product-naming.md) for the
current vocabulary and [project state](PROJECT_STATE.md) for verified status.
The current product path is the C#/.NET API, Next.js review surface, and
Microsoft Teams adapter. Older TypeScript and product-design material is
listed in the [history and reference index](history.md).

If you are learning the current application, start with the [Business Agent learner path](business-agent-learning-path.md). The documents below describe the current .NET application first; the older TypeScript reference runtime is clearly separated below.

| Document | Purpose |
| --- | --- |
| [Project state](PROJECT_STATE.md) | First-read inventory of verified work, unfinished slices, decisions, and continuation instructions |
| [Business Agent learner path](business-agent-learning-path.md) | Build and understand the current C#/.NET application from the first local run |
| [Business Agent architecture](business-agent-architecture.md) | Explain the current .NET, SQL Server, React, and Azure seams |
| [Business Agent code tour](business-agent-code-tour.md) | Map product behavior to the folders and files that implement it |
| [Business Agent data and evidence](business-agent-data-and-evidence.md) | Explain cases, evidence, provenance, conflicts, unknowns, and review |
| [Business Agent development workflow](business-agent-development-workflow.md) | Run, test, migrate, and extend the application safely |
| [Business Agent glossary](business-agent-glossary.md) | Define the terms used by the product and code |
| [Microsoft Foundry standards](microsoft-foundry-standards.md) | Define YAML, Markdown skill, MCP, versioning, VS Code, `azd`, and `az` interoperability rules |
| [Execution records](execution-records.md) | Define approved specs, completed results, and verification records |
| [Identity catalog](../config/identity/personas.json) | Synthetic local employees, departments, roles, and review groups used by the UI and gated Entra provisioning |
| [Deployment overview](deployment.md) | Choose the current local, Azure, and Teams deployment path |
| [Azure recreation](azure-recreation.md) | Recreate the current three-service Azure shape |
| [Teams live activation](teams-live-activation.md) | Operate and verify the controlled Teams demo |
| [Teams tenant settings](teams-tenant-settings.md) | Configure the controlled test tenant safely |
| [Tenant naming adoption](tenant-naming-adoption.md) | Track external Microsoft 365 naming work |
| [WV land architecture](WV_LAND_ARCHITECTURE.md) | Define the West Virginia oil-and-gas flagship architecture and source boundaries |
| [WV land implementation plan](WV_LAND_IMPLEMENTATION_PLAN.md) | Track the phased implementation and verification plan |
| [Multi-jurisdiction architecture](MULTI_JURISDICTION_ARCHITECTURE.md) | Define shared land, jurisdiction, publisher, evidence, evaluation, and review boundaries |
| [Multi-jurisdiction implementation plan](MULTI_JURISDICTION_IMPLEMENTATION_PLAN.md) | Track the incremental behavior-preserving extraction plan |
| [pstack prompts](prompts/README.md) | Reusable build/review prompts |
| [History and reference index](history.md) | Locate preserved historical and TypeScript reference material |

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

The active Teams demo uses a bounded, deterministic review flow over the
fictional Sample Energy Company case. Foundry is an explicit provider boundary;
live model execution, broad workflow coverage, and additional jurisdictions
remain deployment- or product-dependent. The older `land-administration`
catalog and CLI remain available as reference material, not the primary
product entry point.
# Start here

For a new Codex or VS Code session, read [PROJECT_STATE.md](PROJECT_STATE.md)
first. It identifies what is verified, what is unfinished, and the next
approved slice. Then follow [execution-records.md](execution-records.md) and
the active spec in `specs/`.
