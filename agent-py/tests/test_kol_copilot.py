import pytest

from kol_copilot.analysis import run_agentic_analysis
from kol_copilot.pipeline_store import load_agentic_analysis
from kol_copilot.runner import run_kol_query, voice_summary
from kol_copilot.schemas import ProtocolProfile
from kol_copilot.tools import scan_compliance


@pytest.mark.asyncio
async def test_run_kol_query_falls_back_without_openai_key(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    result = await run_kol_query(
        "Find top infectious disease KOLs for this COVID vaccine protocol.",
        user_id="user_test",
    )

    assert result.top_kols
    assert result.top_kols[0].score > 0
    assert result.protocol.indication == "COVID-19 prevention"
    assert result.compliance_notes[0].severity == "info"
    assert "fallback" in " ".join(result.audit_trail).lower()
    assert "prescribing" not in result.top_kols[0].suggested_next_action.lower()


@pytest.mark.asyncio
async def test_run_kol_query_can_return_brief_in_fallback(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    result = await run_kol_query(
        "Draft a compliant MSL pre-call brief for the top expert.",
        user_id="user_test",
    )

    assert result.msl_brief is not None
    assert result.msl_brief.suggested_questions
    assert result.msl_brief.compliance_warnings
    assert result.msl_brief.citations


def test_compliance_scan_blocks_promotional_targeting() -> None:
    notes = scan_compliance(
        "Target this physician before approval to drive commercial adoption."
    )

    assert notes[0].severity == "block"


@pytest.mark.asyncio
async def test_agentic_analysis_marks_local_fallback(monkeypatch, tmp_path) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("KOL_COPILOT_ALLOW_FALLBACK_ANALYSIS", raising=False)
    monkeypatch.setenv("KOL_COPILOT_ANALYSIS_DIR", str(tmp_path))

    profile = ProtocolProfile()
    result = await run_agentic_analysis(
        protocol=profile,
        query="Run agentic analysis for this protocol.",
        user_id="user_test",
    )

    assert result.analysis_source == "local_fallback"
    assert result.is_fallback is True
    assert result.fallback_reason == "OPENAI_API_KEY was not set."
    assert result.top_kols

    (tmp_path / f"{profile.protocol_id}.json").write_text(result.model_dump_json())
    assert load_agentic_analysis(profile.protocol_id) is None

    monkeypatch.setenv("KOL_COPILOT_ALLOW_FALLBACK_ANALYSIS", "1")
    assert load_agentic_analysis(profile.protocol_id) is not None


@pytest.mark.asyncio
async def test_voice_summary_is_concise(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    result = await run_kol_query("Who are the top KOLs?", user_id="user_test")
    summary = voice_summary(result)

    assert result.top_kols[0].name in summary
    assert len(summary.split()) < 60
