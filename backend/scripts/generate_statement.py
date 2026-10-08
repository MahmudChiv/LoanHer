"""
Synthetic bank statement generator (PDF).

Generates a plausible 11-month fictional bank statement for the demo persona
(Kemi Adeyemi / Kemi's Fabrics Ltd).  All amounts, dates, and names are
entirely fictional.

TODO: Implement in ClickUp task #STATEMENT-GEN-01
      - Use the reportlab library to produce a PDF
      - Generate ~80–100 transactions over 11 months
      - Include realistic-looking inflows (sales, transfers) and outflows (rent, stock)
      - Vary transaction sizes to produce a non-trivial consistency score
      - Save to data/statement/kemi_statement.pdf
      - Accept a --seed argument so results are reproducible

Usage (once implemented):
    python scripts/generate_statement.py --seed 42
"""

# TODO: #STATEMENT-GEN-01
