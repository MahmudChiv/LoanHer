"""In-memory state store for the LoenHer prototype.

Because this is a hackathon prototype with a single worker, all state
lives in plain Python dicts. Nothing persists across server restarts.

Keys for each dict:
    conversations           : phone_number (str)  -> ConversationState + collected fields
    passports               : passport_id (str)   -> Passport dict or model
    pending_verifications   : phone_number (str)  -> verification metadata dict
    applications            : ref (str)           -> Application dict or model
"""

import json
import logging
from pathlib import Path
from app.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level state stores
# ---------------------------------------------------------------------------
conversations: dict = {}
passports: dict = {}
pending_verifications: dict = {}
applications: dict = {}


def _resolve_data_file(filename: str) -> Path | None:
    """Find data fixture file across potential relative locations."""
    settings = get_settings()
    candidates = [
        settings.data_path / filename,
        Path(settings.DATA_DIR) / filename,
        Path("data") / filename,
        Path("../data") / filename,
    ]
    for path in candidates:
        try:
            resolved = path.resolve()
            if resolved.exists() and resolved.is_file():
                return resolved
        except Exception:
            continue
    return None


def load_seed_data() -> None:
    """Read seed JSON fixture files into the in-memory store.

    Loads data/passports_seed.json into passports (keyed by 'id').
    Loads data/applications_seed.json into applications (keyed by 'ref').
    Logs a warning and continues gracefully if any file is missing.
    """
    # 1. Load passports_seed.json
    passports_path = _resolve_data_file("passports_seed.json")
    if passports_path:
        try:
            with open(passports_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        passport_id = item.get("id")
                        if passport_id:
                            passports[passport_id] = item
                    logger.info("Loaded %d seed passports from %s", len(passports), passports_path)
        except Exception as exc:
            logger.error("Failed to parse passports_seed.json: %s", exc)
    else:
        logger.warning("Seed data file passports_seed.json not found, skipping.")

    # 2. Load applications_seed.json
    apps_path = _resolve_data_file("applications_seed.json")
    if apps_path:
        try:
            with open(apps_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        ref = item.get("ref")
                        if ref:
                            applications[ref] = item
                    logger.info("Loaded %d seed applications from %s", len(applications), apps_path)
        except Exception as exc:
            logger.error("Failed to parse applications_seed.json: %s", exc)
    else:
        logger.warning("Seed data file applications_seed.json not found, skipping.")


def reset_store() -> None:
    """Clear all in-memory dictionaries and re-populate with seed fixture data."""
    conversations.clear()
    passports.clear()
    pending_verifications.clear()
    applications.clear()
    load_seed_data()
