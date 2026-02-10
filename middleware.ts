import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple password-based authentication middleware
 * Protects all /dashboard/* routes
 * Set DASHBOARD_PASSWORD in environment variables
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes and API routes
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow cron routes with secret
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("dashboard_auth");
  const password = process.env.DASHBOARD_PASSWORD;

  // If no password is set, allow all access
  if (!password) {
    return NextResponse.next();
  }

  // Allow the login API route
  if (pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // If authenticated, allow access
  if (authCookie?.value === password) {
    return NextResponse.next();
  }

  // Redirect to login page
  if (pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes, return 401
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
