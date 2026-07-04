import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const merchantId = request.nextUrl.searchParams.get("merchantId");
  if (!merchantId) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
