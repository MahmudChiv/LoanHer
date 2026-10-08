"""
In-memory state store for the LoenHer prototype.

Because this is a hackathon prototype with a single Render worker, all state
lives in plain Python dicts.  Nothing persists across server restarts.

Keys for each dict:
    conversations           : phone_number (str)  -> ConversationState + collected fields
    passports               : passport_id (str)   -> Passport (dict or Pydantic model)
    pending_verifications   : phone_number (str)  -> verification metadata dict
    applications            : ref (str)           -> Application (dict or Pydantic model)

TODO: Replace with a real database before any production use.
"""

# ---------------------------------------------------------------------------
# Conversations
# ---------------------------------------------------------------------------
# Maps a normalised WhatsApp phone number to the current conversation state.
# Structure (set by conversation.py):
#   {
#       "state": ConversationState,
#       "applicant_name": str | None,
#       "business_name":  str | None,
#       "ajo_amount":     float | None,
#       "ajo_frequency":  str | None,
#       "ajo_months":     int | None,
#       "collector_phone": str | None,
#       "passport_id":    str | None,
#   }
conversations: dict = {}

# ---------------------------------------------------------------------------
# Passports
# ---------------------------------------------------------------------------
# Maps passport_id (UUID string) to a serialised Passport dict.
passports: dict = {}

# ---------------------------------------------------------------------------
# Pending verifications
# ---------------------------------------------------------------------------
# Maps collector phone number to the verification request sent by an applicant.
# The collector bot flow reads from here to confirm or deny ajo participation.
pending_verifications: dict = {}

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
# Maps application ref (e.g. "APP-0001") to a serialised Application dict.
# Populated when an applicant taps "Send to Wema" on their Passport page.
applications: dict = {}
