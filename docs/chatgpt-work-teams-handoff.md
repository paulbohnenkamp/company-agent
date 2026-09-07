# ChatGPT Work handoff for the LandOps Teams demo

Use this document with ChatGPT Desktop in Work mode with Cloud Browser enabled.
This handoff covers Microsoft 365 tenant setup only. It does not authorize code
changes, Azure changes, purchases, or secret handling.

## Prompt to paste into ChatGPT Work

You are helping me prepare a small Microsoft Teams environment for a LandOps
job-interview demo.

Read the attached repository documents if they are available:

- `AGENTS.md`
- `docs/PROJECT_STATE.md`
- `specs/044-teams-live-activation.md`
- `docs/teams-live-activation.md`

Treat the repository documents as the source of truth. The current goal is a
small tenant-backed Teams demo. Do not redesign the application. Do not change
the C# API, the Next.js app, the Teams adapter, or the Azure deployment.

Use Cloud Browser to help me create or configure a separate Microsoft 365
tenant with Teams. Stop and return control to me before each sensitive step.
I will personally enter passwords, MFA codes, payment details, and final
purchase or recurring-subscription confirmation.

Do not ask me to send you any password, MFA code, client secret, certificate,
access token, or full payment-card number. Do not print or store secrets.

## Target setup

Create only the smallest useful demo environment:

1. One Microsoft 365 tenant with Teams enabled.
2. One administrator account.
3. Two licensed demo users:
   - `legal.demo`, representing Legal.
   - `land.demo`, representing Land or Title.
4. One Team named `LandOps Demo`.
5. One channel named `landops-demo`.
6. Permission for the administrator to upload or sideload a custom Teams app,
   if the tenant policy supports it.

Do not create separate Teams accounts for LandOps agents. The agent roles stay
inside the LandOps application. The demo uses one real Teams user and one real
Teams channel to show the collaboration flow.

## Account and billing rules

Try the Microsoft 365 Business Basic trial first if Microsoft offers it.
Otherwise show me the current price and billing interval before checkout.
Do not complete checkout without my direct confirmation.

Use `DecisionForge` as the company name if Microsoft asks for a company name.
This tenant is for a custom solution demo for a third party, not for internal
use by the tenant owner.

If Microsoft offers a Developer Program sandbox, do not assume that I qualify.
If eligibility fails, continue with the Business Basic path and explain what
Microsoft requires next.

## Stop conditions

Stop and ask me to take over when the browser reaches any of these steps:

- password creation or sign-in;
- MFA, phone verification, or identity verification;
- payment details, purchase, or recurring subscription confirmation;
- tenant administrator consent;
- a page that asks for a secret or a value you cannot verify safely.

If the tenant cannot be created, record the exact page message and stop. Do not
try to bypass eligibility, identity checks, billing checks, or tenant policy.

## Return only these non-secret facts

After setup, report:

- tenant display name;
- tenant domain, such as `example.onmicrosoft.com`;
- Microsoft Entra tenant ID;
- whether Teams is enabled;
- whether custom app upload or sideloading is allowed;
- the names of the Team and channel;
- which setup steps remain incomplete or externally blocked.

Do not report passwords, MFA codes, secrets, tokens, card details, or recovery
codes. Do not claim that the LandOps Teams integration is live. The repository
still requires bot registration, a public adapter endpoint, consent, identity
mapping, and a real Teams mention smoke test.

## Resume note for Codex

When the browser work finishes, provide the non-secret facts above to Codex.
Codex will update the active Teams spec and result records before any further
implementation. The next repository step is not authorized by this handoff
unless the tenant setup has produced the required evidence.
