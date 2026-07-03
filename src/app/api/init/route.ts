export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { seedReferenceMerchant } from "@/lib/db/seed";

/** POST /api/init — seed the reference merchant. Idempotent. */
export async function POST() {
  const merchant = seedReferenceMerchant();
  return NextResponse.json({ merchant });
}
