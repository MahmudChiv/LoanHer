"""
Application configuration via pydantic-settings.

Values are read from environment variables (or a .env file if present).
Every field has a safe default so the app starts without any .env file —
useful for CI and first-time local runs.

Usage::

    from app.config import get_settings
    settings = get_settings()
    print(settings.ENVIRONMENT)
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All configuration knobs for the LoanHer backend."""

    # ------------------------------------------------------------------
    # Twilio credentials
    # Replace these with real values in your local .env (never commit .env).
    # ------------------------------------------------------------------
    TWILIO_ACCOUNT_SID: str = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    TWILIO_AUTH_TOKEN: str = "your_twilio_auth_token"
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"

    # ------------------------------------------------------------------
    # URLs / CORS
    # ------------------------------------------------------------------
    FRONTEND_URL: str = "http://localhost:3000"
    # Set to "*" to allow all origins (fine for hackathon dev).
    CORS_ORIGIN: str = "*"

    # ------------------------------------------------------------------
    # Demo / prototype
    # ------------------------------------------------------------------
    # A secret that must be passed when calling POST /api/demo/reset.
    # Set in .env so the reset endpoint isn't public on the deployed prototype.
    DEMO_RESET_SECRET: str = "change_me"

    # ------------------------------------------------------------------
    # Data directory
    # The backend reads dummy fixture files (cac_records.json, etc.) from here.
    # Default resolves to <repo-root>/data relative to the backend/ directory.
    # ------------------------------------------------------------------
    DATA_DIR: str = "../data"

    # ------------------------------------------------------------------
    # Runtime environment
    # ------------------------------------------------------------------
    ENVIRONMENT: str = "development"

    # Tell pydantic-settings to read from a .env file if one exists.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def data_path(self) -> Path:
        """Resolved absolute path to the data directory."""
        return Path(self.DATA_DIR).resolve()


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton (safe to call anywhere)."""
    return Settings()
