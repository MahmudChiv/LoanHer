"""
Health-check route.  This is the ONLY fully implemented route in the scaffolding.

GET /health  → {"status": "ok", "version": "0.1.0", "environment": "<env>"}
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.config import get_settings

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service health check")
async def health() -> JSONResponse:
    """Return 200 when the service is running."""
    settings = get_settings()
    return JSONResponse(
        content={
            "status": "ok",
            "version": "0.1.0",
            "environment": settings.ENVIRONMENT,
        }
    )
