"""
In-memory state store for the LoenHer prototype.

Because this is a hackathon prototype running with a single worker, all state
lives in plain Python dicts. Nothing persists across server restarts.

Shared dictionaries:
    conversations           : phone_number (str) -> dict of conversation state and fields
    passports               : passport_id (str)  -> serialized Passport dictionary
    pending_verifications   : phone_number (str) -> verification metadata dictionary
    applications            : ref (str)          -> serialized Application dictionary
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from app.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level state dicts
# ---------------------------------------------------------------------------
conversations: dict[str, dict] = {}
passports: dict[str, dict] = {}
pending_verifications: dict[str, dict] = {}
applications: dict[str, dict] = {}


def _resolve_data_dir() -> Path:
    """
    Resolve the path to the data fixture directory.

    Checks the configured path, backend relative paths, and workspace root data directory
    to ensure files are resolved correctly regardless of current working directory.
    """
    settings = get_settings()
    configured = Path(settings.DATA_DIR)
    if configured.is_dir():
        return configured.resolve()

    backend_dir = Path(__file__).resolve().parent.parent
    backend_relative = (backend_dir / settings.DATA_DIR).resolve()
    if backend_relative.is_dir():
        return backend_relative

    workspace_data = (backend_dir.parent / "data").resolve()
    if workspace_data.is_dir():
        return workspace_data

    return configured.resolve()


def load_seed_data() -> None:
    """
    Load initial seed data from JSON fixture files into the store.

    Populates:
      - passports: from data/passports_seed.json (keyed by 'id')
      - applications: from data/applications_seed.json (keyed by 'ref')

    If a file does not exist, logs a warning and continues without failing.
    """
    data_dir = _resolve_data_dir()

    # 1. Load passports_seed.json
    passports_path = data_dir / "passports_seed.json"
    if passports_path.is_file():
        try:
            with open(passports_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "id" in item:
                        passports[item["id"]] = item
                logger.info("Loaded %d seed passports from %s", len(passports), passports_path)
            else:
                logger.warning("Expected list in %s, got %s", passports_path, type(data))
        except Exception as exc:
            logger.warning("Failed to load passports seed from %s: %s", passports_path, exc)
    else:
        logger.warning("Passports seed file missing at %s", passports_path)

    # 2. Load applications_seed.json
    applications_path = data_dir / "applications_seed.json"
    if applications_path.is_file():
        try:
            with open(applications_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "ref" in item:
                        applications[item["ref"]] = item
                logger.info("Loaded %d seed applications from %s", len(applications), applications_path)
            else:
                logger.warning("Expected list in %s, got %s", applications_path, type(data))
        except Exception as exc:
            logger.warning("Failed to load applications seed from %s: %s", applications_path, exc)
    else:
        logger.warning("Applications seed file missing at %s", applications_path)


def reset_store() -> None:
    """
    Clear all in-memory store dicts and reload initial seed data.
    """
    conversations.clear()
    passports.clear()
    pending_verifications.clear()
    applications.clear()
    logger.info("Cleared in-memory state; reloading seed data...")
    load_seed_data()
