import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import {
  deleteAdminMenuItem,
  LaravelApiError
} from "@/lib/laravel-admin-api";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "ID menu tidak valid." }, { status: 400 });
  }

  try {
    const response = await deleteAdminMenuItem(token, id);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "Gagal menghapus menu." },
      { status: 500 }
    );
  }
}
