/**
 * Formatting helpers for currency and timestamps.
 * 
 * NOTE: Never show interest rates or loan pricing anywhere.
 */

/**
 * Format a number as Nigerian Naira, e.g. ₦385,000
 */
export function formatNaira(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) {
    return "₦0";
  }
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

/**
 * Format an ISO datetime string to a human-friendly relative time,
 * e.g. "just now", "2 min ago", "1 hr ago", "3 days ago".
 */
export function formatRelativeTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "—";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0 || diffInSeconds < 45) {
    return "just now";
  }
  if (diffInSeconds < 90) {
    return "1 min ago";
  }

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return "1 hr ago";
  }
  if (hours < 24) {
    return `${hours} hrs ago`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "yesterday";
  }
  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months === 1) {
    return "1 mo ago";
  }
  if (months < 12) {
    return `${months} mos ago`;
  }

  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format full date and time for detail displays, e.g. "15 Jan 2024, 09:30 AM"
 */
export function formatDateTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
