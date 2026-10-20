import json
from pathlib import Path

import pytest

from it_request_workflow.normalize import (
    RawRequest,
    normalize_request,
    service_request_id_from_sharepoint_item_id,
)


def test_normalizes_an_it_request_without_changing_controlled_values() -> None:
    assert normalize_request(
        RawRequest(
            employeeName="  Alex Morgan ",
            requestType="Access",
            description="  Need portal access. ",
            isUrgent=True,
        )
    ) == RawRequest(
        employeeName="Alex Morgan",
        requestType="Access",
        description="Need portal access.",
        isUrgent=True,
    )


def test_rejects_incomplete_agent_flow_input() -> None:
    with pytest.raises(ValueError, match="employeeName is required"):
        normalize_request(
            RawRequest(
                employeeName="   ",
                requestType="Access",
                description="Need portal access.",
                isUrgent=False,
            )
        )


def test_keeps_the_sharepoint_id_convention_deterministic() -> None:
    assert service_request_id_from_sharepoint_item_id(4) == "SR-004"
    with pytest.raises(ValueError, match="positive integer"):
        service_request_id_from_sharepoint_item_id(0)


def test_describes_the_separate_copilot_studio_agent_flow_contract() -> None:
    contract_path = Path("it-request-workflow/agent-flow.contract.json")
    contract = json.loads(contract_path.read_text())
    assert list(contract["trigger"]["inputs"]) == [
        "employeeName",
        "requestType",
        "description",
        "isUrgent",
    ]
    assert contract["resourcePolicy"]["doNotModifyFormsFlow"] is True
    assert contract["verification"]["tenantStatus"] == "not-verified"
