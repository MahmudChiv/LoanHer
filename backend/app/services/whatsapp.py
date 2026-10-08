"""
WhatsApp message sender service for LoenHer.

Sends outbound WhatsApp messages via Twilio's WhatsApp sandbox or API.
Supports dry-run mode when Twilio credentials are not configured, logging
and printing outgoing messages without network errors.
"""

from __future__ import annotations

import logging
import re

from app.config import get_settings

# pyrefly: ignore [missing-import]
from twilio.base.exceptions import TwilioRestException
# pyrefly: ignore [missing-import]
from twilio.rest import Client

logger = logging.getLogger(__name__)


def normalize_recipient(phone: str) -> str:
    """
    Ensure the recipient number is formatted as 'whatsapp:+234XXXXXXXXXX'.

    Accepts phone numbers with or without the 'whatsapp:' prefix, and normalizes
    Nigerian local numbers (e.g. 08031234567 -> whatsapp:+2348031234567).

    Args:
        phone: Raw recipient phone number.

    Returns:
        str: Formatted phone string with 'whatsapp:+' prefix.
    """
    cleaned = phone.strip()

    # Remove existing 'whatsapp:' prefix if present
    if cleaned.lower().startswith("whatsapp:"):
        cleaned = cleaned[len("whatsapp:") :].strip()

    # Remove formatting characters
    cleaned = re.sub(r"[\s\-\(\)\.]", "", cleaned)

    # Convert Nigerian local number starting with 0
    if cleaned.startswith("0"):
        cleaned = f"+234{cleaned[1:]}"
    elif cleaned.startswith("234"):
        cleaned = f"+{cleaned}"
    elif not cleaned.startswith("+"):
        cleaned = f"+{cleaned}"

    return f"whatsapp:{cleaned}"


def _is_twilio_configured() -> bool:
    """
    Check whether valid Twilio credentials are configured in settings.

    Returns False if any credential is missing or set to a placeholder default.
    """
    settings = get_settings()
    sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
    token = (settings.TWILIO_AUTH_TOKEN or "").strip()
    from_num = (settings.TWILIO_WHATSAPP_FROM or "").strip()

    if not sid or not token or not from_num:
        return False

    # Check for placeholder values from .env.example
    if sid in ("ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "your_twilio_account_sid") or sid.startswith("your_"):
        return False
    if token in ("your_twilio_auth_token", "change_me") or token.startswith("your_"):
        return False

    return True


def send_whatsapp(to: str, body: str) -> str | None:
    """
    Send a WhatsApp message via Twilio REST client.

    If Twilio credentials are missing, operates in DRY-RUN mode by logging
    and printing the message, then returning None.

    Args:
        to: Recipient phone number (with or without 'whatsapp:' prefix).
        body: Message content.

    Returns:
        str | None: Twilio message SID on success, or None on failure / dry run.
    """
    settings = get_settings()
    to_formatted = normalize_recipient(to)

    # DRY-RUN MODE: When credentials are not configured or set to placeholders
    if not _is_twilio_configured():
        dry_run_msg = f"[DRY RUN] to={to_formatted} body={body}"
        logger.info(dry_run_msg)
        print(dry_run_msg)
        return None

    # Format sender number to guarantee whatsapp: prefix
    from_formatted = settings.TWILIO_WHATSAPP_FROM.strip()
    if not from_formatted.lower().startswith("whatsapp:"):
        from_formatted = f"whatsapp:{from_formatted}"

    try:
        # Never log or print the auth token
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            to=to_formatted,
            from_=from_formatted,
            body=body,
        )
        logger.info("Sent WhatsApp message to %s (SID: %s)", to_formatted, message.sid)
        return message.sid

    except TwilioRestException as exc:
        logger.error(
            "Twilio error sending message to %s: HTTP %s (Code %s) - %s",
            to_formatted,
            exc.status,
            exc.code,
            exc.msg,
        )
        return None
    except Exception as exc:
        logger.error(
            "Unexpected error sending WhatsApp message to %s: %s",
            to_formatted,
            exc,
        )
        return None
