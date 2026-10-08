"""
Collector (ajo group leader) verification loop.

When an applicant provides their collector's phone number, the bot sends the
collector a WhatsApp message asking them to confirm the applicant's ajo
participation.  This module manages that outbound flow.

TODO: Implement in ClickUp task #COLLECTOR-01
      - Expose: initiate_verification(applicant_phone: str, collector_phone: str,
                                       ajo_amount: float, ajo_months: int) -> None
        Sends a WhatsApp message to the collector via whatsapp.send_whatsapp.
        Stores a pending verification entry in store.pending_verifications.

      - handle_collector_reply(collector_phone: str, body: str) -> None
        Called from the webhook when the sender is a known collector.
        Parses "yes"/"no" (or similar), updates the verification status on the
        relevant passport, and notifies the applicant.
"""

# TODO: #COLLECTOR-01
