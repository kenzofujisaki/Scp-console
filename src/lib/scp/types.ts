/**
 * App-facing SCP barrel. Re-exports the canonical protocol from @scp/protocol
 * and adds two concerns that belong to this app rather than the wire spec:
 * scope presentation metadata (SCOPE_META) and the proxy-route result shape
 * (SCPProxyResult).
 */
export * from "@scp/protocol";

import type { SCPScope } from "@scp/protocol";

/** UI presentation metadata for each scope — labels, copy, and risk tier. */
export const SCOPE_META: Record<
  SCPScope,
  { label: string; description: string; risk: "low" | "medium" | "high" }
> = {
  orders: {
    label: "Orders",
    description: "Order history: products, dates, amounts, tracking, and statuses",
    risk: "medium",
  },
  loyalty: {
    label: "Loyalty",
    description: "Tier (bronze / silver / gold), points balance, and benefits",
    risk: "low",
  },
  offers: {
    label: "Offers",
    description: "Personalized promotions: discount codes, validity, and conditions",
    risk: "low",
  },
  preferences: {
    label: "Preferences",
    description: "Sizes, favourite brands, activity preferences, and communication opt-ins",
    risk: "low",
  },
};

/** Shape returned by the /api/scp/context proxy route. App-specific, not wire spec. */
export interface SCPProxyResult {
  data: import("@scp/protocol").SCPShopper | null;
  status: number;
  latencyMs: number;
  filteredScopes: SCPScope[];
  requestedScopes: SCPScope[];
  scopesDenied: SCPScope[];
  error?: string;
}
