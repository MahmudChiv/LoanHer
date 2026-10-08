"""
Simulated CAC (Corporate Affairs Commission) lookup.

Reads from data/cac_records.json — a small JSON file with fictional business
records.  This is a MOCK; no real CAC API is called.

TODO: Implement in ClickUp task #CAC-01
      - Expose: lookup_cac(cac_number: str) -> dict | None
        Returns the matching record dict from cac_records.json, or None if not found.
      - Load the JSON file once at module import time using settings.data_path.
      - cac_records.json schema example (all data is fictional):
        [
          {
            "cac_number": "BN-0000001",
            "business_name": "Kemi's Fabrics Ltd",
            "owner_name": "Oluwakemi Adeyemi",
            "registered_at": "2021-03-15"
          }
        ]
"""

# TODO: #CAC-01
