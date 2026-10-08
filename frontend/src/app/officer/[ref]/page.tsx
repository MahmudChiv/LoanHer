"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Application, ApplicationStatus, Passport } from "@/types";
import { getApplication, updateApplicationStatus } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { BandBadge } from "@/components/BandBadge";
import { AjoVerificationChip } from "@/components/AjoVerificationChip";
import { PassportView } from "@/components/PassportView";
import { formatDateTime, formatRelativeTime } from "@/lib/format";

function ApplicationDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="border-b border-slate-200 bg-white h-16 flex items-center px-4 sm:px-8">
        <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
              <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ApplicationDetailContent() {
  const params = useParams();
  const rawRef = params?.ref;
  const ref = typeof rawRef === "string" ? rawRef : Array.isArray(rawRef) ? rawRef[0] : "";

  const [application, setApplication] = useState<Application | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status updating state
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<ApplicationStatus | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Polling guard
  const isPollingRef = useRef(false);

  // Fetch getApplication(ref) and poll every 4 seconds
  useEffect(() => {
    if (!ref) return;

    let isMounted = true;

    async function fetchDetail(isInitial = false) {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const result = await getApplication(ref);
        if (!isMounted) return;

        if (result && result.application) {
          setApplication(result.application);
          if (result.passport) {
            setPassport(result.passport);
          }
          setError(null);
        } else {
          // If shape is flat
          const fallbackApp = result as unknown as Application;
          if (fallbackApp && fallbackApp.ref) {
            setApplication(fallbackApp);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        if (isInitial || !application) {
          const message =
            err instanceof Error
              ? err.message
              : `Could not retrieve application "${ref}". Please ensure the backend is running.`;
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isPollingRef.current = false;
        }
      }
    }

    // Initial fetch
    fetchDetail(true);

    // Poll every 4 seconds (4000ms)
    const intervalId = setInterval(() => {
      fetchDetail(false);
    }, 4000);

    // Clean up interval on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [ref, application]);

  // Handle status update button click
  const handleStatusChange = async (targetStatus: ApplicationStatus) => {
    if (!ref || isSaving) return;

    setIsSaving(true);
    setSavingStatus(targetStatus);
    setStatusFeedback(null);

    try {
      const updated = await updateApplicationStatus(ref, targetStatus);
      // Immediately update badge and application state
      setApplication((prev) => (prev ? { ...prev, status: updated.status } : updated));
      setStatusFeedback({
        type: "success",
        message: `Status updated to "${targetStatus}"`,
      });

      // Clear toast after 4 seconds
      setTimeout(() => {
        setStatusFeedback(null);
      }, 4000);
    } catch (err: unknown) {
      setStatusFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update status. Please try again.",
      });
    } finally {
      setIsSaving(false);
      setSavingStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/officer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#7A0C3C] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Queue</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              {ref || "Loading..."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
              title="Polling backend every 4 seconds for live score and ajo changes"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">Live Sync (4s)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/officer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#7A0C3C] transition-colors"
          >
            ← Back to Loan Desk
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && !application && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-xs">
                <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-xs">
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !application && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-rose-900">Application not found</h3>
            <p className="text-sm text-rose-700 mt-2">{error}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/officer"
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900 transition"
              >
                Return to Queue
              </Link>
            </div>
          </div>
        )}

        {/* Application Detail View */}
        {application && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Column: Loan Passport Dossier */}
            <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
              {/* Highlight Banner: Ajo Verification Trust Anchor */}
              {passport?.ajo && (
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                        Community Trust Anchor
                      </span>
                      <p className="text-sm font-semibold text-slate-900">
                        Ajo Collector Verification Status
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto">
                    <AjoVerificationChip
                      status={passport.ajo.verificationStatus}
                      size="md"
                    />
                  </div>
                </div>
              )}

              {/* Render <PassportView passport={passport} /> */}
              {passport ? (
                <PassportView passport={passport} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {application.applicantName}
                      </h2>
                      <p className="text-sm text-slate-600 font-medium">
                        {application.businessName}
                      </p>
                    </div>
                    <BandBadge band={application.band} size="lg" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase block">Score</span>
                      <span className="text-2xl font-extrabold text-slate-900">
                        {application.score} / 100
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase block">Submitted</span>
                      <span className="text-xs text-slate-700 font-medium">
                        {formatDateTime(application.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Officer Panel on Laptops (order-1 on mobile so officer actions are right at hand) */}
            <aside className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A0C3C] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      Officer Action Panel
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatRelativeTime(application.submittedAt)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h1 className="text-2xl font-black font-mono text-slate-900">
                      {application.ref}
                    </h1>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {application.applicantName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {application.businessName}
                    </p>
                  </div>

                  {/* Current Status Badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Current status:
                    </span>
                    <StatusBadge status={application.status} size="md" />
                  </div>

                  {/* Summary Score & Band in Panel */}
                  <div className="mt-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>Score: {application.score}/100</span>
                    </div>
                    <BandBadge band={application.band} size="sm" />
                  </div>
                </div>

                {/* Status Update Feedback Toast */}
                {statusFeedback && (
                  <div
                    className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      statusFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    <span>
                      {statusFeedback.type === "success" ? "✓" : "!"}
                    </span>
                    <span>{statusFeedback.message}</span>
                  </div>
                )}

                {/* Four Action Buttons */}
                <div className="mt-5 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Update Application Status
                  </span>

                  {/* Button 1: Mark for review -> "under review" */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleStatusChange("under review")}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      application.status === "under review"
                        ? "bg-amber-100/90 text-amber-900 border-amber-300 ring-2 ring-amber-400/40"
                        : "bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Mark for review</span>
                    </div>
                    {savingStatus === "under review" ? (
                      <span className="text-[10px] uppercase font-bold text-amber-700 animate-pulse">
                        Saving...
                      </span>
                    ) : application.status === "under review" ? (
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : null}
                  </button>

                  {/* Button 2: Request more info -> "more info requested" */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleStatusChange("more info requested")}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      application.status === "more info requested"
                        ? "bg-purple-100/90 text-purple-900 border-purple-300 ring-2 ring-purple-400/40"
                        : "bg-purple-50/70 hover:bg-purple-100 text-purple-800 border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Request more info</span>
                    </div>
                    {savingStatus === "more info requested" ? (
                      <span className="text-[10px] uppercase font-bold text-purple-700 animate-pulse">
                        Saving...
                      </span>
                    ) : application.status === "more info requested" ? (
                      <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-200/60 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : null}
                  </button>

                  {/* Button 3: Approve for processing -> "approved for processing" */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleStatusChange("approved for processing")}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      application.status === "approved for processing"
                        ? "bg-emerald-100/90 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/40"
                        : "bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Approve for processing</span>
                    </div>
                    {savingStatus === "approved for processing" ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 animate-pulse">
                        Saving...
                      </span>
                    ) : application.status === "approved for processing" ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : null}
                  </button>

                  {/* Button 4: Decline -> "declined" */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleStatusChange("declined")}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      application.status === "declined"
                        ? "bg-rose-100/90 text-rose-900 border-rose-300 ring-2 ring-rose-400/40"
                        : "bg-rose-50/60 hover:bg-rose-100 text-rose-800 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Decline</span>
                    </div>
                    {savingStatus === "declined" ? (
                      <span className="text-[10px] uppercase font-bold text-rose-700 animate-pulse">
                        Saving...
                      </span>
                    ) : application.status === "declined" ? (
                      <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-200/60 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>

              {/* Note under the panel: Exact text required by prompt */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 text-xs text-slate-600 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#7A0C3C]/10 text-[#7A0C3C] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Credit Policy Notice
                    </span>
                    <p className="leading-relaxed">
                      Passport is evidence for review. The decision rests with Wema&apos;s credit process.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={<ApplicationDetailSkeleton />}>
      <ApplicationDetailContent />
    </Suspense>
  );
}
