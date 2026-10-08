"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Application } from "@/types";
import { getApplications } from "@/lib/api";
import { BandBadge } from "@/components/BandBadge";
import { StatusBadge } from "@/components/StatusBadge";

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  return `${Math.floor(diffInSeconds / 86400)} d ago`;
}

export default function OfficerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRefs, setNewRefs] = useState<Set<string>>(new Set());

  const previousRefsRef = useRef<Set<string>>(new Set());

  const fetchQueue = useCallback(async () => {
    try {
      const data = await getApplications();
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      // Identify newly added applications for highlight
      const currentRefs = new Set(sorted.map((item) => item.ref));
      const freshlyAdded = new Set<string>();

      if (previousRefsRef.current.size > 0) {
        currentRefs.forEach((ref) => {
          if (!previousRefsRef.current.has(ref)) {
            freshlyAdded.add(ref);
          }
        });
      }

      previousRefsRef.current = currentRefs;
      if (freshlyAdded.size > 0) {
        setNewRefs(freshlyAdded);
        setTimeout(() => {
          setNewRefs(new Set());
        }, 3000);
      }

      setApplications(sorted);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch application queue:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to connect to LoanHer backend";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchQueue();
    }, 0);
    const interval = setInterval(() => {
      void fetchQueue();
    }, 3000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchQueue]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Wema SME Loan Desk
          </h1>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
            Applications prepared with LoenHer
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Queue ({applications.length})
          </span>
          <button
            onClick={fetchQueue}
            className="p-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-gray-800/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            {error}
          </p>
          <button
            onClick={fetchQueue}
            className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && applications.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
          <span className="text-4xl">📥</span>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No incoming loan applications yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            When applicants complete their WhatsApp onboarding and tap &quot;Send to Wema&quot;, their Loan Passport will appear here in real-time.
          </p>
        </div>
      )}

      {/* Desktop Table view */}
      {!loading && !error && applications.length > 0 && (
        <>
          <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Readiness Band</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {applications.map((app) => {
                  const isNew = newRefs.has(app.ref);
                  return (
                    <tr
                      key={app.ref}
                      onClick={() => router.push(`/officer/${encodeURIComponent(app.ref)}`)}
                      className={`cursor-pointer transition-all duration-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${
                        isNew ? "bg-emerald-100/60 dark:bg-emerald-950/50" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {app.ref}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                        {app.applicantName}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                        {app.businessName}
                      </td>
                      <td className="py-4 px-4">
                        <BandBadge band={app.band} size="sm" />
                      </td>
                      <td className="py-4 px-4 font-black text-gray-900 dark:text-white">
                        {app.score} / 100
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right text-gray-500 dark:text-gray-400 font-medium">
                        {formatRelativeTime(app.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards view */}
          <div className="block md:hidden space-y-3">
            {applications.map((app) => {
              const isNew = newRefs.has(app.ref);
              return (
                <div
                  key={app.ref}
                  onClick={() => router.push(`/officer/${encodeURIComponent(app.ref)}`)}
                  className={`p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3 cursor-pointer active:scale-[0.99] transition-all duration-300 ${
                    isNew ? "ring-2 ring-emerald-500 bg-emerald-50/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {app.ref}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {formatRelativeTime(app.submittedAt)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {app.applicantName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {app.businessName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <BandBadge band={app.band} size="sm" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {app.score} pts
                      </span>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
