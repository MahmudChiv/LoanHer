"use client";

import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Passport } from "@/types";
import { getPassport } from "@/lib/api";
import { PassportView } from "@/components/PassportView";

export const dynamic = "force-dynamic";

interface PassportPageProps {
  params: Promise<{ id: string }>;
}

export default function PassportPage({ params }: PassportPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animateScore, setAnimateScore] = useState(false);

  const prevScoreRef = useRef<number | null>(null);

  const fetchPassportData = useCallback(async () => {
    try {
      const data = await getPassport(id);
      if (prevScoreRef.current !== null && prevScoreRef.current !== data.score) {
        setAnimateScore(true);
        setTimeout(() => setAnimateScore(false), 3000);
      }
      prevScoreRef.current = data.score;
      setPassport(data);
      setError(null);
    } catch (err: unknown) {
      console.error(`Failed to load passport ${id}:`, err);
      const errMsg = err instanceof Error ? err.message : "We couldn't find this Passport";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPassportData();
    }, 0);
    const interval = setInterval(() => {
      void fetchPassportData();
    }, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchPassportData]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-28 bg-gray-100 dark:bg-gray-800/60 rounded-2xl animate-pulse" />
        <div className="h-44 bg-gray-100 dark:bg-gray-800/60 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <span className="text-4xl">🔍</span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Passport Not Found
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We couldn&apos;t find a Loan Passport with ID <span className="font-mono">{id}</span>.
        </p>
        <Link
          href="/officer"
          className="inline-block px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
        >
          Go to Officer Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PassportView passport={passport} animateScore={animateScore} />
    </div>
  );
}
