import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coerce a timestamp into a Date. Handles the three shapes an `occurred_at`
 * value can take across the boundary: a Date (server-side Drizzle read), an
 * ISO string (once that Date is JSON-serialised to the client), or a Unix
 * epoch-seconds number/numeric-string (raw column value).
 */
export function toDate(value: Date | number | string): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value * 1000);
  // Numeric string → epoch seconds; otherwise an ISO/date string
  return /^\d+$/.test(value) ? new Date(Number(value) * 1000) : new Date(value);
}

export function formatRelativeTime(date: Date | number): string {
  const d = date instanceof Date ? date : new Date(date * 1000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function formatAbsoluteTime(date: Date | number): string {
  const d = date instanceof Date ? date : new Date(date * 1000);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function parseJsonSafe<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
