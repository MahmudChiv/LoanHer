"""
Demo helper route.

POST /api/demo/reset  — Wipe all in-memory state and reload seed data.
Intended for live demos: reset everything to a known good starting point
without restarting the server.

TODO: Implement in ClickUp task #DEMO-01
      - Require DEMO_RESET_SECRET in the request body or header
      - Clear store.conversations, store.passports, store.pending_verifications,
        store.applications
      - Optionally reload fixture seed data from DATA_DIR
      - Return {"reset": true}
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Demo"])


@router.post("/demo/reset", summary="Reset all in-memory state for demo (stub)")
async def demo_reset():
    """Stub — see module docstring for implementation notes."""
    # TODO: #DEMO-01
    return {"detail": "not implemented"}
