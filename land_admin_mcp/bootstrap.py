from __future__ import annotations

import sqlite3
from pathlib import Path


PACKAGE_DIR = Path(__file__).resolve().parent
DATA_DIR = PACKAGE_DIR / "data"
DATABASE_PATH = DATA_DIR / "land_admin_ledger.db"
CONTRACTS_DIR = DATA_DIR / "contracts"

LEASE_TEMPLATE = """Lease ID: LEASE-TX-HOU-04
Tract ID: TX-HOU-04
Effective Date: 2026-01-01
Primary Owner: Northstar Minerals LLC
Royalty: 0.1875
Tract Share: 0.5000
Bonus: 125000.00
"""


def initialize_database(database_path: Path = DATABASE_PATH) -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(database_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS title_records (
                id INTEGER PRIMARY KEY,
                tract_id TEXT NOT NULL,
                record_type TEXT NOT NULL,
                record_id TEXT NOT NULL,
                status TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS division_order_ledger (
                id INTEGER PRIMARY KEY,
                tract_id TEXT NOT NULL,
                owner_id TEXT NOT NULL,
                lease_royalty REAL NOT NULL,
                tract_share REAL NOT NULL,
                nri REAL NOT NULL,
                status TEXT NOT NULL,
                posted_at TEXT NOT NULL
            );
            DELETE FROM title_records;
            """
        )
        connection.executemany(
            "INSERT INTO title_records (tract_id, record_type, record_id, status) VALUES (?, ?, ?, ?)",
            [
                ("TX-HOU-04", "deed", "DEED-TX-HOU-04-001", "recorded"),
                ("TX-HOU-04", "probate", "PROBATE-TX-HOU-04-001", "missing"),
                ("TX-HOU-04", "assignment", "ASSIGN-TX-HOU-04-001", "recorded"),
            ],
        )


def write_contract_templates(contracts_dir: Path = CONTRACTS_DIR) -> None:
    contracts_dir.mkdir(parents=True, exist_ok=True)
    (contracts_dir / "LEASE-TX-HOU-04.txt").write_text(LEASE_TEMPLATE, encoding="utf-8")


def run_bootstrap() -> None:
    initialize_database()
    write_contract_templates()
    print(f"Initialized SQLite ledger at {DATABASE_PATH}")
    print(f"Wrote lease templates to {CONTRACTS_DIR}")


if __name__ == "__main__":
    run_bootstrap()
