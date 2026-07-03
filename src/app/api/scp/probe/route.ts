export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { SCPClient } from "@/lib/scp/client";

/**
 * GET /api/scp/probe?url=https://scp.example.com/v1
 *
 * Server-side connectivity check for the "Connect your server" onboarding flow.
 * The browser can't always reach an arbitrary endpoint due to CORS, so we proxy
 * the discovery call server-side and return structured health info.
 */
export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url query param is required" }, { status: 400 });
  }

  try {
    new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const client = new SCPClient(rawUrl);
  try {
    const config = await client.discover();
    return NextResponse.json({ healthy: true, config });
  } catch (err) {
    return NextResponse.json({ healthy: false, error: String(err) });
  }
}
