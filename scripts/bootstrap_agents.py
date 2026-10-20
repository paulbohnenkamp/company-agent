from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path


ROOT = Path.cwd()


def instructions(source: str) -> str:
    match = re.search(r"^instructions: \|\n((?: {2,}.+\n?)+)", source, re.MULTILINE)
    if match is None:
        raise ValueError("Missing instructions block in agent definition")
    return " ".join(
        re.sub(r"^ {2}", "", line)
        for line in match.group(1).splitlines()
    ).strip()


def display_name(directory: str) -> str:
    return " ".join(
        part.upper() if part in {"hr", "it"} else part.capitalize()
        for part in directory.split("-")
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--environment", required=True)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> None:
    arguments = parse_args()
    environment = arguments.environment
    dry_run = arguments.dry_run

    list_result = subprocess.run(
        ["pac", "copilot", "list", "--environment", environment],
        check=True,
        capture_output=True,
        text=True,
    )
    existing = {
        line.strip() for line in list_result.stdout.splitlines() if line.strip()
    }
    agent_directories = [
        "hr-agent",
        "customer-agent",
        "it-request-agent",
        "company-agent",
    ]

    for directory in agent_directories:
        name = display_name(directory)
        source_path = ROOT / "agents" / directory / "agent.yaml"
        workspace_path = ROOT / "deployment" / "pac" / "bootstrap" / directory
        source = source_path.read_text()

        if any(line.startswith(f"{name} ") for line in existing):
            print(f"SKIP existing: {name}")
            continue

        command = [
            "pac",
            "copilot",
            "init",
            "--name",
            name,
            "--publisher-prefix",
            "nstar",
            "--project-dir",
            str(workspace_path),
            "--authoring-mode",
            "cli-copilot",
            "--environment",
            environment,
            "--instructions",
            instructions(source),
        ]

        if dry_run:
            print(f"CREATE missing: {name}")
            continue

        if workspace_path.exists() and any(workspace_path.iterdir()):
            raise RuntimeError(
                f"Refusing to initialize non-empty workspace: {workspace_path}"
            )
        workspace_path.mkdir(parents=True, exist_ok=True)
        subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
