"""
Demo helper routes for the LoanHer prototype.

POST /api/demo/reset — Wipe all in-memory state and reload initial seed data.

NOTE: Do not change the WhatsApp RESET keyword behavior. WhatsApp RESET only clears
one phone number's conversation, whereas POST /api/demo/reset resets the entire store
to seed data for live demo presentations.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException, status

from app import store
from app.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Demo"])


@router.post(
    "/demo/reset",
    response_model=Dict[str, Any],
    summary="Reset all in-memory state to seed data",
)
async def demo_reset(
    x_demo_secret: Optional[str] = Header(None, alias="X-Demo-Secret")
) -> Dict[str, Any]:
    """
    Reset all in-memory store dicts (conversations, passports, pending_verifications,
    applications) and reload seed data from JSON fixture files.

    Requires X-Demo-Secret header if DEMO_RESET_SECRET is configured in backend settings.
    """
    settings = get_settings()
    configured_secret = (settings.DEMO_RESET_SECRET or "").strip()
    if configured_secret and configured_secret != "change_me" and x_demo_secret != configured_secret:
        logger.warning("Unauthorized demo reset attempt with secret: %r", x_demo_secret)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing demo reset secret",
        )

    store.reset_store()
    app_count = len(store.applications)
    logger.info("Demo state reset complete. Total seed applications loaded: %d", app_count)

    return {
        "status": "reset",
        "applications": app_count,
    }
