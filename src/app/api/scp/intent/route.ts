export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditEvents, merchants, scopeSettings } from "@/lib/db/schema";
import { SCPClient } from "@/lib/scp/client";
import type { SCPIntentInput } from "@/lib/scp/types";

/**
 * The intent channel proxy — the console's governance point for the
 * bidirectional `intent` data type.
 *
 *   POST  = agent → brand   (write intent via scp.put_intent)
 *   GET   = brand → agent   (read intent + merchandise via scp.match_products)
 *
 * Both directions are gated on the merchant's `intent` scope policy. When
 * `intent` is blocked the brand neither accepts writes nor serves reads — which
 * is exactly what makes the storefront handoff go "cold" — and every call is
 * recorded in the same audit log as the pull scopes. Shopper payloads are never
 * stored; audit rows hold metadata only.
 */

const READ_ACTOR = "Acme Storefront";
const WRITE_ACTOR = "Assistant (chat)";

/** Whether the merchant currently exposes the bidirectional intent channel. */
function intentExposed(merchantId: string): boolean {
  const db = getDb();
  const row = db
    .select()
    .from(scopeSettings)
    .where(and(eq(scopeSettings.merchantId, merchantId), eq(scopeSettings.dataType, "intent")))
    .get();
  return row?.exposed ?? false;
}

function recordAudit(params: {
  merchantId: string;
  actor: string;
  status: "success" | "denied" | "error";
  returnedIntent: boolean;
  latencyMs: number;
}): void {
  getDb()
    .insert(auditEvents)
    .values({
      merchantId: params.merchantId,
      actor: params.actor,
      requestedScopes: JSON.stringify(["intent"]),
      dataTypesReturned: JSON.stringify(params.returnedIntent ? ["intent"] : []),
      status: params.status,
      latencyMs: params.latencyMs,
    })
    .run();
}

function isIntentInput(value: unknown): value is SCPIntentInput {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.category === "string" &&
    typeof v.summary === "string" &&
    Array.isArray(v.attributes)
  );
}

/** POST /api/scp/intent — assistant writes durable intent back to the brand. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    merchantId?: string;
    shopperId?: string;
    intent?: unknown;
    actor?: string;
  } | null;

  const merchantId = body?.merchantId;
  const shopperId = body?.shopperId;
  const actor = body?.actor ?? WRITE_ACTOR;

  if (!merchantId || !shopperId || !isIntentInput(body?.intent)) {
    return NextResponse.json(
      { error: "merchantId, shopperId, and a valid intent are required" },
      { status: 400 },
    );
  }

  const merchant = getDb().select().from(merchants).where(eq(merchants.id, merchantId)).get();
  if (!merchant) {
    return NextResponse.json({ error: "merchant not found" }, { status: 404 });
  }

  // Governance gate: a blocked intent channel refuses the write.
  if (!intentExposed(merchantId)) {
    recordAudit({ merchantId, actor, status: "denied", returnedIntent: false, latencyMs: 0 });
    return NextResponse.json({ stored: null, denied: true });
  }

  const client = new SCPClient(merchant.scpEndpointUrl);
  try {
    const { intent, latencyMs, status } = await client.putIntent(shopperId, body.intent);
    const ok = status < 400 && intent !== null;
    recordAudit({
      merchantId,
      actor,
      status: ok ? "success" : "error",
      returnedIntent: ok,
      latencyMs,
    });
    return NextResponse.json({ stored: intent, denied: false, latencyMs });
  } catch (err) {
    recordAudit({ merchantId, actor, status: "error", returnedIntent: false, latencyMs: 0 });
    return NextResponse.json({ stored: null, error: String(err) }, { status: 502 });
  }
}

/** GET /api/scp/intent — storefront reads carried intent + matched products. */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const merchantId = searchParams.get("merchantId");
  const shopperId = searchParams.get("shopperId");
  const actor = searchParams.get("actor") ?? READ_ACTOR;

  if (!merchantId || !shopperId) {
    return NextResponse.json({ error: "merchantId and shopperId are required" }, { status: 400 });
  }

  const merchant = getDb().select().from(merchants).where(eq(merchants.id, merchantId)).get();
  if (!merchant) {
    return NextResponse.json({ error: "merchant not found" }, { status: 404 });
  }

  // Governance gate: a blocked intent channel yields a cold arrival — the
  // storefront gets no intent to personalise against.
  if (!intentExposed(merchantId)) {
    recordAudit({ merchantId, actor, status: "denied", returnedIntent: false, latencyMs: 0 });
    return NextResponse.json({ intent: null, products: [], denied: true });
  }

  const client = new SCPClient(merchant.scpEndpointUrl);
  try {
    const { intent, products, latencyMs, status } = await client.matchProducts(shopperId);
    if (status >= 400) {
      recordAudit({ merchantId, actor, status: "error", returnedIntent: false, latencyMs });
      return NextResponse.json({ intent: null, products: [], error: `HTTP ${status}` }, { status: 502 });
    }
    recordAudit({
      merchantId,
      actor,
      status: "success",
      returnedIntent: intent !== null,
      latencyMs,
    });
    return NextResponse.json({ intent, products, denied: false, latencyMs });
  } catch (err) {
    recordAudit({ merchantId, actor, status: "error", returnedIntent: false, latencyMs: 0 });
    return NextResponse.json({ intent: null, products: [], error: String(err) }, { status: 502 });
  }
}
