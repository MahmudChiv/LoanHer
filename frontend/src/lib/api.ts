/**
 * Typed API fetch helpers for the LoanHer backend.
 *
 * Base URL is read from NEXT_PUBLIC_API_URL (set in .env.local).
 * Falls back to http://localhost:8000 for local development.
 *
 * All helpers are thin wrappers — they handle the fetch, throw on non-OK
 * responses, and return typed data. Business logic stays in the components.
 */

import type {
  Application,
  ApplicationStatus,
  Passport,
  UpdateStatusPayload,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Passport
// ---------------------------------------------------------------------------

/** Fetch a single Loan Passport by its UUID. */
export async function getPassport(id: string): Promise<Passport> {
  return apiFetch<Passport>(`/api/passports/${encodeURIComponent(id)}`);
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

/** List all applications (for the officer dashboard). */
export async function getApplications(): Promise<Application[]> {
  return apiFetch<Application[]>("/api/applications");
}

export interface ApplicationDetailResponse {
  application: Application;
  passport?: Passport;
}

/** Fetch a single application by its human-readable ref (e.g. "APP-0001"). */
export async function getApplication(ref: string): Promise<ApplicationDetailResponse> {
  const data = await apiFetch<any>(`/api/applications/${encodeURIComponent(ref)}`);
  if (data && data.application) {
    return data as ApplicationDetailResponse;
  }
  return {
    application: data as Application,
    passport: (data.passport || undefined) as Passport | undefined,
  };
}

/** Update the status of an application (officer action). */
export async function updateApplicationStatus(
  ref: string,
  status: ApplicationStatus,
): Promise<Application> {
  const payload: UpdateStatusPayload = { status };
  return apiFetch<Application>(`/api/applications/${encodeURIComponent(ref)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

/** Reset all in-memory state for a live demo. Requires the reset secret. */
export async function resetDemo(secret: string): Promise<{ reset: boolean }> {
  return apiFetch<{ reset: boolean }>("/api/demo/reset", {
    method: "POST",
    body: JSON.stringify({ secret }),
  });
}
