import { NextRequest, NextResponse } from "next/server";

import { ADMIN_AUTH_COOKIE, getAdminCookieOptions } from "@/lib/admin-auth";
import { logoutAdmin } from "@/lib/laravel-admin-api";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;

  if (token) {
    try {
      await logoutAdmin(token);
    } catch {
      // The frontend cookie is still cleared even when the backend token
      // has already expired or the Laravel server is offline.
    }
  }

  const response = NextResponse.json({
    message: "Session admin ditutup."
  });

  response.cookies.set(ADMIN_AUTH_COOKIE, "", {
    ...getAdminCookieOptions(),
    maxAge: 0
  });

  return response;
}
