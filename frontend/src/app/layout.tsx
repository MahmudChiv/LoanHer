import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoenHer — Wema Bank Loan Readiness Tool",
  description:
    "WhatsApp-based loan-readiness tool for women-led SMEs in Nigeria. Built for Wema Bank Hackaholics 7.0.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-emerald-500 selection:text-white">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                LoenHer
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Wema Prototype
              </span>
            </Link>

            <nav className="flex items-center gap-4 text-xs font-semibold">
              <Link
                href="/officer"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
              >
                Officer Desk
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 text-center text-xs text-gray-500 dark:text-gray-400 print:hidden">
          <div className="max-w-7xl mx-auto px-4">
            <p>LoenHer · Wema Bank Hackaholics 7.0 Prototype</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
