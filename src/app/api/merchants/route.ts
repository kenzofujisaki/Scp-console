export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { merchants, scopeSettings } from "@/lib/db/schema";

const ALL_SCOPES = ["orders", "loyalty", "offers", "preferences"] as const;

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
    new URL(scpEndpointUrl);
  } catch {
    return NextResponse.json({ error: "scpEndpointUrl must be a valid URL" }, { status: 400 });
  }

  const db = getDb();
  const merchant = db
    .insert(merchants)
    .values({ name, scpEndpointUrl, isReference: false })
    .returning()
    .get();

  for (const dataType of ALL_SCOPES) {
    db.insert(scopeSettings).values({ merchantId: merchant.id, dataType, exposed: true }).run();
  }

  return NextResponse.json({ merchant }, { status: 201 });
}
