"""
Synthetic Bank Statement Generator (PDF + CSV + Metrics JSON).

Generates a realistic 11-month fictional microfinance bank statement for
"Kemi Fabrics & Tailoring" (Kemi Adebayo) for Wema Bank Hackaholics 7.0 demo.

Outputs created in data/statement/:
  - kemi_fabrics_statement_nov2025_sep2026.pdf
  - kemi_fabrics_statement_nov2025_sep2026.csv
  - statement_metrics.json

Usage:
  python scripts/generate_statement.py [--seed SEED]
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("generate_statement")

# =============================================================================
# CONSTANTS & CONFIGURATION
# =============================================================================

BANK_NAME = "Sample MFB"
ACCOUNT_NAME = "Kemi Fabrics & Tailoring"
ACCOUNT_NUMBER = "1029384756"
PERIOD_START_STR = "2025-11-01"
PERIOD_END_STR = "2026-09-30"

# Financial Targets & Constraints
TARGET_AVG_MONTHLY_CREDITS = 385000.0
TARGET_AVG_REGULAR_DEBITS = 245000.0
LOWEST_BALANCE_TARGET = 18500.0
LOW_BALANCE_THRESHOLD = 25000.0

# Multi-seed search parameters
MAX_SEEDS = 500

# Fictional Nigerian names & business counterparties
CUSTOMERS = [
    "Amina Bello",
    "Chinedu Okonkwo",
    "Funke Akindele",
    "Ngozi Eze",
    "Blessing Olaniyi",
    "Bisi Adebayo",
    "Fatima Abubakar",
    "Grace Danjuma",
    "Hadiza Yaro",
    "Ifeoma Nwosu",
    "Joy Oladipo",
    "Kehinde Ogundele",
    "Maryam Sanusi",
    "Peace Utomi",
    "Ronke Fashola",
    "Titilayo Shonibare",
    "Zainab Ahmed",
    "Yetunde Alabi",
]

SUPPLIERS = [
    "Yaba Textile Wholesalers",
    "Balogun Fabric Emporium",
    "Kano Thread & Dye Hub",
    "Aba Garment Supplies Ltd",
    "Eko Lace Importers",
]

MONTHS_LIST: List[Tuple[int, int]] = [
    (2025, 11),
    (2025, 12),
    (2026, 1),
    (2026, 2),
    (2026, 3),
    (2026, 4),
    (2026, 5),
    (2026, 6),
    (2026, 7),
    (2026, 8),
    (2026, 9),
]


# =============================================================================
# DATA GENERATION & CONSTRAINTS ENGINE
# =============================================================================

def generate_raw_transactions(rng: random.Random) -> List[Dict[str, Any]]:
    """
    Generate synthetic transactions across 11 months based on specified targets.
    """
    ref_counter = 900000000000000000 + rng.randint(10000, 99999)

    def next_ref() -> str:
        nonlocal ref_counter
        ref_counter += rng.randint(1, 49)
        return f"TRF|SMFB|{ref_counter}"

    all_txs: List[Dict[str, Any]] = []

    for year, month in MONTHS_LIST:
        # Credit target logic:
        # Dec 2025: Highest credit (~440,000 NGN)
        # Aug 2026: ~38% below average (~240,000 NGN)
        # Other months: ~380,000 to 400,000 NGN
        if (year, month) == (2026, 8):
            target_credit = rng.uniform(236000, 244000)
        elif (year, month) == (2025, 12):
            target_credit = rng.uniform(436000, 448000)
        else:
            target_credit = rng.uniform(378000, 400000)

        target_reg_debit = rng.uniform(240000, 250000)

        m_credits = 0.0
        m_reg_debits = 0.0

        # 1. Weekly ajo contribution (5,000 NGN every ~7 days)
        for day_val in [4, 11, 18, 25]:
            dt = datetime(year, month, day_val, 8, 30)
            amt = 5000.0
            all_txs.append({
                "dt": dt,
                "narr": "Transfer - ajo contribution",
                "ref": next_ref(),
                "debit": amt,
                "credit": 0.0,
                "is_reg_debit": True,
                "is_owner_out": False,
            })
            m_reg_debits += amt

        # 2. Shop Rent (35,000 NGN on the 2nd of each month)
        dt = datetime(year, month, 2, 9, 0)
        amt = 35000.0
        all_txs.append({
            "dt": dt,
            "narr": "Transfer to Landlord - Shop Rent",
            "ref": next_ref(),
            "debit": amt,
            "credit": 0.0,
            "is_reg_debit": True,
            "is_owner_out": False,
        })
        m_reg_debits += amt

        # 3. Regular debits (Suppliers, Airtime/Data, USSD)
        d_day = 3
        while m_reg_debits < target_reg_debit - 15000:
            d_day = min(28, d_day + rng.randint(2, 3))
            dt = datetime(year, month, d_day, rng.randint(10, 16), rng.randint(0, 59))
            r = rng.random()
            if r < 0.55:
                amt = round(rng.uniform(12000, 38000), 2)
                narr = f"Transfer to {rng.choice(SUPPLIERS)}"
            elif r < 0.85:
                amt = round(rng.uniform(1500, 4500), 2)
                narr = f"Airtime/Data Purchase - {rng.choice(['MTN', 'Airtel'])}"
            else:
                amt = round(rng.uniform(100, 400), 2)
                narr = "USSD Service Charge"

            all_txs.append({
                "dt": dt,
                "narr": narr,
                "ref": next_ref(),
                "debit": amt,
                "credit": 0.0,
                "is_reg_debit": True,
                "is_owner_out": False,
            })
            m_reg_debits += amt

        # Fill remaining reg debit
        rem_d = round(target_reg_debit - m_reg_debits, 2)
        if rem_d > 0:
            dt = datetime(year, month, 27, 11, 0)
            all_txs.append({
                "dt": dt,
                "narr": f"Transfer to {rng.choice(SUPPLIERS)}",
                "ref": next_ref(),
                "debit": rem_d,
                "credit": 0.0,
                "is_reg_debit": True,
                "is_owner_out": False,
            })

        # 4. Credits (Customer Transfers & POS Settlements)
        c_day = 1
        while m_credits < target_credit - 20000:
            c_day = min(28, c_day + rng.randint(1, 2))
            dt = datetime(year, month, c_day, rng.randint(9, 17), rng.randint(0, 59))
            amt = round(rng.uniform(9000, 32000), 2)
            if rng.random() < 0.65:
                narr = f"Transfer from {rng.choice(CUSTOMERS)}"
            else:
                narr = "POS settlement - Sales"
            all_txs.append({
                "dt": dt,
                "narr": narr,
                "ref": next_ref(),
                "debit": 0.0,
                "credit": amt,
                "is_reg_debit": False,
                "is_owner_out": False,
            })
            m_credits += amt

        rem_c = round(target_credit - m_credits, 2)
        if rem_c > 0:
            dt = datetime(year, month, 28, 15, 30)
            all_txs.append({
                "dt": dt,
                "narr": "POS settlement - Sales",
                "ref": next_ref(),
                "debit": 0.0,
                "credit": rem_c,
                "is_reg_debit": False,
                "is_owner_out": False,
            })

        # 5. Owner Transfer Out (120,000 to 140,000 NGN)
        owner_amt = round(rng.uniform(122000, 138000), 2)
        dt = datetime(year, month, 15, 17, 0)
        all_txs.append({
            "dt": dt,
            "narr": "Transfer to Kemi Adebayo Personal",
            "ref": next_ref(),
            "debit": owner_amt,
            "credit": 0.0,
            "is_reg_debit": False,
            "is_owner_out": True,
        })

    # Sort all transactions chronologically
    all_txs.sort(key=lambda x: x["dt"])
    return all_txs


def try_seed(seed: int) -> Tuple[bool, Dict[str, Any]]:
    """
    Attempt statement generation with a given seed.
    Verifies all mathematical assertions and constraints.
    """
    rng = random.Random(seed)
    txs = generate_raw_transactions(rng)

    # Calculate unshifted running balances from 0
    raw_bal = 0.0
    raw_bals: List[float] = []
    for t in txs:
        raw_bal = round(raw_bal + t["credit"] - t["debit"], 2)
        raw_bals.append(raw_bal)

    min_raw = min(raw_bals)

    # Shift opening balance so absolute minimum balance across statement is EXACTLY 18,500 NGN
    opening_balance = round(LOWEST_BALANCE_TARGET - min_raw, 2)

    # Recompute balances with calculated opening balance
    bal = opening_balance
    monthly_inflows_map: Dict[str, float] = {}
    monthly_reg_debits_map: Dict[str, float] = {}
    daily_min_balances: Dict[str, float] = {}

    total_credits = 0.0
    total_debits = 0.0

    for t in txs:
        bal = round(bal + t["credit"] - t["debit"], 2)
        t["balance"] = bal
        total_credits = round(total_credits + t["credit"], 2)
        total_debits = round(total_debits + t["debit"], 2)

        m_key = t["dt"].strftime("%Y-%m")
        d_key = t["dt"].strftime("%Y-%m-%d")

        if m_key not in monthly_inflows_map:
            monthly_inflows_map[m_key] = 0.0
            monthly_reg_debits_map[m_key] = 0.0

        monthly_inflows_map[m_key] = round(monthly_inflows_map[m_key] + t["credit"], 2)
        if t["is_reg_debit"]:
            monthly_reg_debits_map[m_key] = round(
                monthly_reg_debits_map[m_key] + t["debit"], 2
            )

        if d_key not in daily_min_balances:
            daily_min_balances[d_key] = bal
        else:
            daily_min_balances[d_key] = min(daily_min_balances[d_key], bal)

    closing_balance = bal

    # ASSERTION 1: Math integrity (opening + total credits - total debits == closing balance)
    computed_closing = round(opening_balance + total_credits - total_debits, 2)
    assert abs(computed_closing - closing_balance) < 0.01, (
        f"Closing balance math mismatch: {computed_closing} vs {closing_balance}"
    )

    # ASSERTION 2: Lowest running balance == 18500 and occurs EXACTLY ONCE
    min_running_bal = min(t["balance"] for t in txs)
    min_bal_occurrences = sum(1 for t in txs if t["balance"] == min_running_bal)
    assert min_running_bal == LOWEST_BALANCE_TARGET, (
        f"Lowest balance is {min_running_bal}, expected {LOWEST_BALANCE_TARGET}"
    )
    assert min_bal_occurrences == 1, (
        f"Lowest balance occurred {min_bal_occurrences} times, expected 1"
    )

    # ASSERTION 3: 2 to 3 other days have daily min balance under 25,000 NGN
    days_under_25k = [dk for dk, mb in daily_min_balances.items() if mb < LOW_BALANCE_THRESHOLD]
    assert 3 <= len(days_under_25k) <= 4, (
        f"Days under 25k count is {len(days_under_25k)}, expected 3 or 4 total days"
    )

    # ASSERTION 4: Average monthly credits between 375,000 and 395,000 NGN
    avg_monthly_credits = round(sum(monthly_inflows_map.values()) / 11.0, 2)
    assert 375000.0 <= avg_monthly_credits <= 395000.0, (
        f"Average monthly credits {avg_monthly_credits} out of range [375k, 395k]"
    )

    # ASSERTION 5: Exactly 10 months within +/-20% of average, and August 2026 between 33% and 43% below
    august_credits = monthly_inflows_map["2026-08"]
    august_dip_pct = round(
        (avg_monthly_credits - august_credits) / avg_monthly_credits * 100.0, 2
    )
    assert 33.0 <= august_dip_pct <= 43.0, (
        f"August dip percent is {august_dip_pct}%, expected between 33% and 43%"
    )

    within_20pct_months = sum(
        1
        for m_key, m_val in monthly_inflows_map.items()
        if m_key != "2026-08"
        and (0.8 * avg_monthly_credits <= m_val <= 1.2 * avg_monthly_credits)
    )
    assert within_20pct_months == 10, (
        f"Months within +/-20% of avg is {within_20pct_months}, expected 10"
    )

    # ASSERTION 6: Average monthly regular debits between 235,000 and 255,000 NGN
    avg_monthly_reg_debits = round(sum(monthly_reg_debits_map.values()) / 11.0, 2)
    assert 235000.0 <= avg_monthly_reg_debits <= 255000.0, (
        f"Average regular debits {avg_monthly_reg_debits} out of range [235k, 255k]"
    )

    # Estimated Free Cash Flow = avg credits - avg regular debits (excluding owner transfers)
    estimated_free_cash_flow = round(avg_monthly_credits - avg_monthly_reg_debits, 2)

    result_data = {
        "seed": seed,
        "opening_balance": opening_balance,
        "closing_balance": closing_balance,
        "total_credits": total_credits,
        "total_debits": total_debits,
        "txs": txs,
        "metrics": {
            "seed": seed,
            "months": 11,
            "avgMonthlyInflow": avg_monthly_credits,
            "lowestBalance": min_running_bal,
            "monthlyInflows": monthly_inflows_map,
            "augustDipPercent": august_dip_pct,
            "estimatedFreeCashFlow": estimated_free_cash_flow,
            "lowBalanceDaysUnder25k": len(days_under_25k),
        },
    }
    return True, result_data


# =============================================================================
# CSV GENERATION
# =============================================================================

def export_to_csv(filepath: Path, txs: List[Dict[str, Any]]) -> None:
    """Export transactions to a clean CSV file matching bank statement columns."""
    fieldnames = ["Date", "Narration", "Reference", "Debit", "Credit", "Balance"]
    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(fieldnames)
        for t in txs:
            dt_str = t["dt"].strftime("%Y-%m-%d %H:%M")
            debit_str = f"{t['debit']:.2f}" if t["debit"] > 0 else ""
            credit_str = f"{t['credit']:.2f}" if t["credit"] > 0 else ""
            balance_str = f"{t['balance']:.2f}"
            writer.writerow([
                dt_str,
                t["narr"],
                t["ref"],
                debit_str,
                credit_str,
                balance_str,
            ])


# =============================================================================
# PDF GENERATION (ReportLab)
# =============================================================================

def draw_footer(canvas: Any, doc: Any) -> None:
    """Draw footer on each PDF page."""
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#555555"))
    canvas.drawCentredString(letter[0] / 2.0, 0.4 * inch, "Demo data - fictional")
    canvas.restoreState()


def export_to_pdf(
    filepath: Path,
    txs: List[Dict[str, Any]],
    opening_balance: float,
    closing_balance: float,
    total_credits: float,
    total_debits: float,
) -> None:
    """Generate professional PDF bank statement."""
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        leftMargin=0.4 * inch,
        rightMargin=0.4 * inch,
        topMargin=0.4 * inch,
        bottomMargin=0.6 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "BankTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1E3A8A"),
    )
    subtitle_style = ParagraphStyle(
        "BankSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4B5563"),
    )
    cell_style = ParagraphStyle(
        "CellText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1F2937"),
    )
    header_cell_style = ParagraphStyle(
        "HeaderCellText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )

    story = []

    # Header section
    story.append(Paragraph(f"<b>{BANK_NAME}</b>", title_style))
    story.append(
        Paragraph("Official Microfinance Account Statement", subtitle_style)
    )
    story.append(Spacer(1, 10))

    # Account metadata & summary table
    summary_data = [
        [
            Paragraph("<b>Account Name:</b>", cell_style),
            Paragraph(ACCOUNT_NAME, cell_style),
            Paragraph("<b>Period:</b>", cell_style),
            Paragraph(f"{PERIOD_START_STR} to {PERIOD_END_STR}", cell_style),
        ],
        [
            Paragraph("<b>Account Number:</b>", cell_style),
            Paragraph(ACCOUNT_NUMBER, cell_style),
            Paragraph("<b>Opening Balance:</b>", cell_style),
            Paragraph(f"₦{opening_balance:,.2f}", cell_style),
        ],
        [
            Paragraph("<b>Total Credits:</b>", cell_style),
            Paragraph(f"₦{total_credits:,.2f}", cell_style),
            Paragraph("<b>Closing Balance:</b>", cell_style),
            Paragraph(f"<b>₦{closing_balance:,.2f}</b>", cell_style),
        ],
        [
            Paragraph("<b>Total Debits:</b>", cell_style),
            Paragraph(f"₦{total_debits:,.2f}", cell_style),
            Paragraph("", cell_style),
            Paragraph("", cell_style),
        ],
    ]

    summary_table = Table(summary_data, colWidths=[1.3 * inch, 2.2 * inch, 1.3 * inch, 2.2 * inch])
    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F4F6")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#D1D5DB")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(summary_table)
    story.append(Spacer(1, 15))

    # Transaction Table
    table_data = [
        [
            Paragraph("Date", header_cell_style),
            Paragraph("Narration", header_cell_style),
            Paragraph("Reference", header_cell_style),
            Paragraph("Debit (₦)", header_cell_style),
            Paragraph("Credit (₦)", header_cell_style),
            Paragraph("Balance (₦)", header_cell_style),
        ]
    ]

    for t in txs:
        dt_str = t["dt"].strftime("%Y-%m-%d %H:%M")
        debit_str = f"{t['debit']:,.2f}" if t["debit"] > 0 else ""
        credit_str = f"{t['credit']:,.2f}" if t["credit"] > 0 else ""
        balance_str = f"{t['balance']:,.2f}"

        table_data.append([
            Paragraph(dt_str, cell_style),
            Paragraph(t["narr"], cell_style),
            Paragraph(t["ref"], cell_style),
            Paragraph(debit_str, cell_style),
            Paragraph(credit_str, cell_style),
            Paragraph(balance_str, cell_style),
        ])

    col_widths = [1.1 * inch, 2.3 * inch, 1.5 * inch, 0.8 * inch, 0.8 * inch, 0.9 * inch]
    tx_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    tx_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("ALIGN", (3, 1), (5, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ])
    )
    story.append(tx_table)

    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic bank statement.")
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional random seed to use directly.",
    )
    args = parser.parse_args()

    target_dir = Path(__file__).resolve().parent.parent.parent / "data" / "statement"
    target_dir.mkdir(parents=True, exist_ok=True)

    pdf_path = target_dir / "kemi_fabrics_statement_nov2025_sep2026.pdf"
    csv_path = target_dir / "kemi_fabrics_statement_nov2025_sep2026.csv"
    metrics_path = target_dir / "statement_metrics.json"

    valid_data = None

    if args.seed is not None:
        logger.info("Testing explicitly requested seed %d...", args.seed)
        success, result = try_seed(args.seed)
        if success:
            valid_data = result
        else:
            logger.error("Explicit seed %d failed constraint checks.", args.seed)
            sys.exit(1)
    else:
        logger.info("Searching for valid seed (up to %d seeds)...", MAX_SEEDS)
        for seed_idx in range(MAX_SEEDS):
            try:
                success, result = try_seed(seed_idx)
                if success:
                    valid_data = result
                    logger.info("Found valid seed: %d", seed_idx)
                    break
            except AssertionError:
                continue

    if not valid_data:
        logger.error("Failed to find a valid seed within %d attempts.", MAX_SEEDS)
        sys.exit(1)

    txs = valid_data["txs"]
    metrics = valid_data["metrics"]

    # Write CSV
    export_to_csv(csv_path, txs)
    logger.info("Generated CSV: %s", csv_path)

    # Write PDF
    export_to_pdf(
        pdf_path,
        txs,
        opening_balance=valid_data["opening_balance"],
        closing_balance=valid_data["closing_balance"],
        total_credits=valid_data["total_credits"],
        total_debits=valid_data["total_debits"],
    )
    logger.info("Generated PDF: %s", pdf_path)

    # Write Metrics JSON
    with open(metrics_path, mode="w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    logger.info("Generated JSON metrics: %s", metrics_path)

    # Print Summary Report
    print("\n" + "=" * 60)
    print("LOANHER STATEMENT GENERATION COMPLETE")
    print("=" * 60)
    print(f"Seed Used:                    {metrics['seed']}")
    print(f"Statement Period:             11 Months ({PERIOD_START_STR} to {PERIOD_END_STR})")
    print(f"Total Transactions:           {len(txs)}")
    print(f"Opening Balance:              ₦{valid_data['opening_balance']:,.2f}")
    print(f"Total Credits (Inflow):       ₦{valid_data['total_credits']:,.2f}")
    print(f"Total Debits (Outflow):       ₦{valid_data['total_debits']:,.2f}")
    print(f"Closing Balance:              ₦{valid_data['closing_balance']:,.2f}")
    print(f"Average Monthly Inflow:       ₦{metrics['avgMonthlyInflow']:,.2f}")
    print(f"Estimated Free Cash Flow:     ₦{metrics['estimatedFreeCashFlow']:,.2f} / month")
    print(f"Lowest Running Balance:       ₦{metrics['lowestBalance']:,.2f} (Exactly Once)")
    print(f"August 2026 Dip:              {metrics['augustDipPercent']:.2f}% below average")
    print(f"Low Balance Days (< ₦25,000): {metrics['lowBalanceDaysUnder25k']} days")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
