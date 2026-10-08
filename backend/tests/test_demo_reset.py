"""
Unit & API integration tests for demo reset endpoint (POST /api/demo/reset).
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app import store
from app.config import get_settings
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_store():
    """Reset store dicts and load seed data before each test."""
    store.reset_store()
    yield
    store.reset_store()


def test_demo_reset_without_secret_configured():
    """Test POST /api/demo/reset when secret is default or change_me."""
    settings = get_settings()
    settings.DEMO_RESET_SECRET = "change_me"

    # Insert dummy conversation and application
    dummy_phone = "whatsapp:+2348999999999"
    dummy_ref = "WB-DUMMY-999"
    store.conversations[dummy_phone] = {"state": "DONE", "data": {"name": "Dummy Test"}}
    store.applications[dummy_ref] = {"ref": dummy_ref, "applicantName": "Dummy Test"}

    assert dummy_phone in store.conversations
    assert dummy_ref in store.applications

    response = client.post("/api/demo/reset")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reset"
    assert "applications" in data

    # Verify dummy data was wiped and seed data restored
    assert dummy_phone not in store.conversations
    assert dummy_ref not in store.applications
    assert "WB-1001" in store.applications


def test_demo_reset_with_secret_configured(monkeypatch):
    """Test POST /api/demo/reset enforces X-Demo-Secret header when configured."""
    settings = get_settings()
    monkeypatch.setattr(settings, "DEMO_RESET_SECRET", "secret_pass_123")

    # Insert dummy application
    dummy_ref = "WB-DUMMY-888"
    store.applications[dummy_ref] = {"ref": dummy_ref, "applicantName": "Dummy Test"}

    # 1. No header -> 401
    resp_no_header = client.post("/api/demo/reset")
    assert resp_no_header.status_code == 401
    assert "invalid or missing" in resp_no_header.json()["detail"].lower()

    # 2. Wrong header -> 401
    resp_wrong = client.post("/api/demo/reset", headers={"X-Demo-Secret": "wrong_secret"})
    assert resp_wrong.status_code == 401

    # 3. Valid header -> 200 and store reset
    resp_valid = client.post("/api/demo/reset", headers={"X-Demo-Secret": "secret_pass_123"})
    assert resp_valid.status_code == 200
    assert resp_valid.json()["status"] == "reset"
    assert dummy_ref not in store.applications
    assert "WB-1001" in store.applications
