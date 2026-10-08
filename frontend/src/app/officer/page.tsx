"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Application } from "@/types";
import { getApplications } from "@/lib/api";
import { BandBadge } from "@/components/BandBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRelativeTime } from "@/lib/format";

export default function OfficerQueuePage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newlyArrivedRefs, setNewlyArrivedRefs] = useState<Set<string>>(
    () => new Set()
  );

  // Keep track of known refs across poll cycles
  const seenRefsRef = useRef<Set<string> | null>(null);
  const isPollingRef = useRef(false);

  // Poll getApplications() every 3 seconds
  useEffect(() => {
    let isMounted = true;

    async function fetchQueue(isInitial = false) {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const data = await getApplications();
        if (!isMounted) return;

        // Ensure newest first
        const sorted = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
          const timeA = new Date(a.submittedAt).getTime();
          const timeB = new Date(b.submittedAt).getTime();
          return timeB - timeA;
        });

        // Determine if any new items arrived since last poll
        const currentRefs = new Set(sorted.map((item) => item.ref));

        if (seenRefsRef.current !== null) {
          const freshRefs: string[] = [];
          for (const ref of currentRefs) {
            if (!seenRefsRef.current.has(ref)) {
              freshRefs.push(ref);
            }
          }

          if (freshRefs.length > 0) {
            setNewlyArrivedRefs((prev) => {
              const updated = new Set(prev);
              freshRefs.forEach((r) => updated.add(r));
              return updated;
            });

            // Fade out the highlight after 3.5 seconds
            setTimeout(() => {
              if (!isMounted) return;
              setNewlyArrivedRefs((prev) => {
                const updated = new Set(prev);
                freshRefs.forEach((r) => updated.delete(r));
                return updated;
              });
            }, 3500);
          }
        }

        seenRefsRef.current = currentRefs;
        setApplications(sorted);
        setError(null);
      } catch (err: unknown) {
        if (!isMounted) return;
        // Only set page-level error if we have no prior data
        if (isInitial || applications.length === 0) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to connect to the backend server. Please verify the API is running.";
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
    fetchQueue(true);

    // Poll every 3 seconds (3000ms)
    const intervalId = setInterval(() => {
      fetchQueue(false);
    }, 3000);

    // Clean up interval on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [applications.length]);

  const handleRowClick = (ref: string) => {
    startTransition(() => {
      router.push(`/officer/${ref}`);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation / Brand Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7A0C3C] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-xs">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base leading-tight">
                  Wema Bank
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7A0C3C]/10 text-[#7A0C3C] px-1.5 py-0.5 rounded">
                  SME Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hackaholics 7.0 Prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live polling pulse indicator */}
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
              title="Polling backend every 3 seconds for new submissions"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">Live Sync (3s)</span>
            </div>

            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Wema SME Loan Desk
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Applications prepared with LoenHer
            </p>
          </div>

          {applications.length > 0 && (
            <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 self-start sm:self-auto shadow-2xs">
              Showing {applications.length} application
              {applications.length === 1 ? "" : "s"} (newest first)
            </div>
          )}
        </div>

        {/* Error State */}
        {error && applications.length === 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 sm:p-8 text-center my-6 max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-rose-900">
              Unable to load loan applications
            </h3>
            <p className="text-sm text-rose-700 mt-1.5 max-w-md mx-auto">
              {error}
            </p>
            <p className="text-xs text-rose-600/90 mt-2">
              Polling will automatically retry every 3 seconds.
            </p>
            <button
              onClick={() => {
                setIsLoading(true);
                setError(null);
                getApplications()
                  .then((data) => {
                    setApplications(data);
                    setIsLoading(false);
                  })
                  .catch((err: unknown) => {
                    setError(err instanceof Error ? err.message : "Failed to connect");
                    setIsLoading(false);
                  });
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && applications.length === 0 && !error && (
          <div className="space-y-4">
            {/* Table skeleton for desktop */}
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-4">
                    <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-6 w-28 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Card skeleton for mobile */}
            <div className="md:hidden space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center my-6 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#7A0C3C] flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              No loan applications yet
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              When small business owners complete their WhatsApp onboarding and
              send their Loan Passport to Wema Bank, their applications will
              appear here automatically.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Queue is actively listening (polling every 3 seconds)
            </div>
          </div>
        )}

        {/* Applications List */}
        {applications.length > 0 && (
          <div>
            {/* Desktop Table View (Laptops & up) */}
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th scope="col" className="py-3.5 pl-6 pr-4">
                        Reference
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Applicant
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Business
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Risk Band
                      </th>
                      <th scope="col" className="py-3.5 px-4 text-center">
                        Score
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Status
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Submitted
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-6 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => {
                      const isNewlyAdded = newlyArrivedRefs.has(app.ref);

                      return (
                        <tr
                          key={app.ref}
                          onClick={() => handleRowClick(app.ref)}
                          tabIndex={0}
                          role="link"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleRowClick(app.ref);
                            }
                          }}
                          className={`cursor-pointer group transition-colors duration-700 select-none ${
                            isNewlyAdded
                              ? "bg-purple-100/70 hover:bg-purple-100 ring-2 ring-[#7A0C3C]/30"
                              : "hover:bg-slate-50/90 bg-white"
                          }`}
                        >
                          {/* Reference */}
                          <td className="py-4 pl-6 pr-4 font-mono font-bold text-slate-900 group-hover:text-[#7A0C3C] transition-colors">
                            <div className="flex items-center gap-2">
                              <span>{app.ref}</span>
                              {isNewlyAdded && (
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#7A0C3C] text-white px-1.5 py-0.5 rounded animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Applicant */}
                          <td className="py-4 px-4 font-semibold text-slate-900">
                            {app.applicantName}
                          </td>

                          {/* Business */}
                          <td className="py-4 px-4 text-slate-600 font-medium max-w-[220px] truncate">
                            {app.businessName}
                          </td>

                          {/* Band */}
                          <td className="py-4 px-4">
                            <BandBadge band={app.band} size="sm" />
                          </td>

                          {/* Score */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-extrabold text-slate-900">
                              {app.score}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              /100
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <StatusBadge status={app.status} size="sm" />
                          </td>

                          {/* Submitted Relative Time */}
                          <td
                            className="py-4 px-4 text-xs font-medium text-slate-500 whitespace-nowrap"
                            title={app.submittedAt}
                          >
                            {formatRelativeTime(app.submittedAt)}
                          </td>

                          {/* Navigation Arrow */}
                          <td className="py-4 pl-4 pr-6 text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[#7A0C3C] group-hover:translate-x-0.5 transition-all">
                              Review
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Stacked Cards (Phones) */}
            <div className="md:hidden space-y-3">
              {applications.map((app) => {
                const isNewlyAdded = newlyArrivedRefs.has(app.ref);

                return (
                  <div
                    key={app.ref}
                    onClick={() => handleRowClick(app.ref)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowClick(app.ref);
                      }
                    }}
                    className={`rounded-2xl border p-4.5 cursor-pointer shadow-xs active:scale-[0.99] transition-all duration-500 select-none ${
                      isNewlyAdded
                        ? "bg-purple-100/80 border-[#7A0C3C]/40 ring-2 ring-[#7A0C3C]/30"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Top Row: Ref & Submitted Time */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {app.ref}
                        </span>
                        {isNewlyAdded && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-[#7A0C3C] text-white px-1.5 py-0.5 rounded animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs text-slate-500 font-medium"
                        title={app.submittedAt}
                      >
                        {formatRelativeTime(app.submittedAt)}
                      </span>
                    </div>

                    {/* Middle: Names & Business */}
                    <div className="py-3">
                      <h3 className="font-bold text-base text-slate-900">
                        {app.applicantName}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium mt-0.5">
                        {app.businessName}
                      </p>
                    </div>

                    {/* Bottom: Band, Score, Status Badge */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <BandBadge band={app.band} size="sm" />
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {app.score}/100
                        </span>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
