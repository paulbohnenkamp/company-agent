from __future__ import annotations

import csv
from datetime import datetime, timedelta, timezone
from pathlib import Path


OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / "pipeline-historian-mcp"
    / "data"
    / "telemetry.csv"
)
FIELDNAMES = [
    "Timestamp",
    "Station_ID",
    "Compressor_Speed_RPM",
    "Suction_Pressure_PSI",
    "Discharge_Pressure_PSI",
    "Flow_Rate_MMCFD",
]


def generate_rows() -> list[dict[str, int | str]]:
    end = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    start = end - timedelta(minutes=95)
    normal_speeds = [3150, 3200, 3250, 3180, 3220]
    normal_suction = [778, 780, 781, 779, 782]
    rupture_discharge = [750, 715, 680, 645, 610]
    rupture_flow = [120, 112, 104, 96, 88]
    return [
        {
            "Timestamp": (start + timedelta(minutes=index * 5))
            .isoformat()
            .replace("+00:00", "Z"),
            "Station_ID": "STATION-04",
            "Compressor_Speed_RPM": normal_speeds[index % len(normal_speeds)]
            if index < 15
            else 4500,
            "Suction_Pressure_PSI": normal_suction[index % len(normal_suction)]
            if index < 15
            else 780,
            "Discharge_Pressure_PSI": 750
            if index < 15
            else rupture_discharge[index - 15],
            "Flow_Rate_MMCFD": 120 + (index % 5) - 2
            if index < 15
            else rupture_flow[index - 15],
        }
        for index in range(20)
    ]


def run_simulation() -> None:
    rows = generate_rows()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as telemetry_csv:
        writer = csv.DictWriter(telemetry_csv, fieldnames=FIELDNAMES, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} telemetry rows to {OUTPUT_PATH}")


def main() -> None:
    run_simulation()


if __name__ == "__main__":
    main()
