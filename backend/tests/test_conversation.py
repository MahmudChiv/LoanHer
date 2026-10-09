"""
Tests for applicant conversation state machine in app/services/conversation.py.

Verifies:
  - Happy path walkthrough from START to WAIT_STATEMENT and DONE.
  - Invalid registration / CAC lookup failure handling.
  - RESET command handling.
  - Collector message interception.
  - DONE state SEND forwarding.
"""

from __future__ import annotations

import pytest

from app import store
from app.models.schemas import ConversationState
from app.services import (
    applications,
    cac,
    collector,
    parsing,
    passport,
)
from app.services import messages as msg
from app.services.conversation import handle_message


@pytest.fixture(autouse=True)
def clean_store():
    """Clear conversations store before and after each test."""
    store.conversations.clear()
    store.pending_verifications.clear()
    yield
    store.conversations.clear()
    store.pending_verifications.clear()


def test_conversation_happy_path(monkeypatch):
    """Test full applicant onboarding flow from START to WAIT_STATEMENT."""
    phone = "whatsapp:+2348031234567"

    # Step 0: Initial message unparseable -> WELCOME
    monkeypatch.setattr(parsing, "parse_name_and_number", lambda t: None)
    res = handle_message(phone, "hello", False)
    assert res == [msg.WELCOME]
    assert store.conversations[phone]["state"] == ConversationState.START

    # Step 1: START -> provide name and CAC -> verify -> ASK_AJO_AMOUNT
    monkeypatch.setattr(
        parsing,
        "parse_name_and_number",
        lambda t: ("Kemi Adeyemi", "BN 1234567"),
    )
    monkeypatch.setattr(
        cac,
        "lookup_cac",
        lambda num, name: {
            "verified": True,
            "record": {
                "number": "BN 1234567",
                "businessName": "Kemi Fabrics",
            },
            "reason": "ok",
        },
    )
    res = handle_message(phone, "Kemi Adeyemi, BN 1234567", False)
    assert res == [msg.cac_verified("Kemi", "Kemi Fabrics"), msg.ASK_AJO_ALL]
    assert store.conversations[phone]["state"] == ConversationState.ASK_AJO_AMOUNT
    assert store.conversations[phone]["data"]["name"] == "Kemi Adeyemi"
    assert store.conversations[phone]["data"]["businessName"] == "Kemi Fabrics"
    assert store.conversations[phone]["data"]["cacNumber"] == "BN 1234567"

    # Step 2: ASK_AJO_AMOUNT -> provide invalid input stays in ASK_AJO_AMOUNT
    monkeypatch.setattr(parsing, "parse_all_ajo_details", lambda t: None)
    monkeypatch.setattr(parsing, "parse_amount", lambda t: None)
    res = handle_message(phone, "lots of money", False)
    assert res == [msg.HINT_AJO_ALL]
    assert store.conversations[phone]["state"] == ConversationState.ASK_AJO_AMOUNT

    # Now provide single-turn all-in-one Ajo details
    collector_called = []
    monkeypatch.setattr(
        parsing,
        "parse_all_ajo_details",
        lambda t: (50000, "weekly", 6, "whatsapp:+2348099999999"),
    )
    monkeypatch.setattr(collector, "start_collector_verification", lambda p: collector_called.append(p))

    res = handle_message(phone, "50000, weekly, 6, 08099999999", False)
    assert res == [msg.COLLECTOR_REQUEST_SENT]
    assert store.conversations[phone]["state"] == ConversationState.WAIT_STATEMENT
    assert store.conversations[phone]["data"]["ajoAmount"] == 50000
    assert store.conversations[phone]["data"]["ajoFrequency"] == "weekly"
    assert store.conversations[phone]["data"]["ajoMonths"] == 6
    assert store.conversations[phone]["data"]["collectorPhone"] == "whatsapp:+2348099999999"
    assert store.conversations[phone]["data"]["ajoStatus"] == "self-reported"
    assert collector_called == [phone]

    # Step 6: WAIT_STATEMENT -> text without media returns reminder
    res = handle_message(phone, "is it ready?", False)
    assert res == [msg.STATEMENT_WAIT_HINT]
    assert store.conversations[phone]["state"] == ConversationState.WAIT_STATEMENT

    # Step 7: WAIT_STATEMENT -> message with media invokes passport.handle_statement
    statement_called = []

    def mock_handle_statement(p):
        statement_called.append(p)
        store.conversations[p]["state"] = ConversationState.DONE

    monkeypatch.setattr(passport, "handle_statement", mock_handle_statement)
    res = handle_message(phone, "", True)
    assert res == []
    assert statement_called == [phone]
    assert store.conversations[phone]["state"] == ConversationState.DONE

    # Step 8: DONE -> SEND forwards application
    monkeypatch.setattr(applications, "handle_send", lambda p: ["Application submitted: Ref WB-1001"])
    res = handle_message(phone, "SEND", False)
    assert res == ["Application submitted: Ref WB-1001"]

    # Any other message in DONE returns FALLBACK
    res = handle_message(phone, "hello again", False)
    assert res == [msg.FALLBACK]


def test_cac_wrong_registration(monkeypatch):
    """Test CAC lookup failure states in START: not_found, inactive, name_mismatch."""
    phone = "whatsapp:+2348030000002"

    monkeypatch.setattr(
        parsing,
        "parse_name_and_number",
        lambda t: ("Test User", "RC-000"),
    )

    # 1. Not found
    monkeypatch.setattr(cac, "lookup_cac", lambda num, name: {"verified": False, "record": None, "reason": "not_found"})
    res = handle_message(phone, "Test User, RC-000", False)
    assert res == [msg.CAC_NOT_FOUND]
    assert store.conversations[phone]["state"] == ConversationState.START

    # 2. Inactive
    monkeypatch.setattr(cac, "lookup_cac", lambda num, name: {"verified": False, "record": None, "reason": "inactive"})
    res = handle_message(phone, "Test User, RC-000", False)
    assert res == [msg.CAC_INACTIVE]
    assert store.conversations[phone]["state"] == ConversationState.START

    # 3. Name mismatch
    monkeypatch.setattr(cac, "lookup_cac", lambda num, name: {"verified": False, "record": None, "reason": "name_mismatch"})
    res = handle_message(phone, "Test User, RC-000", False)
    assert res == [msg.CAC_NAME_MISMATCH]
    assert store.conversations[phone]["state"] == ConversationState.START


def test_reset_command():
    """Test that 'RESET' (case-insensitive) clears conversation state and returns RESET_DONE."""
    phone = "whatsapp:+2348030000003"
    store.conversations[phone] = {
        "state": ConversationState.ASK_AJO_AMOUNT,
        "data": {"name": "Test User"},
    }

    res = handle_message(phone, "  reset  ", False)
    assert res == [msg.RESET_DONE]
    assert phone not in store.conversations


def test_collector_interception(monkeypatch):
    """Test that a pending collector message is intercepted before applicant flow."""
    collector_phone = "whatsapp:+2348090000004"

    monkeypatch.setattr(collector, "is_collector_with_pending", lambda p: p == collector_phone)
    monkeypatch.setattr(
        collector,
        "handle_collector_message",
        lambda p, t: ["Collector confirmation recorded: YES"],
    )

    res = handle_message(collector_phone, "yes she contributes", False)
    assert res == ["Collector confirmation recorded: YES"]
    assert collector_phone not in store.conversations
