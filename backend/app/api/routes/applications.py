"""
Application management API routes for the officer dashboard.

Endpoints:
    GET    /api/applications           — list all applications (newest first)
    GET    /api/applications/{ref}     — get a single application & computed passport
    PATCH  /api/applications/{ref}     — update application status
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status

from app import store
from app.models.schemas import UpdateStatusPayload
from app.services import passport

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Applications"])


@router.get("/applications", response_model=List[Dict[str, Any]], summary="List all applications")
async def list_applications() -> List[Dict[str, Any]]:
    """
    List all submitted applications, ordered newest first by submittedAt timestamp.
    """
    apps_list = [app for app in store.applications.values() if isinstance(app, dict)]
    sorted_apps = sorted(
        apps_list,
        key=lambda x: str(x.get("submittedAt", "")),
        reverse=True,
    )
    return sorted_apps


@router.get(
    "/applications/{ref}",
    response_model=Dict[str, Any],
    summary="Get application and passport detail by reference",
)
async def get_application(ref: str) -> Dict[str, Any]:
    """
    Retrieve application details and associated freshly computed Passport by reference.
    """
    if ref not in store.applications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{ref}' not found",
        )

    app_data = store.applications[ref]
    passport_id = app_data.get("passportId")

    if not passport_id or passport_id not in store.passports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Passport for application '{ref}' not found",
        )

    fresh_passport = passport.compute_passport(passport_id)
    return {
        "application": app_data,
        "passport": fresh_passport,
    }


@router.patch(
    "/applications/{ref}",
    response_model=Dict[str, Any],
    summary="Update application status",
)
async def update_application_status(
    ref: str, payload: UpdateStatusPayload
) -> Dict[str, Any]:
    """
    Update the status of an application (officer action).
    """
    if ref not in store.applications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{ref}' not found",
        )

    app_data = store.applications[ref]
    app_data["status"] = payload.status.value
    logger.info("Updated application %s status to %s", ref, payload.status.value)
    return app_data
