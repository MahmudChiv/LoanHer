"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Application, ApplicationStatus, Passport } from "@/types";
import { getApplication, updateApplicationStatus } from "@/lib/api";
import { PassportView } from "@/components/PassportView";
import { StatusBadge } from "@/components/StatusBadge";
import { BandBadge } from "@/components/BandBadge";

export const dynamic = "force-dynamic";

interface ApplicationDetailPageProps {
  params: Promise<{ ref: string }>;
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const resolvedParams = use(params);
  const ref = resolvedParams.ref;

  const [application, setApplication] = useState<Application | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await getApplication(ref);
      setApplication(res.application);
      if (res.passport) {
        setPassport(res.passport);
      }
      setError(null);
    } catch (err: unknown) {
      console.error(`Failed to load application ${ref}:`, err);
      const errMsg = err instanceof Error ? err.message : "Failed to load application details";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [ref]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDetail();
    }, 0);
    const interval = setInterval(() => {
      void fetchDetail();
    }, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchDetail]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    setSavingStatus(true);
    try {
      const updated = await updateApplicationStatus(ref, newStatus);
      setApplication(updated);
    } catch (err: unknown) {
      console.error(`Failed to update status for ${ref}:`, err);
      const errMsg = err instanceof Error ? err.message : "Failed to update";
      alert(`Error updating status: ${errMsg}`);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <span className="text-4xl">❌</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Application Not Found
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {error || `No application matching reference ${ref}`}
        </p>
        <Link
          href="/officer"
          className="inline-block px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
        >
          ← Back to Officer Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/officer"
          className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          ← Back to Officer Queue
        </Link>
      </div>

      {/* Main Grid: Officer Panel + Passport View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Officer Control Panel (Sticky on desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-xs font-mono text-gray-400 uppercase">
                  Application Ref
                </span>
                <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                  {application.ref}
                </h2>
              </div>
              <BandBadge band={application.band} size="md" />
            </div>

            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Current Status</span>
              <div className="mt-1">
                <StatusBadge status={application.status} size="md" />
              </div>
            </div>

            {/* Officer Actions */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Officer Actions
              </span>

              <button
                disabled={savingStatus || application.status === "under review"}
                onClick={() => handleStatusChange("under review")}
                className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
              >
                <span>Mark for review</span>
                <span>📋</span>
              </button>

              <button
                disabled={savingStatus || application.status === "more info requested"}
                onClick={() => handleStatusChange("more info requested")}
                className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
              >
                <span>Request more info</span>
                <span>❓</span>
              </button>

              <button
                disabled={savingStatus || application.status === "approved for processing"}
                onClick={() => handleStatusChange("approved for processing")}
                className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
              >
                <span>Approve for processing</span>
                <span>✅</span>
              </button>

              <button
                disabled={savingStatus || application.status === "declined"}
                onClick={() => handleStatusChange("declined")}
                className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
              >
                <span>Decline</span>
                <span>❌</span>
              </button>
            </div>

            {/* Note */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 italic">
              Passport is evidence for review. The decision rests with Wema&apos;s credit process.
            </div>
          </div>
        </div>

        {/* Passport View Column */}
        <div className="lg:col-span-8">
          {passport ? (
            <PassportView passport={passport} />
          ) : (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
              <span className="text-2xl">📄</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Passport record pending or not attached
              </p>
              <p className="text-xs text-gray-500">Passport ID: {application.passportId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
