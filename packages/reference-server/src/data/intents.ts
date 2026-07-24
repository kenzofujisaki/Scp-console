import { randomUUID } from "node:crypto";
import type { SCPIntent, SCPIntentInput } from "@scp/protocol";

/**
 * In-memory intent store, keyed by shopper. One live intent per shopper — a new
 * `put_intent` replaces the previous one. Durable enough for the chat → storefront
 * handoff (it survives across requests); persisted storage is a later concern.
 */
const INTENTS = new Map<string, SCPIntent>();

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Store (or replace) a shopper's intent, stamping server-assigned fields. */
export function putIntent(shopperId: string, input: SCPIntentInput): SCPIntent {
  const now = Date.now();
  const intent: SCPIntent = {
    intent_id: `int_${randomUUID()}`,
    shopper_id: shopperId,
    category: input.category,
    occasion: input.occasion ?? null,
    timeframe: input.timeframe ?? null,
    attributes: Array.isArray(input.attributes) ? input.attributes : [],
    summary: input.summary,
    source: input.source ?? "chat",
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + THIRTY_DAYS_MS).toISOString(),
  };
  INTENTS.set(shopperId, intent);
  return intent;
}

/** The shopper's latest non-expired intent, or null if none / expired. */
export function getIntent(shopperId: string): SCPIntent | null {
  const intent = INTENTS.get(shopperId);
  if (!intent) return null;
  if (Date.parse(intent.expires_at) <= Date.now()) {
    INTENTS.delete(shopperId);
    return null;
  }
  return intent;
}
