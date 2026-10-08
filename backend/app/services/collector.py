"""
Collector (ajo group leader) verification loop.

Manages outbound requests and inbound confirmations for ajo savings groups.
"""

from __future__ import annotations

import logging

from app import store

logger = logging.getLogger(__name__)


def start_collector_verification(applicant_phone: str) -> None:
    """
    Initiate verification loop by messaging the collector.

    TODO: Implement in ClickUp task #COLLECTOR-01
          - Reads collector_phone from applicant conversation
          - Stores entry in store.pending_verifications
          - Sends verification request via whatsapp.send_whatsapp
    """
    logger.info("Initiating collector verification for applicant %s", applicant_phone)


def is_collector_with_pending(phone: str) -> bool:
    """
    Check if the phone number belongs to a collector with a pending verification request.

    TODO: Implement in ClickUp task #COLLECTOR-01
    """
    return phone in store.pending_verifications


def handle_collector_message(phone: str, text: str) -> list[str]:
    """
    Handle response from an ajo collector.

    TODO: Implement in ClickUp task #COLLECTOR-01
    """
    logger.info("Collector reply received from %s: %r", phone, text)
    return ["Thank you for confirming the ajo participation."]
