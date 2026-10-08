/**
 * Individual application detail page for the officer.
 * Route: /officer/[ref]
 *
 * TODO: Implement in ClickUp task #FRONTEND-OFFICER-DETAIL-01
 *   - Fetch application via lib/api.ts → getApplication(ref)
 *   - Render all application fields plus a link to the associated Passport page.
 *   - Provide a status dropdown (under review / more info requested /
 *     approved for processing / declined) that calls updateApplicationStatus().
 *   - Show a success toast on status update.
 */

interface ApplicationDetailPageProps {
  params: Promise<{ ref: string }>;
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { ref } = await params;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Application {ref}</h1>
      <p className="mt-4 text-gray-400">
        {/* TODO: #FRONTEND-OFFICER-DETAIL-01 */}
        Implementation coming soon.
      </p>
    </main>
  );
}
