"""
Unit tests for collector verification loop (backend/app/services/collector.py).
"""

from __future__ import annotations

import pytest

from app import store
from app.services import collector
from app.services import messages as msg


@pytest.fixture(autouse=True)
def reset_store_fixture():
    """Reset store dicts before each test."""
    store.reset_store()
    store.conversations.clear()
    store.pending_verifications.clear()
    store.passports.clear()
    store.applications.clear()
    yield
    store.conversations.clear()
    store.pending_verifications.clear()
    store.passports.clear()
    store.applications.clear()


def test_start_collector_verification(monkeypatch):
    """Test that start_collector_verification stores pending entry and sends question."""
    sent_messages = []

    def mock_send_whatsapp(to: str, body: str):
        sent_messages.append({"to": to, "body": body})
        return "mock_msg_sid"

    monkeypatch.setattr("app.services.collector.send_whatsapp", mock_send_whatsapp)

    applicant_phone = "whatsapp:+2348011111111"
    collector_phone = "whatsapp:+2348022222222"

    store.conversations[applicant_phone] = {
        "state": "COLLECTOR_WAIT",
        "data": {
            "name": "Kemi Adebayo",
            "collectorPhone": collector_phone,
            "ajoAmount": 5000,
            "ajoFrequency": "weekly",
            "ajoMonths": 22,
        },
    }

    collector.start_collector_verification(applicant_phone)

    assert collector_phone in store.pending_verifications
    pending = store.pending_verifications[collector_phone]
    assert pending["applicantPhone"] == applicant_phone
    assert pending["applicantName"] == "Kemi Adebayo"
    assert pending["amount"] == 5000
    assert pending["frequency"] == "weekly"
    assert pending["months"] == 22
    assert pending["step"] == "confirm"

    assert len(sent_messages) == 1
    assert sent_messages[0]["to"] == collector_phone
    assert "Kemi Adebayo" in sent_messages[0]["body"]
    assert "5,000" in sent_messages[0]["body"]
    assert "weekly" in sent_messages[0]["body"]


def test_confirm_yes_then_late_count(monkeypatch):
    """Test '1' (Yes) then '3' late payments sets ajo to collector-confirmed and '49 of 52 weeks'."""
    sent_messages = []

    def mock_send_whatsapp(to: str, body: str):
        sent_messages.append({"to": to, "body": body})
        return "mock_msg_sid"

    monkeypatch.setattr("app.services.collector.send_whatsapp", mock_send_whatsapp)

    applicant_phone = "whatsapp:+2348011111111"
    collector_phone = "whatsapp:+2348022222222"

    store.conversations[applicant_phone] = {
        "state": "AJO_COLLECTOR",
        "data": {
            "name": "Kemi Adebayo",
            "collectorPhone": collector_phone,
            "ajoAmount": 5000,
            "ajoFrequency": "weekly",
            "ajoMonths": 22,
            "ajoStatus": "self-reported",
        },
    }

    collector.start_collector_verification(applicant_phone)
    assert collector.is_collector_with_pending(collector_phone) is True

    # Step 1: Reply "1"
    resp1 = collector.handle_collector_message(collector_phone, "1")
    assert resp1 == [msg.ASK_LATE_PAYMENTS]
    assert store.pending_verifications[collector_phone]["step"] == "late"

    # Step 2: Reply "3" (3 late payments)
    resp2 = collector.handle_collector_message(collector_phone, "3")
    assert resp2 == [msg.COLLECTOR_THANKS]

    assert collector.is_collector_with_pending(collector_phone) is False
    assert store.conversations[applicant_phone]["data"]["ajoStatus"] == "collector-confirmed"
    assert store.conversations[applicant_phone]["data"]["ajoOnTimeRecord"] == "49 of 52 weeks"

    # Applicant notified
    assert len(sent_messages) == 2
    assert sent_messages[1]["to"] == applicant_phone
    assert msg.applicant_ajo_confirmed() in sent_messages[1]["body"]


