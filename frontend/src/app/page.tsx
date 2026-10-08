import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
        Wema Bank Hackaholics 7.0 Prototype
      </div>

      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
        LoenHer
      </h1>

      <p className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
        WhatsApp-based loan-readiness tool empowering women-led micro & small businesses in Nigeria.
      </p>

      <div className="pt-4 flex flex-wrap justify-center gap-4">
        <Link
          href="/officer"
          className="px-6 py-3.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all hover:shadow"
        >
          Open Officer Dashboard →
        </Link>
      </div>

      <div className="pt-12 text-xs text-gray-400 space-y-1">
        <p>Built for Wema Bank Hackaholics 7.0</p>
        <p className="italic">Runs on simulated dummy data · No loan pricing or interest rates</p>
      </div>
    </main>
  );
}
