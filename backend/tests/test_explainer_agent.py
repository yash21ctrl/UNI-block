"""
Unit Tests for Explainer Agent (Phase 4 Explainability & Counterfactuals).
Tests:
- Natural language generation for Priority decisions (SHAP conversion)
- Block level justification ("Why this time?", "Why fused?")
- Plan level executive summary & AI confidence percent
- Counterfactual impact simulation ("What if I move it?")
"""

from datetime import datetime, timedelta, timezone
import pytest

from app.agents.explainer_agent import ExplainerAgent
from app.schemas.agent_schemas import OptimizedBlock, OptimizedPlan


@pytest.fixture
def explainer() -> ExplainerAgent:
    return ExplainerAgent()


def test_explain_priority_with_shap(explainer: ExplainerAgent):
    priority_decision = {
        "priority_score": 88.5,
        "top_features": [
            {"feature": "overdue_days", "shap_value": 14.2},
            {"feature": "traffic_density", "shap_value": 11.5},
            {"feature": "severity", "shap_value": 8.0},
        ],
    }

    text = explainer.explain_priority(priority_decision)
    assert "88.5" in text
    assert "overdue days" in text
    assert "+14.2" in text


def test_explain_block_justifications(explainer: ExplainerAgent):
    now = datetime.now(timezone.utc).replace(hour=2, minute=0, second=0, microsecond=0)
    block = OptimizedBlock(
        block_id="BLK-101",
        section="NDLS-AGC",
        department="Engineering + Signal & Telecom",
        scheduled_start=now,
        scheduled_end=now + timedelta(minutes=180),
        duration_minutes=180,
        priority_score=85.0,
        task_ids=[1, 2],
        downtime_saved_minutes=90,
    )

    explanation = explainer.explain_block(block)
    assert explanation["block_id"] == "BLK-101"
    assert "night maintenance window" in explanation["why_this_time"]
    assert "Integrated Block" in explanation["why_fused"]
    assert explanation["downtime_saved_minutes"] == 90


def test_explain_plan_confidence_and_summary(explainer: ExplainerAgent):
    plan = OptimizedPlan(
        plan_id="PLAN-EXP-001",
        section="NDLS-AGC",
        blocks=[],
        total_tasks=20,
        scheduled_tasks=18,
        unscheduled_tasks=2,
        total_downtime_minutes=1800,
        fusion_count=4,
        fusion_benefit_minutes=600,
        solve_status="OPTIMAL",
        solve_time_ms=45.0,
        objective_breakdown={"profile": "Balanced"},
    )

    summary = explainer.explain_plan(plan, tasks=[])
    assert summary["plan_id"] == "PLAN-EXP-001"
    assert summary["ai_confidence_percent"] >= 70.0
    assert "Optimized" in summary["executive_summary"]
    assert "Balanced" in summary["profile_tradeoff"]


def test_compute_counterfactual_impact(explainer: ExplainerAgent):
    now = datetime.now(timezone.utc).replace(hour=2, minute=0, second=0, microsecond=0)
    block = OptimizedBlock(
        block_id="BLK-CF-01",
        section="NDLS-AGC",
        department="Engineering",
        scheduled_start=now,
        scheduled_end=now + timedelta(minutes=120),
        duration_minutes=120,
        priority_score=80.0,
    )

    timetable = [
        {
            "train_number": "20802",
            "train_name": "Vande Bharat Express",
            "train_type": "VANDE_BHARAT",
            "departure_time": now + timedelta(hours=4),
            "arrival_time": now + timedelta(hours=4, minutes=45),
        }
    ]

    # Shift block by +4 hours (which places it right on top of Vande Bharat)
    cf = explainer.compute_counterfactual_impact(block, time_shift_minutes=240, timetable=timetable)
    assert cf["is_feasible"] is False
    assert cf["conflicts_induced_count"] >= 1
    assert any("Vande Bharat" in t for t in cf["affected_trains"])
