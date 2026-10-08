"""
Input-parsing utilities.

All functions in this module are pure (no side effects) and easy to unit-test.

TODO: Implement in ClickUp task #PARSING-01
      - parse_amount(text: str) -> float | None
        Recognises "5000", "5,000", "5k", "₦5000" → 5000.0.  Returns None if
        the text cannot be parsed.

      - parse_frequency(text: str) -> str | None
        Maps common variants ("daily", "everyday", "weekly", "every week") to a
        canonical frequency string ("daily" | "weekly" | "monthly").

      - parse_months(text: str) -> int | None
        Extracts a positive integer number of months from free text.

      - normalize_phone(raw: str, country_code: str = "+234") -> str
        Strips spaces/dashes, adds country code for Nigerian numbers starting
        with 0 or without a country code prefix.  Returns in E.164 format.

      - parse_name_and_number(text: str) -> tuple[str, str] | None
        Tries to split "Mama Titi, 08123456789" into ("Mama Titi", "08123456789").
"""

# TODO: #PARSING-01