def test_confirm_no_path(monkeypatch):
    """Test '2' (No) sets ajoStatus to not-confirmed."""
    sent_messages = []

    def mock_send_whatsapp(to: str, body: str):
        sent_messages.append({"to": to, "body": body})
        return "mock_msg_sid"

    monkeypatch.setattr("app.services.collector.send_whatsapp", mock_send_whatsapp)

    applicant_phone = "whatsapp:+2348011111111"
    collector_phone = "whatsapp:+2348022222222"

    store.conversations[applicant_phone] = {
        "state": "AJO_COLLECTOR",
        "data": {
            "name": "Kemi Adebayo",
            "collectorPhone": collector_phone,
            "ajoAmount": 5000,
            "ajoFrequency": "weekly",
            "ajoMonths": 22,
            "ajoStatus": "self-reported",
        },
    }

    collector.start_collector_verification(applicant_phone)

    # Reply "2"
    resp = collector.handle_collector_message(collector_phone, "2")
    assert resp == [msg.COLLECTOR_NOT_CONFIRMED_ACK]
    assert collector.is_collector_with_pending(collector_phone) is False
    assert store.conversations[applicant_phone]["data"]["ajoStatus"] == "not-confirmed"

    # Applicant notified
    assert len(sent_messages) == 2
    assert sent_messages[1]["to"] == applicant_phone
    assert msg.applicant_ajo_not_confirmed() in sent_messages[1]["body"]


def test_invalid_replies_at_each_step(monkeypatch):
    """Test invalid input validation at 'confirm' and 'late' steps."""
    monkeypatch.setattr("app.services.collector.send_whatsapp", lambda to, body: "sid")

    applicant_phone = "whatsapp:+2348011111111"
    collector_phone = "whatsapp:+2348022222222"

    store.conversations[applicant_phone] = {
        "state": "AJO_COLLECTOR",
        "data": {
            "name": "Kemi Adebayo",
            "collectorPhone": collector_phone,
            "ajoAmount": 5000,
            "ajoFrequency": "weekly",
            "ajoMonths": 22,
        },
    }

    collector.start_collector_verification(applicant_phone)

    # Invalid at confirm step
    resp_invalid_confirm = collector.handle_collector_message(collector_phone, "foo")
    assert resp_invalid_confirm == [msg.COLLECTOR_INVALID_CONFIRM]
    assert store.pending_verifications[collector_phone]["step"] == "confirm"

    # Move to late step
    collector.handle_collector_message(collector_phone, "yes")
    assert store.pending_verifications[collector_phone]["step"] == "late"

    # Invalid at late step
    resp_invalid_late = collector.handle_collector_message(collector_phone, "invalid")
    assert resp_invalid_late == [msg.COLLECTOR_INVALID_LATE]
    assert store.pending_verifications[collector_phone]["step"] == "late"


def test_is_collector_with_pending_before_and_after(monkeypatch):
    """Test is_collector_with_pending status lifecycle."""
    monkeypatch.setattr("app.services.collector.send_whatsapp", lambda to, body: "sid")

    applicant_phone = "whatsapp:+2348011111111"
    collector_phone = "whatsapp:+2348022222222"

    assert collector.is_collector_with_pending(collector_phone) is False

    store.conversations[applicant_phone] = {
        "state": "AJO_COLLECTOR",
        "data": {
            "name": "Kemi Adebayo",
            "collectorPhone": collector_phone,
            "ajoAmount": 5000,
            "ajoFrequency": "weekly",
            "ajoMonths": 22,
        },
    }

    collector.start_collector_verification(applicant_phone)
    assert collector.is_collector_with_pending(collector_phone) is True

    # Complete step 1 and step 2
    collector.handle_collector_message(collector_phone, "1")
    assert collector.is_collector_with_pending(collector_phone) is True

    collector.handle_collector_message(collector_phone, "0")
    assert collector.is_collector_with_pending(collector_phone) is False
