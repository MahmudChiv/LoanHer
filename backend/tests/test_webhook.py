"""
Tests for Twilio WhatsApp webhook (POST /webhook).

Ensures that Twilio form submissions receive an immediate HTTP 200 with an empty
TwiML XML response, and that incoming messages are passed to the conversation
pipeline without crashing.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.store import applications, passports

client = TestClient(app)


def test_webhook_returns_200_and_xml_body():
    """Test that posting Twilio WhatsApp form data returns 200 with valid TwiML XML."""
    form_data = {
        "From": "whatsapp:+2348000000001",
        "Body": "hello",
        "NumMedia": "0",
    }
    response = client.post("/webhook", data=form_data)

    assert response.status_code == 200
    assert "application/xml" in response.headers.get("content-type", "")
    assert '<?xml version="1.0" encoding="UTF-8"?><Response></Response>' in response.text


def test_webhook_with_media_returns_200():
    """Test that webhook accepts media fields without error."""
    form_data = {
        "From": "whatsapp:+2348000000001",
        "Body": "here is my statement",
        "NumMedia": "1",
        "MediaUrl0": "https://api.twilio.com/mock/media/test.pdf",
        "MediaContentType0": "application/pdf",
    }
    response = client.post("/webhook", data=form_data)

    assert response.status_code == 200
    assert "application/xml" in response.headers.get("content-type", "")
    assert "<Response></Response>" in response.text


def test_seed_data_loaded_on_startup():
    """Verify that lifespan handler populated store with seed fixtures."""
    # Seed data files in data/ contain at least seed-ngozi, seed-halima / WB-1001, WB-1002
    assert len(passports) > 0
    assert "seed-ngozi" in passports
    assert len(applications) > 0
    assert "WB-1001" in applications
