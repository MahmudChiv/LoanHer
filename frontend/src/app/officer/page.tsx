/**
 * Officer dashboard — lists all incoming applications.
 * Route: /officer
 *
 * TODO: Implement in ClickUp task #FRONTEND-OFFICER-01
 *   - Fetch applications via lib/api.ts → getApplications()
 *   - Render a sortable table: ref, applicant name, business, band, score, status.
 *   - Clicking a row navigates to /officer/[ref].
 *   - Auto-refresh every 30 seconds so the officer sees new submissions.
 */

import Link from "next/link";

export default function OfficerDashboard() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Officer Dashboard</h1>
      <p className="text-gray-500 mt-2">
        Incoming loan passport submissions from applicants.
      </p>
      <p className="mt-4 text-gray-400">
        {/* TODO: #FRONTEND-OFFICER-01 */}
        Implementation coming soon.
      </p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        ← Back to home
      </Link>
    </main>
  );
}
