# Local Development

This repository includes a local aggregate for the Company Agent reference
solution. It starts the synthetic customer API, Customer MCP, Pipeline MCP,
and Land Administration MCP together.

## One-time Setup

Create the virtual environment and install the test dependencies once per
working copy:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[test]'
```

If you will run the external LLM harness, install its clients once as well:

```bash
.venv/bin/pip install -e '.[orchestration]'
```

Set `LLM_PROVIDER` to exactly one of these values:

- `openai` for the OpenAI API.
- `anthropic` for the Anthropic API. The spelling is `anthropic`, not
  `anthopic`.

Then set a model name that your selected API key can access. Configure `.env`:

```dotenv
LLM_PROVIDER="openai"       # or "anthropic"
LLM_MODEL="model-name-you-can-access"
LLM_API_KEY="your-key"
```

Never commit `.env` or print `LLM_API_KEY` in logs or test artifacts. If the
provider reports that a model does not exist or is not available, replace
`LLM_MODEL` with a model enabled for that API key.

## Start the Aggregate

Run all local backends in one foreground process:

```bash
./scripts/start-local.sh
```

The launcher regenerates synthetic telemetry and the Land Administration
SQLite ledger, starts all four local services, and stops its child processes on
Ctrl+C. Each run gets a timestamp such as
`/tmp/company-agent-logs/company-agent-pipeline-mcp-20261020-143012.log`.

## Run Tests

Run the complete offline contract suite:

```bash
.venv/bin/python -m pytest -q
```

The tests cover Pipeline Integrity, Land Administration, agent guardrails,
provider configuration, planner schemas, and evidence-grounding failures. They
do not call an external LLM.

## Run the External LLM Harness

The harness uses the configured external model for both route planning and
response claims. It does not contain a deterministic fallback planner.

```bash
.venv/bin/python scripts/run_local_orchestration.py \
  "Station 4 is reporting low delivery pressure. What is happening?"
```

The harness loads the agent contracts, asks the model for a structured route,
executes only declared local tools, and asks the model for evidence-linked
claims. It blocks the response if a claim has no valid evidence reference.

Render the Pipeline result as a Teams-shaped Adaptive Card payload without
calling an external LLM:

```bash
.venv/bin/python scripts/render_pipeline_card.py "Station 4"
```

This uses the real local Pipeline MCP functions and emulates only the
presentation step. It does not replace Copilot Studio's agent orchestration or
prove that the card renders in Teams.

## Run Services Individually

Generate and inspect Pipeline telemetry:

```bash
.venv/bin/python -m pipeline_historian_mcp.simulator
.venv/bin/python -m pipeline_historian_mcp.server
```

Bootstrap and run Land Administration:

```bash
.venv/bin/python -m land_admin_mcp.bootstrap
.venv/bin/mcp run land_admin_mcp/server.py
```

Run the Customer API and MCP adapter separately:

```bash
dotnet run --project customer-app/CustomerApp.csproj --urls http://localhost:5080
CUSTOMER_API_URL=http://localhost:5080 MCP_TRANSPORT=http .venv/bin/customer-mcp
```

Run the IT workflow normalization contract:

```bash
.venv/bin/python -m it_request_workflow.normalize
```

## Scope

The aggregate and harness are local developer tools. They do not replace
Copilot Studio orchestration, deploy a central Azure router, or change the
service-specific Azure deployment boundaries. Tenant validation remains covered
by [the Copilot Studio setup guide](copilot-studio-setup.md).
