import csv
import json
from datetime import datetime
from pathlib import Path

import pytest
import yaml

from land_admin_mcp.bootstrap import initialize_database, write_contract_templates
from land_admin_mcp.server import (
    audit_title_records,
    calculate_and_post_division_order,
    parse_lease_contract,
)
from pipeline_historian_mcp.server import check_phmsa_guidelines, get_scada_tags
from pipeline_historian_mcp.simulator import FIELDNAMES, generate_rows


def test_pipeline_simulator_generates_normal_and_rupture_phases() -> None:
    rows = generate_rows()

    assert len(rows) == 20
    assert all(row["Station_ID"] == "STATION-04" for row in rows)
    timestamps = [datetime.fromisoformat(row["Timestamp"].replace("Z", "+00:00")) for row in rows]
    assert all((later - earlier).total_seconds() == 300 for earlier, later in zip(timestamps, timestamps[1:]))
    assert all(row["Compressor_Speed_RPM"] < 4000 for row in rows[:15])
    assert all(row["Discharge_Pressure_PSI"] == 750 for row in rows[:15])
    assert [row["Compressor_Speed_RPM"] for row in rows[15:]] == [4500] * 5
    assert [row["Discharge_Pressure_PSI"] for row in rows[15:]] == [750, 715, 680, 645, 610]


def test_pipeline_scada_lookup_and_anomaly_warning(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    telemetry_path = tmp_path / "telemetry.csv"
    with telemetry_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(generate_rows())
    monkeypatch.setenv("PIPELINE_TELEMETRY_FILE", str(telemetry_path))

    telemetry = get_scada_tags("STATION-04")
    warning = check_phmsa_guidelines(telemetry)

    assert telemetry["discharge_pressure_psi"] == 610
    assert "PHMSA Title 49 CFR Part 195 Violation Framework" in warning
    assert "Abnormal Operating Condition (AOC)" in warning
    assert "downstream leak" in warning

    direct_warning = check_phmsa_guidelines(station_id="Station 4")

    assert "downstream leak" in direct_warning


def test_pipeline_scada_accepts_natural_station_label(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    telemetry_path = tmp_path / "telemetry.csv"
    with telemetry_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(generate_rows())
    monkeypatch.setenv("PIPELINE_TELEMETRY_FILE", str(telemetry_path))

    telemetry = get_scada_tags("Station 4")

    assert telemetry["station_id"] == "STATION-04"


def test_pipeline_tools_return_explicit_errors(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setenv("PIPELINE_TELEMETRY_FILE", str(tmp_path / "missing.csv"))

    assert "station_id is required" in get_scada_tags("")["error"]
    assert "was not found" in get_scada_tags("STATION-04")["error"]
    assert "incomplete or invalid" in check_phmsa_guidelines({"station_id": "STATION-04"})


def test_land_bootstrap_creates_contract_and_title_records(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    database_path = tmp_path / "ledger.db"
    contracts_path = tmp_path / "contracts"
    initialize_database(database_path)
    write_contract_templates(contracts_path)
    monkeypatch.setenv("LAND_ADMIN_DATABASE", str(database_path))

    lease = parse_lease_contract((contracts_path / "LEASE-TX-HOU-04.txt").read_text())
    audit = audit_title_records("TX-HOU-04")

    assert lease["lease_royalty"] == 0.1875
    assert lease["tract_share"] == 0.5
    assert audit["status"] == "review_required"
    assert audit["missing_or_unresolved"][0]["record_type"] == "probate"


def test_land_division_order_calculates_and_commits_nri(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    database_path = tmp_path / "ledger.db"
    initialize_database(database_path)
    monkeypatch.setenv("LAND_ADMIN_DATABASE", str(database_path))

    result = calculate_and_post_division_order("Northstar Minerals LLC", "TX-HOU-04", 0.1875, 0.5)

    assert result["status"] == "posted"
    assert result["nri"] == 0.09375


def test_land_tools_reject_missing_or_invalid_inputs(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    database_path = tmp_path / "ledger.db"
    initialize_database(database_path)
    monkeypatch.setenv("LAND_ADMIN_DATABASE", str(database_path))

    assert "contract_text is required" in parse_lease_contract("")["error"]
    assert "tract_id is required" in audit_title_records("")["error"]
    assert "between 0 and 1" in calculate_and_post_division_order("Owner", "TRACT", 1.1, 0.5)["error"]


def test_new_agent_contracts_declare_no_invention_boundaries() -> None:
    contract_paths = [
        Path("agents/pipeline-integrity/agent.yaml"),
        Path("agents/land-admin/agent.yaml"),
        Path("agents/land-admin/lease-analyst/agent.yaml"),
        Path("agents/land-admin/title-curative/agent.yaml"),
        Path("agents/land-admin/division-order/agent.yaml"),
    ]

    for contract_path in contract_paths:
        contract = yaml.safe_load(contract_path.read_text())
        instructions = " ".join(contract["instructions"].lower().split())
        assert any(
            phrase in instructions
            for phrase in ("never invent", "do not infer", "do not declare", "report only")
        )
        assert any(
            phrase in instructions
            for phrase in ("human", "review", "qualified personnel")
        )
        assert contract["tools"]