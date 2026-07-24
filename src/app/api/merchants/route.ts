export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { merchants, scopeSettings } from "@/lib/db/schema";
import {
  assertSafeEndpointUrl,
  assertEndpointResolvesPublic,
  UnsafeUrlError,
} from "@/lib/security/url";

// The four SCP pull scopes plus the bidirectional `intent` channel — all
// governed through scope_settings.
const GOVERNED_DATA_TYPES = ["orders", "loyalty", "offers", "preferences", "intent"] as const;

export async function GET() {
  const db = getDb();
  const rows = db.select().from(merchants).all();
  return NextResponse.json({ merchants: rows });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string; scpEndpointUrl?: string };
  const { name, scpEndpointUrl } = body;

  if (!name || !scpEndpointUrl) {
    return NextResponse.json({ error: "name and scpEndpointUrl are required" }, { status: 400 });
  }

  try {
    const parsed = assertSafeEndpointUrl(scpEndpointUrl);
    await assertEndpointResolvesPublic(parsed.hostname);
  } catch (err) {
    if (err instanceof UnsafeUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const db = getDb();
  const merchant = db
    .insert(merchants)
    .values({ name, scpEndpointUrl, isReference: false })
    .returning()
    .get();

  for (const dataType of GOVERNED_DATA_TYPES) {
    db.insert(scopeSettings).values({ merchantId: merchant.id, dataType, exposed: true }).run();
  }

  return NextResponse.json({ merchant }, { status: 201 });
}
