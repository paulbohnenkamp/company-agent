# Company Agent

This repository is a small reference solution for Microsoft Copilot Studio
agent composition. Keep it simple and synthetic.

## Design boundaries

- Copilot Studio owns agent discovery, delegation, and conversation
  orchestration.
- Specialist agents are declarative capabilities, not a repository-side
  router or registry.
- Deterministic workflows and existing application APIs remain authoritative.
- Use MCP only to demonstrate a real integration boundary or shared tool
  need.
- Keep examples read-only or reversible.
- Do not add a central orchestration API, generalized platform framework, or
  speculative department framework.

The intended composition is:

```text
Company Agent
  -> HR Agent
  -> Customer Agent -> Customer MCP -> existing customer API
  -> IT Request Agent -> agent-callable workflow
```

The repository is the source of truth for local agent contracts and workflow
contracts. Generated PAC workspaces and tenant-specific deployment artifacts
are local outputs, not source files.

## Workflow boundary

The existing Forms-triggered IT workflow remains unchanged:

```text
Microsoft Forms
  -> Get response details
  -> Normalize request
  -> SharePoint Create item
  -> SharePoint Update item
  -> Teams Post card
```

An agent-callable workflow may reuse the existing SharePoint list, Teams
destination, connections, and business-process behavior. It must accept
`employeeName`, `requestType`, `description`, and `isUrgent`, and return the
observed Service Request ID and status. Do not create a replacement Forms
flow, SharePoint list, Teams team, or workflow.

The customer integration remains:

```text
Customer Agent -> customer MCP server -> existing customer API
```

## Pre-commit data review

Before every commit, inspect the staged diff for accidental tenant or secret
disclosure. Check all staged files for:

- public or tenant-specific endpoints, hostnames, resource names, registry
  names, subscription IDs, tenant IDs, and image references;
- credentials, API keys, access tokens, client secrets, private keys, and
  connection strings;
- local `.env` files, tenant-specific parameter files, deployment transcripts,
  and generated PAC artifacts.

Keep real deployment values in ignored local configuration such as `.env` and
use sanitized examples in tracked files. Review both `git diff --cached` and
the staged file list before committing; a clean build does not prove that the
staged content is safe to publish.

## Verification

Before claiming a local feature is complete, run:

```text
.venv/bin/python -m pytest -q
dotnet build customer-app/CustomerApp.csproj --no-restore
git diff --check
```

Tenant work is complete only after verification in Copilot Studio Preview or a
controlled Teams channel with observable activity evidence. Never record
credentials, tokens, keys, or connection strings in the repository.

## Writing Style & Formatting Directive

Apply the following principles of clarity and brevity to ALL text outputs, including direct chat responses, markdown documentation, and inline code comments.

### 1. Style Rules (The Zinsser / Strunk & White Standard)

- **Strip Clutter:** Eliminate fluff ("in order to" becomes "to", "utilize" becomes "use").
- **Active Voice:** Write "The function calculates X," not "X is calculated by the function."
- **Short Sentences:** Stick to one core idea per sentence. Split long, winding thoughts.
- **Be Direct:** Avoid weak qualifiers like "very," "rather," or "essentially."

### 1a. Natural voice

- Use natural, human-sounding English.
- Match the user your interacting with tone: calm, thoughtful, direct, and succinct.
- Avoid canned phrasing, excessive enthusiasm, corporate filler, and language that sounds AI-generated.
- Prefer plain words and a natural rhythm. Keep enough detail to be useful without overexplaining.

### 2. Contextual Guardrails (Scope of Application)

- **Programming Code:** DO NOT apply these rules to raw code blocks (e.g., Python, JavaScript, SQL). Code syntax, variable names, and architectural structure must remain untouched and fully functional.
- **Markdown & Docs:** Apply strictly. Documentation must be highly scannable, punchy, and direct.
- **Direct Chat/Responses:** Maintain a helpful, peer-like tone. While sentences should be clean and concise, do not become so brief that you sound robotic, rude, or dismissive.
