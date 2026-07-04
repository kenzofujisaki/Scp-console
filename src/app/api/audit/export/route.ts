export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";

/** GET /api/audit/export?merchantId= — CSV download, metadata only, no PII */
export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  const db = getDb();
  const events = db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.merchantId, merchantId))
    .orderBy(desc(auditEvents.occurredAt))
    .all();

  const header =
    "id,actor,requested_scopes,data_types_returned,status,latency_ms,occurred_at\n";
  const rows = events.map((e) => {
    const ts =
      e.occurredAt instanceof Date
        ? e.occurredAt.toISOString()
        : new Date((e.occurredAt as number) * 1000).toISOString();
    return [e.id, e.actor, e.requestedScopes, e.dataTypesReturned, e.status, e.latencyMs ?? "", ts]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = header + rows.join("\n");
  const filename = `scp-audit-${merchantId.slice(0, 8)}-${Date.now()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
