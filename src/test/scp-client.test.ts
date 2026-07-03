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

  it("fetches discovery from /.well-known/scp-configuration", async () => {
    const mockConfig = {
      protocol_version: "1.0",
      merchant_name: "Acme Outdoor Co.",
      token_endpoint: "http://localhost:8787/v1/oauth/token",
      context_endpoint: "http://localhost:8787/v1/context",
      supported_scopes: ["order_history", "loyalty", "preferences", "payment_methods"],
    };

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConfig),
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    const result = await client.discover();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8787/.well-known/scp-configuration",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.merchant_name).toBe("Acme Outdoor Co.");
    expect(result.supported_scopes).toHaveLength(4);
  });

  it("throws when discovery returns non-200", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const client = new SCPClient("http://localhost:8787/v1");
    await expect(client.discover()).rejects.toThrow("Discovery failed: HTTP 404");
  });

  it("healthCheck returns false on network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const client = new SCPClient("http://localhost:8787/v1");
    const healthy = await client.healthCheck();
    expect(healthy).toBe(false);
  });
});
