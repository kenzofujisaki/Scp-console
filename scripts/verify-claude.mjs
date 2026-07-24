// Verifies the Anthropic setup end-to-end by doing a REAL intent extraction —
// the same forced-schema pattern the /dashboard/handoff demo will use.
//
// Run:  node --env-file=.env.local scripts/verify-claude.mjs
//
// Success => your key works, the SDK works, structured output works, and Claude
// infers unstated intent (occasion/timeframe/size) from a free-form sentence.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("✗ ANTHROPIC_API_KEY is empty. Add it to .env.local, then re-run.");
  process.exit(1);
}

// The transferable-intent object SCP carries back to the brand.
const IntentSchema = z.object({
  category: z.string().describe("Product category the shopper wants, e.g. 'boots'"),
  occasion: z.string().nullable().describe("Why they're shopping, if inferable"),
  timeframe: z.string().nullable().describe("When they need it, if mentioned"),
  attributes: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .describe("Concrete constraints: size, width, style, color, gender…"),
  summary: z.string().describe("One-line, brand-facing restatement of intent"),
});

const client = new Anthropic();

const shopperMessage =
  "hey, I need some boots for the Houston Rodeo in March — I'm a men's 11, prefer brown leather";

console.log("Shopper typed:\n  " + shopperMessage + "\n");
console.log("Extracting intent with claude-opus-4-8…\n");

const res = await client.messages.parse({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  thinking: { type: "adaptive" },
  output_config: { effort: "low", format: zodOutputFormat(IntentSchema, "intent") },
  system:
    "You extract durable, transferable shopper intent from a chat message so a brand's " +
    "storefront can greet the shopper already knowing why they're there. Infer occasion, " +
    "timeframe, and attributes even when not stated explicitly. Do not invent facts.",
  messages: [{ role: "user", content: shopperMessage }],
});

if (!res.parsed_output) {
  console.error("✗ Model did not return a schema-valid object. stop_reason:", res.stop_reason);
  process.exit(1);
}

console.log("✓ Structured intent extracted:\n");
console.log(JSON.stringify(res.parsed_output, null, 2));
console.log(
  "\nTokens — in:",
  res.usage.input_tokens,
  "out:",
  res.usage.output_tokens,
  "| model:",
  res.model,
);
console.log("\n✓ Claude is set up. The handoff demo can use this exact call.");
