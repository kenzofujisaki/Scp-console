export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { merchants } from "@/lib/db/schema";
import { SCPClient } from "@/lib/scp/client";

/** GET /api/scp/discover?merchantId= — ping discovery endpoint + report health */
export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  const db = getDb();
  const merchant = db.select().from(merchants).where(eq(merchants.id, merchantId)).get();
  if (!merchant) {
    return NextResponse.json({ error: "merchant not found" }, { status: 404 });
  }

  const client = new SCPClient(merchant.scpEndpointUrl);
  try {
    const config = await client.discover();
    return NextResponse.json({ config, healthy: true });
  } catch (err) {
    return NextResponse.json({ config: null, healthy: false, error: String(err) });
  }
}
