import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { merchants, scopeSettings } from "./schema";
import type { Merchant } from "./schema";

// Canonical SCP v1.0 scope names — see docs/scp-spec-reference.md
const ALL_SCOPES = ["orders", "loyalty", "offers", "preferences"] as const;

function getScpEndpoint(): string {
  return process.env.SCP_TEST_ENDPOINT ?? "http://localhost:8787/v1";
}

/** Idempotent — returns existing reference merchant if already seeded. */
export function seedReferenceMerchant(): Merchant {
  const db = getDb();

  const existing = db
    .select()
    .from(merchants)
    .where(eq(merchants.isReference, true))
    .get();

  if (existing) return existing;

  const merchant = db
    .insert(merchants)
    .values({
      name: "Acme Outdoor Co.",
      scpEndpointUrl: getScpEndpoint(),
      isReference: true,
    })
    .returning()
    .get();

  for (const scope of ALL_SCOPES) {
    db.insert(scopeSettings)
      .values({
        merchantId: merchant.id,
        dataType: scope,
        // offers blocked by default — personalised promotions are lower-sensitivity
        // but we block them here to demonstrate the governance toggle out of the box
        exposed: scope !== "offers",
      })
      .run();
  }

  return merchant;
}

export function getReferenceMerchant(): Merchant | null {
  return (
    getDb()
      .select()
      .from(merchants)
      .where(eq(merchants.isReference, true))
      .get() ?? null
  );
}

// Allow running directly: tsx src/lib/db/seed.ts
if (require.main === module) {
  const merchant = seedReferenceMerchant();
  console.warn("Seeded reference merchant:", merchant.id, merchant.name);
}
