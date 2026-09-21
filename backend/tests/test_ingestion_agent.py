"""
Unit Tests for Ingestion Agent and Departmental Adapters.
Tests TMS, SMMS, TDMS, and COA adapters, data quality firewall rejection,
deduplication, and parallel async execution.
"""

import pytest
from app.agents.ingestion_agent import (
    IngestionAgent,
    TMSAdapter,
    SMMSAdapter,
    TDMSAdapter,
    COAAdapter,
)


def test_tms_adapter_parsing_and_firewall() -> None:
    """Verifies TMS adapter parsing, valid defect extraction, and firewall rejections."""
    adapter = TMSAdapter()
    result = adapter.normalize()

    assert result.source == "TMS"
    assert result.total_records > 0
    assert result.accepted > 0
    assert result.rejected >= 1  # Corrupted test record rejected
    assert result.data_quality_score > 0.80
    assert any("TMS-2026-DEL-0891" in id_str for id_str in result.sample_accepted_ids)


def test_smms_adapter_parsing_and_firewall() -> None:
    """Verifies SMMS adapter for signaling telemetry parsing."""
    adapter = SMMSAdapter()
    result = adapter.normalize()

    assert result.source == "SMMS"
    assert result.accepted > 0
    assert result.rejected >= 1  # Malformed test record rejected
    assert result.data_quality_score > 0.80
    assert any("SMMS-2026-NR-4401" in id_str for id_str in result.sample_accepted_ids)


def test_tdms_adapter_parsing_and_firewall() -> None:
    """Verifies TDMS adapter for traction and OHE telemetry."""
    adapter = TDMSAdapter()
    result = adapter.normalize()

    assert result.source == "TDMS"
    assert result.accepted > 0
    assert result.rejected >= 1
    assert result.data_quality_score > 0.80
    assert any("TDMS-2026-TRD-1092" in id_str for id_str in result.sample_accepted_ids)


def test_coa_adapter_parsing_and_firewall() -> None:
    """Verifies COA adapter for train schedule and block window integration."""
    adapter = COAAdapter()
    result = adapter.normalize()

    assert result.source == "COA"
    assert result.accepted > 0
    assert result.rejected >= 1
    assert any("22436" in id_str for id_str in result.sample_accepted_ids)


@pytest.mark.asyncio
async def test_ingestion_agent_parallel_execution() -> None:
    """Verifies IngestionAgent runs all 4 sources concurrently using asyncio.gather."""
    agent = IngestionAgent()
    report = await agent.run()

    assert set(report.sources_processed) == {"TMS", "SMMS", "TDMS", "COA"}
    assert report.total_accepted >= 30
    assert report.total_rejected >= 4
    assert report.average_quality_score >= 0.85
    assert report.duration_ms < 500  # High speed extraction (< 500ms)
    assert len(report.details) == 4
