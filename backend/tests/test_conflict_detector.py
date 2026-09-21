"""
Unit Tests for Conflict Detector and Schedule Validator (Phase 3 Core Brain).
Tests:
- Detection of corridor concurrency capacity breach
- Detection of protected premium train headway breach
- Output format compliance (ConflictReport and ConflictDetail)
"""

from datetime import datetime, timedelta, timezone
import pytest

from app.models.enums import BlockType
from app.schemas.agent_schemas import OptimizedBlock, ConflictReport
from app.services.conflict_detector import ConflictDetector


@pytest.fixture
def conflict_detector() -> ConflictDetector:
    return ConflictDetector()


def test_valid_blocks_pass_validation(conflict_detector: ConflictDetector, monkeypatch):
    # Mock train check to focus purely on block capacity validation
    monkeypatch.setattr(conflict_detector, "_get_trains_for_section", lambda *args: [])

    now = datetime.now(timezone.utc).replace(hour=1, minute=0, second=0, microsecond=0)
    blocks = [
        OptimizedBlock(
            block_id="BLK-001",
            section="TEST-SEC",
            department="Engineering",
            scheduled_start=now,
            scheduled_end=now + timedelta(minutes=120),
            duration_minutes=120,
            priority_score=80.0,
            confidence=0.95,
        ),
        OptimizedBlock(
            block_id="BLK-002",
            section="TEST-SEC",
            department="Signal & Telecom",
            scheduled_start=now + timedelta(minutes=130),
            scheduled_end=now + timedelta(minutes=240),
            duration_minutes=110,
            priority_score=75.0,
            confidence=0.95,
        ),
    ]

    valid_blocks, report = conflict_detector.validate_and_resolve(blocks, max_concurrent_blocks=2)
    assert report.is_valid is True
    assert report.hard_violations_count == 0


def test_capacity_exceeded_breach(conflict_detector: ConflictDetector, monkeypatch):
    monkeypatch.setattr(conflict_detector, "_get_trains_for_section", lambda *args: [])

    now = datetime.now(timezone.utc).replace(hour=1, minute=0, second=0, microsecond=0)
    # 3 overlapping blocks on section with max_concurrent_blocks = 2
    blocks = [
        OptimizedBlock(
            block_id=f"BLK-{i}",
            section="TEST-SEC",
            department="Engineering",
            scheduled_start=now,
            scheduled_end=now + timedelta(minutes=120),
            duration_minutes=120,
            priority_score=80.0,
            confidence=0.95,
        )
        for i in range(1, 4)
    ]

    valid_blocks, report = conflict_detector.validate_and_resolve(blocks, max_concurrent_blocks=2)
    assert report.is_valid is False
    assert report.hard_violations_count >= 1
    assert any(c.conflict_type == "CAPACITY_EXCEEDED" for c in report.conflicts)


def test_premium_train_breach_detected(conflict_detector: ConflictDetector, monkeypatch):
    now = datetime.now(timezone.utc).replace(hour=2, minute=0, second=0, microsecond=0)
    mock_train = [{
        "train_number": "12952",
        "train_name": "Mumbai Rajdhani Express",
        "train_type": "RAJDHANI",
        "priority": 10,
        "arrival_time": now + timedelta(minutes=45),
        "departure_time": now + timedelta(minutes=30),
    }]
    monkeypatch.setattr(conflict_detector, "_get_trains_for_section", lambda *args: mock_train)

    blocks = [
        OptimizedBlock(
            block_id="BLK-PREM-TEST",
            section="NDLS-AGC",
            department="Engineering",
            scheduled_start=now,
            scheduled_end=now + timedelta(minutes=120),
            duration_minutes=120,
            priority_score=80.0,
        )
    ]

    valid_blocks, report = conflict_detector.validate_and_resolve(blocks, max_concurrent_blocks=2)
    assert report.is_valid is False
    assert any(c.conflict_type == "TRAIN_OVERLAP" for c in report.conflicts)
