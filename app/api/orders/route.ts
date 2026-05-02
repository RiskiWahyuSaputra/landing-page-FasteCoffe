import { NextResponse } from "next/server";

import {
  createOrder,
  getOrderById,
  LaravelApiError,
} from "@/lib/laravel-admin-api";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData().catch(() => null)
    : await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Payload checkout tidak valid." },
      { status: 400 },
    );
  }

  try {
    const response = await createOrder(
      body as {
        customer_name: string;
        customer_phone: string;
        pickup_note?: string;
        payment_method: string;
        payment_proof?: File;
        service_fee: number;
        items: Array<{
          description: string;
          image_url?: string | null;
          name: string;
          numeric_price: number;
          quantity: number;
        }>;
      },
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Gagal menyimpan order checkout." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID pesanan diperlukan." },
      { status: 400 },
    );
  }

  try {
    const order = await getOrderById(id);
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Gagal mengambil data pesanan." },
      { status: 500 },
    );
  }
}
