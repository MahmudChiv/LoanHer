"""
LoenHer FastAPI application entry point.

Sets up CORS, includes all route modules, and exposes the `app` object for
uvicorn:

    uvicorn app.main:app --reload   (run from the backend/ directory)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import applications, demo, health, passports, webhook
from app.config import get_settings

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

settings = get_settings()

app = FastAPI(
    title="LoenHer API",
    description="WhatsApp loan-readiness tool for women-led SMEs in Nigeria.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS
# Allow all origins in development; tighten in production via CORS_ORIGIN env.
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN] if settings.CORS_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(health.router)           # GET /health
app.include_router(webhook.router)          # POST /webhook
app.include_router(passports.router)        # GET  /api/passports/{id}
app.include_router(applications.router)     # /api/applications
app.include_router(demo.router)             # POST /api/demo/reset
