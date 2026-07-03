// Canonical scope names per SCP RFC v1.0 (github.com/shopper-context-protocol/rfc)
export const SCP_SCOPES = ["orders", "loyalty", "offers", "preferences"] as const;

export type SCPScope = (typeof SCP_SCOPES)[number];

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

// Mapping from scope name to JSON-RPC method (POST /v1/rpc)
export const SCOPE_TO_METHOD: Record<SCPScope, string> = {
  orders: "scp.get_orders",
  loyalty: "scp.get_loyalty",
  offers: "scp.get_offers",
  preferences: "scp.get_preferences",
};

// `/v1/capabilities` response shape
export interface SCPCapabilities {
  version: string;
  protocol_version: string;
  scopes_supported: SCPScope[];
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint?: string;
  grant_types_supported: string[];
  code_challenge_methods_supported: string[];
  magic_link_supported: boolean;
  webhook_support: boolean;
  rate_limit?: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}

// Keep SCPConfiguration as alias for backward compat with existing callers
export type SCPConfiguration = SCPCapabilities;

export interface SCPTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  customer_id?: string;
}

// JSON-RPC 2.0 response envelope
export interface SCPRPCResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: Record<string, unknown>;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Merged shopper context returned by SCPClient.getContext()
export interface SCPShopper {
  orders?: SCPOrder[];
  loyalty?: SCPLoyalty;
  offers?: SCPOffer[];
  preferences?: SCPPreferences;
}

export interface SCPOrder {
  order_id: string;
  product: string;
  date: string;
  price: number;
  status: "delivered" | "processing" | "shipped";
  tracking?: string;
}

export interface SCPLoyalty {
  program_name: string;
  member_id: string;
  tier: "bronze" | "silver" | "gold";
  points: {
    current: number;
    lifetime: number;
    expiring?: number;
    expiring_date?: string;
  };
  member_since: string;
  benefits?: string[];
}

export interface SCPOffer {
  type: "percentage" | "fixed" | "free_shipping" | "bogo";
  title: string;
  code: string;
  discount_value: number;
  discount_type: "percentage" | "fixed_amount";
  valid_until: string;
  min_purchase?: number;
  applies_to?: string;
}

export interface SCPPreferences {
  sizes?: {
    shirt?: string;
    pants?: string;
    shoe?: string;
  };
  favorite_brands?: string[];
  preferred_activities?: string[];
  communication?: {
    email: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface SCPProxyResult {
  data: SCPShopper | null;
  status: number;
  latencyMs: number;
  filteredScopes: SCPScope[];
  requestedScopes: SCPScope[];
  scopesDenied: SCPScope[];
  error?: string;
}
