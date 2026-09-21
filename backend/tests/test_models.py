"""
Unit Tests for RailBlock AI SQLAlchemy 2.0 ORM Models.
Verifies table creation, field types, relationships, enums, and foreign key integrity.
"""

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.enums import (
    Department,
    SourceSystem,
    DefectStatus,
    BlockType,
    PlanType,
    PlanStatus,
    UserRole,
    TrainType,
)
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.defect import Defect
from app.models.maintenance import MaintenanceTask
from app.models.timetable import TrainTimetable
from app.models.block_plan import BlockPlan
from app.models.user import User
from app.models.audit import AuditLog
from app.models.ai_decision import AIDecision


def test_create_corridor(db_session: Session) -> None:
    """Tests creating and querying an Indian Railways corridor."""
    corridor = Corridor(
        section_code="NDLS-AGC",
        section_name="New Delhi - Agra Cantt",
        total_km=195.0,
        daily_trains=140,
        goods_forecast=40,
        block_window_start="00:00:00",
        block_window_end="05:00:00",
        max_concurrent_blocks=2,
        is_double_line=True,
    )
    db_session.add(corridor)
    db_session.commit()

    saved = db_session.execute(
        select(Corridor).where(Corridor.section_code == "NDLS-AGC")
    ).scalar_one()

    assert saved.id is not None
    assert saved.section_name == "New Delhi - Agra Cantt"
    assert saved.total_km == 195.0
    assert saved.is_double_line is True


def test_asset_and_defect_relationship(db_session: Session) -> None:
    """Tests asset creation, defect logging, and relationship cascades."""
    corridor = Corridor(
        section_code="AGC-JHS",
        section_name="Agra Cantt - Jhansi",
        total_km=215.0,
    )
    db_session.add(corridor)
    db_session.commit()

    asset = Asset(
        code="AST-AGC-JHS-TRK-001",
        type="Track Segment",
        department=Department.ENGINEERING,
        section="AGC-JHS",
        corridor_id=corridor.id,
        km_from=12.0,
        km_to=13.0,
        criticality=5,
        traffic_density=52.4,
    )
    db_session.add(asset)
    db_session.commit()

    defect = Defect(
        asset_id=asset.id,
        source_system=SourceSystem.TMS,
        defect_type="Rail Fracture / Internal Transverse Flaw",
        severity=5,
        overdue_days=1,
        status=DefectStatus.REPORTED,
        description="USFD detected internal transverse defect at km 12.4.",
        estimated_duration_minutes=240,
    )
    db_session.add(defect)
    db_session.commit()

    # Query defect through asset relationship
    queried_asset = db_session.get(Asset, asset.id)
    assert queried_asset is not None
    assert len(queried_asset.defects) == 1
    assert queried_asset.defects[0].defect_type == "Rail Fracture / Internal Transverse Flaw"
    assert queried_asset.defects[0].severity == 5


def test_maintenance_task_and_block_plan(db_session: Session) -> None:
    """Tests maintenance task creation and block plan assignment."""
    corridor = Corridor(section_code="JHS-BPL", section_name="Jhansi - Bhopal", total_km=292.0)
    db_session.add(corridor)
    db_session.commit()

    asset = Asset(
        code="AST-JHS-BPL-TRD-002",
        type="OHE Mast Cantilever",
        department=Department.TRACTION_DISTRIBUTION,
        section="JHS-BPL",
        corridor_id=corridor.id,
        km_from=55.0,
        km_to=55.1,
        criticality=4,
        traffic_density=48.0,
    )
    db_session.add(asset)
    db_session.commit()

    task = MaintenanceTask(
        asset_id=asset.id,
        corridor_id=corridor.id,
        department=Department.TRACTION_DISTRIBUTION,
        task_type="Cantilever Assembly Adjustment",
        priority_score=87.5,
        duration_minutes=180,
        needs_power_block=True,
        needs_traffic_block=False,
        can_combine=True,
        resources_json={"machinery": ["Tower Wagon TW-801"], "gang": 8},
        is_scheduled=True,
    )
    db_session.add(task)
    db_session.commit()

    now = datetime.now(timezone.utc)
    block_plan = BlockPlan(
        plan_type=PlanType.WEEKLY,
        task_id=task.id,
        section="JHS-BPL",
        corridor_id=corridor.id,
        department=Department.TRACTION_DISTRIBUTION,
        block_type=BlockType.POWER_BLOCK,
        scheduled_start=now + timedelta(days=1),
        scheduled_end=now + timedelta(days=1, hours=3),
        combined_with_json=[],
        conflict_score=0.02,
        downtime_minutes=180,
        status=PlanStatus.PROPOSED,
        ai_confidence=0.96,
    )
    db_session.add(block_plan)
    db_session.commit()

    assert block_plan.id is not None
    assert block_plan.task.task_type == "Cantilever Assembly Adjustment"
    assert block_plan.block_type == BlockType.POWER_BLOCK


