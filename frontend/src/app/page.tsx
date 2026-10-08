import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col bg-[#08080a] relative overflow-hidden">
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-36 flex flex-col items-center text-center px-4 max-w-5xl mx-auto space-y-8 z-10">
        
        {/* Top Glow Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glow-pill-badge text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.2)] animate-pulse">
          <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-extrabold text-[10px] uppercase">
            Whats New
          </span>
          <span>LoenHer Engine v1.0</span>
          <span className="text-orange-400 font-mono">›</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1]">
          Intelligent Credit Solutions{" "}
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            Powered by Community.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-zinc-400 max-w-2xl leading-relaxed">
          Gain clarity and unlock credit for women-led micro & small businesses in Nigeria. Instant loan readiness passports backed by Ajo community data.
        </p>

        {/* CTA Button Group */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 z-20">
          <Link
            href="/passport/pass_kemi_nov2025_sep2026"
            className="px-6 py-3.5 text-xs font-bold rounded-full glass-card hover:bg-white/10 text-zinc-200 border border-white/10 transition-all duration-300 flex items-center gap-2"
          >
            <span>Explore Sample Passport</span>
            <span>→</span>
          </Link>
          <Link
            href="/officer"
            className="px-7 py-3.5 text-xs font-bold rounded-full glow-orange-btn flex items-center gap-2"
          >
            <span>Launch Officer Desk</span>
            <span>→</span>
          </Link>
        </div>

        {/* Glowing Arch Halo Graphic matching the Screenshot */}
        <div className="relative w-full max-w-4xl mt-12 pt-8 flex flex-col items-center justify-center">
          {/* Outer Ambient Glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />

          {/* Curved Glowing Ring Arch */}
          <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-t-full border-t-4 border-orange-500/80 bg-gradient-to-b from-orange-500/20 via-orange-600/5 to-transparent shadow-[0_-15px_60px_rgba(249,115,22,0.5)] flex items-end justify-center overflow-hidden">
            {/* Inner Ring Glow Specular Light */}
            <div className="absolute top-0 w-3/4 h-2 bg-amber-300 blur-sm rounded-full" />

            {/* Dashboard Floating Preview Bar at Bottom of Ring (matching screenshot) */}
            <div className="w-full max-w-3xl mx-4 mb-4 p-3.5 rounded-2xl glass-card border border-white/15 shadow-2xl flex items-center justify-between gap-4 z-20">
              <div className="flex items-center gap-2 font-black text-xs text-white px-2">
                <span>LOENHER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              </div>
              
              <div className="hidden sm:flex items-center gap-4 text-[11px] font-semibold text-zinc-400">
                <span className="text-white flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Overview
                </span>
                <span className="hover:text-zinc-200 cursor-pointer">Loan Passports</span>
                <span className="hover:text-zinc-200 cursor-pointer">Ajo Verifications</span>
                <span className="hover:text-zinc-200 cursor-pointer">Fairness View</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Queue Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Wema Bank Hackaholics 7.0
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            A complete solution bridging informal community savings and formal banking credit readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="text-lg font-bold text-white">WhatsApp Onboarding</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Applicants chat with a Twilio sandbox bot, providing their name, CAC registration number, and bank statement PDF directly on WhatsApp.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
              🤝
            </div>
            <h3 className="text-lg font-bold text-white">Ajo Community Trust</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Collects informal rotating savings group records and verifies contribution discipline directly with the Ajo collector for credit scoring.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
              📄
            </div>
            <h3 className="text-lg font-bold text-white">Verified Loan Passport</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates an official digital Loan Passport with readiness bands (A-D), key cash flow metrics, QR code sharing, and PDF print export.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full text-center z-10">
        <div className="p-10 rounded-3xl glass-card border border-orange-500/20 bg-gradient-to-br from-orange-950/30 via-zinc-900/80 to-zinc-950 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to review SME loan applications?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Access Wema Bank&apos;s Officer Desk to view live incoming loan passports and inspect equity fairness metrics.
          </p>
          <div>
            <Link
              href="/officer"
              className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold rounded-full glow-orange-btn"
            >
              <span>Open Officer Dashboard</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
