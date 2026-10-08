import type { VerificationStatus } from "@/types";

interface AjoVerificationChipProps {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSubtitle?: boolean;
}

export function AjoVerificationChip({
  status,
  size = "md",
  className = "",
  showSubtitle = false,
}: AjoVerificationChipProps) {
  const config: Record<
    VerificationStatus,
    {
      title: string;
      subtitle: string;
      badgeBg: string;
      badgeText: string;
      badgeBorder: string;
      dotBg: string;
      icon: "check" | "clock" | "alert";
    }
  > = {
    "collector-confirmed": {
      title: "Collector Confirmed",
      subtitle: "Verified by savings collector • Strong repayment signal",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-300",
      dotBg: "bg-emerald-500",
      icon: "check",
    },
    "self-reported": {
      title: "Self-Reported Ajo",
      subtitle: "Declared by borrower • Pending collector verification",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-800",
      badgeBorder: "border-amber-300",
      dotBg: "bg-amber-500",
      icon: "clock",
    },
    "not-confirmed": {
      title: "Not Confirmed",
      subtitle: "Ajo collector did not confirm active group participation",
      badgeBg: "bg-rose-50",
      badgeText: "text-rose-800",
      badgeBorder: "border-rose-300",
      dotBg: "bg-rose-500",
      icon: "alert",
    },
  };

  const current = config[status] || {
    title: status,
    subtitle: "Ajo verification status unknown",
    badgeBg: "bg-slate-50",
    badgeText: "text-slate-800",
    badgeBorder: "border-slate-300",
    dotBg: "bg-slate-500",
    icon: "alert" as const,
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1.5",
    md: "px-3 py-1 text-xs sm:text-sm font-semibold gap-2",
    lg: "px-3.5 py-1.5 text-sm sm:text-base font-bold gap-2.5",
  }[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${current.badgeBg} ${current.badgeText} ${current.badgeBorder} ${sizeClasses}`}
        title={current.subtitle}
      >
        {current.icon === "check" && (
          <svg
            className="w-4 h-4 shrink-0 text-emerald-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {current.icon === "clock" && (
          <svg
            className="w-4 h-4 shrink-0 text-amber-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {current.icon === "alert" && (
          <svg
            className="w-4 h-4 shrink-0 text-rose-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="tracking-wide">
          Ajo: {current.title}
        </span>
      </span>
      {showSubtitle && (
        <span className="text-xs text-slate-500 mt-1 pl-1">
          {current.subtitle}
        </span>
      )}
    </div>
  );
}

export default AjoVerificationChip;
