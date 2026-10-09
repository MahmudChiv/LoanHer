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

    # Match numeric amount with optional currency symbol, commas, or decimals
    match = re.search(r"[₦N]?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)", clean)
    if match:
        num_str = match.group(1).replace(",", "")
        try:
            val = int(float(num_str))
            return val if val > 0 else None
        except ValueError:
            return None

    return None


def parse_frequency(text: str) -> str | None:
    """
    Map input variants to canonical frequency: 'daily' | 'weekly' | 'monthly'.
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
    """
    clean = text.strip().lower()
    if not clean:
        return None

    # Check for explicit 'months' or 'm' notation (e.g., "22 months", "6m")
    m_match = re.search(r"\b(\d+)\s*(?:months?|m)\b", clean)
    if m_match:
        try:
            val = int(m_match.group(1))
            return val if val > 0 else None
        except ValueError:
            pass

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
      - "₦50,000, weekly, 22 months, 08053112170"

    Returns (amount, frequency, months, normalized_phone) or None if incomplete.
    """
    clean = text.strip()
    if not clean:
        return None

    # Step 1: Find Phone Number
    phone_match = re.search(r"(?:whatsapp:)?(?:\+?234|0)[789]\d{9}\b", clean, re.IGNORECASE)
    if not phone_match:
        phone_match = re.search(r"(?:whatsapp:)?(?:\+?\d{10,14})\b", clean, re.IGNORECASE)

    if not phone_match:
        return None

    raw_phone = phone_match.group(0)
    norm_phone = normalize_phone(raw_phone)
    if not norm_phone:
        return None

    # Remove phone number from clean text to prevent phone digits from polluting numeric parsing
    clean_no_phone = clean[:phone_match.start()] + " " + clean[phone_match.end():]

    # Step 2: Find Frequency
    frequency = parse_frequency(clean_no_phone)
    if not frequency:
        return None

    # Remove frequency keyword
    clean_no_freq = re.sub(
        r"\b(daily|weekly|monthly|day|week|month)s?\b",
        " ",
        clean_no_phone,
        flags=re.IGNORECASE,
    )

    # Step 3: Extract Amount and Months
    amount = None
    months = None

    # Check for 'k' notation (e.g. 50k)
    k_match = re.search(r"\b(\d+(?:\.\d+)?)\s*k\b", clean_no_freq, re.IGNORECASE)
    if k_match:
        try:
            amount = int(float(k_match.group(1)) * 1000)
            clean_no_freq = clean_no_freq[:k_match.start()] + " " + clean_no_freq[k_match.end():]
        except ValueError:
            pass

    # Check for explicit months (e.g. 22 months, 6m)
    m_match = re.search(r"\b(\d+)\s*(?:months?|m)\b", clean_no_freq, re.IGNORECASE)
    if m_match:
        try:
            months = int(m_match.group(1))
            clean_no_freq = clean_no_freq[:m_match.start()] + " " + clean_no_freq[m_match.end():]
        except ValueError:
            pass

    # Check for currency symbol prefix (e.g. ₦50,000 or N50,000)
    curr_match = re.search(r"[₦N]\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)", clean_no_freq, re.IGNORECASE)
    if amount is None and curr_match:
        num_str = curr_match.group(1).replace(",", "")
        try:
            amount = int(float(num_str))
            clean_no_freq = clean_no_freq[:curr_match.start()] + " " + clean_no_freq[curr_match.end():]
        except ValueError:
            pass

    # Find remaining numeric tokens
    tokens = re.findall(r"\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b", clean_no_freq)
    numeric_vals = []
    for tok in tokens:
        clean_tok = tok.replace(",", "")
        try:
            val = int(float(clean_tok))
            if val > 0:
                numeric_vals.append(val)
        except ValueError:
            pass

    if amount is None and months is None:
        if len(numeric_vals) >= 2:
            if numeric_vals[0] >= 100 and numeric_vals[1] <= 120:
                amount, months = numeric_vals[0], numeric_vals[1]
            elif numeric_vals[1] >= 100 and numeric_vals[0] <= 120:
                months, amount = numeric_vals[0], numeric_vals[1]
            else:
                amount, months = numeric_vals[0], numeric_vals[1]
        elif len(numeric_vals) == 1:
            val = numeric_vals[0]
            if val > 120:
                amount = val
            else:
                months = val
    elif amount is None and numeric_vals:
        amount = numeric_vals[0]
    elif months is None and numeric_vals:
        months = numeric_vals[0]

    if (
        amount is not None
        and frequency is not None
        and months is not None
        and norm_phone is not None
        and amount > 0
        and months > 0
    ):
        return (amount, frequency, months, norm_phone)

    return None


