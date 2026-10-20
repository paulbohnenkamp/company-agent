from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal


RequestType = Literal["Hardware", "Software", "Access", "Other"]


@dataclass(frozen=True)
class RawRequest:
    employeeName: str
    requestType: RequestType
    description: str
    isUrgent: bool


NormalizedRequest = RawRequest


def normalize_request(input: RawRequest) -> NormalizedRequest:
    normalized = RawRequest(
        employeeName=input.employeeName.strip(),
        requestType=input.requestType,
        description=input.description.strip(),
        isUrgent=input.isUrgent,
    )

    if len(normalized.employeeName) == 0:
        raise ValueError("employeeName is required")
    if len(normalized.description) == 0:
        raise ValueError("description is required")
    if normalized.requestType not in {"Hardware", "Software", "Access", "Other"}:
        raise ValueError("requestType must be Hardware, Software, Access, or Other")
    if not isinstance(normalized.isUrgent, bool):
        raise ValueError("isUrgent must be a Boolean")

    return normalized


def service_request_id_from_sharepoint_item_id(item_id: int) -> str:
    if isinstance(item_id, bool) or not isinstance(item_id, int) or item_id < 1:
        raise ValueError("SharePoint item ID must be a positive integer")
    return f"SR-{item_id:03d}"


def main() -> None:
    example = RawRequest(
        employeeName="  Alex Morgan ",
        requestType="Access",
        description="  Need access to the customer support portal. ",
        isUrgent=False,
    )
    print(json.dumps(asdict(normalize_request(example)), indent=2))


if __name__ == "__main__":
    main()
