// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ratelimit } from "./src/lib/rate-limit";

export async function middleware(req: NextRequest) {
  // Only apply to API routes
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Use IP (or fallback to a header) as the rate‑limit key
  const ip = req.ip
    || req.headers.get("x-forwarded-for")?.split(",")[0]
    || "unknown";

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: "Too Many Requests" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.next();
}

// only run on /api/* 
export const config = {
  matcher: "/api/:path*",
};
