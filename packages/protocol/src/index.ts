/**
 * @scp/protocol — canonical Shopper Context Protocol v1.0 definitions.
 *
 * The single source of truth for scope names, JSON-RPC method mapping, error
 * codes, and wire shapes. Consumed by both the SCP client and the reference
 * server so neither drifts from the spec. Zero runtime dependencies.
 *
 * See docs/scp-spec-reference.md.
 */

// Canonical scope names per SCP RFC v1.0 (github.com/shopper-context-protocol/rfc)
export const SCP_SCOPES = ["orders", "loyalty", "offers", "preferences"] as const;

export type SCPScope = (typeof SCP_SCOPES)[number];

/** Scope → JSON-RPC method dispatched at POST /v1/rpc. */
export const SCOPE_TO_METHOD: Record<SCPScope, string> = {
  orders: "scp.get_orders",
  loyalty: "scp.get_loyalty",
  offers: "scp.get_offers",
  preferences: "scp.get_preferences",
};

/**
 * The intent channel is bidirectional and deliberately NOT a member of
 * SCP_SCOPES. The four scopes above are outbound pulls — what an assistant
 * reads FROM the brand. Intent flows the other way: an assistant writes durable
 * shopper intent back TO the brand (`put_intent`), and the brand's storefront
 * reads it (`get_intent`) so the shopper doesn't have to reiterate themselves.
 */
export const SCP_INTENT_METHODS = {
  put: "scp.put_intent",
  get: "scp.get_intent",
} as const;

/** JSON-RPC 2.0 error codes defined by the SCP spec. */
export const SCP_ERROR = {
  PARSE: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  UNAUTHORIZED: -32000,
  FORBIDDEN: -32001,
  NOT_FOUND: -32002,
  RATE_LIMITED: -32003,
  SHOPPER_NOT_FOUND: -32004,
} as const;

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

/** Backward-compatible alias for earlier callers. */
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

// --- Intent channel (bidirectional) ---------------------------------------

/** A single concrete constraint on the shopper's intent, e.g. size / color. */
export interface SCPIntentAttribute {
  name: string;
  value: string;
}

/**
 * Shopper intent as captured by an assistant, before the brand stores it.
 * This is the payload written via `scp.put_intent`. `occasion` and `timeframe`
 * are nullable because they are inferred and may be absent.
 */
export interface SCPIntentInput {
  category: string;
  occasion: string | null;
  timeframe: string | null;
  attributes: SCPIntentAttribute[];
  summary: string;
  /** Where the intent originated, e.g. "chat". Defaults to "chat" server-side. */
  source?: string;
}

/**
 * Durable, transferable shopper intent as stored and returned by the brand.
 * The server assigns `intent_id`, `created_at`, and `expires_at`.
 */
export interface SCPIntent extends SCPIntentInput {
  intent_id: string;
  shopper_id: string;
  source: string;
  created_at: string;
  expires_at: string;
}

/**
 * A catalog product returned when the storefront merchandises against intent.
 * Shared shape so the client, console, and reference server never drift.
 */
export interface SCPProduct {
  id: string;
  name: string;
  category: string;
  useCases: string[];
  gender: "men" | "women" | "unisex";
  colors: string[];
  material?: string;
  sizes: string[];
  price: number;
  blurb: string;
}
