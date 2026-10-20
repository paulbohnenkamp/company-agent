from pathlib import Path

import pytest

from scripts.run_local_orchestration import (
    HarnessError,
    load_manifest,
    provider_config,
    validate_plan,
    validate_response,
)


ROOT = Path(__file__).resolve().parents[1]


def test_provider_config_uses_single_provider_contract(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "anthropic")
    monkeypatch.setenv("LLM_MODEL", "claude-test")
    monkeypatch.setenv("LLM_API_KEY", "test-key")

    assert provider_config() == ("anthropic", "claude-test", "test-key")


def test_provider_config_rejects_unknown_provider(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "ollama")
    monkeypatch.setenv("LLM_MODEL", "local")
    monkeypatch.setenv("LLM_API_KEY", "test-key")

    with pytest.raises(HarnessError, match="LLM_PROVIDER"):
        provider_config()


def test_provider_config_requires_model_and_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    monkeypatch.delenv("LLM_MODEL", raising=False)
    monkeypatch.delenv("LLM_API_KEY", raising=False)

    with pytest.raises(HarnessError, match="LLM_MODEL and LLM_API_KEY"):
        provider_config()


def test_manifest_contains_pipeline_and_land_capabilities() -> None:
    manifest = load_manifest(ROOT / "agents")
    names = {agent["name"] for agent in manifest}

    assert "pipeline-integrity" in names
    assert "land-admin" in names


def test_plan_accepts_declared_tool() -> None:
    manifest = load_manifest(ROOT / "agents")

    plan = validate_plan(
        {
            "selected_agent": "pipeline-integrity",
            "steps": [
                {"tool_name": "get_scada_tags", "arguments": {"station_id": "STATION-04"}}
            ],
        },
        manifest,
    )

    assert plan["steps"][0]["tool_name"] == "get_scada_tags"


def test_plan_rejects_unknown_tool() -> None:
    manifest = load_manifest(ROOT / "agents")

    with pytest.raises(HarnessError, match="unavailable tool"):
        validate_plan(
            {
                "selected_agent": "pipeline-integrity",
                "steps": [{"tool_name": "invented_tool", "arguments": {}}],
            },
            manifest,
        )


def test_response_accepts_only_existing_evidence_references() -> None:
    evidence = [{"evidence_id": "evidence-1", "result": {"status": "posted"}}]

    response = validate_response(
        {
            "final_response": "The transaction was posted.",
            "claims": [
                {
                    "claim_id": "claim-1",
                    "text": "The transaction was posted.",
                    "claim_type": "observed_result",
                    "evidence_ids": ["evidence-1"],
                }
            ],
        },
        evidence,
    )

    assert response["claims"][0]["evidence_ids"] == ["evidence-1"]


def test_response_blocks_unsupported_claim_reference() -> None:
    with pytest.raises(HarnessError, match="evidence that does not exist"):
        validate_response(
            {
                "final_response": "The transaction was posted.",
                "claims": [
                    {
                        "claim_id": "claim-1",
                        "text": "The transaction was posted.",
                        "claim_type": "observed_result",
                        "evidence_ids": ["invented-evidence"],
                    }
                ],
            },
            [],
        )


def test_response_blocks_claim_without_evidence() -> None:
    with pytest.raises(HarnessError, match="must cite evidence"):
        validate_response(
            {
                "final_response": "The transaction was posted.",
                "claims": [
                    {
                        "claim_id": "claim-1",
                        "text": "The transaction was posted.",
                        "claim_type": "observed_result",
                        "evidence_ids": [],
                    }
                ],
            },
            [],
        )
