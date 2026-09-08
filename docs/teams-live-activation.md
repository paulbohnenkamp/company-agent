# Business Agent Teams live activation

This runbook connects the existing `src/teams/server.ts` transport to a small
real Microsoft 365 tenant for a controlled Business Agent demo. It does not replace
the ASP.NET Core agent request API or authorize actions in the Teams adapter.

For a browser-assisted tenant setup, use the [ChatGPT Work handoff](chatgpt-work-teams-handoff.md).

## Current status

Local adapter readiness is verified in [result 043](../results/043-teams-activation-readiness.md).
The active target is a minimal tenant-backed demo. Adapter-to-API workload token support exists in result 047. Cross-tenant
consent and directory-backed user authorization remain incomplete.

For tenant privacy and member-management guidance, see
[`teams-tenant-settings.md`](teams-tenant-settings.md). A private Team is the
recommended setting for controlled testing. “Public” in Teams means discoverable
and joinable by users in that Microsoft 365 tenant; it does not mean public on
the internet.

## Existing tenant

A Microsoft 365 Business Basic trial tenant with Teams already exists. Do not
create another tenant or purchase additional licenses to apply these names.
Two licensed test users and the original Team/channel are recorded in
[tenant naming adoption](tenant-naming-adoption.md), together with the approved
target names. A repository persona is not a licensed tenant account.

The deployed adapter foundation is recorded in
[result 047](../results/047-teams-bot-activation.md). Current CLI credentials
cannot access the Microsoft 365 tenant, so user/Team renaming, correct bot
registration, package installation, and live mention verification remain pending.

## Azure and application setup

The Azure subscription already contains the Business Agent web and API services. The
remaining live resources/configuration are:

1. Configure the API app registration with a stable identifier URI and a
   narrowly scoped application role for the Teams adapter workload.
2. Create a separate Teams bot app registration and credential, or use the
   supported managed-identity/federated setup once the Bot Framework account
   configuration is confirmed.
3. Deploy the adapter as a separately managed HTTPS service with
   `/api/messages` reachable publicly.
4. Store any bot secret in Key Vault and expose it through an App Service Key
   Vault reference. Never commit or print the secret.
5. Enable the Microsoft Teams channel on the Azure Bot resource and point the
   messaging endpoint at the adapter.
6. Grant only the required API/Graph permissions and obtain administrator
   consent.

For this first demo, the adapter can target the deterministic local API mode
with a fixed case, scenario, role, and group. The demo must visibly identify
that limitation. The adapter must send an authenticated workload token before
the Entra-protected API is used for production. Unsigned role or group headers
are not an acceptable production substitute.

## Verification sequence

Run these checks in order and retain the outputs in the activation result:

```text
Azure resource and app-role inspection
→ adapter HTTPS health
→ Bot Service endpoint validation
→ real Teams mention in a test channel
→ actor tenant/user/object-ID mapping
→ API role/group authorization
→ Business Agent evidence-backed reply
→ append-only human action
→ duplicate activity suppression
→ evaluation and rollback/version record
```

Before tenant delivery, the local playbook proof is available in
`dotnet/LandOps.Api.Tests/PlaybookEndToEndTests.cs`. It covers Legal curative
blockers, lease development obligations, and division-order readiness through
the ASP.NET Core agent request API. It does not replace the real Teams mention
smoke test.

Until a real Teams mention reaches the bot and returns an evidence-backed
reply, describe it as a deployed adapter foundation with locally verified contracts. After that smoke
passes, describe it as a tenant-backed demo—not as production Teams activation.
