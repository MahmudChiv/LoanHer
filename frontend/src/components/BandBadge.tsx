import type { Band } from "@/types";

interface BandBadgeProps {
  band: Band;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function BandBadge({
  band,
  size = "md",
  className = "",
  showLabel = true,
}: BandBadgeProps) {
  // Styles based on specification:
  // Band A: green, Band B: teal, Band C: amber, Band D: red
  const config: Record<
    Band,
    {
      bg: string;
      text: string;
      border: string;
      dot: string;
      label: string;
    }
  > = {
    A: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Band A",
    },
    B: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      dot: "bg-teal-500",
      label: "Band B",
    },
    C: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Band C",
    },
    D: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      label: "Band D",
    },
  };

  const current = config[band] || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
    label: `Band ${band}`,
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
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
      className={`inline-flex items-center rounded-full border shadow-xs tracking-wide transition-colors ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
      title={`Risk Band ${band}`}
    >
      <span className={`rounded-full shrink-0 ${current.dot} ${dotSize}`} />
      <span>{showLabel ? current.label : band}</span>
    </span>
  );
}

export default BandBadge;
