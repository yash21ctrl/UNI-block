"""
Unit Tests for Priority Agent.
Verifies urgency scoring, SHAP explainability generation,
inference latency (< 50ms), and risk categorization.
"""

import time
from app.agents.priority_agent import PriorityAgent


def test_priority_agent_scoring_and_shap() -> None:
    """Tests single task scoring and TreeSHAP attribution."""
    agent = PriorityAgent()

    sample_task = {
        "id": 999,
        "severity": 5,
        "overdue_days": 4,
        "criticality": 5,
        "traffic_density": 55.0,
        "duration_minutes": 240,
        "needs_power_block": False,
    }

    t0 = time.perf_counter()
    decision = agent.score(sample_task)
    latency_ms = (time.perf_counter() - t0) * 1000

    assert 0.0 <= decision.priority_score <= 100.0
    assert decision.priority_score >= 80.0  # High severity + critical asset = high urgency
    assert len(decision.top_features) > 0
    assert len(decision.explanation_text) > 10
    assert latency_ms < 50.0, f"Inference latency {latency_ms:.2f}ms exceeded 50ms SLA"


def test_priority_agent_batch_scoring() -> None:
    """Tests batch scoring throughput."""
    agent = PriorityAgent()

    tasks = [
        {"id": i, "severity": 3, "overdue_days": 1, "criticality": 3, "traffic_density": 40.0}
        for i in range(10)
    ]

    decisions = agent.score_batch(tasks)
    assert len(decisions) == 10
    for d in decisions:
        assert 0.0 <= d.priority_score <= 100.0


def test_priority_agent_explain() -> None:
    """Tests explain() output contract."""
    agent = PriorityAgent()

    sample_task = {
        "id": 555,
        "severity": 4,
        "overdue_days": 2,
        "criticality": 4,
        "traffic_density": 45.0,
        "duration_minutes": 180,
    }

    explanation = agent.explain(sample_task)
    assert explanation.task_id == 555
    assert explanation.risk_tier in ("CRITICAL", "HIGH", "MEDIUM", "ROUTINE")
    assert len(explanation.natural_language_explanation) > 0
    assert len(explanation.shap_contributions) > 0
