"""
Application creation and forwarding service.

Called when the applicant completes their flow or replies SEND to submit
their application to Wema Bank.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def handle_send(phone: str) -> list[str]:
    """
    Handle the 'SEND' command from an applicant to forward their Passport to Wema Bank.

    TODO: Implement in ClickUp task #APPLICATIONS-02
          - Creates an application entry in store.applications
          - Generates application reference (e.g. WB-1003)
          - Returns confirmation message with reference
    """
    logger.info("Forwarding application for %s to Wema Bank", phone)
    return [
        "Your Loan Passport has been sent to Wema Bank!\n\n"
        "A loan officer will review your application. Reference: WB-PENDING"
    ]
