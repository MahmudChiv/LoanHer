"""
Collector (ajo group leader) verification loop.

Manages outbound requests and inbound confirmations for ajo savings groups.
"""

from __future__ import annotations

import logging
import re

from app import store
from app.services import applications, passport
from app.services import messages as msg
from app.services.whatsapp import send_whatsapp

logger = logging.getLogger(__name__)


def start_collector_verification(applicant_phone: str) -> None:
    """
    Initiate verification loop by messaging the collector.

    Reads collector metadata from applicant conversation data, creates a pending
    verification entry in store.pending_verifications, and sends an outbound
    WhatsApp verification question to the collector.
    """
    logger.info("Initiating collector verification for applicant %s", applicant_phone)
    conv = store.conversations.get(applicant_phone, {})
    data = conv.get("data", {}) if isinstance(conv, dict) else {}

    collector_phone = data.get("collectorPhone") or data.get("collector_phone")
    if not collector_phone:
        logger.warning("No collector phone found for applicant %s", applicant_phone)
        return

    applicant_name = (
        data.get("name")
        or data.get("applicantName")
        or data.get("firstName")
        or "Applicant"
    )
    amount = data.get("ajoAmount") or data.get("amount") or 0
    frequency = data.get("ajoFrequency") or data.get("frequency") or "weekly"
    months = data.get("ajoMonths") or data.get("months") or 0

    store.pending_verifications[collector_phone] = {
        "applicantPhone": applicant_phone,
        "applicantName": applicant_name,
        "amount": amount,
        "frequency": frequency,
        "months": months,
        "step": "confirm",
        "lateCount": None,
    }

    question_text = msg.collector_question(
        applicant_name=applicant_name,
        amount=amount,
        frequency=frequency,
        months=months,
    )
    send_whatsapp(to=collector_phone, body=question_text)


def is_collector_with_pending(phone: str) -> bool:
    """
    Check if the phone number belongs to a collector with an active pending verification request.
    """
    if phone not in store.pending_verifications:
        return False
    pending = store.pending_verifications[phone]
    return pending.get("step") != "done"


def _parse_late_count(text: str) -> int | None:
    """
    Parse a non-negative integer from the collector's reply text.
    Handles '3', '3 times', '0', 'none', 'no', 'zero'.
    """
    cleaned = text.strip().lower()
    if cleaned in ("none", "no", "zero", "nil", "n/a"):
        return 0

    match = re.search(r"\b(\d+)\b", cleaned)
    if match:
        try:
            val = int(match.group(1))
            if val >= 0:
                return val
        except ValueError:
            pass
    return None


def handle_collector_message(phone: str, text: str) -> list[str]:
    """
    Handle response from an ajo collector. Supports 1-step verification.
    """
    logger.info("Collector reply received from %s: %r", phone, text)
    if not is_collector_with_pending(phone):
        return [msg.FALLBACK]

    pending = store.pending_verifications[phone]
    cleaned_text = text.strip().lower()

    # If collector rejects or says NO / 2 / incorrect / false
    if cleaned_text in ("2", "no", "n", "incorrect", "false"):
        applicant_phone = pending["applicantPhone"]
        if applicant_phone in store.conversations:
            conv_data = store.conversations[applicant_phone].setdefault("data", {})
            conv_data["ajoStatus"] = "not-confirmed"
            passport_id = conv_data.get("passportId")
            if passport_id and passport_id in store.passports:
                pass_dict = store.passports[passport_id]
                ajo_dict = pass_dict.setdefault("ajo", {})
                ajo_dict["verificationStatus"] = "not-confirmed"
                passport.compute_passport(passport_id)
                applications.refresh_application_for_passport(passport_id)

        send_whatsapp(to=applicant_phone, body=msg.applicant_ajo_not_confirmed())
        pending["step"] = "done"
        return [msg.COLLECTOR_NOT_CONFIRMED_ACK]

    # Parse late payment count directly (e.g. 0, 1, 3, "0", "none")
    late_val = _parse_late_count(text)
    if late_val is not None:
        freq_raw = str(pending.get("frequency", "weekly")).lower()
        if "week" in freq_raw:
            periods = 52
            unit = "weeks"
        elif "month" in freq_raw:
            periods = 12
            unit = "months"
        elif "day" in freq_raw or "daily" in freq_raw:
            periods = 365
            unit = "days"
        else:
            periods = 52
            unit = "weeks"

        late_clamped = min(late_val, periods)
        on_time_record = f"{periods - late_clamped} of {periods} {unit}"

        applicant_phone = pending["applicantPhone"]
        if applicant_phone in store.conversations:
            conv_data = store.conversations[applicant_phone].setdefault("data", {})
            conv_data["ajoStatus"] = "collector-confirmed"
            conv_data["ajoOnTimeRecord"] = on_time_record

            passport_id = conv_data.get("passportId")
            if passport_id and passport_id in store.passports:
                pass_dict = store.passports[passport_id]
                ajo_dict = pass_dict.setdefault("ajo", {})
                ajo_dict["verificationStatus"] = "collector-confirmed"
                ajo_dict["onTimeRecord"] = on_time_record
                passport.compute_passport(passport_id)
                applications.refresh_application_for_passport(passport_id)

        send_whatsapp(to=applicant_phone, body=msg.applicant_ajo_confirmed())
        pending["step"] = "done"
        return [msg.COLLECTOR_THANKS]

    return [msg.COLLECTOR_INVALID_LATE]
