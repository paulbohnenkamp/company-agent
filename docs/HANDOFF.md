# Session handoff

## Goal

- Continue the top-down cleanup of Company Agent so the repository is simple,
  understandable, and grounded in the real-world oil-and-gas workflow.

## Simple product model

- People have real oil-and-gas positions.
- Teams is where they work.
- Land Agent is one assistant.
- Sub-agents are internal capabilities, not fake employees.
- Skills are procedures, not products.
- Cases, documents, leases, parcels, title records, ownership interests, and
  obligations are business data.
- The C# API enforces scope, evidence, authorization, persistence, and human
  approval.

## Changes made

- Root README now explains the simple model: employees use Teams, mention a
  Company Agent, and get evidence-backed answers from the Land Agent.
- Repository renamed to `company-agent` on GitHub and locally.
- The legacy TypeScript application runtime and TypeScript tests were removed
  from the active repository.
- The exact pre-prune checkout is preserved at
  `/Users/paul/code/company-agent-legacy-typescript`.
- C# is now the sole active application/API boundary.
- Small TypeScript repository tools remain for validating agents, personas,
  naming, records, and Entra provisioning.
- The current WV well-reconciliation demo remains, but it is not the desired
  flagship land-administration demo. It uses WVDEP/WVGES public well evidence,
  not BLM data, and does not demonstrate title, lease, ownership, or
  division-order work well enough.

## Verification

- `npm run typecheck` passed.
- `npm run validate:records` passed.
- `npm run validate:agent-artifacts` passed for 13 agents.
- `npm run validate:identity-personas` passed for 14 personas.
- `npm run validate:naming` passed.
- `dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false` passed with 39 tests.
- `az bicep build --file infra/main.bicep --stdout` passed.
- `git diff --check` passed.
- Working tree is clean at commit `93d12ce` before this handoff note.

## Open items

- Replace the current WV well demo with a coherent land-administration case
  built around leases, tracts/parcels, ownership documents, assignments, title
  gaps, and possibly a division-order proposal.
- Separate real Microsoft 365 tenant users from application capabilities.
  Employees have real oil-and-gas positions; sub-agents are not fake employees.
- Remove invented workflow personas such as `case-manager`. Use assignee,
  department, reviewer, and review state for workflow ownership.
- Reconcile the fictional identity catalog with the three real tenant users:
  Taylor (Legal), Jordan (Land), and Paul (administrator). Tenant UPNs and
  passwords stay outside the repository.
- Decide whether remaining TypeScript validation tools should eventually move
  to C#. Do not restore the old runtime just to reduce short-term friction.
- GitHub language statistics may remain cached after the large deletion; the
  current tracked code is 5 TypeScript files and 47 C# files.

## Reset sequence

1. Write a one-page product truth defining the real-world nouns and verbs:
   employee, position, department, Teams user, Land Agent, specialist, skill,
   land matter, document, finding, and review decision. Use it as the language
   test for README, demos, APIs, and screens.
2. Separate tenant users, employee positions, access roles, and agent
   capabilities. Remove invented employee roles such as `case-manager`.
3. Choose one flagship land workflow. Retire the WV well-reconciliation case as
   the primary demo and build a coherent lease, tract/parcel, ownership,
   assignment, title-gap, and division-order matter.
4. Inventory the remaining architecture as essential, reusable, compatibility,
   demo-specific, or remove. Prune duplicate orchestration and stale
   presentation/deployment concepts.
5. Rebuild current documentation and demo instructions around the simple model.
6. Implement the smallest local vertical slice: one employee question, Land
   Agent routing, two or three specialist capabilities, evidence-backed output,
   unresolved issues, and human review.
7. Verify locally before changing tenant users, Teams, Azure, or Foundry.

## Next step

- Read `README.md`, `docs/repository-guide.md`, `specs/057-prune-legacy-typescript-runtime.md`,
  and `dotnet/README.md`.
- Define the first realistic land-administration demo and its employee roles
  before changing more architecture or Azure configuration.
- The next product decision is whether that demo centers on title/ownership-gap
  review or division-order preparation and payment-impacting discrepancies.
- Use a new approved spec before implementing that demo.
