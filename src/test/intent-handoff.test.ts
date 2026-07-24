import { describe, it, expect, vi, afterEach } from "vitest";
import type { SCPIntent } from "@scp/protocol";
import { matchProducts } from "../../packages/reference-server/src/data/products";
import { putIntent, getIntent } from "../../packages/reference-server/src/data/intents";

function rodeoIntent(): SCPIntent {
  return {
    intent_id: "int_test",
    shopper_id: "shopper_test",
    category: "boots",
    occasion: "Houston Rodeo",
    timeframe: "March",
    summary: "Men's brown leather boots for the Houston Rodeo in March, size 11",
    attributes: [
      { name: "gender", value: "men's" },
      { name: "size", value: "11" },
      { name: "color", value: "brown" },
      { name: "material", value: "leather" },
    ],
    source: "chat",
    created_at: "2026-01-01T00:00:00.000Z",
    expires_at: "2026-02-01T00:00:00.000Z",
  };
}

describe("matchProducts", () => {
  it("ranks the on-target western boot first for a rodeo-boots intent", () => {
    const matched = matchProducts(rodeoIntent());
    expect(matched[0]?.name).toBe("Cimarron Western Boot");
  });

  it("only returns products that clear the relevance floor", () => {
    const matched = matchProducts(rodeoIntent());
    // Every match must share the category or an occasion/use-case signal —
    // no unrelated catalog items leak in.
    for (const p of matched) {
      const relevant =
        p.category === "boots" || p.useCases.some((u) => u.toLowerCase() === "rodeo");
      expect(relevant).toBe(true);
    }
  });

  it("respects the result limit", () => {
    expect(matchProducts(rodeoIntent(), 3)).toHaveLength(3);
  });

  it("returns nothing for a category the catalog does not carry", () => {
    const intent: SCPIntent = { ...rodeoIntent(), category: "kayak", occasion: null, summary: "a kayak", attributes: [] };
    expect(matchProducts(intent)).toHaveLength(0);
  });
});

describe("intent store", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stamps server fields on write and returns them on read", () => {
    const stored = putIntent("shopper_777", {
      category: "boots",
      occasion: "rodeo",
      timeframe: null,
      summary: "boots",
      attributes: [{ name: "color", value: "brown" }],
    });
    expect(stored.intent_id).toMatch(/^int_/);
    expect(stored.shopper_id).toBe("shopper_777");
    expect(stored.source).toBe("chat");
    expect(getIntent("shopper_777")).toEqual(stored);
  });

  it("returns null for a shopper with no intent", () => {
    expect(getIntent("shopper_never")).toBeNull();
  });

  it("replaces the previous intent for a shopper", () => {
    putIntent("shopper_888", { category: "boots", occasion: null, timeframe: null, summary: "a", attributes: [] });
    const second = putIntent("shopper_888", { category: "jacket", occasion: null, timeframe: null, summary: "b", attributes: [] });
    expect(getIntent("shopper_888")?.category).toBe("jacket");
    expect(getIntent("shopper_888")?.intent_id).toBe(second.intent_id);
  });

  it("expires intent after its expires_at", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T00:00:00.000Z"));
    putIntent("shopper_999", { category: "boots", occasion: null, timeframe: null, summary: "a", attributes: [] });
    expect(getIntent("shopper_999")).not.toBeNull();

    // Jump 31 days — past the 30-day window.
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    expect(getIntent("shopper_999")).toBeNull();
  });
});
