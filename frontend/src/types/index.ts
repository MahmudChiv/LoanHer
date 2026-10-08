/**
 * TypeScript types matching the Pydantic models in backend/app/models/schemas.py.
 * Keep these in sync whenever the backend contract changes.
 *
 * NOTE: There are NO interest rate or loan pricing fields in any type.
 */

// ---------------------------------------------------------------------------
// Passport
// ---------------------------------------------------------------------------

export interface ScoreComponent {
  name: string;
  /** Weight of this component (0–1) */
  weight: number;
  /** Score achieved for this component (0–100) */
  score: number;
}

export interface KeyNumbers {
  avgMonthlyInflow: number;
  monthsOfHistory: number;
  /** Human-readable consistency description, e.g. "8 of 11 months above ₦50k" */
  consistency: string;
  lowestBalance: number;
  freeCashFlow: number;
  /** Estimated safe monthly repayment amount */
  repaymentCapacity: number;
}

export type VerificationStatus = "self-reported" | "collector-confirmed" | "not-confirmed";

export interface AjoInfo {
  weeklyAmount: number;
  /** e.g. "weekly", "daily" */
  frequency: string;
  monthsActive: number;
  /** e.g. "10/11 months on time" */
  onTimeRecord: string;
  verificationStatus: VerificationStatus;
}

export interface ChecklistItem {
  label: string;
  ok: boolean;
  nextStep?: string;
}

export type Band = "A" | "B" | "C" | "D";

export interface Passport {
  id: string;
  applicantName: string;
  businessName: string;
  cacNumber: string;

  score: number;
  band: Band;

  components: ScoreComponent[];
  keyNumbers: KeyNumbers;
  ajo: AjoInfo;

  flags: string[];
  /** { min: number, max: number } — amount range only, no rates */
  indicativeRange: { min: number; max: number };
  suggestedProduct: string;
  whyBullets: string[];
  readinessChecklist: ChecklistItem[];
  tips: string[];

  verificationTag: string;
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | "submitted"
  | "under review"
  | "more info requested"
  | "approved for processing"
  | "declined";

export interface Application {
  /** Human-friendly reference, e.g. "APP-0001" */
  ref: string;
  passportId: string;
  applicantName: string;
  businessName: string;
  band: Band;
  score: number;
  status: ApplicationStatus;
  /** ISO 8601 datetime string */
  submittedAt: string;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

export interface UpdateStatusPayload {
  status: ApplicationStatus;
}
