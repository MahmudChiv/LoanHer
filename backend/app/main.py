"""LoenHer FastAPI application entry point.

Sets up CORS, lifespan handler for loading seed data, includes all route
modules, and exposes the `app` object for uvicorn:

    uvicorn app.main:app --reload   (run from the backend/ directory)

IMPORTANT: The server must be run with a SINGLE worker because state is in-memory
(see app/store.py). Multiple workers will have disjoint in-memory dictionaries.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import applications, demo, health, passports, webhook
from app.config import get_settings
from app.store import load_seed_data

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler: loads seed data on startup."""
    load_seed_data()
    yield


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

settings = get_settings()

app = FastAPI(
    title="LoenHer API",
    description="WhatsApp loan-readiness tool for women-led SMEs in Nigeria.",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# Allow all origins in development; tighten in production via CORS_ORIGIN env.
# ---------------------------------------------------------------------------

cors_origins = (
    ["*"]
    if settings.ENVIRONMENT == "development" or settings.CORS_ORIGIN == "*"
    else [settings.CORS_ORIGIN]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
