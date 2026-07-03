import { describe, it, expect } from "vitest";
import { cn, parseJsonSafe } from "@/lib/utils";

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
