export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { merchants } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: { merchantId: string } },
) {
  const db = getDb();
  const merchant = db
    .select()
    .from(merchants)
    .where(eq(merchants.id, params.merchantId))
    .get();
  if (!merchant) {
    return NextResponse.json({ error: "merchant not found" }, { status: 404 });
  }
  return NextResponse.json({ merchant });
}
