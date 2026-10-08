"""WhatsApp message sender helper using the Twilio REST API.

Supports both live sending via Twilio and dry-run mode when credentials
are not configured.
"""

import logging
from app.config import get_settings

logger = logging.getLogger(__name__)


def send_whatsapp(to: str, body: str) -> str | None:
    """Send an outbound WhatsApp message using the Twilio REST client.

    Accepts 'to' with or without the 'whatsapp:' prefix.

    DRY-RUN MODE:
        If Twilio credentials are missing, empty, or placeholder values,
        logs and prints "[DRY RUN] to=<to> body=<body>" and returns None
        without failing.

    Catches and logs all Twilio errors (never crashes the application)
    and returns None on failure.

    Returns the message SID string on success.
    """
    settings = get_settings()
    account_sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
    auth_token = (settings.TWILIO_AUTH_TOKEN or "").strip()
    from_number = (settings.TWILIO_WHATSAPP_FROM or "").strip()

    # Normalize 'to' recipient with the "whatsapp:" prefix
    normalized_to = to if to.startswith("whatsapp:") else f"whatsapp:{to}"

    # Normalize 'from' sender with the "whatsapp:" prefix
    normalized_from = (
        from_number
        if from_number.startswith("whatsapp:")
        else f"whatsapp:{from_number}"
    )

    # Check for missing, blank, or placeholder credentials -> DRY-RUN MODE
    is_missing_credentials = (
        not account_sid
        or not auth_token
        or account_sid.startswith("ACxxxx")
        or "your_twilio" in account_sid.lower()
        or "your_twilio" in auth_token.lower()
    )

    if is_missing_credentials:
        dry_run_output = f"[DRY RUN] to={normalized_to} body={body}"
        logger.info(dry_run_output)
        print(dry_run_output)
        return None

    try:
        from twilio.rest import Client

        client = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=normalized_from,
            to=normalized_to,
            body=body,
        )
        logger.info("Sent WhatsApp message %s to %s", message.sid, normalized_to)
        return str(message.sid)
    except Exception as exc:
        logger.error(
            "Twilio error while sending WhatsApp message to %s: %s",
            normalized_to,
            exc,
        )
        return None
