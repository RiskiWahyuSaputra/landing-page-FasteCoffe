import { NextResponse } from "next/server";

import { ADMIN_AUTH_COOKIE, getAdminCookieOptions } from "@/lib/admin-auth";
import { LaravelApiError, loginAdmin } from "@/lib/laravel-admin-api";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;

  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email ||
    !body.password
  ) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const response = await loginAdmin(body.email, body.password);
    const nextResponse = NextResponse.json({
      message: response.message,
      user: response.user
    });

    nextResponse.cookies.set(
      ADMIN_AUTH_COOKIE,
      response.token,
      getAdminCookieOptions()
    );

    return nextResponse;
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "Gagal terhubung ke backend Laravel." },
      { status: 500 }
    );
  }
}
