"""Applicant conversation state machine.

Drives the WhatsApp onboarding flow through the states defined in
models.schemas.ConversationState.
"""

import logging
import time

from app.services.whatsapp import send_whatsapp

logger = logging.getLogger(__name__)


def send_replies(phone: str, replies: list[str]) -> None:
    """Send each reply line sequentially via WhatsApp with 0.7s delay.

    Kept in its own clearly commented function so another task can replace
    handle_message without modifying sending and pacing logic.
    """
    for line in replies:
        if line:
            send_whatsapp(to=phone, body=line)
            time.sleep(0.7)


def handle_message(phone: str, text: str, has_media: bool) -> list[str]:
    """Handle incoming message and return reply lines.

    Placeholder implementation for end-to-end pipeline connectivity.
    TODO: Replace with full onboarding state machine in ClickUp task #CONVERSATION-01.
    """
    return ["Echo: " + text]


def process_incoming(phone: str, text: str, has_media: bool) -> None:
    """Process an incoming WhatsApp message dispatched from the webhook.

    Calls handle_message to get reply lines, then dispatches each line via send_replies.
    """
    replies = handle_message(phone=phone, text=text, has_media=has_media)
    send_replies(phone=phone, replies=replies)
