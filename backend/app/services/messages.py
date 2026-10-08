"""WhatsApp conversational copy and response templates.

Holds static message strings, question prompts, and response formatting
for the LoenHer WhatsApp bot.

TODO: Implement full conversation message templates in ClickUp task #MESSAGES-01.
"""

# Common WhatsApp response templates
WELCOME_GREETING = (
    "Hello! Welcome to LoenHer, powered by Wema Bank. "
    "I'm here to help prepare your Loan Passport for SME financing. "
    "To get started, please reply with your registered business name and CAC registration number."
)

ASK_AJO_AMOUNT = (
    "Thank you! Do you participate in an ajo/esusu (rotating savings group)? "
    "If yes, how much do you contribute per cycle (e.g. ₦5,000)?"
)

ASK_AJO_FREQUENCY = (
    "How often do you make this contribution? (e.g. daily, weekly, or monthly)"
)

ASK_AJO_MONTHS = (
    "How many months have you been an active member of this ajo group?"
)

ASK_COLLECTOR = (
    "Please share your Ajo Collector's name and WhatsApp phone number "
    "so we can verify your contributions (e.g. Mama Titi, 08012345678)."
)

WAIT_STATEMENT = (
    "Great! Now please upload your bank statement (PDF or clear image) for the last 6–12 months."
)

PASSPORT_READY = (
    "Congratulations! Your Loan Passport is ready for review: {passport_url}\n"
    "Reply SEND to submit your application directly to Wema Bank's SME Loan Desk."
)
