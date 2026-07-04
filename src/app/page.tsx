import { redirect } from "next/navigation";
import { getReferenceMerchant } from "@/lib/db/seed";

// Reads the DB to route first-run vs returning users — resolved per request.
export const dynamic = "force-dynamic";

/**
 * Root route: detect whether the reference merchant has been seeded.
 * If seeded, go straight to the dashboard — zero extra click for returning users.
 * If not, route through onboarding so first-timers understand what they're setting up.
 */
export default function RootPage() {
  const merchant = getReferenceMerchant();
  if (merchant) {
    redirect(`/dashboard?merchantId=${merchant.id}`);
  }
  redirect("/onboarding");
}
