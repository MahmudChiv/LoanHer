"""
Passport computation and bank-statement handling.

This module contains the core "intelligence" of the prototype — but for the
hackathon it is all simulated with hardcoded heuristics and dummy numbers.

TODO: Implement in ClickUp task #PASSPORT-02
      - handle_statement(passport_id: str, media_url: str) -> None
        Downloads the uploaded file (PDF or image) and runs a simulated analysis.
        Updates store.passports[passport_id] with computed KeyNumbers.
        For the prototype, parse nothing — just return plausible hardcoded numbers
        from a fixture or deterministic formula.

      - compute_passport(conversation_data: dict) -> Passport
        Builds a full Passport from the collected conversation data.
        Scoring formula (all hardcoded/simulated for the prototype):
          - Statement score   (weight 0.40)
          - Ajo score         (weight 0.30)
          - CAC score         (weight 0.15)
          - Consistency score (weight 0.15)
        Returns a Passport model instance and saves it to store.passports.

NOTE: Do NOT include any interest rate or loan pricing fields.
"""

# TODO: #PASSPORT-02
