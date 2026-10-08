import type { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const config: Record<
    ApplicationStatus,
    {
      bg: string;
      text: string;
      border: string;
      dot: string;
      label: string;
      pulse?: boolean;
    }
  > = {
    submitted: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      label: "Submitted",
    },
    "under review": {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Under Review",
      pulse: true,
    },
    "more info requested": {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
      label: "More Info Requested",
    },
    "approved for processing": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Approved for Processing",
    },
    declined: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      label: "Declined",
    },
  };

  const current = config[status] || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
    label: status,
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1.5",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  }[size];

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <span
        className={`rounded-full shrink-0 ${current.dot} ${dotSize} ${
          current.pulse ? "animate-pulse" : ""
        }`}
      />
      <span className="capitalize">{current.label}</span>
    </span>
  );
}

export default StatusBadge;
