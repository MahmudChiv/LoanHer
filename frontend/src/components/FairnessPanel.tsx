import React from "react";

export function FairnessPanel() {
  const genderApproval = [
    { label: "Women", value: "64%", percentage: 64 },
    { label: "Men", value: "66%", percentage: 66 },
  ];

  const sectorApproval = [
    { label: "Retail", value: "68%", percentage: 68 },
    { label: "Food", value: "65%", percentage: 65 },
    { label: "Fashion", value: "63%", percentage: 63 },
    { label: "Services", value: "62%", percentage: 62 },
  ];

  const genderLimits = [
    { label: "Women", value: "₦178,000", percentage: (178000 / 200000) * 100 },
    { label: "Men", value: "₦186,000", percentage: (186000 / 200000) * 100 },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black tracking-tight text-white">
              Fairness view
            </h2>
            <span className="px-3 py-0.5 text-[11px] font-extrabold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Illustrative
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Illustrative data. Shows the view Wema would see with real volumes.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Gender Metrics */}
        <div className="space-y-6">
          {/* Approval rate by gender */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Approval rate by gender
            </h3>
            <div className="space-y-3">
              {genderApproval.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200">{item.label}</span>
                    <span className="text-orange-400 font-bold">{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average indicative limit by gender */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Average indicative limit by gender
            </h3>
            <div className="space-y-3">
              {genderLimits.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200">{item.label}</span>
                    <span className="text-amber-300 font-bold">{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sector Metrics */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Approval rate by sector
          </h3>
          <div className="space-y-3">
            {sectorApproval.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-200">{item.label}</span>
                  <span className="text-emerald-400 font-bold">{item.value}</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plain Language Footer Note */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-zinc-400 font-medium">
          We check that our score doesn&apos;t treat women-led businesses worse, and show the gap if it does.
        </p>
      </div>
    </div>
  );
}
