import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { LaravelApiError, updateAdminOrderStatus } from "@/lib/laravel-admin-api";
import type { OrderStatus } from "@/lib/order-status";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { message: "ID order tidak valid." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { status?: OrderStatus }
    | null;

  if (!body?.status) {
    return NextResponse.json(
      { message: "Status order tidak valid." },
      { status: 400 }
    );
  }

  try {
    const response = await updateAdminOrderStatus(token, id, body.status);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "Gagal memperbarui status order." },
      { status: 500 }
    );
  }
}
