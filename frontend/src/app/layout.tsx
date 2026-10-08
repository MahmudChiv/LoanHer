import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LoenHer — Intelligent SME Loan Readiness Powered by Community & AI",
  description:
    "WhatsApp-based loan-readiness tool empowering women-led micro & small businesses in Nigeria. Built for Wema Bank Hackaholics 7.0.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
        {/* Sleek Dark Header Navigation */}
        <header className="sticky top-0 z-50 bg-[#08080a]/80 backdrop-blur-xl border-b border-white/10 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-white">
                <span>LOENHER</span>
                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316] group-hover:scale-125 transition-transform" />
              </div>
              <span className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Wema Hackaholics 7.0
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/officer" className="hover:text-white transition-colors">
                Officer Desk
              </Link>
              <Link href="/#features" className="hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/passport/pass_kemi_nov2025_sep2026" className="hover:text-white transition-colors">
                Sample Passport
              </Link>
            </nav>

            {/* Header Right Action Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/officer"
                className="px-5 py-2.5 text-xs font-bold rounded-full glow-orange-btn flex items-center gap-2"
              >
                <span>Launch Officer Desk</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Dark Footer */}
        <footer className="border-t border-white/10 bg-[#060608] py-8 text-center text-xs text-zinc-500 print:hidden space-y-2">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-zinc-300">
              <span>LOENHER</span>
              <span className="text-orange-500">•</span>
              <span className="text-zinc-500 font-normal">Wema Bank Hackaholics 7.0 Prototype</span>
            </div>
            <p className="text-zinc-500">
              WhatsApp SME Onboarding · Ajo Community Verification · Financial Statement Parsing
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
