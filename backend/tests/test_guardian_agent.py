"""
Unit Tests for Guardian Agent (Phase 4 Safety Firewall).
Tests:
- 100% blocking of Rajdhani / Shatabdi / Vande Bharat headway collisions
- Critical defect auto-escalation (USFD and rail fractures forced to Priority 99.5)
- Traction Distribution (TRD) power block safety enforcement
- Single-line corridor non-concurrency protection
"""

from datetime import datetime, timedelta, timezone
import pytest

from app.agents.guardian_agent import GuardianAgent
from app.models.enums import Department, BlockType
from app.schemas.agent_schemas import OptimizedBlock, OptimizedPlan


@pytest.fixture
def guardian() -> GuardianAgent:
    return GuardianAgent()


def test_input_validation_escalates_rail_fracture(guardian: GuardianAgent):
    tasks = [
        {
            "id": 101,
            "section": "NDLS-AGC",
            "department": Department.ENGINEERING.value,
            "task_type": "Ultrasonic Rail Fracture Detected",
            "priority_score": 65.0,
            "duration_minutes": 120,
            "needs_power_block": False,
        }
    ]

    is_safe, audit = guardian.validate_inputs(tasks)
    assert tasks[0]["priority_score"] == 99.5
    assert tasks[0]["is_emergency"] is True
    assert any("AUTO-ESCALATED" in a for a in audit)


def test_input_validation_enforces_trd_power_block(guardian: GuardianAgent):
    tasks = [
        {
            "id": 102,
            "section": "NDLS-AGC",
            "department": Department.TRACTION_DISTRIBUTION.value,
            "task_type": "OHE Catenary Inspection",
            "priority_score": 75.0,
            "duration_minutes": 150,
            "needs_power_block": False,  # Safety defect: should be True
        }
    ]

    is_safe, audit = guardian.validate_inputs(tasks)
    assert tasks[0]["needs_power_block"] is True
    assert any("needs_power_block=True" in a for a in audit)


def test_guardian_blocks_premium_train_collision(guardian: GuardianAgent):
    now = datetime.now(timezone.utc).replace(hour=2, minute=0, second=0, microsecond=0)

    # Simulated conflicting schedule block
    block = OptimizedBlock(
        block_id="BLK-TEST-BREACH",
        section="NDLS-AGC",
        department="Engineering",
        scheduled_start=now,
        scheduled_end=now + timedelta(minutes=180),
        duration_minutes=180,
        priority_score=80.0,
    )

    plan = OptimizedPlan(
        plan_id="PLAN-TEST",
        section="NDLS-AGC",
        blocks=[block],
        total_tasks=1,
        scheduled_tasks=1,
        unscheduled_tasks=0,
        total_downtime_minutes=180,
        fusion_count=0,
        fusion_benefit_minutes=0,
        solve_status="OPTIMAL",
        solve_time_ms=50.0,
    )

    # Timetable with Mumbai Rajdhani passing right through the block window
    timetable = [
        {
            "train_number": "12952",
            "train_name": "Mumbai Rajdhani Express",
            "train_type": "RAJDHANI",
            "section": "NDLS-AGC",
            "priority": 10,
            "departure_time": now + timedelta(minutes=60),
            "arrival_time": now + timedelta(minutes=90),
        }
    ]

    corridors = [
        {
            "section_code": "NDLS-AGC",
            "max_concurrent_blocks": 2,
            "is_double_line": True,
        }
    ]

    is_safe, violations = guardian.validate_plan(plan, timetable, corridors)
    # MUST reject the plan
    assert is_safe is False
    assert len(violations) >= 1
    assert violations[0]["rule"] == "PREMIUM_TRAIN_HEADWAY_BREACH"
    assert "Mumbai Rajdhani Express" in violations[0]["message"]


def test_guardian_protects_single_line_non_concurrency(guardian: GuardianAgent):
    now = datetime.now(timezone.utc).replace(hour=1, minute=0, second=0, microsecond=0)

    # Two concurrent blocks on a single-line section
    blocks = [
        OptimizedBlock(
            block_id=f"BLK-SL-{i}",
            section="SINGLE-LINE-SEC",
            department="Engineering",
            scheduled_start=now,
            scheduled_end=now + timedelta(minutes=120),
            duration_minutes=120,
            priority_score=75.0,
        )
        for i in range(1, 3)
    ]

    plan = OptimizedPlan(
        plan_id="PLAN-SL-TEST",
        section="SINGLE-LINE-SEC",
        blocks=blocks,
        total_tasks=2,
        scheduled_tasks=2,
        unscheduled_tasks=0,
        total_downtime_minutes=240,
        fusion_count=0,
        fusion_benefit_minutes=0,
        solve_status="OPTIMAL",
        solve_time_ms=30.0,
    )

    corridors = [
        {
            "section_code": "SINGLE-LINE-SEC",
            "max_concurrent_blocks": 1,
            "is_double_line": False,  # Single line!
        }
    ]

    is_safe, violations = guardian.validate_plan(plan, timetable=[], corridors=corridors)
    assert is_safe is False
    assert any(v["rule"] == "SINGLE_LINE_COLLISION" for v in violations)


def test_sanitize_emergency_task(guardian: GuardianAgent):
    defect = {
        "id": 777,
        "section": "NDLS-AGC",
        "defect_type": "Transverse Rail Fracture at Weld",
        "estimated_duration_minutes": 120,
        "needs_power_block": False,
    }

    sanitized = guardian.sanitize_emergency_task(defect)
    assert sanitized["id"] == 777
    assert sanitized["priority_score"] == 99.5
    assert sanitized["severity"] == 5
    assert sanitized["can_combine"] is False
    assert "EMERGENCY" in sanitized["task_type"]
