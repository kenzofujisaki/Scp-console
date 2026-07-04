/**
 * @scp/client — a minimal, dependency-free Shopper Context Protocol client.
 *
 * Instantiate per request (the access token is cached inside the instance).
 * Talks to any spec-compliant SCP server; the bundled reference server is one.
 */
import {
  SCOPE_TO_METHOD,
  type SCPCapabilities,
  type SCPScope,
  type SCPShopper,
  type SCPTokenResponse,
  type SCPRPCResponse,
} from "@scp/protocol";

export class SCPClient {
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(private readonly baseUrl: string) {}

  async discover(): Promise<SCPCapabilities> {
    const res = await fetch(`${this.baseUrl}/capabilities`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Discovery failed: HTTP ${res.status}`);
    return res.json() as Promise<SCPCapabilities>;
  }

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60_000) {
      return this.tokenCache.token;
    }
    const res = await fetch(`${this.baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "scp-console",
        code: "demo",
      }).toString(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Token request failed: HTTP ${res.status}`);
    const data = (await res.json()) as SCPTokenResponse;
    this.tokenCache = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };
    return data.access_token;
  }

  /** Calls POST /v1/rpc in parallel for each scope and merges the results. */
  async getContext(
    shopperId: string,
    scopes: SCPScope[],
  ): Promise<{ data: SCPShopper; latencyMs: number; status: number }> {
    if (scopes.length === 0) {
      return { data: {}, latencyMs: 0, status: 200 };
    }

    const token = await this.getToken();
    const start = performance.now();

    const calls = scopes.map(async (scope, index) => {
      const body = {
        jsonrpc: "2.0",
        id: index + 1,
        method: SCOPE_TO_METHOD[scope],
        params: { shopper_id: shopperId },
      };
      const res = await fetch(`${this.baseUrl}/rpc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        return { scope, result: null, status: res.status };
      }
      const rpc = (await res.json()) as SCPRPCResponse;
      return { scope, result: rpc.result ?? null, status: res.status };
    });

    const results = await Promise.all(calls);
    const latencyMs = Math.round(performance.now() - start);

    const worstStatus = results.reduce((max, r) => Math.max(max, r.status), 200);

    const data: SCPShopper = {};
    for (const { scope, result } of results) {
      if (!result) continue;
      if (scope === "orders" && Array.isArray(result.orders)) {
        data.orders = result.orders as SCPShopper["orders"];
      } else if (scope === "loyalty" && result.loyalty) {
        data.loyalty = result.loyalty as SCPShopper["loyalty"];
      } else if (scope === "offers" && Array.isArray(result.offers)) {
        data.offers = result.offers as SCPShopper["offers"];
      } else if (scope === "preferences" && result.preferences) {
        data.preferences = result.preferences as SCPShopper["preferences"];
      }
    }

    return { data, latencyMs, status: worstStatus };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.discover();
      return true;
    } catch {
      return false;
    }
  }
}