def test_train_timetable_entry(db_session: Session) -> None:
    """Tests train timetable entity creation with Indian Railways parameters."""
    corridor = Corridor(section_code="NDLS-AGC", section_name="New Delhi - Agra", total_km=195.0)
    db_session.add(corridor)
    db_session.commit()

    now = datetime.now(timezone.utc)
    train = TrainTimetable(
        train_number="12002",
        train_name="Bhopal Shatabdi Express",
        section="NDLS-AGC",
        corridor_id=corridor.id,
        arrival_time=now,
        departure_time=now + timedelta(hours=2),
        train_type=TrainType.SHATABDI,
        priority=8,
        day_of_week=0,
    )
    db_session.add(train)
    db_session.commit()

    queried_train = db_session.execute(
        select(TrainTimetable).where(TrainTimetable.train_number == "12002")
    ).scalar_one()

    assert queried_train.train_name == "Bhopal Shatabdi Express"
    assert queried_train.train_type == TrainType.SHATABDI
    assert queried_train.priority == 8


def test_user_and_audit_and_ai_decision(db_session: Session) -> None:
    """Tests user creation, audit trail generation, and AI explainability records."""
    user = User(
        name="Chief Controller Sharma",
        email="cc.sharma@railnet.gov.in",
        hashed_password="mock_hash_string",
        role=UserRole.CHIEF_CONTROLLER,
        can_approve=True,
    )
    db_session.add(user)
    db_session.commit()

    corridor = Corridor(section_code="NDLS-GZB", section_name="NDLS - Ghaziabad", total_km=25.0)
    db_session.add(corridor)
    db_session.commit()

    asset = Asset(
        code="AST-NDLS-GZB-SNT-001",
        type="Signal",
        department=Department.SIGNAL_TELECOM,
        section="NDLS-GZB",
        corridor_id=corridor.id,
        km_from=5.0,
        km_to=5.1,
    )
    db_session.add(asset)
    db_session.commit()

    task = MaintenanceTask(
        asset_id=asset.id,
        corridor_id=corridor.id,
        department=Department.SIGNAL_TELECOM,
        task_type="Color Light Signal Replacement",
        priority_score=75.0,
    )
    db_session.add(task)
    db_session.commit()

    now = datetime.now(timezone.utc)
    plan = BlockPlan(
        task_id=task.id,
        section="NDLS-GZB",
        department=Department.SIGNAL_TELECOM,
        block_type=BlockType.INTEGRATED_BLOCK,
        scheduled_start=now,
        scheduled_end=now + timedelta(hours=2),
    )
    db_session.add(plan)
    db_session.commit()

    ai_decision = AIDecision(
        plan_id=plan.id,
        agent_name="PriorityAgent",
        decision_json={"algorithm": "XGBoost + SHAP"},
        explanation_text="Priority calculated based on high signal failure penalty.",
        shap_values_json={"criticality": 0.4, "headway_risk": 0.3},
        confidence=0.95,
    )
    db_session.add(ai_decision)

    audit = AuditLog(
        user_id=user.id,
        action="APPROVE_BLOCK_PLAN",
        entity_type="block_plans",
        entity_id=plan.id,
        before_json={"status": "PROPOSED"},
        after_json={"status": "APPROVED"},
    )
    db_session.add(audit)
    db_session.commit()

    assert ai_decision.id is not None
    assert audit.id is not None
    assert audit.user.name == "Chief Controller Sharma"
    assert ai_decision.block_plan.id == plan.id
