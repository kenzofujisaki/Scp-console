import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockGet, mockAll, mockRun, mockGetContext } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockAll: vi.fn(),
  mockRun: vi.fn(),
  mockGetContext: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ get: mockGet, all: mockAll })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ run: mockRun })),
    })),
  })),
}));

vi.mock("@/lib/scp/client", () => ({
  SCPClient: vi.fn().mockImplementation(() => ({
    getContext: mockGetContext,
  })),
}));

import { GET } from "@/app/api/scp/context/route";

const fakeMerchant = {
  id: "merch_1",
  name: "Test Merchant",
  scpEndpointUrl: "http://localhost:8787/v1",
  isReference: false,
  createdAt: new Date(),
};

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/scp/context");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

describe("GET /api/scp/context", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockAll.mockReset();
    mockRun.mockReset();
    mockGetContext.mockReset();
    mockRun.mockReturnValue(undefined);
  });

  it("returns 400 when merchantId is missing", async () => {
    const req = makeRequest({ shopperId: "shopper_001" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when shopperId is missing", async () => {
    const req = makeRequest({ merchantId: "merch_1" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when merchant does not exist", async () => {
    mockGet.mockReturnValueOnce(undefined);
    const req = makeRequest({ merchantId: "merch_1", shopperId: "shopper_001" });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("filters allowed scopes and reports denied scopes", async () => {
    mockGet.mockReturnValueOnce(fakeMerchant);
    mockAll.mockReturnValueOnce([{ dataType: "orders" }, { dataType: "loyalty" }]);
    mockGetContext.mockResolvedValueOnce({ data: { orders: [] }, status: 200, latencyMs: 10 });

    const req = makeRequest({
      merchantId: "merch_1",
      shopperId: "shopper_001",
      scopes: "orders,loyalty,offers",
    });
    const res = await GET(req);
    const body = (await res.json()) as {
      filteredScopes: string[];
      scopesDenied: string[];
      status: number;
    };

    expect(body.filteredScopes).toEqual(["orders", "loyalty"]);
    expect(body.scopesDenied).toEqual(["offers"]);
    expect(body.status).toBe(200);
  });

  it("returns status 502 when SCPClient.getContext throws", async () => {
    mockGet.mockReturnValueOnce(fakeMerchant);
    mockAll.mockReturnValueOnce([{ dataType: "orders" }]);
    mockGetContext.mockRejectedValueOnce(new Error("connection refused"));

    const req = makeRequest({ merchantId: "merch_1", shopperId: "shopper_001", scopes: "orders" });
    const res = await GET(req);
    const body = (await res.json()) as { status: number; error: string };

    expect(body.status).toBe(502);
    expect(body.error).toContain("connection refused");
  });

  it("reflects 403 in response body when SCP server returns Forbidden", async () => {
    mockGet.mockReturnValueOnce(fakeMerchant);
    mockAll.mockReturnValueOnce([{ dataType: "orders" }]);
    mockGetContext.mockResolvedValueOnce({ data: {}, status: 403, latencyMs: 5 });

    const req = makeRequest({ merchantId: "merch_1", shopperId: "shopper_001", scopes: "orders" });
    const res = await GET(req);
    const body = (await res.json()) as { status: number };

    expect(body.status).toBe(403);
  });

  it("returns 200 and data when SCP server responds successfully", async () => {
    mockGet.mockReturnValueOnce(fakeMerchant);
    mockAll.mockReturnValueOnce([{ dataType: "orders" }]);
    mockGetContext.mockResolvedValueOnce({
      data: { orders: [{ id: "ord_1" }] },
      status: 200,
      latencyMs: 8,
    });

    const req = makeRequest({ merchantId: "merch_1", shopperId: "shopper_001", scopes: "orders" });
    const res = await GET(req);
    const body = (await res.json()) as { status: number; data: unknown };

    expect(body.status).toBe(200);
    expect(body.data).toBeDefined();
  });
});
