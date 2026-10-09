"use client";

import React, { useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";
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

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useCurrentUrl() {
  return useSyncExternalStore(
    emptySubscribe,
    () => (typeof window !== "undefined" ? window.location.href : ""),
    () => ""
  );
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

  const mounted = useIsMounted();
  const currentUrl = useCurrentUrl();

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 print:text-black print:space-y-4">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white print:text-black">
              {applicantName}
            </h1>
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 print:text-emerald-800 mt-1">
              {businessName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700 mt-1">
              CAC Reg: <span className="font-mono font-medium">{cacNumber || "N/A"}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 print:bg-gray-100 print:text-gray-800 print:border-gray-300">
            Prototype data
          </span>
        </div>
      </div>

      {/* 2. Score Card */}
      <div
        className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4 transition-all duration-500 ${
          animateScore ? "ring-4 ring-emerald-400/50 bg-emerald-50/20" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800 print:border-gray-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
              Loan Readiness Score
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
                {score}
              </span>
              <span className="text-sm text-gray-400 print:text-gray-600 font-medium">/ 100</span>
            </div>
          </div>
          <div>
            <BandBadge band={band} size="lg" />
          </div>
        </div>

        {/* Score Components */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
            Score Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {components.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300 print:text-black">{comp.name}</span>
                  <span className="text-gray-500 print:text-gray-700">
                    {comp.score} pts ({Math.round(comp.weight * 100)}% weight)
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 print:bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 print:bg-emerald-600 rounded-full transition-all duration-500"
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
        <div className="space-y-3 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
            Financial Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 print:bg-white print:text-black print:border-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">Avg. Monthly Inflow</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white print:text-black mt-1">
                {formatNaira(keyNumbers.avgMonthlyInflow)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 print:bg-white print:text-black print:border-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">Statement History</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white print:text-black mt-1">
                {keyNumbers.monthsOfHistory} months
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 print:bg-white print:text-black print:border-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">Inflow Consistency</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 print:text-black mt-1 truncate">
                {keyNumbers.consistency}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 print:bg-white print:text-black print:border-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">Lowest Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white print:text-black mt-1">
                {formatNaira(keyNumbers.lowestBalance)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 print:bg-white print:text-black print:border-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">Est. Free Cash Flow</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-800 mt-1">
                {formatNaira(keyNumbers.freeCashFlow)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 print:bg-white print:text-black print:border-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">Est. Monthly Capacity</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 print:text-indigo-800 mt-1">
                {formatNaira(keyNumbers.repaymentCapacity)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Ajo Summary Card */}
      {ajo && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 print:border-gray-200">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white print:text-black">
                Ajo (Savings Group) Discipline
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">
                Community savings track record
              </p>
            </div>

            {/* Verification Chip */}
            <div>
              {ajo.verificationStatus === "collector-confirmed" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 print:bg-emerald-50 print:text-emerald-900 print:border-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse print:hidden" />
                  Collector-confirmed
                </span>
              )}
              {ajo.verificationStatus === "self-reported" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700 print:bg-amber-50 print:text-amber-900 print:border-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 print:hidden" />
                  Self-reported
                </span>
              )}
              {ajo.verificationStatus === "not-confirmed" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700 print:bg-rose-50 print:text-rose-900 print:border-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 print:hidden" />
                  Not confirmed
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <span className="text-gray-500 print:text-gray-700">Contribution Amount</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
                {formatNaira(ajo.weeklyAmount)} ({ajo.frequency})
              </p>
            </div>
            <div>
              <span className="text-gray-500 print:text-gray-700">Tenure Active</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
                {ajo.monthsActive} months
              </p>
            </div>
            <div>
              <span className="text-gray-500 print:text-gray-700">On-Time Payment Record</span>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
                {ajo.onTimeRecord || "Recorded"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Flags */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700 mb-3">
          Risk Flags & Observations
        </h3>
        {flags.length > 0 ? (
          <ul className="space-y-2">
            {flags.map((flag, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50 print:bg-gray-50 print:text-black print:border-gray-300"
              >
                <span className="text-amber-500 print:text-amber-700">⚠️</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 print:text-emerald-800 font-medium flex items-center gap-1.5">
            ✓ No significant flags
          </p>
        )}
      </div>

      {/* 6. Suggested Product */}
      <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-gray-900 dark:to-gray-900 rounded-2xl p-6 border border-indigo-100 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 print:text-indigo-900 mb-2">
          Suggested Wema Product
        </h3>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-gray-900 dark:text-white print:text-black">
            {suggestedProduct || "SME Working Capital Facility"}
          </p>
          {indicativeRange && (
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 print:text-emerald-800 font-mono">
              {formatNaira(indicativeRange.min)} to {formatNaira(indicativeRange.max)}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700 mt-2 italic">
          Final amount and terms are set by Wema.
        </p>
      </div>

      {/* 7. Why This Score */}
      {whyBullets.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white print:text-black mb-3">
            Why this score
          </h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 print:text-black">
            {whyBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 print:text-emerald-700 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Readiness Checklist */}
      {readinessChecklist.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white print:text-black mb-4">
            Loan Readiness Checklist
          </h3>
          <div className="space-y-3">
            {readinessChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 print:bg-white print:border-gray-200"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {item.ok ? (
                    <span className="text-emerald-600 dark:text-emerald-400 print:text-emerald-700 text-sm">✓</span>
                  ) : (
                    <span className="text-rose-500 print:text-rose-700 text-sm">✗</span>
                  )}
                  <span
                    className={
                      item.ok
                        ? "text-gray-800 dark:text-gray-200 print:text-black"
                        : "text-rose-700 dark:text-rose-400 print:text-rose-900"
                    }
                  >
                    {item.label}
                  </span>
                </div>
                {!item.ok && item.nextStep && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700 mt-1 pl-5">
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white print:text-black mb-3">
            Tips to Improve Loan Readiness
          </h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 print:text-black">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 print:text-amber-700 font-bold">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 10. Footer Tag */}
      {verificationTag && (
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-center break-inside-avoid print:bg-gray-50 print:text-black print:border-gray-300">
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 print:text-gray-700">
            {verificationTag}
          </p>
        </div>
      )}

      {/* 11. Share with a loan officer (QR Code Block) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4 break-inside-avoid print:bg-white print:text-black print:border-gray-300 print:p-4 print:mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-black">
          Share with a loan officer
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
            {mounted && currentUrl ? (
              <QRCodeSVG value={currentUrl} size={140} />
            ) : (
              <div className="w-[140px] h-[140px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            )}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
              Scan to open this Passport
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700 max-w-sm">
              Scan this QR code with any mobile device camera to open and verify this Loan Passport live on LoanHer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassportView;
