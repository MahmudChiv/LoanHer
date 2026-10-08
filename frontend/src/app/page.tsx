/**
 * Landing page — lists the LoanHer name and links to the officer dashboard.
 *
 * TODO: Style and flesh out in ClickUp task #FRONTEND-LANDING-01
 */
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">LoanHer</h1>
      <p className="text-lg text-center max-w-prose text-gray-600">
        A WhatsApp-based loan-readiness tool for women-led small businesses in Nigeria.
      </p>
      <nav className="flex gap-4">
        <Link
          href="/officer"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Officer Dashboard →
        </Link>
      </nav>
      <p className="text-sm text-gray-400">
        Applicants interact via WhatsApp — no login required.
      </p>
    </main>
  );
}
