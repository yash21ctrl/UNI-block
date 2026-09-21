"""
Integration Tests for Phase 3 Multi-Agent Endpoints (/api/v1/agents/*).
Tests:
- POST /api/v1/agents/fusion/analyze
- POST /api/v1/agents/optimizer/weekly
- POST /api/v1/agents/optimizer/monthly
- POST /api/v1/agents/optimizer/pareto
- POST /api/v1/agents/optimizer/emergency
- POST /api/v1/agents/optimizer/what-if
- POST /api/v1/agents/pipeline/full-plan
"""

import pytest
from fastapi.testclient import TestClient
from app.utils.demo_scenarios import get_scenario_c_tasks


def test_api_fusion_analyze(client: TestClient) -> None:
    tasks = get_scenario_c_tasks()
    response = client.post(
        "/api/v1/agents/fusion/analyze",
        json={"tasks_payload": tasks, "section": "NDLS-AGC"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_tasks_evaluated"] == 3
    assert data["fused_packages_count"] >= 1
    assert data["total_downtime_saved_minutes"] > 0
    assert len(data["packages"]) >= 1


def test_api_optimizer_weekly(client: TestClient) -> None:
    tasks = get_scenario_c_tasks()
    response = client.post(
        "/api/v1/agents/optimizer/weekly",
        json={
            "tasks_payload": tasks,
            "section": "NDLS-AGC",
            "pareto_profile": "Balanced",
            "enable_fusion": True,
            "persist_to_db": False,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["plan_type"] == "WEEKLY"
    assert data["horizon_days"] == 7
    assert data["solve_status"] in ("OPTIMAL", "FEASIBLE")
    assert data["scheduled_tasks"] > 0
    assert len(data["blocks"]) > 0


def test_api_optimizer_monthly(client: TestClient) -> None:
    tasks = get_scenario_c_tasks()
    response = client.post(
        "/api/v1/agents/optimizer/monthly",
        json={
            "tasks_payload": tasks,
            "section": "NDLS-AGC",
            "pareto_profile": "Throughput-Max",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["plan_type"] == "MONTHLY"
    assert data["horizon_days"] == 30
    assert data["solve_status"] in ("OPTIMAL", "FEASIBLE")


def test_api_optimizer_pareto(client: TestClient) -> None:
    tasks = get_scenario_c_tasks()
    response = client.post(
        "/api/v1/agents/optimizer/pareto",
        json={"tasks_payload": tasks, "section": "NDLS-AGC"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "plans" in data
    assert "Safety-Max" in data["plans"]
    assert "Throughput-Max" in data["plans"]
    assert "Balanced" in data["plans"]
    assert "comparison_metrics" in data


def test_api_optimizer_emergency(client: TestClient) -> None:
    emergency_payload = {
        "emergency_task": {
            "id": 9999,
            "section": "NDLS-AGC",
            "department": "Engineering",
            "task_type": "Rail Fracture",
            "priority_score": 99.5,
            "duration_minutes": 120,
            "severity": 5,
        },
        "freeze_approved": True,
    }
    response = client.post("/api/v1/agents/optimizer/emergency", json=emergency_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["emergency_task_id"] == 9999
    assert data["emergency_block"] is not None
    assert data["solve_time_ms"] < 5000.0
    assert data["premium_trains_protected"] is True


def test_api_optimizer_what_if(client: TestClient) -> None:
    response = client.post(
        "/api/v1/agents/optimizer/what-if",
        json={
            "section": "NDLS-AGC",
            "additional_traffic_percent": 15.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["solve_status"] in ("OPTIMAL", "FEASIBLE")
    assert data["scheduled_tasks"] > 0


def test_api_pipeline_full_plan(client: TestClient) -> None:
    response = client.post(
        "/api/v1/agents/pipeline/full-plan",
        json={
            "section": "NDLS-AGC",
            "plan_type": "WEEKLY",
            "limit": 10,
            "pareto_profile": "Balanced",
            "enable_fusion": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["plan_id"] is not None
    assert data["optimized_plan"] is not None
    assert data["conflict_report"] is not None
    assert data["work_packages_count"] >= 0
    assert data["db_records_created"] >= 0
