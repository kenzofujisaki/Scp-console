export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import type { SCPIntentInput } from "@/lib/scp/types";

/**
 * POST /api/handoff/extract
 *
 * Turns a free-form shopper message into structured, transferable intent — the
 * "uplink" from clicks to natural language. Claude is the primary path (it
 * infers occasion / timeframe / attributes the shopper never stated
 * explicitly); a deterministic heuristic is the fallback so the demo still works
 * offline or without an API key. The response's `mode` tells the UI which ran.
 */

// zodOutputFormat needs a zod v4 schema — import from "zod/v4", not "zod".
const IntentSchema = z.object({
  category: z.string().describe("Product category the shopper wants, e.g. 'boots'"),
  occasion: z.string().nullable().describe("Why they're shopping, if inferable"),
  timeframe: z.string().nullable().describe("When they need it, if mentioned"),
  attributes: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .describe("Concrete constraints: size, width, style, color, material, gender…"),
  summary: z.string().describe("One-line, brand-facing restatement of intent"),
});

const SYSTEM =
  "You extract durable, transferable shopper intent from a chat message so a brand's " +
  "storefront can greet the shopper already knowing why they're there. Infer occasion, " +
  "timeframe, and attributes even when not stated explicitly. Do not invent facts the " +
  "message doesn't support.";

async function extractWithClaude(message: string): Promise<SCPIntentInput> {
  const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
  const res = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: zodOutputFormat(IntentSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: message }],
  });
  if (!res.parsed_output) {
    throw new Error(`extraction returned no schema-valid output (stop_reason: ${res.stop_reason})`);
  }
  return { ...res.parsed_output, source: "chat" };
}

// --- Deterministic fallback -------------------------------------------------

const CATEGORY_WORDS: Record<string, string> = {
  boot: "boots",
  boots: "boots",
  jacket: "jacket",
  coat: "jacket",
  parka: "jacket",
  shoe: "shoes",
  shoes: "shoes",
  sneaker: "shoes",
  hat: "hat",
  backpack: "backpack",
  pack: "backpack",
  glove: "gloves",
  gloves: "gloves",
  sock: "apparel",
  socks: "apparel",
  chair: "furniture",
};

const OCCASION_WORDS = [
  "rodeo",
  "wedding",
  "hiking",
  "hike",
  "camping",
  "work",
  "skiing",
  "travel",
  "trail",
];

const COLOR_WORDS = ["black", "brown", "tan", "red", "blue", "green", "gray", "grey", "silver"];
const MATERIAL_WORDS = ["leather", "denim", "wool", "merino", "down", "nubuck", "suede"];
const MONTHS =
  /\b(january|february|march|april|may|june|july|august|september|october|november|december|spring|summer|fall|autumn|winter)\b/i;

/** A light keyword extractor — clearly simpler than Claude, but not a fixed puppet. */
function heuristicIntent(message: string): SCPIntentInput {
  const lower = message.toLowerCase();
  const words = lower.split(/[^a-z0-9']+/).filter(Boolean);

  let category = "general";
  for (const w of words) {
    if (CATEGORY_WORDS[w]) {
      category = CATEGORY_WORDS[w];
      break;
    }
  }

  const occasion = OCCASION_WORDS.find((o) => lower.includes(o)) ?? null;
  const timeframeMatch = message.match(MONTHS);
  const timeframe = timeframeMatch ? timeframeMatch[0] : null;

  const attributes: { name: string; value: string }[] = [];
  const color = COLOR_WORDS.find((c) => lower.includes(c));
  if (color) attributes.push({ name: "color", value: color });
  const material = MATERIAL_WORDS.find((m) => lower.includes(m));
  if (material) attributes.push({ name: "material", value: material });
  const size =
    message.match(/\bsize\s*(\d{1,2})\b/i) ?? message.match(/\b(?:men'?s|women'?s)?\s*(\d{1,2})\b/);
  if (size?.[1]) attributes.push({ name: "size", value: size[1] });
  if (/\bmen'?s\b/i.test(message)) attributes.push({ name: "gender", value: "men's" });
  else if (/\bwomen'?s\b/i.test(message)) attributes.push({ name: "gender", value: "women's" });

  const summaryBits = [
    color,
    material,
    category !== "general" ? category : null,
    occasion ? `for ${occasion}` : null,
    timeframe ? `(${timeframe})` : null,
  ].filter(Boolean);
  const summary = summaryBits.length
    ? summaryBits.join(" ").replace(/^\w/, (c) => c.toUpperCase())
    : message.trim().slice(0, 120);

  return { category, occasion, timeframe, attributes, summary, source: "chat" };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const intent = await extractWithClaude(message);
      return NextResponse.json({ intent, mode: "live" });
    } catch (err) {
      // Fall through to the deterministic path so the demo never breaks.
      console.warn("[handoff] live extraction failed, using fallback:", String(err));
    }
  }

  return NextResponse.json({ intent: heuristicIntent(message), mode: "demo" });
}
