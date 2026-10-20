from __future__ import annotations

import csv
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP


mcp = FastMCP("PipelineHistorian")


def telemetry_file() -> Path:
    configured_path = os.getenv("PIPELINE_TELEMETRY_FILE")
    if configured_path:
        return Path(configured_path)
    return (
        Path(__file__).resolve().parent.parent
        / "pipeline-historian-mcp"
        / "data"
        / "telemetry.csv"
    )


def normalize_station_id(value: str) -> str:
    match = re.fullmatch(r"station\s*[- ]?\s*(\d+)", value, re.IGNORECASE)
    if match:
        return f"STATION-{int(match.group(1)):02d}"
    return value


@mcp.tool()
def get_scada_tags(station_id: str) -> dict:
    """Return the most recent historian telemetry for a station."""
    if not isinstance(station_id, str) or not station_id.strip():
        return {"error": "station_id is required."}

    station_id = normalize_station_id(station_id.strip())
    path = telemetry_file()
    try:
        with path.open(newline="", encoding="utf-8") as telemetry_csv:
            rows = [
                row
                for row in csv.DictReader(telemetry_csv)
                if row.get("Station_ID") == station_id.strip()
            ]
    except FileNotFoundError:
        return {"error": f"Telemetry data file was not found: {path}"}
    except OSError as error:
        return {"error": f"Telemetry data could not be read: {error}"}

    if not rows:
        return {"error": f"No telemetry found for station_id '{station_id.strip()}'."}

    try:
        row = max(
            rows,
            key=lambda candidate: datetime.fromisoformat(
                candidate["Timestamp"].replace("Z", "+00:00")
            ),
        )
    except (KeyError, TypeError, ValueError) as error:
        return {
            "error": f"Telemetry timestamps for station_id '{station_id.strip()}' are invalid: {error}"
        }

    try:
        telemetry: dict[str, Any] = {
            "timestamp": row["Timestamp"],
            "station_id": row["Station_ID"],
            "compressor_speed_rpm": float(row["Compressor_Speed_RPM"]),
            "suction_pressure_psi": float(row["Suction_Pressure_PSI"]),
            "discharge_pressure_psi": float(row["Discharge_Pressure_PSI"]),
            "flow_rate_mmcfd": float(row["Flow_Rate_MMCFD"]),
        }
    except (KeyError, TypeError, ValueError) as error:
        return {
            "error": f"Telemetry row for station_id '{station_id.strip()}' is invalid: {error}"
        }
    return telemetry


@mcp.tool()
def check_phmsa_guidelines(telemetry_data: dict | None = None, station_id: str | None = None) -> str:
    """Screen telemetry for a high differential-pressure operating condition."""
    if telemetry_data is None and station_id:
        telemetry_data = get_scada_tags(station_id)
    if not isinstance(telemetry_data, dict):
        return "Error: telemetry_data or station_id is required."
    if "error" in telemetry_data:
        return f"Error: telemetry lookup failed: {telemetry_data['error']}"

    try:
        suction_pressure = float(telemetry_data["suction_pressure_psi"])
        discharge_pressure = float(telemetry_data["discharge_pressure_psi"])
        compressor_speed = float(telemetry_data["compressor_speed_rpm"])
        station_id = str(telemetry_data["station_id"])
    except (KeyError, TypeError, ValueError) as error:
        return f"Error: telemetry data is incomplete or invalid: {error}"

    gradient = suction_pressure - discharge_pressure
    if gradient > 150 and compressor_speed >= 4000:
        return (
            "HIGH PRIORITY WARNING: PHMSA Title 49 CFR Part 195 Violation Framework "
            f"triggered for {station_id} due to an Abnormal Operating Condition (AOC). "
            f"Differential pressure gradient is {gradient:.1f} PSI at {compressor_speed:.0f} RPM, "
            "indicative of a downstream leak. Escalate to the qualified operator for immediate review."
        )
    return (
        f"NORMAL STATUS: No high differential-pressure AOC detected for {station_id}. "
        f"Differential pressure gradient is {gradient:.1f} PSI at {compressor_speed:.0f} RPM."
    )


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
