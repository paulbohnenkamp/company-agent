from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pipeline_historian_mcp.server import check_phmsa_guidelines, get_scada_tags


def _fact(title: str, value: Any) -> dict[str, str]:
    return {"title": title, "value": str(value)}


def build_pipeline_card(station_id: str) -> dict[str, Any]:
    telemetry = get_scada_tags(station_id)
    screening = check_phmsa_guidelines(telemetry)
    body: list[dict[str, Any]] = [
        {
            "type": "TextBlock",
            "text": "Pipeline Integrity Alert",
            "weight": "Bolder",
            "size": "Medium",
            "color": "Attention" if screening.startswith("HIGH PRIORITY") else "Default",
        }
    ]

    if "error" in telemetry:
        body.append({"type": "TextBlock", "text": telemetry["error"], "wrap": True})
    else:
        gradient = telemetry["suction_pressure_psi"] - telemetry["discharge_pressure_psi"]
        body.append(
            {
                "type": "FactSet",
                "facts": [
                    _fact("Station", telemetry["station_id"]),
                    _fact("Suction pressure", f'{telemetry["suction_pressure_psi"]:.0f} PSI'),
                    _fact("Delivery pressure", f'{telemetry["discharge_pressure_psi"]:.0f} PSI'),
                    _fact("Differential", f"{gradient:.1f} PSI"),
                    _fact("Compressor speed", f'{telemetry["compressor_speed_rpm"]:.0f} RPM'),
                    _fact("Flow", f'{telemetry["flow_rate_mmcfd"]:.0f} MMcfd'),
                ],
            }
        )

    body.extend(
        [
            {"type": "TextBlock", "text": screening, "wrap": True},
            {
                "type": "TextBlock",
                "text": "Operational screening only. Qualified operator review required.",
                "isSubtle": True,
                "wrap": True,
            },
        ]
    )
    return {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.5",
        "body": body,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Render a local Pipeline result as an Adaptive Card payload.")
    parser.add_argument("station_id", nargs="?", default="Station 4")
    args = parser.parse_args()
    print(json.dumps(build_pipeline_card(args.station_id), indent=2, ensure_ascii=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
