"""
Twilio WhatsApp webhook route.

POST /webhook — Receives inbound WhatsApp webhook callbacks from Twilio.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, BackgroundTasks, Form, Response

from app.services.conversation import process_incoming

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Webhook"])

EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


def _safe_process_incoming(phone: str, text: str, has_media: bool) -> None:
    """
    Execute background conversation processing safely without raising exceptions.

    Args:
        phone: Sender's phone number.
        text: Stripped message body text.
        has_media: Flag indicating presence of media files.
    """
    try:
        process_incoming(phone=phone, text=text, has_media=has_media)
    except Exception as exc:
        logger.exception(
            "Unhandled error in background conversation processing for %s: %s",
            phone,
            exc,
        )


@router.post(
    "/webhook",
    summary="Twilio WhatsApp inbound webhook",
    response_class=Response,
)
async def webhook(
    background_tasks: BackgroundTasks,
    From: str = Form(..., description="Twilio sender WhatsApp ID"),
    Body: str = Form("", description="Inbound message body text"),
    NumMedia: str = Form("0", description="Count of attached media items"),
    MediaUrl0: str | None = Form(None, description="URL of first media item"),
    MediaContentType0: str | None = Form(None, description="Content-Type of first media item"),
) -> Response:
    """
    Handle inbound WhatsApp messages sent by Twilio.

    Logs incoming payload, schedules message processing as an asynchronous
    background task to avoid Twilio HTTP timeout, and responds immediately
    with an empty TwiML XML document.
    """
    logger.info(
        "Twilio webhook received: From=%s, Body=%r, NumMedia=%s, MediaUrl0=%s, MediaContentType0=%s",
        From,
        Body,
        NumMedia,
        MediaUrl0,
        MediaContentType0,
    )

    try:
        has_media = int(NumMedia) > 0
    except (ValueError, TypeError):
        has_media = False

    # Execute conversation processing in the background
    background_tasks.add_task(
        _safe_process_incoming,
        phone=From,
        text=Body.strip(),
        has_media=has_media,
    )

    # Respond immediately with empty TwiML XML
    return Response(
        content=EMPTY_TWIML,
        media_type="application/xml",
        status_code=200,
    )
