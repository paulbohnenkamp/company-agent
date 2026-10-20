from scripts.render_pipeline_card import build_pipeline_card


def test_pipeline_card_renders_real_screening_result() -> None:
    card = build_pipeline_card("Station 4")
    facts = card["body"][1]["facts"]

    assert card["version"] == "1.5"
    assert {fact["title"]: fact["value"] for fact in facts}["Station"] == "STATION-04"
    assert "HIGH PRIORITY WARNING" in card["body"][2]["text"]
    assert "170.0 PSI" in card["body"][2]["text"]


def test_pipeline_card_preserves_lookup_error(monkeypatch) -> None:
    from scripts import render_pipeline_card

    monkeypatch.setattr(
        render_pipeline_card,
        "get_scada_tags",
        lambda station_id: {"error": "No telemetry found."},
    )
    monkeypatch.setattr(
        render_pipeline_card,
        "check_phmsa_guidelines",
        lambda telemetry: "Error: telemetry lookup failed: No telemetry found.",
    )

    card = render_pipeline_card.build_pipeline_card("Station 4")

    assert "No telemetry found." in card["body"][1]["text"]
    assert "review required" in card["body"][3]["text"]
