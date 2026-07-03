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

  it("caches the token and calls fetch only once on repeated getToken calls", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "scp_demo_cached_token",
          token_type: "Bearer",
          expires_in: 7200,
          scope: "orders loyalty offers preferences",
        }),
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    const token1 = await client.getToken();
    const token2 = await client.getToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(token1).toBe("scp_demo_cached_token");
    expect(token2).toBe("scp_demo_cached_token");
  });

  it("throws when token endpoint returns a non-200 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    await expect(client.getToken()).rejects.toThrow("Token request failed: HTTP 503");
  });

  it("merges results from parallel RPC calls for multiple scopes", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "scp_demo_test",
            token_type: "Bearer",
            expires_in: 3600,
            scope: "orders loyalty offers preferences",
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            jsonrpc: "2.0",
            id: 1,
            result: { orders: [{ id: "ord_1", status: "delivered" }] },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            jsonrpc: "2.0",
            id: 2,
            result: { loyalty: { tier: "gold", points: 500 } },
          }),
      } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    const result = await client.getContext("shopper_001", ["orders", "loyalty"]);

    expect(result.data.orders).toBeDefined();
    expect(result.data.loyalty).toBeDefined();
    expect(result.status).toBe(200);
  });

  it("returns the worst status and omits failed scopes when an RPC call returns non-2xx", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "scp_demo_test",
            token_type: "Bearer",
            expires_in: 3600,
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            jsonrpc: "2.0",
            id: 1,
            result: { orders: [{ id: "ord_1" }] },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    const result = await client.getContext("shopper_001", ["orders", "offers"]);

    expect(result.status).toBe(403);
    expect(result.data.orders).toBeDefined();
    expect(result.data.offers).toBeUndefined();
  });
});
