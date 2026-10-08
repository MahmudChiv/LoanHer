"""
Pydantic models (shared data contract).

These models define the shapes that flow between the FastAPI backend and the
Next.js frontend.  Keep them in sync with frontend/src/types/index.ts.

NOTE: There are NO interest rate or loan pricing fields in any model.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Conversation state machine
# ---------------------------------------------------------------------------


class ConversationState(str, Enum):
    """States in the WhatsApp onboarding conversation.

    The flow goes:
        START → ASK_AJO_AMOUNT → ASK_AJO_FREQUENCY → ASK_AJO_MONTHS
              → ASK_COLLECTOR_PHONE → WAIT_STATEMENT → DONE
    """

    START = "START"
    ASK_AJO_AMOUNT = "ASK_AJO_AMOUNT"
    ASK_AJO_FREQUENCY = "ASK_AJO_FREQUENCY"
    ASK_AJO_MONTHS = "ASK_AJO_MONTHS"
    ASK_COLLECTOR_PHONE = "ASK_COLLECTOR_PHONE"
    WAIT_STATEMENT = "WAIT_STATEMENT"
    DONE = "DONE"


# ---------------------------------------------------------------------------
# Passport sub-models
# ---------------------------------------------------------------------------


class ScoreComponent(BaseModel):
    """One scoring dimension shown in the Passport's score breakdown."""

    name: str
    weight: float = Field(..., description="Weight of this component (0–1)")
    score: float = Field(..., description="Score achieved for this component (0–100)")


class KeyNumbers(BaseModel):
    """Key financial metrics extracted from the statement analysis."""

    avgMonthlyInflow: float
    monthsOfHistory: int
    consistency: str = Field(..., description="Human-readable consistency description")
    lowestBalance: float
    freeCashFlow: float
    repaymentCapacity: float = Field(
        ..., description="Estimated safe monthly repayment amount"
    )


class AjoInfo(BaseModel):
    """Self-reported (or collector-confirmed) ajo/esusu participation details."""

    weeklyAmount: float
    frequency: str = Field(..., description="e.g. 'weekly', 'daily'")
    monthsActive: int
    onTimeRecord: str = Field(..., description="e.g. '10/11 months on time'")
    verificationStatus: Literal[
        "self-reported", "collector-confirmed", "not-confirmed"
    ] = "self-reported"


class ChecklistItem(BaseModel):
    """One item in the applicant's readiness checklist."""

    label: str
    ok: bool
    nextStep: Optional[str] = None


# ---------------------------------------------------------------------------
# Passport (top-level)
# ---------------------------------------------------------------------------


class Passport(BaseModel):
    """The Loan Passport generated for an applicant."""

    id: str
    applicantName: str
    businessName: str
    cacNumber: str

    # Score
    score: int = Field(..., ge=0, le=100)
    band: Literal["A", "B", "C", "D"]

    # Breakdown
    components: list[ScoreComponent] = []

    # Key numbers (no pricing/rate fields)
    keyNumbers: KeyNumbers

    # Ajo
    ajo: AjoInfo

    # Qualitative
    flags: list[str] = []
    indicativeRange: dict[str, float] = Field(
        ..., description="{'min': float, 'max': float} — amount range, no rates"
    )
    suggestedProduct: str
    whyBullets: list[str] = []
    readinessChecklist: list[ChecklistItem] = []
    tips: list[str] = []

    verificationTag: str = "Document-based, not source-verified"


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------


class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under review"
    MORE_INFO = "more info requested"
    APPROVED = "approved for processing"
    DECLINED = "declined"


class Application(BaseModel):
    """A loan application submitted by the applicant from their Passport page."""

    ref: str = Field(..., description="Human-friendly reference, e.g. APP-0001")
    passportId: str
    applicantName: str
    businessName: str
    band: Literal["A", "B", "C", "D"]
    score: int = Field(..., ge=0, le=100)
    status: ApplicationStatus = ApplicationStatus.SUBMITTED
    submittedAt: str = Field(..., description="ISO 8601 datetime string")


class UpdateStatusPayload(BaseModel):
    """Payload for updating an application's status."""

    status: ApplicationStatus

