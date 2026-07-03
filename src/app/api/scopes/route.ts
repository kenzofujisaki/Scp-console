export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { policyChanges, scopeSettings } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) {
    return NextResponse.json({ error: "merchantId query param is required" }, { status: 400 });
  }

  const db = getDb();
  const rows = db.select().from(scopeSettings).where(eq(scopeSettings.merchantId, merchantId)).all();
  return NextResponse.json({ scopes: rows });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as {
    merchantId?: string;
    dataType?: string;
    exposed?: boolean;
  };
  const { merchantId, dataType, exposed } = body;

  if (!merchantId || !dataType || exposed === undefined) {
    return NextResponse.json(
      { error: "merchantId, dataType, and exposed are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const current = db
    .select()
    .from(scopeSettings)
    .where(
      and(
        eq(scopeSettings.merchantId, merchantId),
        eq(
          scopeSettings.dataType,
          dataType as "orders" | "loyalty" | "offers" | "preferences",
        ),
      ),
    )
    .get();

  if (!current) {
    return NextResponse.json(
      { error: `Scope '${dataType}' not found for merchant '${merchantId}'` },
      { status: 404 },
    );
  }

  db.update(scopeSettings)
    .set({ exposed, updatedAt: new Date() })
    .where(eq(scopeSettings.id, current.id))
    .run();

  db.insert(policyChanges)
    .values({
      merchantId,
      dataType,
      fromState: current.exposed,
      toState: exposed,
    })
    .run();

  return NextResponse.json({ success: true, dataType, exposed });
}
