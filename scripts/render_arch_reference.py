#!/usr/bin/env python3
"""Render the tracked Company Agent architecture reference artifacts."""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


def run(command: list[str], cwd: Path) -> None:
    subprocess.run(command, cwd=cwd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("docs/arch"))
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    output = (root / args.output).resolve()
    stem = "Company_Agent_Arch_Reference"
    output.mkdir(parents=True, exist_ok=True)

    run(
        [
            "npx",
            "--yes",
            "@mermaid-js/mermaid-cli",
            "-i",
            f"{stem}.mmd",
            "-o",
            f"{stem}.svg",
        ],
        output,
    )
    run(
        [
            "npx",
            "--yes",
            "@mermaid-js/mermaid-cli",
            "-i",
            f"{stem}.mmd",
            "-o",
            f"{stem}.png",
        ],
        output,
    )
    run(
        [
            "pandoc",
            f"{stem}.md",
            "-o",
            f"{stem}.html",
            "--standalone",
            "--metadata",
            f"title={stem}",
        ],
        output,
    )
    run(["weasyprint", f"{stem}.html", f"{stem}.pdf"], output)

    expected = ["md", "mmd", "html", "pdf", "png", "svg"]
    missing = [suffix for suffix in expected if not (output / f"{stem}.{suffix}").exists()]
    if missing:
        raise SystemExit(f"Missing rendered artifacts: {', '.join(missing)}")


if __name__ == "__main__":
    main()
