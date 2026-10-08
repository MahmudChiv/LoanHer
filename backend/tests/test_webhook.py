"""Tests for the Twilio WhatsApp inbound webhook route.

Run with:  pytest tests/test_webhook.py  (from backend/)
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_webhook_returns_200_with_xml():
    """Posting Twilio form data must return HTTP 200 with XML TwiML body."""
    response = client.post(
        "/webhook",
        data={
            "From": "whatsapp:+2348000000001",
            "Body": "hello",
            "NumMedia": "0",
        },
    )
    assert response.status_code == 200
    assert "application/xml" in response.headers.get("content-type", "")
    assert response.text == '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


def test_webhook_with_media_returns_200():
    """Webhook must accept optional media fields and return 200 XML."""
    response = client.post(
        "/webhook",
        data={
            "From": "whatsapp:+2348000000001",
            "Body": "Statement attached",
            "NumMedia": "1",
            "MediaUrl0": "https://api.twilio.com/mock/statement.pdf",
            "MediaContentType0": "application/pdf",
        },
    )
    assert response.status_code == 200
    assert "application/xml" in response.headers.get("content-type", "")
    assert "<Response></Response>" in response.text
