import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import {
  createAdminMenuItem,
  getAdminMenuItems,
  LaravelApiError
} from "@/lib/laravel-admin-api";

function getToken() {
  return cookies().get(ADMIN_AUTH_COOKIE)?.value;
}

export async function GET() {
  const token = getToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const items = await getAdminMenuItems(token);
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "Gagal mengambil daftar menu admin." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = getToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { message: "Form menu tidak valid." },
      { status: 400 }
    );
  }

  try {
    const response = await createAdminMenuItem(token, formData);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "Gagal menambahkan menu." },
      { status: 500 }
    );
  }
}
