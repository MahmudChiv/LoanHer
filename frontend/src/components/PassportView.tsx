import React from "react";
import type { Passport } from "@/types";
import { BandBadge } from "./BandBadge";

interface PassportViewProps {
  passport: Passport;
  animateScore?: boolean;
}

export function formatNaira(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "₦0";
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export function PassportView({ passport, animateScore = false }: PassportViewProps) {
  const {
    applicantName,
    businessName,
    cacNumber,
    score,
    band,
    components = [],
    keyNumbers,
    ajo,
    flags = [],
    indicativeRange,
    suggestedProduct,
    whyBullets = [],
    readinessChecklist = [],
    tips = [],
    verificationTag,
  } = passport;

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {applicantName}
            </h1>
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {businessName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              CAC Reg: <span className="font-mono font-medium">{cacNumber || "N/A"}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            Prototype data
          </span>
        </div>
      </div>

      {/* 2. Score Card */}
      <div
        className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-500 ${
          animateScore ? "ring-4 ring-emerald-400/50 bg-emerald-50/20" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Loan Readiness Score
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {score}
              </span>
              <span className="text-sm text-gray-400 font-medium">/ 100</span>
            </div>
          </div>
          <div>
            <BandBadge band={band} size="lg" />
          </div>
        </div>

        {/* Score Components */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Score Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {components.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">{comp.name}</span>
                  <span className="text-gray-500">
                    {comp.score} pts ({Math.round(comp.weight * 100)}% weight)
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, comp.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Key Numbers Grid */}
      {keyNumbers && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Financial Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Monthly Inflow</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {formatNaira(keyNumbers.avgMonthlyInflow)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Statement History</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {keyNumbers.monthsOfHistory} months
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Inflow Consistency</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                {keyNumbers.consistency}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Lowest Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {formatNaira(keyNumbers.lowestBalance)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Est. Free Cash Flow</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatNaira(keyNumbers.freeCashFlow)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Est. Monthly Capacity</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatNaira(keyNumbers.repaymentCapacity)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Ajo Summary Card */}
      {ajo && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Ajo (Savings Group) Discipline
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Community savings track record
              </p>
            </div>

            {/* Verification Chip */}
            <div>
              {ajo.verificationStatus === "collector-confirmed" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Collector-confirmed
                </span>
              )}
              {ajo.verificationStatus === "self-reported" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Self-reported
                </span>
              )}
              {ajo.verificationStatus === "not-confirmed" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Not confirmed
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <span className="text-gray-500">Contribution Amount</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatNaira(ajo.weeklyAmount)} ({ajo.frequency})
              </p>
            </div>
            <div>
              <span className="text-gray-500">Tenure Active</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {ajo.monthsActive} months
              </p>
            </div>
            <div>
              <span className="text-gray-500">On-Time Payment Record</span>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {ajo.onTimeRecord || "Recorded"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Flags */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Risk Flags & Observations
        </h3>
        {flags.length > 0 ? (
          <ul className="space-y-2">
            {flags.map((flag, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50"
              >
                <span className="text-amber-500">⚠️</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            ✓ No significant flags
          </p>
        )}
      </div>

      {/* 6. Suggested Product */}
      <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-gray-900 dark:to-gray-900 rounded-2xl p-6 border border-indigo-100 dark:border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 mb-2">
          Suggested Wema Product
        </h3>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {suggestedProduct || "SME Working Capital Facility"}
          </p>
          {indicativeRange && (
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatNaira(indicativeRange.min)} to {formatNaira(indicativeRange.max)}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          Final amount and terms are set by Wema.
        </p>
      </div>

      {/* 7. Why This Score */}
      {whyBullets.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Why this score
          </h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            {whyBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Readiness Checklist */}
      {readinessChecklist.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Loan Readiness Checklist
          </h3>
          <div className="space-y-3">
            {readinessChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {item.ok ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  ) : (
                    <span className="text-rose-500 text-sm">✗</span>
                  )}
                  <span
                    className={
                      item.ok
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-rose-700 dark:text-rose-400"
                    }
                  >
                    {item.label}
                  </span>
                </div>
                {!item.ok && item.nextStep && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-5">
                    Next step: {item.nextStep}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Tips to Improve */}
      {tips.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Tips to Improve Loan Readiness
          </h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 10. Footer Tag */}
      {verificationTag && (
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {verificationTag}
          </p>
        </div>
      )}
    </div>
  );
}

export default PassportView;
