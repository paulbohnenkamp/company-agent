# LandOps Teams live activation

This runbook connects the existing `src/teams/server.ts` transport to a small
real Microsoft 365 tenant for a controlled LandOps demo. It does not replace
the ASP.NET Core Workroom API or authorize actions in the Teams adapter.

For a browser-assisted tenant setup, use the [ChatGPT Work handoff](chatgpt-work-teams-handoff.md).

## Current status

Local adapter readiness is verified in [result 043](../results/043-teams-activation-readiness.md).
The active target is a minimal tenant-backed demo. Production workload
authentication and directory-backed authorization remain deferred.

For tenant privacy and member-management guidance, see
[`teams-tenant-settings.md`](teams-tenant-settings.md). A private Team is the
recommended setting for controlled testing. “Public” in Teams means discoverable
and joinable by users in that Microsoft 365 tenant; it does not mean public on
the internet.

## Preferred test environment

Use a qualifying Microsoft 365 Developer Program instant sandbox. Microsoft
describes it as a free E5 developer environment with up to 25 user licenses,
Teams sample users, teams, channels, and app sideloading support. It can last
up to 90 days at a time and renew while used for qualifying development.

- [Join the Microsoft 365 Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program)
- [Set up the developer sandbox](https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-get-started)
- [Install the Teams sample data pack](https://learn.microsoft.com/en-us/office/developer-program/install-sample-packs)

If the developer program is unavailable, Microsoft 365 Business Basic with
Teams is the smallest paid fallback. Check the current regional price before
purchasing; the US pricing page currently lists approximately $7 per user per
month with annual billing and $7.20 with monthly billing.

## Minimal tenant setup checklist

1. Create a paid Microsoft 365 Business Basic tenant with Teams, using a
   trial if Microsoft offers one.
2. Record the tenant ID and `onmicrosoft.com` domain without committing them
   as secrets.
3. Confirm Teams is enabled and custom app upload/sideloading is allowed.
4. Create or select an admin plus two licensed test users, such as Legal and
   Land. A third Compliance user is useful but not required for the first demo.
5. Create one test team and a `landops-demo` channel.
6. Confirm custom app upload/sideloading is allowed.
7. Record the tenant domain and tenant ID; do not commit credentials.

## Azure and application setup

The Azure subscription already contains the LandOps web and API services. The
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
→ Workroom evidence-backed reply
→ append-only human action
→ duplicate activity suppression
→ evaluation and rollback/version record
```

Before tenant delivery, the local playbook proof is available in
`dotnet/LandOps.Api.Tests/PlaybookEndToEndTests.cs`. It covers Legal curative
blockers, lease development obligations, and division-order readiness through
the ASP.NET Core Workroom API. It does not replace the real Teams mention
smoke test.

Until the real Teams mention reaches the bot and returns the deterministic
Workroom reply, describe the component as a local reference. After that smoke
passes, describe it as a tenant-backed demo—not as production Teams activation.
