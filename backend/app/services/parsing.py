"""
Input-parsing utilities for WhatsApp bot conversations.

All functions in this module are pure (no side effects) and easy to unit-test.
"""

from __future__ import annotations

import re


def parse_name_and_number(text: str) -> tuple[str, str] | None:
    """
    Parse an applicant's full name and CAC registration number from text.

    TODO: Implement in ClickUp task #PARSING-01

    Expected format: "Full Name, RC1234567" or "Full Name - BN1234567".
    Returns (name, registration_number) or None if unparseable.
    """
    clean = text.strip()
    if not clean:
        return None

    # Try splitting on common separators (comma, semicolon, dash)
    parts = re.split(r"[,;\n\-]+", clean, maxsplit=1)
    if len(parts) == 2:
        name = parts[0].strip()
        number = parts[1].strip()
        if name and number:
            return (name, number)

    # Fallback: check if the last token looks like a CAC number (starts with RC/BN/IT or alphanumeric)
    tokens = clean.split()
    if len(tokens) >= 2:
        last = tokens[-1]
        if re.match(r"^(RC|BN|IT|\d)[\w\-]+$", last, re.IGNORECASE):
            name = " ".join(tokens[:-1]).strip()
            return (name, last)

    return None


def parse_amount(text: str) -> int | None:
    """
    Extract a positive integer monetary contribution amount from text.

    TODO: Implement in ClickUp task #PARSING-01

    Handles formats like: "50000", "₦50,000", "50k", "50,000.00".
    """
    clean = text.strip().lower()
    if not clean:
        return None

    # Handle 'k' multiplier like '50k' -> 50000
    k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", clean)
    if k_match:
        try:
            return int(float(k_match.group(1)) * 1000)
        except ValueError:
            return None

    # Extract digits, removing commas, periods, currency symbols
    digits = re.sub(r"[^\d]", "", clean)
    if digits:
        try:
            val = int(digits)
            return val if val > 0 else None
        except ValueError:
            return None

    return None


def parse_frequency(text: str) -> str | None:
    """
    Map input variants to canonical frequency: 'daily' | 'weekly' | 'monthly'.

    TODO: Implement in ClickUp task #PARSING-01
    """
    clean = text.strip().lower()
    if "day" in clean or "daily" in clean:
        return "daily"
    if "week" in clean:
        return "weekly"
    if "month" in clean:
        return "monthly"
    return None


def parse_months(text: str) -> int | None:
    """
    Extract a positive integer number of months from free text.

    TODO: Implement in ClickUp task #PARSING-01
    """
    clean = text.strip().lower()
    match = re.search(r"\b(\d+)\b", clean)
    if match:
        try:
            val = int(match.group(1))
            return val if val > 0 else None
        except ValueError:
            return None
    return None


def normalize_phone(text: str) -> str | None:
    """
    Normalize phone number into 'whatsapp:+234XXXXXXXXXX' format.

    TODO: Implement in ClickUp task #PARSING-01
    """
    clean = text.strip()
    if not clean:
        return None

    if clean.lower().startswith("whatsapp:"):
        clean = clean[len("whatsapp:") :].strip()

    digits_only = re.sub(r"[^\d+]", "", clean)
    if not digits_only:
        return None

    if digits_only.startswith("0"):
        digits_only = f"+234{digits_only[1:]}"
    elif digits_only.startswith("234") or not digits_only.startswith("+"):
        digits_only = f"+{digits_only}"

    if re.fullmatch(r"\+\d{7,15}", digits_only):
        return f"whatsapp:{digits_only}"

    return None


def parse_all_ajo_details(text: str) -> tuple[int, str, int, str] | None:
    """
    Parse amount, frequency, months, and collector phone from a single input string.

    Example inputs:
      - "5000, weekly, 22, 08053112170"
      - "50k monthly 12 08031234567"

    Returns (amount, frequency, months, normalized_phone) or None if incomplete.
    """
    clean = text.strip()
    if not clean:
        return None

    amount = parse_amount(clean)
    frequency = parse_frequency(clean)
    months = parse_months(clean)

    # Find phone token matching Nigerian phone pattern (080... or +234...)
    phone = None
    tokens = re.findall(r"(?:whatsapp:)?(?:\+?234|0)\d{9,10}\b", clean, re.IGNORECASE)
    for token in tokens:
        norm = normalize_phone(token)
        if norm:
            phone = norm
            break

    if amount is not None and frequency is not None and months is not None and phone is not None:
        return (amount, frequency, months, phone)

    return None

