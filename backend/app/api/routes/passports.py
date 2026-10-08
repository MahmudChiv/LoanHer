"""
Passport retrieval route.

GET /api/passports/{id}  — Return a single Passport by its UUID.

TODO: Implement in ClickUp task #PASSPORT-01
      - Look up passport_id in store.passports
      - Raise 404 if not found
      - Return serialised Passport model
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Passports"])


@router.get("/passports/{passport_id}", summary="Get a Passport by ID (stub)")
async def get_passport(passport_id: str):
    """Stub — see module docstring for implementation notes."""
    # TODO: #PASSPORT-01
    return {"detail": "not implemented", "passport_id": passport_id}
