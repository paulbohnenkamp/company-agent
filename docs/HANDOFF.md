# Session handoff

## Goal

- Continue the top-down cleanup of Company Agent so the repository is simple,
  understandable, and grounded in the real-world oil-and-gas workflow.

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

## Next step

- Read `README.md`, `docs/repository-guide.md`, `specs/057-prune-legacy-typescript-runtime.md`,
  and `dotnet/README.md`.
- Define the first realistic land-administration demo and its employee roles
  before changing more architecture or Azure configuration.
- Use a new approved spec before implementing that demo.
