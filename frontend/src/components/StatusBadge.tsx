import type { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const styles: Record<ApplicationStatus, string> = {
    submitted: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
    "under review": "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
    "more info requested": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700",
    "approved for processing": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
    declined: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded-full border capitalize",
    md: "px-2.5 py-1 text-xs font-bold rounded-full border capitalize",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizes[size]} ${styles[status] || styles.submitted}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
}

export default StatusBadge;
