from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

import httpx
import yaml

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MANIFEST = ROOT / "agents"

# Allow direct execution from the repository root to import local MCP packages.
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class HarnessError(RuntimeError):
    """Raised when the live harness cannot safely produce a grounded response."""


def load_local_env(path: Path = ROOT / ".env") -> None:
    """Load simple KEY=VALUE entries without overwriting the process environment."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"").strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_manifest(agent_root: Path = DEFAULT_MANIFEST) -> list[dict[str, Any]]:
    manifest: list[dict[str, Any]] = []
    for path in sorted(agent_root.rglob("agent.yaml")):
        contract = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        manifest.append(
            {
                "name": contract.get("name", path.parent.name),
                "description": contract.get("description", ""),
                "instructions": contract.get("instructions", ""),
                "tools": contract.get("tools", []),
                "path": str(path.relative_to(ROOT)),
            }
        )
    if not manifest:
        raise HarnessError(f"No agent contracts found under {agent_root}")
    return manifest


def _object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise HarnessError(f"{label} must be an object")
    return value


def validate_plan(plan: Any, manifest: list[dict[str, Any]]) -> dict[str, Any]:
    plan = _object(plan, "Planner output")
    selected_agent = plan.get("selected_agent")
    steps = plan.get("steps")
    known_agents = {agent["name"] for agent in manifest}
    if selected_agent not in known_agents:
        raise HarnessError("Planner selected an unknown agent")
    if not isinstance(steps, list) or not steps:
        raise HarnessError("Planner returned no executable steps")

    available_tools = {
        tool.get("name")
        for agent in manifest
        if agent["name"] == selected_agent
        for tool in agent.get("tools", [])
        if isinstance(tool, dict)
    }
    validated_steps: list[dict[str, Any]] = []
    for step in steps:
        step = _object(step, "Planner step")
        tool_name = step.get("tool_name")
        arguments = step.get("arguments")
        if tool_name not in available_tools:
            raise HarnessError(f"Planner selected an unavailable tool: {tool_name}")
        if not isinstance(arguments, dict):
            raise HarnessError(f"Arguments for {tool_name} must be an object")
        validated_steps.append({"tool_name": tool_name, "arguments": arguments})
    return {"selected_agent": selected_agent, "steps": validated_steps}


def execute_tool(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    if tool_name == "get_scada_tags":
        from pipeline_historian_mcp.server import get_scada_tags

        station_id = arguments.get("station_id", arguments.get("stationId", ""))
        result = get_scada_tags(station_id)
        return {"tool_name": tool_name, "result": result}
    if tool_name == "check_phmsa_guidelines":
        from pipeline_historian_mcp.server import check_phmsa_guidelines

        return {
            "tool_name": tool_name,
            "result": check_phmsa_guidelines(
                arguments.get("telemetry_data"),
                arguments.get("station_id", arguments.get("stationId")),
            ),
        }
    if tool_name == "parse_lease_contract":
        from land_admin_mcp.server import parse_lease_contract

        return {"tool_name": tool_name, "result": parse_lease_contract(arguments.get("contract_text", ""))}
    if tool_name == "audit_title_records":
        from land_admin_mcp.server import audit_title_records

        return {"tool_name": tool_name, "result": audit_title_records(arguments.get("tract_id", ""))}
    if tool_name == "calculate_and_post_division_order":
        from land_admin_mcp.server import calculate_and_post_division_order

        return {
            "tool_name": tool_name,
            "result": calculate_and_post_division_order(
                arguments.get("owner_id", ""),
                arguments.get("tract_id", ""),
                arguments.get("lease_royalty"),
                arguments.get("tract_share"),
            ),
        }
    if tool_name in {"find_customer", "get_customer_summary"}:
        customer_id = arguments.get("customerId", "")
        if not isinstance(customer_id, str) or not customer_id:
            return {"tool_name": tool_name, "result": {"error": "customerId is required"}}
        base_url = os.getenv("CUSTOMER_API_URL", "http://localhost:5080").rstrip("/")
        try:
            response = httpx.get(f"{base_url}/api/customers/{customer_id}", timeout=5)
            result: Any = response.json()
            if response.is_error:
                result = {"error": result}
        except (httpx.HTTPError, ValueError) as error:
            result = {"error": f"Customer API lookup failed: {error}"}
        return {"tool_name": tool_name, "result": result}
    raise HarnessError(f"Unsupported local tool: {tool_name}")


def validate_response(response: Any, evidence: list[dict[str, Any]]) -> dict[str, Any]:
    response = _object(response, "Responder output")
    claims = response.get("claims")
    final_response = response.get("final_response")
    evidence_ids = {item.get("evidence_id") for item in evidence}
    if not isinstance(claims, list) or not claims:
        raise HarnessError("Responder returned no claims")
    if not isinstance(final_response, str) or not final_response.strip():
        raise HarnessError("Responder returned no final response")

    validated_claims: list[dict[str, Any]] = []
    for claim in claims:
        claim = _object(claim, "Response claim")
        text = claim.get("text")
        claim_type = claim.get("claim_type")
        references = claim.get("evidence_ids")
        if not isinstance(text, str) or not text.strip():
            raise HarnessError("Every response claim must contain text")
        if not isinstance(claim_type, str) or not claim_type.strip():
            raise HarnessError("Every response claim must contain claim_type")
        if not isinstance(references, list) or not references:
            raise HarnessError("Every response claim must cite evidence")
        if any(reference not in evidence_ids for reference in references):
            raise HarnessError("Response claim cites evidence that does not exist")
        validated_claims.append(
            {"claim_id": claim.get("claim_id", f"claim-{len(validated_claims) + 1}"), "text": text, "claim_type": claim_type, "evidence_ids": references}
        )
    return {"final_response": final_response, "claims": validated_claims}


def provider_config() -> tuple[str, str, str]:
    provider = os.getenv("LLM_PROVIDER", "").strip().lower()
    model = os.getenv("LLM_MODEL", "").strip()
    api_key = os.getenv("LLM_API_KEY", "").strip()
    if provider not in {"openai", "anthropic"}:
        raise HarnessError("LLM_PROVIDER must be either 'openai' or 'anthropic'")
    if not model or not api_key:
        raise HarnessError("LLM_MODEL and LLM_API_KEY are required for live mode")
    return provider, model, api_key


def _client() -> tuple[str, Any, str]:
    provider, model, api_key = provider_config()
    try:
        if provider == "openai":
            from openai import OpenAI

            return provider, OpenAI(api_key=api_key), model
        from anthropic import Anthropic

        return provider, Anthropic(api_key=api_key), model
    except ImportError as error:
        raise HarnessError("Install the orchestration extra to use live mode") from error


def _json_completion(provider: str, client: Any, model: str, system: str, user: str) -> dict[str, Any]:
    try:
        if provider == "openai":
            completion = client.chat.completions.create(
                model=model,
                temperature=1,
                response_format={"type": "json_object"},
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            )
            content = completion.choices[0].message.content
        else:
            completion = client.messages.create(
                model=model,
                max_tokens=2000,
                temperature=0,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            content = "".join(block.text for block in completion.content if getattr(block, "type", None) == "text")
    except Exception as error:
        raise HarnessError(
            f"{provider} rejected model '{model}'. Check that LLM_MODEL is a model "
            f"available to this API key. Provider error: {error}"
        ) from error
    if not content:
        raise HarnessError("LLM returned an empty response")
    content = content.strip()
    if content.startswith("```") and content.endswith("```"):
        content = content.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
    try:
        return _object(json.loads(content), "LLM JSON output")
    except json.JSONDecodeError as error:
        raise HarnessError("LLM returned invalid JSON") from error


def run_live(prompt: str) -> dict[str, Any]:
    load_local_env()
    provider, client, model = _client()
    manifest = load_manifest()
    manifest_json = json.dumps(manifest, ensure_ascii=True)
    plan = validate_plan(
        _json_completion(
            provider,
            client,
            model,
            "Return only JSON. Select one declared agent and executable tools. Never invent tools or arguments.",
            f"Agent manifest:\n{manifest_json}\n\nUser request:\n{prompt}\n\nSchema: {{selected_agent: string, steps: [{{tool_name: string, arguments: object}}]}}",
        ),
        manifest,
    )
    evidence: list[dict[str, Any]] = []
    for index, step in enumerate(plan["steps"], start=1):
        result = execute_tool(step["tool_name"], step["arguments"])
        evidence.append({"evidence_id": f"evidence-{index}", **result})
    response = _json_completion(
        provider,
        client,
        model,
        "Return only JSON. Make claims only from the supplied evidence. Every claim must cite one or more evidence IDs. If evidence is insufficient, say so as a claim and cite the failed evidence.",
        f"User request:\n{prompt}\n\nEvidence ledger:\n{json.dumps(evidence, ensure_ascii=True)}\n\nSchema: {{final_response: string, claims: [{{claim_id: string, text: string, claim_type: string, evidence_ids: [string]}}]}}",
    )
    return {"plan": plan, "evidence": evidence, "response": validate_response(response, evidence)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the external-LLM local orchestration harness.")
    parser.add_argument("prompt")
    args = parser.parse_args()
    try:
        print(json.dumps(run_live(args.prompt), indent=2, ensure_ascii=True))
    except HarnessError as error:
        print(f"Harness blocked response: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
