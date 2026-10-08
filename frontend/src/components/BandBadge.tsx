import type { Band } from "@/types";

interface BandBadgeProps {
  band: Band;
  size?: "sm" | "md" | "lg";
}

export function BandBadge({ band, size = "md" }: BandBadgeProps) {
  const styles: Record<Band, string> = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
    B: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700",
    C: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
    D: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded-full border",
    md: "px-2.5 py-1 text-xs font-bold rounded-full border",
    lg: "px-3.5 py-1.5 text-sm font-extrabold rounded-full border",
  };

  return (
    <span className={`inline-flex items-center ${sizes[size]} ${styles[band] || styles.C}`}>
      Band {band}
    </span>
  );
}

export default BandBadge;
