# Prompt for the next Company Agent implementation agent

You are continuing work in `/Users/paul/code/company-agent`.

Read these first:

- `AGENTS.md`
- `docs/HANDOFF.md`
- `README.md`
- `docs/repository-guide.md`
- `docs/PROJECT_STATE.md`
- `specs/059-source-controlled-company-agent-deployment.md`
- `docs/copilot-studio-integration.md`
- `docs/teams-live-activation.md`
- `azure.yaml`
- `infra/main.bicep`
- `.env.example`

## Objective

Implement the approved spec:

`specs/059-source-controlled-company-agent-deployment.md`

Move the working Company Agent and Land Agent Copilot Studio configuration into
source control, establish a reproducible `example` deployment shape, add the
minimum HR route, and provide local plus deployed command-line verification.

## Product model

```text
Company Agent
  ├── Land Agent
  └── HR Agent
        └── governed tools
              └── Company Agent API
```

- Company Agent is the primary Copilot Studio agent and overall product.
- Land Agent and HR Agent are child agents/capabilities.
- Company Agent API is the .NET backend and application boundary.
- Domain specialists are internal capabilities, not fake employees or Teams
  bots.
- `domains/land-administration` should become `domains/land`.

## Safety boundaries

- Do not mutate, rename, delete, or redeploy `rg-mountaineer-dev`.
- Capture the current working tenant state with PAC before changing anything.
- Do not restore the removed Bot Framework/Teams bot adapter or legacy
  TypeScript runtime.
- Do not put secrets, tokens, passwords, or connection values in Git.
- Do not use `BOT_ID` as generic product configuration. PAC may require its
  `--bot` flag at the command boundary; use `COMPANY_AGENT_ID` and similar
  names in `.env`.
- Do not call the work complete based only on source files. Verify the actual
  local route and deployed response/API telemetry.

## Required implementation outcome

The future workflow should look like:

```text
.env with AZURE_ENV_NAME=example
  → azd provision/deploy
      → rg-example-dev and Company Agent API resources
  → PAC clone/pull/pack or solution import
      → Company Agent
          → Land Agent
          → HR Agent
```

Required sample questions:

```text
List the available land cases.
What is our vacation policy, and how do I request time off?
```

The Land question must route through Land Agent and its governed Land API
tool. The HR question must route through HR Agent and a minimal authenticated,
read-only synthetic HR policy operation in the Company Agent API.

Provide a terminal-friendly local deterministic trace and a deployed Direct
Line smoke test. The deployed test must print the response/transcript and
conversation ID and correlate the request to API/Application Insights
telemetry. Report observable routing/tool events only; never claim to capture
hidden chain-of-thought.

## PAC workflow

The normal agent source workflow is:

```text
pac copilot clone
→ local edit/review
→ pac copilot pull before editing
→ pac copilot pack for deployment
→ pac copilot push only as an explicit live mutation
```

PAC is already installed locally as version 2.12.2. The DecisionForge
environment ID is `ec4b8411-d158-44e0-a8cf-6f71e2d8b96b`. This tenant's
Security Defaults blocked device-code authentication (error 530035), while
the normal browser-based `pac auth create` flow succeeded using the existing
Entra/Microsoft Authenticator session. Prefer that browser flow; do not weaken
Security Defaults just to make device-code login work. Inventory the live
agent IDs/schema names, and clone to a temporary directory before adding
workspaces to the repository. If the
current agent experience does not support the expected workspace format, use
the documented Copilot Studio solution export fallback and record the missing
components.

Authentication is a deliberate human-in-the-loop gate. Start the browser-based
PAC login, then stop and ask the user to complete the Entra sign-in/MFA flow.
Do not continue until the user confirms that login is complete. Verify the
profile with `pac auth list` and `pac auth who` before running any capture,
clone, pull, pack, push, import, or deployment command.

## Do not overbuild

- Keep Azure and .NET deployment centralized; do not add `deploy/` under every
  domain.
- Do not build a complete HR system. Add only the policy data and API contract
  needed for the vacation-policy smoke test.
- Do not replace deterministic backend mechanics with model-generated logic.
- Do not retire Mountaineer resources or perform a production cutover in this
  slice.

## Verification and handoff

Run every verification command in the spec, including repository validators,
C# tests, Bicep build, AZD preview, local trace, and deployed E2E smoke tests
where credentials and tenant access are available. Update the spec progress and
decision logs during implementation. Create the matching result only after the
acceptance criteria pass, and document any tenant/API limitations precisely.
