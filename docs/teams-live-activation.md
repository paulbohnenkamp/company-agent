# Business Agent Teams live activation

This runbook connects the existing `src/teams/server.ts` transport to a small
real Microsoft 365 tenant for a controlled Business Agent demo. It does not replace
the ASP.NET Core agent request API or authorize actions in the Teams adapter.

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
Two licensed test users and the original Team/channel are recorded in the
activation result. A repository persona is not a licensed tenant account.

The deployed adapter foundation is recorded in
[result 047](../results/047-teams-bot-activation.md). The original Azure Bot
resource is retained for compatibility, and `business-agent-bot` now uses the
Microsoft 365 tenant app identity with the existing adapter endpoint. The
version 1.0.1 package is uploaded and installed in `Sample Energy Company` →
`Operations`. A live mention completed the ownership playbook and returned five
findings from five sources with a human-review boundary. The old bot is not
the active package identity and is retained as a legacy resource; it does not
participate in the current message path.

The Teams reply is intentionally one Business Agent response. It includes the
ordered agent path and a numbered contribution summary for each specialist,
followed by the complete findings and one concise human-review boundary.
Specialist names are contributions in the response, not separate tenant
accounts or bots. Evidence disclaimers remain in the structured packet for
auditing but are not repeated in the conversational Teams reply.

The API packet and Teams formatter are independently verified: the live API
scenario response contains the three contribution objects, and the adapter
health endpoint is returning HTTP 200. A new mention uses the already-installed
package; no package upload is required for this response-only change.

## Azure and application setup

The Azure subscription contains the Business Agent API and Teams adapter
services. The
verified live resource/configuration set is:

1. Configure the API app registration with a stable identifier URI and a
   narrowly scoped application role for the Teams adapter workload.
2. Use the `business-agent-bot` Azure Bot resource with the single-tenant app
   registration in the Microsoft 365 tenant.
3. Keep the existing adapter as a separately managed HTTPS service with
   `/api/messages` reachable publicly.
4. Store any bot secret in Key Vault and expose it through an App Service Key
   Vault reference. Never commit or print the secret.
5. Enable the Microsoft Teams channel on the Azure Bot resource and point the
   messaging endpoint at the adapter.
6. Grant only the required API/Graph permissions and obtain administrator
   consent.

For this first demo, the adapter targets a fixed case and scenario. The API
accepts transported role/group context only when the authenticated token
matches the configured adapter app identity and carries the
`LandOps.Workroom.Invoke` application role. The API still validates the role
and group against its scenario catalog. This narrow workload boundary is for
starting the review thread; human action endpoints remain claim-based and do
not accept the adapter workload as a human.

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

The real Teams mention gate has passed. The tenant-backed demo is verified for
the read-only evidence review path. Package upload proves catalog availability;
the successful mention additionally proves endpoint delivery, workload
authentication, API authorization, persistence, playbook execution, and reply
delivery. Human-action authorization and duplicate-activity suppression remain
separate live checks.
