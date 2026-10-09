"""
LoanHer FastAPI application entry point.

Sets up CORS, lifespan startup tasks (seed data loading), and includes all route modules.
Run with:
    uvicorn app.main:app --reload   (from the backend/ directory)
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import applications, demo, health, passports, webhook
from app.config import get_settings
from app.store import load_seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.

    Loads initial seed data fixtures into in-memory dictionaries on startup.
    """
    load_seed_data()
    yield


settings = get_settings()

app = FastAPI(
    title="LoanHer API",
    description="WhatsApp loan-readiness tool for women-led SMEs in Nigeria.",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# Allow all origins in development; otherwise restrict to settings.CORS_ORIGIN.
# ---------------------------------------------------------------------------
if settings.ENVIRONMENT.lower() == "development" or settings.CORS_ORIGIN == "*":
    cors_origins = ["*"]
else:
    cors_origins = [settings.CORS_ORIGIN]

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
app.include_router(health.router)        # GET  /health
app.include_router(webhook.router)       # POST /webhook
app.include_router(passports.router)     # GET  /api/passports/{passport_id}
app.include_router(applications.router)  # /api/applications...
app.include_router(demo.router)          # POST /api/demo/reset


