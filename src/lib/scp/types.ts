export const SCP_SCOPES = [
  "order_history",
  "loyalty",
  "preferences",
  "payment_methods",
] as const;

export type SCPScope = (typeof SCP_SCOPES)[number];

export const SCOPE_META: Record<
  SCPScope,
  { label: string; description: string; risk: "low" | "medium" | "high" }
> = {
  order_history: {
    label: "Order History",
    description: "Past purchases: products, dates, amounts, and statuses",
    risk: "medium",
  },
  loyalty: {
    label: "Loyalty Status",
    description: "Tier (bronze / silver / gold) and points balance",
    risk: "low",
  },
  preferences: {
    label: "Preferences",
    description: "Activity preferences, sizing, and communication opt-ins",
    risk: "low",
  },
  payment_methods: {
    label: "Payment Methods",
    description: "Saved cards: last 4 digits and card brand only",
    risk: "high",
  },
};

export interface SCPConfiguration {
  protocol_version: string;
  merchant_name: string;
  token_endpoint: string;
  context_endpoint: string;
  supported_scopes: SCPScope[];
}

export interface SCPTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

export interface SCPContextResponse {
  shopper_id: string;
  display_name: string;
  scopes_returned: SCPScope[];
  context: {
    order_history?: unknown[];
    loyalty?: unknown;
    preferences?: unknown;
    payment_methods?: unknown[];
  };
}

export interface SCPProxyResult {
  data: SCPContextResponse | null;
  status: number;
  latencyMs: number;
  filteredScopes: SCPScope[];
  requestedScopes: SCPScope[];
  scopesDenied: SCPScope[];
  error?: string;
}
