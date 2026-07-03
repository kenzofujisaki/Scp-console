export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditEvents, merchants, scopeSettings, testRuns } from "@/lib/db/schema";
import { SCPClient } from "@/lib/scp/client";
import type { SCPScope } from "@/lib/scp/types";

/**
 * GET /api/scp/context
 *
 * Proxies a context request to the merchant's SCP server, applying scope policy
 * before the call (denied scopes are stripped), then writes an audit record.
 *
 * Query params:
 *   merchantId  — required
 *   shopperId   — required
 *   scopes      — comma-separated list, e.g. "order_history,loyalty"
 *   actor       — label for the audit log (default: "SCP Console")
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const merchantId = searchParams.get("merchantId");
  const shopperId = searchParams.get("shopperId");
  const scopeParam = searchParams.get("scopes") ?? "";
  const actor = searchParams.get("actor") ?? "SCP Console";

  if (!merchantId || !shopperId) {
    return NextResponse.json(
      { error: "merchantId and shopperId are required" },
      { status: 400 },
    );
  }

  const db = getDb();

  const merchant = db.select().from(merchants).where(eq(merchants.id, merchantId)).get();
  if (!merchant) {
    return NextResponse.json({ error: "merchant not found" }, { status: 404 });
  }

  // Parse requested scopes
  const requestedScopes = scopeParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as SCPScope[];

  // Apply scope policy — only send scopes the merchant has enabled
  const policyRows = db
    .select()
    .from(scopeSettings)
    .where(and(eq(scopeSettings.merchantId, merchantId), eq(scopeSettings.exposed, true)))
    .all();
  const allowedScopeSet = new Set(policyRows.map((r) => r.dataType));
  const filteredScopes = requestedScopes.filter((s) => allowedScopeSet.has(s));
  const scopesDenied = requestedScopes.filter((s) => !allowedScopeSet.has(s));

  // Call SCP server
  const client = new SCPClient(merchant.scpEndpointUrl);
  let responseData = null;
  let responseStatus = 200;
  let latencyMs = 0;
  let errorMsg: string | undefined;

  try {
    const result = await client.getContext(shopperId, filteredScopes);
    responseData = result.data;
    responseStatus = result.status;
    latencyMs = result.latencyMs;
  } catch (err) {
    errorMsg = String(err);
    responseStatus = 502;
  }

  const auditStatus: "success" | "denied" | "error" = errorMsg
    ? "error"
    : responseStatus >= 400
      ? "denied"
      : "success";

  const dataTypesReturned = responseData?.scopes_returned ?? [];

  // Persist test run + audit event (no shopper payload stored)
  db.insert(testRuns)
    .values({
      merchantId,
      shopperId,
      requestedScopes: JSON.stringify(requestedScopes),
      filteredScopes: JSON.stringify(filteredScopes),
      responseStatus,
      latencyMs,
    })
    .run();

  db.insert(auditEvents)
    .values({
      merchantId,
      actor,
      requestedScopes: JSON.stringify(requestedScopes),
      dataTypesReturned: JSON.stringify(dataTypesReturned),
      status: auditStatus,
      latencyMs,
    })
    .run();

  return NextResponse.json({
    data: responseData,
    status: responseStatus,
    latencyMs,
    filteredScopes,
    requestedScopes,
    scopesDenied,
    error: errorMsg,
  });
}
