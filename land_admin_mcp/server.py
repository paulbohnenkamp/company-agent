from __future__ import annotations

import os
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP


mcp = FastMCP("LandAdminCore")
PACKAGE_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_PATH = PACKAGE_DIR / "data" / "land_admin_ledger.db"


def database_path() -> Path:
    return Path(os.getenv("LAND_ADMIN_DATABASE", DEFAULT_DATABASE_PATH))


def _required_value(contract_text: str, label: str) -> str:
    match = re.search(
        rf"^\s*{re.escape(label)}:\s*(.+?)\s*$",
        contract_text,
        re.MULTILINE | re.IGNORECASE,
    )
    if not match:
        raise ValueError(f"Missing required contract field: {label}")
    return match.group(1)


@mcp.tool()
def parse_lease_contract(contract_text: str) -> dict[str, Any]:
    """Extract structured financial obligations from raw lease text."""
    if not isinstance(contract_text, str) or not contract_text.strip():
        return {"error": "contract_text is required."}
    try:
        royalty = float(_required_value(contract_text, "Royalty"))
        tract_share = float(_required_value(contract_text, "Tract Share"))
        if not 0 <= royalty <= 1 or not 0 <= tract_share <= 1:
            raise ValueError("Royalty and Tract Share must be decimals between 0 and 1")
        return {
            "lease_id": _required_value(contract_text, "Lease ID"),
            "tract_id": _required_value(contract_text, "Tract ID"),
            "effective_date": _required_value(contract_text, "Effective Date"),
            "primary_owner": _required_value(contract_text, "Primary Owner"),
            "lease_royalty": royalty,
            "tract_share": tract_share,
            "bonus": float(_required_value(contract_text, "Bonus")),
        }
    except (TypeError, ValueError) as error:
        return {"error": f"Lease contract could not be parsed: {error}"}


@mcp.tool()
def audit_title_records(tract_id: str) -> dict[str, Any]:
    """Audit indexed title records and return missing or unresolved items."""
    if not isinstance(tract_id, str) or not tract_id.strip():
        return {"error": "tract_id is required."}
    try:
        with sqlite3.connect(database_path()) as connection:
            records = connection.execute(
                "SELECT record_type, record_id, status FROM title_records WHERE tract_id = ? ORDER BY id",
                (tract_id.strip(),),
            ).fetchall()
    except sqlite3.Error as error:
        return {"error": f"Title ledger could not be read: {error}"}
    if not records:
        return {"error": f"No title records found for tract_id '{tract_id.strip()}'."}
    record_payload = [
        {"record_type": record_type, "record_id": record_id, "status": status}
        for record_type, record_id, status in records
    ]
    missing = [record for record in record_payload if record["status"] != "recorded"]
    return {
        "tract_id": tract_id.strip(),
        "records": record_payload,
        "missing_or_unresolved": missing,
        "status": "review_required" if missing else "no_gaps_found",
    }


@mcp.tool()
def calculate_and_post_division_order(
    owner_id: str,
    tract_id: str,
    lease_royalty: float,
    tract_share: float,
) -> dict[str, Any]:
    """Calculate NRI and commit the confirmed result to the ERP ledger."""
    if not isinstance(owner_id, str) or not owner_id.strip():
        return {"error": "owner_id is required."}
    if not isinstance(tract_id, str) or not tract_id.strip():
        return {"error": "tract_id is required."}
    try:
        lease_royalty = float(lease_royalty)
        tract_share = float(tract_share)
        if not 0 <= lease_royalty <= 1 or not 0 <= tract_share <= 1:
            return {
                "error": "lease_royalty and tract_share must be decimals between 0 and 1."
            }
        nri = lease_royalty * tract_share
    except (TypeError, ValueError) as error:
        return {"error": f"Division order inputs are invalid: {error}"}

    posted_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    try:
        with sqlite3.connect(database_path()) as connection:
            cursor = connection.execute(
                """
                INSERT INTO division_order_ledger
                (tract_id, owner_id, lease_royalty, tract_share, nri, status, posted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    tract_id.strip(),
                    owner_id.strip(),
                    lease_royalty,
                    tract_share,
                    nri,
                    "posted",
                    posted_at,
                ),
            )
            transaction_id = cursor.lastrowid
    except sqlite3.Error as error:
        return {"error": f"Division order was not committed: {error}"}
    return {
        "transaction_id": transaction_id,
        "status": "posted",
        "tract_id": tract_id.strip(),
        "owner_id": owner_id.strip(),
        "lease_royalty": lease_royalty,
        "tract_share": tract_share,
        "nri": nri,
        "posted_at": posted_at,
    }


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
