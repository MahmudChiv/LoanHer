"""
WhatsApp message copy and formatting templates.

Provides standard bot copy and response messages for the LoenHer onboarding,
ajo verification, and loan passport flow.
"""

from __future__ import annotations

# Greeting & Onboarding
WELCOME = (
    "Welcome to LoanHer! I'm your digital loan-readiness assistant for Wema Bank.\n\n"
    "To begin, please send your Full Name and CAC Registration Number, separated by a comma.\n"
    "Example: Kemi Adeyemi, RC1234567"
)


def cac_verified(first_name: str, business: str) -> str:
    """Return celebratory confirmation message upon successful CAC verification."""
    return f"Welcome, {first_name}! We verified your business ({business}) with CAC."


# CAC Failure Responses
CAC_NOT_FOUND = (
    "We couldn't find a CAC registration matching that number.\n\n"
    "Please double-check your registration number (e.g., RC1234567 or BN1234567) "
    "and send your full name and number again."
)

CAC_INACTIVE = (
    "Your business registration is currently listed as inactive on CAC.\n\n"
    "Please ensure your annual returns are up to date and try again."
)

CAC_NAME_MISMATCH = (
    "The name you provided does not match the registered owner for this CAC number.\n\n"
    "Please confirm the exact name used during registration and try again."
)

# Ajo Questions
ASK_AJO_AMOUNT = (
    "How much do you contribute to your ajo / esusu savings group per turn?\n"
    "Example: 50,000 or ₦50,000"
)

ASK_AJO_FREQUENCY = (
    "How often do you contribute to this ajo group?\n"
    "Please reply: daily, weekly, or monthly."
)

ASK_AJO_MONTHS = (
    "How many months have you been contributing to this ajo group?\n"
    "Example: 6 or 12 months"
)

ASK_COLLECTOR_PHONE = (
    "Please provide the WhatsApp phone number of your ajo collector or group leader.\n"
    "We'll reach out to them to verify your savings history.\n"
    "Example: 08031234567"
)

# Input Validation Hints
HINT_AMOUNT = (
    "Please enter a valid amount in Naira (numbers only).\n"
    "Example: 50000 or ₦50,000"
)

HINT_FREQUENCY = (
    "Please choose one of the following frequencies:\n"
    "daily, weekly, or monthly"
)

HINT_MONTHS = (
    "Please enter the number of months as a whole number.\n"
    "Example: 6 or 12"
)

HINT_PHONE = (
    "Please enter a valid Nigerian phone number for your ajo collector.\n"
    "Example: 08031234567 or +2348031234567"
)

# Statement & Completion
COLLECTOR_REQUEST_SENT = (
    "Thank you! We've contacted your ajo collector for confirmation.\n\n"
    "Now, please upload a PDF or clear photo of your bank statement (6–12 months) "
    "to generate your Loan Passport."
)

STATEMENT_WAIT_HINT = (
    "We are waiting for your bank statement.\n\n"
    "Please tap the paperclip / attachment icon and send your statement PDF or photo."
)

FALLBACK = (
    "Sorry, I didn't quite catch that. Please follow the prompt above, "
    "or reply 'RESET' at any time to start over."
)

RESET_DONE = (
    "Your conversation has been reset.\n\n"
    "Reply with your Name and CAC number whenever you are ready to start again!"
)

# Collector Verification Messages
def collector_question(applicant_name: str, amount: int | float, frequency: str, months: int) -> str:
    """Format verification question sent to an ajo collector."""
    return (
        f"{applicant_name} says she pays ₦{int(amount):,} {frequency} into your ajo group "
        f"and has done for {months} months.\n"
        "Is that correct? Reply 1 for Yes, 2 for No."
    )


ASK_LATE_PAYMENTS = (
    "Thank you. In the last 12 months, how many payments was she late or did she miss? "
    "Reply with a number (0 if none)."
)

COLLECTOR_THANKS = "Thank you, recorded ✓"
COLLECTOR_NOT_CONFIRMED_ACK = "Thank you, noted."
COLLECTOR_INVALID_CONFIRM = "Please reply 1 for Yes or 2 for No."
COLLECTOR_INVALID_LATE = "Please reply with a number, for example 0 or 3."


def applicant_ajo_confirmed() -> str:
    """Format notification to applicant when ajo is confirmed by collector."""
    return "Your ajo collector confirmed your ajo ✓ Your Passport has been updated."


def applicant_ajo_not_confirmed() -> str:
    """Format notification to applicant when ajo is not confirmed by collector."""
    return (
        "Your ajo collector could not confirm your ajo, so it stays unverified. "
        "You can still share your Passport."
    )
