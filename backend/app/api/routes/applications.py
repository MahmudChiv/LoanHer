"""
Application management routes for the officer dashboard.

Endpoints (all stubs):
    GET    /api/applications           — list all applications
    GET    /api/applications/{ref}     — get a single application by ref
    PATCH  /api/applications/{ref}     — update an application's status

TODO: Implement in ClickUp task #APPLICATIONS-01
      - List:   return store.applications.values() as a sorted list
      - Get:    look up by ref, raise 404 if missing
      - Patch:  validate the new status enum value, update store, return updated record
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Applications"])


@router.get("/applications", summary="List all applications (stub)")
async def list_applications():
    """Stub — see module docstring for implementation notes."""
    # TODO: #APPLICATIONS-01
    return {"detail": "not implemented"}


@router.get("/applications/{ref}", summary="Get an application by ref (stub)")
async def get_application(ref: str):
    """Stub — see module docstring for implementation notes."""
    # TODO: #APPLICATIONS-01
    return {"detail": "not implemented", "ref": ref}


@router.patch("/applications/{ref}", summary="Update application status (stub)")
async def update_application_status(ref: str):
    """Stub — see module docstring for implementation notes."""
    # TODO: #APPLICATIONS-01
    return {"detail": "not implemented", "ref": ref}
