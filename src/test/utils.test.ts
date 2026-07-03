import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, parseJsonSafe, formatRelativeTime, formatAbsoluteTime } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates Tailwind classes correctly", () => {
    // tailwind-merge should pick the last of conflicting utilities
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });
});

describe("parseJsonSafe", () => {
  it("parses valid JSON", () => {
    expect(parseJsonSafe<string[]>('["a","b"]', [])).toEqual(["a", "b"]);
  });

  it("returns fallback on invalid JSON", () => {
    expect(parseJsonSafe<string[]>("not-json", [])).toEqual([]);
  });

  it("returns fallback on empty string", () => {
    expect(parseJsonSafe<null>("", null)).toBeNull();
  });
});

describe("formatRelativeTime", () => {
  const BASE = new Date("2025-01-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for events within 60 seconds", () => {
    expect(formatRelativeTime(new Date("2025-01-15T11:59:30Z"))).toBe("just now");
  });

  it("returns minutes for events between 1 minute and 1 hour ago", () => {
    expect(formatRelativeTime(new Date("2025-01-15T11:45:00Z"))).toBe("15m ago");
  });

  it("returns hours for events between 1 and 24 hours ago", () => {
    expect(formatRelativeTime(new Date("2025-01-15T09:00:00Z"))).toBe("3h ago");
  });

  it("returns days for events older than 24 hours", () => {
    expect(formatRelativeTime(new Date("2025-01-13T12:00:00Z"))).toBe("2d ago");
  });

  it("accepts Unix epoch seconds (number) and multiplies by 1000", () => {
    const unix = Math.floor(new Date("2025-01-15T11:59:30Z").getTime() / 1000);
    expect(formatRelativeTime(unix)).toBe("just now");
  });
});

describe("formatAbsoluteTime", () => {
  it("formats a Date as a locale string", () => {
    const d = new Date("2025-06-15T10:30:45Z");
    const result = formatAbsoluteTime(d);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(5);
  });

  it("accepts Unix epoch seconds and produces the same output as a Date", () => {
    const d = new Date("2025-06-15T10:30:00Z");
    const unix = Math.floor(d.getTime() / 1000);
    expect(formatAbsoluteTime(unix)).toBe(formatAbsoluteTime(d));
  });
});
