"""
Twilio WhatsApp webhook route.

POST /webhook  — Twilio sends every inbound WhatsApp message here.

TODO: Implement in ClickUp task #WEBHOOK-01
      - Validate Twilio signature (use RequestValidator from the twilio library)
      - Parse Form data (From, Body, MediaUrl0)
      - Look up or create a ConversationState in store.conversations
      - Delegate to services.conversation.handle_message()
      - Return a TwiML response
"""

from fastapi import APIRouter

router = APIRouter(tags=["Webhook"])


@router.post("/webhook", summary="Twilio WhatsApp inbound webhook (stub)")
async def webhook():
    """Stub — see module docstring for implementation notes."""
    # TODO: #WEBHOOK-01
    return {"detail": "not implemented"}
