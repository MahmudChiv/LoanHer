"""
Real test: GET /health returns HTTP 200 with expected payload.

Run with:  pytest  (from backend/ with the venv active)
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_200():
    """Health endpoint must be reachable and return status=ok."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_payload():
    """Health response body must include status and version keys."""
    response = client.get("/health")
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "environment" in data
