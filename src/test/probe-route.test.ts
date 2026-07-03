import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockDiscover } = vi.hoisted(() => ({
  mockDiscover: vi.fn(),
}));

vi.mock("@/lib/scp/client", () => ({
  SCPClient: vi.fn().mockImplementation(() => ({
    discover: mockDiscover,
  })),
}));

import { GET } from "@/app/api/scp/probe/route";

describe("GET /api/scp/probe", () => {
  beforeEach(() => {
    mockDiscover.mockReset();
  });

  it("returns 400 when url query param is missing", async () => {
    const req = new NextRequest("http://localhost/api/scp/probe");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("url query param is required");
  });

  it("returns 400 for a malformed url", async () => {
    const req = new NextRequest("http://localhost/api/scp/probe?url=not-a-url");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Invalid URL");
  });

  it("returns 200 with healthy:true when discover resolves", async () => {
    const mockConfig = { version: "1.0", protocol_version: "scp1" };
    mockDiscover.mockResolvedValueOnce(mockConfig);
    const req = new NextRequest(
      "http://localhost/api/scp/probe?url=http%3A%2F%2Flocalhost%3A8787%2Fv1",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { healthy: boolean; config: unknown };
    expect(body.healthy).toBe(true);
    expect(body.config).toEqual(mockConfig);
  });

  it("returns 200 with healthy:false when discover throws (never 5xx)", async () => {
    mockDiscover.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const req = new NextRequest(
      "http://localhost/api/scp/probe?url=http%3A%2F%2Flocalhost%3A8787%2Fv1",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { healthy: boolean; error: string };
    expect(body.healthy).toBe(false);
    expect(body.error).toContain("ECONNREFUSED");
  });
});
