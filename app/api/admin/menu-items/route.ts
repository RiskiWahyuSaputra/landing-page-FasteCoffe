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

  const body = await request.json().catch(() => null);

  try {
    const response = await createAdminMenuItem(
      token,
      body as {
        accent: string;
        description: string;
        is_active?: boolean;
        name: string;
        price: number;
      }
    );

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
