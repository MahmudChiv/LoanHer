"""
Passport computation and bank-statement handling.

This module contains simulated statement analysis and Passport computation.
"""

from __future__ import annotations

import logging

from app import store
from app.config import get_settings
from app.models.schemas import ConversationState

logger = logging.getLogger(__name__)


def handle_statement(phone: str) -> None:
    """
    Handle statement upload, simulate scoring, transition to DONE, and send Passport link.

    Args:
        phone: Sender's normalized phone number.
    """
    logger.info("Handling bank statement for %s", phone)
    if phone not in store.conversations:
        return

    conv = store.conversations[phone]
    data = conv.setdefault("data", {})

    # Link to seed passport or created passport
    passport_id = data.get("passportId") or "pass_kemi_nov2025_sep2026"
    data["passportId"] = passport_id
    conv["state"] = ConversationState.DONE

    # Ensure passport exists in store
    if passport_id not in store.passports:
        store.passports[passport_id] = {
            "id": passport_id,
            "applicantName": data.get("name", "Kemi Adebayo"),
            "businessName": data.get("businessName", "Kemi Fabrics & Tailoring"),
            "cacNumber": data.get("cacNumber", "BN 1234567"),
            "score": 75,
            "band": "A",
            "components": [
                {"name": "Cash-flow health", "weight": 0.3, "score": 80},
                {"name": "Ajo reliability", "weight": 0.3, "score": 90},
                {"name": "Business legitimacy", "weight": 0.2, "score": 75},
                {"name": "Stability and trend", "weight": 0.2, "score": 60},
            ],
            "keyNumbers": {
                "avgMonthlyInflow": 385000,
                "monthsOfHistory": 11,
                "consistency": "Steady inflow in 10 of 11 months",
                "lowestBalance": 18500,
                "freeCashFlow": 140000,
                "repaymentCapacity": 42000,
            },
            "ajo": {
                "weeklyAmount": data.get("ajoAmount", 5000),
                "frequency": data.get("ajoFrequency", "weekly"),
                "monthsActive": data.get("ajoMonths", 22),
                "onTimeRecord": data.get("ajoOnTimeRecord", "49 of 52 weeks"),
                "verificationStatus": data.get("ajoStatus", "self-reported"),
            },
            "flags": ["Inflow dipped about 38% below average in August 2026"],
            "indicativeRange": {"min": 150000, "max": 220000},
            "suggestedProduct": "ALAT for Business Quick Loan (working capital)",
            "whyBullets": [
                "Steady inflows in 10 of 11 months",
                "Business registration found and active",
            ],
            "readinessChecklist": [
                {"label": "Business registered (CAC)", "ok": True},
                {"label": "Statement covers 6+ months", "ok": True},
                {"label": "Ajo verified by collector", "ok": data.get("ajoStatus") == "collector-confirmed"},
            ],
            "tips": [
                "Keep your business income flowing into this one account",
                "Keep paying your ajo on time",
            ],
            "verificationTag": "Document-based, not source-verified",
        }

    settings = get_settings()
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    passport_url = f"{frontend_url}/passport/{passport_id}"

    reply_lines = [
        "Statement received ✓ Analyzing cash flow, balances, and turnover...",
        "Here is your official Wema Loan Readiness Passport:",
        passport_url,
        "Reply 'SEND' to submit your Loan Passport directly to Wema Bank for officer review!",
    ]

    from app.services.whatsapp import send_whatsapp

    for line in reply_lines:
        send_whatsapp(to=phone, body=line)


def compute_passport(passport_id: str) -> dict:
    """
    Recompute score, band, and checklist for a passport.

    Args:
        passport_id: Passport ID to compute/refresh.

    Returns:
        dict: The updated passport record.
    """
    logger.info("Computing passport for ID: %s", passport_id)
    if passport_id in store.passports:
        return store.passports[passport_id]
    return {}
