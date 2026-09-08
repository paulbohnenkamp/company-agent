---
id: 048-business-agent-naming
title: Business Agent naming and information architecture
status: completed
created: 2026-09-08
updated: 2026-09-08
result: results/048-business-agent-naming.md
---

## Goal

Apply the naming and information architecture approved in the September 8
discussion. Business Agent supports people across departments through Microsoft
Teams. Sample Energy Company supplies the fictional context. Land is a
department. Workroom is retained only as a documented compatibility identifier.

## Non-goals

- Create another tenant/domain, purchase licenses, or invent a company slug.
- Rename Azure resources, database tables, stored IDs, Entra roles, namespaces,
  or published HTTP routes for cosmetic reasons.
- Generalize existing case-based business logic or redesign the page layout.
- Turn every displayed agent into a separately registered Teams bot.

## Current-state findings

- Clean starting commit: `d41062a`.
- README and UI present the application as LandOps; seed company branding
  conflicts with the agreed generic fictional company.
- Workroom names active HTTP, JSON, configuration, and persistence contracts.
  Its occurrence in code does not prove it is unused.
- People already have a synthetic catalog, but Teams examples use separate
  names, and agent labels are often reconstructed from internal IDs.
- Azure CLI has the subscription-tenant session. The existing credential fails
  in the Microsoft 365 tenant with AADSTS50020. Live tenant changes and mention
  testing remain externally blocked. No interactive authentication is requested.

## Chosen approach

1. Record the agreed model in `docs/product-naming.md` before editing code.
2. Update company display data, people, agent labels, web copy, Teams package,
   examples, and current documentation. Use department-qualified display names
   and dotted personal email aliases in synthetic data.
3. Keep agent display names owned by the C# company catalog and expose them
   additively on collaboration steps. UI consumes catalog/response names;
   the Teams adapter formats them without owning agent routing or business rules.
4. Remove Workroom as a user-facing destination. Describe existing operations
   as agent requests, runs, and reviews. Preserve old wire/storage identifiers
   explicitly so existing clients and records survive the presentation change.
5. Align the Teams illustration to a Sample Energy Company team and short
   department channels. Label it as an example, including simulated agent
   contributions, rather than evidence of installation or separate bot accounts.
6. Document exact tenant rename targets and verification, distinguishing the
   desired state from the last verified live state. Preserve existing users,
   licenses, memberships, admin access, and domain.

## Alternatives considered

- Global replacement of identifiers would change routes, stored JSON, database
  mappings, permission values, and resource names without product benefit.
- Another branded room or department product repeats the rejected model.
- A new user/domain for each display-name correction causes unnecessary tenant
  churn and does not solve platform terminology.

## Affected files or modules

C# portfolio and collaboration presentation contracts; synthetic identity
catalog; Next.js presentation; Teams adapter and manifest; current guides,
README, project state, and this execution record. Historical specs, migrations,
and snapshots retain their original evidence and get a current terminology link
where useful. No business behavior moves out of ASP.NET Core.

## Milestones

1. Document approved information architecture and compatibility boundaries.
2. Implement presentation/identity naming and integration coverage.
3. Run required verification, inspect rendered pages, and review the diff.
4. Update result and project state; commit verified repository work. Record
   external tenant/deployment work separately if access prevents completion.

## Acceptance criteria

- Current product pages and Teams replies use Business Agent and Sample Energy
  Company; they do not present Land or Workroom as the platform.
- Agent display names end in Agent and remain distinct from human job titles.
- Taylor Kim (Legal), Jordan Lee (Land), and Casey Morgan (Compliance) are
  represented consistently in the fictional catalog and relevant examples.
- Existing agent IDs, routes, authentication, case evidence, and SQL mappings
  remain compatible. HTTP playbooks and negative authorization tests pass.
- Reproduction/tenant instructions distinguish planned changes from verified
  tenant state. No live activation is claimed from deterministic tests.

## Verification commands

```sh
node --version
npm run typecheck
npm test
npm run build
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:agent-artifacts
npm run validate:identity-personas
npm run validate:naming
npm run validate:records
npm run eval -- wv-land-well-reconciliation
npm run provision:entra-personas
az bicep build --file infra/main.bicep --stdout
git diff --check
```

Also run the built web app with the local API, inspect company/persona HTTP
responses and rendered home/Teams pages, and run the role playbook HTTP tests.
The persona command is dry-run only. Review its output for secret disclosure.

## Risks and open questions

Live Teams naming, package upload, consent, and smoke tests require a Microsoft
365 tenant session. Deployment and old screenshots can retain earlier names
until verified replacement. Retain a clear status rather than silently rewriting
historical evidence. No replacement tenant slug has been selected.

## Progress log

- 2026-09-08: User approved the naming baseline, corrected the meaning of Land
  and Teams, then authorized complete execution without prompts. Read current
  state and related specs/results; inspected API, SQL, UI, and identity seams.

## Decision log

- 2026-09-08: Use the repository spec workflow as the durable plan. The current
  environment has no callable `/plan` command; prior discussion supplies approval.
- 2026-09-08: Workroom is an active legacy contract name, not a separate product
  or an unused implementation. Preserve compatibility while removing its UI role.
- 2026-09-08: Completed the repository naming pass. Business Agent is the
  application, Sample Energy Company is fictional context, Teams is the
  collaboration environment, Land is a department, and Workroom remains a
  compatibility identifier only.
- 2026-09-08: Live Microsoft 365 adoption remains pending because the current
  Azure CLI credential cannot access the configured tenant and no browser session
  is available. The repository records the exact target names and checks.
