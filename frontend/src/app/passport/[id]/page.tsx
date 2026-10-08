/**
 * Applicant's Loan Passport page.
 * Route: /passport/[id]
 *
 * Fetches a Passport by ID from the backend and renders it.
 *
 * TODO: Implement in ClickUp task #FRONTEND-PASSPORT-01
 *   - Fetch passport via lib/api.ts → getPassport(id)
 *   - Render: applicant name, business name, band badge, score gauge, key numbers,
 *     ajo info, readiness checklist, tips, and the "Send to Wema" button.
 *   - "Send to Wema" calls POST /api/applications and shows a confirmation.
 *   - Show a loading skeleton and a 404 message if passport is not found.
 */

import { Suspense } from "react";

interface PassportPageProps {
  params: Promise<{ id: string }>;
}

async function PassportContent({ params }: PassportPageProps) {
  const { id } = await params;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Loan Passport</h1>
      <p className="text-gray-500 mt-2">Passport ID: {id}</p>
      <p className="mt-4 text-gray-400">
        {/* TODO: #FRONTEND-PASSPORT-01 */}
        Implementation coming soon.
      </p>
    </main>
  );
}

export default function PassportPage(props: PassportPageProps) {
  return (
    <Suspense fallback={<div className="p-8">Loading passport...</div>}>
      <PassportContent {...props} />
    </Suspense>
  );
}
