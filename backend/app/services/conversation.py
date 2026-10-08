"""
Applicant conversation service and state machine.

Drives the WhatsApp conversation through the onboarding flow, verifying CAC,
collecting ajo savings group details, triggering collector confirmation,
and handling statement uploads.
"""

from __future__ import annotations

import logging
import time

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
from app.services.whatsapp import send_whatsapp

logger = logging.getLogger(__name__)


def handle_message(phone: str, text: str, has_media: bool) -> list[str]:
    """
    Handle an incoming message and return the lines the bot should reply to the sender.

    Rules in order:
      1. If text is 'RESET': delete the phone's conversation and return [msg.RESET_DONE].
      2. If collector has a pending verification: delegate to collector handler.
      3. Otherwise run applicant flow state machine starting at START.

    Args:
        phone: Sender's normalized phone number (whatsapp:+234...).
        text: Inbound message body text.
        has_media: Flag indicating if media (image/document) was attached.

    Returns:
        list[str]: Sequential lines to send back to the user.
    """
    try:
        clean_text = text.strip()

        # Rule 1: Reset conversation state
        if clean_text.upper() == "RESET":
            store.conversations.pop(phone, None)
            return [msg.RESET_DONE]

        # Rule 2: Intercept pending collector responses
        if collector.is_collector_with_pending(phone):
            return collector.handle_collector_message(phone, text)

        # Rule 3: Run applicant flow
        if phone not in store.conversations:
            store.conversations[phone] = {
                "state": ConversationState.START,
                "data": {},
            }

        conv = store.conversations[phone]
        state = conv.get("state", ConversationState.START)

        # State: START
        if state == ConversationState.START:
            parsed = parsing.parse_name_and_number(clean_text)
            if parsed is None:
                return [msg.WELCOME]

            name, number = parsed
            cac_result = cac.lookup_cac(number, name)

            if not cac_result.get("verified", False):
                reason = cac_result.get("reason", "not_found")
                if reason == "inactive":
                    return [msg.CAC_INACTIVE]
                elif reason == "name_mismatch":
                    return [msg.CAC_NAME_MISMATCH]
                else:
                    return [msg.CAC_NOT_FOUND]

            # CAC verified: extract record and transition to ASK_AJO_AMOUNT
            record = cac_result.get("record") or {}
            cac_number = record.get("number", number)
            business_name = record.get("businessName", "")
            first_name = name.strip().split()[0] if name.strip() else name

            conv["data"] = {
                "name": name,
                "cacNumber": cac_number,
                "businessName": business_name,
            }
            conv["state"] = ConversationState.ASK_AJO_AMOUNT
            return [msg.cac_verified(first_name, business_name), msg.ASK_AJO_AMOUNT]

        # State: ASK_AJO_AMOUNT
        elif state == ConversationState.ASK_AJO_AMOUNT:
            amount = parsing.parse_amount(clean_text)
            if amount is None:
                return [msg.HINT_AMOUNT]

            conv["data"]["ajoAmount"] = amount
            conv["state"] = ConversationState.ASK_AJO_FREQUENCY
            return [msg.ASK_AJO_FREQUENCY]

        # State: ASK_AJO_FREQUENCY
        elif state == ConversationState.ASK_AJO_FREQUENCY:
            frequency = parsing.parse_frequency(clean_text)
            if frequency is None:
                return [msg.HINT_FREQUENCY]

            conv["data"]["ajoFrequency"] = frequency
            conv["state"] = ConversationState.ASK_AJO_MONTHS
            return [msg.ASK_AJO_MONTHS]

        # State: ASK_AJO_MONTHS
        elif state == ConversationState.ASK_AJO_MONTHS:
            months = parsing.parse_months(clean_text)
            if months is None:
                return [msg.HINT_MONTHS]

            conv["data"]["ajoMonths"] = months
            conv["state"] = ConversationState.ASK_COLLECTOR_PHONE
            return [msg.ASK_COLLECTOR_PHONE]

        # State: ASK_COLLECTOR_PHONE
        elif state == ConversationState.ASK_COLLECTOR_PHONE:
            norm_phone = parsing.normalize_phone(clean_text)
            if norm_phone is None:
                return [msg.HINT_PHONE]

            conv["data"]["collectorPhone"] = norm_phone
            conv["data"]["ajoStatus"] = "self-reported"
            conv["state"] = ConversationState.WAIT_STATEMENT
            collector.start_collector_verification(phone)
            return [msg.COLLECTOR_REQUEST_SENT]

        # State: WAIT_STATEMENT
        elif state == ConversationState.WAIT_STATEMENT:
            if has_media:
                passport.handle_statement(phone)
                return []
            return [msg.STATEMENT_WAIT_HINT]

        # State: DONE
        elif state == ConversationState.DONE:
            if clean_text.upper() == "SEND":
                return applications.handle_send(phone)
            return [msg.FALLBACK]

        # Fallback for unrecognized state
        return [msg.FALLBACK]

    except Exception as exc:
        logger.exception("Unexpected error in handle_message for %s: %s", phone, exc)
        return [msg.FALLBACK]


def send_reply_lines(phone: str, lines: list[str], delay: float = 0.7) -> None:
    """
    Dispatch sequential reply lines via WhatsApp with an inter-message delay.

    Kept separate from handle_message so state machine logic remains pure
    and isolated from network dispatch and pacing.

    Args:
        phone: Recipient's normalized phone number.
        lines: Sequential list of message strings to send.
        delay: Sleep duration between consecutive messages in seconds.
    """
    for index, line in enumerate(lines):
        if not line:
            continue
        send_whatsapp(to=phone, body=line)
        # Wait between multiple messages to simulate natural typing speed
        if index < len(lines) - 1:
            time.sleep(delay)


def process_incoming(phone: str, text: str, has_media: bool) -> None:
    """
    Main entry point for incoming WhatsApp messages invoked by the webhook.

    Processes the message through handle_message and dispatches all resulting
    lines using send_reply_lines.

    Args:
        phone: Sender's phone number.
        text: Inbound message text.
        has_media: True if an attachment (image/PDF) was included.
    """
    logger.info(
        "Processing incoming message from %s: text=%r, has_media=%s",
        phone,
        text,
        has_media,
    )
    responses = handle_message(phone=phone, text=text, has_media=has_media)
    send_reply_lines(phone=phone, lines=responses, delay=0.7)
