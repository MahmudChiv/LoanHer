"""
Application creation and forwarding service.

Called when the applicant completes their flow or replies SEND to submit
their application to Wema Bank.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import List

from app import store
from app.services import messages as msg
from app.services import passport

logger = logging.getLogger(__name__)


def _generate_next_ref() -> str:
    """
    Generate the next sequential reference number like "WB-1003".

    Reads all existing references in store.applications, parses numeric parts
    starting with "WB-", and returns WB-<highest + 1>. Defaults to WB-1003 if
    seed data consists of WB-1001 and WB-1002.
    """
    highest_num = 1002
    for ref_key in store.applications:
        match = re.match(r"^WB-(\d+)$", ref_key)
        if match:
            try:
                val = int(match.group(1))
                if val > highest_num:
                    highest_num = val
            except ValueError:
                pass
    next_num = highest_num + 1
    return f"WB-{next_num:04d}"


def handle_send(phone: str) -> List[str]:
    """
    Handle the 'SEND' command from an applicant to forward their Passport to Wema Bank.

    - Verifies applicant has an existing passport.
    - Prevents duplicate applications for the same passport ID.
    - Creates a new application entry with status="submitted" and UTC timestamp.
    """
    logger.info("Forwarding application request for phone %s", phone)
    conv = store.conversations.get(phone, {})
    conv_data = conv.get("data", {}) if isinstance(conv, dict) else {}
    passport_id = conv_data.get("passportId")

    if not passport_id or passport_id not in store.passports:
        return [msg.NEED_PASSPORT_FIRST]

    # Check if an application already exists for this passport ID
    for existing_app in store.applications.values():
        if isinstance(existing_app, dict) and existing_app.get("passportId") == passport_id:
            existing_ref = existing_app.get("ref", "WB-EXISTING")
            return [msg.already_sent(existing_ref)]

    # Generate new application
    ref = _generate_next_ref()
    pass_data = passport.compute_passport(passport_id)

    applicant_name = (
        pass_data.get("applicantName")
        or conv_data.get("name")
        or conv_data.get("applicantName")
        or "Applicant"
    )
    business_name = (
        pass_data.get("businessName")
        or conv_data.get("businessName")
        or "Business"
    )
    band = pass_data.get("band", "C")
    score = pass_data.get("score", 70)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    new_app = {
        "ref": ref,
        "passportId": passport_id,
        "applicantName": applicant_name,
        "businessName": business_name,
        "band": band,
        "score": score,
        "status": "submitted",
        "submittedAt": now_iso,
        "consentedAt": now_iso,
    }

    store.applications[ref] = new_app
    logger.info("Created application %s for passport %s", ref, passport_id)

    return [msg.sent_to_wema(ref)]


def refresh_application_for_passport(passport_id: str) -> None:
    """
    Copy the passport's current band and score onto any application that references it.
    """
    logger.info("Refreshing applications referencing passport ID: %s", passport_id)
    fresh_pass = passport.compute_passport(passport_id)
    new_band = fresh_pass.get("band")
    new_score = fresh_pass.get("score")

    for app_dict in store.applications.values():
        if isinstance(app_dict, dict) and app_dict.get("passportId") == passport_id:
            if new_band is not None:
                app_dict["band"] = new_band
            if new_score is not None:
                app_dict["score"] = new_score
