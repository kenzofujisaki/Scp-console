import { and, eq } from "drizzle-orm";
import { getDb } from "./index";
import { merchants, scopeSettings } from "./schema";
import type { Merchant } from "./schema";

// Every governed data type: the four SCP pull scopes plus the bidirectional
// `intent` channel. All are governed through the same scope_settings table.
const GOVERNED_DATA_TYPES = [
  "orders",
  "loyalty",
  "offers",
  "preferences",
  "intent",
] as const;

/** Default exposure per data type. `offers` ships blocked to demonstrate the
 * governance toggle out of the box; `intent` ships exposed so the handoff demo
 * works on first run (turning it off is what makes the storefront go cold). */
function defaultExposed(dataType: (typeof GOVERNED_DATA_TYPES)[number]): boolean {
  return dataType !== "offers";
}

function getScpEndpoint(): string {
  return process.env.SCP_TEST_ENDPOINT ?? "http://localhost:8787/v1";
}

/**
 * Ensure a scope_settings row exists for every governed data type. Idempotent —
 * backfills rows added after a merchant was first seeded (e.g. `intent`), so an
 * already-seeded database picks up the new channel without a reset.
 */
function ensureScopeRows(merchantId: string): void {
  const db = getDb();
  for (const dataType of GOVERNED_DATA_TYPES) {
    const existing = db
      .select()
      .from(scopeSettings)
      .where(and(eq(scopeSettings.merchantId, merchantId), eq(scopeSettings.dataType, dataType)))
      .get();
    if (existing) continue;
    db.insert(scopeSettings)
      .values({ merchantId, dataType, exposed: defaultExposed(dataType) })
      .run();
  }
}

/** Idempotent — returns existing reference merchant if already seeded. */
export function seedReferenceMerchant(): Merchant {
  const db = getDb();

  const existing = db
    .select()
    .from(merchants)
    .where(eq(merchants.isReference, true))
    .get();

  if (existing) {
    // Backfill any governed data type added since this merchant was seeded.
    ensureScopeRows(existing.id);
    return existing;
  }

  const merchant = db
    .insert(merchants)
    .values({
      name: "Acme Outdoor Co.",
      scpEndpointUrl: getScpEndpoint(),
      isReference: true,
    })
    .returning()
    .get();

  ensureScopeRows(merchant.id);

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
