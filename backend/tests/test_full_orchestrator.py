"""
Integration Tests for Full 6-Agent Master Orchestrator Endpoints (/api/v1/orchestrator/*).
Tests:
- POST /api/v1/orchestrator/pipeline/full
- POST /api/v1/orchestrator/emergency
- POST /api/v1/orchestrator/approve/{id}
- POST /api/v1/orchestrator/reject/{id}
- GET /api/v1/orchestrator/ledger/{id}
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models.block_plan import BlockPlan
from app.models.enums import PlanType, PlanStatus, BlockType, Department


@pytest.fixture
def existing_plan_id(db_session: Session) -> int:
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
    return plan.id


def test_api_orchestrator_full_pipeline(client: TestClient):
    payload = {
        "plan_type": "WEEKLY",
        "section": "NDLS-AGC",
        "horizon_days": 7,
        "pareto_profile": "Balanced",
        "persist_to_db": True,
    }
    response = client.post("/api/v1/orchestrator/pipeline/full", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["plan_id"] is not None
    assert data["section"] == "NDLS-AGC"
    assert data["optimized_plan"] is not None
    assert data["conflict_report"] is not None
    assert data["safety_certificate"] is not None
    assert data["safety_certificate"]["certified_safe"] is True
    assert data["plan_explanation"] is not None
    assert data["plan_explanation"]["ai_confidence_percent"] >= 60.0


def test_api_orchestrator_emergency(client: TestClient):
    payload = {
        "emergency_task": {
            "id": 9991,
            "section": "NDLS-AGC",
            "department": "Engineering",
            "task_type": "Critical Ultrasonic Rail Fracture",
            "priority_score": 99.5,
            "duration_minutes": 120,
            "severity": 5,
        },
        "freeze_approved": True,
    }
    response = client.post("/api/v1/orchestrator/emergency", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["emergency_task_id"] == 9991
    assert data["solve_time_ms"] < 5000.0
    assert data["premium_trains_protected"] is True
    assert data["emergency_block"] is not None


def test_api_orchestrator_approve(client: TestClient, existing_plan_id: int):
    payload = {
        "user_id": 5,
        "digital_signature": "SIG-TEST-CONTROLLER-5",
        "remarks": "Schedule approved by Senior DOM Agra Division",
    }
    response = client.post(f"/api/v1/orchestrator/approve/{existing_plan_id}", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["decision"] == "APPROVED"
    assert data["status"] == "APPROVED"
    assert data["digital_signature"] == "SIG-TEST-CONTROLLER-5"


def test_api_orchestrator_reject(client: TestClient, existing_plan_id: int):
    payload = {
        "user_id": 6,
        "reason": "Freight corridor slot priority override requested by COA",
    }
    response = client.post(f"/api/v1/orchestrator/reject/{existing_plan_id}", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["decision"] == "REJECTED"
    assert data["status"] == "REJECTED"


def test_api_orchestrator_ledger(client: TestClient, existing_plan_id: int):
    response = client.get(f"/api/v1/orchestrator/ledger/{existing_plan_id}")
    assert response.status_code == 200
    data = response.json()

    assert "plan_id" in data
    assert "agent_decisions" in data
    assert "audit_actions" in data


def test_orchestrator_3_portal_workflow(client: TestClient):
    # 1. Reset
    r_reset = client.post("/api/v1/orchestrator/reset")
    assert r_reset.status_code == 200
    assert r_reset.json()["status"] == "RESET_SUCCESS"

    # Verify 0 demands and 0 sanctioned blocks
    assert client.get("/api/v1/orchestrator/demands").json() == []
    assert client.get("/api/v1/orchestrator/sanctioned-blocks").json() == []

    # 2. Field JE submits demand
    demand_payload = {
        "department": "Engineering",
        "section": "SBC-MYS",
        "km_from": 105.0,
        "km_to": 108.0,
        "duration_minutes": 120,
        "reason": "Through Rail Renewal at Mandya outer",
        "submitter_name": "P. Ramesh, JE (P-Way)",
    }
    r_demand = client.post("/api/v1/orchestrator/demand", json=demand_payload)
    assert r_demand.status_code == 200
    demand_data = r_demand.json()
    assert demand_data["status"] == "SUBMITTED"
    task_id = demand_data["task_id"]

    # Verify demand in list
    demands = client.get("/api/v1/orchestrator/demands").json()
    assert len(demands) == 1
    assert demands[0]["task_id"] == task_id
    assert demands[0]["status"] == "PENDING_SANCTION"

    # 3. Section Controller sanctions demand
    sanction_payload = {
        "task_id": task_id,
        "section": "SBC-MYS",
        "pareto_profile": "Balanced",
    }
    r_sanction = client.post("/api/v1/orchestrator/demand/sanction", json=sanction_payload)
    assert r_sanction.status_code == 200
    sanction_data = r_sanction.json()
    assert sanction_data["status"] == "APPROVED"
    assert sanction_data["block_id"] is not None
    block_id = sanction_data["block_id"]

    # Verify sanctioned block in list
    sanctioned = client.get("/api/v1/orchestrator/sanctioned-blocks").json()
    assert len(sanctioned) == 1
    assert sanctioned[0]["block_id"] == block_id

    # 4. Station Master grants local disconnection
    r_grant = client.post("/api/v1/orchestrator/disconnection/grant", json={"block_id": block_id, "station_id": "MYA"})
    assert r_grant.status_code == 200
    assert r_grant.json()["status"] == "IN_PROGRESS"

    sanctioned_after_grant = client.get("/api/v1/orchestrator/sanctioned-blocks").json()
    assert sanctioned_after_grant[0]["status"] == "IN_PROGRESS"

    # 5. Station Master executes emergency deferral
    r_defer = client.post("/api/v1/orchestrator/emergency-defer", json={
        "block_id": block_id,
        "station_id": "MYA",
        "deferral_reason": "Severe Thunderstorm",
    })
    assert r_defer.status_code == 200
    assert r_defer.json()["status"] == "DEFERRED"

    sanctioned_after_defer = client.get("/api/v1/orchestrator/sanctioned-blocks").json()
    assert sanctioned_after_defer[0]["status"] == "DEFERRED"

    # 6. Section Controller sanctions rescheduled slot
    r_resched = client.post("/api/v1/orchestrator/sanction-rescheduled-slot", json={
        "block_id": block_id,
        "scheduled_slot": "Tomorrow Night 01:30 - 04:00 IST",
    })
    assert r_resched.status_code == 200
    assert r_resched.json()["status"] == "SLOT_SANCTIONED"

    # 7. Field JE finishes work and surrenders track with completion photo
    r_complete = client.post("/api/v1/orchestrator/work/complete", json={
        "block_id": block_id,
        "after_photo_url": "https://example.com/restored.jpg",
        "after_photo_desc": "Track restored & 130 km/h certified",
    })
    assert r_complete.status_code == 200
    assert r_complete.json()["status"] == "COMPLETED"

    sanctioned_after_complete = client.get("/api/v1/orchestrator/sanctioned-blocks").json()
    assert sanctioned_after_complete[0]["status"] == "COMPLETED"
    assert sanctioned_after_complete[0]["after_photo_url"] == "https://example.com/restored.jpg"

    demands_after_complete = client.get("/api/v1/orchestrator/demands").json()
    assert demands_after_complete[0]["status"] == "COMPLETED"

    # 8. Final reset back to clean zero
    r_final_reset = client.post("/api/v1/orchestrator/reset")
    assert r_final_reset.status_code == 200
    assert client.get("/api/v1/orchestrator/demands").json() == []
    assert client.get("/api/v1/orchestrator/sanctioned-blocks").json() == []


def test_orchestrator_edge_cases_and_error_paths(client: TestClient):
    # 1. Reset state to ensure clean start
    client.post("/api/v1/orchestrator/reset")

    # 2. Validation errors: missing required parameters
    r_bad_sanction = client.post("/api/v1/orchestrator/demand/sanction", json={})
    assert r_bad_sanction.status_code == 400

    r_bad_grant = client.post("/api/v1/orchestrator/disconnection/grant", json={})
    assert r_bad_grant.status_code == 400

    r_bad_complete = client.post("/api/v1/orchestrator/work/complete", json={})
    assert r_bad_complete.status_code == 400

    # 3. Cold grant on unsaved/demo block
    r_cold_grant = client.post("/api/v1/orchestrator/disconnection/grant", json={
        "block_id": "BLK-DEMO-COLD-99",
        "station_id": "RMGM",
    })
    assert r_cold_grant.status_code == 200
    assert r_cold_grant.json()["status"] == "IN_PROGRESS"

    sanctioned = client.get("/api/v1/orchestrator/sanctioned-blocks").json()
    assert any(b["block_id"] == "BLK-DEMO-COLD-99" and b["status"] == "IN_PROGRESS" for b in sanctioned)

    # 4. Cold completion on unsaved block
    r_cold_complete = client.post("/api/v1/orchestrator/work/complete", json={
        "block_id": "BLK-DEMO-COLD-88",
        "after_photo_url": "https://example.com/cold.jpg",
        "after_photo_desc": "Cold completion verified",
    })
    assert r_cold_complete.status_code == 200
    assert r_cold_complete.json()["status"] == "COMPLETED"

    sanctioned = client.get("/api/v1/orchestrator/sanctioned-blocks").json()
    assert any(b["block_id"] == "BLK-DEMO-COLD-88" and b["status"] == "COMPLETED" for b in sanctioned)

    # 5. Reset idempotency
    r_reset1 = client.post("/api/v1/orchestrator/reset")
    assert r_reset1.status_code == 200
    r_reset2 = client.post("/api/v1/orchestrator/reset")
    assert r_reset2.status_code == 200
    assert client.get("/api/v1/orchestrator/demands").json() == []
    assert client.get("/api/v1/orchestrator/sanctioned-blocks").json() == []


