"""
Twilio WhatsApp Sandbox CLI Test Script for LoenHer.

Sends a WhatsApp test message through the Twilio sandbox to verify
credentials, connectivity, and recipient opt-in status.

Usage:
    python scripts/send_test_message.py +2348031234567 "Hello from LoenHer"
    python scripts/send_test_message.py 08031234567 "Hello from LoenHer"
    python scripts/send_test_message.py whatsapp:+2348031234567 "Hello from LoenHer"

Loads configuration from backend/.env (using python-dotenv) regardless
of the working directory from which this script is invoked.
Never prints or logs the Twilio auth token.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from twilio.base.exceptions import TwilioRestException
# pyrefly: ignore [missing-import]
from twilio.rest import Client

# Path resolution: Locate backend/.env relative to this script's directory
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
ENV_PATH = BACKEND_DIR / ".env"

# List of required environment variables for Twilio WhatsApp messaging
REQUIRED_ENV_VARS = (
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_FROM",
)


def load_credentials() -> tuple[str, str, str]:
    """
    Load and validate Twilio credentials from backend/.env.

    Returns:
        tuple[str, str, str]: (account_sid, auth_token, whatsapp_from)

    Raises:
        SystemExit: Exits with code 1 if any required environment variable is missing.
    """
    # Load backend/.env if the file exists on disk
    if ENV_PATH.is_file():
        load_dotenv(dotenv_path=ENV_PATH)
    else:
        # Fall back to default search if invoked in a special environment
        load_dotenv()

    # Identify any missing or empty environment variables
    missing_vars: list[str] = []
    for var_name in REQUIRED_ENV_VARS:
        val = os.getenv(var_name)
        if not val or not val.strip():
            missing_vars.append(var_name)

    if missing_vars:
        print(
            f"Error: Missing required environment variable(s): {', '.join(missing_vars)}",
            file=sys.stderr,
        )
        if not ENV_PATH.is_file():
            print(
                f"Configuration file not found at: {ENV_PATH}\n"
                "Please copy backend/.env.example to backend/.env and configure your Twilio keys.",
                file=sys.stderr,
            )
        else:
            print(
                f"Please define all required variables in: {ENV_PATH}",
                file=sys.stderr,
            )
        sys.exit(1)

    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM", "").strip()

    # Detect unconfigured placeholder values from .env.example
    placeholders = [
        var for var in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN")
        if os.getenv(var, "").strip().startswith("your_twilio_")
    ]
    if placeholders:
        print(
            f"Error: Environment variable(s) {', '.join(placeholders)} still contain placeholder values.\n"
            f"Please update {ENV_PATH} with your actual Twilio credentials from https://console.twilio.com.",
            file=sys.stderr,
        )
        sys.exit(1)

    return account_sid, auth_token, whatsapp_from


def normalize_recipient(recipient: str) -> str:
    """
    Normalize a recipient phone number into Twilio's WhatsApp format: 'whatsapp:+234XXXXXXXXXX'.

    Accepts:
        - Nigerian local format: '08031234567' -> 'whatsapp:+2348031234567'
        - International format: '+2348031234567' -> 'whatsapp:+2348031234567'
        - Twilio format: 'whatsapp:+2348031234567' -> 'whatsapp:+2348031234567'
        - International digits without plus: '2348031234567' -> 'whatsapp:+2348031234567'
        - Punctuation/spaces are stripped automatically: '0803 123 4567' -> 'whatsapp:+2348031234567'

    Returns:
        str: Normalized recipient string prefixed with 'whatsapp:+'.

    Raises:
        ValueError: If recipient is empty or does not resemble a valid phone number.
    """
    raw = recipient.strip()

    # Strip existing 'whatsapp:' prefix if present
    if raw.lower().startswith("whatsapp:"):
        raw = raw[len("whatsapp:"):].strip()

    # Remove standard formatting punctuation (spaces, dashes, parentheses, dots)
    cleaned = re.sub(r"[\s\-\(\)\.]", "", raw)

    if not cleaned:
        raise ValueError("Recipient phone number cannot be empty.")

    # Convert Nigerian local numbers starting with 0 (e.g. 0803... -> +234803...)
    if cleaned.startswith("0"):
        cleaned = f"+234{cleaned[1:]}"
    elif cleaned.startswith("234"):
        cleaned = f"+{cleaned}"
    elif not cleaned.startswith("+"):
        # Numbers without a leading '+' assume international code
        cleaned = f"+{cleaned}"

    # E.164 sanity check: '+' followed by 7 to 15 digits
    if not re.fullmatch(r"\+\d{7,15}", cleaned):
        raise ValueError(
            f"Invalid phone number format '{recipient}'. "
            "Please provide a valid phone number (e.g. 08031234567 or +2348031234567)."
        )

    return f"whatsapp:{cleaned}"


def normalize_whatsapp_from(sender: str) -> str:
    """
    Ensure the sender phone number has the required 'whatsapp:' prefix.

    Args:
        sender: Sender string from TWILIO_WHATSAPP_FROM.

    Returns:
        str: Sender formatted with 'whatsapp:+...' prefix.
    """
    cleaned = sender.strip()
    if not cleaned.lower().startswith("whatsapp:"):
        return f"whatsapp:{cleaned}"
    return cleaned


def send_test_message(recipient: str, message_body: str) -> int:
    """
    Send a WhatsApp message via Twilio Sandbox.

    Args:
        recipient: Raw recipient phone number provided by user.
        message_body: Text message body to send.

    Returns:
        int: 0 on success, 1 on failure.
    """
    # Validate and retrieve credentials (never logs the auth token)
    account_sid, auth_token, raw_sender = load_credentials()

    try:
        to_number = normalize_recipient(recipient)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    from_number = normalize_whatsapp_from(raw_sender)

    print("Sending WhatsApp sandbox message...")
    print(f"  To   : {to_number}")
    print(f"  From : {from_number}")
    print(f"  Body : {message_body!r}\n")

    try:
        # Initialize Twilio REST client
        client = Client(account_sid, auth_token)

        # Dispatch message
        message = client.messages.create(
            to=to_number,
            from_=from_number,
            body=message_body,
        )

        # Success output: Message SID and Status
        print("Message sent successfully!")
        print(f"  Message SID : {message.sid}")
        print(f"  Status      : {message.status}")
        return 0

    except TwilioRestException as exc:
        # Handle known Twilio API exceptions
        print(
            f"Error: Twilio API request failed (HTTP {exc.status} | Code {exc.code})",
            file=sys.stderr,
        )
        print(f"Details: {exc.msg}", file=sys.stderr)

        print("\n" + "=" * 54, file=sys.stderr)
        print("         TWILIO SANDBOX TROUBLESHOOTING HINTS         ", file=sys.stderr)
        print("=" * 54, file=sys.stderr)

        # 1. Recipient not joined sandbox error (error 63015 or 21608)
        if exc.code in (63015, 21608) or "sandbox" in str(exc).lower() or "joined" in str(exc).lower():
            print(
                "\n[!] Recipient has NOT joined the sandbox:\n"
                f"    The recipient number ({to_number}) has not joined your Twilio Sandbox.\n"
                f"    To fix: Open WhatsApp from {to_number} and send your sandbox join phrase\n"
                f"    (e.g. 'join <code>') to {from_number} before sending messages.",
                file=sys.stderr,
            )

        # 2. 24-hour window expired error (error 63016)
        elif exc.code == 63016 or "24" in str(exc) or "window" in str(exc).lower() or "session" in str(exc).lower():
            print(
                "\n[!] 24-Hour Messaging Window Expired:\n"
                f"    WhatsApp policy permits freeform messages only within 24 hours of the recipient's\n"
                f"    last inbound message to the sandbox number ({from_number}).\n"
                "    To fix: Ask the recipient to send any WhatsApp message to the sandbox number first.",
                file=sys.stderr,
            )

        # 3. Daily / rate limit reached (error 20429 or 20008)
        elif exc.code in (20429, 20008) or "limit" in str(exc).lower():
            print(
                "\n[!] Daily / Rate Limit Exceeded:\n"
                "    Twilio trial accounts are capped at ~50 messages/day.\n"
                "    Check your usage dashboard at https://console.twilio.com.",
                file=sys.stderr,
            )

        # 4. Authentication error (error 20003 or HTTP 401)
        elif exc.code == 20003 or exc.status == 401:
            print(
                "\n[!] Twilio Authentication Failed:\n"
                f"    Check that TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in {ENV_PATH} are correct.\n"
                "    (Security note: Keep your auth token secret and never share or commit it).",
                file=sys.stderr,
            )

        # Core Sandbox Constraints Summary
        print(
            "\nKey Twilio Sandbox Constraints to Remember:\n"
            "  * Recipient Join Required: Recipients must send 'join <code>' to the sandbox number first.\n"
            "  * 24-Hour Active Window: Freeform messages require an inbound message within 24 hours.\n"
            "  * 3-Day Session Expiry: Sandbox join association expires after 72 hours (3 days).\n"
            "  * Trial Account Quota: Limited to ~50 messages per day on trial accounts.",
            file=sys.stderr,
        )
        return 1

    except Exception as exc:
        print(f"Error: An unexpected error occurred: {exc}", file=sys.stderr)
        print("\n" + "=" * 54, file=sys.stderr)
        print("         TWILIO SANDBOX TROUBLESHOOTING HINTS         ", file=sys.stderr)
        print("=" * 54, file=sys.stderr)
        print(
            "  * Recipient Join: Ensure recipient sent 'join <code>' to the sandbox number.\n"
            "  * 24-Hour Window: The recipient must have messaged the sandbox within the last 24 hours.\n"
            "  * Trial Limits: Remember the ~50 messages/day cap on Twilio trial accounts.",
            file=sys.stderr,
        )
        return 1


def main() -> None:
    """Parse command-line arguments and run test sender."""
    if len(sys.argv) != 3 or sys.argv[1] in ("-h", "--help"):
        print("Usage: python scripts/send_test_message.py <recipient> <message>")
        print("\nArguments:")
        print("  <recipient>  Phone number (+234..., 0803..., or whatsapp:+234...)")
        print("  <message>    Text body to send (enclosed in quotes)")
        print("\nExamples:")
        print('  python scripts/send_test_message.py +2348031234567 "Hello from LoenHer"')
        print('  python scripts/send_test_message.py 08031234567 "Hello from LoenHer"')
        print('  python scripts/send_test_message.py whatsapp:+2348031234567 "Hello from LoenHer"')
        sys.exit(0 if (len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help")) else 1)

    recipient_arg = sys.argv[1]
    message_arg = sys.argv[2]

    exit_code = send_test_message(recipient=recipient_arg, message_body=message_arg)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
