// TODO: Full PassportView implementation by teammate (task #FRONTEND-PASSPORT-01)
// Reusable component rendering the applicant's Loan Passport evidence dossier.

import type { Passport } from "@/types";
import { BandBadge } from "@/components/BandBadge";
import { AjoVerificationChip } from "@/components/AjoVerificationChip";
import { formatNaira } from "@/lib/format";

interface PassportViewProps {
  passport: Passport;
}

export function PassportView({ passport }: PassportViewProps) {
  if (!passport) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Passport data not available.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Dossier Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                Loan Passport Dossier
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {passport.id ? `${passport.id.slice(0, 8)}...` : "—"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {passport.applicantName}
            </h2>
            <p className="text-base text-slate-600 font-medium mt-0.5">
              {passport.businessName}
            </p>
            {passport.cacNumber && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                CAC: {passport.cacNumber}
              </p>
            )}
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wide block">
                Readiness Score
              </span>
              <div className="flex items-baseline gap-1.5 sm:justify-end">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {passport.score}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
            </div>
            <BandBadge band={passport.band} size="lg" />
          </div>
        </div>

        {/* Verification Tag */}
        {passport.verificationTag && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Verification tier: {passport.verificationTag}</span>
          </div>
        )}
      </div>

      {/* Primary Trust Anchor: Ajo Group Participation */}
      <div className="rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 to-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Ajo (Rotating Savings) Evidence
              </h3>
              <p className="text-xs text-slate-600">
                Informal financial behavior verified through community savings collector
              </p>
            </div>
          </div>
          <AjoVerificationChip
            status={passport.ajo?.verificationStatus || "self-reported"}
            size="md"
          />
        </div>

        {passport.ajo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-xs text-slate-500 block">Contribution</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                {formatNaira(passport.ajo.weeklyAmount)}
              </span>
              <span className="text-xs text-slate-500 capitalize">
                {passport.ajo.frequency || "weekly"}
              </span>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-xs text-slate-500 block">On-Time Track</span>
              <span className="text-base sm:text-lg font-bold text-emerald-800 block mt-0.5">
                {passport.ajo.onTimeRecord || "—"}
              </span>
              <span className="text-xs text-slate-500">Repayment discipline</span>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-xs text-slate-500 block">Duration Active</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                {passport.ajo.monthsActive} months
              </span>
              <span className="text-xs text-slate-500">Group membership</span>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-xs text-slate-500 block">Trust Level</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5 capitalize">
                {passport.ajo.verificationStatus === "collector-confirmed"
                  ? "High Trust"
                  : passport.ajo.verificationStatus === "self-reported"
                  ? "Moderate"
                  : "Needs Review"}
              </span>
              <span className="text-xs text-slate-500">Underwriting weight</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicative Range & Product Suggestion (NO rates or loan pricing!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Indicative Amount Range
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {passport.indicativeRange
              ? `${formatNaira(passport.indicativeRange.min)} – ${formatNaira(passport.indicativeRange.max)}`
              : "—"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated capacity based on average monthly inflow and free cash flow.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Suggested Product
          </span>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {passport.suggestedProduct || "Wema SME Micro-Working Capital Loan"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Product structure aligned with cash flow cycle.
          </p>
        </div>
      </div>

      {/* Key Financial Numbers */}
      {passport.keyNumbers && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Key Financial Metrics (Simulated Statement Analysis)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Avg Monthly Inflow</span>
              <span className="text-base font-bold text-slate-900 block mt-1">
                {formatNaira(passport.keyNumbers.avgMonthlyInflow)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Lowest Balance</span>
              <span className="text-base font-bold text-slate-900 block mt-1">
                {formatNaira(passport.keyNumbers.lowestBalance)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Free Cash Flow</span>
              <span className="text-base font-bold text-slate-900 block mt-1">
                {formatNaira(passport.keyNumbers.freeCashFlow)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Repayment Capacity</span>
              <span className="text-base font-bold text-emerald-700 block mt-1">
                {formatNaira(passport.keyNumbers.repaymentCapacity)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 block">Statement History</span>
              <span className="text-sm font-semibold text-slate-900 block mt-1">
                {passport.keyNumbers.monthsOfHistory} months
              </span>
              <span className="text-xs text-slate-500">
                {passport.keyNumbers.consistency}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Score Components Breakdown */}
      {passport.components && passport.components.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Scoring Dimensions
          </h3>
          <div className="space-y-3">
            {passport.components.map((comp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm font-medium">
                  <span className="text-slate-700">
                    {comp.name}
                    <span className="text-xs text-slate-400 ml-1.5">
                      ({Math.round(comp.weight * 100)}% weight)
                    </span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(comp.score)} / 100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-900 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, comp.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underwriting Strengths & Readiness Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {passport.whyBullets && passport.whyBullets.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Application Highlights
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {passport.whyBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {passport.readinessChecklist && passport.readinessChecklist.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Readiness Checklist
            </h3>
            <ul className="space-y-2.5 text-sm">
              {passport.readinessChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  {item.ok ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      !
                    </span>
                  )}
                  <div>
                    <span className="text-slate-800 font-medium block">
                      {item.label}
                    </span>
                    {item.nextStep && (
                      <span className="text-xs text-slate-500 block">
                        Action: {item.nextStep}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Flags if any */}
      {passport.flags && passport.flags.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Underwriting Attention Points
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-900/90">
            {passport.flags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default PassportView;
