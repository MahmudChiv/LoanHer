"""
Unit & API integration tests for Application service and routes.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app import store
from app.main import app
from app.services import applications as app_service
from app.services import messages as msg

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_store():
    """Reset store dicts and load seed data before each test."""
    store.reset_store()
    yield
    store.reset_store()


def test_handle_send_no_passport():
    """Test handle_send returns NEED_PASSPORT_FIRST when phone has no passport."""
    phone = "whatsapp:+2348000000099"
    store.conversations[phone] = {"state": "START", "data": {}}
    res = app_service.handle_send(phone)
    assert res == [msg.NEED_PASSPORT_FIRST]


def test_handle_send_creates_new_application_and_prevents_duplicate():
    """Test handle_send generates sequential ref WB-1003 and prevents duplicate submission."""
    phone = "whatsapp:+2348011112222"

    # Setup valid passport & conversation
    passport_id = "test-pass-001"
    store.passports[passport_id] = {
        "id": passport_id,
        "applicantName": "Kemi Adebayo",
        "businessName": "Kemi Fabrics",
        "score": 85,
        "band": "A",
        "ajo": {"weeklyAmount": 5000, "verificationStatus": "collector-confirmed"},
    }
    store.conversations[phone] = {
        "state": "DONE",
        "data": {"passportId": passport_id, "name": "Kemi Adebayo"},
    }

    # Verify seed refs exist
    assert "WB-1001" in store.applications
    assert "WB-1002" in store.applications

    # 1. First send -> creates WB-1003
    res1 = app_service.handle_send(phone)
    assert res1 == [msg.sent_to_wema("WB-1003")]
    assert "WB-1003" in store.applications
    app_record = store.applications["WB-1003"]
    assert app_record["passportId"] == passport_id
    assert app_record["status"] == "submitted"

    # 2. Second send -> returns already_sent
    res2 = app_service.handle_send(phone)
    assert res2 == [msg.already_sent("WB-1003")]


def test_refresh_application_for_passport():
    """Test refresh_application_for_passport updates score and band on matching applications."""
    passport_id = "seed-ngozi"

    # Seed application WB-1001 references seed-ngozi
    app_record = store.applications["WB-1001"]
    assert app_record["passportId"] == passport_id

    # Update passport score & band
    store.passports[passport_id]["score"] = 92
    store.passports[passport_id]["band"] = "A"

    app_service.refresh_application_for_passport(passport_id)
    assert store.applications["WB-1001"]["score"] == 92
    assert store.applications["WB-1001"]["band"] == "A"


def test_get_applications_list_order():
    """Test GET /api/applications returns list ordered newest first by submittedAt."""
    response = client.get("/api/applications")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

    # Verify order: newest submittedAt first
    timestamps = [item["submittedAt"] for item in data]
    assert timestamps == sorted(timestamps, reverse=True)


def test_get_application_by_ref_success():
    """Test GET /api/applications/{ref} returns application and passport payload."""
    response = client.get("/api/applications/WB-1001")
    assert response.status_code == 200
    data = response.json()
    assert "application" in data
    assert "passport" in data
    assert data["application"]["ref"] == "WB-1001"
    assert data["passport"]["id"] == data["application"]["passportId"]


def test_get_application_by_ref_404():
    """Test GET /api/applications/{ref} returns 404 for unknown ref."""
    response = client.get("/api/applications/WB-9999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_patch_application_status_valid():
    """Test PATCH /api/applications/{ref} updates status with valid enum value."""
    payload = {"status": "under review"}
    response = client.patch("/api/applications/WB-1001", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "under review"
    assert store.applications["WB-1001"]["status"] == "under review"


def test_patch_application_status_invalid_422():
    """Test PATCH /api/applications/{ref} returns 422 for invalid status enum value."""
    payload = {"status": "invalid_status_value"}
    response = client.patch("/api/applications/WB-1001", json=payload)
    assert response.status_code == 422
