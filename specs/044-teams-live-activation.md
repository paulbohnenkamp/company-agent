---
id: 044-teams-live-activation
title: Minimal tenant-backed Teams demo plan and actor contract
status: completed
created: 2026-09-07
updated: 2026-09-07
result: results/044-teams-live-activation.md
---

## Goal

Prepare the smallest tenant-backed Teams demo contract so a real Microsoft
Teams test channel can later connect to the existing LandOps adapter and
deterministic Workroom flow. This slice makes the demo boundary explicit and
keeps production activation separate.

## Non-goals

- Creating a Microsoft 365 tenant or purchasing licenses from the repository.
- Using synthetic personas as substitutes for real Teams identities.
- Claiming that local-mode role headers are production authorization.
- Redesigning the Next.js or Teams information architecture.
- Claiming live Teams delivery before endpoint, identity, channel, and reply
  smoke tests pass in the developer tenant.

## Current-state findings

- The local Teams adapter and API boundary are verified in spec 043.
- Azure has the deployed web/API environment, but no Azure Bot resource.
- The existing API app registration has no identifier URI or app roles.
- The deployed API is Entra-protected, while the local deterministic API path
  is suitable for a clearly labeled demo. The adapter currently sends only
  transport headers and therefore cannot be treated as production-ready for
  API calls.
- A Microsoft 365 developer sandbox is the lowest-cost test environment. It
  supplies real tenant identities, Teams sample users, teams, channels, and
  app sideloading, but it must be created outside this repository.

## Chosen approach

1. Keep the ASP.NET Core API as the authorization and Workroom boundary.
2. Use one real Teams bot identity and one real channel for inbound delivery.
3. Run the adapter against the deterministic local API mode with a fixed demo
   case, scenario, role, and group. Label the result as a demo environment.
4. Show the agent delegation chain and human boundary in the LandOps reply;
   do not create separate fake Teams accounts for agents.
5. Preserve the typed Teams actor metadata so the later production identity
   bridge has a stable input contract.

## Alternatives considered

- Using the local API mode for a labeled demo is accepted as a temporary
  demonstration boundary; using it as production authorization is rejected.
- Continuing to send `x-landops-user` and role headers to the Entra API was
  rejected because those values are not an authenticated user identity.
- Giving the Teams adapter its own land authorization was rejected because it
  would duplicate the C# application boundary.
- Treating the existing Azure tenant as sufficient was rejected because an
  Azure subscription does not itself provide licensed Teams users or a Teams
  app test environment.

## Affected files or modules

- `src/teams/landops-adapter.ts`
- `src/teams/server.ts`
- `src/teams/landops-adapter.ts`
- `src/teams/server.ts`
- `tests/teams-adapter.test.ts`
- `README.md` and `docs/teams-live-activation.md`
- `docs/teams-live-activation.md`
- `docs/PROJECT_STATE.md`

## Milestones

1. Define the small test tenant, users, Team, and channel prerequisites.
2. Define one bot app and a public HTTPS adapter endpoint.
3. Define the fixed deterministic LandOps demo and its evidence boundary.
4. Record the production identity bridge as deferred work.

## Acceptance criteria

- The repository models the Teams actor separately from transport metadata and
  local synthetic personas.
- The API remains the only authority for role/group authorization and human
  action persistence in the application; the demo’s local-mode limitation is
  documented.
- Local deterministic tests prove the actor contract without live Graph or
  Teams calls.
- The demo checklist names the required tenant, bot, endpoint, users, and
  channel evidence.
- The production identity bridge remains marked incomplete until workload
  authentication and directory-backed authorization are implemented.

## Verification commands

```sh
node --import tsx --test tests/teams-adapter.test.ts
npm run typecheck
npm test
npm run build
dotnet test dotnet/LandOps.sln --no-restore --disable-build-servers -m:1 --verbosity quiet /p:UseSharedCompilation=false
npm run validate:records
git diff --check
```

Tenant-dependent demo verification is deferred until the test tenant exists:

```text
adapter endpoint health → Bot Service endpoint → Teams channel delivery
→ deterministic Workroom reply → human action persistence → demo evidence
```

## Risks and open questions

- The test tenant may require manual billing verification or administrator
  consent.
- The demo must not be presented as proof of production Entra authorization.
- The production identity bridge still requires a pinned API audience/app role,
  workload authentication, and least-privileged directory access.

## Progress log

- 2026-09-07: Selected after local Teams readiness completed and live
  activation was confirmed to require a Microsoft 365 test tenant.
- 2026-09-07: Scope reduced to one tenant-backed demo so the interview/demo
  path can be learned and verified before production identity work.
- 2026-09-07: Preparation slice completed locally; tenant-dependent demo
  delivery remains the next external step.

## Decision log

- 2026-09-07: Use a small paid Microsoft 365 test tenant after Developer
  Program eligibility was denied.
- 2026-09-07: Treat the demo’s local-mode boundary as explicit and temporary;
  do not use it to weaken production authorization.
- 2026-09-07: Separate tenant-backed demo preparation from the later live
  production identity bridge.
