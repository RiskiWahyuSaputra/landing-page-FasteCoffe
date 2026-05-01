import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminArea = pathname.startsWith("/admin") && !isAdminLogin;

  if (isAdminArea && !adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminLogin && adminToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
