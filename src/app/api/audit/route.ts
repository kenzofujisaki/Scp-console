export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const merchantId = searchParams.get("merchantId");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
  const offset = Number(searchParams.get("offset") ?? 0);

  if (!merchantId) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  const db = getDb();
  const events = db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.merchantId, merchantId))
    .orderBy(desc(auditEvents.occurredAt))
    .limit(limit)
    .offset(offset)
    .all();

  return NextResponse.json({ events, limit, offset });
}
