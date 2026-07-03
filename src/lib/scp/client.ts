import type {
  SCPConfiguration,
  SCPContextResponse,
  SCPScope,
  SCPTokenResponse,
} from "./types";

export class SCPClient {
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(private readonly baseUrl: string) {}

  async discover(): Promise<SCPConfiguration> {
    const origin = new URL(this.baseUrl).origin;
    const res = await fetch(`${origin}/.well-known/scp-configuration`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Discovery failed: HTTP ${res.status}`);
    return res.json() as Promise<SCPConfiguration>;
  }

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60_000) {
      return this.tokenCache.token;
    }
    const res = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: "scp-console",
        client_secret: "demo",
      }),
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

  async getContext(
    shopperId: string,
    scopes: SCPScope[],
  ): Promise<{ data: SCPContextResponse; latencyMs: number; status: number }> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}/context/${shopperId}`);
    if (scopes.length > 0) {
      url.searchParams.set("scopes", scopes.join(","));
    }

    const start = performance.now();
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    const latencyMs = Math.round(performance.now() - start);
    const data = (await res.json()) as SCPContextResponse;
    return { data, latencyMs, status: res.status };
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
