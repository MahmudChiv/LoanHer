"""
Passport computation and bank-statement handling.

This module contains simulated statement analysis and Passport computation.
"""

from __future__ import annotations

import logging
from app import store
from app.models.schemas import ConversationState

logger = logging.getLogger(__name__)


def handle_statement(phone: str) -> None:
    """
    Handle statement upload, simulate scoring, and transition to DONE.

    TODO: Implement in ClickUp task #PASSPORT-02
          - Downloads the uploaded statement
          - Runs simulated analysis and creates Passport
          - Sends outbound messages with Passport link
          - Sets conversation state to DONE
    """
    logger.info("Handling bank statement for %s", phone)
    if phone in store.conversations:
        store.conversations[phone]["state"] = ConversationState.DONE
