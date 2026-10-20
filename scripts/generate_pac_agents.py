from __future__ import annotations

import re
from pathlib import Path


ROOT = Path.cwd()
SOURCE_ROOT = ROOT / "agents"
WORKSPACE_ROOT = ROOT / "deployment" / "pac"


def instructions(source: str) -> str:
    lines = source.splitlines()
    try:
        start = lines.index("instructions: |") + 1
    except ValueError as error:
        raise ValueError("Missing instructions block in agent definition") from error

    block: list[str] = []
    for line in lines[start:]:
        if line == "":
            block.append(line)
            continue
        if not re.match(r"^ {2,}", line):
            break
        block.append(line)

    if not block:
        raise ValueError("Empty instructions block in agent definition")
    return "\n".join(line[2:] for line in block).strip()


def yaml_block(value: str) -> str:
    return "\n".join(f"            {line}" for line in value.split("\n"))


def display_name(directory: str) -> str:
    return " ".join(
        part.upper() if part in {"hr", "it"} else part.capitalize()
        for part in directory.split("-")
    )


def generate_agent(directory: str) -> None:
    source_path = SOURCE_ROOT / directory / "agent.yaml"
    workspace_path = WORKSPACE_ROOT / directory
    settings_path = workspace_path / "settings.mcs.yml"
    if not source_path.exists() or not settings_path.exists():
        raise FileNotFoundError(f"Expected source and PAC settings for {directory}")

    source = source_path.read_text()
    settings = settings_path.read_text().replace("\r\n", "\n")
    marker_match = re.search(r"          value: (?:\"\"|>-)[^\n]*\n", settings)
    if marker_match is None:
        raise ValueError(f"Unsupported PAC settings shape for {directory}")

    marker_end = marker_match.end()
    template_index = settings.find("template:", marker_end)
    if template_index < 0:
        raise ValueError(f"Unsupported PAC settings shape for {directory}")

    updated = (
        settings[: marker_match.start()]
        + "          value: >-\n"
        + yaml_block(instructions(source))
        + "\n"
        + settings[template_index:]
    )
    updated = re.sub(
        r"^displayName: .*?$",
        f'displayName: "{display_name(directory)}"',
        updated,
        count=1,
        flags=re.MULTILINE,
    )
    workspace_path.mkdir(parents=True, exist_ok=True)
    settings_path.write_text(updated)
    print(f"Generated {settings_path}")


def main() -> None:
    agent_directories = sorted(
        path.name for path in SOURCE_ROOT.iterdir() if path.is_dir()
    )
    for directory in agent_directories:
        generate_agent(directory)


if __name__ == "__main__":
    main()
