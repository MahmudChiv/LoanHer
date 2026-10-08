"""
Applicant conversation state machine.

Drives the WhatsApp onboarding flow through the states defined in
models.schemas.ConversationState.

TODO: Implement in ClickUp task #CONVERSATION-01
      - Expose: handle_message(from_number: str, body: str, media_url: str | None) -> str
        Returns the reply text to send back via WhatsApp.
      - On START: greet, ask for business name & owner name, transition to ASK_AJO_AMOUNT
      - On ASK_AJO_AMOUNT: parse amount via parsing.parse_amount, transition onward
      - On ASK_AJO_FREQUENCY: parse via parsing.parse_frequency
      - On ASK_AJO_MONTHS: parse via parsing.parse_months
      - On ASK_COLLECTOR_PHONE: store number, trigger collector loop, transition to WAIT_STATEMENT
      - On WAIT_STATEMENT: expect a PDF/image media_url, hand off to passport.handle_statement
      - On DONE: remind applicant their Passport is ready and send the link
"""

# TODO: #CONVERSATION-01
