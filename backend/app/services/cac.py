"""
Simulated CAC (Corporate Affairs Commission) lookup.

Reads from data/cac_records.json to provide mock business verification.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from app.config import get_settings

logger = logging.getLogger(__name__)


def _get_cac_records() -> list[dict]:
    """Load CAC records from data/cac_records.json."""
    settings = get_settings()
    configured = Path(settings.DATA_DIR) / "cac_records.json"
    if configured.is_file():
        path = configured
    else:
        backend_dir = Path(__file__).resolve().parent.parent
        path = (backend_dir.parent / "data" / "cac_records.json").resolve()

    if not path.is_file():
        logger.warning("CAC records file not found at %s", path)
        return []

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Error reading CAC records from %s: %s", path, exc)
        return []


def lookup_cac(number: str, name: str) -> dict:
    """
    Perform a simulated lookup against CAC records.

    TODO: Implement in ClickUp task #CAC-01

    Args:
        number: Registration number (e.g. 'BN 1234567', 'RC 3456789').
        name: Business owner name provided by the applicant.

    Returns:
        dict: Shape {"verified": bool, "record": dict | None, "reason": "ok" | "not_found" | "name_mismatch" | "inactive"}
    """
    clean_num = number.replace(" ", "").replace("-", "").upper()
    records = _get_cac_records()

    match_record = None
    for record in records:
        rec_num = record.get("number", "").replace(" ", "").replace("-", "").upper()
        if rec_num == clean_num:
            match_record = record
            break

    if not match_record:
        return {"verified": False, "record": None, "reason": "not_found"}

    # Check active status
    if match_record.get("status", "").lower() != "active":
        return {"verified": False, "record": match_record, "reason": "inactive"}

    # Check name match (flexible token matching on first or last name)
    owner_name = match_record.get("ownerName", "").lower()
    provided_tokens = [t.lower() for t in name.split() if len(t) > 2]
    name_matched = any(token in owner_name for token in provided_tokens) if provided_tokens else False

    if not name_matched:
        return {"verified": False, "record": match_record, "reason": "name_mismatch"}

    return {"verified": True, "record": match_record, "reason": "ok"}
