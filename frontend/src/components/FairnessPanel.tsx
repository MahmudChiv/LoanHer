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
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Fairness view
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              Illustrative
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Illustrative data. Shows the view Wema would see with real volumes.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Gender Metrics */}
        <div className="space-y-6">
          {/* Approval rate by gender */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Approval rate by gender
            </h3>
            <div className="space-y-2.5">
              {genderApproval.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average indicative limit by gender */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Average indicative limit by gender
            </h3>
            <div className="space-y-2.5">
              {genderLimits.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Approval rate by sector
          </h3>
          <div className="space-y-2.5">
            {sectorApproval.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.value}</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plain Language Footer Note */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          We check that our score doesn&apos;t treat women-led businesses worse, and show the gap if it does.
        </p>
      </div>
    </div>
  );
}
