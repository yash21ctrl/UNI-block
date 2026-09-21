"""
API Integration Tests for RailBlock AI endpoints.
Verifies health checks, system metrics, OpenAPI docs, and error handling.
"""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    """Tests root status endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "RailBlock AI" in data["service"]
    assert data["status"] == "ONLINE"
    assert data["docs"] == "/docs"


def test_health_check_endpoint(client: TestClient) -> None:
    """Tests health check and database connectivity probe."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_system_metrics_endpoint(client: TestClient) -> None:
    """Tests system metrics aggregation endpoint."""
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "corridors_count" in data
    assert "assets_count" in data
    assert "maintenance_tasks_count" in data
    assert data["system_status"] == "OPERATIONAL"


def test_openapi_schema_endpoint(client: TestClient) -> None:
    """Tests OpenAPI specification generation for Swagger UI."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "openapi" in schema
    assert "RailBlock AI" in schema["info"]["title"]
    assert "/health" in schema["paths"]
