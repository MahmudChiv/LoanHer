"""Twilio WhatsApp inbound webhook route.

Receives inbound messages from Twilio, logs payload, responds immediately
with empty TwiML, and triggers conversation processing in a background task.
"""

import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Form, Response

from app.services import conversation

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Webhook"])

TWIML_EMPTY_RESPONSE = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


def _safe_process_incoming(phone: str, text: str, has_media: bool) -> None:
    """Wrapper around conversation.process_incoming to ensure exceptions are logged, never raised."""
    try:
        conversation.process_incoming(phone=phone, text=text, has_media=has_media)
    except Exception as exc:
        logger.exception("Error processing incoming message from %s: %s", phone, exc)


@router.post(
    "/webhook",
    summary="Twilio WhatsApp inbound webhook",
    response_class=Response,
)
async def webhook(
    background_tasks: BackgroundTasks,
    From: str = Form(...),
    Body: str = Form(""),
    NumMedia: str = Form("0"),
    MediaUrl0: Optional[str] = Form(None),
    MediaContentType0: Optional[str] = Form(None),
) -> Response:
    """Receive Twilio form-encoded incoming WhatsApp messages.

    Responds immediately with empty TwiML XML and delegates conversation processing
    to a background task so Twilio webhooks never time out.
    """
    logger.info(
        "Webhook received: From=%s, Body=%s, NumMedia=%s, MediaUrl0=%s, MediaContentType0=%s",
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

    clean_text = Body.strip() if Body else ""

    background_tasks.add_task(
        _safe_process_incoming,
        phone=From,
        text=clean_text,
        has_media=has_media,
    )

    return Response(
        content=TWIML_EMPTY_RESPONSE,
        media_type="application/xml",
    )
