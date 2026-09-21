"""
Integration Tests for Multi-Agent FastAPI Endpoints (/api/v1/agents).
Tests HTTP routing, request parsing, response schemas, and orchestrator execution.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.defect import Defect
from app.models.maintenance import MaintenanceTask
from app.models.block_plan import BlockPlan
from app.models.enums import Department, BlockType, PlanType, PlanStatus
from datetime import datetime, timezone, timedelta


def test_api_agent_ingest(client: TestClient) -> None:
    """Tests POST /api/v1/agents/ingest endpoint."""
    response = client.post("/api/v1/agents/ingest", json={"sources": ["TMS", "SMMS", "TDMS", "COA"]})
    assert response.status_code == 200
    data = response.json()
    assert "sources_processed" in data
    assert len(data["sources_processed"]) == 4
    assert data["total_accepted"] > 0
    assert data["average_quality_score"] > 0.80


def test_api_priority_train(client: TestClient) -> None:
    """Tests POST /api/v1/agents/priority/train endpoint."""
    response = client.post("/api/v1/agents/priority/train?limit=1000")
    assert response.status_code == 200
    data = response.json()
    assert data["r2_score"] >= 0.90
    assert data["model_version"] == "priority_xgb_v1.0"


def test_api_priority_score_payload(client: TestClient) -> None:
    """Tests POST /api/v1/agents/priority/score with ad-hoc payload."""
    payload = {
        "task_payload": {
            "id": 888,
            "severity": 5,
            "overdue_days": 3,
            "criticality": 5,
            "traffic_density": 55.0,
            "duration_minutes": 210,
        }
    }
    response = client.post("/api/v1/agents/priority/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == 888
    assert 0.0 <= data["priority_score"] <= 100.0
    assert len(data["top_features"]) > 0
    assert len(data["explanation_text"]) > 0


def test_api_priority_score_and_explain_by_db_id(client: TestClient, db_session: Session) -> None:
    """Tests scoring and explaining an existing DB task by task_id."""
    corridor = Corridor(section_code="NDLS-AGC", section_name="New Delhi - Agra", total_km=195.0)
    db_session.add(corridor)
    db_session.commit()

    asset = Asset(
        code="AST-NDLS-AGC-TRK-777",
        type="Turnout",
        department=Department.ENGINEERING,
        section="NDLS-AGC",
        corridor_id=corridor.id,
        km_from=30.0,
        km_to=30.2,
        criticality=4,
        traffic_density=48.0,
    )
    db_session.add(asset)
    db_session.commit()

    defect = Defect(
        asset_id=asset.id,
        source_system="TMS",
        defect_type="Rail Fracture / Internal Flaw",
        severity=5,
        overdue_days=2,
        description="Crack detected",
        estimated_duration_minutes=180,
    )
    db_session.add(defect)
    db_session.commit()

    task = MaintenanceTask(
        defect_id=defect.id,
        asset_id=asset.id,
        corridor_id=corridor.id,
        department=Department.ENGINEERING,
        task_type="Through Rail Renewal",
        priority_score=0.0,
        duration_minutes=180,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # 1. Score by ID
    response = client.post("/api/v1/agents/priority/score", json={"task_id": task.id})
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task.id
    assert data["priority_score"] > 70.0

    # 2. Batch score
    b_response = client.post("/api/v1/agents/priority/score-batch", json={"task_ids": [task.id]})
    assert b_response.status_code == 200
    b_data = b_response.json()
    assert b_data["total_scored"] == 1

    # 3. Explain
    exp_response = client.get(f"/api/v1/agents/priority/explain/{task.id}")
    assert exp_response.status_code == 200
    exp_data = exp_response.json()
    assert exp_data["task_id"] == task.id
    assert exp_data["risk_tier"] in ("CRITICAL", "HIGH", "MEDIUM", "ROUTINE")
    assert len(exp_data["shap_contributions"]) > 0


def test_api_orchestrator_pipeline_endpoint(client: TestClient, db_session: Session) -> None:
    """Tests POST /api/v1/agents/pipeline/priority orchestration execution."""
    corridor = Corridor(section_code="AGC-JHS", section_name="Agra - Jhansi", total_km=215.0)
    db_session.add(corridor)
    db_session.commit()

    asset = Asset(
        code="AST-AGC-JHS-TRD-888",
        type="OHE",
        department=Department.TRACTION_DISTRIBUTION,
        section="AGC-JHS",
        corridor_id=corridor.id,
        km_from=10.0,
        km_to=11.0,
    )
    db_session.add(asset)
    db_session.commit()

    task = MaintenanceTask(
        asset_id=asset.id,
        corridor_id=corridor.id,
        department=Department.TRACTION_DISTRIBUTION,
        task_type="OHE Sagging Repair",
        priority_score=0.0,
        duration_minutes=150,
    )
    db_session.add(task)
    db_session.commit()

    now = datetime.now(timezone.utc)
    plan = BlockPlan(
        plan_type=PlanType.WEEKLY,
        task_id=task.id,
        section="AGC-JHS",
        department=Department.TRACTION_DISTRIBUTION,
        block_type=BlockType.POWER_BLOCK,
        scheduled_start=now,
        scheduled_end=now + timedelta(hours=3),
    )
    db_session.add(plan)
    db_session.commit()

    response = client.post("/api/v1/agents/pipeline/priority?limit=10&run_ingestion=true")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["tasks_scored"] >= 1
    assert data["decisions_persisted"] >= 1


def test_api_agents_status(client: TestClient) -> None:
    """Tests GET /api/v1/agents/status verifying all 6 specialized AI agents."""
    response = client.get("/api/v1/agents/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["total_agents"] == 6
    assert data["active_agents"] == 6
    assert len(data["agents"]) == 6

    expected_ids = {"guardian", "priority", "fusion", "optimizer", "interlocking", "emergency"}
    actual_ids = {a["id"] for a in data["agents"]}
    assert expected_ids == actual_ids

    for agent in data["agents"]:
        assert agent["status"] == "ACTIVE"
        assert agent["verified"] is True
        assert len(agent["capabilities"]) > 0
        assert "metrics" in agent

