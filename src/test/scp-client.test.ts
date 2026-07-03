import { describe, it, expect, vi, beforeEach } from "vitest";
import { SCPClient } from "@/lib/scp/client";

describe("SCPClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("constructs with the given base URL", () => {
    const client = new SCPClient("http://localhost:8787/v1");
    expect(client).toBeDefined();
  });

  it("fetches capabilities from /v1/capabilities", async () => {
    const mockCapabilities = {
      version: "1.0",
      protocol_version: "scp1",
      scopes_supported: ["orders", "loyalty", "offers", "preferences"],
      authorization_endpoint: "http://localhost:8787/v1/authorize/init",
      token_endpoint: "http://localhost:8787/v1/token",
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      magic_link_supported: false,
      webhook_support: false,
    };

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCapabilities),
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    const result = await client.discover();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8787/v1/capabilities",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.protocol_version).toBe("scp1");
    expect(result.scopes_supported).toHaveLength(4);
    expect(result.scopes_supported).toContain("orders");
    expect(result.scopes_supported).toContain("offers");
  });

  it("throws when discovery returns non-200", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    await expect(client.discover()).rejects.toThrow("Discovery failed: HTTP 404");
  });

  it("fetches a token from /v1/token", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "scp_demo_test_token",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "orders loyalty offers preferences",
        }),
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    const token = await client.getToken();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8787/v1/token",
      expect.objectContaining({ method: "POST" }),
    );
    expect(token).toBe("scp_demo_test_token");
  });

  it("returns empty data for empty scopes without making RPC calls", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    const client = new SCPClient("http://localhost:8787/v1");
    const result = await client.getContext("shopper_001", []);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.data).toEqual({});
    expect(result.status).toBe(200);
  });

  it("healthCheck returns false on network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const client = new SCPClient("http://localhost:8787/v1");
    const healthy = await client.healthCheck();
    expect(healthy).toBe(false);
  });
});
