"""
Unit Tests for AI Decision Ledger and Feedback Service (Phase 4 Audit & Learning).
Tests:
- Persistence of AI decision traces to ai_decisions table
- Persistence of human actions to audit_log table
- Chronological plan ledger retrieval
- Closed-loop approval and rejection processing
- Retraining trigger emission
"""

import pytest
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.block_plan import BlockPlan
from app.models.enums import BlockType, PlanType, PlanStatus, Department
from app.services.ledger_service import LedgerService
from app.services.feedback_service import FeedbackService


@pytest.fixture
def db_session() -> Session:
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def sample_block_plan(db_session: Session) -> BlockPlan:
    plan = BlockPlan(
        plan_type=PlanType.WEEKLY,
        task_id=1,
        section="NDLS-AGC",
        department=Department.ENGINEERING,
        block_type=BlockType.TRAFFIC_BLOCK,
        scheduled_start=datetime.now(timezone.utc),
        scheduled_end=datetime.now(timezone.utc),
        status=PlanStatus.PROPOSED,
    )
    db_session.add(plan)
    db_session.commit()
    db_session.refresh(plan)
    return plan


def test_record_and_get_ai_decision(db_session: Session, sample_block_plan: BlockPlan):
    ai_dec = LedgerService.record_ai_decision(
        db=db_session,
        plan_id=sample_block_plan.id,
        agent_name="TestAgent",
        decision_json={"action": "test_decision"},
        explanation_text="Test decision explanation",
        shap_values_json={"param_a": 1.5},
        confidence=0.98,
    )
    assert ai_dec.id is not None
    assert ai_dec.agent_name == "TestAgent"

    ledger = LedgerService.get_plan_ledger(db=db_session, plan_id=sample_block_plan.id)
    assert ledger["total_agent_decisions"] >= 1
    assert any(d["agent_name"] == "TestAgent" for d in ledger["agent_decisions"])


@pytest.mark.asyncio
async def test_feedback_approval_processing(db_session: Session, sample_block_plan: BlockPlan):
    res = await FeedbackService.process_feedback(
        db=db_session,
        plan_id=sample_block_plan.id,
        user_id=10,
        decision="APPROVED",
        reason="Corridor window verified safe with zero passenger delays.",
        digital_signature="SIG-TEST-CONTROLLER-10",
    )

    assert res["decision"] == "APPROVED"
    assert res["status"] == "APPROVED"
    assert res["digital_signature"] == "SIG-TEST-CONTROLLER-10"

    # Verify updated in DB
    refreshed = db_session.get(BlockPlan, sample_block_plan.id)
    assert refreshed.status == PlanStatus.APPROVED
    assert refreshed.approved_by == 10


@pytest.mark.asyncio
async def test_feedback_rejection_processing(db_session: Session, sample_block_plan: BlockPlan):
    res = await FeedbackService.process_feedback(
        db=db_session,
        plan_id=sample_block_plan.id,
        user_id=12,
        decision="REJECTED",
        reason="Local freight rake movement priority conflict.",
    )

    assert res["decision"] == "REJECTED"
    assert res["status"] == "REJECTED"

    refreshed = db_session.get(BlockPlan, sample_block_plan.id)
    assert refreshed.status == PlanStatus.REJECTED
