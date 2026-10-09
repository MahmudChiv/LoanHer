"""
Tests for input parsing utilities in app/services/parsing.py.
"""

from __future__ import annotations

from app.services.parsing import (
    normalize_phone,
    parse_all_ajo_details,
    parse_amount,
    parse_frequency,
    parse_months,
)


def test_parse_amount():
    assert parse_amount("5000") == 5000
    assert parse_amount("50000") == 50000
    assert parse_amount("₦50,000") == 50000
    assert parse_amount("50k") == 50000
    assert parse_amount("50.5k") == 50500
    assert parse_amount("50,000.00") == 50000
    assert parse_amount("invalid") is None


def test_parse_frequency():
    assert parse_frequency("daily") == "daily"
    assert parse_frequency("per day") == "daily"
    assert parse_frequency("weekly") == "weekly"
    assert parse_frequency("every week") == "weekly"
    assert parse_frequency("monthly") == "monthly"
    assert parse_frequency("per month") == "monthly"
    assert parse_frequency("yearly") is None


def test_parse_months():
    assert parse_months("22") == 22
    assert parse_months("22 months") == 22
    assert parse_months("6m") == 6
    assert parse_months("for 12 months") == 12


def test_normalize_phone():
    assert normalize_phone("08053112170") == "whatsapp:+2348053112170"
    assert normalize_phone("+2348053112170") == "whatsapp:+2348053112170"
    assert normalize_phone("whatsapp:+2348053112170") == "whatsapp:+2348053112170"


def test_parse_all_ajo_details_exact_user_bug():
    """
    Test the exact input scenario reported in the bug:
    Input: "5000, weekly, 22, 08053112170"
    Expected: amount=5000, frequency="weekly", months=22, phone="whatsapp:+2348053112170"
    (Previously returned amount=50002208053112170 and months=5000)
    """
    res = parse_all_ajo_details("5000, weekly, 22, 08053112170")
    assert res is not None
    amount, frequency, months, phone = res
    assert amount == 5000
    assert frequency == "weekly"
    assert months == 22
    assert phone == "whatsapp:+2348053112170"


def test_parse_all_ajo_details_variations():
    # K-notation with comma separation
    res1 = parse_all_ajo_details("50k, weekly, 22, 08053112170")
    assert res1 == (50000, "weekly", 22, "whatsapp:+2348053112170")

    # Naira currency symbol with explicit 'months' keyword
    res2 = parse_all_ajo_details("₦50,000, weekly, 22 months, 08053112170")
    assert res2 == (50000, "weekly", 22, "whatsapp:+2348053112170")

    # Space separated format
    res3 = parse_all_ajo_details("5000 weekly 22 08053112170")
    assert res3 == (5000, "weekly", 22, "whatsapp:+2348053112170")

    # Incomplete inputs should return None
    assert parse_all_ajo_details("5000, weekly, 22") is None
    assert parse_all_ajo_details("5000, 22, 08053112170") is None
